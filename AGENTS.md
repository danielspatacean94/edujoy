# AGENTS.md

This file provides guidance to Codex and other coding agents when working with code in this repository.

---

# Project Overview

EduJoy — kindergarten community management built from a NestJS + React skeleton. Admins manage kindergartens and teacher accounts; teachers manage children within their assigned kindergarten.

Built as a TypeScript monorepo with a single root `package.json`. Frontend and backend dependencies are installed from the root. The React app is built as static assets and served by NestJS.

---

# Development Commands

```bash
npm install              # Install all dependencies
npm run dev               # Start backend + frontend in development mode
npm run build              # Production build (server + UI)
npm run start              # Run production build

npm run build:server     # Build NestJS server only
npm run build:ui         # Build React UI only
npm run server           # Dev: NestJS only
npm run ui                # Dev: Vite only

npm run lint              # ESLint
npm run format            # Prettier

npm run test               # Jest unit tests
npm run test:e2e          # E2E tests
```

---

# Architecture

```
server/     -> NestJS Backend
ui/         -> React Frontend
shared/     -> Shared DTOs, types, and constants (imported via @shared/* alias)
```

## Backend (NestJS)

Entry point: `server/src/main.ts` — bootstraps with global `ValidationPipe`, `AllExceptionsFilter`, cookie parser, CORS, and `/api` prefix.

Root module: `server/src/app.module.ts` — seeds the initial admin user on bootstrap.

### Common Module (`server/src/common/`)

Cross-cutting infrastructure. Only add subdirectories the app actually needs — don't scaffold infra nobody uses:

| Subdirectory | Contents |
|---|---|
| `auth/` | `AuthService`, `AuthController` (`/api/auth/login`, `/logout`, `/me`, `/change-password`), JWT strategy |
| `guards/` | `JwtAuthGuard`, `RolesGuard` |
| `decorators/` | `@Roles()`, `@CurrentUser()` |
| `database/` | TypeORM MongoDB configuration; registers all entities |
| `filters/` | `AllExceptionsFilter` — global error handler |
| `dto/` | `PaginationQueryDto` (page/limit/search) + `paginate<T>()` helper |
| `interfaces/` | `JwtPayload { sub, email, role, tokenVersion }`, `AuthenticatedUser` |
| `logger/` | NestJS logging setup |
| `crypto/` | `CryptoService` — AES-256-GCM encrypt/decrypt/hash for sensitive fields |
| `s3/` | `S3Service` — Cloudflare R2 (AWS SDK compatible) file upload/download |
| `audit/` | `AuditLogService/Controller/Entity` + `AuditSubscriber` — records INSERT/UPDATE/SOFT_DELETE on every entity via a TypeORM subscriber, read via `/api/audit-logs` (admin only) |
| `settings/` | `SettingsService/Controller/Entity` — singleton app-wide config document |

### Domain Modules (`server/src/domain/`)

Each module: Entity → DTOs (Create/Update/Response) → Service → Controller → Module.

**Rule:** Business logic belongs exclusively in services. Controllers handle only routing, validation, authorization, and service delegation.

| Module | Path | Description |
|---|---|---|
| `users` | `/api/users` | Admin-only teacher account CRUD and password resets. The paginated list returns teachers. Teacher accounts require a name, email, temporary password (8+ characters), and an active `kindergartenId`; first login requires a password change. |
| `kindergartens` | `/api/kindergartens` | Admin CRUD: name and location. Cannot delete while active teachers or children reference the kindergarten. |
| `children` | `/api/children` | Name and integer age (0–18), attached to a kindergarten. Admins manage all children; teacher list/read/create/update/delete operations are scoped to their current kindergarten from the database-backed authenticated user. |
| `notifications` | `/api/notifications` | Generic per-user notifications (`title`, `message`, `link`, `isRead`). `GET /today` (default view shown by the header bell) and `markAllRead` are both scoped to the current calendar day; `GET /` returns the general recent list (`?limit=`). Every route is scoped to `@CurrentUser()` — there's no admin override, since these are personal, not shared platform data. `NotificationsService.create()` is exported for other services to call as they're built; there is **no** public HTTP endpoint to create one — notifications are always created server-side by domain code, never directly by a client |
| `banners` | `/api/banners` | Admin-managed announcements shown in `Header` (`/admin/banners`). `message`, `startDate`/`endDate`, `style: 'ANNOUNCEMENT'\|'CELEBRATION'` (`shared/types/banner.ts`'s `BannerStyle`/`BANNER_STYLES`, validated server-side with `@IsIn(BANNER_STYLES)` — purely presentational, picks which of `Header.tsx`'s `AnnouncementBar`/`CelebrationBar` renders it). `GET /` (paginated list) and all mutations (`POST`/`PUT /:id`/`DELETE /:id`) require `@Roles('admin')`; `BannersService` 400s if `startDate` is after `endDate`. `GET /active` is the one route with no `@Roles()` — open to any authenticated role, matching the RolesGuard convention — and returns banners where `now` falls within `[startDate, endDate]`; unlike itp-manager (the house-stack app this skeleton mirrors), there's no per-station/tenant targeting here since this skeleton has no such concept — every active banner is shown to every authenticated user |

