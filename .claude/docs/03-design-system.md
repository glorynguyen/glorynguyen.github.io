# Design System

## Color Palette

### Primary Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-primary` | `#2563eb` | Links, buttons, accents |
| `--color-primary-dark` | `#1d4ed8` | Hover states |
| `--color-accent` | `#10b981` | Success, active indicators |

### Neutral Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-text` | `#1f2937` | Body text, headings |
| `--color-text-light` | `#6b7280` | Secondary text, captions |
| `--color-bg` | `#ffffff` | Main background |
| `--color-bg-alt` | `#f9fafb` | Section backgrounds |
| `--color-border` | `#e5e7eb` | Borders, dividers |

### Shadows

| Variable | Value |
|----------|-------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` |

### Gradient Definitions

```css
/* Header gradient */
background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);

/* Blog link gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* CTA section gradient */
background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
```

## Where Variables Are Defined

- **Global CSS variables**: `src/styles/global.css` (38 lines)
- Variables are available throughout all components and pages

## Typography

### Font Stack

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont,
             'Segoe UI', Roboto, sans-serif;
```

### Font Weights

| Weight | Usage |
|--------|-------|
| 400 | Body text |
| 500 | Subheadings, emphasis |
| 600 | Section titles, nav |
| 700 | Main headings, hero |

### Font Sizes

| Element | Size | Notes |
|---------|------|-------|
| Hero name | `clamp(2rem, 5vw, 3rem)` | Responsive |
| Section titles (h2) | `clamp(1.75rem, 4vw, 2.25rem)` | Responsive |
| Card titles (h3) | `1.25rem` / `1.1rem` mobile | Fixed |
| Body text | `1rem` (16px base) | Standard |
| Small text | `0.875rem` | Tags, meta |

### Line Heights

```css
body { line-height: 1.6; }
p { line-height: 1.8; }  /* For readability */
```

## Spacing

### Container

```css
--max-width: 1100px;
.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
}
```

### Section Spacing

| Element | Padding |
|---------|---------|
| Sections | `4rem 0` (desktop) / `3rem 0` (mobile) |
| Cards | `1.5rem` / `1.25rem` (mobile) |
| Header | `4rem 0` (desktop) / `3rem 1rem` (mobile) |

## Components

### Cards

```css
.card {
  background: var(--color-bg);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### Tags/Pills

```css
.tag {
  background: var(--color-bg-alt);
  color: var(--color-text);
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;  /* Full round */
  font-size: 0.875rem;
  font-weight: 500;
}
```

### Timeline

```css
.timeline-item {
  position: relative;
  padding-left: 2rem;
  padding-bottom: 2rem;
  border-left: 2px solid var(--color-border);
}

.timeline-dot {
  position: absolute;
  left: -6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
}

/* Active/current position */
.timeline-dot.active {
  background: var(--color-accent);
  animation: pulse 2s infinite;
}
```

## Border Radius

```css
--radius: 8px;

/* Full round for pills/avatars */
border-radius: 9999px;

/* Profile image */
border-radius: 50%;
```

## Responsive Breakpoints

```css
/* Mobile-first approach */
/* Single breakpoint at 768px */

@media (min-width: 768px) {
  /* Desktop adjustments */
}

/* Fluid typography via clamp() */
```

### Common Responsive Patterns

```css
/* Grid: Single column mobile → Multi-column desktop */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Highlights: 4 columns on desktop */
@media (min-width: 768px) {
  .highlights-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Animations

### Hover Transitions

```css
transition: transform 0.2s ease, box-shadow 0.2s ease;
```

### Pulse Animation (Active Timeline Dot)

```css
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Icons (SVG)

All icons are inline SVGs with consistent sizing:

```html
<svg width="24" height="24" viewBox="0 0 24 24"
     fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Icon paths -->
</svg>
```

### Icon Sizes

| Context | Size |
|---------|------|
| Navigation | 20x20 |
| Card icons | 24x24 |
| Social links | 20x20 |

## Print Styles

```css
@media print {
  .nav, .skip-link, .contact { display: none; }
  body { font-size: 12pt; }
  a { color: black; text-decoration: underline; }
  .header { background: white; color: black; }
}
```

## Focus States (Accessibility)

```css
a:focus, button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Skip link visible on focus */
.skip-link:focus {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
}
```

## Style File Locations

| File | Lines | Purpose |
|------|-------|---------|
| `src/styles/global.css` | 38 | CSS variables, reset, base styles |
| `src/styles/blog.css` | 525 | Blog listing page styles |
| `src/pages/index.astro` (inline) | ~620 | Main portfolio page styles |
| `src/layouts/BlogPostLayout.astro` (inline) | ~560 | Blog post page styles |
