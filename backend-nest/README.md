# NestJS Backend - BEM FST UNISA

Backend API untuk BEM FST UNISA menggunakan NestJS, Prisma, dan MySQL.

## Setup

### 1. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Setup environment variables
Copy `.env.example` ke `.env` dan sesuaikan nilai database:
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` dengan konfigurasi database Anda:
\`\`\`
DATABASE_URL="mysql://user:password@localhost:3306/bem_fst"
JWT_SECRET=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
\`\`\`

### 3. Setup Prisma dengan existing database
\`\`\`bash
# Introspect existing MySQL database
npx prisma db pull

# Generate Prisma Client
npx prisma generate
\`\`\`

### 4. Run development server
\`\`\`bash
npm run start:dev
\`\`\`

Server akan berjalan di `http://localhost:3000`

## API Endpoints

### Authentication
- **POST** `/api/v1/auth/login` - Login (hardcoded admin)

### Posts (Public)
- **GET** `/api/v1/posts` - Get all posts (paginated)
- **GET** `/api/v1/posts/:id` - Get post by ID
- **GET** `/api/v1/posts/slug/:slug` - Get post by slug

### Posts (Admin - Protected)
- **POST** `/api/v1/posts` - Create post (with file upload)
- **PATCH** `/api/v1/posts/:id` - Update post (with file upload)
- **DELETE** `/api/v1/posts/:id` - Delete post

### Cabinet
- **GET** `/api/v1/cabinet` - Get all cabinets
- **GET** `/api/v1/cabinet/current` - Get current cabinet
- **GET** `/api/v1/cabinet/:id` - Get cabinet by ID
- **GET** `/api/v1/cabinet/members/list` - Get all members
- **GET** `/api/v1/cabinet/members/:id` - Get member by ID

### Organization
- **GET** `/api/v1/organization` - Get organization
- **GET** `/api/v1/organization/:id` - Get organization by ID

## File Upload

Featured images dapat diupload dengan form-data:
- Max size: 5MB
- Allowed types: JPEG, PNG, GIF, WebP
- Stored at: `/uploads/posts/`

## Database

Using Prisma ORM dengan MySQL. Database schema dapat dilihat di `prisma/schema.prisma`.

## Testing

\`\`\`bash
# Run tests
npm run test

# Run e2e tests
npm run test:e2e
\`\`\`

## Production Build

\`\`\`bash
npm run build
npm run start:prod
\`\`\`

## Deployment

Untuk deploy ke production:

1. Build aplikasi
   \`\`\`bash
   npm run build
   \`\`\`

2. Setup environment variables di server

3. Run dengan PM2
   \`\`\`bash
   pm2 start dist/main.js --name "bem-fst-api"
   \`\`\`

## Troubleshooting

### Database connection error
- Pastikan MySQL running
- Check DATABASE_URL di .env
- Pastikan user & password sudah benar

### Prisma Client error
- Run: \`npx prisma generate\`
- Run: \`npx prisma db push\`

### JWT token error
- Set JWT_SECRET yang kuat di .env
- Pastikan token dikirim di Authorization header: \`Bearer <token>\`
