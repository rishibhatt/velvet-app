# Velvet

**Save inspiration from anywhere. Organize it into something useful.**

Collaborative moodboards for travel, weddings, fashion, home, and life planning — aligned with the Velvet PRD MVP.

## Quick fix: images & collections not showing

### 1. Images broken (uploads show blank)

Next.js was blocking Supabase Storage URLs (`resolved to private ip`). The app now uses `VelvetImage` with optimization bypass for `*.supabase.co`. **Restart dev server** after pulling.

### 2. Collections not loading

Run migrations in Supabase SQL Editor **in order**:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. **`003_fix_rls_and_storage.sql`** — fixes RLS recursion / "Failed to fetch"
4. **`004_slug_and_item_policies.sql`** — public URLs, item delete, slugs

Then hard-refresh the browser.

## Supabase dashboard checklist

| Setting | Value |
|---------|--------|
| Email auth | Enabled |
| Confirm email | **Off** for local dev |
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback` |
| Google OAuth (optional) | Same redirect URL |
| Storage | Bucket `velvet-uploads` (from migration 003) |

## MVP features (PRD)

| Feature | Status |
|---------|--------|
| Email / Google auth | ✅ |
| Create collection (title, description, mood, privacy) | ✅ |
| Save link (metadata fetch) | ✅ |
| Save image upload | ✅ |
| Save text note | ✅ |
| Moodboard masonry grid | ✅ |
| Public / private toggle | ✅ |
| Public page `/c/[slug]` (no login) | ✅ |
| Creator profile `/u/[username]` | ✅ |
| Edit collection (settings modal) | ✅ |
| Delete items | ✅ |
| Collab panel + activity | ✅ |
| Collection duplication | Phase 2 |
| Mobile share extension | Phase 2 |

## Routes

- `/` — Your collections
- `/boards/[id]` — Collection detail
- `/c/[slug]` — Public collection (shareable)
- `/u/[username]` — Public creator profile
- `/setup` — Backend setup guide

## Run locally

```bash
npm install
cp .env.local.example .env.local   # add Supabase URL + anon key
npm run dev
```

Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Tech stack

Next.js 16 · TypeScript · Tailwind v4 · Supabase · TanStack Query · Zustand · Framer Motion
