#!/bin/sh
set -e

LAN_IP=$(sh "$(dirname "$0")/detect-lan-ip.sh")

update_env() {
  file="$1"
  key="$2"
  value="$3"

  [ -f "$file" ] || touch "$file"

  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

# 1. .env
update_env ".env" "LAN_IP" "$LAN_IP"
update_env ".env" "NEXT_PUBLIC_API_URL" "http://${LAN_IP}:4000"
update_env ".env" "BETTER_AUTH_URL" "http://${LAN_IP}:4000"
update_env ".env" "BACKEND_URL" "http://${LAN_IP}:4000"
update_env ".env" "FRONTEND_URL" "http://${LAN_IP}:3001"

# 2. apps/backend/.env
update_env "apps/backend/.env" "BETTER_AUTH_URL" "http://${LAN_IP}:4000"

# 3. apps/frontend/.env.local
update_env "apps/frontend/.env.local" "NEXT_PUBLIC_API_URL" "http://${LAN_IP}:4000"

echo "LAN_IP détectée et écrite : $LAN_IP"
