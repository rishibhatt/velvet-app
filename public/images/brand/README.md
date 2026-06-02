# Velvet brand assets

Source: `logo-bg.png` (app icon with pink background). Do not load the 2MB master in the UI — use the sizes below.

| File | Use |
|------|-----|
| `logo-bg-square.png` | Square crop from master (regen only) |
| `nav-40.png` / `nav-80.png` | Navbar & footer lockup |
| `icon-32.png` | Favicon metadata |
| `icon-192.png` | PWA / manifest |
| `icon-512.png` | PWA maskable, `src/app/icon.png` |
| `apple-icon-180.png` | Apple touch, `src/app/apple-icon.png` |
| `og-1200x630.jpg` | Open Graph / Twitter (`src/app/opengraph-image.jpg`) |

Regenerate from `logo-bg.png`:

```bash
cd public/images/brand
# Square crop (adjust crop rect to taste)
sips -c 1024 1024 logo-bg.png --out logo-bg-square.png
sips -z 40 40 logo-bg-square.png --out nav-40.png
sips -z 80 80 logo-bg-square.png --out nav-80.png
sips -z 32 32 logo-bg-square.png --out icon-32.png
sips -z 192 192 logo-bg-square.png --out icon-192.png
sips -z 180 180 logo-bg-square.png --out apple-icon-180.png
sips -z 512 512 logo-bg-square.png --out icon-512.png
sips --padToHeightWidth 630 1200 icon-512.png --out og-padded.png
sips -s format jpeg -s formatOptions 82 og-padded.png --out og-1200x630.jpg
cp icon-512.png ../../../src/app/icon.png
cp apple-icon-180.png ../../../src/app/apple-icon.png
cp og-1200x630.jpg ../../../src/app/opengraph-image.jpg
```

Site metadata: `src/lib/site-metadata.ts` and `src/constants/brand.ts`.
