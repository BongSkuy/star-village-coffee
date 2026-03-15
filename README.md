# ☕ Star Village Coffee

A modern coffee shop web application with online menu, gallery, and admin dashboard.

![Star Village Coffee](https://github.com/BongSkuy/star-village-coffe/raw/main/public/logo.png)

## ✨ Features

- 🏠 **Homepage** - Hero section, menu categories, gallery preview
- 📋 **Menu Page** - Browse all menu items with category filtering
- 🖼️ **Gallery** - Customer photos and cafe ambiance
- 🔐 **Admin Dashboard** - Manage menu items, categories, gallery, and settings
- 📱 **Responsive Design** - Works on all devices
- 🌙 **Dark Mode** - Automatic theme switching

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM (SQLite for dev, PostgreSQL for production)
- **Authentication**: NextAuth.js
- **Animations**: Framer Motion

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Setup database
bun run db:push
bun run db:seed

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Deployment to Vercel

### Prerequisites

SQLite doesn't work on Vercel (serverless). You need a cloud database:

#### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the connection string

#### Option 2: Supabase (Free tier available)
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings → Database → Connection string
3. Copy the connection string

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   ```
   DATABASE_URL=your_postgres_connection_string
   NEXTAUTH_SECRET=your-random-secret-key
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

4. **Switch to PostgreSQL Schema**
   ```bash
   # Replace the Prisma schema for production
   cp prisma/schema.postgres.prisma prisma/schema.prisma
   ```

5. **Deploy**
   - Vercel will automatically deploy on push to main

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Admin dashboard
│   ├── api/            # API routes
│   ├── gallery/        # Gallery page
│   └── menu/           # Menu page
├── components/          # Reusable React components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
prisma/
├── schema.prisma       # SQLite schema (development)
├── schema.postgres.prisma # PostgreSQL schema (production)
└── seed.ts             # Database seed data
```

## 🔐 Admin Access

Default admin credentials (change in production):
- Email: `admin@starvillage.com`
- Password: `admin123`

## 🌍 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Database connection string |
| `NEXTAUTH_URL` | Your app URL |
| `NEXTAUTH_SECRET` | Random secret for NextAuth |
| `ADMIN_EMAIL` | Admin email (optional) |
| `ADMIN_PASSWORD` | Admin password (optional) |

## 📝 License

MIT License - feel free to use for your own projects!

---

Built with ☕ and ❤️ by [Z.ai](https://chat.z.ai)
# Build triggered
