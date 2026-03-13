# PRD: Comprehensive Dependency Update

## Introduction

The Unfiltered project has accumulated significant dependency drift across its core stack (Prisma 6, Zod 3, ESLint 8) and numerous secondary packages. This initiative brings all dependencies to their latest stable versions through a phased, low-risk rollout of 6 PRs. Each phase targets a related group of packages to isolate breakage and enable clean rollbacks.

## Goals

- Upgrade all priority dependencies: Zod 3 to 4, Prisma 6 to 7, ESLint 8 to 9, Next.js 16.0 to 16.1, tRPC 11.0 to 11.12, TanStack Query/Table to latest
- Upgrade all secondary dependencies: tailwind-merge, sonner, @vercel/analytics, react-day-picker, react-markdown, @hookform/resolvers, and remaining minor/patch packages
- Fix mismatched @types/react (v18 types for React 19 runtime)
- Maintain zero downtime — each phase is a separate PR, verified before the next begins
- Follow the Prisma v7 migration guide for adapter-based client architecture

## User Stories

### US-001: Patch and Minor Dependency Bumps
**Description:** As a developer, I want to update all safe patch/minor dependencies so the project uses current, well-supported versions and fixes the @types/react mismatch.

**Acceptance Criteria:**
- [ ] Update runtime deps: react 19.2.4, react-dom 19.2.4, @tanstack/react-query 5.90.21, @tanstack/react-table 8.21.3, react-hook-form 7.71.2, superjson 2.2.6, lucide-react 0.577.0, geist 1.7.0, @t3-oss/env-nextjs 0.13.10
- [ ] Update dev deps: @types/react 19.2.14, @types/react-dom 19.2.3, @types/node 22.x+, prettier 3.8.1, typescript 5.9.3
- [ ] Fix any type errors from @types/react 18→19 upgrade (likely React.forwardRef signatures in UI components)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds

---

### US-002: Zod v3 to v4 Migration
**Description:** As a developer, I want to upgrade Zod to v4 so the project uses the latest validation library with improved performance and Standard Schema support.

**Acceptance Criteria:**
- [ ] Update `zod` to 4.3.6
- [ ] Update `@hookform/resolvers` to 5.2.2
- [ ] Update tRPC error formatter in `src/server/api/trpc.ts`: replace `import { ZodError } from "zod"` with `import { z } from "zod"`, replace `error.cause instanceof ZodError ? error.cause.flatten()` with `error.cause instanceof z.ZodError ? z.flattenError(error.cause)`
- [ ] Verify no changes needed in `src/env.js` (z.object, z.string, z.enum, .default, .optional, .url all stable in v4)
- [ ] Verify no changes needed in `src/server/api/routers/document.ts` (z.object, z.string, z.number, z.boolean, z.date, z.enum, .nullable, .optional, .default all stable in v4)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds

---

### US-003: Next.js, tRPC, Auth, and ESLint 9 Upgrade
**Description:** As a developer, I want to upgrade Next.js to 16.1, tRPC to 11.12, next-auth to latest beta, and ESLint to 9 so the project uses current framework versions and meets eslint-config-next@16 requirements.

**Acceptance Criteria:**
- [ ] Update `next` to 16.1.6
- [ ] Update `@trpc/client`, `@trpc/server`, `@trpc/react-query` to 11.12.0
- [ ] Update `next-auth` to 5.0.0-beta.30
- [ ] Update `@auth/prisma-adapter` to 2.11.1
- [ ] Update `eslint` to 9.x (latest 9.39.4)
- [ ] Update `eslint-config-next` to 16.1.6
- [ ] Update `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` to 8.57.0
- [ ] Update `eslint-plugin-mdx` to latest
- [ ] Remove `@types/eslint` dev dependency (ESLint 9 ships its own types)
- [ ] Verify `.eslintrc.cjs` still works with ESLint 9 legacy config support (no format change needed)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds

---

### US-004: Prisma v6 to v7 Migration
**Description:** As a developer, I want to migrate Prisma from v6 to v7 with the new adapter-based client architecture so the project uses direct TCP connections and the latest Prisma features.

**Acceptance Criteria:**
- [ ] Update `prisma` (dev) and `@prisma/client` to 7.5.0
- [ ] Install `@prisma/adapter-pg` for PostgreSQL adapter
- [ ] Install `tsx` and `dotenv` as dev dependencies
- [ ] Update `prisma/schema.prisma`: change generator provider from `prisma-client-js` to `prisma-client`, add `output = "../src/generated/prisma"`, remove `fullTextSearchPostgres` preview feature (GA in v7), remove `url` from datasource block
- [ ] Create `prisma.config.ts` at project root with defineConfig, schema path, migrations path, and datasource URL from env
- [ ] Rewrite `src/server/db.ts` to use `PrismaPg` adapter with `connectionString` from env, import PrismaClient from generated path
- [ ] Update Prisma type imports in all 12 component/utility files: change `from "@prisma/client"` to `from "~/generated/prisma/client.js"`
- [ ] Update typed SQL import in `src/server/api/routers/document.ts`: change `from "@prisma/client/sql"` to generated path
- [ ] Verify `PrismaAdapter(db)` in `src/server/auth/config.ts` works with Prisma v7 client
- [ ] Update `package.json` scripts: remove `--sql` flag from `db:generate` and `postinstall` if no longer needed
- [ ] Add `src/generated/` to `.gitignore`
- [ ] `prisma generate` succeeds and emits to `src/generated/prisma/`
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds

