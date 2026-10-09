# GVPIHLR ERP — Production Deployment Guide

**Target OS:** Ubuntu 22.04 / 24.04 LTS Server  
**Platform Architecture:** Nginx + PM2 + Next.js + PostgreSQL 16  

---

## 1. System Requirements & Preparation

```bash
# Update Ubuntu package index
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS or 22 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql postgresql-contrib

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

---

## 2. PostgreSQL Configuration

```bash
# Switch to postgres user
sudo -u postgres psql

# Create user and production database
CREATE USER gvp_admin WITH PASSWORD 'SECURE_PRODUCTION_DB_PASSWORD';
CREATE DATABASE gvpihlr_erp OWNER gvp_admin;
GRANT ALL PRIVILEGES ON DATABASE gvpihlr_erp TO gvp_admin;
\q
```

---

## 3. Application Deployment & Build

```bash
# Clone to production directory
cd /var/www/gvpihlr-cms

# Configure production environment variables
cp .env.example .env.production
nano .env.production

# Install dependencies and build
npm ci
npx prisma db push
npm run build
```

---

## 4. PM2 Process Configuration

Create `/var/www/gvpihlr-cms/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "gvpihlr-erp",
      script: "npm",
      args: "start",
      cwd: "/var/www/gvpihlr-cms",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

Launch with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 5. Nginx Reverse Proxy with TLS Termination

Create `/etc/nginx/sites-available/gvpihlr-erp`:

```nginx
server {
    listen 80;
    server_name erp.gvpihlr.edu.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name erp.gvpihlr.edu.in;

    ssl_certificate /etc/letsencrypt/live/erp.gvpihlr.edu.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/erp.gvpihlr.edu.in/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/gvpihlr-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Automated Backup Strategy

### Local Automated pg_dump (Cron)
Create `/usr/local/bin/backup-gvpihlr.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/gvpihlr"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"
pg_dump -U gvp_admin -h localhost gvpihlr_erp | gzip > "$BACKUP_DIR/gvpihlr_db_$TIMESTAMP.sql.gz"
# Retain last 30 daily backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete
```

Add to cron (`crontab -e`):
```cron
0 2 * * * /usr/local/bin/backup-gvpihlr.sh > /dev/null 2>&1
```
