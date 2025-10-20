# Deployment Checklist

Complete checklist for deploying Rapid Sites to production.

## ✅ **Pre-Deployment Validation** (MUST PASS)

### Automated Tests
- [ ] `pnpm validate` passes (type-check + lint + unit tests)
- [ ] `pnpm test:e2e` passes (10 E2E tests)
- [ ] All 105 tests passing (100%)

### Docker Testing
- [ ] `docker build -t rapid-sites:test .` succeeds
- [ ] `pnpm docker:up` starts all services
- [ ] `docker-compose ps` shows all containers healthy
- [ ] `curl http://localhost:3000/api/health` returns 200

### Browser Testing
- [ ] Homepage (`/`) loads without errors
- [ ] Demo page (`/demo`) works
- [ ] Blog page (`/blog`) shows correctly
- [ ] Admin panel (`/admin`) accessible with DB
- [ ] Contact form submits (check network tab)
- [ ] Newsletter signup works
- [ ] Mobile responsive (test on device or devtools)

### Database Testing
- [ ] Database migrations run successfully
- [ ] Can create users in admin
- [ ] Can upload media files
- [ ] Can create pages/posts
- [ ] Multi-tenant isolation works
- [ ] All collections accessible

### Integration Testing
- [ ] Contact form sends real email (Resend)
- [ ] Newsletter sends confirmation (Resend)
- [ ] Stripe checkout creates session
- [ ] Cal.com booking embed loads
- [ ] Webhooks configured (Stripe)

---

## 🔐 **Environment Variables** (Required)

### Database (REQUIRED)
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Payload CMS (REQUIRED)
```bash
PAYLOAD_SECRET=minimum-32-characters-long-secret-key
PAYLOAD_PUBLIC_SERVER_URL=https://yourdomain.com
```

### Email - Resend (REQUIRED for contact/newsletter)
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
CONTACT_EMAIL=contact@yourdomain.com
```

### Stripe (REQUIRED for ecommerce)
```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Cal.com (REQUIRED for booking)
```bash
NEXT_PUBLIC_CALCOM_USERNAME=your-username
NEXT_PUBLIC_CALCOM_URL=https://cal.com/your-username
```

### App URLs
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_DOMAIN=yourdomain.com
```

---

## 🚀 **Deployment Options**

### Option 1: Coolify (Recommended)

1. **Connect Repository**
   - Link GitHub repo to Coolify
   - Select `main` branch

2. **Configure Build**
   - Build method: Dockerfile
   - Target: `production`
   - Port: 3000

3. **Set Environment Variables**
   - Add all required env vars in Coolify dashboard
   - Use secrets for sensitive values

4. **Deploy**
   - Click deploy
   - Monitor logs
   - Wait for health check

5. **Configure Domain**
   - Add custom domain in Coolify
   - SSL automatically configured

### Option 2: Docker Compose (Self-hosted)

1. **Prepare Server**
   - SSH into VPS
   - Install Docker + Docker Compose
   - Clone repository

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Start Services**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Verify**
   ```bash
   docker-compose ps
   curl http://localhost:3000/api/health
   ```

5. **Setup Reverse Proxy**
   - Nginx or Caddy
   - SSL with Let's Encrypt

### Option 3: Vercel

1. **Connect Repository**
2. **Add Environment Variables**
3. **Deploy**

**Note**: Vercel has limitations for Payload CMS. Coolify or self-hosted recommended.

---

## 📊 **Post-Deployment Verification**

### Smoke Tests
- [ ] Homepage loads
- [ ] Admin panel accessible
- [ ] Can log in
- [ ] Can create content
- [ ] Media uploads work
- [ ] Forms submit correctly
- [ ] Emails send
- [ ] Payments process

### Performance
- [ ] Lighthouse score > 90
- [ ] Time to First Byte < 500ms
- [ ] Largest Contentful Paint < 2.5s

### Security
- [ ] HTTPS working
- [ ] Security headers present
- [ ] CSP configured
- [ ] Secrets not exposed
- [ ] Rate limiting active

---

## 🐛 **Troubleshooting**

### App Won't Start
```bash
# Check logs
docker-compose logs app

# Common issues:
# - DATABASE_URL incorrect
# - PAYLOAD_SECRET missing
# - Port 3000 already in use
```

### Database Connection Failed
```bash
# Check postgres logs
docker-compose logs postgres

# Verify connection string
echo $DATABASE_URL
```

### Admin Panel 500 Error
```bash
# Check Payload secret is set
echo $PAYLOAD_SECRET

# Check database migrations ran
docker-compose exec app pnpm payload migrate
```

### Email Not Sending
```bash
# Verify Resend API key
curl https://api.resend.com/emails \\
  -H "Authorization: Bearer $RESEND_API_KEY"

# Check domain verified in Resend dashboard
```

---

## 📋 **Rollback Plan**

If deployment fails:

1. **Keep old version running**
2. **Check logs**: `docker-compose logs`
3. **Identify issue**
4. **Fix and redeploy** OR
5. **Revert commit**: `git revert HEAD`
6. **Redeploy previous version**

---

## ✅ **Launch Checklist**

Day before launch:
- [ ] All tests passing
- [ ] Docker tested locally
- [ ] Database backed up
- [ ] API keys configured
- [ ] DNS records ready
- [ ] SSL certificate ready

Launch day:
- [ ] Deploy to production
- [ ] Verify health endpoint
- [ ] Test all critical paths
- [ ] Monitor logs for errors
- [ ] Test from multiple devices
- [ ] Verify emails sending
- [ ] Test payment flow

Post-launch:
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify backups running
- [ ] Document any issues
- [ ] Plan hotfixes if needed

---

**Current Framework Status**:
- Code: ✅ Production-ready
- Tests: ✅ 105/105 passing
- Docker: ⏳ Needs manual verification (socket issue)
- APIs: ⏳ Need keys to test live

Once Docker socket is resolved, full verification can complete in ~5 minutes.
