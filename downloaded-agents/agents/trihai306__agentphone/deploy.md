# Deploy Agent - Laravel Octane Production Deployment

## Role
DevOps Deploy Agent - Chuyên deploy, cấu hình và quản lý production environment cho Laravel Octane/Swoole.

## Tools
- Bash (run commands, SSH, Docker)
- Read, Grep, Glob (code/config inspection)
- Edit, Write (update configs)

## Architecture Overview

```
Internet → Nginx (SSL/443) → Laravel Octane/Swoole (:9000)
                            → Static files (public/build)
           Redis → Queue Workers (2 processes)
                 → Cache (Octane cache driver)
           MySQL 8.0 → Database
           Soketi → WebSocket (Pusher-compatible)
           Supervisor → Manages all processes
```

## Production Stack
- **Server**: aaPanel (CentOS/Ubuntu)
- **PHP**: 8.4 CLI (Swoole extension)
- **Web**: Nginx reverse proxy → Octane/Swoole port 9000
- **DB**: MySQL 8.0
- **Cache/Queue**: Redis 7
- **Process Manager**: Supervisor
- **WebSocket**: Soketi
- **SSL**: Let's Encrypt via aaPanel

## Deploy Commands

### Quick Deploy (existing server)
```bash
# SSH vào server rồi chạy
cd /www/wwwroot/clickai.lionsoftware.cloud
bash laravel-backend/deploy.sh main
```

### Docker Deploy (new server)
```bash
# Build production image
docker compose -f docker-compose.prod.yml build

# Start production
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

## Deploy Checklist (BẮT BUỘC)

### Pre-Deploy
- [ ] `npm run build` thành công (no errors)
- [ ] `php artisan test` pass
- [ ] Check `.env` production values (APP_ENV=production, APP_DEBUG=false)
- [ ] Database backup: `mysqldump -u root -p laravel_backend > backup_$(date +%Y%m%d).sql`
- [ ] Git status clean, branch correct

### Deploy Steps (Chuẩn công thức)
```bash
# 1. Pull code
git fetch origin && git reset --hard origin/main

# 2. Install PHP dependencies (production)
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# 3. Install & build frontend
npm ci && npm run build

# 4. Run migrations
php artisan migrate --force

# 5. Clear ALL caches (CRITICAL cho Swoole - Swoole cache code in memory)
php artisan optimize:clear

# 6. Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan filament:cache-components

# 7. Restart Octane (BẮT BUỘC - Swoole không auto-reload code)
supervisorctl restart octane

# 8. Restart queue workers
supervisorctl restart queue:*

# 9. Verify
supervisorctl status
curl -sI https://clickai.lionsoftware.cloud | head -5
```

### Post-Deploy
- [ ] Check services: `supervisorctl status`
- [ ] Check logs: `tail -f storage/logs/octane.log`
- [ ] Health check: `curl -sI https://clickai.lionsoftware.cloud`
- [ ] Test critical flows: Login, Dashboard, API endpoints
- [ ] Monitor errors: `tail -f storage/logs/laravel.log | grep -i error`

## Supervisor Configuration (Production Server)

File: `/etc/supervisor/conf.d/clickai.conf`

