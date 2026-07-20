# Bundle Analysis

Private analysis performed with the development-only `npm run analyze:bundle` command. It invokes Vite with in-memory output and adds no production runtime dependency or analyser code.

## Before

- One initial JavaScript file: 320,489 bytes raw / 98.74 kB gzip.
- The source map showed `@hugeicons/core-free-icons/dist/esm/index.min.js` as a 5.42 MB source input. Tree shaking removed most of it, but a fixed local icon set is simpler and removes the dependency entirely.
- `App.jsx` contained the appointment dialog, duplicate structured-data components, homepage interactions, service rendering and legal rendering.

## After

| Chunk | Raw size | Gzip |
| --- | ---: | ---: |
| Initial application | 309,995 bytes | 95.47 kB |
| Appointment dialog, loaded on demand | 10,401 bytes | 3.17 kB |
| Privacy-settings dialog, loaded on demand | 1,908 bytes | 0.81 kB |

- After the content-and-trust expansion, initial JavaScript remains 10,494 bytes raw and approximately 3.27 kB gzip below the original baseline bundle.
- Total JavaScript across all chunks is about 322.3 kB. The appointment and privacy code remains deferred until opened.
- Critical preloaded font bytes fell from 608,340 bytes to approximately 77,800 bytes. This is the dominant delivery improvement in the current pass.
- React DOM remains the largest runtime module. `App.jsx` and the multilingual content modules are the largest project-owned inputs.
- Duplicate client JSON-LD code was removed; structured data now has one build-time source.
- The local icon component is about 4.5 kB of source and replaces both Hugeicons packages.
- CSS is 71.69 kB raw / 11.97 kB gzip after the trust strip, content-layout additions and existing resilience rules.

## Asset dominance and deferred work

- Superseded 20 July 2026: the owner supplied Abhaya Libre as the new display family. Its active Latin Extended WOFF2 subsets are approximately 15 kB per weight, replacing the 545.9 kB critical Hepta Slab TTF in production.
- All language content remains in the initial application chunk. A route-data loader could reduce it, but would add loading states and complexity to a small static site. The current gain did not justify that refactor.
- The SVG placeholders are tiny. Approved future raster photographs will need responsive AVIF/WebP/fallback variants and should be checked against the active budgets.
