# Font asset review

Updated 20 July 2026 after the owner supplied `Abhaya_Libre.zip` and requested it as the primary typeface.

## Active families

- Display headings and editorial service numbers: Abhaya Libre.
- Body copy, navigation, controls and H3 headings: Figtree.
- Both families are hosted locally. No font CDN is contacted.

## Supplied and generated assets

- The supplied Abhaya Libre archive contained regular, medium, semibold, bold and extrabold TTF files plus the SIL Open Font License.
- The active German and Croatian character set was subset into local WOFF2 files for weights 400, 600 and 700.
- Generated sizes are 15.12 kB regular, 15.40 kB semibold and 15.38 kB bold. The original TTF files are not shipped.
- The supplied OFL text is retained at `src/assets/fonts/abhaya-libre/OFL.txt`.
- Figtree remains available as upright and italic variable TTF files for body copy.

## Delivery decisions

- The bold Abhaya file is preloaded because the homepage H1 uses weight 700.
- Upright Figtree is preloaded for body and navigation text.
- Semibold Abhaya, regular Abhaya and italic Figtree load only if the rendered page needs them.
- `font-display: swap` remains enabled and the fallback stack uses Georgia/Times for display text and system sans-serif for body text.
- Synthetic italic remains allowed because the supplied Abhaya archive contains no italic face; emphasized display fragments retain the established visual treatment.

The previous Hepta Slab source remains in the working tree as an inactive historical asset and is not emitted by the production build.
