# Custom Domain Deployment

> Deferred. The active site currently deploys to `https://ristohajdukovic.github.io/minoconsult/` without a CNAME. Re-enable the production-domain steps below only after the DNS records are intentionally moved away from the existing host.

Production target: `https://www.mino.co.at` on GitHub Pages. Canonical URLs are generated from `.env.production`, and Vite production assets use the custom-domain root `/`.

## Repository configuration

- `public/CNAME` contains exactly `www.mino.co.at`; Vite copies it to `dist/CNAME`.
- `vite.config.js` uses `/` as the normal production base.
- `npm run deploy` runs the root-domain production build and publishes `dist` through `gh-pages`.
- `npm run build:project-preview` is available only for an optional `/minoconsult/` project-path preview. Its generated pages use `noindex, nofollow` and its robots file disallows crawling. It must not replace the production build or become an indexable duplicate public site.

## GitHub Pages and DNS checklist

1. In the repository's GitHub Pages settings, select the deployment source used by the existing `gh-pages` workflow/package and set the custom domain to `www.mino.co.at`.
2. Confirm the deployed branch contains the `CNAME` file.
3. At the DNS provider, configure the high-level record types GitHub currently requires: typically a `CNAME` for `www` pointing to the GitHub Pages hostname and the supported apex records for `mino.co.at`. Use GitHub's current documentation rather than copying registrar-specific screenshots.
4. Configure the apex domain `mino.co.at` to redirect to the canonical `https://www.mino.co.at` host, while retaining the DNS records GitHub requires for apex verification.
5. Wait for DNS propagation and GitHub's TLS certificate provisioning, then enable **Enforce HTTPS**.
6. Verify `/`, `/hr/`, `/datenschutzerklaerung`, `/hr/pravila-privatnosti`, and representative German/Croatian service deep routes directly in a fresh browser session.
7. Inspect the deployed HTML and confirm canonical and hreflang URLs use `https://www.mino.co.at`, and asset URLs begin at `/assets/` rather than `/minoconsult/`.
8. Submit `https://www.mino.co.at/sitemap.xml` in the appropriate Search Console property after launch.
9. Remove any separate GitHub project-path preview after approval, protect it from indexing, or ensure it redirects to the canonical custom domain. It must not compete with production URLs.

The production build now also verifies all generated route files, reciprocal language links, internal route reachability, structured-data consistency, the bilingual `404.html`, root-based assets, `CNAME`, and performance budgets. Test a deliberately unknown URL after deployment to confirm GitHub Pages serves the repository's lightweight recovery page.

Before changing DNS, record the current DNS values so the previous state can be restored if needed. Certificate issuance can take time after DNS becomes correct.
