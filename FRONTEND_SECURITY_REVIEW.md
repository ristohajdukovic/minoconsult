# Frontend Security Review

Private technical review, 19 July 2026.

## Checks and fixes

- Removed runtime third-party font/image dependencies and retained consent gating for Google Maps.
- Confirmed form values are held only in React state, encoded into a `mailto:` body, and never inserted as HTML, logged, stored, or placed in query parameters.
- Confirmed privacy storage uses safe JSON parsing, a fixed versioned key and a Boolean-only schema. Malformed, unavailable, full or blocked storage falls back safely.
- Added a localized clipboard failure message and retained manual copy/email options.
- Added map load failure, retry and external-link recovery without automatic retry loops.
- Removed React-rendered JSON-LD. `dangerouslySetInnerHTML` is no longer used in the browser application.
- Build-time JSON-LD uses controlled repository content, `JSON.stringify`, HTML escaping and `<` escaping.
- External new-tab links use `noopener noreferrer`. External links in the no-JavaScript fallback do not preload their destinations.
- Shared contact, address and map values now come from `src/config/site.js`; no frontend secret or sensitive environment value was found.
- Removed the current high-severity Vite development-server advisory by updating within the supported 7.x release line. `npm audit` is clean after the update.
- No production console debugging, personal-data logging, analytics, monitoring beacon, service worker, backend endpoint or client identifier was found.

## Browser and progressive-enhancement review

- `inert`, `dvh`, `text-wrap`, logical properties and IntersectionObserver are used as progressive enhancements with ordinary HTML/CSS or viewport fallbacks.
- Clipboard API failure has a manual recovery path; no large polyfill was added.
- Privacy storage access is guarded for unsupported/restricted environments.
- All generated routes now contain language-appropriate no-JavaScript navigation, service links and contact details.

## GitHub Pages limitations

GitHub Pages does not provide repository-controlled application server middleware. Security headers such as a Content Security Policy, HSTS tuning, Permissions Policy, `X-Content-Type-Options` and a custom Referrer Policy must be verified at the hosting/CDN level. No unsupported `_headers` file was added or claimed to work.

Items requiring hosting-level confirmation:

- GitHub Pages/custom-domain TLS and HTTPS enforcement.
- Current provider logging and retention behavior.
- Whether a fronting CDN or proxy will be introduced and, if so, which response headers it applies.
- Email-provider and downstream inquiry-processing controls described in `PRIVACY_LEGAL_REVIEW.md`.

