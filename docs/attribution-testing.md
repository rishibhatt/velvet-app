# Attribution & UTM testing

Manual QA checklist for the Velvet attribution module (`src/lib/attribution/`).

## Automated tests

```bash
npm run test
```

Covers parsing, URL building, traffic-source resolution, and last-touch session overwrite.

## Inbound (last-touch capture)

1. Start dev: `npm run dev`
2. Open incognito:  
   `http://localhost:3000/explore?utm_source=instagram&utm_medium=paid&utm_campaign=launch_test`
3. DevTools → **Application → Session Storage** → key `velvet_attribution` with JSON snapshot
4. Navigate to `/login` — UTMs remain in session storage
5. In same tab, open:  
   `http://localhost:3000/?utm_source=twitter&utm_medium=organic&utm_campaign=test2`  
   Storage should **overwrite** with Twitter (last-touch)
6. Close tab, reopen without UTMs — storage empty; events lack UTM props

## Outbound shares

1. Open a public collection → Share → Copy link
2. Pasted URL should include:  
   `utm_source=velvet&utm_medium=share&utm_campaign=collection&utm_content={username}/{slug}`
3. Open copied link in incognito — session storage captures Velvet share UTMs
4. Repeat for profile share (`utm_campaign=profile`) and item share (`utm_campaign=item`)

## Internal navigation

1. From `/explore`, click a collection card
2. Landing URL includes `src=explore` and `utm_medium=internal`
3. Network tab → `POST /api/boards/{id}/view` body has `"source":"explore"` (not `"share"`)

## Auth return path

1. Land on `/explore?utm_source=newsletter&utm_medium=email&utm_campaign=test` while logged out
2. Click **Log in** — URL should encode full path + query in `next=`
3. After login, return to explore with UTMs preserved

## Analytics dashboards

| Tool | Verify |
|------|--------|
| GA4 DebugView | `page_view` and custom events include UTM params |
| PostHog Live | `attribution_captured`, `board_viewed_public` carry `utm_*` |
| Supabase `board_views` | `source` matches `src` / campaign mapping |

## Production smoke

```
https://your-domain.com/?utm_source=qa&utm_medium=manual&utm_campaign=post_deploy
```

Share one collection link and confirm recipient session picks up `utm_source=velvet`.
