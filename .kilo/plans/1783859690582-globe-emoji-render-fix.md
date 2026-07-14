# Globe Emoji Rendering Fix Plan

## Problem Statement
The globe visualization shows country initials/text in the info box instead of flag emojis, and the globe sprite markers fail to render flag emojis visually.

## Root Cause Analysis

### 1. Canvas 2D Emoji Font Issue (`index.html:1793`)
The `flagTexture` function renders emojis onto a canvas using:
```javascript
context.font = "82px sans-serif";
```
On Windows, `sans-serif` resolves to `Segoe UI`, which **does not support color emoji rendering** in Canvas 2D. This causes emojis to render as blank boxes, monochrome glyphs, or invisible characters on the canvas, which then gets embedded into the Three.js sprite texture.

### 2. WebGL Sprite + Emoji Cross-Platform Issues
Even when the canvas renders an emoji, `THREE.CanvasTexture` wrapping color emoji data into a WebGL sprite can further strip or flatten the emoji colors depending on the browser/GPU combination.

### 3. Info Box Dark Text (`index.html:1580`)
The `.region` CSS uses `color: #3f7a58` (very dim green). When `GLOBE_FLAGS[obj.code] || flagFor(obj.code)` fails to produce a visible emoji, nothing is shown, and the remaining region text appears as dark isolated text.

## Proposed Fix

### Change A — Fix Canvas Emoji Font Stack
Update the `flagTexture` canvas font to explicitly include system emoji-capable fonts:

**File:** `index.html`
**Location:** line ~1793

```javascript
context.font = "82px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
```

This ensures color emojis render correctly on Windows, macOS, and Linux by explicitly selecting emoji-capable fonts before falling back to generic sans-serif.

### Change B — Increase Info Box Text Contrast/Visibility
Update `.region` color in CSS to ensure fallback text remains readable, and add a subtle text-shadow for depth:

**File:** `index.html`
**Location:** line ~732

```css
.info-box .region { 
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #5cd67d;
  margin-bottom: 16px;
  text-shadow: 0 0 8px rgba(92, 214, 125, 0.25);
}
```

### Change C — Optional Robustness: Flag Image Fallback for Globe Sprites
If emoji rendering remains unreliable after font fixes, as a fallback the globe sprites can use tiny inline SVG data URIs or cached flag images from `flagcdn.com` instead of canvas-rendered emojis. The info box can continue using emojis since HTML rendering handles them reliably.

## Validation Steps
1. Open the globe view in the browser
2. Verify that country flag emojis appear on globe markers (not initials or blank spaces)
3. Click a country and verify the info box shows a flag emoji next to the region
4. Test on both Windows and macOS if available to confirm cross-platform rendering
5. Check browser console for any WebGL/texture errors

## Risks / Notes
- Emoji flags in WebGL sprites are inherently less reliable than HTML emoji or image flags
- If Change A does not fully resolve sprite rendering, Change C (flag images) should be implemented
- No secrets or API keys are involved; all changes are purely rendering/visual
