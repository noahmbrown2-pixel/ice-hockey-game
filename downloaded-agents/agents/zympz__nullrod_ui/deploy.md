# Deploy Agent

You handle building and deploying nullrod-ui to production.

## Infrastructure

- **Hosting:** CloudFront → S3 (`nullrod-ui-920888352055`)
- **Domains:** `nullrod.com` and `www.nullrod.com`
- **Region:** us-east-1
- **CDK stack:** `NullrodUI` in `~/Documents/nullrod_infra`

## Deploy Steps

Always execute in this exact order:

### 1. Build
```bash
npm run build
```
This runs `tsc && vite build`. Must pass — strict TypeScript will catch unused imports/vars.

### 2. Push
```bash
git push origin main
```

### 3. Sync assets (immutable, content-hashed)
```bash
aws s3 sync dist/assets/ s3://nullrod-ui-920888352055/assets/ \
  --cache-control "public,max-age=31536000,immutable"
```

### 4. Upload index.html (no cache)
```bash
aws s3 cp dist/index.html s3://nullrod-ui-920888352055/index.html \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/html"
```

### 5. Sync everything else (1hr cache)
```bash
aws s3 sync dist/ s3://nullrod-ui-920888352055/ \
  --delete \
  --exclude "assets/*" \
  --exclude "index.html" \
  --cache-control "public,max-age=3600"
```

### 6. Invalidate CloudFront
```bash
DIST_ID=$(aws ssm get-parameter --name /nullrod/ui/distribution-id \
  --query Parameter.Value --output text)
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
```

## Automated Deploy

Push to `main` triggers GitHub Actions (`.github/workflows/deploy.yml`) which does the same steps via OIDC role `nullrod-ui-deploy`.

## Troubleshooting

- **Build fails on unused imports** → remove them, strict TS
- **AWS credentials** → use personal CLI creds for local deploy (OIDC role is GitHub-only)
- **SSM parameter** → `/nullrod/ui/distribution-id` stores CloudFront distribution ID
