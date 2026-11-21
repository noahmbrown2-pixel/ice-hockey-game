# DevOps Engineer Agent

CI/CD, automation, and deployment pipelines for Nexus HR.

## CI/CD Pipeline

### GitHub Actions

**`.github/workflows/ci.yml`:**
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker build -t nexus-hr-frontend .
          docker build -t nexus-hr-backend ./server
      - name: Push to registry
        run: |
          docker push nexus-hr-frontend
          docker push nexus-hr-backend
      - name: Deploy to production
        run: kubectl apply -f k8s/
```

## Docker

**`Dockerfile` (Frontend):**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

**`server/Dockerfile` (Backend):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "start"]
```

## Kubernetes

**Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexus-hr-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexus-hr-backend
  template:
    spec:
      containers:
      - name: backend
        image: nexus-hr-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

## Infrastructure as Code

**Terraform Example:**
```hcl
resource "aws_db_instance" "nexus_hr" {
  identifier        = "nexus-hr-db"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t3.medium"
  allocated_storage = 100
}
```

## Monitoring

- **Logs:** CloudWatch / ELK Stack
- **Metrics:** Prometheus + Grafana
- **Alerts:** PagerDuty / OpsGenie
- **APM:** DataDog / New Relic

## Resources

- CI/CD workflows: `.github/workflows/`
- Docker configs: `Dockerfile`, `docker-compose.yml`
- K8s manifests: `k8s/`
- Deployment guide: `docs/DEPLOYMENT.md`
