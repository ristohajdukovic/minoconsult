# Spacing and layout system

This document describes the layout system used by the MINO Consulting KG website. It refines the existing editorial composition; it does not replace the typography, colour, border, shadow, routing, privacy, or interaction systems.

## Primitive scale

The primitives are 4px-compatible and use 8px-based primary steps.

| Token | Value | Typical use |
| --- | ---: | --- |
| `--space-0` | 0 | Explicit reset |
| `--space-1` | 0.25rem / 4px | Optical adjustment only |
| `--space-2` | 0.5rem / 8px | Icon-to-label and compact control detail |
| `--space-3` | 0.75rem / 12px | Related controls and compact metadata |
| `--space-4` | 1rem / 16px | Paragraph rhythm and related content |
| `--space-5` | 1.5rem / 24px | Heading-to-copy and component padding |
| `--space-6` | 2rem / 32px | Copy-to-actions and larger component groups |
| `--space-7` | 3rem / 48px | Section introduction to primary content |
| `--space-8` | 4rem / 64px | Compact major separation |
| `--space-9` | 6rem / 96px | Desktop compact section maximum |
| `--space-10` | 8rem / 128px | Standard section maximum |
| `--space-11` | 10rem / 160px | Reference ceiling; routine layout stays below it |

## Semantic tokens

- `--page-gutter-inline: clamp(1.25rem, 6.25vw, 5rem)` gives 20px at 320px, approximately 24px at 390px, 48px at 768px, 64px at 1024px, and a capped 80px on large screens.
- `--section-space-compact: clamp(3.5rem, 6vw, 6rem)` is for closely related transitions.
- `--section-space-default: clamp(4.5rem, 8vw, 8.5rem)` is the normal major-section rhythm.
- `--section-space-generous: clamp(5rem, 9vw, 9.5rem)` is reserved for the value, services, and About editorial moments.
- `--content-gap-xs` through `--content-gap-xl` map related content to 8, 12, 16, 24, and 32px.
- `--column-gap-default: clamp(2rem, 4vw, 4.5rem)` balances ordinary two-column layouts.
- `--column-gap-wide: clamp(2.5rem, 6vw, 6.5rem)` separates image/editorial columns without disconnecting them.
- `--prose-gap`, `--heading-gap`, and `--action-gap` express prose, heading, and control relationships.
- `--header-block-size` is 72px; the delayed sticky header uses 68px to avoid a jarring change.
- `--footer-space-block: clamp(4rem, 7vw, 7rem)` keeps the footer substantial without producing an empty final screen.

The former `--space-content-*` and `--space-section-*` names remain compatibility aliases. They resolve to this system and are not an independent scale.

## Containers and measures

| Token | Value | Purpose |
| --- | ---: | --- |
| `--container-wide` | 84rem | Hero, value, services, and footer editorial compositions |
| `--container-default` | 76rem | Normal page and section content |
| `--container-prose` | 48rem | Legal documents and long-form reading |
| `--container-narrow` | 40rem | Legal introductions, forms, and focused text groups |
| `--measure-copy` | 44rem | Ordinary lead and explanatory copy |
| `--measure-display` | 64rem | Large editorial statements |

Full-width backgrounds remain full bleed. `.section-shell` provides the standard aligned content edge. Only the hero, value, services, and footer shells opt into the wide container. Decorative rules align to the relevant shared container and may extend visually without moving primary content.

## Responsive behaviour

- Mobile begins at a genuine 20px gutter at 320px and reaches roughly 24px by 390px.
- Tablet spacing grows fluidly; layouts change columns only when content has sufficient measure.
- Primary navigation changes to the full desktop row at 1024px so Croatian labels and the CTA do not crowd the 768–820px range.
- Major gaps use bounded `clamp()` values. Small relationships remain fixed primitives.
- Large copy blocks are measured in `rem` or `ch`; translated text can grow vertically without fixed text heights.
- The mobile appointment panel remains full viewport, but its long header scrolls with the form instead of permanently consuming the available height.
- At reduced motion, reveal content occupies normal flow with no hidden layout state.

## Correct use

```css
.editorial-section {
  padding-block: var(--section-space-default);
}

.editorial-layout {
  display: grid;
  gap: var(--column-gap-wide);
}

.editorial-copy {
  max-inline-size: var(--measure-copy);
}
```

Use `gap` on a parent for repeated relationships. Use component padding for component interiors. Use logical properties (`padding-inline`, `margin-inline`, `max-inline-size`) for page structure.

## Misuse to avoid

- Do not add another global spacing scale or one-off near-duplicate custom properties.
- Do not combine major section padding with a second major top margin on its first child.
- Do not use a negative margin to compensate for an oversized parent gap.
- Do not assign fixed heights to headings, paragraphs, FAQ answers, legal cards, or translated content.
- Do not make every section generous; hierarchy depends on compact, default, and generous categories remaining distinct.
- Do not bypass the 20px minimum mobile gutter for primary content.

## Exceptions

Small optical offsets, one-pixel rules, image aspect ratios, animation transforms, and control dimensions are not spacing tokens. Approved exceptions are listed in `SPACING_TOKEN_EXCEPTIONS.md`.
