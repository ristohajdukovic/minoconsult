# Spacing and layout audit

Baseline captured on 22 July 2026 from the production build before layout changes. Screenshots are generated into the ignored `artifacts/spacing/before` directory by `scripts/capture-layout-screenshots.mjs`.

## Initial system findings

- One 88rem maximum was used for nearly every layout, so prose, legal content, and wide editorial compositions lacked distinct measures.
- Section tokens stepped from 96px mobile to 160–192px desktop. Several sections also added 76–128px internal margins, creating doubled spacing.
- Mobile section overrides duplicated the root token system and made it difficult to reason about final computed values.
- Horizontal gutters were split between Tailwind breakpoints, fixed 20px decorative offsets, 24px mobile grid lines, and section-specific widths.
- Desktop service items used as much as 136px padding on both edges; the five-item list dominated overall page length.
- Legal cards expanded across the wide site container even though paragraphs were individually capped, leaving weak reading composition.
- The 768–820px header exposed the full navigation and CTA before all German and Croatian labels had comfortable room.
- The full-screen mobile appointment dialog kept a long sticky introduction visible, reducing reachable form space.
- Component-level spacing was generally sound but mixed semantic variables, Tailwind utilities, and arbitrary values.

## Section-by-section audit and implementation

| Area | Baseline outer / gutter / maximum | Baseline internal rhythm and columns | Baseline responsive behaviour and issue | Proposed change | Final implementation |
| --- | --- | --- | --- | --- | --- |
| Header and sticky header | 72–76px fixed height; shell used 20/24/32px padding inside 88rem | 32px desktop nav, 8–12px controls | Full nav appeared at 768px; sticky dropped to 64px | Align to shared gutter, defer full nav, stabilize heights | 72px normal, 68px sticky; fluid gutter; full nav from 1024px; 24–36px nav gap |
| Hero | 40/80px mobile-tablet padding; desktop `min(52rem,85svh)`; 88rem shell | 32–80px grid gap; 38rem copy, 36rem paragraph | Mobile top was tight while desktop could become overly tall | Use bounded vertical space and wide editorial shell | 32–80px fluid block padding; max 46rem desktop height; 84rem shell; 40–104px column gap; 44rem copy measure |
| Verified facts | 16px block padding in shell | 11px item padding mobile; three columns at 768px | Sound, but inherited inconsistent shell edge | Keep compact and align | Shared fluid gutter and standard container; compact item spacing retained |
| Value proposition | 80–192px section padding | Feature grid started 48–128px below statement; 96–144px columns; 74rem display measure | Desktop spacing and measure were excessive | Reserve generous token but cap it; narrow display measure | 80–152px generous padding; 64rem statement; 48–80px intro gap; 40–104px columns |
| Services introduction | 80–192px section padding | 48px rule gap, 32px lead gap, 48–128px list gap | Intro became detached from list on desktop | Keep editorial pause with bounded hierarchy | 80–152px outer; 48px rule, 32px lead, 48–80px list gap |
| Services list | Up to 136px block padding per item | 10–16rem number rail plus 64–96px gap; copy up to 62rem | Excessive page length; content and number could feel unrelated | Reduce item height and rail width; cap copy | 48–72px mobile and 64–88px desktop item padding; 8–12rem rail; 32–72px gap; 44rem paragraph measure |
| Local service links | 40–64px top separation; 56rem maximum | 20px heading group; dense border list | Good structure, slightly disconnected on wide screens | Use prose container and shared gaps | 48rem maximum with tokenized top rhythm; borders retained |
| Working process | 72–160px outer | 48px intro-to-grid; 24px grid and card padding | Desktop outer spacing too large relative to compact cards | Use standard section and 24–40px cards | 72–136px standard section; 24px internal rhythm; existing card language preserved |
| Client-fit / specialization | 72–160px outer | 24px card gap/padding | Three cards crowded as viewport approached tablet | Fluid card gap and padding | 20–40px gap; 24–36px padding; columns still content-driven at 768px |
| About | 72–160px outer; generic shell | 40px JSX gap overridden up to 104px; 24px person/biography groups | Mobile and desktop used different uncoordinated sources | Give About deliberate generous rhythm and measured copy | 80–152px outer; 40–104px image/copy gap; 44rem copy; 24px person and prose grouping |
| FAQ | 72–160px outer | 40–104px column gap; 24px triggers and answers | Intro-to-list gap was too large on mobile; desktop acceptable | Use default columns and explicit 20–24px rows | 40–72px layout gap; 20–24px trigger and answer padding; 44rem answer measure |
| Service-page hero | 72–160px outer | Up to 104px two-column gap; 44rem intro | Note separated too far on desktop | Use default section and column gap | 72–136px outer; 32–72px column gap; 44rem hero copy |
| Service information and process | 72–160px each | 32px two-column gap; 24px cards | Repeated maximum section gaps elongated service pages | Retain sections but cap standard rhythm | 72–136px outer; 32–72px columns; 24–40px repeated grids |
| Service CTA and related links | 72–160px outer | 32px CTA gap/padding; 48px related separation | Sound internally; outer space too large | Keep component rhythm under standard section | Standard outer token; 24–32px CTA internals; 48px related separation |
| Legal / privacy | 72–160px outer inside 88rem shell | 48px TOC/list top; 24px card gap and padding; paragraphs capped at 48rem | Cards remained too wide; document rhythm looked like marketing cards | Create dedicated prose container and stronger section cadence | 48rem document; 40rem intro/TOC; 32–48px section gaps; 24–32px padding; 72ch paragraphs |
| Appointment dialog | 24px overlay; 92vh panel | 20–24px panel padding; 20px form gaps; sticky header | Mobile sticky introduction consumed much of 568–844px height | Keep efficient form rhythm and let intro scroll away on mobile | 24px desktop overlay; 20–24px panel padding; 16–24px fields; 12px actions; static mobile header; 48px choices |
| Privacy dialog | 40rem maximum | 20–24px padding; 24px groups | Structure sound | Align with narrow container and control targets | 40rem retained; shared dialog padding/gaps; 44px+ actions |
| Maps consent | 20px outer inset, 288–384px height | 24–32px padding; 144–192px mark; 16px copy gap | Mobile mark used too much vertical room | Preserve dimensions while reducing decorative dominance | 24px logical inset; 24–32px padding; 112px mobile mark; 16px copy group |
| Footer | 48–80px outer | 40–64px main columns; 40–48px map gap; 24–32px legal separation | Slightly compressed desktop top, while mobile legal links were long | Use dedicated footer rhythm and predictable wrapping | 64–112px outer; 40–104px main columns; 48–64px map gap; 12/24px wrapped links |
| 404 page | 20px gutter, 76rem shell, 58rem panel | 24–64px panel padding | Panel wider than its short recovery copy | Reuse project gutter and narrow the composition | 20–80px fluid gutter; 48rem panel; 56–128px page rhythm; 44px links |

