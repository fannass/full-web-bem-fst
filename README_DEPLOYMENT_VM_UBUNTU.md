# Deployment Guide (Testing) - BEM FST

Dokumen ini berisi panduan deployment yang sudah terbukti berjalan untuk project BEM FST pada server Ubuntu VM (Proxmox), menggunakan Nginx + PM2 + MySQL.

Dokumen dibuat untuk kebutuhan operasional tim, dengan user PIC: Frenky.

## 1. Ringkasan Kondisi Deployment

- Environment target: Ubuntu 24.04 LTS (VM Proxmox)
- Domain: https://mataf-fst.unisayogya.ac.id
- Mode testing app BEM: https://mataf-fst.unisayogya.ac.id/bem-test/
- Backend API public path: https://mataf-fst.unisayogya.ac.id/api/v1
- Backend internal bind: http://127.0.0.1:3000
- Process manager backend: PM2
- Database: MySQL lokal VM
- Existing website lama tetap dipertahankan di root domain (/)

## 2. Arsitektur Singkat

- Frontend React (Vite build) disajikan oleh Nginx dari folder statis `/var/www/bem-test`.
- Backend NestJS berjalan di PM2 pada port 3000.
- Nginx reverse proxy:
  - `/api/` -> `http://127.0.0.1:3000/api/`
  - `/uploads/` -> `http://127.0.0.1:3000/uploads/`
- Frontend testing diakses via `/bem-test/`.

## 3. Prasyarat Server

Pastikan hal berikut tersedia:

- Nginx aktif
- SSL domain valid (certbot)
- Node.js + npm
- PM2
- MySQL server + client
- Git

Contoh cek cepat:

```bash
nginx -v
systemctl status nginx --no-pager
node -v
npm -v
pm2 -v
git --version
mysql --version
```

## 4. Setup Database MySQL

Masuk MySQL:

```bash
mysql
```

Buat database dan user khusus app:

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

## 5. Clone Repository

```bash
mkdir -p /opt/apps
cd /opt/apps
git clone https://github.com/fannass/full-web-bem-fst.git
cd /opt/apps/full-web-bem-fst
```

## 6. Konfigurasi Backend (.env)

Lokasi file env:

- `/opt/apps/full-web-bem-fst/backend-nest/.env`

Contoh isi untuk testing:

```env
DATABASE_URL="mysql://bem_user:GANTI_PASSWORD_DB@127.0.0.1:3306/bem_fst_prod"
JWT_SECRET="GANTI_DENGAN_SECRET_RANDOM_PANJANG"
JWT_EXPIRES_IN=8h
PORT=3000
NODE_ENV=production
ADMIN_USERNAME=svc_core
ADMIN_PASSWORD=BemTest12345
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp
CORS_ORIGIN=https://mataf-fst.unisayogya.ac.id
FRONTEND_URL=https://mataf-fst.unisayogya.ac.id/bem-test
```

Catatan penting:

- Jangan commit file `.env` ke GitHub.
- Untuk password dengan karakter spesial, verifikasi parsing env dengan test login API.

## 7. Build dan Jalankan Backend

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

Verifikasi backend lokal:

```bash
curl -I http://127.0.0.1:3000/api/v1/posts
```

## 8. Build dan Publish Frontend

Penting: karena app dipasang di subpath `/bem-test`, build harus pakai base path.

```bash
cd /opt/apps/full-web-bem-fst/frontend
npm install
npm run build -- --base=/bem-test/
mkdir -p /var/www/bem-test
rm -rf /var/www/bem-test/*
cp -r dist/* /var/www/bem-test/
```

## 9. Konfigurasi Nginx (Domain Existing)

File config domain:

- `/etc/nginx/sites-available/mataf-fst`

Contoh konfigurasi yang digunakan:

