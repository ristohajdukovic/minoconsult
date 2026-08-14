# Spacing token exceptions

The spacing validator reports repeated or high-risk values. The following exceptions are intentional and may remain unless the related visual system changes.

| Selector or location | Value | Reason | Permanent? |
| --- | ---: | --- | --- |
| `.skip-link` | 0.75rem inset | Keeps the keyboard recovery control visibly detached from both viewport edges | Yes |
| `.hero-image-frame::before` / `::after` | negative 1–1.25rem offsets | Existing architectural corner treatment; it does not move content or create overflow | Yes |
| `.scroll-badge` | 50% translate | Optical overlap between image and following flow; the element remains in the image component | Yes |
| `.service-editorial-item[data-active]` | 0.25rem translate | Small motion cue for the active editorial item, disabled for reduced motion | Yes |
| `.button-primary:hover`, `.button-secondary:hover`, service link hover | negative 2px translate | Existing restrained tactile feedback, not layout spacing | Yes |
| `.service-number-sticky` and number stack | fixed track height token | Required to align the animated number rail; contains no user text | Yes |
| `.hero-visual img`, `.map-frame`, image placeholders | fixed/minimum visual heights and aspect ratios | Stable media geometry prevents layout shift; no translated text is clipped | Yes |
| `.booking-overlay` / `.booking-panel` | dynamic viewport height calculations | Required for reachable dialog actions and safe internal scrolling | Yes |
| `.form-error` | 0.4rem top margin | Compact optical relationship between a control and its validation message | Review only if form typography changes |
| Decorative one-pixel rules and 0.625rem markers | non-scale dimensions | Stroke and marker geometry, not content spacing | Yes |
| `.reveal` | 22px transform | Animation offset only; normal flow is unchanged and reduced motion removes it | Yes |
| `public/404.html` inline tokens | self-contained values | The 404 document must work without the React/CSS bundle | Yes; keep synchronized with `SPACING_SYSTEM.md` |
| `.verified-fact`, `.credential-fact` desktop padding | 0.35rem block padding | Shared hairline meta-bar geometry; the credential band intentionally reuses the verified-facts strip's vertical rhythm | Yes |

No primary mobile content gutter below 20px, large negative content margin, or fixed text-container height is approved.
