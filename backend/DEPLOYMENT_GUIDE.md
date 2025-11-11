# Sikars Backend - Deployment Guide

## 🌍 Deployment Options

### Option 1: Heroku (Easiest)

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Steps

```bash
# 1. Login to Heroku
heroku login

# 2. Create new app
heroku create sikars-api

# 3. Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set CORS_ORIGIN=https://yourdomain.com
heroku config:set AUTHORIZE_NET_API_LOGIN_ID=your-id
heroku config:set AUTHORIZE_NET_TRANSACTION_KEY=your-key
heroku config:set AWS_ACCESS_KEY_ID=your-key
heroku config:set AWS_SECRET_ACCESS_KEY=your-secret
heroku config:set SENDGRID_API_KEY=your-key

# 5. Deploy
git push heroku main

# 6. Run database migrations
heroku run "psql \$DATABASE_URL < src/database/schema.sql"

# 7. Open your app
heroku open
```

---

### Option 2: DigitalOcean App Platform

#### Prerequisites
- DigitalOcean account
- GitHub repository

#### Steps

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Create App on DigitalOcean**
- Go to DigitalOcean App Platform
- Click "Create App"
- Connect GitHub repository
- Select branch: `main`
- Autodeploy: Enable

3. **Configure App**
- Environment: Node.js
- Build Command: `npm install`
- Run Command: `npm start`
- HTTP Port: 5000

4. **Add PostgreSQL Database**
- Click "Add Database"
- Select PostgreSQL
- Choose plan (Basic - $15/mo)

5. **Set Environment Variables**
Add all variables from `.env.example`

6. **Deploy**
Click "Deploy" and wait for build

---

### Option 3: AWS EC2 + RDS

#### Prerequisites
- AWS account
- EC2 instance (Ubuntu 22.04)
- RDS PostgreSQL instance

#### Server Setup

```bash
# 1. Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. Update system
sudo apt update && sudo apt upgrade -y

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Install PM2
sudo npm install -g pm2

# 5. Install Git
sudo apt install -y git

# 6. Clone repository
git clone your-repo-url
cd sikars-backend

# 7. Install dependencies
npm install

# 8. Create .env file
nano .env
# Add all environment variables

# 9. Set up PostgreSQL connection
# Use RDS endpoint in DATABASE_URL

# 10. Start with PM2
pm2 start server.js --name sikars-api
pm2 save
pm2 startup
```

#### Database Setup (RDS)
```bash
# Connect to RDS
psql -h your-rds-endpoint -U postgres -d sikars

# Run schema
\i src/database/schema.sql
```

#### Set up Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/sikars
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sikars /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

### Option 4: Vercel (Serverless)

#### Prerequisites
- Vercel account
- GitHub repository

#### Steps

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Add vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. **Deploy**
```bash
vercel
```

4. **Set Environment Variables**
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# Add all other variables
```

5. **Add PostgreSQL**
- Use external PostgreSQL (like Supabase or Neon)
- Add connection string to environment variables

---

## 📝 Pre-Deployment Checklist

### Security
- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV to 'production'
- [ ] Enable HTTPS/SSL
- [ ] Set CORS_ORIGIN to production domain
- [ ] Use production payment gateway credentials
- [ ] Disable debug logging

### Database
- [ ] Database schema deployed
- [ ] Seed data inserted
- [ ] Backups configured
- [ ] Connection pooling configured
- [ ] Indexes created

### Configuration
- [ ] All environment variables set
- [ ] AWS S3 bucket created and configured
- [ ] SendGrid account set up
- [ ] Authorize.net production credentials
- [ ] Error monitoring (Sentry) configured

### Performance
- [ ] Rate limiting enabled
- [ ] Caching configured (Redis optional)
- [ ] Compression enabled
- [ ] Database queries optimized

### Monitoring
- [ ] Logging configured
- [ ] Error tracking set up
- [ ] Uptime monitoring configured
- [ ] Performance monitoring configured

---

## 🔒 Production Environment Variables

```env
# Server
NODE_ENV=production
PORT=5000

# Database (use production connection string)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT (use strong random string)
JWT_SECRET=super-secure-random-string-here
JWT_EXPIRES_IN=7d

# Payment (PRODUCTION credentials)
AUTHORIZE_NET_API_LOGIN_ID=prod-api-login
AUTHORIZE_NET_TRANSACTION_KEY=prod-transaction-key
AUTHORIZE_NET_ENV=production

# AWS S3 (production bucket)
AWS_ACCESS_KEY_ID=prod-access-key
AWS_SECRET_ACCESS_KEY=prod-secret-key
AWS_S3_BUCKET=sikars-production
AWS_REGION=us-east-1

# Email (production)
SENDGRID_API_KEY=prod-sendgrid-key
FROM_EMAIL=orders@sikars.com

# URLs (production domains)
FRONTEND_URL=https://sikars.com
CORS_ORIGIN=https://sikars.com
API_BASE_URL=https://api.sikars.com
TRACKING_BASE_URL=https://sikars.com/track

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🔄 Database Migrations

```bash
# Backup before migration
pg_dump -h host -U user dbname > backup.sql

# Run migration
psql -h host -U user dbname < migration.sql

# Verify
psql -h host -U user dbname -c "\dt"
```

---

## 📊 Monitoring Setup

### Sentry (Error Tracking)

```bash
npm install @sentry/node
```

```javascript
// In server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### PM2 Monitoring

```bash
pm2 monitor
# Follow instructions to set up PM2 monitoring
```

---

## 🚨 Troubleshooting

### Server won't start
```bash
# Check logs
pm2 logs sikars-api

# Check environment variables
pm2 show sikars-api

# Restart
pm2 restart sikars-api
```

### Database connection error
```bash
# Test connection
psql -h host -U user -d dbname

# Check DATABASE_URL format
echo $DATABASE_URL
```

### SSL certificate issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate
sudo certbot certificates
```

---

## 📈 Scaling

### Horizontal Scaling
- Load balancer (AWS ALB, nginx)
- Multiple server instances
- Database read replicas

### Performance Optimization
- Redis caching
- CDN for static files
- Database connection pooling
- Query optimization

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "sikars-api"
        heroku_email: ${{secrets.HEROKU_EMAIL}}
```

---

## 📞 Support

If you encounter issues during deployment:
1. Check logs first
2. Verify all environment variables
3. Test database connection
4. Review deployment platform documentation
5. Contact support team

---

**Good luck with your deployment! 🚀**
