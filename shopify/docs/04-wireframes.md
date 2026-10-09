# 4 · Low-fi wireframes

Grid: 4 columns at 390, 8 at 820, 12 at 1440. 8px unit. `═` marks a full-bleed band. The CTA is never inside an accordion, and price and the selected variant are always visible.

## Mobile · 390px (4 columns, 16px margins)

```
┌──────────────────────────────────────┐
│ Home / Gut / Nutri-Topper            │ breadcrumb (optional, 14px muted)
├══════════════════════════════════════┤
│                                      │
│        [ packshot on white ]         │ full-bleed 1:1 swipe carousel
│                                 (⌕)  │ zoom button → lightbox
├══════════════════════════════════════┤
│ ━ • • • •                      1 / 5 │ dots (shape change) + counter
│ (FOR DOGS AND CATS) (GUT)            │ eyebrow chips
│ Nutri-Topper                         │ H1 30px / 700
│ One-line approved outcome…           │ lead 17px muted
│ ★★★★★ 4.8 · 126 reviews  → #reviews  │
│ ₹999  ₹1,247                         │ price 24px tabular, compare muted
│ Inclusive of all taxes               │
│ ≈ ₹13 a day for a 10 kg dog          │
│ Size: 250 g                          │
│ ┌──────────────────────────────────┐ │
│ │ ○ 100 g                     ₹499 │ │ size rows (<480px)
│ ├──────────────────────────────────┤ │
│ │ ● 250 g [Most popular]      ₹999 │ │ 2px Carbon + teal tick
│ │   Save ₹248                      │ │
│ ├──────────────────────────────────┤ │
│ │ ○ 500 g   Back soon       ₹1,799 │ │
│ └──────────────────────────────────┘ │
│ Purchase option                      │
│ (●) One-time purchase           ₹999 │
│ ( ) Subscribe & save [Save 10%] ₹899 │ → cadence select when chosen
│ [ − 1 + ] [   Add to cart (Carbon) ] │ 52px
│ [          Buy now (outline)       ] │ 48px
│ ── proof ─────────────────────────── │
│ (⛨ Vet-approved formula)             │ chips (approved territories)
│ (⚗ Third-party tested)               │
│ (❦ Human-grade ingredients)          │
│ See the evidence →                   │
│ ── service ───────────────────────── │
│ 🚚 Delivery promise                   │
│ Check delivery to your pincode [  ][Check]
│ 💳 UPI, cards, COD · ↩ Returns         │
│ 💬 Questions? Chat with our team      │ WhatsApp
├══════════════════════════════════════┤ White band
│ AT A GLANCE                          │
│ Made for … / Format … / Flavour …    │ stacked dl rows, hairlines
│ Daily routine … / ⚠ Ask your vet if… │
├──────────────────────────────────────┤
│ GUT · What it supports               │ H2 30px
│ [◯ icon] Benefit title / support     │ 1 col (2-up from 480px)
│ …                                    │
├──────────────────────────────────────┤
│ The details (description, 720 max)   │
├══════════════════════════════════════┤ White
│ [ macro image 4:5 ]                  │
│ WHY IT WORKS · What's inside         │
│ Ingredient ··············· 500 mg    │ amount right, tabular
│ role · source · Read the research →  │
│ Full ingredient list ⌄               │
├══════════════════════════════════════┤ NIGHT PLUM
│ VET-BACKED. PET-FIRST.               │
│ What earns your trust                │
│ [◯ photo] Dr Name · credential       │ reviewer card
│ (VET-APPROVED FORMULA) claim         │ teal type chip
│ detail · View certificate · Reviewed │
├══════════════════════════════════════┤
│ ROUTINE · How to use                 │
│ (Dogs|Cats) segmented                │
│ [ Your pet's weight (kg) ____ ]      │ calculator → live result
│ Body weight │ Daily amount           │ table, active row = accent
│ 01 Scoop… 02 Sprinkle… 03 Serve…     │
│ ▢ Storage …   [⚠ Before you start]   │
├──────────────────────────────────────┤
│ What to expect                       │ vertical timeline
│ ● Weeks 1–2 · title · Track: …       │
│ ● Weeks 3–4 …                        │
│ Note + 💬 vet threshold               │
├══════════════════════════════════════┤ White
│ Reviews  4.8 ★★★★★ Based on 126       │
│ [ Judge.me widget: filters, photos ] │
├──────────────────────────────────────┤
│ Questions, answered                  │
│ Expand all · Collapse all            │
│ Q ⌄ / Q ⌄ / Q ⌄                      │ <details>
├──────────────────────────────────────┤
│ Pairs well with  [card][card]        │ + "Add both to cart"
│ Manufacturing details ⌄              │
│ [ banner ]                           │
╞══════════════════════════════════════╡ sticky bar (after the CTA scrolls away)
│ Nutri-Topper · 250 g · ₹999 [Add to cart]│ docks above the footer
└──────────────────────────────────────┘
```

