# 2 · Code audit: "NM PDP v6.1" (`pdp-section.liquid`, ~1,550 lines)

**Severity scale**
- **Critical:** revenue, trust or legal risk, or a buying path that's broken for some users.
- **High:** clear conversion, SEO or accessibility loss.
- **Medium:** a quality or performance cost.
- **Low:** hygiene.

Each finding names the construct in v6.1 and where it's fixed in v1.0. Two findings are inferred from reading the code rather than observed on the live store. They're marked "verify".

## Critical

| ID | Finding | Evidence in v6.1 | Impact | Fix in v1.0 |
|---|---|---|---|---|
| C1 | **The product form gets a literal, un-interpolated id**, so the desktop AJAX handlers never bind (**verify** in the live DOM) | `{% form 'product', product, id: 'nm-form-{{ section.id }}' … %}`. Liquid doesn't evaluate `{{ }}` inside a tag's string argument, so the id is literally `nm-form-{{ section.id }}`. Every `#nm-form-<id>` lookup in JS returns `null`, and the submit/click capture listeners never attach. | Desktop **Add to cart falls back to a native POST to /cart/add**, a full page redirect to /cart instead of the drawer. Silent conversion loss. | `assign form_id = 'VfPdpForm-' \| append: sid`, then `id: form_id` (`vf-pdp-buybox.liquid`) |
| C2 | **Buy now can add the item twice** | `buyBtn` listens to both `click` **and** `pointerup`, plus document-level capture listeners for both. `stopImmediatePropagation` only stops one *event*: `pointerup` and `click` are separate events, so `doBuyNow` runs twice per tap. | Quantity doubled at checkout, plus a race between two redirects. Trust and refund cost. | One `click` listener plus one in-flight lock (`this.busy`). Tested: three rapid taps → one `/cart/add.js` call, one checkout hand-off |
| C3 | **Price doesn't change when the variant changes** | The price comes from `{% render 'price' %}` server-side, and `setVariant()` never updates it | A shopper choosing 500 g still sees the 100 g price until checkout. Pricing trust and consumer-law risk. | `update()` re-renders price, compare-at, unit price, per-day cost and sticky price from server-formatted variant JSON. Tested: ₹999 → ₹499 on change |
| C4 | **Sticky Add/Buy can't be used from a keyboard or switch device** | The sticky buttons act only on `pointerup`, and `click`, `touchend` and `pointerdown` are suppressed with `preventDefault`. Enter and Space fire `click`, never `pointerup`. | On mobile the sticky bar is the **only** CTA (C4 + H7), so keyboard, switch and some screen-reader users can't buy. Fails WCAG 2.1.1. | The sticky Add calls the same `add()` on `click`. Tested: Enter on the sticky button adds to cart |

## High

| ID | Finding | Evidence | Impact | Fix |
|---|---|---|---|---|
| H1 | Two `<h1>` elements | `.nm-m-title` and `.nm-desk-title` are both rendered and toggled with CSS | Duplicate H1 for SEO; screen readers announce the title twice | One H1 in the buy box (or a standalone one if the buy box is turned off) |
| H2 | LCP image is lazy-loaded | First slide uses `loading: 'lazy'` | LCP delayed on every PDP | First slide is `eager` + `fetchpriority="high"`; all others lazy |
| H3 | Google Fonts Poppins, six weights, render-blocking | `<link href="fonts.googleapis.com/css2?family=Poppins:wght@400;…;900">` | Extra DNS, TLS and CSS round-trip before text paints. Conflicts with the Helvetica mandate. | Removed. Helvetica system stack, plus an optional self-hosted Helvetica Now (`vf-fonts.liquid`) |
| H4 | **Fabricated review count in structured data** | `"reviewCount": {{ … rating_count \| default: 1 }}` | Google's review-snippet policy: invented counts can trigger a manual action. Also breaks the "never invent statistics" rule. | `aggregateRating` only when both a rating and a real count exist |
| H5 | **Invalid Product JSON-LD** when a video is among the first 5 media | The `image` loop prints the comma inside `if media_type == 'image'`, using `unless forloop.last`. If the last item is a video, a trailing comma remains. | The whole Product block fails to parse, so rich results are lost | The image list is built with a counter (`vf-pdp-schema.liquid`). Validated with `json.loads` in the render test |
| H6 | Rating metafield read as an object | `reviews.rating.value` is a rating drop. `times: 20` and `"ratingValue": {{ rating_val }}` operate on the drop, not `.rating` | Stars render at 0% or wrong, and JSON-LD may be invalid (depends on how the drop stringifies) | Reads `.rating` and `.scale_max` and normalises to 5. Judge.me badge metafield parsed for both average and count |
| H7 | On mobile the in-page CTAs are hidden | `.nm-cta-grid{display:none!important}` at ≤768px, and the sticky bar is always on | No primary action in the buy box; the always-on bar covers content; brand book 9.7 is not met | The CTA lives in the buy box at every width. The sticky bar shows only after the CTA scrolls away and docks above the footer |
| H8 | Accordions aren't operable from a keyboard | `div.acc-head` / `div.faq-head` with click handlers, no `button`, no `aria-expanded` | Fails WCAG 2.1.1 and 4.1.2 | Native `<details>`/`<summary>` |
| H9 | Add to cart **sets** cart quantity instead of adding | When `cartInCount > 0`, the stepper mirrors the cart and ATC calls `/cart/change.js` with the stepper value. +/- edit the cart directly. | Clicking ATC with 2 already in the cart "does nothing". Quantity changes happen without an explicit action. | The stepper only chooses how many to add. The cap is enforced by clamping against a cached cart (refreshed when idle, before add if older than 10 s, and on theme cart events) |
| H10 | Brand conflicts | Orange `#ff7a1a` CTA, neumorphic `--outer`/`--inset` shadows, pill buttons | Retired in brand book 1.3 and 6.1; premium perception lost | Token layer, Carbon primary, flat hairline surfaces, rectangular 12px buttons |
| H11 | Unsubstantiated claim defaults ship live | Mfg defaults "ISO 22000 & GMP-certified", trust default "Vet approved", `badge_show_default: true` "Best seller", FAQ default "Yes, for all life stages" | Ch. 5 claim risk: certification and safety claims without evidence | Defaults are placeholders or blank. The badge default is off. Chip text matches approved territories ("Vet-approved formula") |
| H12 | No subscription, no proof near action, no dose/expectation structure | The description is a single rich-text dump | Fails the brand book 9.6 anatomy; weak for Label Readers | Full zone model driven by `vf.*` metafields, every zone hidden when its data is empty |

