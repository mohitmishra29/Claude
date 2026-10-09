# 8 · Installation & rollback

The install is **additive**: no existing theme file is edited, and nothing is deleted. The live product template keeps using NM PDP v6.1 until you switch products to the new template. That makes rollback a template switch.

## 8.1 Files

| Path | Purpose |
|---|---|
| `sections/vf-pdp.liquid` | Section, logic, schema |
| `snippets/vf-pdp-gallery.liquid` | Gallery, thumbs, lightbox |
| `snippets/vf-pdp-buybox.liquid` | Buy box, form, variant JSON |
| `snippets/vf-pdp-story.liquid` | Quick fit, Benefits, About, Why it works |
| `snippets/vf-pdp-proof.liquid` | Evidence band, How to use, What to expect |
| `snippets/vf-pdp-faq.liquid` | FAQ |
| `snippets/vf-pdp-pairs.liquid` | Pairs well with |
| `snippets/vf-pdp-schema.liquid` | JSON-LD |
| `snippets/vf-icon.liquid` | Monoline icon set |
| `snippets/vf-fonts.liquid` | Optional Helvetica Now webfont |
| `assets/vf-tokens.css` | Shared token layer |
| `assets/vf-pdp.css` | Section styles |
| `assets/vf-pdp.js` | Behaviour (deferred) |
| `templates/product.vettofit.json` | Alternate product template |

## 8.2 Install (about 60–90 minutes, excluding content entry)

1. **Back up.** In Online Store → Themes → ⋯ → **Duplicate** the live theme. Rename the copy `BACKUP — pre Vettofit PDP — <date>`.
2. **Work on an unpublished copy.** Duplicate again and name it `Vettofit PDP — staging`. Do every step below on staging.
3. **Upload the files.** Either:
   - **Shopify CLI** (from the repo root, with the folders shown above):
     `shopify theme push --theme "<staging theme id>" --path shopify --only sections/vf-pdp.liquid --only "snippets/vf-*" --only "assets/vf-*" --only templates/product.vettofit.json --nodelete`
   - **Or the code editor:** Edit code → add each file under the same folder with the same name, and paste in the content.
4. **Load tokens globally (recommended).** In `layout/theme.liquid`, inside `<head>`, add `{{ 'vf-tokens.css' | asset_url | stylesheet_tag }}`. The section also loads it, which is harmless.
5. **Create the metafield and metaobject definitions** from `07-metafields.md`, with Storefront access on.
6. **Fill one product completely** (Nutri-Topper) using **vet/claim-approved copy only**.
7. **Assign the template.** Products → Nutri-Topper → Theme template → `product.vettofit`.
8. **Theme Editor** (Customize → Products → `vettofit`):
   - Fill in the delivery promise, payments line, returns line, WhatsApp number and hours.
   - Leave the pincode endpoint blank until the app proxy exists (8.5).
   - Add the **Judge.me "Review widget" app block** to the section. It renders in the Reviews zone.
   - Check the proof chips match approved claims for this product.
   - Set the "Sticky buy box top offset" if the theme header is sticky.
   - If the theme already renders a breadcrumb, leave the section breadcrumb off.
9. **Razorpay (Buy now).** Keep "Buy now checkout hand-off" on **Cart checkout button**. On staging, tap Buy now and confirm Magic Checkout opens with the right item and quantity. If it doesn't, switch to **Direct /checkout URL** and test again. Razorpay's docs name Buy now and Checkout as entry points but don't document how the buttons are intercepted, so this test is mandatory.
10. **Subscriptions.** Once the selling-plan app is live, the Subscribe & save row appears automatically.
11. **Analytics.** If the Google & YouTube channel already sends GA4 ecommerce events, either untick "Push … to dataLayer" or map only the custom `vf_*` pixel events, so events aren't counted twice.
12. **QA.** Run `09-qa-checklist.md` on staging at every breakpoint.
13. **Publish.** Publish the staging theme. Roll out to Salmon Oil, then the remaining products.

### Optional: SEO overrides at head level
The section keeps the meta-description and canonical overrides (applied with JS, as in v6.1). Crawlers that don't run JavaScript won't see them, so prefer Shopify's native SEO fields. If an override must reach every crawler, read it in `layout/theme.liquid` from a product metafield (for example `vf.seo_canonical`) instead.

## 8.3 Font webfont (only if licensed)
Upload the four WOFF2 files named in `snippets/vf-fonts.liquid`, then tick **Typography → Use licensed Helvetica Now webfont**. For best LCP, move `{% render 'vf-fonts' %}` into `<head>`.

## 8.4 Theme compatibility notes
- Built against Dawn-family cart elements (`cart-drawer`, `cart-notification`, `renderContents`, `getSectionsToRender`, pub/sub `cartUpdate`). Other themes get the section-swap fallback plus an inline "Added to your cart · View cart" message.
- The sticky buy box and sticky bar use `position: sticky`. An ancestor with `overflow: hidden` disables them, so check `main`/wrapper styles if they don't stick.
- App blocks added to this section render in the Reviews zone. Use app embeds for apps that belong elsewhere (for example, back-in-stock).

## 8.5 Pincode endpoint contract (app proxy)
`GET {endpoint}?pincode=560001&variant=123` (same origin, for example `/apps/delivery/check`). The endpoint returns:
```json
{ "serviceable": true, "message": "Delivered by Thu, 16 Oct · COD available" }
```
`message` is optional. Without it, the PDP shows "We deliver to this pincode." or "We can't deliver to this pincode yet." Keep the courier API token server-side (Shiprocket, Delhivery, etc.).

## 8.6 Rollback plan

| Situation | Action | Time |
|---|---|---|
| One product looks wrong | Product → Theme template → **Default product** | < 1 min |
| Issue on every product using the new template | Bulk-edit products → Theme template → Default, or edit `product.vettofit.json` to point at the old section | ~5 min |
| Theme-wide regression after publishing | Online Store → Themes → publish `BACKUP — pre Vettofit PDP` | ~2 min |
| Remove the code entirely | Delete the `vf-*` files and `templates/product.vettofit.json` (no other files reference them), and remove the tokens line from `theme.liquid` | ~10 min |

Metafields and metaobjects are safe to leave in place during a rollback. Nothing in the old section reads them.