## Alignment and language review

The logo, hero, standard section headings, service content, FAQ, and footer use the same gutter formula. Hero, value, services, and footer intentionally use the 84rem wide container; normal content uses 76rem. German and Croatian share identical layout selectors and container tokens. Heading wrapping remains natural per language, with balanced wrapping applied only to headings.

## Final verification record

### Screenshot comparison

Fourteen matching before/after captures were reviewed: German home at 390, 768, 1440, and 1920px; Croatian home at 390px; services at 390 and 1440px; About at 390 and 1440px; FAQ at 390px; footer at 390 and 1440px; appointment dialog at 390px; and German privacy at 1440px.

The full-page height comparison confirms redistribution rather than indiscriminate enlargement:

| Capture | Before | After | Change |
| --- | ---: | ---: | ---: |
| German home, 390px | 13,281px | 13,389px | +0.8%; larger mobile footer/hero breathing room, not repeated section inflation |
| Croatian home, 390px | 12,702px | 12,727px | +0.2%; effectively unchanged length |
| German home, 768px | 11,518px | 10,348px | -10.2% |
| German home, 1440px | 10,714px | 9,918px | -7.4% |
| German home, 1920px | 11,104px | 10,436px | -6.0% |

Visual identity, asymmetry, service numbers, restrained cards, borders, palette, serif/sans typography, and image geometry remain recognizable. The mobile service compound now uses an invisible discretionary break so “Unternehmensberatung” wraps at a meaningful boundary.

### Viewport, reflow, and user-setting coverage

- Structural route testing: 320×568, 360×800, 375×812, 390×844, 430×932, 768×1024, 820×1180, 1024×768, 1280×800, 1440×900, and 1920×1080.
- Mobile landscape: 844×390.
- Routes: German/Croatian home, German/Croatian service, German/Croatian privacy, appointment dialog, privacy dialog, and static 404.
- Reflow: 200% CSS zoom on legal content and 320px CSS-width coverage as the equivalent 400% narrow reflow scenario.
- Increased text: existing accessibility suite at 200% root text size on long Croatian service content.
- Text spacing: WCAG line-height, paragraph, letter, and word spacing overrides with open FAQ content.
- Reduced motion: reveal, service rail, buttons, FAQ, and translated content remain in normal visible flow.

### Automated results

- `npm run check:spacing`: passed; 36 centralized spacing variables, no high-risk exceptions.
- `npm run build`: passed; 18 generated route/metadata groups, internal links, 79 bilingual content checks, and all performance budgets.
- `npm run test:spacing`: 335 checks passed.
- `npm run test:a11y`: 252 checks passed.
- `npm run test:privacy`: 53 checks passed.
- `npm run test:quality`: 173 checks passed.
- `npm run test:dev`: German/Croatian home and service smoke tests passed.

### Remaining manual review

- Test the full-height appointment sheet with the iOS virtual keyboard and Safari safe-area behaviour on a physical device.
- Confirm Windows forced-colour presentation and screen-reader reading order with assistive technology; automated focus and semantics checks pass.
- Recheck the real Google Maps iframe after consent when external Google availability and regional consent behaviour can be exercised manually.
- Replace the existing placeholder imagery only when approved real assets are available; spacing does not conceal the placeholders.

There are no unresolved automated layout, overflow, accessibility, privacy, SEO, or performance failures.
