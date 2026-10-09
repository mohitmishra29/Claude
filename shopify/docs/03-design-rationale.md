# 3 · Design rationale: the premium direction on one page

**The idea:** *Editorial Wellness*. The PDP should read like a well-edited wellness magazine spread that happens to have a buy button, not like a marketplace listing.

**Luxury through restraint:**
- A warm Chalk canvas.
- Carbon type in Helvetica, 700 weight with tight tracking.
- 1px hairlines instead of shadows.
- One category accent per product.
- Teal only where something is *selected* or *signalled*.

**Trust through clarity:** evidence sits next to the decision. Every claim on the page comes from a typed, dated metaobject. Nothing is hard-coded in the theme.

**Youth through contrast:**
- Big type against quiet space.
- A Night Plum evidence band in the middle of a light page.
- Teal "Save 10%" and selected-state ticks as small, sharp moments.

## The three calls that mattered

| Decision | Trade-off | Recommendation |
|---|---|---|
| **Primary CTA style** [UX/BRAND] | Orange (old) is loud and converts by contrast. Carbon is calmer and more premium. | **Carbon fill, white text, 52px, rectangular, radius 12.** It is still the highest-contrast element on a Chalk page (17:1). A/B test 2 checks it against a teal-fill secondary Buy now. |
| **Discount display** [CMO vs BRAND] | % off pills lift click-through on deal hunters but cheapen the brand (9.2 "editorial before promotional"). | **Compare-at price as a small muted strikethrough near the price; "Save ₹X" on the size cards; "Save X%" on the subscribe row.** No % pill near the title. The saving shows up exactly where the choice is made. |
| **Buy now** [CMO] | Two equal CTAs split attention. Removing Buy now hurts Indian direct-checkout behaviour (COD/UPI via Razorpay). | **Keep it as an outline secondary** under the primary. Hand-off goes through the theme checkout button so Razorpay Magic Checkout can intercept. |

## Before / after, zone by zone

| Zone | Before (NM v6.1) | After (Vettofit PDP v1.0) | Driver |
|---|---|---|---|
| Typography | Poppins from Google Fonts, 800–900 weights, uppercase labels | Helvetica stack, 700 display with −0.02 to −0.03em tracking, sentence case, tabular numerals | [BRAND] |
| Colour | Blue-grey background, orange CTA, navy Buy now, neumorphic shadows | Chalk/White ~70%, Carbon/Plum ~20%, Teal ~5%, one accent ~5% | [BRAND] |
| Gallery | Opacity stack capped at 500px, JS swipe, all images load, LCP lazy | Scroll-snap carousel; desktop thumb rail; eager LCP; zoom lightbox; video support | [UX] |
| Title | Two H1s (mobile/desktop) | One H1 at 30–40px, plus eyebrow chips (species · need · status) | [UX] |
| Outcome | None | One approved outcome line (`vf.outcome_line`) | [BRAND] |
| Rating | ★ characters in orange, no anchor | Carbon SVG stars, "4.8 · 126 reviews", links to the reviews zone, accessible label | [UX] |
| Price | Theme price snippet; never updates on variant change | Tabular price, muted compare-at, tax note, unit price, per-day cost (approved basis only) | [CMO] |
| Variants | Neumorphic pill buttons | Size cards with price, unit price, "Save ₹X", "Most popular" and "Back soon"; rows on narrow columns | [CMO] |
| Purchase | No subscription | One-time vs Subscribe & save (selling plans), cadence select, teal savings tag | [CMO] |
| CTAs | Orange ATC + navy Buy now, equal weight; hidden on mobile | Qty stepper + Carbon ATC; outline Buy now; in-page at every width | [UX/CMO] |
| Proof | 2-up trust badges with custom colours | 3 proof chips (approved territories) + "See the evidence →" | [BRAND] |
| Reassurance | None | Delivery, pincode check, payments/COD, returns, WhatsApp support | [CMO] |
| Quick fit | None | Made for · Format · Flavour · Routine · Ask your vet first if | [BRAND] |
| Benefits | None | 3–5 cards with monoline icons on the accent disc | [BRAND] |
| Description | Always-open card with an orange top border | "The details", long-form at 720px, optionally collapsed | [UX] |
| Ingredients | None | Editorial split: macro image + list with amount, role, source and research link | [BRAND] |
| Evidence | None | Night Plum band: vet reviewer card + typed, dated evidence with certificates | [BRAND] |
| How to use | None | Dosage table by weight (dogs/cats switch) + calculator + steps + storage + safety callout | [UX] |
| What to expect | None | Timeline with what to track + mandatory vet threshold (5.5) | [BRAND] |
| Reviews | Not on page | Summary + Judge.me app block slot | [CMO] |
| FAQ | Div accordions, duplicate microdata | `<details>` accordion, product + shared FAQs, a single FAQPage JSON-LD | [UX] |
| Cross-sell | None | "Pairs well with" (curated or complementary recommendations) + "Add both" | [CMO] |
| Mfg + banner | Neumorphic card, banner without dimensions | Hairline disclosure; art-directed `<picture>` | [UX] |
| Sticky bar | Always on at ≤768px, glassy, two CTAs, keyboard-dead | Appears after the CTA scrolls away; shows variant + price + CTA; docks above the footer; keyboard-safe | [UX] |

## Colour ratio check (desktop, full page with demo content)

| Family | Approx. share | Target |
|---|---|---|
| Chalk / White | ~70% | 65–75% ✔ |
| Carbon / Night Plum | ~20% (type, CTA, evidence band, footer excluded) | 15–25% ✔ |
| Signal Teal | ~3–5% (selected tick, save tag, evidence type chips, vet monogram) | 5–10%: at the low end on purpose; teal is a signal |
| One category accent | ~4% (need chip, benefit discs, timeline markers, active dose row) | 0–10% ✔ |

Reference renders with demo data are in `docs/screens/`. They were rendered locally in headless Chromium on Linux, where Helvetica falls back to a generic sans-serif.
