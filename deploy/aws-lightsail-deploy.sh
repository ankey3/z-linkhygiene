#!/usr/bin/env bash
# =============================================================================
# LinkHygiene — AWS Lightsail Deployment (Bitnami stack)
# Prerequisites: AWS Lightsail instance with Ubuntu 22.04
# Usage: sudo bash deploy/aws-lightsail-deploy.sh yourdomain.com
# =============================================================================
set -euo pipefail

DOMAIN="${1:-linkhygiene.example.com}"
APP_DIR="/opt/linkhygiene"

echo "=============================================="
echo "  LinkHygiene — AWS Lightsail Deploy"
echo "  Domain: ${DOMAIN}"
echo "=============================================="

# Install Docker (Lightsail may already have it)
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker && systemctl start docker
fi

# Install Nginx and Certbot
if ! command -v nginx &>/dev/null; then
    apt-get update -qq && apt-get install -y nginx certbot python3-certbot-nginx
fi

# Create app directory
mkdir -p "${APP_DIR}"

# Nginx reverse proxy config
cat > "/etc/nginx/sites-available/${DOMAIN}" << NGINXEOF
server {
    listen 80;
    server_name ${DOMAIN};

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location /api/ {
        limit_req zone=api burst=5 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF

ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl reload nginx

# Build and start
cd "${APP_DIR}"
docker compose build --no-cache
docker compose up -d

# SSL
certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email || true

echo "Done! App running at https://${DOMAIN}"