---

### US-005: UI Library Major Version Upgrades
**Description:** As a developer, I want to upgrade tailwind-merge, sonner, and @vercel/analytics to their latest major versions so UI utilities align with Tailwind v4 and use current APIs.

**Acceptance Criteria:**
- [ ] Update `tailwind-merge` to 3.8.1 (API unchanged, aligns class resolution with Tailwind v4)
- [ ] Update `sonner` to 3.5.0 — update `src/app/_components/ui/sonner.tsx` Toaster props if changed, verify toast calls in `src/app/admin/_components/document-editor.tsx` and `src/app/eo-summary/[slug]/_components/artifact-section.tsx`
- [ ] Update `@vercel/analytics` to 2.0.1 — update Analytics component in `src/app/layout.tsx` if import/props changed
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds

---

### US-006: Calendar and Markdown Component Upgrades
**Description:** As a developer, I want to upgrade react-day-picker to v9 and react-markdown to v10 so calendar and markdown rendering use current, maintained versions.

**Acceptance Criteria:**
- [ ] Update `react-day-picker` to 9.14.0
- [ ] Replace `src/app/_components/ui/calendar.tsx` with the latest shadcn/ui Calendar component for react-day-picker v9 (handles renamed classNames keys, replaced IconLeft/IconRight with Chevron component)
- [ ] Update `react-markdown` to 10.1.0 — update import/props across usage files if changed
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds

---

## Functional Requirements

- FR-1: All dependency versions must be updated to the targets specified in the Version Summary table
- FR-2: Zod v4 migration must update the tRPC error formatter to use `z.flattenError()` instead of deprecated `.flatten()` method
- FR-3: Prisma v7 migration must follow the adapter-based architecture: `prisma.config.ts` for CLI config, `@prisma/adapter-pg` for database connection, generated client output to `src/generated/prisma/`
- FR-4: Prisma v7 migration must update all 12 files importing from `@prisma/client` to use the generated client path
- FR-5: ESLint 9 upgrade must work with existing `.eslintrc.cjs` legacy format (no flat config conversion required)
- FR-6: react-day-picker v9 migration must use the latest shadcn/ui Calendar component as a drop-in replacement
- FR-7: Each phase must be a separate PR, verified (typecheck + lint + build) before starting the next phase
- FR-8: No functionality regressions — all existing features (auth, tRPC queries, full-text search, admin CRUD, markdown rendering) must continue working

## Non-Goals

- No ESLint flat config migration (legacy `.eslintrc.cjs` is supported in ESLint 9; flat config conversion deferred to pre-ESLint 10)
- No new features or refactoring beyond what is required for the dependency upgrades
- No database schema changes or new migrations
- No CI/CD pipeline changes beyond what dependency updates require
- No upgrade of `class-variance-authority`, `clsx`, `date-fns`, `diff`, `remark-gfm`, `server-only`, `react-share`, `next-themes`, `dotenv-cli` (already current or not prioritized)

## Technical Considerations

- **Prisma v7 blocker check:** `@auth/prisma-adapter@2.11.1` must be compatible with Prisma v7 generated client. If not, Phase 4 is blocked until an adapter update is available.
- **Zod v4 compatibility:** Confirmed compatible with `@t3-oss/env-nextjs@0.13.10` (peer dep: `zod ^3.24.0 || ^4.0.0`), `@trpc/server@11.12.0` (no zod peer dep, uses Standard Schema), and `@hookform/resolvers@5.2.2` (no zod peer dep, resolver-agnostic).
- **ESLint 9 compatibility:** `eslint-config-next@16` requires `eslint >=9.0.0`. All plugins (`@typescript-eslint/*@8.57.0`, `eslint-plugin-mdx@latest`) support ESLint 9.
- **TypedSQL:** Project uses `typedSql` preview feature with `prisma/sql/getDocumentFts.sql`. Import path changes in Prisma v7 — exact generated path TBD after `prisma generate`.
- **@types/react 18→19:** Corrective upgrade (React 19 runtime already in use). May surface type errors in `React.forwardRef` patterns in UI components.
- **Package manager:** pnpm 9.15.4. All install commands use `pnpm add`.

## Success Metrics

- All 30+ packages updated to target versions
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass after every phase
- No runtime regressions in auth, tRPC, database queries, or UI rendering
- 6 clean PRs merged to main

## Open Questions

- Will `@auth/prisma-adapter@2.11.1` work with Prisma v7's generated client? (Must verify during Phase 4 implementation)
- Is `typedSql` still a preview feature in Prisma v7, or has it gone GA? (Determines whether to keep or remove from `previewFeatures`)
- Does `prisma generate` in v7 still support the `--sql` flag, or has typed SQL generation been folded into the default generate? (Determines script changes in Phase 4)
- Are there breaking changes in next-auth betas 26–30 affecting session callbacks or adapter interface? (Must review changelogs during Phase 3)
