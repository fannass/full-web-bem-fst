<div align="center">

# 🎓 BEM FST UNISA — Full-Stack Web Application

**Platform digital resmi Badan Eksekutif Mahasiswa Fakultas Sains & Teknologi**  
Universitas Islam Al-Syafi'iyah (UNISA)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![MUI](https://img.shields.io/badge/MUI-v7-007FFF?style=flat-square&logo=mui)](https://mui.com)

</div>

---

## 📋 Daftar Isi

- [🌟 Tentang Project](#-tentang-project)
- [🏗️ Arsitektur Sistem](#️-arsitektur-sistem)
- [📁 Struktur Direktori](#-struktur-direktori)
- [⚙️ Prasyarat](#️-prasyarat)
- [🚀 Cara Menjalankan (Pertama Kali)](#-cara-menjalankan-pertama-kali)
- [🎛️ Panel Admin](#️-panel-admin)
- [📡 API Reference](#-api-reference)
- [🧩 Konsep Backend (NestJS)](#-konsep-backend-nestjs)
- [🖥️ Konsep Frontend (React)](#️-konsep-frontend-react)
- [🗃️ Database Schema](#️-database-schema)
- [🔧 Environment Variables](#-environment-variables)
- [📦 Scripts yang Tersedia](#-scripts-yang-tersedia)

---

## 🌟 Tentang Project

Website ini adalah platform digital lengkap untuk **BEM FST UNISA** yang mencakup:

| Fitur | Deskripsi |
|-------|-----------|
| 📰 **Berita & Event** | Publikasi berita dan kegiatan BEM |
| 🏛️ **Kabinet** | Struktur organisasi + foto anggota |
| 📅 **Periode** | Manajemen periode kepengurusan |
| 🏢 **Profil Organisasi** | Info kontak dan media sosial BEM |
| 🔐 **Admin Dashboard** | Panel pengelolaan konten berbasis role |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                        │
│   ┌─────────────────────────────────────────┐   │
│   │         React 19 + Vite 6               │   │
│   │   (frontend/ — port 3001 saat dev)      │   │
│   └──────────────┬──────────────────────────┘   │
│                  │ HTTP /api/v1/*                │
│   ┌──────────────▼──────────────────────────┐   │
│   │       NestJS REST API Server            │   │
│   │   (backend-nest/ — port 3000)           │   │
│   └──────────────┬──────────────────────────┘   │
│                  │ Prisma ORM                    │
│   ┌──────────────▼──────────────────────────┐   │
│   │          MySQL Database                 │   │
│   │      (coba_tem_admin)                   │   │
│   └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

> Vite dev-server mem-**proxy** semua request `/api/*` ke NestJS di port 3000, sehingga tidak ada masalah CORS saat development.

---

## 📁 Struktur Direktori

```
fullstack bem fst/
├── backend-nest/           ← NestJS REST API
│   ├── prisma/
│   │   └── schema.prisma   ← Definisi tabel database
│   ├── src/
│   │   ├── main.ts         ← Entry point server
│   │   ├── app.module.ts   ← Root module
│   │   ├── config/
│   │   │   └── prisma.service.ts
│   │   ├── common/
│   │   │   ├── guards/     ← JwtGuard (autentikasi)
│   │   │   └── interceptors/
│   │   └── modules/
│   │       ├── auth/       ← Login & JWT
│   │       ├── cabinet/    ← Anggota + Divisi + Kabinet
│   │       ├── organization/← Profil organisasi
│   │       ├── periods/    ← Periode kepengurusan
│   │       └── posts/      ← Berita & Event
│   └── uploads/            ← File foto yang diupload
│
├── frontend/               ← React + Vite SPA
│   ├── pages/
│   │   ├── Home.tsx        ← Halaman beranda
│   │   ├── About.tsx       ← Tentang BEM
│   │   ├── Cabinet.tsx     ← Struktur organisasi publik
│   │   ├── Posts.tsx       ← Daftar berita
│   │   └── admin/          ← Semua halaman admin
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminCabinet.tsx  ← Kelola anggota/divisi/kabinet
│   │       ├── AdminPosts.tsx
│   │       ├── AdminPeriods.tsx
│   │       └── AdminOrganization.tsx
│   ├── components/         ← Komponen reusable
│   ├── services/
│   │   └── api.ts          ← Semua pemanggilan API terpusat
│   ├── context/            ← React Context (Auth, Theme)
│   └── vite.config.ts      ← Konfigurasi proxy dev
│
└── README.md               ← Dokumen ini
```

---

## ⚙️ Prasyarat

Pastikan software berikut sudah terinstall:

| Software | Versi Minimum | Link Download |
|----------|--------------|---------------|
| **Node.js** | v18+ | https://nodejs.org |
| **npm** | v9+ | (bundled dengan Node.js) |
| **MySQL** | v8+ | https://dev.mysql.com/downloads/ |
| **Git** | Terbaru | https://git-scm.com |

---

## 🚀 Cara Menjalankan (Pertama Kali)

### Langkah 1 — Clone Repository

```bash
git clone https://github.com/fannass/full-web-bem-fst.git
cd full-web-bem-fst
```

---

### Langkah 2 — Setup Database MySQL

1. Buka MySQL dan buat database baru:

```sql
CREATE DATABASE coba_tem_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Pastikan user MySQL kamu punya akses penuh ke database tersebut.

---

### Langkah 3 — Setup Backend

```bash
cd backend-nest
```

**Install dependencies:**
```bash
npm install
```

**Buat file environment:**
```bash
# Buat file .env di folder backend-nest/
```

Isi file `.env`:
```env
DATABASE_URL="mysql://root:password@127.0.0.1:3306/coba_tem_admin"
JWT_SECRET="rahasia-jwt-ganti-dengan-string-panjang"
PORT=3000
CORS_ORIGIN="http://localhost:3001"
```

> ⚠️ Ganti `root` dan `password` sesuai kredensial MySQL kamu.

**Jalankan migrasi database:**
```bash
npx prisma migrate deploy
# atau jika menggunakan push langsung:
npx prisma db push
```

**Seed data awal (opsional):**
```bash
npx prisma db seed
```

**Build dan jalankan backend:**
```bash
npm run build
node dist/main.js
```

✅ Backend berjalan di `http://localhost:3000`

---

### Langkah 4 — Setup Frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend berjalan di `http://localhost:3001`

---

### Langkah 5 — Buka di Browser

| URL | Keterangan |
|-----|------------|
| `http://localhost:3001/` | Website publik |
| `http://localhost:3001/#/admin` | Login admin |

---

### 🔑 Login Admin Default

```
Username: admin
Password: admin123
```

> Ubah password setelah pertama kali login melalui database atau endpoint PUT `/api/v1/auth/profile`.

---

## 🎛️ Panel Admin

Setelah login, kamu bisa mengelola:

| Menu | Path | Fungsi |
|------|------|--------|
| 📊 Dashboard | `/admin` | Ringkasan statistik |
| 📰 Berita & Event | `/admin/posts` | CRUD berita/event + unggah gambar |
| 👥 Kabinet | `/admin/cabinet` | Kelola anggota, divisi, dan kabinet |
| 📅 Periode | `/admin/periods` | Atur periode kepengurusan aktif |
| 🏢 Organisasi | `/admin/organization` | Edit profil + media sosial BEM |

---

## 📡 API Reference

Base URL: `http://localhost:3000/api/v1`

### 🔐 Auth
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| `POST` | `/auth/login` | ❌ | Login, mendapat JWT token |

### 📰 Posts
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| `GET` | `/posts` | ❌ | Daftar berita (paginated) |
| `GET` | `/posts/slug/:slug` | ❌ | Detail berita |
| `POST` | `/posts` | ✅ | Buat berita baru |
| `PUT` | `/posts/:id` | ✅ | Update berita |
| `DELETE` | `/posts/:id` | ✅ | Hapus berita |

### 🏛️ Cabinet
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| `GET` | `/cabinet` | ❌ | Semua kabinet |
| `POST` | `/cabinet` | ✅ | Buat kabinet baru |
| `PUT` | `/cabinet/:id` | ✅ | Update kabinet |
| `DELETE` | `/cabinet/:id` | ✅ | Hapus kabinet (cascade) |
| `GET` | `/cabinet/members/list` | ❌ | Semua anggota |
| `POST` | `/cabinet/members` | ✅ | Tambah anggota |
| `PUT` | `/cabinet/members/:id` | ✅ | Update anggota |
| `DELETE` | `/cabinet/members/:id` | ✅ | Hapus anggota |
| `GET` | `/cabinet/divisions` | ❌ | Semua divisi |
| `POST` | `/cabinet/divisions` | ✅ | Buat divisi |
| `PUT` | `/cabinet/divisions/:id` | ✅ | Update divisi |
| `DELETE` | `/cabinet/divisions/:id` | ✅ | Hapus divisi |

### 📅 Periods
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| `GET` | `/periods` | ❌ | Semua periode |
| `POST` | `/periods` | ✅ | Buat periode |
| `PUT` | `/periods/:id` | ✅ | Update periode |
| `DELETE` | `/periods/:id` | ✅ | Hapus periode |

### 🏢 Organization
| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| `GET` | `/organization` | ❌ | Info organisasi |
| `PUT` | `/organization/:id` | ✅ | Update info organisasi |

> 🔒 Endpoint bertanda ✅ membutuhkan header: `Authorization: Bearer <token>`

---

## 🧩 Konsep Backend (NestJS)

Backend menggunakan **NestJS** — framework Node.js berbasis TypeScript yang terinspirasi Angular. Berikut konsep-konsep utamanya:

### 📦 Module
Setiap fitur dibungkus dalam sebuah **Module**. Contoh: `CabinetModule`, `PostsModule`, `PeriodsModule`. Module mendefinisikan apa saja yang diekspose ke modul lain.

```
modules/
├── auth/           ← AuthModule
├── cabinet/        ← CabinetModule
├── organization/   ← OrganizationModule
├── periods/        ← PeriodsModule
└── posts/          ← PostsModule
```

### 🎮 Controller
**Controller** menerima HTTP request dan mengembalikan response. Contoh:

```typescript
@Get('members/list')        // GET /api/v1/cabinet/members/list
async getAllMembers() {
  return { success: true, data: await this.cabinetService.getAllMembers() };
}
```

### 🔧 Service
**Service** berisi business logic. Controller hanya meneruskan ke service, service yang berkomunikasi dengan database via Prisma.

### 🛡️ Guard (JwtGuard)
**Guard** memproteksi endpoint agar hanya bisa diakses dengan JWT token yang valid. Ditambahkan dengan decorator `@UseGuards(JwtGuard)`.

### 🗄️ Prisma ORM
**Prisma** adalah ORM modern yang menghasilkan TypeScript client dari skema database. Query database dilakukan seperti ini:

```typescript
// Mengambil semua anggota beserta relasi divisi dan kabinet
const members = await this.prisma.members.findMany({
  include: { divisions: { include: { cabinets: true } } },
  orderBy: { order: 'asc' },
});
```

### 🔄 BigInt Interceptor
Database menggunakan `BigInt` untuk ID (karena pakai `@db.UnsignedBigInt`). Karena `BigInt` tidak bisa di-JSON-serialize secara langsung, ada `BigIntInterceptor` global yang mengkonversinya ke `String` secara otomatis di setiap response.

---

## 🖥️ Konsep Frontend (React)

Frontend menggunakan **React 19** dengan **Vite** sebagai build tool dan **Material UI v7** sebagai design system.

### 🧭 HashRouter
Menggunakan `HashRouter` (bukan `BrowserRouter`) sehingga URL berbentuk `/#/admin/cabinet`. Ini memudahkan deployment di static hosting tanpa perlu konfigurasi server-side routing.

### 🌐 API Service (`api.ts`)
Semua pemanggilan HTTP dikentralisasi di satu file `services/api.ts`. Komponen tidak pernah memanggil `fetch()` langsung — selalu lewat `api.metodeTertentu()`.

```typescript
// Contoh pemanggilan API di komponen
const members = await api.getAllMembersAdmin();
```

### 🔒 Protected Route
Halaman admin dibungkus `<ProtectedRoute>` yang memeriksa apakah admin sudah login (JWT token tersimpan di `localStorage`). Jika belum, redirect ke `/admin/login`.

### 🎨 Theme (Dark/Light Mode)
`ThemeContext` menyimpan preferensi tema dan meng-apply class `dark` ke `<html>`. Semua styling menggunakan Tailwind CSS dengan variant `dark:`.

### 📦 Context
| Context | Fungsi |
|---------|--------|
| `AdminAuthContext` | Menyimpan token JWT, user info, fungsi logout |
| `ThemeContext` | Toggle dark/light mode |

### 🏗️ Struktur Komponen Admin
```
AdminLayout (wrapper)
└── AdminSidebar (navigasi kiri)
└── Header (user avatar + topbar)
└── [konten halaman]
    ├── AdminDashboard
    ├── AdminCabinet (Anggota | Departemen | Kabinet)
    ├── AdminPosts
    ├── AdminPeriods
    └── AdminOrganization
```

---

## 🗃️ Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   periods    │     │   cabinets   │     │  divisions   │
│──────────────│     │──────────────│     │──────────────│
│ id (PK)      │◄────│ period_id    │◄────│ cabinet_id   │
│ name         │     │ name         │     │ name         │
│ year_start   │     │ tagline      │     │ description  │
│ year_end     │     │ vision       │     │ order        │
│ is_active    │     │ mission      │     └──────┬───────┘
│ description  │     └──────────────┘            │
└──────────────┘                                 │
                                        ┌────────▼──────┐
┌──────────────┐                        │    members    │
│ organizations│                        │───────────────│
│──────────────│                        │ division_id   │
│ name         │                        │ name          │
│ description  │                        │ position      │
│ address      │                        │ prodi         │
│ email        │                        │ photo         │
│ phone        │                        │ order         │
│ social_media │                        └───────────────┘
└──────────────┘

┌──────────────┐
│    posts     │
│──────────────│
│ title        │
│ slug         │
│ excerpt      │
│ content      │
│ category     │
│ featured_img │
│ published_at │
└──────────────┘
```

---

## 🔧 Environment Variables

### backend-nest/.env

```env
# Database
DATABASE_URL="mysql://USERNAME:PASSWORD@127.0.0.1:3306/coba_tem_admin"

# JWT
JWT_SECRET="string-panjang-acak-minimal-32-karakter"

# Server
PORT=3000
CORS_ORIGIN="http://localhost:3001"
```

### frontend/.env (opsional)

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 📦 Scripts yang Tersedia

### Backend (`cd backend-nest`)

```bash
npm run build      # Compile TypeScript → JavaScript (dist/)
npm run start      # Jalankan dengan ts-node (development)
npm run start:dev  # Jalankan dengan hot-reload (nodemon)
node dist/main.js  # Jalankan dari hasil build (production-style)
npx prisma studio  # Buka GUI database Prisma
npx prisma db push # Sinkronkan schema ke database
```

### Frontend (`cd frontend`)

```bash
npm run dev        # Jalankan dev server (port 3001, hot-reload)
npm run build      # Build production ke folder dist/
npm run preview    # Preview hasil build production
```

---

## 🤝 Kontribusi & Pengembangan

### Menambah Endpoint Baru (Backend)
1. Buat folder baru di `src/modules/namafitur/`
2. Buat `namafitur.module.ts`, `namafitur.service.ts`, `namafitur.controller.ts`
3. Daftarkan module di `app.module.ts`
4. Tambahkan method baru di `frontend/services/api.ts`

### Menambah Halaman Admin Baru (Frontend)
1. Buat file baru di `frontend/pages/admin/AdminNamaHalaman.tsx`
2. Import dan tambahkan route di `frontend/App.tsx`
3. Tambahkan menu item di `frontend/components/AdminSidebar.tsx`

---

## 🐛 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Cannot connect to database` | Cek `DATABASE_URL` di `.env`, pastikan MySQL aktif |
| `Port 3000 already in use` | `npx kill-port 3000` atau restart PC |
| `401 Unauthorized` di API | Token expired, login ulang di `/admin/login` |
| Anggota tidak muncul di admin | Pastikan backend sudah di-rebuild dan dijalankan ulang |
| `Module not found` | Jalankan `npm install` di folder yang bersangkutan |

---

<div align="center">

**BEM FST UNISA** · Fakultas Sains & Teknologi · Universitas Islam Al-Syafi'iyah

*Built with ❤️ using React + NestJS + Prisma*

</div>
