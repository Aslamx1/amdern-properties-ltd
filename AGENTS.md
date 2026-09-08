## Commands

### Frontend
- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npx tsc --noEmit` — TypeScript type-check (has pre-existing errors in legacy files)
- `npx eslint src/ --max-warnings 9999` — Lint frontend code

### Backend
- `npm --prefix server run dev` — Start Express dev server
- `npx tsc --noEmit` (in `server/`) — TypeScript type-check
- `npx prisma generate --schema=../prisma/schema.prisma` (in `server/`) — Regenerate Prisma client

### Prisma
- `prisma generate --schema=prisma/schema.prisma` (from root) — Regenerate client to `server/node_modules/.prisma/client`
