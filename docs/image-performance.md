# Image performance (Velvet)

Free-tier Supabase only — no Pro image transforms.

## What the app does

### On upload (Supabase Storage)
All uploads via `uploadImage()` are:
- Resized (avatars **256px**, items **1280px**, banners **1200px**)
- Compressed to **WebP**
- Stored with **1-year** `cacheControl`

Path: `src/services/storage/storage.service.ts`

### On link save
When you save a link with a preview image:
1. The app fetches the preview via `/api/images/proxy` (authenticated)
2. Compresses it to WebP and uploads to Supabase Storage
3. Saves the **Supabase URL** in `items.image_url`

If ingest fails (blocked CDN, timeout, etc.), the app falls back to a lighter external thumbnail URL (YouTube `hqdefault`, smaller Google `=s256-c`, etc.) — save still works.

### On display
`VelvetImage` uses a custom loader:
- **Supabase Storage** → `/api/images/display` (same-origin resize via `sharp`; avoids Next optimizer DNS/NAT64 blocks)
- **Other hosts** → `/_next/image`

Set accurate `sizes` on each layout (see `COLLECTION_POSTER_SIZES_*` in `collection-ui.ts`).

External URLs (legacy items) get display-time cleanup:
- **YouTube:** `hqdefault.jpg` (not `maxresdefault`)
- **Google profile images:** `=s256-c` instead of `=s900`

---

## Fixing existing large files in Storage

Old uploads (PNG/JPG, 1MB+) were saved before compression. Options:

1. **Re-upload** avatars in Profile settings and re-save item images.
2. **Bulk re-process (manual):** download → compress with Squoosh → re-upload (advanced).

New saves and uploads are compressed automatically.

---

## Lighthouse score expectations

A **100** performance score also depends on:
- Third-party scripts (PostHog, Clarity) — defer or sample in production
- CSS/JS bundle size — separate from images
- LCP element — ensure hero/cover uses `priority` + reasonable `sizes`

Image changes fix oversized Supabase objects and heavy external thumbnails. Re-run Lighthouse after deploy.

---

## Checklist

- [ ] `NEXT_PUBLIC_APP_URL` set in production
- [ ] Netlify/Next image optimization enabled (default with `@netlify/plugin-nextjs`)
- [ ] New uploads are `.webp` under ~80KB (avatars) / ~350KB (items)
- [ ] Link saves store compressed previews in Storage when ingest succeeds
