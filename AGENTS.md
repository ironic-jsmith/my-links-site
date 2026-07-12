# AGENTS.md — Project Memory Bank

Persistent context for this repository. Update when behavior or architecture changes.

## Overview
Single-file **tech/finance link-hub / personal index** web app. One `index.html`
(static, no build step) deployed from GitHub → Netlify (auto-deploy on push).
Aesthetic brief: **A24 film studio × quiet high-end startup ("stealth wealth")** —
restrained, cinematic, expensive-feeling; explicitly NOT neon, NOT gold, NOT
emoji icons, NOT busy motion.

## Architecture
- `index.html` = everything: `<head>` (meta/fonts) → `<style>` (all CSS, incl.
  keyframes) → `<body>` (`.grain` overlay, `.wrap` → profile, `.ticker-bar` +
  `.alloc-bar`, `#sections`, `#footer`) → `<script>` (editable data + render
  logic + CoinGecko fetch + IntersectionObserver).
- No framework, no bundler. All animations are **pure CSS** (keyframes/
  transitions); JS only fetches data and builds DOM.
- Deployment root also holds Netlify config files: `_redirects`, `_headers`.

## Design tokens (`:root`)
- `--bg:#0E0F11` (cool charcoal, not pure black)
- `--surface:#16181B`, `--text:#E7E5DF`, `--text-dim:#86888E`
- `--accent:#7C8A6E` (desaturated **olive** — the single accent; NOT green/neon)
- `--hairline:#26282C`
- `--ease:cubic-bezier(0.16,1,0.3,1)` — luxury timing used by ALL transitions/animations

## Editable data (top of `<script>`, hand-edited by owner)
- `PROFILE` — name, initial, tagline
- `SECTIONS` — numbered chapters: `01 Handles`, `02 Trading/Fintech`,
  `03 Products` (each with `links:[{icon,title,subtitle,url}]`)
- `TICKER_ITEMS` — `["NY MARKET // OPEN"]` (feeds the terminal ticker status)
- `MARKETS` — `[{id,label}]` CoinGecko coins for the live crypto strip
  (currently BTC/ETH/SOL; free API, 60s refresh, graceful fallback)

## Hover mechanics (the "bar" hover) — LINK ROWS
On `.link-row` hover/focus the row becomes a subtle glass pill and the right
arrow slides right. Exact CSS:
```css
.link-row { border-radius:10px; padding:14px 12px; transition:background .4s var(--ease); }
.link-row:hover, .link-row:focus-visible { background: rgba(255,255,255,0.03); }
.link-arrow { transition: transform .4s var(--ease), color .4s var(--ease); }
.link-row:hover .link-arrow, .link-row:focus-visible .link-arrow {
  transform: translateX(4px); color: var(--accent);
}
```
Note: the accent is **olive `#7C8A6E`**, not green. If future requests say
"green bar", they mean this hover pill/arrow treatment. Keep it restrained.

## Premium UI/UX upgrades (implemented — keep pinned)
1. **Visual identity redesign** — charcoal + olive, Schibsted Grotesk (display) /
   Inter (body) / Geist Mono (utility); numbered chapter sections `01/02/03`
   with hairline divider + scroll-fill rule; typographic link rows (no cards).
2. **Live crypto tracker** — `MARKETS` + CoinGecko `simple/price`, 60s refresh,
   rendered into `.markets` strip (e.g. `BTC $64,230 ▲1.2%`), olive/ clay ▲▼.
3. **Hero polish** — film-grain SVG overlay (`.grain`), breathing avatar halo
   (`.avatar::before` radial gradient + `breathe` keyframe) + static
   `drop-shadow` on `.avatar`, load fade-in.
4. **Scroll reveal** — `.js .reveal` + IntersectionObserver fade-up sections.
5. **Premium hover** — glass pill `rgba(255,255,255,0.03)` + arrow `translateX(4px)`
   (see above); uses `--ease`.
6. **Cinematic staggered load** — `riseIn` keyframe (opacity + 16px rise) with
   sequential delays: avatar → name/tagline → ticker/alloc → sections → footer.
7. **Micro-texture background** — `.grain` noise + faint top radial vignette on
   `body` for crisp dark mode under video compression.
8. **Fintech terminal ticker** — `.ticker-bar`: pulsing green dot +
   `NY MARKET // OPEN`, web3 metric `GAS: 16 GWEI // PING: 12MS // STATUS: NOMINAL`,
   live `.markets` as a segment.
9. **Allocation bar** — `.alloc-bar`: 4 thin segments (tech/fin/web3/cash =
   40/30/20/10) filling sequentially on load via staggered `segFill` delays.
10. **Modular footer banner** — `#footer, .modular-footer-banner`: bordered,
    rounded, low-opacity institutional widget; swappable for image/text later.
11. **Social metadata** — OG + Twitter Card `<meta>` tags in `<head>` (replace
    `YOUR-DOMAIN.netlify.app` in `og:url` with the real URL).
12. **Netlify safety** — `_redirects` (branded short links: /tiktok, /instagram,
    /prizepicks, /linktree → 302) and `_headers` (global `/*` security headers:
    X-Frame-Options:DENY, X-Content-Type-Options:nosniff, Referrer-Policy,
    HSTS, Permissions-Policy, CSP allowing inline style/script + api.coingecko.com,
    upgrade-insecure-requests).

## Constraints / conventions
- Keep content editable by hand in the top data blocks; do NOT bury behind
  complex abstractions.
- No emoji icons (icon field optional/de-emphasized).
- All motion respects `prefers-reduced-motion` (extended media query disables
  riseIn, breathe, pulseDot, segFill, hover background).
- Only opacity / transform / filter animate (GPU, 60fps for TikTok showcase).

## Validation (all historically 0 issues)
W3C Nu Html Checker, VS Code CSS language service, HTMLHint (default),
html-validate (recommended), and TypeScript/JS type-check of the `<script>`.
Re-run after edits to confirm still clean.

## Deploy
`git add -A && git commit && git push` → Netlify redeploys `index.html`,
`_redirects`, `_headers` together. No build command; publish = repo root.
