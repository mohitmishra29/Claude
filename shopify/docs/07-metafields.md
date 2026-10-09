# 7 · Metafield & metaobject setup (brand book 9.10)

Create these in **Settings → Custom data** before filling content. Every PDP zone reads only from these definitions, and hides itself when they are empty. Namespace: **`vf`**.

> **Claims workflow (Ch. 5.6):** every text field marked 🩺 must pass vet and claim review before it's filled. Use the structure CONTEXT + SUPPORT VERB + OUTCOME AREA + PROOF. Never use: treats, cures, prevents, clinically proven, 100% safe, vet recommended, guaranteed, or "works in X days".

## 7.1 Product metafields

| Key | Type | Purpose / zone | Notes |
|---|---|---|---|
| `vf.species` | List of single line text · choices: `dog`, `cat`, `multi` | Eyebrow chip, Quick fit "Made for" fallback | Dog + cat → "For dogs and cats" |
| `vf.need_primary` | Single line text · choices: `Daily`, `Gut`, `Skin & Coat`, `Calm`, `Dental`, `Joints`, `Immunity`, `Grooming` | Need chip + **category accent** | Nutri-Topper = Gut · Salmon Oil = Skin & Coat |
| `vf.need_secondary` | List of single line text (same choices) | Filters / future | Not rendered on the PDP |
| `vf.outcome_line` 🩺 | Single line text (≤ 110 chars) | One-line outcome under the H1 | e.g. "Daily omega-3 support for healthy skin and coat, in a vet-approved formula." [PLACEHOLDER: needs vet/claim approval] |
| `vf.who_for` | Single line text | Quick fit · Made for | e.g. "Adult dogs and cats" |
| `vf.format` | Single line text | Quick fit · Format | e.g. "Oil with pump, 200 ml" |
| `vf.flavour` | Single line text | Quick fit · Flavour | |
| `vf.routine` | Single line text | Quick fit · Daily routine | e.g. "Once a day, over food" |
| `vf.ask_vet_first` 🩺 | Single line text | Quick fit · Ask your vet first if… | Lower-case continuation: "your pet is pregnant, nursing or on medication" |
| `vf.benefits` 🩺 | List of metaobject references → `vf_benefit` | Benefits (3–5 shown) | |
| `vf.mechanism` 🩺 | Multi-line text | "Why it works" lead | Plain English, no lab theatre |
| `vf.ingredients` | List of metaobject references → `vf_ingredient` | Ingredient list | Reusable across products |
| `vf.ingredients_image` | File (image) | Macro image for "Why it works" | 4:5, ≥1200px wide |
| `vf.full_ingredients` | Multi-line text | "Full ingredient list" disclosure | Matches the label |
| `vf.evidence` 🩺 | List of metaobject references → `vf_evidence` | Evidence band | |
| `vf.vet_reviewer` | Metaobject reference → `vf_expert` | Reviewer card | **Never invent a reviewer.** Hide until one exists |
| `vf.feeding_guide` 🩺 | JSON (schema below) | Dosage table + calculator | |
| `vf.how_to_steps` | List of single line text | Numbered steps | |
| `vf.storage` | Single line text | Storage line | |
| `vf.safety_notes` 🩺 | Rich text or multi-line text | "Before you start" callout | Contraindications, age, pregnancy/lactation, medication |
| `vf.result_window` 🩺 | List of metaobject references → `vf_result_step` | What to expect timeline | Evidence-supported windows only (5.5) |
| `vf.result_vet_threshold` 🩺 | Single line text | Vet threshold shown with the timeline | Default when empty: "If anything persists or gets worse, speak to your vet." |
| `vf.faq` | List of metaobject references → `vf_faq` | FAQ + FAQPage JSON-LD | Shown before shared FAQ blocks |
| `vf.pairs_with` | List of product references | Pairs well with + "Add both" | Nutri-Topper ↔ Salmon Oil |
| `vf.days_supply_basis` | Single line text | Per-day price basis | e.g. "for a 10 kg dog". Per-day price shows only when this **and** a variant's `days_supply` exist |
| `vf.mfg_details` | Rich text or multi-line text | Manufacturing details (wins over blocks) | Document every certification you mention |
| `vf.subscription_rules` | JSON | Reserved (9.10) | Selling plans drive the UI; keep notes here |
| *(existing)* `custom.badge_enabled` | Boolean | Status chip | Preserved |
| *(existing)* `custom.badge_text` | Single line or rich text | Status chip text | Preserved |
| *(app)* `reviews.rating`, `reviews.rating_count` | Rating / integer | Stars, summary, AggregateRating | Turn on Judge.me's "sync to Shopify metafields" |

## 7.2 Variant metafields

| Key | Type | Purpose |
|---|---|---|
| `vf.most_popular` | Boolean | "Most popular" tag on the size card. Base it on real sales data |
| `vf.days_supply` | Integer | Days the pack lasts at the basis dose → "≈ ₹X a day" |
| *(Shopify field)* Unit price measurement | Native variant field | "₹X/100 g" on cards and under the price |

## 7.3 Metaobject definitions