Add a row here for every new domain module (e.g. `clients`, `projects`) as it's built.

## Frontend (React)

```
ui/src/services/          -> All API communication (Axios). Nothing else makes API calls.
ui/src/pages/              -> Route-level components + co-located Zustand store per page group
ui/src/pages/admin/        -> Admin-only pages: history (audit log), settings, banners
ui/src/pages/kindergartens/ -> Admin kindergarten page and form
ui/src/pages/teachers/      -> Admin teacher page, form, and password reset dialog
ui/src/pages/groups/        -> Group page, form, and page store
ui/src/pages/children/      -> Child page, form, photos, and page store
ui/src/components/layout/  -> AppLayout, Sidebar, Header (the fixed shell every page renders inside)
ui/src/components/ui/      -> Shared presentational kit: Badge, Button, Input, PasswordInput, Modal,
                              MultiSelect, SearchableSelect, Spinner, Table, MobileTable
ui/src/store/               -> Global auth store (Zustand + localStorage persist)
ui/src/hooks/               -> useAuth, useDebounce
ui/src/router/              -> AppRouter (BrowserRouter + ProtectedRoute)
ui/src/types/                -> Frontend TypeScript types (mirrors backend entities)
```

Stack: React 18 · Vite 5 · Ant Design 5 · React Router 6 · Zustand 5 · Tailwind CSS 3 · TypeScript 5

### UI component kit (`ui/src/components/ui/`)

A small set of Tailwind-styled primitives used instead of reaching for Ant Design's `Table`/`Modal`/`Form` on every page — `Table`/`MobileTable` (paginated list + search, rendered as a real `<table>` on desktop and a card list under `md:`), `Modal` (simple centered dialog), `Button`/`Input`/`PasswordInput`, `Badge`, `Spinner`, and `MultiSelect`/`SearchableSelect` for combobox-style pickers. `HistoryPage` and `SettingsPage` use this kit; EduJoy’s dedicated community pages use responsive cards and `components/directory/` presentation components plus the shared Button/Input/Modal primitives — follow the same pattern for new list/CRUD pages rather than mixing in raw Ant Design table/modal components. Ant Design itself is still available for genuinely complex stateful widgets (date pickers, cascaders) where a bespoke component isn't worth building.

### Routing

- Public: `/login`, `/no-access`, `/change-password`
- Protected (all roles): dashboard, `/children`
- Admin only: `/admin/kindergartens`, `/admin/teachers`, `/admin/history`, `/admin/settings`, `/admin/banners` (`/admin/users` redirects to teachers)

### Rendering chain

