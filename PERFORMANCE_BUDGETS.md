# Performance Budgets

Private build-budget documentation. Active configuration: `scripts/performance-budgets.config.mjs`.

| Category | Active limit | Reasoning |
| --- | ---: | --- |
| Initial JavaScript | 310,000 bytes | Current optimized entry is about 299.5 kB; the margin permits small maintenance changes while protecting the dialog split. |
| Total JavaScript | 325,000 bytes | Current total is about 312.1 kB across three chunks. |
| Total CSS | 75,000 bytes | Current CSS is about 70.4 kB; critical visual and accessibility rules should not be removed merely to chase size. |
| Individual font | 550,000 bytes | Legacy ceiling; active Abhaya Libre WOFF2 subsets are approximately 15 kB each. |
| Critical preloaded fonts | 620,000 bytes | Legacy ceiling; bold Abhaya Libre plus upright Figtree are now approximately 78 kB. Italic Figtree must not be preloaded. |
| Hero image | 100,000 bytes | The current SVG is below 1 kB; this leaves room for an optimized approved asset, but a future raster set should be reviewed deliberately. |
| Largest below-fold image | 100,000 bytes | Same rationale for the approved adviser portrait; responsive renditions are required before replacing the SVG. |
| Generated HTML per page | 20,000 bytes | Allows route metadata, JSON-LD and a useful no-JavaScript fallback without permitting accidental content duplication. |

The script also fails on Google Font domains, Unsplash production URLs and the GitHub preview domain. Budgets use raw emitted bytes for deterministic local/CI results; network compression varies by host.

Run independently with:

```text
npm run check:budgets
```

The production `postbuild` command runs the budgets automatically after route generation, metadata validation and internal-link validation. Adjust limits only in the single configuration file and document the measured reason.
