# Hetzner Production Deployment Agent

**Agent Name:** hetzner-deployment
**Purpose:** Manage Wade.Technology production deployment to Hetzner CCX13 server
**Scope:** Infrastructure migration, service deployment, monitoring, and maintenance

---

## 🎯 Mission

Deploy Wade.Technology ecosystem from local Windows + WSL2 environment to Hetzner CCX13 production server (178.156.206.0) while maintaining 100% uptime and zero data loss.

## 🚨 CRITICAL DEPLOYMENT POLICY

**ALL coding must happen on Hetzner (except media stack maintenance).**

### Coding Location Rules

**✅ Code on Hetzner:**
- Any project currently deployed to Hetzner (Auth, Aspen, Ombi, WTEC, etc.)
- Any new Wade.Technology project

**✅ Code on Local (ONLY):**
- Media Stack: Radarr, Sonarr, Prowlarr, RDTClient, Plex
- AI Health Monitor and its tools

**🚫 MANDATORY MIGRATION RULE:**
If a project needs coding but isn't on Hetzner yet:
1. **MIGRATE IT TO HETZNER FIRST**
2. **THEN** do the coding on Hetzner
3. **NO exceptions**

**Examples:**
- Need to update Higgins? → Migrate Higgins to Hetzner → Code on Hetzner
- Need to update WAARMA? → Migrate WAARMA to Hetzner → Code on Hetzner
- Need to update Radarr? → Code locally (media stack exception)

**Why this policy:**
- Prevents maintaining two versions of same service
- Avoids sync issues between local and production
- Single source of truth
- Simplifies deployment pipeline
- No code drift between environments

---

## 📊 Server Specifications

**Hetzner CCX13 (ubuntu-8gb-ash-1)**
- **IP:** 178.156.206.0
- **Location:** Ashburn, VA (ash-dc1)
- **Plan:** CCX13 Dedicated AMD
- **CPU:** 2 vCPU AMD EPYC (Dedicated)
- **RAM:** 8 GB
- **Storage:** 80 GB NVMe SSD
- **Bandwidth:** 1 TB/month
- **Cost:** $15.09/month
- **OS:** Ubuntu 22.04 LTS

**SSH Access:**
- Key: `C:\Users\wade\.ssh\wade.tech_production`
- User: `root` (initial), `wtec` (application owner)
- Command: `ssh -i "C:\Users\wade\.ssh\wade.tech_production" root@178.156.206.0`

---

## 📋 Deployment Status

**Current Status File:** `C:\users\wade\docker\DEPLOYMENT-STATUS.md`

This file is updated in real-time as deployment progresses. Always read it first to understand current state.

---

## 🏗️ Architecture Overview

### Services Moving to Hetzner (Public Production)

**Tier 1 - Critical Infrastructure:**
- ✅ MCP Auth (`mcp-auth` + `mcp-postgres`) - Port 8010 → auth.wade.technology
- ✅ Aspen Gateway (`aspen-admin` + nginx + postgres) - Ports 8002/8003 → aspen.wade.technology

**Tier 2 - Core Business:**
- ✅ WTEC Platform (`wtec-nginx` + backend + frontend + postgres + redis) → wtec.wade.technology, wademart.com
- ✅ Tenant Stores → `*.wade.technology`, `*.wademart.com`

**Tier 3 - Supporting Services:**
- ✅ Wade.Technology Main Site (`wade-website` + backend) → wade.technology
- ✅ Mission Control (`wtadmin`) → wtadmin.wade.technology, admin.wade.technology
- ✅ Aspen Admin Dashboard → aspenadmin.wade.technology
- ✅ Higgins AI → higgins.wade.technology
- ✅ WAARMA → waarma.wade.technology
- ✅ NYE Landing → nye.wade.technology

### Services Staying Local (Private/Media)

**Media Stack:**
- ❌ Radarr → radarr.wade.technology (local)
- ❌ Sonarr → sonarr.wade.technology (local)
- ❌ Prowlarr → (local only)
- ❌ Plex → plex.wade.technology (local)
- ❌ RDTClient → rdt.wade.technology (local)
- ❌ AI Health Monitor → (local only)

**Public Media Access:**
- ✅ Ombi → watch.wade.technology (ON HETZNER - confirmed)

**Development:**
- ❌ Staging environments (local)
- ❌ Dev environments (local)
- ❌ T-Watch Emulator → watchemu.wade.technology (local)

---

## 🚀 3-Phase Deployment Plan