```nginx
server {
    listen 80;
    server_name mataf-fst.unisayogya.ac.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name mataf-fst.unisayogya.ac.id;

    root /var/www/mataf-fst/current;
    index index.html;

    location = /beranda {
        rewrite ^ /index.html break;
    }

    location = /bem-test {
        return 301 /bem-test/;
    }

    location /bem-test/ {
        alias /var/www/bem-test/;
        try_files $uri $uri/ /bem-test/index.html;
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

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    location ~ ^/[0-9][0-9][0-9][0-9]/ {
        root /var/www/mataf-fst;
        index index.html;
    }

    ssl_certificate /etc/letsencrypt/live/mataf-fst.unisayogya.ac.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mataf-fst.unisayogya.ac.id/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

Apply config:

```bash
nginx -t
systemctl reload nginx
```

## 10. Verifikasi Deployment

Uji endpoint:

```bash
curl -I https://mataf-fst.unisayogya.ac.id/bem-test/
curl -I https://mataf-fst.unisayogya.ac.id/api/v1/posts
```

Harapan hasil:

- `/bem-test/` -> 200 OK
- `/api/v1/posts` -> 200 OK

## 11. Troubleshooting yang Sudah Terjadi

### 11.1 Logo/gambar tidak muncul di subpath /bem-test

Gejala:

- Gambar tampil broken, alt text muncul.

Penyebab:

- Path asset masih absolut (`/assets/...`) sehingga tidak kompatibel dengan base path `/bem-test`.

Solusi:

- Ubah source path asset menjadi berbasis `import.meta.env.BASE_URL`.
- Rebuild frontend dengan `--base=/bem-test/`.
- Publish ulang folder `dist`.

### 11.2 Login admin 401 Unauthorized

Gejala:

- API login mengembalikan 401.

Penyebab yang ditemukan:

- Kredensial yang dikirim tidak sesuai env backend.
- Command test sempat menggunakan placeholder.

Solusi yang tervalidasi:

```bash
curl -s -X POST https://mataf-fst.unisayogya.ac.id/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"svc_core","password":"BemTest12345"}'
```

Jika sukses, response berisi `success: true` dan `access_token`.

## 12. SOP Update Aplikasi (Setelah Ada Commit Baru)

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
cd /opt/apps/full-web-bem-fst/frontend
npm install
npm run build -- --base=/bem-test/
rm -rf /var/www/bem-test/*
cp -r dist/* /var/www/bem-test/
nginx -t
systemctl reload nginx
```

## 13. Operasional Harian

Cek status service:

```bash
pm2 status
pm2 logs bem-api --lines 100
systemctl status nginx --no-pager
```

Backup dasar:

- Backup database `bem_fst_prod`
- Backup file `/opt/apps/full-web-bem-fst/backend-nest/.env`
- Backup file `/etc/nginx/sites-available/mataf-fst`
- Backup folder upload `/opt/apps/full-web-bem-fst/backend-nest/uploads`

## 14. Catatan Keamanan

- Ganti password admin testing sebelum go-live.
- Gunakan JWT secret panjang dan acak.
- Batasi akses SSH, pertimbangkan menyalakan firewall sesuai policy kampus.
- Jangan gunakan kredensial root database untuk aplikasi.

## 15. Status Saat Dokumen Ini Dibuat

- Backend PM2: online
- API endpoint `/api/v1/posts`: 200
- Frontend testing `/bem-test/`: 200
- Login API admin: sukses dengan user aktif di env

---

Jika nanti ingin dipindah dari mode testing (`/bem-test`) ke production penuh di root/subdomain khusus, cukup sesuaikan base path frontend, env `FRONTEND_URL`, dan mapping location Nginx.

## 16. Runbook Kronologis (Command dari Clone Sampai Fix Error)

Bagian ini adalah urutan command praktis yang sudah dipakai pada proses deployment/testing ini.

### 16.1 Clone Repository

```bash
mkdir -p /opt/apps
cd /opt/apps
git clone https://github.com/fannass/full-web-bem-fst.git
cd /opt/apps/full-web-bem-fst
```

### 16.2 Setup Backend dan Environment

```bash
cd /opt/apps/full-web-bem-fst/backend-nest
cp .env.example .env
nano .env
```

Isi `.env` (contoh testing yang dipakai):