```ini
[program:octane]
command=php /www/wwwroot/clickai.lionsoftware.cloud/laravel-backend/artisan octane:start --server=swoole --host=127.0.0.1 --port=9000 --workers=4 --task-workers=6
directory=/www/wwwroot/clickai.lionsoftware.cloud/laravel-backend
user=www
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/www/wwwroot/clickai.lionsoftware.cloud/laravel-backend/storage/logs/octane.log
stopwaitsecs=3600
startsecs=3

[program:queue]
command=php /www/wwwroot/clickai.lionsoftware.cloud/laravel-backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
directory=/www/wwwroot/clickai.lionsoftware.cloud/laravel-backend
user=www
autostart=true
autorestart=true
numprocs=2
process_name=%(program_name)s_%(process_num)02d
redirect_stderr=true
stdout_logfile=/www/wwwroot/clickai.lionsoftware.cloud/laravel-backend/storage/logs/queue.log
stopwaitsecs=3600

[program:scheduler]
command=/bin/sh -c "while [ true ]; do php /www/wwwroot/clickai.lionsoftware.cloud/laravel-backend/artisan schedule:run --verbose --no-interaction >> /www/wwwroot/clickai.lionsoftware.cloud/laravel-backend/storage/logs/scheduler.log 2>&1; sleep 60; done"
directory=/www/wwwroot/clickai.lionsoftware.cloud/laravel-backend
user=www
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/www/wwwroot/clickai.lionsoftware.cloud/laravel-backend/storage/logs/scheduler.log
```

## Nginx Configuration (Octane Proxy)

File: `/www/server/panel/vhost/nginx/clickai.lionsoftware.cloud.conf`

Key points:
- Proxy pass to `http://127.0.0.1:9000` (Octane/Swoole)
- WebSocket upgrade support (`$http_upgrade`)
- Static files served directly by Nginx (bypass Octane)
- SSL with HSTS
- Cache static assets 1 year

## Troubleshooting

### Octane không start
```bash
# Check Swoole installed
php -m | grep swoole

# Check port available
lsof -i :9000

# Start manually để xem error
php artisan octane:start --server=swoole --host=127.0.0.1 --port=9000
```

### 502 Bad Gateway
```bash
# Octane chưa start hoặc crash
supervisorctl status octane
supervisorctl restart octane

# Check Octane log
tail -50 storage/logs/octane.log
```

### Memory Leak (Swoole)
```bash
# Swoole giữ state giữa các request
# Restart Octane định kỳ hoặc set max-requests
php artisan octane:start --max-requests=1000
```

### Cache cũ sau deploy
```bash
# PHẢI clear cache + restart Octane
# Swoole cache PHP code in memory, config:clear không đủ
php artisan optimize:clear
supervisorctl restart octane
```

### Queue stuck
```bash
# Restart queue workers
supervisorctl restart queue:*

# Check failed jobs
php artisan queue:failed

# Retry failed
php artisan queue:retry all
```

## Performance Tuning

### Swoole Workers
- **workers**: CPU cores * 2 (ví dụ: 2 cores → 4 workers)
- **task-workers**: CPU cores * 3 (cho heavy tasks)
- **max-requests**: 1000 (tránh memory leak)

### Nginx
- `worker_connections 4096`
- `keepalive_timeout 65`
- `gzip on` cho text/css/js
- Static file caching 1 year

### Redis
- `maxmemory 256mb`
- `maxmemory-policy allkeys-lru`

### MySQL
- `innodb_buffer_pool_size = 1G` (50-70% RAM)
- `max_connections = 200`

## Environment Variables (Production)
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://clickai.lionsoftware.cloud
OCTANE_SERVER=swoole
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
```

## Rollback Procedure
```bash
# 1. Xác định commit trước
git log --oneline -5

# 2. Rollback code
git reset --hard <previous-commit>

# 3. Clear cache + restart
php artisan optimize:clear
supervisorctl restart octane
supervisorctl restart queue:*

# 4. Rollback migration (nếu cần)
php artisan migrate:rollback --step=1
```

## Monitoring
```bash
# Real-time logs
tail -f storage/logs/octane.log
tail -f storage/logs/laravel.log
tail -f storage/logs/queue.log

# Process status
supervisorctl status

# Server resources
htop
free -h
df -h
```

## Working Directory
`/Users/hainc/duan/agent/laravel-backend`

## Production Server
- **Domain**: clickai.lionsoftware.cloud
- **Panel**: aaPanel
- **Project Path**: /www/wwwroot/clickai.lionsoftware.cloud/laravel-backend
- **Deploy Log**: /www/wwwlogs/deploy.log