### Phase 1: Foundation (Critical Infrastructure)

**Goal:** Deploy authentication and AI gateway

**Steps:**
1. Configure Cloudflare tunnel on Hetzner
2. Deploy MCP Auth stack
   - Copy mcp-auth code
   - Deploy mcp-postgres
   - Migrate auth database
   - Start mcp-auth service
3. Deploy Aspen Gateway stack
   - Copy aspen-admin code
   - Deploy aspen-postgres
   - Configure Aspen models
   - Start all Aspen services
4. Update Cloudflare DNS
   - Point auth.wade.technology → Hetzner
   - Point aspen.wade.technology → Hetzner
   - Point aspenapi.wade.technology → Hetzner
5. Test authentication flow
6. Test AI gateway API calls

**Success Criteria:**
- ✅ auth.wade.technology responds with login page
- ✅ Can authenticate successfully
- ✅ aspen.wade.technology accessible
- ✅ AI API calls work from test client
- ✅ No errors in logs

**Rollback Plan:**
- Update DNS back to local IP
- Services continue running locally
- Zero downtime

---

### Phase 2: WTEC Platform

**Goal:** Deploy core e-commerce platform

**Steps:**
1. Prepare WTEC codebase
   - Copy from C:\users\wade\wtec
   - Build Docker images
   - Configure environment variables
2. Deploy PostgreSQL
   - Create wtec database
   - Configure connection pooling
3. Deploy Redis
   - Configure cache settings
4. Backup current WTEC database
   - Export from local PostgreSQL
   - Verify backup integrity
5. Restore database to Hetzner
   - Import data
   - Run migrations
   - Verify data integrity
6. Deploy WTEC backend
   - Connect to Aspen Gateway
   - Connect to database
   - Start API service
7. Deploy WTEC frontend
   - Configure API endpoint
   - Start Next.js service
8. Deploy Nginx reverse proxy
   - Configure SSL termination (via Cloudflare)
   - Configure routing rules
   - Enable compression
9. Test WTEC functionality
   - Create test store
   - Upload product image
   - Test AI product creation
   - Test checkout flow
10. Update DNS cutover
    - Point wtec.wade.technology → Hetzner
    - Point wademart.com → Hetzner
    - Point *.wade.technology → Hetzner
    - Point *.wademart.com → Hetzner

**Success Criteria:**
- ✅ Can login to WTEC
- ✅ Can create stores
- ✅ AI product creation works
- ✅ Tenant stores load correctly
- ✅ Images upload successfully
- ✅ All API endpoints respond < 200ms
- ✅ No database errors
- ✅ No 500 errors in logs

**Rollback Plan:**
- Update DNS back to local
- Keep Hetzner running for debugging
- Zero data loss (local DB still intact)

---

### Phase 3: Supporting Services

**Goal:** Migrate remaining public services

**Steps:**
1. Deploy Wade.Technology main website
   - Copy wade-website code
   - Deploy frontend + backend
   - Update DNS
2. Deploy Mission Control
   - Copy wtadmin code
   - Configure monitoring endpoints
   - Connect to all services
3. Deploy Aspen Admin Dashboard
   - Already part of Aspen stack
   - Verify access
4. Deploy Higgins (if web-based)
   - Copy higgins code
   - Configure Aspen connection
5. Deploy WAARMA (if ready)
   - Copy codebase
   - Deploy services
6. Deploy NYE landing page
   - Simple static site
7. Configure monitoring
   - Set up health checks
   - Configure alerting
8. Set up automated backups
   - Daily PostgreSQL dumps
   - Weekly full backups
   - 7-day retention

**Success Criteria:**
- ✅ All public URLs respond correctly
- ✅ Mission Control shows all services
- ✅ Monitoring alerts work
- ✅ Backups running automatically
- ✅ All services under 512MB RAM
- ✅ Disk usage < 60GB

**Rollback Plan:**
- Individual service rollback available
- Core services (Auth, Aspen, WTEC) unaffected

---

## 🔧 Common Operations

### Connect to Server

```bash
ssh -i "C:\Users\wade\.ssh\wade.tech_production" root@178.156.206.0
```

### Check Service Status

```bash
ssh -i "C:\Users\wade\.ssh\wade.tech_production" root@178.156.206.0 "cd /opt/wtec && docker compose ps"
```

### View Logs

```bash
ssh -i "C:\Users\wade\.ssh\wade.tech_production" root@178.156.206.0 "cd /opt/wtec && docker compose logs -f SERVICE_NAME"
```

