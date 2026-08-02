#!/usr/bin/env bash
# ==========================================================================
# LinkHygiene — AWS EC2 Deployment Script
# Tested on: Ubuntu 22.04 LTS / Amazon Linux 2023
# Usage: sudo bash deploy/aws-ec2-deploy.sh yourdomain.com
# ==========================================================================
set -euo pipefail

DOMAIN="${1:-linkhygiene.example.com}"
APP_DIR="/opt/linkhygiene"


echo "=============================================="
echo "  LinkHygiene AWS EC2 Deployment"
echo "  Domain: ${DOMAIN}"
echo "=============================================="
echo ""

# --- 1. Install Docker ---
install_docker() {
    echo "[1/6] Installing Docker..."
    if command -v docker &>/dev/null; then
        echo "  Docker already installed, skipping."
        return
    fi
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    usermod -aG docker $SUDO_USER 2>/dev/null || true
    echo "  Docker installed."
}

# --- 2. Install Nginx ---
install_nginx() {
    echo "[2/6] Installing Nginx..."
    if command -v nginx &>/dev/null; then
        echo "  Nginx already installed, skipping."
        return
    fi
    if command -v apt-get &>/dev/null; then
        apt-get update -qq && apt-get install -y -qq nginx certbot python3-certbot-nginx
    elif command -v dnf &>/dev/null; then
        dnf install -y nginx certbot python3-certbot-nginx
    fi
    systemctl enable nginx
    echo "  Nginx installed."
}

# --- 3. Setup App Directory ---
setup_app() {
    echo "[3/6] Setting up app directory..."
    mkdir -p "${APP_DIR}"
    echo "  App directory: ${APP_DIR}"
}

# --- 4. Configure Nginx ---
configure_nginx() {
    echo "[4/6] Configuring Nginx for ${DOMAIN}..."
    cat > "/etc/nginx/sites-available/${DOMAIN}" << NGINXEOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Rate limiting zones
    limit_req_zone \$binary_remote_addr zone=api:10m rate=15r/m;

    # API routes — stricter rate limiting
    location /api/ {
        limit_req zone=api burst=5 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
    }

    # Static assets — long cache
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Public files — short cache
    location /icon.png {
        proxy_pass http://127.0.0.1:3000;
        expires 7d;
        add_header Cache-Control "public";
    }

    # All other requests
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
    nginx -t
    echo "  Nginx configured."
}

# --- 5. Build and Start ---
build_and_start() {
    echo "[5/6] Building and starting containers..."
    cd "${APP_DIR}"
    docker compose build --no-cache
    docker compose up -d
    echo "  Waiting for app to be healthy..."
    for i in \$(seq 1 30); do
        if docker compose exec -T app wget -q --spider http://localhost:3000/ 2>/dev/null; then
            echo "  App is healthy!"
            return
        fi
        sleep 2
    done
    echo "  WARNING: App did not become healthy within 60s. Check: docker compose logs"
}

# --- 6. SSL ---
setup_ssl() {
    echo "[6/6] Setting up SSL with Let's Encrypt..."
    systemctl reload nginx
    certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email || true
    systemctl reload nginx
}

# --- Run ---
if [ "\$(id -u)" -ne 0 ]; then
    echo "Please run as root: sudo bash $0 ${DOMAIN}"
    exit 1
fi

install_docker
install_nginx
setup_app
configure_nginx
build_and_start
setup_ssl

echo ""
echo "=============================================="
echo "  Deployment Complete!"
echo "  https://${DOMAIN}"
echo "=============================================="
echo ""
echo "  Useful commands:"
echo "    cd ${APP_DIR}"
echo "    docker compose logs -f           # View logs"
echo "    docker compose restart           # Restart app"
echo "    docker compose pull && docker compose up -d  # Update & redeploy"
echo "    certbot renew                   # Renew SSL"