## Medium

| ID | Finding | Evidence | Fix |
|---|---|---|---|
| M1 | No primary action: ATC and Buy now have equal weight | Both filled, same size, side by side | Carbon primary ATC; outline secondary Buy now |
| M2 | Heavy global event layering | `window.__NM_ADD_LOCK`, document-level capture shields on `click`, `submit` and `touchend`, a `MutationObserver` on `document.body` (subtree) to patch the theme drawer's minus button | Removed. No global listeners outside the section root except the Theme Editor and pub/sub hooks |
| M3 | `/cart.js` fetched on every page load, plus re-fetch on every bubble mutation | `refreshCartCount()` at init; `MutationObserver` on the cart bubble | Fetched once when idle, and only when a cap is set |
| M4 | All 12 gallery images load | Slides are absolutely stacked with `opacity`, so every lazy image counts as "in viewport" | Scroll-snap track; lazy images load as they near view |
| M5 | Layout shift in the gallery | The stage's `aspect-ratio` is rewritten per slide by JS; `max-height` fights `aspect-ratio` | A fixed ratio from a setting; `object-fit` handles mixed media |
| M6 | URL and gallery don't follow the variant | No `?variant=` update; no move to the variant's media | `history.replaceState` + `goToMedia()` |
| M7 | Swatch semantics | `button[aria-pressed]` with no group name; unavailable values not shown | Native radio groups in `<fieldset>`/`<legend>`; unavailable shown with text + strikethrough |
| M8 | Duplicate / invalid structured data | FAQ microdata *and* FAQPage JSON-LD; `itemprop="description"` with no `itemscope` parent | JSON-LD only, from the same sources as the visible FAQ |
| M9 | Hard-coded colours, radii and shadows; ~500 lines of inline CSS re-sent per page | Brand book 9.9 violation; not cacheable | `assets/vf-tokens.css` + `assets/vf-pdp.css` (cached) |
| M10 | Canonical override corrupts URLs | `{{ s.seo_canonical_override \| escape \| json }}` turns `&` into `&amp;` | `strip \| json`. Note: JS-injected canonicals aren't read by non-rendering crawlers (see 08) |
| M11 | Offer currency ignores Shopify Markets | `priceCurrency: shop.currency`; AggregateOffer isn't eligible for merchant listings | Offer array priced in `cart.currency.iso_code` |
| M12 | Screen-reader noise and gaps | The OOS message has `role="alert"` at page load; most adds give no announcement | A polite live region for add/limit; `role="alert"` only on runtime errors |

## Low