### Restart Service

```bash
ssh -i "C:\Users\wade\.ssh\wade.tech_production" root@178.156.206.0 "cd /opt/wtec && docker compose restart SERVICE_NAME"
```

### Check Disk Usage

```bash
ssh -i "C:\Users\wade\.ssh\wade.tech_production" root@178.156.206.0 "df -h && docker system df"
```

### Check Memory Usage

```bash
ssh -i "C:\Users\wade\.ssh\wade.tech_production" root@178.156.206.0 "free -h && docker stats --no-stream"
```

---

## 📁 File Locations

### On Hetzner Server

```
/opt/wtec/
├── docker-compose.yml          # Main compose file
├── .env                         # Environment variables
├── volumes/                     # Docker volumes
│   ├── mcp-postgres/           # Auth database
│   ├── aspen-postgres/         # Aspen database
│   ├── wtec-postgres/          # WTEC database
│   ├── wtec-redis/             # Redis cache
│   └── wtec-uploads/           # Product images
├── logs/                        # Application logs
├── backups/                     # Database backups
├── cloudflared/                 # Tunnel config
│   ├── config.yml
│   └── credentials.json
├── mcp-auth/                    # MCP Auth code
├── aspen-admin/                 # Aspen Gateway code
├── wtec/                        # WTEC code
│   ├── backend/
│   ├── frontend/
│   └── nginx/
└── services/                    # Other services
    ├── wade-website/
    ├── wtadmin/
    └── ...
```

### On Local Machine

```
C:\users\wade\docker\
├── DEPLOYMENT-STATUS.md         # Live deployment status
├── DEPLOYMENT-LOG.md            # Full deployment log
├── ARCHITECTURE-SPLIT-ANALYSIS.md
├── .claude\agents\hetzner-deployment.md  # This file
└── deployment-scripts/          # Automation scripts
```

---

## 🔐 Credentials & Secrets

**Location:** Stored securely in environment variables on Hetzner

**Never commit to git:**
- Database passwords
- API keys
- Cloudflare credentials
- Auth secrets

**Managed via:**
- `.env` files (gitignored)
- Docker secrets (for sensitive data)

---

## 📊 Resource Monitoring

### Memory Allocation Target (8GB Total)

| Service | Target RAM | Max RAM |
|---------|-----------|---------|
| MCP Auth | 256 MB | 512 MB |
| MCP Postgres | 512 MB | 1 GB |
| Aspen Gateway | 1 GB | 1.5 GB |
| Aspen Postgres | 512 MB | 1 GB |
| WTEC Backend | 512 MB | 1 GB |
| WTEC Frontend | 256 MB | 512 MB |
| WTEC Postgres | 1 GB | 1.5 GB |
| WTEC Redis | 128 MB | 256 MB |
| WTEC Nginx | 64 MB | 128 MB |
| Other Services | 512 MB | 1 GB |
| System Overhead | 1 GB | 1.5 GB |
| **Buffer** | 1 GB | - |

**Alerts:**
- Warning at 6.5GB (81% usage)
- Critical at 7GB (87% usage)

### Disk Allocation Target (80GB Total)

| Usage | Target | Max |
|-------|--------|-----|
| System | 5 GB | 8 GB |
| Docker Images | 10 GB | 15 GB |
| Databases | 10 GB | 15 GB |
| Uploads | 15 GB | 25 GB |
| Logs | 3 GB | 5 GB |
| Backups | 10 GB | 15 GB |
| **Available** | 27 GB | - |

**Alerts:**
- Warning at 64GB (80% usage)
- Critical at 70GB (87% usage)

---

## 🚨 Incident Response

### Service Down

1. Check service status: `docker compose ps`
2. View logs: `docker compose logs SERVICE`
3. Restart service: `docker compose restart SERVICE`
4. If persistent, check resources: `docker stats`, `df -h`, `free -h`
5. If OOM, reduce limits or kill other services
6. Notify user of any extended downtime

### Database Issues

1. Check PostgreSQL logs
2. Verify connection strings
3. Check disk space
4. If corrupted, restore from backup
5. Run database integrity checks

### High Memory Usage

1. Identify culprit: `docker stats`
2. Restart offending service
3. Adjust memory limits in docker-compose.yml
4. Consider scaling down features

### High Disk Usage

1. Check: `df -h && docker system df`
2. Clean logs: `find /opt/wtec/logs -mtime +7 -delete`
3. Clean old backups: `find /opt/wtec/backups -mtime +7 -delete`
4. Prune Docker: `docker system prune -a --volumes`

