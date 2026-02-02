# Development Patterns & Conventions

## Code Organization

### HTML Structure Pattern

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- 1. Meta tags (charset first) -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 2. SEO meta tags -->
  <title>Page Title</title>
  <meta name="description" content="...">

  <!-- 3. Open Graph / Social -->
  <meta property="og:...">

  <!-- 4. Structured data -->
  <script type="application/ld+json">...</script>

  <!-- 5. Fonts (with preconnect) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/..." rel="stylesheet">

  <!-- 6. Styles -->
  <style>/* CSS here */</style>
</head>
<body>
  <!-- 7. Skip link -->
  <a href="#main" class="skip-link">Skip to main content</a>

  <!-- 8. Header -->
  <header role="banner">...</header>

  <!-- 9. Navigation -->
  <nav role="navigation">...</nav>

  <!-- 10. Main content -->
  <main id="main" role="main">
    <section id="section-name">...</section>
  </main>

  <!-- 11. Footer -->
  <footer role="contentinfo">...</footer>

  <!-- 12. Scripts (if any) -->
  <script src="..."></script>
</body>
</html>
```

## CSS Conventions

### Property Order

```css
.element {
  /* 1. Positioning */
  position: relative;
  top: 0;
  left: 0;
  z-index: 1;

  /* 2. Display & Box Model */
  display: flex;
  width: 100%;
  padding: 1rem;
  margin: 0;

  /* 3. Typography */
  font-family: var(--font);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);

  /* 4. Visual */
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);

  /* 5. Animation */
  transition: transform 0.2s ease;
}
```

### Naming Conventions

```css
/* Component: lowercase with hyphens */
.nav-links { }
.skill-tag { }
.timeline-item { }

/* State: is- or has- prefix */
.is-active { }
.has-error { }

/* Modifier: element--modifier */
.btn--primary { }
.card--featured { }

/* Utility: descriptive action */
.skip-link { }
.visually-hidden { }
```

### Responsive Pattern

```css
/* Mobile-first: base styles for mobile */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Scale up for larger screens */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

/* Use clamp() for fluid typography */
h1 {
  font-size: clamp(2rem, 5vw, 3rem);
}
```

## JavaScript Conventions

### Module Pattern (IIFE)

```javascript
(function() {
  'use strict';

  // Private variables
  const CONSTANT = 'value';
  let state = {};

  // Private functions
  function privateHelper() { }

  // Public API
  function publicMethod() { }

  // Initialization
  function init() {
    document.addEventListener('DOMContentLoaded', () => {
      // Setup code
    });
  }

  // Expose public API
  window.ModuleName = {
    publicMethod,
    init
  };

  // Auto-initialize
  init();
})();
```

### Event Handling

```javascript
// Preferred: addEventListener
element.addEventListener('click', handleClick);

// Event delegation for dynamic content
document.addEventListener('click', (e) => {
  if (e.target.matches('.btn')) {
    handleButtonClick(e.target);
  }
});

// Custom events for component communication
document.dispatchEvent(new CustomEvent('eventname', {
  detail: { data: value }
}));
```

### DOM Manipulation

```javascript
// Query elements
const element = document.querySelector('.selector');
const elements = document.querySelectorAll('.selector');

// Modify classes
element.classList.add('active');
element.classList.remove('active');
element.classList.toggle('active');

// Modify attributes
element.setAttribute('aria-pressed', 'true');
element.hidden = true;

// Modify content
element.textContent = 'Safe text';
element.innerHTML = '<span>Use sparingly</span>';
```

## Git Conventions

### Branch Naming

```
claude/feature-description-sessionId
# Example: claude/add-blog-section-I5Sa9
```

### Commit Messages

```
<type>: <short description>

[optional body with details]

https://claude.ai/code/session_xxxxx
```

Types:
- `Add` - New feature or content
- `Update` - Enhancement to existing feature
- `Fix` - Bug fix
- `Refactor` - Code restructure without behavior change
- `Style` - CSS/formatting changes
- `Docs` - Documentation only

### PR Workflow

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Push to remote
4. Create PR with summary
5. Merge to `main` after review
6. GitHub Pages auto-deploys

## Accessibility Patterns

### Semantic HTML

```html
<!-- Use semantic elements -->
<header> not <div class="header">
<nav> not <div class="nav">
<main> not <div class="main">
<article> not <div class="article">
<section> not <div class="section">
<footer> not <div class="footer">
```

### ARIA When Needed

```html
<!-- Role for landmarks -->
<header role="banner">
<nav role="navigation">
<main role="main">
<footer role="contentinfo">

<!-- State for interactive elements -->
<button aria-pressed="false">Toggle</button>
<div aria-expanded="false">Expandable</div>

<!-- Labels for icons -->
<a href="..." aria-label="LinkedIn Profile">
  <svg>...</svg>
</a>
```

### Focus Management

```css
/* Visible focus states */
a:focus,
button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Skip link pattern */
.skip-link {
  position: absolute;
  left: -9999px;
}

.skip-link:focus {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 9999;
}
```

## Performance Patterns

### Font Loading

```html
<!-- Preconnect to font origins -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Load with swap for fast text rendering -->
<link href="...&display=swap" rel="stylesheet">
```

### Image Loading

```html
<!-- Lazy load below-fold images -->
<img src="image.jpg" loading="lazy" alt="Description">

<!-- Explicit dimensions prevent layout shift -->
<img src="image.jpg" width="180" height="180" alt="Description">
```

### CSS Optimization

```css
/* Use CSS variables for consistency and smaller file size */
color: var(--color-primary);

/* Avoid expensive selectors */
.nav-links a { }  /* Good */
* .nav-links > a { }  /* Avoid */

/* Use transform for animations (GPU accelerated) */
transform: translateY(-2px);  /* Good */
margin-top: -2px;  /* Avoid for animation */
```

## Testing Checklist

### Before Committing

- [ ] HTML validates (no errors)
- [ ] CSS validates (no errors)
- [ ] JavaScript console has no errors
- [ ] Links work (internal and external)
- [ ] Images load correctly
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1200px)

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Screen reader announces content logically
- [ ] Color contrast passes (4.5:1 for text)
- [ ] Skip link works

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome (Android)

## File Templates

### New Blog Post Filename

```
blog/posts/descriptive-url-slug.html
# Example: blog/posts/ai-will-not-replace-developers.html
```

### New Asset Filename

```
assets/description-size.extension
# Example: assets/team-photo-800.jpg
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CSS not updating | Hard refresh (Ctrl+Shift+R) |
| Mobile nav broken | Check flexbox `flex-wrap` property |
| Font flash (FOUT) | Ensure `display=swap` on font URL |
| Layout shift | Add explicit width/height to images |
| i18n not working | Check `data-lang` attributes and script load order |
| Focus outline missing | Ensure `:focus` styles not overridden |
