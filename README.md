# Japastry

Internal inventory and production tracker for Japastry, a small bakery specializing in cinnamon pastries. Tracks raw ingredient stock, baking batches, recipe costs, finished-goods inventory, sales, and low-stock/expiry alerts. Not a customer-facing storefront.

Live at: https://japastry.vercel.app

## Stack

- Next.js (App Router, TypeScript) — UI + server actions, one deployable app
- Postgres (Neon) via Prisma — hosted database, connected through the Vercel Neon integration
- NextAuth (credentials) — two roles: `OWNER` (full access, sees costs/profit) and `STAFF` (production/sales logging, no cost visibility)
- Tailwind CSS
- Deployed on Vercel

See `prisma/schema.prisma` for the data model.

## Local setup

```bash
npm install
npm run db:migrate   # applies Prisma migrations to your DATABASE_URL
npm run db:seed      # creates the initial owner account
npm run dev
```

Local development needs a `DATABASE_URL` (and `DATABASE_URL_UNPOOLED` for migrations) pointing at a Postgres instance — pull the project's Neon credentials with `vercel env pull .env.local`, or point at your own local/branch Postgres.

The seed script prints the owner login (defaults to `owner@japastry.local` / `changeme123` unless `OWNER_EMAIL` / `OWNER_PASSWORD` / `OWNER_NAME` are set). **Sign in, create your own owner account via Staff → Add an account, then remove the seeded one.**

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build and start (build also runs `prisma migrate deploy`)
- `npm run db:migrate` — create/apply a Prisma migration
- `npm run db:studio` — browse the database in Prisma Studio
- `npm run db:seed` — (re)create the initial owner account

## Deployment

Deployed on Vercel (project `vadmesa-1080/japastry`), with Postgres provided by the Neon integration connected to the project. `DATABASE_URL` / `DATABASE_URL_UNPOOLED` and `NEXTAUTH_SECRET` are set as Vercel project environment variables — not committed to the repo.

To deploy a new version manually: `npx vercel --prod`. Auto-deploy on `git push` requires installing the Vercel GitHub App on this repo (Vercel dashboard → Project → Settings → Git → Connect).
