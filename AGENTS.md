# AGENTS.md — Project Memory Bank

## Project
`my-links-site` — a single-file, dark "terminal"-style link-in-bio / profile site
for the `stxbandz` handle, deployed statically on **Cloudflare Pages**. It also contains an
integrated "Terra Obscura" globe intelligence feature.

No build step, no framework, no package install required. Everything lives in
`index.html` (HTML + CSS + vanilla JS).

## Stack
- Static site: one `index.html` (HTML/CSS/JS in a single file).
- Canvas 2D for the globe (no WebGL/three.js).
- External APIs (client-side `fetch`): CoinGecko (crypto strip) and OpenRouter (AI).
- Fonts: Geist Mono / Inter via Google Fonts.

## Views (switched via `switchView(target)`)
- `profile` — avatar, name, tagline, crypto ticker, link sections, gallery CTA, globe CTA.
- `gallery` — stealth / air-force imagery grid (tap to fullscreen).
- `globe`   — Calm/Shadow intelligence globe (button-launched).

## Editable data (top of `<script>`)
- `PROFILE` — name, initial, tagline.
- `SECTIONS` — link groups (currently `Handles`, `Trading/Fintech`).
- `MARKETS` — CoinGecko ids for the live crypto strip.
- `GALLERY` — image cards. URLs are direct `i.pinimg.com/736x/...` links
  (Pinterest `pin.it` short links must be resolved to their `i.pinimg.com` CDN URL
  before use; they do not load as `<img src>` directly).
- `GLOBE_COUNTRIES` — {name, code, lat, lng, population, region, capital} array
  driving the globe clusters and AI analysis.

## Globe feature notes
- Country nodes render as a **network of dots + connecting lines** (uniform size,
  NOT population-based) plus the country's **flag image** (flagcdn.com), with
  emoji fallback. No plain center dot.
- Click a country center -> shows its name (no API call).
- **Only the "ask about a country" text box** triggers the OpenRouter API.
- Models tried in order with 404 fallback: openai/gpt-4o-mini,
  meta-llama/llama-3.1-8b-instruct, deepseek/deepseek-chat.
- Aesthetic: radial dark-forest gradient, glassmorphism panels, green palette
  (#5cd67d / #bbf2cc), highlight #a2f7ef.

## Security / repo rules (IMPORTANT)
- **Never hardcode secrets.** The OpenRouter API key is entered by the user in the
  globe UI and stored in localStorage (getApiKey()). GitHub Push Protection
  blocks any commit containing a key — keep keys out of source.
- Do not commit .idea/, .kilo/, or node_modules/.
- Deployment config files (_headers, _redirects, og-image.svg) are optional;
  if _headers with a CSP is restored, its connect-src must allow
  https://openrouter.ai or the globe AI calls will be blocked.
- Analytics are routed through Cloudflare Pages Functions (`/api/analytics`).

## Conventions
- Keep all changes inside index.html; prefer editing the data arrays over logic.
- Vanilla JS only; no external runtime dependencies.
- Original profile/gallery/analytics code must remain intact when adding features.