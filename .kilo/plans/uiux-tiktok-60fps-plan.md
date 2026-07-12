# Plan: Premium 60fps TikTok UI/UX (CSS-only, inside index.html <style>)

## Review of existing CSS (lines 10-280)
Already present (keep):
- .grain SVG noise overlay  (item 4 base)
- .avatar::before breathing radial halo + @keyframes breathe  (item 3 base)
- .wrap load fadeIn 0.7s ease  (item 2 partial)
- .js .reveal scroll fade (sections, added by JS)
- link-row underline draw + arrow translateX(3px) hover
Missing / to refine:
- global premium easing token  (item 5)
- link-row background pill + arrow 4px  (item 1)
- staggered load rise: Avatar to Headers to Ticker to LinkGroups  (item 2)
- subtle background gradient layer  (item 4 polish)

## Constraints
Pure CSS inside <style>. No HTML structure change, no text change, no JS change. Preserve scroll .reveal behavior.

## Steps

### Step 0 - Easing token (item 5)
In :root add:  --ease: cubic-bezier(0.16, 1, 0.3, 1);
Swap ease / ease-in-out for var(--ease) in: .link-title::after, .link-arrow, .chapter-rule::after, .js .reveal. (keep breathe as ease-in-out or use --ease)

### Step 1 - Premium hover (item 1)
.link-row { border-radius: 10px; padding: 14px 12px; margin: 0 -12px; transition: background .4s var(--ease); }
.link-row:hover, .link-row:focus-visible { background: rgba(255,255,255,0.03); }
.link-arrow { transition: transform .4s var(--ease), color .4s var(--ease); }
.link-row:hover .link-arrow, .link-row:focus-visible .link-arrow { transform: translateX(4px); color: var(--accent); }
(keep existing title underline; margin:0 -12px keeps the pill aligned with section headers)

### Step 2 - Cinematic staggered load (item 2)
Replace  .wrap { animation: fadeIn .7s ease both; }  with keyframe + per-element delays:
@keyframes riseIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform:none; } }
.avatar { animation: riseIn .7s var(--ease) both; }
.name, .tagline { animation: riseIn .7s var(--ease) .06s both; }
.status, .markets { animation: riseIn .7s var(--ease) .12s both; }
.section { animation: riseIn .7s var(--ease) .20s both; }
.section:nth-of-type(2) { animation-delay: .28s; }
.section:nth-of-type(3) { animation-delay: .36s; }
footer { animation: riseIn .7s var(--ease) .44s both; }
(load animation overrides .reveal to visible on load; scroll-reveal stays harmless, esp. for reduced-motion)
Optional: delete now-unused @keyframes fadeIn.

### Step 3 - Ambient avatar glow (item 3)
Already present via .avatar::before halo + breathe. Add cheap static depth (no new animation):
.avatar { filter: drop-shadow(0 0 16px rgba(124,138,110,0.22)); }
Keep breathe halo; no keyframe change.

### Step 4 - Micro-texture background (item 4)
Keep .grain. Add faint top vignette to body:
body { background: radial-gradient(120% 80% at 50% -10%, rgba(124,138,110,0.06), transparent 60%), var(--bg); }
(optional: grain opacity 0.05 to 0.04)

### Step 5 - Reduced motion
Extend existing @media (prefers-reduced-motion: reduce):
  riseIn, .avatar::before, .wrap { animation: none; }
  .js .reveal { opacity:1; transform:none; transition:none; }
  .link-row { transition: none; }
  .link-row:hover { background: transparent; }

## Validation
- Browser: load stagger plays Avatar to LinkGroups; hover shows pill + arrow 4px; glow pulses; faint top glow.
- 60fps: only opacity / transform / filter animate (GPU). margin:-12px is static, no layout thrash.
- Re-run W3C Nu + css-check to confirm 0 issues.
