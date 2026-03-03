# BlackRoad OS — Brand Design System

> Official brand guidelines for all BlackRoad OS visual work. Follow these rules on every surface: web, docs, marketing, CLI, and hardware displays.

---

## Color Palette

### Primary Colors

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Brand Black | Void Black | `#000000` | Primary background, headers |
| Brand White | Signal White | `#FFFFFF` | Text on dark, primary CTA labels |
| Brand Gold | Blackroad Gold | `#FFD700` | Accent, highlights, active states |
| Brand Cyan | Electric Cyan | `#00FFFF` | Secondary accent, links, data viz |

### Extended Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Dark Surface | Carbon | `#0A0A0A` | Card backgrounds |
| Medium Surface | Graphite | `#1A1A1A` | Panel backgrounds |
| Border | Steel | `#333333` | Dividers, borders |
| Muted Text | Fog | `#666666` | Captions, placeholders |
| Subtle Text | Ash | `#999999` | Secondary labels |
| Success | Emerald | `#00FF88` | Positive states, online indicators |
| Warning | Amber | `#FFAA00` | Warnings, pending states |
| Error | Crimson | `#FF3333` | Errors, destructive actions |

### Gradient (Brand Signature)

```css
/* BlackRoad signature gradient */
background: linear-gradient(135deg, #FFD700 0%, #00FFFF 100%);

/* Text gradient variant */
background: linear-gradient(135deg, #FFD700, #00FFFF);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Forbidden Colors

❌ **Never use these in BlackRoad brand materials:**

- Bright red (`#FF0000`) — too aggressive, reserved for security alerts only
- Purple (`#800080` or variants) — competitor association
- Orange (`#FF8C00`) — not on-brand
- Pastel or washed-out tones — violates the high-contrast principle
- White backgrounds for primary pages — always use dark backgrounds

---

## Typography

### Typefaces

| Use | Font | Fallback |
|-----|------|---------|
| Display / Headlines | SF Pro Display | -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui |
| Body / UI | SF Pro Text | Same fallback stack |
| Code / Mono | SF Mono | "JetBrains Mono", "Fira Code", Consolas, monospace |

> SF Pro is the default system font on Apple platforms. On non-Apple platforms it falls back to system-ui, which renders as the native system font.

### Type Scale (Golden Ratio φ = 1.618)

| Token | Size | Usage |
|-------|------|-------|
| `--text-xs` | 10px | Captions, metadata |
| `--text-sm` | 12px | Labels, helper text |
| `--text-base` | 14px | Body copy |
| `--text-md` | 16px | Default UI text |
| `--text-lg` | 20px | Sub-headings |
| `--text-xl` | 24px | Section headers |
| `--text-2xl` | 32px | Page titles |
| `--text-3xl` | 48px | Hero headings |
| `--text-4xl` | 64px | Mega headings |

Scale formula: `size_n+1 = size_n × 1.618`

### Line Height

```css
--line-height-tight:   1.2;   /* Headlines */
--line-height-normal:  1.618; /* Body — golden ratio */
--line-height-loose:   2.0;   /* Code, pre-formatted */
```

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | UI labels |
| Semibold | 600 | Sub-headings |
| Bold | 700 | Section titles |
| Black | 900 | Display/hero |

---

## Spacing System (Golden Ratio)

All spacing uses multiples of the base unit `φ = 1.618rem`:

| Token | Value | px equiv |
|-------|-------|---------|
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-6` | 1.618rem | 26px — **base φ unit** |
| `--space-8` | 2rem | 32px |
| `--space-10` | 2.618rem | 42px — **φ²** |
| `--space-16` | 4.236rem | 68px — **φ³** |
| `--space-24` | 6.854rem | 110px — **φ⁴** |

---

## Logo Usage

### Primary Logo

The BlackRoad OS logotype uses the brand signature gradient on a black background:

```
BLACKROAD OS
```

- Always on `#000000` or `#0A0A0A` background
- Gradient: `#FFD700` → `#00FFFF` (135° diagonal)
- Minimum size: 120px wide
- Clear space: 1× logo height on all sides

