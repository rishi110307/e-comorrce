# e-comorrce (Next.js + Prisma + Stripe starter)

This repository was scaffolded with a minimal Next.js fullstack starter using:

- Next.js (React)
- TypeScript
- Prisma (PostgreSQL)
- Stripe (integration points/stubs)
- Tailwind can be added later

What's included
- Basic Next.js frontend pages (product list) that call a simple API route
- API stubs in /pages/api including an auth stub and products endpoint
- Prisma schema (models for User, Product, Category, Order, OrderItem)
- Seed script to populate example products (prisma/seed.ts)
- .env.example with required env vars

Quick start
1. Copy .env.example to .env and set DATABASE_URL and other secrets.
2. Install dependencies: npm install
3. Generate Prisma client: npx prisma generate
4. Run Prisma migrate or use prisma db push, then seed: npx prisma db push && npx ts-node prisma/seed.ts
5. Start dev server: npm run dev

I created this scaffold on branch `scaffold/nextjs-prisma`.

Next steps I can do for you now:
- Wire Prisma queries into the API routes and the product list page
- Add NextAuth.js for authentication (email/password or OAuth)
- Add Stripe checkout flow and a demo checkout page
- Add admin dashboard pages to manage products

Tell me which of the next steps you want me to implement first and I'll continue.
