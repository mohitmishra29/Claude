# Vettofit PDP v1.0: Shopify section + redesign pack

Replaces the custom "NM PDP v6.1" product section. Governed by the Vettofit Brand Identity System v4 (Ch. 5 claims, Ch. 6 visual identity, Ch. 9 Shopify system), with these client overrides:

- **Typeface:** Helvetica family.
- **Buy now:** hands off to Razorpay checkout.
- **Reviews:** Judge.me.

## Confirmed setup (Phase 0)

| # | Topic | Decision |
|---|---|---|
| 1 | Font | Helvetica system stack; optional licensed Helvetica Now via `snippets/vf-fonts.liquid` |
| 2 | Species / accent | `vf.species` metafield; Nutri-Topper = Gut, Salmon Oil = Skin & Coat |
| 3 | Subscription | Selling plans (app-agnostic); hidden when none; one-time selected by default |
| 4 | Purchase stack | Carbon Add to cart + outline Buy now; **Razorpay** checkout hand-off; compare-at shown as a muted strikethrough, no % pill |
| 5 | Market | India-first (INR, "Inclusive of all taxes", COD line); pincode check built but hidden until an endpoint exists; Markets-safe money |
| 6 | Variants / cart | Size cards; "Most popular" from a variant metafield; unit price via Shopify; cap 10 per variant; stepper only sets the add quantity |
| 7 | Cross-sell | `vf.pairs_with` → complementary recommendations fallback; "Add both" at normal prices |
| 8 | Reviews | **Judge.me** app block in the Reviews zone; rating fallbacks kept |
| 9 | Content | Full `vf.*` metafield/metaobject model; zones hide when empty; placeholders only in the Theme Editor |
| 10 | Imagery | Packshot first (LCP), then ritual, texture, infographic, lifestyle, video |
| 11 | Architecture | One section + focused snippets + shared token CSS + deferred JS; `icons-neumorphic` retired |
| 12 | Support | WhatsApp click-to-chat with prefilled product name + hours |

## Deliverables

| # | Deliverable | File |
|---|---|---|
| 1 | Research report | [`docs/01-research.md`](docs/01-research.md) |
| 2 | Code audit (+ preserved-feature and settings maps) | [`docs/02-code-audit.md`](docs/02-code-audit.md) |
| 3 | Design rationale + before/after | [`docs/03-design-rationale.md`](docs/03-design-rationale.md) |
| 4 | Wireframes 390 / 820 / 1440 | [`docs/04-wireframes.md`](docs/04-wireframes.md) · renders in [`docs/screens/`](docs/screens) |
| 5 | Hi-fi spec: tokens, type scale, component states | [`docs/05-hifi-spec.md`](docs/05-hifi-spec.md) |
| 6 | Production code | `sections/`, `snippets/`, `assets/`, `templates/` (below) |
| 7 | Metafield / metaobject setup | [`docs/07-metafields.md`](docs/07-metafields.md) |
| 8 | Installation + rollback | [`docs/08-installation-rollback.md`](docs/08-installation-rollback.md) |
| 9 | QA checklist | [`docs/09-qa-checklist.md`](docs/09-qa-checklist.md) |
| 10 | CRO test plan | [`docs/10-cro-test-plan.md`](docs/10-cro-test-plan.md) |

## Code

```
sections/vf-pdp.liquid            section, logic, {% schema %}
snippets/vf-pdp-gallery.liquid    gallery, thumbs, lightbox
snippets/vf-pdp-buybox.liquid     buy box, product form, variant JSON
snippets/vf-pdp-story.liquid      quick fit · benefits · about · why it works
snippets/vf-pdp-proof.liquid      evidence band · how to use · what to expect
snippets/vf-pdp-faq.liquid        FAQ (<details>)
snippets/vf-pdp-pairs.liquid      pairs well with
snippets/vf-pdp-schema.liquid     Product / Offer / AggregateRating / BreadcrumbList / FAQPage JSON-LD
snippets/vf-icon.liquid           monoline icons
snippets/vf-fonts.liquid          optional Helvetica Now webfont
assets/vf-tokens.css              shared token layer (load in theme.liquid)
assets/vf-pdp.css                 section styles (≈9 KB gzipped)
assets/vf-pdp.js                  behaviour, deferred (≈10 KB gzipped)
templates/product.vettofit.json   alternate product template (safe rollout/rollback)
```

## How it was verified
- **Shopify Theme Check 3.30:** no errors. Two warnings are expected: `ExcessiveSettingsCount` (a lint guideline; v6.1 already shipped ~70 settings) and `MissingAsset` for the optional font files.
- **Local render:** LiquidJS with Shopify filter stubs and demo data, then headless Chromium at 360, 390, 414, 768, 820, 1024, 1280, 1440 and 1920. Results:
  - no horizontal scroll at any width;
  - every embedded JSON and JSON-LD block parses;
  - one H1;
  - interaction tests pass: variant pricing, OOS, subscription, quantity cap, sticky bar, keyboard add, Buy now de-duplication, error path, dosage calculator, FAQ, lightbox, dataLayer events.
- **Not yet verified on a real store:** the theme cart drawer, Razorpay Magic Checkout, Judge.me and the selling-plan app. See `docs/09-qa-checklist.md`.

All product copy in the demos and placeholders is marked `[PLACEHOLDER: needs vet/claim approval]`. No claims, reviewers, certifications or statistics are invented in the code.