### Icon / Favicon

Road emoji `🛣️` or a custom black rectangle with gold stripe. SVG inline:

```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛣️</text></svg>">
```

### Rules

✅ **Do:**
- Use on dark backgrounds only
- Maintain aspect ratio (never stretch)
- Use full wordmark in headers and marketing

❌ **Don't:**
- Place on white or light backgrounds
- Add drop shadows or effects to the wordmark
- Use the gradient outside the logo on the same surface (create gradient fatigue)
- Alter the letter-spacing of "BLACKROAD OS"

---

## UI Component Patterns

### Buttons

```css
/* Primary CTA */
.btn-primary {
  background: linear-gradient(135deg, #FFD700, #00FFFF);
  color: #000000;
  font-weight: 700;
  border-radius: 6px;
  padding: 12px 24px;
  border: none;
}

/* Ghost / Secondary */
.btn-ghost {
  background: transparent;
  color: #FFFFFF;
  border: 1px solid #333333;
  border-radius: 6px;
  padding: 12px 24px;
}

/* Hover: shift gradient angle */
.btn-primary:hover {
  background: linear-gradient(135deg, #00FFFF, #FFD700);
}
```

### Cards

```css
.card {
  background: #0A0A0A;
  border: 1px solid #1A1A1A;
  border-radius: 12px;
  padding: var(--space-6);
}

.card:hover {
  border-color: #333333;
}
```

### Code Blocks

```css
pre, code {
  font-family: "SF Mono", "JetBrains Mono", monospace;
  background: #0A0A0A;
  border: 1px solid #1A1A1A;
  border-radius: 6px;
  color: #00FF88;  /* emerald for code */
  padding: 2px 6px;
}
```

### Status Indicators

| State | Color | Usage |
|-------|-------|-------|
| Online / Success | `#00FF88` | Agent online, service healthy |
| Busy / Active | `#FFD700` | Processing, in-progress |
| Warning / Degraded | `#FFAA00` | Slow response, partial failure |
| Error / Offline | `#FF3333` | Down, fatal error |
| Unknown | `#666666` | Status unknown |

---

## Animation Specs

All motion follows a single easing curve: **cubic-bezier(0.16, 1, 0.3, 1)** — fast start, smooth settle (Swift spring equivalent).

| Duration | Usage |
|----------|-------|
| 100ms | Micro-interactions (hover state transitions) |
| 200ms | UI feedback (button press, toggle) |
| 300ms | Panel open/close, drawer slide |
| 500ms | Page transitions, hero entrance |
| 1000ms+ | Background effects, ambient animations |

```css
:root {
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast:   100ms;
  --duration-normal: 200ms;
  --duration-slow:   300ms;
}

.animated {
  transition: all var(--duration-normal) var(--ease-spring);
}
```

**Never use `linear` easing** for UI elements — it feels mechanical. Use spring curves.

---

## CSS Custom Properties Reference

```css
:root {
  /* Colors */
  --color-void:     #000000;
  --color-carbon:   #0A0A0A;
  --color-graphite: #1A1A1A;
  --color-steel:    #333333;
  --color-fog:      #666666;
  --color-ash:      #999999;
  --color-white:    #FFFFFF;
  --color-gold:     #FFD700;
  --color-cyan:     #00FFFF;
  --color-emerald:  #00FF88;
  --color-amber:    #FFAA00;
  --color-crimson:  #FF3333;

  /* Gradients */
  --gradient-brand: linear-gradient(135deg, #FFD700, #00FFFF);

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
  --font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif;
  --font-mono: "SF Mono", "JetBrains Mono", "Fira Code", Consolas, monospace;

  /* Spacing */
  --space-phi: 1.618rem;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Motion */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## Related Documents

- [Architecture Overview](../architecture/OVERVIEW.md)
- [Brand System Complete](../../brand/BRAND_SYSTEM_COMPLETE.md)
- [Brand Colors Official](../../brand/BLACKROAD_BRAND_COLORS_OFFICIAL.md)
- [Visual Language](../../brand/BLACKROAD_VISUAL_LANGUAGE.md)