## Tablet · 820px (8 columns, 32px margins, 50/50 split)

```
┌───────────────────────────────┬───────────────────────────────┐
│ [ stage 1:1, radius 24      ] │ (FOR DOGS AND CATS) (GUT)     │
│ [                           ] │ Nutri-Topper (H1 ~33px)       │
│ [                        (⌕)] │ outcome · ★ 4.8 · 126 reviews │
│ [▢][▢][▢][▢][▢] thumbs row    │ ₹999 ₹1,247 · tax · per day   │
│                               │ size rows (narrow column)     │
│                               │ purchase option               │
│                               │ [−1+][ Add to cart ]          │ CTA ~925px (visible on 1180 tall)
│                               │ [ Buy now ]                   │
│                               │ proof chips · service rows    │
└───────────────────────────────┴───────────────────────────────┘
 Quick fit: 3 columns │ Benefits: 2–3 up │ Ingredients stacked │ Evidence stacked
 How to use stacked │ Timeline 2 columns │ FAQ stacked │ Pairs 3 up
 Sticky bar active (below 1024px)
```

## Desktop · 1440px (12 columns, 72px margins, 58/42, sticky buy box)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ Home / Gut / Nutri-Topper                                                      │
├──────┬─────────────────────────────────────┬───────────────────────────────────┤
│ [▢]  │                                     │ (FOR DOGS AND CATS) (GUT)          │
│ [▢]  │      stage 1:1 on white, radius 24  │ Nutri-Topper (H1 40px, −0.03em)    │
│ [▢]  │      ‹ ›  on hover/focus            │ outcome (20px)                     │
│ [▢]  │                                     │ ★ 4.8 · 126 reviews                │
│ [▢]  │                                (⌕)  │ ₹999 ₹1,247 · tax · ≈ per day       │
│ rail │                                     │ [100 g][250 g ✓][500 g]  cards     │
│ 68px │                                     │ (●) One-time  ( ) Subscribe [10%]  │
│      │                                     │ [−1+][     Add to cart      ]      │ ← sticky buy box
│      │                                     │ [          Buy now          ]      │   (pins its bottom if taller
│      │                                     │ chips · See the evidence →          │    than the viewport)
│      │                                     │ delivery · pincode · pay · returns │
├──────┴─────────────────────────────────────┴───────────────────────────────────┤
│ AT A GLANCE  Made for │ Format │ Flavour │ Routine │ ⚠ Ask your vet first if     │ 5 columns
├────────────────────────────────────────────────────────────────────────────────┤
│ What it supports   [card][card][card][card]                                    │ 3–5 columns
├────────────────────────────────────────────────────────────────────────────────┤
│ The details (720px column)                                                     │
├────────────────────────────┬───────────────────────────────────────────────────┤
│ [ macro image, sticky ]    │ What's inside · ingredient rows                   │ 5 | 6 of 12
╞════════════════════════════╧═══════════════════════════════════════════════════╡
│ What earns your trust      │ typed evidence list                               │ PLUM 5 | 6
│ [reviewer card]            │                                                   │
╞════════════════════════════════════════════════════════════════════════════════╡
│ How to use: [calc][dose table……………]        │ 01 02 03 · storage · ⚠ callout   │ 7 | 4
├────────────────────────────────────────────────────────────────────────────────┤
│ What to expect  ●────────●────────●  (horizontal timeline)                     │
├────────────────────────────────────────────────────────────────────────────────┤
│ Reviews summary + Judge.me widget                                              │
├──────────────────┬─────────────────────────────────────────────────────────────┤
│ Questions,       │ Expand all · Collapse all                                   │ 4 | 7
│ answered (sticky)│ Q ⌄ …                                                       │
├──────────────────┴─────────────────────────────────────────────────────────────┤
│ Pairs well with [card][card][card] · Make it a routine [Add both to cart]      │
│ Manufacturing details ⌄ · banner                                               │
└────────────────────────────────────────────────────────────────────────────────┘
 1440+: content capped at 1440px, centred, 48–80px margins. 1920 tested.
```

Rendered references: `screens/fold-390.jpg`, `screens/fold-820.jpg`, `screens/fold-1440.jpg`, `screens/full-390.jpg`, `screens/full-1440.jpg`.
