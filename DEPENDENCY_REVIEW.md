# Dependency Review

Private dependency audit, 19 July 2026.

| Dependency | Use | Action | Reason / deferred risk |
| --- | --- | --- | --- |
| `react` | Application UI | Kept | Core framework requested by the project. |
| `react-dom` | Browser rendering | Kept | Required by `src/main.jsx`. |
| `@hugeicons/react` | Icon rendering | Removed | A small fixed local SVG icon component replaces it. |
| `@hugeicons/core-free-icons` | Icon definitions | Removed | Avoids a very large source input and an unnecessary package boundary. |
| `typescript` | No TypeScript source or type-check script | Removed | Unused direct dependency. |
| `vite` | Development/build tooling | Moved to `devDependencies`; updated within 7.x | Updated from 7.3.2 to 7.3.6 to address the reported Windows development-server advisories without a major upgrade. |
| `@vitejs/plugin-react` | Vite React transform | Moved to `devDependencies`; kept on 5.x | Used by `vite.config.js`. The 6.x major is deferred until its migration/compatibility impact is reviewed. |
| `tailwindcss` | Utility expansion in `src/index.css` | Kept on 3.4.x | Actively used. The 4.x major is intentionally deferred because its configuration and PostCSS changes are outside this scoped pass. |
| `postcss` | CSS build pipeline | Kept | Required by `postcss.config.js`. |
| `autoprefixer` | Evergreen-browser CSS compatibility | Kept | Required by the PostCSS configuration. |
| `playwright-core` | Browser validation | Kept | Used by all browser test scripts; no production runtime cost. |
| `gh-pages` | Existing deployment command | Kept | Required by the current GitHub Pages publishing method. |

After the compatible Vite update and transitive patch refresh, `npm audit` reports 0 known vulnerabilities. Major upgrades were not applied blindly.