`main.tsx` mounts `App.tsx`, which runs one bootstrap effect (best-effort session refresh, gated behind `isAuthenticated`, wrapped in try/catch so a 401 can't hang the screen) behind a `ready` flag, then renders `AppRouter`. `AppRouter` nests every authenticated route under one `<Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>` so the sidebar/header shell isn't repeated per page; `ProtectedRoute` handles the `isAuthenticated`/`role`/password-expiry redirects. `AppLayout` composes `Sidebar` + `Header` + an `<Outlet />`, and owns the one piece of state (`mobileNavOpen`) that turns the sidebar into a slide-over drawer on small screens. Every top-level page needs a nav entry in `Sidebar.tsx`'s `mainNav`/`adminNav` *and* a matching `<Route>` in `AppRouter.tsx` — keep the two in lockstep as pages are added.

`Sidebar` also fetches `GET /api/settings` once on mount and renders `v{version}` plus a `dev`/`prod` badge directly under the brand title (hidden entirely when the sidebar is collapsed, same as the title text) — `version`/`appName` come from the server reading its own `package.json`, `nodeEnv` from `process.env.NODE_ENV`, both merged into the `SettingsController` response alongside the `global` field. This endpoint is open to any authenticated role (`JwtAuthGuard` only, no `@Roles()`), so the badge renders for teachers too, not just admins.

`Header`'s right side is `NotificationBell` + `UserMenu`. `NotificationBell` fetches the current user's **today's** notifications (`GET /notifications/today`) on mount, shows an unread-count badge, and lets the user mark-as-read (individually or all at once, both scoped to today), delete, or click through to a notification's `link`. `UserMenu` is a single clickable button (full name, hidden below `sm:`, with the role underneath) that opens a small dropdown with "Change password" (a `Modal` reusing `PasswordInput`, calling `authService.changePassword`) and "Logout".

`Header` also renders a `BannerStrip` below its fixed `h-14` breadcrumb row (inside the same component, wrapped in an outer `shrink-0` div so the breadcrumb row's own height/styling stays untouched). It reads `banner.store.ts`'s `activeBanners` (fetched via `GET /api/banners/active` on mount) and renders one full-width bar per active banner — `style` picks between the plain `AnnouncementBar` and the gradient/animated `CelebrationBar` (`banner-shimmer`, `tailwind.config.js`). There's no dismiss/persistence, and no cap on how many can stack, so admins are expected not to overlap banners carelessly.

EduJoy uses sage, peach, lavender, and mint, rounded cards, a local system font stack, and CSS artwork (no external font/image dependency). Tailwind drives layout/spacing and the custom `brand`/`accent` palette (`tailwind.config.js`); Ant Design supplies stateful components (tables, forms, modals). Both run with Tailwind's `preflight` enabled — don't disable it unless a specific collision actually appears.

**Tailwind/PostCSS gotcha:** `ui/tailwind.config.js`'s `content` globs and `ui/postcss.config.js`'s `tailwindcss` plugin config both use absolute paths built from `__dirname`, not relative forms like `content: ['./index.html', ...]` or `tailwindcss: {}`. This isn't stylistic — Tailwind resolves `content` globs, and the `tailwindcss` PostCSS plugin resolves its own config file, relative to `process.cwd()` when given relative/no paths. The root `package.json` scripts run `vite build --config ui/vite.config.ts` **from the repo root**, so cwd is never `ui/` — relative forms silently match zero files, Tailwind emits only the preflight reset (with a "content option is missing or empty" warning), and every utility class vanishes from the build with no hard error. Don't "simplify" these two files back to relative paths.

### State Management

- **Global:** `auth.store.ts` (Zustand + persist) — `user`, `isAuthenticated`, login/logout/refreshUser. `banner.store.ts` (Zustand, not persisted) — `activeBanners`/`fetchActive`, read by `Header`'s `BannerStrip`; separate from the admin-only `useBannersStore` under `pages/admin/banners/` (list/CRUD for management, not the active-right-now view)
- **Page-level:** Co-located `use<Domain>Store.ts` per feature — owns list data, dialog open states, selected item, and calls through to that domain's `services/<domain>.service.ts`

## Shared (`shared/`)

Shared TypeScript types, DTOs, enums, and constants importable by both server and UI via the `@shared/*` path alias. First populated by `shared/types/banner.ts` (`BannerStyle`/`BANNER_STYLES`, see `Banner` under Domain Entities) — reach for `shared/` when a type/constant must stay byte-identical between server validation and the frontend form, not just for convenience.

---

# Domain Entities

```ts
User         { _id, email, fullName, password, role: 'admin'|'teacher',
               kindergartenId: string | null, passwordExpiresAt, tokenVersion, deletedAt, timestamps }

Kindergarten { _id, name, location, deletedAt, timestamps }
Child        { _id, name, age: integer (0–18), kindergartenId, deletedAt, timestamps }

Notification { _id, userId, title, message, link, isRead, deletedAt, createdAt }
               // Generic, not tied to any domain entity yet — `link` is an
               // optional in-app path the frontend navigates to on click.

AuditLog     { _id, userId, userEmail, userFullName, action: INSERT|UPDATE|SOFT_DELETE,
               entityType, entityId, entityBefore, entityAfter, searchText, createdAt }

Settings  { _id, global: Record<string, unknown> }
            // Singleton document (exactly one row). `global` is an open-ended
            // JSON blob for now — give it real, typed fields once app-wide
            // config requirements are known; don't fabricate fields early.

Banner       { _id, message, startDate: Date, endDate: Date,
               style: 'ANNOUNCEMENT'|'CELEBRATION', deletedAt, timestamps }
               // Admin-managed announcement rendered in Header for every
               // authenticated user (no per-user/tenant targeting — this
               // skeleton has no such concept). `style` is purely
               // presentational — picks between Header.tsx's plain
               // AnnouncementBar and the gradient/animated CelebrationBar —
               // see the `banners` row under Domain Modules. Active-window
               // check is startDate <= now <= endDate, evaluated
               // server-side in BannersService.findActive().

// Example { _id, name, deletedAt, timestamps }
// Add real domain entities here as they're built — don't fabricate
// business fields that haven't been designed yet.
```

**Key patterns:**
- All IDs use MongoDB `ObjectId`; cross-collection references stored as string IDs
- All entities support soft deletes via `deletedAt: Date | null`
- Sensitive PII fields, if any are added later, should be encrypted (AES-256-GCM) with a separate hash field for deduplication without decryption

---

# Authorization

Two roles: `admin` and `teacher`.

- **admin:** full access — manage users; access to all admin-only pages/routes
- **teacher:** belongs to one active kindergarten; manages the shared child roster for that kindergarten. Kindergarten identity comes from the current database user on each request, never from a client-supplied claim. Reassignment immediately changes access; children stay with their kindergarten.

JWT payload: `{ sub, email, role, tokenVersion }`. The `RolesGuard` enforces role on protected endpoints via the `@Roles()` decorator.

**Critical gotcha:** `RolesGuard` returns `true` (allow) whenever a route has *no* `@Roles()` metadata at all — it only restricts routes that explicitly declare required roles. Applying `@UseGuards(JwtAuthGuard, RolesGuard)` by itself does **not** make a controller admin-only; every handler that should be restricted needs its own `@Roles('admin')`. When adding a new admin-only controller or handler, always pair `RolesGuard` with an explicit `@Roles(...)`, never rely on the guard alone.

---

# API Routes

```
/api/auth/*           login (rate-limited, 5/min), logout, me, change-password
/api/users/*          admin-only teacher accounts and password resets
/api/kindergartens/*   admin-only kindergarten CRUD
/api/children/*        admin all-kindergarten CRUD; teachers scoped to assigned kindergarten
/api/audit-logs/*      entity change history (admin only)
/api/settings/*        GET requires auth (any role); PATCH admin only
/api/notifications/*   GET /today (default) and GET / (recent) scoped to the current user; no admin override
/api/banners/*          GET / + mutations admin only; GET /active open to any authenticated role (app-wide, no per-user scoping)
```

Add a line here for every new domain module's routes.

---

# TypeScript Rules

- Strict mode always enabled
- Avoid `any`; prefer `unknown` with explicit type narrowing
- Use DTOs for all request bodies and responses (e.g., `create-<x>.dto.ts`, `<x>-response.dto.ts`)
- Never expose entity internals directly from controllers — always map through a response DTO

---

# Error Handling

Always throw NestJS HTTP exceptions: `NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `ConflictException`. Never return raw errors to clients. The global `AllExceptionsFilter` handles uncaught exceptions.

---

# Naming Conventions

| Thing | Convention |
|---|---|
| Classes | `PascalCase` |
| Variables / functions | `camelCase` |
| Constants | `UPPER_SNAKE_CASE` |
| Files | `kebab-case.ts` |
| MongoDB collections | auto-derived by TypeORM from entity class name |

---

# Security Requirements

- bcrypt (via `bcryptjs`) for password hashing
- JWT stored in httpOnly cookie (`sameSite: 'lax'`); `tokenVersion` field invalidates all tokens on password change
- Role-based authorization on all protected endpoints via `RolesGuard` + `@Roles()` — see the RolesGuard gotcha under Authorization; a guard with no `@Roles()` on the handler allows any authenticated user through
- Rate limiting via `@nestjs/throttler`: global default (120 req/min) applied as an `APP_GUARD` in `app.module.ts`, with a stricter `@Throttle({ default: { ttl: 60_000, limit: 5 } })` override on `POST /api/auth/login` to slow down credential-stuffing/brute-force attempts
- DTO validation with Class Validator on all incoming requests (global `ValidationPipe({ whitelist: true, transform: true })`)
- Response DTOs are scoped to their audience: `UserResponseDto` (admin-only teacher list) omits `tokenVersion`/`passwordExpiresAt`; `MeResponseDto` (extends it, adds `passwordExpiresAt`) is used only for `GET /auth/me`
- Any free-text search parameter compiled into a MongoDB `$regex` filter must be escaped first (a local `escapeRegex()` helper) — unescaped user input in `$regex` is a ReDoS vector
- Frontend must not call authenticated-only endpoints unconditionally on app bootstrap — gate the call behind `isAuthenticated`, and wrap best-effort calls in try/catch so a 401 on a protected route can't hang the login page (`App.tsx`'s init sequence follows this pattern)
- AES-256-GCM encryption (`CryptoService`) for sensitive PII fields, with a separate deterministic-hash field for dedup lookups without decryption — apply this pattern (as topcad does for `Client.cnp`/`cnpHash`) to any future field that's both sensitive and needs to be searched/deduped
- `AuditSubscriber` snapshots every entity insert/update/soft-delete into `audit_log` via a global `ClsModule` context (the current user is stashed by `JwtAuthGuard` on each request so the subscriber can attribute changes without threading a user param through every service). It strips `createdAt`/`updatedAt`/`deletedAt` **and** `password`/`token` from every snapshot — when adding new credential-like fields to any entity, add them to `EXCLUDED_FIELDS` in `audit.subscriber.ts` too, or they'll get duplicated into the audit log on every change
- `/api/audit-logs` is admin-only
- `helmet()` is applied globally in `main.ts` for baseline security headers (X-Frame-Options, X-Content-Type-Options, HSTS, etc.). Its `contentSecurityPolicy` directive is explicitly disabled — Ant Design injects `<style>` tags at runtime (CSS-in-JS) and the default CSP would block that under a stock `'self'`-only policy. Configure a real CSP tuned to the app's actual script/style/connect sources before production, rather than leaving it off indefinitely.

**Known gaps (carried over as a starting point, revisit before production use):**
- No tuned Content-Security-Policy (see the `helmet()` note above — the directive is off, not configured).

## EduJoy implementation notes

- `KindergartensPage`, `TeachersPage`, `GroupsPage`, and `ChildrenPage` own their domain cards and forms. Do not reintroduce a resource-switching page, form, or optional-field record type. Each domain has a typed service and a co-located store factory; `createCollectionStore` and `useCollection` share pagination, search, dialog state, and stale-request handling. `components/directory/` shares presentation only. Teacher password reset and child photo upload remain domain-specific.
- Attendance presentation is split into `AttendanceBoard`, `AttendanceCard`, `AttendanceChildCard`, and `AttendanceChildPhoto`; audio lives in `attendance-audio.ts`. `useChildPhoto` owns photo loading and object-URL cleanup.
- Run `npm run test:ui -- --runInBand` for UI store, service contract, and form regression tests (Jest + ts-jest; no extra dependencies).
- New resource PUT bodies contain the full editable record; teacher updates are partial. Child age is in whole years, 0–18.
- Kindergarten deletes are blocked when active teachers or children remain; all deletes are soft deletes. Child operations fail closed for unassigned teachers. Deleted users cannot authenticate existing sessions.
- Tests cover tenant isolation, forged assignments, deletion dependencies, teacher assignments, and deleted-user session lookup. Run `npm test -- --runInBand`, `npm run build`, and `node node_modules/typescript/bin/tsc --project ui/tsconfig.json`.
- Existing skeleton `operator` records require an explicit data migration/administrator assignment before they can act as teachers; do not silently grant them access to children.

## Application language

EduJoy is Romanian-only. Write all user-facing labels, helper text, validation and error messages in Romanian with diacritics. Use ro-RO date/number formatting and Romanian Ant Design/Day.js locales. Keep code identifiers, API paths and stored enum values unchanged.


- Child `genre` is required on create/update: `male` (Băiețel) or `female` (Fetiță), shared in `shared/types/child.ts`. Older records return null until edited; do not infer genre. Attendance responses include genre and speech uses prezent/prezentă accordingly.
