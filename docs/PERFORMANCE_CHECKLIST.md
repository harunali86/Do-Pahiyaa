# Performance Checklist

## Implemented in code

- `next/image` is used across listing, auction, gallery, and homepage category images.
- LCP images use `priority`:
  - Homepage hero
  - Auction room main media
  - Listing detail gallery first image
- All major images use shared `sizes` and `quality` presets from `src/lib/image.ts`.
- Blur placeholders are enabled via `defaultBlurDataURL`.
- DNS and connection warmup for image CDN:
  - `dns-prefetch` and `preconnect` for `images.unsplash.com` in `src/app/layout.tsx`.
- Source image URLs include explicit width parameters where needed to reduce upstream payload.

## Quick audit flow (local)

1. Build and run production mode:
   - `npm run build`
   - `npm run start`
2. Open Chrome DevTools → Lighthouse.
3. Run for:
   - `/`
   - `/search`
   - `/listings/bike-101`
   - `/auctions/auc-901`
4. Focus metrics:
   - LCP
   - INP
   - CLS
   - Total Blocking Time
   - Image byte savings

## Pass criteria targets

- LCP: under 2.5s on mobile profile
- CLS: under 0.1
- INP: under 200ms
- JS execution and main-thread work reduced on dashboard-heavy pages

## Next optimizations (if score still low)

- Lazy-load heavy chart surfaces using dynamic import on admin/dealer dashboards.
- Add route-level skeletons to improve perceived speed.
- Cache API responses for listing/search SSR paths.
- Replace remote demo image hosting with first-party optimized assets for stable cache hit rate.
- Add Web Vitals reporting (`reportWebVitals`) and track p75 in analytics.