```env
DATABASE_URL="mysql://bem_user:GANTI_PASSWORD_DB@127.0.0.1:3306/bem_fst_prod"
JWT_SECRET="GANTI_DENGAN_SECRET_RANDOM_PANJANG"
JWT_EXPIRES_IN=8h
PORT=3000
NODE_ENV=production
ADMIN_USERNAME=svc_core
ADMIN_PASSWORD=BemTest12345
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp
CORS_ORIGIN=https://mataf-fst.unisayogya.ac.id
FRONTEND_URL=https://mataf-fst.unisayogya.ac.id/bem-test
```

### 16.3 Build Backend dan Start PM2

```bash
cd /opt/apps/full-web-bem-fst/backend-nest
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 start dist/main.js --name bem-api
pm2 save
pm2 startup systemd -u root --hp /root
pm2 status
```

Validasi backend:

```bash
curl -I http://127.0.0.1:3000/api/v1/posts
```

### 16.4 Build Frontend untuk Subpath `/bem-test`

```bash
cd /opt/apps/full-web-bem-fst/frontend
npm install
npm run build -- --base=/bem-test/
mkdir -p /var/www/bem-test
rm -rf /var/www/bem-test/*
cp -r dist/* /var/www/bem-test/
```

### 16.5 Pasang Nginx Location untuk Testing

Tambahkan pada server block domain `mataf-fst.unisayogya.ac.id`:

```nginx
location = /bem-test {
    return 301 /bem-test/;
}

location /bem-test/ {
    alias /var/www/bem-test/;
    try_files $uri $uri/ /bem-test/index.html;
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
```

Apply:

```bash
nginx -t
systemctl reload nginx
```

Validasi:

```bash
curl -I https://mataf-fst.unisayogya.ac.id/bem-test/
curl -I https://mataf-fst.unisayogya.ac.id/api/v1/posts
```

### 16.6 Error 1 - Asset/Logo Tidak Muncul

Gejala:

- Logo di navbar/footer/admin/cabinet broken.
- Beberapa gambar slideshow broken saat akses via `/bem-test`.

Akar masalah:

- Path asset hardcoded absolut (`/assets/...`) tidak kompatibel dengan base path subfolder.

Perbaikan source:

- Ubah path gambar agar mengikuti `import.meta.env.BASE_URL`.

File yang diperbaiki:

- `frontend/components/Navbar.tsx`
- `frontend/components/Footer.tsx`
- `frontend/components/logo/logo.tsx`
- `frontend/pages/admin/AdminLogin.tsx`
- `frontend/pages/Cabinet.tsx`
- `frontend/pages/Home.tsx`

Setelah perbaikan source:

```bash
cd /opt/apps/full-web-bem-fst
git pull origin main
cd frontend
npm run build -- --base=/bem-test/
rm -rf /var/www/bem-test/*
cp -r dist/* /var/www/bem-test/
nginx -t
systemctl reload nginx
```

### 16.7 Error 2 - Login Admin 401 Unauthorized

Gejala:

- API login mengembalikan 401.

Diagnosis:

- Kredensial request tidak sesuai env backend (sempat kirim placeholder).

Verifikasi env di server:

```bash
cd /opt/apps/full-web-bem-fst/backend-nest
grep -E "ADMIN_USERNAME|ADMIN_PASSWORD|NODE_ENV" .env
```

Restart backend agar env terbaru terbaca:

```bash
pm2 restart bem-api --update-env
```

Test login API langsung:

```bash
curl -s -X POST https://mataf-fst.unisayogya.ac.id/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"svc_core","password":"BemTest12345"}'
```

Hasil sukses yang diharapkan:

- `success: true`
- Mengandung `access_token`

### 16.8 Quick Checklist Setelah Semua Fix

```bash
pm2 status
pm2 logs bem-api --lines 50
curl -I https://mataf-fst.unisayogya.ac.id/bem-test/
curl -I https://mataf-fst.unisayogya.ac.id/api/v1/posts
```

Jika semua OK:

- Frontend `/bem-test/` -> 200
- API `/api/v1/posts` -> 200
- Login admin menghasilkan token
