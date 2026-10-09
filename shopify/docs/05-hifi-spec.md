# 5 · High-fidelity spec

The source of truth is `assets/vf-tokens.css` (the shared token layer) and `assets/vf-pdp.css` (components). This page explains them.

## 5.1 Design tokens

```css
/* colour */
--vf-carbon:#111111  --vf-chalk:#F7F5EF  --vf-white:#FFFFFF  --vf-teal:#09D1C7  --vf-plum:#2B1B3A
--vf-accent-skin-coat:#FF8A74  --vf-accent-gut:#D8F36A  --vf-accent-daily:#F2D16B  (+ calm, dental, joints, immunity, grooming)
--vf-accent: per product via .vf-accent--{need}
--vf-carbon-hover:#2B2B2B   --vf-ink-muted:#55534E (7.0:1)   --vf-ink-subtle:#6B6964 (5.0:1)
--vf-line:#E4E1D8 (decorative)   --vf-line-strong:#8A877F (3.3:1, control borders)
--vf-surface-sunk:#EFECE4   --vf-on-dark-muted:#D3CBDD (10.1:1 on Plum)   --vf-error:#B3261E   --vf-success:#1F6B45
/* type */
--vf-font-system:"Helvetica Neue",Helvetica,Arial,sans-serif   --vf-font-text / --vf-font-display
/* shape */
--vf-radius-card:24px  --vf-radius-card-sm:20px  --vf-radius-control:14px  --vf-radius-button:12px  --vf-radius-chip:999px
/* space */
--vf-space-1..8: 4 8 16 24 32 48 64 96   --vf-zone-pad: clamp(48px,6vw,96px)
/* grid */
--vf-max:1440px  --vf-measure:720px  --vf-cols:4|8|12  --vf-gutter:16|20|24|32  --vf-margin:16|20|32|40|48|48–80
/* interaction & motion */
--vf-touch:44px  --vf-touch-commerce:48px  --vf-cta-height:52px  --vf-focus:2px solid Carbon (+2px offset; Teal on Plum)
--vf-motion-fast:180ms  --vf-motion-base:260ms  --vf-motion-sheet:280ms  --vf-ease-out:cubic-bezier(.22,.61,.36,1)
```

All contrast pairs were checked with the WCAG formula:

| Pair | Ratio |
|---|---|
| Carbon on Chalk | 17.3:1 |
| Carbon on Teal | 9.9:1 |
| White on Plum | 15.9:1 |
| Teal on Plum | 8.3:1 |
| Carbon on Gut accent | 15.2:1 |
| Carbon on Skin & Coat accent | 8.2:1 |
| Ink-subtle on Chalk | 5.0:1 |
| Error on Chalk | 6.0:1 |
| Teal on Chalk | **1.8:1** |

Teal on Chalk fails, so teal is never used for text on light surfaces or as the only indicator of a state.

## 5.2 Type scale (Helvetica; brand book 6.7 sizes, client typeface)

| Token | Mobile | Desktop | Weight / LH | Tracking | Used for |
|---|---|---|---|---|---|
| Display XL | 48 | 88 | 700 / 0.98 | −0.03em | Campaign only (not on the PDP) |
| H1 editorial | 38 | 64 | 700 / 1.05 | −0.03em | Editorial heroes |
| **H1 product** | **30** | **40** | 700 / 1.05 | −0.02 → −0.03em | PDP product name (a PDP-specific deviation: 52–64px pushes the CTA below the fold) |
| H2 | 30 | 48 | 700 / 1.1 | −0.02em | Zone headings |
| H3 | 24 | 34 | 700 / 1.15 | −0.02em | "The details", reviews score |
| H4 | 18 | 21 | 700 / 1.3 | −0.01em | Card / ingredient / evidence titles |
| Lead | 17–18 | 20–22 | 500 / 1.4 | 0 | Outcome line, zone intros |
| Body | 16 | 17 | 400 / 1.55 | 0 | Paragraphs (never below 16 on mobile) |
| Small | 14 | 14 | 400–500 / 1.45 | 0 | Meta, service rows, captions |
| Micro (caps) | 12 | 12 | 500 / 1.3 | +0.08em | Eyebrows, chips, table heads: the only ALL CAPS |
| Price | 24 | 30 | 700, tabular | −0.01em | Current price |

