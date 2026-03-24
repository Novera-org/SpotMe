<div align="center">

# 📸 SpotMe

**AI-Powered Photo Finder for Events**

Find yourself in hundreds of event photos — just upload a selfie.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-Package%20Manager-f9f1e1?logo=bun)](https://bun.sh/)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

</div>

---

## What is SpotMe?

**SpotMe** is a SaaS platform that connects event photographers with attendees. Photographers upload bulk event photos, share albums via QR codes or links, and attendees instantly find their own photos using AI face recognition — no scrolling through hundreds of images required.

### How It Works

```
1. 📤  Admin uploads event photos to an album
2. 🔗  Admin shares album via QR code or link
3. 🤳  User uploads a selfie
4. 🤖  AI matches the selfie against all album photos
5. 📥  User downloads their matched photos
```

### Use Cases

- 🎊 **Weddings** — Guests find their photos without bugging the photographer
- 🎤 **Conferences** — Attendees grab their session photos instantly
- 🎓 **School Events** — Parents find their kids in graduation photos
- 🏢 **Corporate Events** — Employees get their team-building photos fast

---

## Tech Stack

| Layer               | Technology                                                         |
| ------------------- | ------------------------------------------------------------------ |
| **Framework**       | [Next.js 16](https://nextjs.org/) (App Router, Turbopack)          |
| **Language**        | TypeScript (strict mode)                                           |
| **Package Manager** | [Bun](https://bun.sh/)                                             |
| **Auth**            | [Better Auth](https://www.better-auth.com/)                        |
| **Database**        | [Neon](https://neon.tech/) (Serverless PostgreSQL)                 |
| **ORM**             | [Drizzle ORM](https://orm.drizzle.team/)                           |
| **Validation**      | [Zod](https://zod.dev/)                                            |
| **Storage**         | [Cloudflare R2](https://developers.cloudflare.com/r2/)             |
| **AI**              | [Hugging Face Spaces](https://huggingface.co/spaces) (InsightFace) |
| **Styling**         | [Tailwind CSS](https://tailwindcss.com/)                           |
| **Deployment**      | [Vercel](https://vercel.com/)                                      |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Node.js](https://nodejs.org/) (v20.9+)
- [Neon](https://neon.tech/) account (free tier works)
- [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket

### Installation

```bash
# Clone the repository
git clone https://github.com/Novera-org/SpotMe.git
cd SpotMe

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local
```

### Configure Environment

Edit `.env.local` with your credentials:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Cloudflare R2
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=spotme
R2_PUBLIC_URL=https://your-bucket.r2.dev

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SpotMe
```

### Database Setup

```bash
# Push schema to database
bun run db:push

# Or generate and run migrations
bun run db:generate
bun run db:migrate
```

### Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Available Scripts

| Script      | Command               | Description                          |
| ----------- | --------------------- | ------------------------------------ |
| Dev server  | `bun run dev`         | Start development server (Turbopack) |
| Build       | `bun run build`       | Build for production                 |
| Start       | `bun run start`       | Start production server              |
| Lint        | `bun run lint`        | Run ESLint                           |
| DB Generate | `bun run db:generate` | Generate Drizzle migrations          |
| DB Migrate  | `bun run db:migrate`  | Run database migrations              |
| DB Push     | `bun run db:push`     | Push schema directly (dev only)      |
| DB Studio   | `bun run db:studio`   | Open Drizzle Studio GUI              |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Sign-in / Sign-up pages
│   ├── album/              # Public album & results pages
│   ├── api/                # API routes (auth, QR codes, cron)
│   └── dashboard/          # Admin dashboard & album management
├── actions/                # Server actions (mutations)
├── components/             # React components
│   ├── albums/             # Album-related components
│   ├── images/             # Upload & gallery components
│   ├── search/             # Selfie upload & results components
│   ├── shared/             # Shared components
│   └── ui/                 # Base UI components
├── config/                 # App constants & configuration
├── hooks/                  # Custom React hooks
├── lib/                    # Core libraries
│   ├── ai/                 # AI service interface & mock
│   ├── auth/               # Better Auth config & helpers
│   ├── db/                 # Drizzle ORM setup & schemas
│   ├── storage/            # Cloudflare R2 client & upload utils
│   └── validations/        # Zod validation schemas
└── types/                  # Shared TypeScript types
```

---

## Features

- [x] **Project foundation** — Next.js 16, Bun, TypeScript, Tailwind
- [x] **Database schema** — 17 tables across 6 groups with Drizzle ORM
- [x] **Authentication** — Email/password auth with Better Auth & role-based access
- [x] **Guest system** — Anonymous users with session cookies & merge-on-signup
- [x] **Album management** — CRUD, settings, share links, QR code generation
- [x] **Image upload** — Bulk upload to Cloudflare R2 with presigned URLs & progress tracking
- [x] **Search & matching** — Selfie upload, AI face matching, results display
- [ ] **Analytics** — Download tracking, activity logging, admin dashboard stats
- [ ] **Landing page** — Marketing page with dark theme & glassmorphism UI

---

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNovera-org%2FSpotMe)

Or deploy manually:

```bash
bun run build
bun run start
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Novera](https://github.com/Novera-org)**

</div>
