# EduJoy

A warm, responsive home for kindergarten communities, built with NestJS, MongoDB, React, and TypeScript.

- **Admins:** create, search, edit, and delete kindergartens (name and location), manage teacher accounts and assignments, reset passwords, and manage children across kindergartens.
- **Teachers:** sign in and manage children (name and age in whole years, 0–18) in their assigned kindergarten. Teachers in the same kindergarten share its roster.
- Teacher accounts use a name, email, kindergarten, and temporary password of at least eight characters. Teachers choose a new password on first sign-in.
- Deleting a kindergarten requires first moving or deleting its teachers and children. Reassigning a teacher changes their access; it does not move children.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` if no local configuration exists, and set MongoDB, JWT, and initial administrator settings.
3. Start MongoDB, then run `npm run dev`.
4. Sign in with the configured administrator account. Add a kindergarten, add its teachers, then add children.

Existing `.env` settings are preserved. Existing skeleton `operator` accounts need an explicit migration to the `teacher` role and an active kindergarten assignment; they are not automatically given child access.

## Checks

```sh
npm run build
node node_modules/typescript/bin/tsc --project ui/tsconfig.json
npm test -- --runInBand
```

The focused service tests cover kindergarten isolation, forged child assignments, teacher reassignment, deletion dependencies, and deleted-account session lookup. They mock repository boundaries; a running MongoDB instance is needed for a full application smoke test.
