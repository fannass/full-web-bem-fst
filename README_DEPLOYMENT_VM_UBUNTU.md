# Deployment Guide (Production) - BEM FST

Dokumen ini adalah panduan operasional deployment production BEM FST pada VM Ubuntu, setelah migrasi dari mode testing `/bem-test` ke domain production khusus:

- Production web: `https://bemfst.unisayogya.ac.id/`
- Production API: `https://bemfst.unisayogya.ac.id/api/v1`
- Backend internal bind: `http://127.0.0.1:3000`
- Process manager: PM2
- Reverse proxy: Nginx
- Database: MySQL lokal VM

Dokumen ini menggambarkan kondisi production yang aktif saat ini. Riwayat konsep testing lama di `mataf-fst.unisayogya.ac.id/bem-test/` dipertahankan hanya sebagai konteks historis, bukan target deploy utama lagi.

## 1. Arsitektur Aktif

- Frontend React/Vite disajikan statis dari `/var/www/bemfst`
- Backend NestJS berjalan di PM2 pada port `3000`
- Nginx domain `bemfst.unisayogya.ac.id` menjadi entry point publik
- Domain `mataf-fst.unisayogya.ac.id` dipisahkan kembali untuk website `mataf`
- API dan uploads hanya dipublikasikan lewat reverse proxy Nginx

Mapping publik:

- `/` -> frontend BEM production
- `/api/` -> `http://127.0.0.1:3000/api/`
- `/uploads/` -> `http://127.0.0.1:3000/uploads/`

## 2. Prasyarat Server

Pastikan tersedia:

- Nginx aktif
- SSL certbot aktif
- Node.js + npm
- PM2
- MySQL server + client
- Git

Cek cepat:

```bash
nginx -v
systemctl status nginx --no-pager
node -v
npm -v
pm2 -v
git --version
mysql --version
```

## 3. Setup Database

Masuk MySQL:

```bash
mysql
```

Buat database dan user aplikasi:

```sql
CREATE DATABASE bem_fst_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bem_user'@'127.0.0.1' IDENTIFIED BY 'GantiPasswordKuat123!';
GRANT ALL PRIVILEGES ON bem_fst_prod.* TO 'bem_user'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

Verifikasi:

```bash
mysql -u bem_user -p -h 127.0.0.1 -e "SHOW DATABASES;"
```

## 4. Clone Repository

```bash
mkdir -p /opt/apps
cd /opt/apps
git clone https://github.com/fannass/full-web-bem-fst.git
cd /opt/apps/full-web-bem-fst
```

## 5. Konfigurasi Backend (.env)

Lokasi file env:

- `/opt/apps/full-web-bem-fst/backend-nest/.env`

Contoh nilai production:

```env
DATABASE_URL="mysql://bem_user:GANTI_PASSWORD_DB@127.0.0.1:3306/bem_fst_prod"
JWT_SECRET="GANTI_DENGAN_SECRET_RANDOM_PANJANG"
JWT_EXPIRES_IN=8h
PORT=3000
NODE_ENV=production
ADMIN_USERNAME=svc_core
ADMIN_PASSWORD=GANTI_PASSWORD_ADMIN_PRODUCTION
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp
CORS_ORIGIN=https://bemfst.unisayogya.ac.id
FRONTEND_URL=https://bemfst.unisayogya.ac.id
```

Catatan:

- Jangan commit file `.env`
- Gunakan password admin production yang berbeda dari testing
- `FRONTEND_URL` dipakai juga oleh generator sitemap backend

## 6. Build dan Jalankan Backend

```bash
cd /opt/apps/full-web-bem-fst/backend-nest
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 start dist/main.js --name bem-api
pm2 save
pm2 startup systemd -u root --hp /root
```

Jika service sudah ada, gunakan:

```bash
pm2 restart bem-api --update-env
```

Verifikasi backend lokal:

```bash
curl -I http://127.0.0.1:3000/api/v1/posts
```

Harapan hasil:

- `200 OK`

## 7. Build dan Publish Frontend Production

Karena frontend sekarang berjalan di root domain `bemfst`, build gunakan base path root:

```bash
cd /opt/apps/full-web-bem-fst/frontend
npm install
npm run build -- --base=/
mkdir -p /var/www/bemfst
rm -rf /var/www/bemfst/*
cp -r dist/* /var/www/bemfst/
```

## 8. Konfigurasi Nginx Production

File config:

- `/etc/nginx/sites-available/bemfst`

Contoh konfigurasi aktif:

```nginx
server {
    listen 80;
    server_name bemfst.unisayogya.ac.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name bemfst.unisayogya.ac.id;

    root /var/www/bemfst;
    index index.html;
    client_max_body_size 6M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    ssl_certificate /etc/letsencrypt/live/bemfst.unisayogya.ac.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bemfst.unisayogya.ac.id/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

Aktifkan config:

```bash
ln -s /etc/nginx/sites-available/bemfst /etc/nginx/sites-enabled/bemfst
nginx -t
systemctl reload nginx
```

Pasang SSL jika belum ada:

```bash
certbot --nginx -d bemfst.unisayogya.ac.id
```

## 9. Verifikasi Production

Tes endpoint utama:

```bash
curl -I https://bemfst.unisayogya.ac.id/
curl -I https://bemfst.unisayogya.ac.id/api/v1/posts
curl -s https://bemfst.unisayogya.ac.id/api/v1/organization
```

Harapan hasil:

- `/` -> `200 OK`
- `/api/v1/posts` -> `200 OK`
- endpoint organisasi mengembalikan JSON valid

Checklist browser:

- halaman publik tampil normal
- asset/logo tampil normal
- login admin berhasil
- daftar dan detail post tampil
- upload featured image berhasil
- gambar dari `/uploads/...` tampil
- console browser bersih dari error CSP/Iconify

## 10. SEO dan Metadata Publik

Status production yang perlu dijaga:

- canonical mengarah ke `https://bemfst.unisayogya.ac.id/`
- OG/Twitter URL mengarah ke domain production
- OG/Twitter image memakai asset domain sendiri, bukan placeholder
- `robots.txt` menunjuk ke sitemap production
- `frontend/public/sitemap.xml` tidak lagi memakai `localhost`
- dynamic sitemap backend tersedia di:
  - `https://bemfst.unisayogya.ac.id/api/v1/posts/sitemap/xml`

## 11. Hardening yang Sudah Aktif

Hardening yang sudah aktif di backend:

- Helmet aktif untuk security headers
- Global throttling: `30 request / menit / IP`
- Endpoint login admin: `5 request / menit / IP`
- Login sukses dan gagal dicatat ke activity log

Catatan:

- Hardening login dasar sudah aktif di aplikasi
- Jika ingin ditingkatkan lagi, bisa tambah rate limiting Nginx dan monitoring log login gagal

## 12. SOP Update Aplikasi

### 12.1 Update backend

```bash
cd /opt/apps/full-web-bem-fst
git pull origin main
cd backend-nest
npm install
npm run build
pm2 restart bem-api --update-env
pm2 status
```

### 12.2 Update frontend

```bash
cd /opt/apps/full-web-bem-fst
git pull origin main
cd frontend
npm install
npm run build -- --base=/
rm -rf /var/www/bemfst/*
cp -r dist/* /var/www/bemfst/
nginx -t
systemctl reload nginx
```

Setelah publish frontend:

- lakukan hard refresh browser
- cek lagi halaman home, admin, dan post detail

## 13. Backup Rutin

Minimal backup yang wajib ada:

- database `bem_fst_prod`
- file `/opt/apps/full-web-bem-fst/backend-nest/.env`
- folder `/opt/apps/full-web-bem-fst/backend-nest/uploads`
- file `/etc/nginx/sites-available/bemfst`
- file `/etc/nginx/sites-available/mataf-fst`
- snapshot config penuh `nginx -T`

Contoh command manual:

```bash
mysqldump -u bem_user -p -h 127.0.0.1 bem_fst_prod > /root/backup-bem_fst_prod-$(date +%F).sql
cp /opt/apps/full-web-bem-fst/backend-nest/.env /root/backend-env-$(date +%F).backup
cp -r /opt/apps/full-web-bem-fst/backend-nest/uploads /root/uploads-backup-$(date +%F)
cp /etc/nginx/sites-available/bemfst /root/bemfst-nginx-$(date +%F).backup
cp /etc/nginx/sites-available/mataf-fst /root/mataf-fst-nginx-$(date +%F).backup
nginx -T > /root/nginx-full-$(date +%F).conf
```

## 14. Operasional Harian

```bash
pm2 status
pm2 logs bem-api --lines 100
systemctl status nginx --no-pager
curl -I https://bemfst.unisayogya.ac.id
curl -I https://bemfst.unisayogya.ac.id/api/v1/posts
```

## 15. Catatan Migrasi

Migrasi dari testing ke production domain BEM sudah selesai dengan status:

- frontend production pindah dari `/bem-test` ke root domain `bemfst`
- config Nginx `bemfst` dipisah dari `mataf`
- route `/bem-test`, `/api`, dan `/uploads` pada domain `mataf` sudah dibersihkan
- domain `mataf` kembali fokus untuk website `mataf`

Dokumen konsep arsitektur final tetap mengacu ke:

- `PRODUCTION_CONCEPT_BEMFST_DOMAIN.md`

## 16. Status Saat Dokumen Ini Diperbarui

- Domain production BEM: aktif
- HTTPS `bemfst.unisayogya.ac.id`: aktif
- Frontend root domain: `200 OK`
- API `/api/v1/posts`: `200 OK`
- Console browser: bersih dari warning CSP/Iconify yang sebelumnya muncul
- Metadata SEO publik production: sudah diarahkan ke domain `bemfst`
- Hardening login dasar: aktif
- Backup config Nginx production: sudah dilakukan