| ID | Finding | Fix |
|---|---|---|
| L1 | `<p>` inside `<button>` (richtext labels) is invalid HTML | Plain-text label settings |
| L2 | Banner: `href="#"` when blank, no image dimensions (CLS), duplicate `aria-label` + `alt` | No link when blank; `image_tag` adds dimensions; alt only |
| L3 | "Add your product description in Admin." can render on the live store | The zone hides when the description is blank |
| L4 | FAQ fallback item renders live but isn't in the schema | Shows as a placeholder in the Theme Editor only |
| L5 | Thumbs labelled "Slide n" with no current state; mouse-drag swipe interferes with text selection | `aria-current`, "Show image n of N"; native scroll-snap |
| L6 | `font_family` setting injected into CSS unescaped | Setting removed |
| L7 | Sticky bar: 38% white with blur, no safe-area inset | Solid white, hairline, `env(safe-area-inset-bottom)` |
| L8 | Stepper input has no min/max and accepts free text | `type=number`, min/max, clamped |
| L9 | `break` used outside a loop for a blank product | Wrapped in `if product != blank` |
| L10 | "Limit Reached", "Buy now failed", "Out of stock" | Ch. 4.6 microcopy: "Back soon…", "Something went wrong. Your cart is safe. Try again." |

## Double-fire analysis (Phase 2 ask)

| Control | v6.1 listeners | Fires per tap | Risk |
|---|---|---|---|
| Main ATC | form `submit` (capture) + button `click` (capture) + document `submit` (capture) | 1 *if bound*, but see C1: not bound | Native POST fallback |
| Main Buy now | button `click` + button `pointerup` + document `click` + document `pointerup` (all capture) | **2** (one per event type) | Double add (C2) |
| Sticky ATC | `pointerup` acts; `click`/`touchend`/`pointerdown` suppressed; global shield + 600 ms lock + 1.2 s dedupe | 1 on touch, **0 on keyboard** | C4 |
| Sticky Buy now | `pointerup` acts; others suppressed | 1 on touch, **0 on keyboard** | C4 |

**v1.0 model:** `submit` → `add()`; `click` → `add({checkout:true})`; one `busy` lock. `click` already unifies mouse, touch, pen and keyboard, so no other events are needed.

## What is preserved, and where

| v6.1 feature | v1.0 location |
|---|---|
| Variant picker + OOS guard | `vf-pdp-buybox.liquid` (cards / option radios), `vf-pdp.js → update()`, `applyAvailability()` |
| AJAX ATC with section rendering (`cart-drawer`, `cart-icon-bubble`, `cart-notification`) | `vf-pdp.js → add()`, `sectionIds()` (asks the theme's cart element first, falls back to Dawn ids), `renderCart()` (theme `renderContents` first, then a section-swap fallback) |
| Quantity control + per-variant cap (10) | `max_per_variant` setting (0 = off), stepper clamped against the cart |
| Badge metafields `custom.badge_enabled` / `custom.badge_text` | Same logic, rendered as a status chip |
| Rating fallbacks `reviews.rating` → Judge.me → Loox | Section top Liquid (adds Judge.me badge parsing for the count) |
| Trust badge, FAQ, Mfg blocks | Same block types (`trust_badge` now "Proof chip"); Mfg also reads `vf.mfg_details` |
| Banner (desktop/mobile image, link, alt, new tab, heights) | Same settings; `<picture>` with an art-directed mobile source |
| Product, Offer, AggregateRating, BreadcrumbList, FAQPage JSON-LD | `vf-pdp-schema.liquid` |
| Meta description + canonical overrides | Same settings, same JS approach (escaping fixed) |
| Theme Editor toggles | All structural toggles kept; see the settings map below |

## Settings migration map

| v6.1 setting | v1.0 | Note |
|---|---|---|
| show_top, show_gallery, show_summary | Same ids | |
| show_icons_snippet (`icons-neumorphic`) | **Removed** | Retired neumorphism (Q11 default) |
| show_desc, desc_title, desc_icon | Same ids | Default title "The details" |
| desc_title_size, mfg_title_size | **Removed** | Type scale comes from tokens (6.7) |
| show_mfg, mfg_title, mfg_icon, use_mfg_fallback, mfg_fallback_rich1–3 | Same ids | Fallback defaults are blank (claims) |
| show_faqs, faqs_title_rich | Same ids | Now `inline_richtext` |
| show_banner, banner_* | Same ids | |
| badge_show_default, badge_rich | Same ids | Default off |
| badge_bg, badge_text, bg, elev, text, brand, accent, btn_*, buy_* | **Removed** | Token layer (9.9); accent comes from `vf.need_primary` |
| add_label, buy_label, oos_label, oos_message | Same ids | Plain text; Ch. 4.6 defaults |
| font_family | **Replaced** by `use_webfont` | Helvetica mandate |
| gallery_fit, gallery_ratio | Same ids | |
| radius, shadow_depth, max_width, body_font_size_* | **Removed** | Tokens |
| seo_* (all 11) | Same ids | `seo_brand` defaults to "Vettofit" |

**Theme Check:** clean except `ExcessiveSettingsCount` (92 settings against a lint guideline of 40; v6.1 shipped about 70) and `MissingAsset` for the optional font files you haven't uploaded yet. Neither blocks saving. Splitting zones into theme blocks is on the roadmap.
