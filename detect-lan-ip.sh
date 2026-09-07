#!/bin/sh
IP=$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if ($i=="src") print $(i+1)}')
if [ -z "$IP" ]; then
  echo "Impossible de détecter l'IP LAN" >&2
  exit 1
fi
echo "$IP"
