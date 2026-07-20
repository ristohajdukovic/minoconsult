# Accessibility and responsive changes

## Issues found

- No skip link or stable focusable main target.
- Duplicate normal and sticky navigation could remain confusing without strict inert/exposure management.
- Mobile menus lacked `aria-controls`, Escape handling, focus placement/restoration, and scroll locking.
- The appointment dialog did not trap or restore focus and did not expose field-level validation semantics.
- Choice controls did not expose pressed state, and form controls lacked useful names/autocomplete metadata.
- FAQ answers used a fixed maximum height that could clip longer or enlarged content.
- Several muted text combinations were below or close to WCAG AA contrast requirements.
- Mobile hero imagery collapsed to a short 128px strip.
- Large mobile service numbers reduced the width available to long German and Croatian headings.
- Reduced-motion handling covered only a subset of transitions.
- Repeated service links lacked destination context in their accessible names.
- Images lacked explicit intrinsic dimensions, and the below-the-fold stock portrait could be mistaken for the named adviser because of its placement.

## Fixes implemented

- Added localized skip links and `#main-content` with a reliable focus target.
- Kept only one header exposed and keyboard-reachable at a time with `inert` and `aria-hidden`.
- Added reusable mobile-menu focus, Escape, restoration, `aria-controls`, and body-scroll behavior.
- Added full dialog focus placement, trapping, Escape closing, exact opener restoration, inert background content, and layout-shift-safe scroll locking.
- Added persistent labels, names, autocomplete values, appropriate input types, required/invalid states, field errors, and a focused error summary.
- Added `aria-pressed` to single-choice mode and time buttons and grouped them with `fieldset`/`legend`.
- Replaced the fixed FAQ height with a content-sized CSS grid expansion and labelled answer regions.
- Added a consistent high-visibility focus system and strengthened low-contrast text.
- Added localized screen-reader context to repeated service links and new-tab map/legal links.
- Marked the stock portrait decorative and added intrinsic image dimensions. The hero remains eager/high-priority and uses a stable responsive crop.
- Changed the mobile hero to approximately 4:3, tablet imagery to 3:2, and preserved the desktop editorial crop.
- Moved mobile service numbers above headings, reduced only mobile section spacing, and added safe wrapping/minimum-width defenses.
- Made the mobile dialog a dynamic-viewport full-screen sheet with a sticky header and internal scrolling.
- Expanded reduced-motion rules to reveal, service-number, highlighted-text, FAQ, menu, sticky-header, hover-translation, and button transitions.
- Marked materially useful retained Austrian German terms with `lang="de"` on Croatian pages.

## Files changed for this pass

- `src/App.jsx`
- `src/index.css`
- `src/content/de/home.js`
- `src/content/hr/home.js`
- `scripts/test-accessibility.mjs`
- `package.json`
- `ACCESSIBILITY_CONTRAST_REVIEW.md`
- `ACCESSIBILITY_AND_RESPONSIVE_CHANGES.md`

## Validation and automated results

- `npm run build`: passed.
- Multilingual generated-output validation: 18 routes passed canonical, hreflang, title, language, JSON-LD, sitemap, and robots checks.
- `npm run test:a11y`: 249 browser checks passed.
- `npm run test:dev`: German and Croatian home/service development routes passed.
- Browser console errors: none.
- No duplicate page H1 was found on any generated route.
- Every rendered image had an `alt` attribute.
- Every appointment form input, select, and textarea had an accessible name.
- No tested route or long heading overflowed horizontally.
- Reduced-motion mode rendered all reveal content visibly and disabled service-number animation.

## Viewports tested

- 320 × 568
- 360 × 800
- 375 × 812
- 390 × 844
- 430 × 932
- 768 × 1024
- 820 × 1180
- 1024 × 768
- 1280 × 800
- 1440 × 900
- 390 × 568 appointment-dialog viewport
- 390px and 1024px layouts with the root text size increased to 200%

German and Croatian homepages were checked throughout the viewport matrix, with the long Croatian entrepreneur-advice route used as an additional overflow case. A long Croatian FAQ answer was checked at 320px.

## Visual regression checks

Before and after viewport screenshots were reviewed for:

- 390px German homepage
- 390px Croatian homepage
- 768px German homepage
- 1440px German homepage
- 390px appointment dialog
- 1440px German service page

The desktop composition, typography, palette, border language, and editorial proportions remain intact. Intentional mobile differences are the taller hero crop, slightly tighter section rhythm, readable full-width CTAs, service numbers above headings, and the full-screen appointment sheet.

## Remaining manual-review items and limitations

- Automated browser checks do not replace testing with NVDA, JAWS, VoiceOver, or TalkBack.
- Keyboard behavior should receive a final manual pass in Safari/iOS because dynamic viewport and virtual-keyboard behavior varies by browser version.
- Windows High Contrast and other forced-colour modes should be reviewed manually.
- Google Maps iframe accessibility is controlled by Google.
- With JavaScript completely disabled, the current Vite client-rendered page body does not render; resolving that would require prerendering/SSR and is outside this scoped accessibility pass.
- The external stock-image and Google Fonts requests remain existing third-party dependencies; this task did not perform the separate image/font privacy-localisation refactor.
