# 9 · QA checklist

Status key: ☐ to do on staging · ✅ already verified in the local render test (LiquidJS + headless Chromium, demo data, 9 Oct 2026).

## 9.1 Responsive (test at 360, 390, 414, 768, 820, 1024, 1280, 1440, 1920)
- ✅ No horizontal page scroll at any of the 9 widths (`scrollWidth == clientWidth`)
- ✅ Price visible in the first viewport at ≥ 768. At 390 the price sits at about 820px with a 3-line demo outcome, so it's tighter with real copy (recheck ☐)
- ✅ CTA in the first viewport at 820×1180, 1024 and 1440×900 (813px with demo copy)
- ✅ Mobile size cards become rows below 480 and at 768–1023; cards at 1024 and up
- ✅ Thumb rail is vertical from 1280; a row from 768 to 1279; dots + counter below 768
- ✅ Sticky bar is hidden until the CTA scrolls past, docks above the footer, and is hidden from 1024
- ☐ The sticky buy box (≥1024) keeps the CTA reachable when the buy box is taller than the viewport (pins its bottom edge)
- ☐ Landscape phones (844×390): the sticky bar doesn't cover the CTA when it's in view
- ☐ Theme header (sticky) doesn't overlap the sticky buy box (adjust the offset setting)

## 9.2 Functional
- ✅ Variant change updates price, compare-at, unit price and per-day price, the sticky price, the URL `?variant=` and the gallery media
- ✅ OOS variant: label "Back soon", Add disabled, Buy now hidden, OOS message shown
- ✅ Subscribe: price switches to the plan price, `selling_plan` is set, "Save 10%" shown, cadence select appears
- ✅ Qty stepper clamps 1…remaining (cap 10 per variant, counted from the cart)
- ✅ Add to cart sends one `/cart/add.js` with `sections` for the theme cart, and shows the inline "Added to your cart · View cart"
- ✅ Buy now: three rapid taps → one add + one checkout hand-off
- ✅ Sticky Add works from the keyboard (Enter)
- ✅ Shopify 422 errors show inline (e.g. "You can only add 2 of this item."), and the button recovers
- ✅ Dosage calculator: dogs and cats tables, active row highlighted, live result
- ✅ FAQ Expand all / Collapse all; lightbox opens, Esc closes, focus returns
- ☐ Real theme cart drawer/notification opens with the right item (Dawn `renderContents`)
- ☐ Razorpay Magic Checkout opens from Buy now and from the sticky Buy now (if enabled), with the correct quantity and plan
- ☐ COD flow end to end on mobile
- ☐ Judge.me widget renders in the Reviews zone; stars link scrolls to it; star value matches the widget
- ☐ Selling-plan app: plan names, cadences and discounts match the app config
- ☐ Theme Editor: every toggle hides its zone; blocks re-order; placeholders show only in the editor
- ☐ Products with a default variant only, with 2–3 options (option buttons), with no media

## 9.3 Accessibility (WCAG 2.2 AA)
- ✅ One H1; headings in order (H2 per zone, H3 inside)
- ✅ No interactive target smaller than 24×24 (the only exceptions are inline links in sentences)
- ✅ Size cards, options and purchase rows are native radios in `fieldset`/`legend`; selected state = 2px border + tick/dot (not colour alone)
- ✅ Accordions are native `<details>`; gallery thumbs have `aria-current`; the carousel has region/slide roles
- ✅ Polite live region for add/limit; `role="alert"` only for runtime errors
- ✅ Focus is visible everywhere (2px Carbon; Teal on Plum); `forced-colors` fallback
- ✅ Contrast pairs ≥ 4.5:1 for text, ≥ 3:1 for control borders (see 05)
- ☐ VoiceOver (iOS Safari) + TalkBack (Chrome Android) walkthrough: choose size → subscribe → add → open drawer
- ☐ Keyboard only: tab order runs gallery → options → qty → Add → Buy now → links; lightbox traps focus (native `showModal`)
- ☐ 200% zoom and 320 CSS px reflow (WCAG 1.4.10)
- ☐ `prefers-reduced-motion`: no smooth scroll, no spinner rotation, labels stay visible

## 9.4 Performance (targets: LCP < 2.5 s, INP < 200 ms, CLS < 0.10 at p75)
- ✅ LCP image: eager + `fetchpriority="high"` + responsive `srcset`/`sizes`; every other image is lazy with width/height
- ✅ No third-party fonts or libraries; JS is one deferred file (~40 KB unminified, ~10 KB gzipped); CSS is two cacheable files
- ✅ `/cart.js` only fetched when idle and only if a cap is set; recommendations fetched only near the viewport
- ☐ Lighthouse mobile on staging (throttled 4G): record LCP/CLS/TBT before and after
- ☐ CrUX / Shopify Web Performance report 28 days after launch
- ☐ Audit app scripts (Judge.me, Razorpay, selling-plan app) for first-view weight (9.12)

## 9.5 Claim compliance (Ch. 5)
- ☐ Every 🩺 field (07-metafields) has a claim tag [A–E], an evidence source and vet sign-off in the claim library
- ☐ No "treats / cures / prevents / clinically proven / 100% safe / vet recommended / guaranteed / works in X days" anywhere on the page, **including reviews you choose to feature**
- ☐ Proof chips only use the approved territories; "Third-party tested" is backed by a "for [attribute]" item in the evidence band
- ☐ The timeline shows only evidence-supported windows and always shows the vet threshold
- ☐ The vet reviewer card names a real reviewer with a credential and review date, or is hidden
- ☐ Manufacturing certifications are documented (certificate on file)
- ☐ "Most popular" and any badge are backed by real sales data
- ☐ No `[PLACEHOLDER` text on the live store (search the rendered HTML)

## 9.6 Brand compliance (Ch. 6 / 9)
- ☐ Colour ratio: Chalk/White 65–75 · Carbon/Plum 15–25 · Teal 5–10 · one accent 0–10
- ✅ Teal never carries white text; Carbon on Teal only
- ✅ No neumorphism; hairlines + selective depth (sticky bar, dialog)
- ✅ Buttons are rectangular, radius 12; pills only on chips and tags
- ✅ Helvetica stack; 700 display with tight tracking; sentence case; caps only on micro labels
- ☐ Logo untouched (the theme header uses the approved SVG; the PDP never re-sets the wordmark)
- ☐ Imagery: true pack colour, no AI-generated packs (8.6), dog **and** cat imagery where species = both
- ☐ Copy voice: warm, clear, confident; no pet puns in health copy; no exclamation chains

## 9.7 Cross-browser
| Browser | Checks |
|---|---|
| Safari iOS 16/17/18 | ☐ scroll-snap swipe · `dialog` · sticky bar safe-area · 16px inputs (no zoom) · `inert` |
| Chrome Android | ☐ swipe · sticky bar · pincode numeric keypad · Razorpay sheet |
| Samsung Internet (latest) | ☐ `:where()`, `dialog`, IntersectionObserver · sticky |
| Edge / Chrome desktop | ☐ thumb rail · arrows on hover/focus · lightbox zoom/pan |
| Firefox desktop | ☐ `:has()` (ingredient thumbs) · `details` styling |
