# Accessibility contrast review

## Method

Approximate WCAG contrast ratios were calculated from the CSS colour values after alpha compositing against the intended solid background. The review targeted normal text at 4.5:1, large text at 3:1, and meaningful controls/focus indicators at 3:1.

## Checked combinations

| Foreground and background | Approximate ratio | Result |
| --- | ---: | --- |
| Forest `#0A1C1A` on cream `#DEECE6` | 14.45:1 | Pass for text and controls |
| Body text `#1F2937` on cream `#DEECE6` | 12.06:1 | Pass for text |
| Muted forest at 72% on cream | 6.37:1 | Pass for normal text |
| Rose `#B86A64` on cream | 3.26:1 | Pass for focus/control boundaries; not used for normal small text |
| Forest `#0A1C1A` on rose-light `#F4E5E3` | 14.38:1 | Pass for error and tag text |
| White on dark footer `#071C18` | 17.67:1 | Pass for text and controls |
| White at 70% on dark footer | 9.07:1 | Pass for normal text |
| Neutral 600 `#525252` on neutral 100 `#F5F5F5` | 7.17:1 | Pass for booking privacy text |

## Changes made

- Replaced small `text-forest/45`, `/50`, `/55`, and borderline `/60` uses with the shared 72% muted-forest value where the text conveys information.
- Increased footer label text from 45% to 70% white.
- Changed rose text on rose-light tags and errors to forest while retaining rose as a brand accent and boundary.
- Increased inactive language-link contrast and added an underline to the active language so the state is not communicated by colour alone.
- Raised inactive highlighted-word contrast so the editorial scroll effect no longer makes meaningful text unreadably faint.
- Changed booking privacy text to neutral 600 on neutral 100.
- Added a three-pixel rose focus outline with offset on light surfaces and a white outline in the dark footer.

## Manual visual confirmation

- Translucent cream and white surfaces can composite differently over the architectural background; representative rendered pages were checked, but final device-level confirmation is still advisable.
- The rose focus outline meets the 3:1 non-text threshold on the primary cream and white surfaces. Confirm it remains clearly perceptible on every translucent card in forced-colour and high-contrast operating-system modes.
- Google Maps iframe controls are rendered by a third party and cannot be fully controlled by this stylesheet.
- Stock imagery should be checked on the final production image delivery path because loading failures or provider-side crop changes can alter adjacent visual context.