### DNS Issues

1. Verify Cloudflare tunnel: `docker compose logs cloudflared`
2. Check tunnel status in Cloudflare dashboard
3. Restart tunnel: `docker compose restart cloudflared`
4. Verify DNS records in Cloudflare

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] Server provisioned (Hetzner CCX13)
- [ ] SSH key generated and added
- [ ] Docker installed
- [ ] Firewall configured
- [ ] Directory structure created
- [ ] Cloudflare tunnel credentials obtained
- [ ] All passwords/secrets documented securely

### Phase 1 Deployment

- [ ] Cloudflare tunnel configured
- [ ] MCP Auth deployed and tested
- [ ] Aspen Gateway deployed and tested
- [ ] DNS updated for auth/aspen
- [ ] Authentication flow verified
- [ ] AI API calls verified

### Phase 2 Deployment

- [ ] WTEC code copied to server
- [ ] Database backed up locally
- [ ] PostgreSQL deployed on Hetzner
- [ ] Redis deployed on Hetzner
- [ ] Database restored to Hetzner
- [ ] WTEC backend deployed
- [ ] WTEC frontend deployed
- [ ] Nginx configured
- [ ] Full WTEC functionality tested
- [ ] DNS cutover completed
- [ ] Monitoring enabled

### Phase 3 Deployment

- [ ] Wade.Technology website deployed
- [ ] Mission Control deployed
- [ ] Other supporting services deployed
- [ ] Health checks configured
- [ ] Automated backups enabled
- [ ] Alerting configured
- [ ] Documentation updated

### Post-Deployment

- [ ] All services running < 24 hours without restart
- [ ] Memory usage < 80%
- [ ] Disk usage < 80%
- [ ] Response times < 200ms
- [ ] No errors in logs
- [ ] Backups verified
- [ ] Monitoring verified
- [ ] User acceptance testing complete

---

## 🎓 Best Practices

### Docker Compose

- Always use `docker compose` (v2), not `docker-compose` (v1)
- Set memory limits for all services
- Use health checks for critical services
- Configure restart policies: `unless-stopped`
- Use named volumes for persistence
- Enable log rotation

### Security

- Never expose PostgreSQL ports publicly
- Use strong passwords (32+ characters)
- Rotate credentials quarterly
- Enable Cloudflare WAF for all public services
- Regular security updates: `apt update && apt upgrade`
- Monitor failed login attempts

### Monitoring

- Check services daily
- Review logs weekly
- Analyze resource trends monthly
- Test backups monthly
- Update dependencies monthly

### Backup Strategy

- **Daily:** PostgreSQL dumps (7-day retention)
- **Weekly:** Full volume backups (4-week retention)
- **Monthly:** Archive backups (12-month retention)
- **Before major changes:** Manual snapshot

---

## 🔄 Session Handoff Protocol

**When context reaches 70% or session ends:**

1. Update `DEPLOYMENT-STATUS.md` with current state
2. Update `DEPLOYMENT-LOG.md` with actions taken
3. Note any pending tasks
4. Document any errors encountered
5. List next steps clearly

**Next session starts by:**

1. Reading `DEPLOYMENT-STATUS.md`
2. Reading `DEPLOYMENT-LOG.md` (recent entries)
3. Continuing from documented next steps

---

## 📚 Related Documentation

- **Architecture:** `C:\users\wade\docker\ARCHITECTURE-SPLIT-ANALYSIS.md`
- **VM Deployment Guide:** `C:\users\wade\wtec\VM-DEPLOYMENT-GUIDE.md`
- **Cloudflare Config:** `C:\users\wade\docker\cloudflared\config.yml`
- **Docker Compose:** `C:\users\wade\docker\docker-compose.yml`
- **WTEC:** `C:\users\wade\wtec\`
- **System Status:** `C:\users\wade\docker\SYSTEM-STATUS.md`

---

## 🆘 Getting Help

**If stuck or uncertain:**
1. Read deployment log for context
2. Check server logs for errors
3. Review related documentation
4. Ask user for clarification
5. Never make destructive changes without confirmation

**Escalation triggers:**
- Data loss risk
- Extended downtime (>5 minutes)
- Unrecoverable errors
- Security concerns

---

**Last Updated:** 2026-01-17
**Status:** Active Deployment
**Current Phase:** Phase 1 - Foundation (In Progress)
