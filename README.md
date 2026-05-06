# Capital OS Navigator

MVP diagnostic SaaS for startup funding readiness.

Capital OS Navigator helps founders complete a structured diagnostic, receive a funding readiness score, get a recommended financing route, and request an expert review. The MVP is intentionally scoped as a diagnostic product, not an investment platform.

## Monorepo Structure

```text
apps/
  web/       Next.js founder and admin UI
  api/       NestJS REST API
packages/
  shared/    Shared domain types and constants
docs/        Product, architecture, API, and backlog docs
infra/       Docker and deployment assets
```

## Local Setup

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:push
pnpm dev
```

## Services

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Auth Flow

Founder registration:

```bash
POST /api/auth/register
```

Admin bootstrap:

```bash
POST /api/auth/bootstrap-admin
```

The bootstrap endpoint requires `ADMIN_BOOTSTRAP_TOKEN` and only works before the first admin exists.

Admin and analyst users can access `/admin/*`. Founder users and anonymous visitors are blocked by:

- API guards: signed token + role check.
- Web middleware: signed token cookie + role check for `/admin/*`.
- Client shell: session-aware admin UX and logout.

## MVP Boundary

The MVP does not include investment transactions, investor accounts, marketplace mechanics, public investment offers, or money flows. It provides informational diagnostics, preparation checklists, routing, and internal lead processing.
# R.Capital
