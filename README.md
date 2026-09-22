# Japastry

Internal inventory and production tracker for Japastry, a small bakery specializing in cinnamon pastries. Tracks raw ingredient stock, baking batches, recipe costs, finished-goods inventory, sales, and low-stock/expiry alerts. Not a customer-facing storefront.

## Stack

- Next.js (App Router, TypeScript) — UI + server actions, one deployable app
- SQLite via Prisma — file-based database, zero setup
- NextAuth (credentials) — two roles: `OWNER` (full access, sees costs/profit) and `STAFF` (production/sales logging, no cost visibility)
- Tailwind CSS

See `prisma/schema.prisma` for the data model.

## Setup

```bash
npm install
npm run db:migrate   # creates/updates the SQLite database
npm run db:seed      # creates the initial owner account
npm run dev
```

The seed script prints the owner login (defaults to `owner@japastry.local` / `changeme123` unless `OWNER_EMAIL` / `OWNER_PASSWORD` / `OWNER_NAME` are set in `.env`). **Sign in and create your own owner account via Staff → Add an account, then stop using the seeded one.**

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build and start
- `npm run db:migrate` — run Prisma migrations
- `npm run db:studio` — browse the database in Prisma Studio
- `npm run db:seed` — (re)create the initial owner account

## Notes

- The SQLite database (`prisma/dev.db`) is a single file — back it up by copying it somewhere else periodically.
- Because SQLite needs a persistent filesystem, this app should run on an always-on host (a local machine or a small VPS), not a serverless platform like Vercel.
