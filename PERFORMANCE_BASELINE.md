# Performance Baseline

Private baseline captured before the performance changes on 19 July 2026. Measurements used a local Vite production preview and headless Microsoft Edge; they are engineering measurements, not field data or Lighthouse scores.

## Production build

- Full `npm run build` duration: 3.04 seconds.
- Vite compilation portion: 1.70 seconds.
- Generated indexable routes: 18 (9 German and 9 Croatian).
- Generated route HTML files: 18 before the dedicated 404 page.
- Total `dist` size: 1,144,740 bytes.

## Initial route payload

| Category | Raw/emitted size | Gzip shown by Vite |
| --- | ---: | ---: |
| Initial JavaScript | 320,489 bytes | 98.74 kB |
| CSS | 69,096 bytes | 11.52 kB |
| Critical Hepta Slab variable font | 545,928 bytes | font served as-is by local preview |
| Critical Figtree variable font | 62,412 bytes | font served as-is by local preview |
| Non-preloaded Figtree italic font | 62,292 bytes | loaded only if required |

The German homepage made 8 initial requests in the measured local preview: document, two preloaded fonts, one stylesheet, one JavaScript entry, logo, hero SVG and favicon. Approximate observed transferred bytes were 725.6 kB; 608.9 kB came from the two critical TTF fonts. No initial external production request occurred. This is the original baseline; on 20 July 2026 the display font was replaced by an approximately 15 kB Abhaya Libre WOFF2 subset, removing the former 545.9 kB critical font from production.

## Images

- Hero placeholder SVG: 894 bytes, 1400 × 933 intrinsic dimensions.
- Team placeholder SVG: 712 bytes, 1100 × 1375 intrinsic dimensions.
- Logo SVG: 4,310 bytes.
- Favicon SVG: 254 bytes.
- No approved raster hero, adviser portrait or social image existed. The SVG placeholders are scalable and do not need raster `srcset` variants. Requirements for approved replacements remain in `IMAGE_ASSET_REQUIREMENTS.md`.

## Largest generated assets

1. Hepta Slab variable TTF — 545,928 bytes.
2. Initial JavaScript — 320,489 bytes.
3. CSS — 69,096 bytes.
4. Figtree variable TTF — 62,412 bytes.
5. Figtree italic variable TTF — 62,292 bytes.

## Duplication and execution findings

- The appointment dialog and privacy-settings dialog were part of the initial JavaScript path even when never opened.
- JSON-LD was generated statically and then inserted again by React, creating duplicate business/page/FAQ entities after JavaScript execution.
- The service-number interaction recalculated every service rectangle during scroll and resize.
- The Hugeicons packages were used for a small fixed set of interface icons.
- German, Croatian, service and legal content are bundled together. Splitting every static content module would create many small chunks and additional request overhead, so this remains deferred.
- Two responsive hero image elements represented the same asset, although the browser normally deduplicated the network request.

## Core Web Vitals and stability risks

- LCP at baseline: the 545.9 kB display TTF was the largest initial resource. This issue was resolved on 20 July 2026 with locally generated Abhaya Libre WOFF2 subsets from the owner-supplied font files.
- INP: repeated scroll geometry work and initial dialog code were avoidable. No field INP data is available.
- CLS: hero/team dimensions were present, but logo dimensions were missing and two responsive hero elements increased layout complexity.
- Rendering: one local stylesheet is render-blocking by design to prevent unstyled layout; there are no render-blocking third-party resources.
- Static content: generated metadata was complete, but the original empty React root provided little core content when JavaScript was disabled.

Engineering targets are LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 under representative conditions. They are targets, not guaranteed field results.

## Lighthouse availability

Lighthouse is not installed in this repository or execution environment, and `npx --no-install lighthouse --version` confirmed that no local executable is available. No score was fabricated and no large audit dependency was added to production. Bundle inspection, deterministic size budgets, local Performance API timings, 18-route browser navigation, no-JavaScript rendering and multi-viewport Playwright checks were used instead. Local post-change first contentful paint was approximately 164 ms on an unthrottled loopback preview; this is not representative mobile field performance.
