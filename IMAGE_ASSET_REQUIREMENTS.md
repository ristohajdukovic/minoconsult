# Image Asset Requirements

Private production asset brief. The current website uses clearly named local SVG placeholders so no remote stock image is fetched and no unknown person is presented as the named adviser.

| Required filename | Website location | Recommended dimensions | Ratio and crop | German alt-text draft | Croatian alt-text draft | Authenticity requirement | Licence status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `public/images/hero/mino-office-consultation.jpg` (prefer additional WebP/AVIF versions) | Homepage hero | 1600 × 1067 px minimum | 3:2 or current 1400:933 frame; calm horizontal crop with useful negative space | `Beratungsgespräch im Büro von MINO Consulting KG in Wien` | `Savjetovanje u uredu društva MINO Consulting KG u Beču` | Must show the real MINO office and/or an approved real consultation; do not identify unknown people | Not supplied; owner must provide source and publication permission |
| `public/images/team/tomislav-siketic.jpg` (provide WebP/AVIF production versions plus the original source) | About/principal section | Minimum 1600 px on the long edge | 4:5 portrait orientation; head-and-shoulders crop with a mobile-safe centre and a neutral office or plain background | Alt text must be approved in German before publication | Alt text must be approved in Croatian before publication | Must be the real adviser with written permission for website use | Not supplied; owner must provide the original source and written publication permission |
| `public/images/social/mino-og-image.jpg` | Open Graph/social sharing metadata once implemented | 1200 × 630 px | 1.91:1; logo and concise brand treatment inside safe margins | Not applicable to normal page content; social image may use empty alt metadata unless a platform-specific field is added | Same | Must use approved MINO branding and any approved real imagery | Not supplied |
| `public/images/team/tomislav-client-meeting.jpg` | Optional process/about support | 1600 × 1067 px minimum | 3:2; natural consultation moment without staged paperwork | `Beratungsgespräch mit Mag. Tomislav Siketic im Wiener Büro` | `Razgovor s Mag. Tomislavom Siketicem u uredu u Beču` | Real adviser and client/participant with written publication permission | Not supplied |
| `public/images/office/mino-office-interior.jpg` | Optional contact/about support | 1600 × 1067 px minimum | 3:2; recognizable real workspace, no confidential documents | `Innenraum des Büros von MINO Consulting KG in Wien` | `Unutrašnjost ureda MINO Consulting KG u Beču` | Must show actual premises | Not supplied |
| `public/images/office/mino-entrance.jpg` | Optional location support | 1200 × 1500 px minimum | 4:5 or 3:4; entrance and useful wayfinding context | `Eingang zum Büro in der Geblergasse 95/8` | `Ulaz u ured u Geblergasse 95/8` | Must show actual entrance; check address/security details before publication | Not supplied |
| `public/images/office/mino-detail.jpg` | Optional neutral editorial image | 1600 × 1067 px minimum | 3:2; real architectural or desk detail, no personal data | `Detailaufnahme aus dem Wiener Büro` | `Detalj iz ureda u Beču` | Must be a real location detail, not stock photography | Not supplied |
| `public/images/team/mino-team.jpg` | Optional team section, only if a team is confirmed | 1600 × 1067 px minimum | 3:2; current staff, natural spacing and mobile-safe crop | Confirm names/roles before drafting alt text | Confirm names/roles before drafting alt text | Every person must be current and have publication permission | Not supplied |

Current placeholders:

- `public/images/hero/mino-office-consultation-placeholder.svg`
- `public/images/team/tomislav-siketic-placeholder.svg`

Portrait delivery must include the original source file and production-ready WebP and AVIF renditions. Confirm the final 4:5 crop, neutral office or plain background, written website-use permission, and localized German and Croatian alt text with the customer before enabling the portrait in configuration.

The retained placeholder files are not used by the current homepage. The hero and adviser sections render intentional local brand fallbacks until approved photography, identities, localized alt text and rights are confirmed. When real files are enabled, keep intrinsic dimensions and responsive `sizes`, then provide AVIF/WebP renditions and `srcset`.

Do not use a generic professional portrait beside Tomislav’s name. Until an approved real portrait exists, retain the typographic MINO identity panel.
