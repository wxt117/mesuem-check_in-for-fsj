# Museum Check-in

Next.js full-stack web app for museum QR check-ins. Visitors scan a painting QR code, choose an Emoji, add a comment, and generate a personal visit summary with DeepSeek.

## Local Development

Local development still uses SQLite so the current phone testing flow stays simple.

```powershell
npm install
Copy-Item .env.example .env
npm run prisma:migrate -- --name init
npm run db:seed
npm run dev -- --hostname 0.0.0.0
```

For phone testing, set `NEXT_PUBLIC_APP_URL` in `.env` to your computer LAN address, for example:

```env
NEXT_PUBLIC_APP_URL="http://192.168.1.180:3000"
```

## Vercel + Neon

This repo includes a separate PostgreSQL Prisma schema for deployment:

```text
prisma-postgres/schema.prisma
prisma-postgres/migrations/
```

Vercel uses `vercel.json`, whose build command runs:

```text
npm run vercel-build
```

That command does:

```text
prisma generate --schema prisma-postgres/schema.prisma
prisma migrate deploy --schema prisma-postgres/schema.prisma
next build
```

It does not seed on every deployment, so production admin edits are not overwritten.

### Neon Setup

Create a Neon project and copy connection strings into Vercel environment variables.

Use these variables in Vercel:

```env
DATABASE_URL="postgresql://...neon.tech/...?sslmode=require"
DIRECT_URL="postgresql://...neon.tech/...?sslmode=require"
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
DEEPSEEK_API_KEY="sk-your-deepseek-key"
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-v4-flash"
```

If Neon gives you both pooled and direct connection strings, use:

```text
DATABASE_URL = pooled connection string
DIRECT_URL   = direct/non-pooled connection string
```

After the first successful deployment, open:

```text
https://your-vercel-domain.vercel.app/admin/exhibits
```

If the database is empty, run the seed once against Neon:

```powershell
$env:DATABASE_URL="postgresql://..."
$env:DIRECT_URL="postgresql://..."
npm run postgres:seed
```

Then regenerate QR codes so they point to the public Vercel URL instead of your local LAN IP.

## Routes

- `/` visitor painting grid
- `/e/[slug]` QR landing page for a painting
- `/summary` visitor summary page
- `/admin/exhibits` exhibit admin
- `/admin/exhibits/[id]/qr` QR generation page

## Security Before Public Use

The current admin area is open. Before a real public launch, add administrator login to protect:

```text
/admin/*
```

Do not commit `.env` or any API keys.
