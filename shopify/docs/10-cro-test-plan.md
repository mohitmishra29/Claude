# 10 · CRO test plan

Run after the redesign has been live for **2–4 weeks**, so a stable baseline exists. One test per page at a time. Use Shopify-native A/B or your testing tool with template-level variants: every variant below is a Theme Editor setting or a second template, so no code changes are needed.

**Guardrails for every test:** refund/RTO rate, COD share, AOV, and the error rate shown in the inline messages.

**Sample size:** at a ~2.5% baseline PDP→order conversion rate, detecting a 10% relative lift (80% power, α 0.05) needs roughly 60–65k sessions per arm. If traffic is lower, test bigger swings, or use add-to-cart rate as the decision metric and checkout CVR as the guardrail.

| # | Test | Hypothesis | Variant (how) | Primary metric | Secondary / guardrail | Owner |
|---|---|---|---|---|---|---|
| 1 | **Subscribe preselected** | Preselecting Subscribe & save raises subscription attach without lowering conversion, because the saving is visible at the moment of choice. | Setting "Selected by default" = Subscribe & save | Subscription attach rate (orders with a selling plan / orders) | PDP CVR (must not drop > 3%), 60-day revenue per visitor, cancellation within the first cycle | [CMO] |
| 2 | **Buy now treatment** | A Signal Teal Buy now (Carbon text) increases direct checkouts from mobile-first, COD-heavy traffic without cannibalising Add to cart AOV. | CSS variant: `.vf-cta__buy` teal fill (one line in a test template) | Checkout-initiation rate | AOV, cart abandonment, brand review: does teal stay "a signal, not the scenery"? | [CMO] / [BRAND] |
| 3 | **Proof placement** | Moving the proof chips **above** the CTA (between price and size) lifts conversion for first-time visitors, because trust is resolved before the decision. | Reorder `.vf-proof` (test template) | Add-to-cart rate, new visitors | Time to first add-to-cart, "See the evidence" clicks | [BRAND] |
| 4 | **Price framing** | Showing "≈ ₹X a day for a 10 kg dog" under the price raises conversion on the larger sizes and lifts AOV. | Per-day line on (basis filled) vs off (basis blank) | Share of orders on the largest available size | PDP CVR, AOV | [CMO] |
| 5 | **Sticky bar trigger** (mobile) | Showing the sticky bar as soon as the gallery scrolls away (not only after the CTA) increases add-to-cart on long-scroll sessions without hurting perceived quality. | JS option: observe the gallery instead of the CTA | Mobile add-to-cart rate | Scroll depth to evidence/reviews, bounce rate | [UX] |
| 6 *(optional)* | **Default size** | Defaulting to the "Most popular" size (not the first available) lifts AOV. | Set the default variant URL or variant order | AOV | CVR | [CMO] |

## Trade-offs to watch (and the team's recommendation)

| Tension | Premium side | Conversion side | Recommendation |
|---|---|---|---|
| % off pill above the fold | Keeps the editorial feel | Grabs deal hunters | **Don't run** as a test until Tests 1–4 have read out. Discount-first contradicts 9.2. Use subscription savings as the value lever. |
| Teal Buy now (Test 2) | Teal stays a signal | More visible secondary action | Test it; keep it only with a ≥ 5% lift in checkout initiation **and** no AOV loss |
| Always-on sticky bar (Test 5) | Calmer first screen | More reach | Test on mobile only |

## Event map for measurement

| Event | Fired by | Payload |
|---|---|---|
| `view_item` | Page load (`vf-pdp.js`) | GA4 `ecommerce` (currency, value, items[]) |
| `add_to_cart` | Successful `/cart/add.js` (main item) | Same, with quantity |
| `begin_checkout` | Buy now, before the hand-off | Same |
| `vf_view_item`, `vf_add_to_cart`, `vf_begin_checkout` | Shopify `analytics.publish` (custom pixel) | Same |
| `vf:variant:change`, `vf:cart:added` | DOM `CustomEvent` on `document` | For other scripts and tag managers |

Subscription attach is read from orders (selling plan present). Quiz and consult events (9.12) come later.