**`vf_benefit`**: title (single line, required) 🩺 · support (single line) 🩺 · icon (single line, choices: `digestion skin coat immunity joints energy heart calm dental appetite bowl drop leaf check`)

**`vf_ingredient`**: name (single line, required) · amount (single line, e.g. "500 mg per 2 g serving") · role (multi-line) 🩺 · source (single line) · image (file) · evidence_url (URL)

**`vf_evidence`**:
- type (single line, choices): `Vet-approved formula`, `Made with human-grade ingredients`, `Made with clinically studied ingredients`, `Third-party tested`
- claim (single line, required) 🩺
- detail (multi-line) 🩺
- certificate (file)
- source_url (URL)
- reviewer (metaobject → `vf_expert`)
- review_date (date)
- expiry_date (date, internal)

**`vf_expert`**: name (required) · credential · photo (file) · review_scope · review_date (date) · profile_url (URL)

**`vf_result_step`**: window (single line, e.g. "Weeks 1–2") 🩺 · title 🩺 · track (single line: the observable metric, e.g. "stool consistency")

**`vf_faq`**: question (single line, required) · answer (rich text) 🩺

Turn on **Storefront access** for every definition (Settings → Custom data → [definition] → Storefronts), otherwise Liquid can't read them.

## 7.4 `vf.feeding_guide` JSON schema

```json
{
  "unit_label": "Daily amount",
  "intro": "[PLACEHOLDER: needs vet approval] Start with half the amount for the first week.",
  "note": "[PLACEHOLDER: needs vet approval] Amounts are a guide. Ask your vet for pets with health conditions.",
  "tables": [
    { "label": "Dogs", "rows": [
      { "min_kg": 0,  "max_kg": 5,  "amount": "[PLACEHOLDER] ½ pump" },
      { "min_kg": 5,  "max_kg": 10, "amount": "[PLACEHOLDER] 1 pump" },
      { "min_kg": 10, "max_kg": 25, "amount": "[PLACEHOLDER] 2 pumps" },
      { "min_kg": 25,               "amount": "[PLACEHOLDER] 3 pumps" }
    ]},
    { "label": "Cats", "rows": [
      { "min_kg": 0, "max_kg": 4, "amount": "[PLACEHOLDER] ½ pump" },
      { "min_kg": 4,              "amount": "[PLACEHOLDER] 1 pump" }
    ]}
  ]
}
```

How the table is read:
- Each row covers weights greater than `min_kg` and up to and including `max_kg`.
- `min_kg: 0` means "up to", and a row without `max_kg` means "and over".
- A single table hides the Dogs/Cats switch.
- The calculator appears only when JavaScript runs; without it, the table still shows.

## 7.5 Example: create a definition via the Admin GraphQL API

```graphql
mutation {
  metafieldDefinitionCreate(definition: {
    namespace: "vf", key: "need_primary", name: "Need (primary)", ownerType: PRODUCT,
    type: "single_line_text_field",
    validations: [{ name: "choices", value: "[\"Daily\",\"Gut\",\"Skin & Coat\",\"Calm\",\"Dental\",\"Joints\",\"Immunity\",\"Grooming\"]" }],
    access: { storefront: PUBLIC_READ }
  }) { createdDefinition { id } userErrors { field message } }
}
```

```graphql
mutation {
  metaobjectDefinitionCreate(definition: {
    type: "vf_evidence", name: "Evidence",
    access: { storefront: PUBLIC_READ },
    fieldDefinitions: [
      { key: "type", name: "Type", type: "single_line_text_field", validations: [{ name: "choices", value: "[\"Vet-approved formula\",\"Made with human-grade ingredients\",\"Made with clinically studied ingredients\",\"Third-party tested\"]" }] },
      { key: "claim", name: "Claim", type: "single_line_text_field", required: true },
      { key: "detail", name: "Detail", type: "multi_line_text_field" },
      { key: "certificate", name: "Certificate", type: "file_reference" },
      { key: "source_url", name: "Source URL", type: "url" },
      { key: "review_date", name: "Review date", type: "date" },
      { key: "expiry_date", name: "Review expiry", type: "date" }
    ]
  }) { metaobjectDefinition { id } userErrors { field message } }
}
```

## 7.6 Content readiness by zone

| Zone | Live when… | Until then |
|---|---|---|
| Outcome line | `vf.outcome_line` | Hidden |
| Quick fit | ≥ 2 of who/format/flavour/routine/ask-vet (species counts as "who") | Hidden |
| Benefits | ≥ 1 `vf_benefit` | Hidden |
| Why it works | ≥ 1 ingredient or a full list | Hidden |
| Evidence band | Reviewer or ≥ 1 evidence item | Hidden; "See the evidence" link hidden too |
| How to use | Feeding guide, steps or safety notes | Hidden |
| What to expect | ≥ 1 result step | Hidden |
| Reviews | Judge.me app block, legacy widget or a rating | Hidden |
| Pairs well with | `vf.pairs_with`, or complementary recommendations return results | Hidden |
| Per-day price | `vf.days_supply_basis` + variant `vf.days_supply` | Hidden |
