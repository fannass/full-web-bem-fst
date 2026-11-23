#!/usr/bin/env bash
# ==============================================================================
# BEM FST UNISA — Server Maintenance CLI (ala `php artisan down` / `up`)
# ==============================================================================
# Penggunaan:
#   sudo ./maintenance.sh down     -> Aktifkan mode maintenance (HTTP 503)
#   sudo ./maintenance.sh up       -> Matikan mode maintenance (website normal)
#   sudo ./maintenance.sh status   -> Cek status maintenance saat ini
# ==============================================================================

set -euo pipefail

FLAG_FILE="${MAINTENANCE_FLAG_FILE:-/var/www/bem-maintenance.on}"
CMD="${1:-status}"

case "$CMD" in
  down)
    mkdir -p "$(dirname "$FLAG_FILE")"
    date -Iseconds > "$FLAG_FILE"
    echo "[OK] Maintenance mode AKTIF (flag: $FLAG_FILE)"
    echo "     Pengunjung biasa sekarang melihat halaman Under Maintenance (HTTP 503)."
    echo "     Untuk cek website di browser kamu, buka endpoint preview rahasia Nginx (/_bem-preview)."
    ;;
  up)
    if [ -f "$FLAG_FILE" ]; then
      rm -f "$FLAG_FILE"
      echo "[OK] Maintenance mode NONAKTIF. Website kembali normal."
    else
      echo "[INFO] Maintenance mode memang sudah nonaktif."
    fi
    ;;
  status)
    if [ -f "$FLAG_FILE" ]; then
      SINCE="$(cat "$FLAG_FILE" 2>/dev/null || echo 'unknown')"
      echo "[STATUS] MAINTENANCE AKTIF sejak: $SINCE"
      echo "         Flag file: $FLAG_FILE"
    else
      echo "[STATUS] ONLINE (maintenance tidak aktif)"
    fi
    ;;
  *)
    echo "Penggunaan: $0 {down|up|status}"
    exit 1
    ;;
esac