Behaviour:
- Sentence case everywhere.
- Long health copy is left-aligned with a 55–75 character measure.
- `font-variant-numeric: tabular-nums` on prices, dosage, quantities and counters.
- `text-wrap: balance` on headings.
- Weight 500 falls back to 400 on Arial (Windows), which is accepted.

## 5.3 Component specs and states

| Component | Default | Hover | Focus-visible | Active | Disabled | OOS | Loading |
|---|---|---|---|---|---|---|---|
| **Primary button** (Add to cart) | Carbon fill, white 16/500, 52px, radius 12 | `--vf-carbon-hover` | 2px Carbon outline, 2px offset | translateY(1px) | Sunk surface, subtle ink, `not-allowed` | Label "Back soon" + disabled; message "Back soon. Get an alert when it returns." with an optional link | `aria-busy`, label hidden, 18px spinner (static under reduced motion) |
| **Secondary button** (Buy now) | Transparent, 1px Carbon border, 48px | Inset 1px → reads as 2px border | Same outline | translateY(1px) | As above | **Hidden** (no dead buttons) | Spinner in Carbon |
| **Text action** | Carbon 500, 1px underline, 4px offset | 2px underline; arrow nudges 2px | Outline | — | — | — | — |
| **Size card** (radio) | White, 1px `line-strong`, radius 14, ≥76px (rows: ≥56px) | Carbon border | Outline on the card face | — | — | Price struck through + "Back soon" text (still selectable, so alerts can be triggered) | — |
| Size card **selected** | 2px Carbon (inset) + Teal disc with Carbon tick | | | | | | |
| **Option button** (multi-option) | 48px, radius 14 | Carbon border | Outline | Selected: 2px Carbon | — | Strikethrough + SR text "— back soon"; impossible combination: dashed + "— unavailable" | — |
| **Purchase option** row | 52px, radius 14, custom radio | Carbon border | Outline | Selected: 2px Carbon + filled dot | — | — | — |
| **Save tag** | Teal fill, Carbon text, pill | — | — | — | Hidden if 0% | — | — |
| **Qty stepper** | 52px, 48 + 40 + 48 | — | Outline per control | — | − at 1, + at max/limit: `line-strong` colour | — | — |
| **Proof chip** | White, 1px hairline, pill, 36px, icon + text | — | — | — | — | — | — |
| **Chip** (eyebrow) | 12/500 caps, 1px `line-strong`; accent variant = accent fill; status = Carbon fill | — | — | — | — | — | — |
| **Accordion** (`<details>`) | 60px summary, hairlines, chevron | — | Inset outline | Open: chevron 180° | — | — | — |
| **Gallery thumb** | 64–68px, radius 12, 72% opacity | 100% | Outline | Current: 2px Carbon + `aria-current` | — | — | — |
| **Gallery arrows** | 48px white square; hidden below 1024; appear on hover/focus | Carbon border | Visible | — | — | — | — |
| **Sticky bar** | White, hairline + soft float shadow, 48px buttons | — | — | Slides in 280ms ease-out | `inert` while hidden | Label "Back soon", disabled | Spinner |
| **Input** (pincode, weight) | 48px, radius 14, 16px text (prevents iOS zoom) | Carbon border | Outline | — | — | Invalid: error border + message | "Checking…" |
| **Message** (OOS / limit / error / added) | White, hairline, radius 14, icon + text | — | — | — | — | — | Error: red border + `role="alert"`; added: green tick + "View cart" |

Motion:
- Hover/press 180ms.
- Sheet/sticky 280ms.
- Lightbox fade 280ms.
- No bounce or confetti.
- `prefers-reduced-motion` reduces all transitions to near-zero and keeps button labels visible during loading.
- A `forced-colors` mode fallback outlines selected states.

## 5.4 Icon set (`snippets/vf-icon.liquid`)

24px grid, 1.5px stroke, round caps and joins, `currentColor`, always paired with text, no paw icons.

- **Commerce:** check, chevrons, arrow-right, plus, minus, close, zoom, play, star (filled), truck, pin, wallet, return, chat.
- **Proof:** shield-check, beaker, leaf, study.
- **Benefits:** digestion, skin, coat, immunity, joints, energy, heart, calm, dental, appetite, bowl, drop.
- **Utility:** user, clock, calendar, scale, box, info, alert.
