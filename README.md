# Forge & Co. — Website Development Agency Platform

A full-stack business management application for a website development agency: CRM, project & task
management (with a Kanban board), time tracking, proposals, invoicing & payments, team management with
role-based access, and a live dashboard.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions, TypeScript)
- **Prisma 7** ORM on **SQLite** (via the `@prisma/adapter-better-sqlite3` driver adapter) — swap the
  datasource for Postgres/MySQL in production by changing `prisma/schema.prisma` and `DATABASE_URL`
- **Auth.js / NextAuth v5** — credentials (email + password) auth, JWT sessions, role-based route
  protection via `src/proxy.ts`
- **Tailwind CSS v4** with a small hand-rolled component library (`src/components/ui`) — light/dark theme
- **Recharts** for the revenue chart, **Zod** for input validation, **bcryptjs** for password hashing

## Getting started

```bash
npm install          # also runs `prisma generate` via postinstall
npm run db:migrate    # creates dev.db and applies the schema
npm run db:seed       # loads demo clients, projects, tasks, invoices, etc.
npm run dev
```

Open http://localhost:3000 and sign in with one of the seeded demo accounts (password for all: `password123`):

| Role    | Email                |
| ------- | --------------------- |
| Admin   | ava@forgeco.dev       |
| Manager | marcus@forgeco.dev    |
| Member  | priya@forgeco.dev     |
| Member  | diego@forgeco.dev     |
| Member  | sofia@forgeco.dev     |

Copy `.env.example` to `.env` (already done for local dev) and set a real `AUTH_SECRET` before deploying
anywhere — generate one with `npx auth secret`.

For a `next start` deployment behind your own domain/proxy (Docker, a VM, Railway, etc. — anything that
isn't Vercel), also set `AUTH_URL` to your app's public URL so Auth.js can verify the incoming Host header.

## Roles & permissions

- **Admin** — everything, plus team management (add/deactivate members, change roles).
- **Manager** — clients, projects, proposals, invoices, billing; no team management.
- **Member** — sees assigned projects/tasks, logs their own time; no client financials, proposals, or
  invoices in the nav.

Route protection happens in two layers: `src/proxy.ts` redirects unauthenticated requests to `/login`,
and each server component / server action calls `requireUser()` or `requireRole([...])` from
`src/lib/session.ts` before touching data.

## Data model

See `prisma/schema.prisma`. Core entities: `User`, `Client`, `Project` (+`ProjectMember`), `Task`,
`TimeEntry`, `Proposal`, `Invoice` (+`InvoiceItem`, `Payment`), and an `Activity` feed that powers the
dashboard's recent-activity list.

## Project structure

```
src/
  app/
    login/                  public sign-in page
    (app)/                  authenticated shell (sidebar/topbar) + all feature pages
      clients/  projects/  tasks/  time/  proposals/  invoices/  team/  settings/
    api/auth/[...nextauth]/ NextAuth route handler
  auth.ts / auth.config.ts  NextAuth configuration (split so the proxy bundle stays DB-free)
  proxy.ts                  route-level auth gate (Next 16's middleware replacement)
  components/               UI primitives, forms, charts, app shell
  lib/
    actions/                Server Actions (create/update/delete per domain)
    prisma.ts               Prisma Client singleton (driver-adapter based)
    session.ts               requireUser / requireRole helpers
    validation.ts            Zod schemas for every form
    billing.ts                Invoice total/balance calculation
prisma/
  schema.prisma
  seed.ts                   demo data
```

## Scripts

| Command             | Description                                  |
| -------------------- | --------------------------------------------- |
| `npm run dev`         | Start the dev server (Turbopack)              |
| `npm run build`       | Production build                              |
| `npm run start`       | Run the production build                      |
| `npm run lint`        | ESLint                                        |
| `npm run db:migrate`  | Create/apply a Prisma migration               |
| `npm run db:seed`     | Reset & reload demo data                      |
| `npm run db:studio`   | Prisma Studio (browse the database)           |
| `npm run db:reset`    | Drop & recreate the dev database from scratch |

## Notes on the demo data

`prisma/seed.ts` is idempotent — re-running `npm run db:seed` wipes and reloads a consistent set of
clients, projects (across every status), Kanban tasks, time entries, proposals, and invoices (including
a paid one, an overdue one, and one with a partial payment) so every page has something real to show.
