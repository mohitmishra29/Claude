# Marketing Skills

This project uses [marketingskills](https://github.com/coreyhaines31/marketingskills) — a collection of AI agent skills for marketing tasks.

## Setup

All skills are installed in `.claude-plugin/skills/`. The foundational product context is at `.agents/product-marketing-context.md` — fill this out first so all skills can reference your product, audience, and positioning.

## Available Skills

### Conversion Optimization
- `page-cro` — Analyze and optimize landing/marketing pages for conversions
- `signup-flow-cro` — Optimize signup and registration flows
- `onboarding-cro` — Improve user onboarding conversion
- `form-cro` — Optimize form design and completion rates
- `popup-cro` — Design and optimize popups and modals
- `paywall-upgrade-cro` — Optimize upgrade and paywall flows

### Content & Copy
- `copywriting` — Write conversion-focused marketing copy
- `copy-editing` — Edit and improve existing copy
- `cold-email` — Write cold outreach emails
- `email-sequence` — Design multi-step email sequences
- `social-content` — Create social media content
- `content-strategy` — Plan content marketing strategy

### SEO & Discovery
- `seo-audit` — Audit site for SEO issues and opportunities
- `ai-seo` — Optimize for AI search and LLM discovery
- `programmatic-seo` — Build programmatic SEO pages at scale
- `site-architecture` — Plan site structure for SEO and UX
- `schema-markup` — Add structured data markup
- `competitor-alternatives` — Create competitor comparison content

### Paid & Distribution
- `paid-ads` — Plan and optimize paid ad campaigns
- `ad-creative` — Write ad copy and creative briefs

### Measurement & Testing
- `analytics-tracking` — Set up analytics and event tracking
- `ab-test-setup` — Design and implement A/B tests

### Retention
- `churn-prevention` — Reduce churn with targeted interventions

### Growth Engineering
- `free-tool-strategy` — Build free tools for lead generation
- `referral-program` — Design referral and viral loops
- `lead-magnets` — Create lead magnets and gated content

### Strategy & Monetization
- `marketing-ideas` — Generate marketing ideas and campaigns
- `marketing-psychology` — Apply psychological principles to marketing
- `launch-strategy` — Plan product and feature launches
- `pricing-strategy` — Optimize pricing and packaging

### Sales & RevOps
- `revops` — Align revenue operations and processes
- `sales-enablement` — Create sales collateral and playbooks

### Foundation
- `product-marketing-context` — Set up your product/audience/positioning context (run this first)

## Usage

Ask naturally (e.g., "Help me optimize this landing page") or invoke directly (e.g., "Use the cold-email skill to write outreach for..."). Skills cross-reference each other and all check `product-marketing-context` first.
