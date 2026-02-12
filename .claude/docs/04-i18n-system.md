# Internationalization (i18n) System

## Overview

The blog section supports multiple languages using a client-side JavaScript implementation embedded inline in `BlogPostLayout.astro`. Currently supports:

- **English (en)** - Default
- **Vietnamese (vi)** - Secondary

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Astro Blog Content                        │
│                                                             │
│  MDX Frontmatter:                 HTML Content:             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │ title (EN)      │    │ data-lang="en"  │                │
│  │ titleVi (VI)    │    │ (visible)       │                │
│  │ description     │    ├─────────────────┤                │
│  │ descriptionVi   │    │ data-lang="vi"  │                │
│  └─────────────────┘    │ (hidden)        │                │
│                          └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Inline JavaScript (BlogPostLayout)             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Detection   │  │ Switching   │  │ Persistence         │ │
│  │ (browser)   │→ │ (toggle)    │→ │ (localStorage)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Two Layers of i18n

### Layer 1: MDX Frontmatter (Blog Listing Page)

The blog listing page (`src/pages/blog/index.astro`) uses frontmatter fields to display bilingual titles and descriptions:

```yaml
---
title: "English Title"
description: "English description"
titleVi: "Tiêu đề tiếng Việt"       # Optional
descriptionVi: "Mô tả tiếng Việt"   # Optional
---
```

The `PostCard.astro` component renders both versions, toggled by the i18n script.

### Layer 2: HTML Content Blocks (Blog Posts & Listing)

```html
<!-- English content (shown by default) -->
<div data-lang="en">
  <h1>Title in English</h1>
  <p>Content in English...</p>
</div>

<!-- Vietnamese content (hidden by default) -->
<div data-lang="vi" hidden>
  <h1>Tiêu đề tiếng Việt</h1>
  <p>Nội dung tiếng Việt...</p>
</div>
```

### Language Switcher

```html
<div class="language-switcher">
  <button class="lang-btn active" data-lang="en" aria-pressed="true">EN</button>
  <button class="lang-btn" data-lang="vi" aria-pressed="false">VI</button>
</div>
```

## JavaScript Implementation

The i18n script is embedded inline in `src/layouts/BlogPostLayout.astro` as an IIFE:

```javascript
(function() {
  const SUPPORTED_LANGUAGES = ['en', 'vi'];
  const DEFAULT_LANGUAGE = 'en';
  const STORAGE_KEY = 'blog-language';

  function getInitialLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;

    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(browserLang)) return browserLang;

    return DEFAULT_LANGUAGE;
  }

  function setLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;

    // Update content visibility
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.hidden = el.dataset.lang !== lang;
    });

    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });

    // Save preference
    localStorage.setItem(STORAGE_KEY, lang);

    // Dispatch event
    document.dispatchEvent(new CustomEvent('languagechange', {
      detail: { language: lang }
    }));
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setLanguage(getInitialLanguage());
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
  });

  window.i18n = { setLanguage, getLanguage: getInitialLanguage };
})();
```

## Detection Priority

1. **localStorage** - User's previous choice (highest priority)
2. **Browser language** - `navigator.language` (e.g., "vi-VN" → "vi")
3. **Default** - English (fallback)

## Adding New Languages

### Step 1: Update the inline script in BlogPostLayout.astro

```javascript
const SUPPORTED_LANGUAGES = ['en', 'vi', 'fr']; // Add new language code
```

### Step 2: Add Language Button

```html
<button class="lang-btn" data-lang="fr">FR</button>
```

### Step 3: Add Content Blocks

In MDX frontmatter (for listing page):
```yaml
titleFr: "Titre en français"
descriptionFr: "Description en français"
```

In HTML content blocks (for post body):
```html
<div data-lang="fr" hidden>French content</div>
```

### Step 4: Update Zod Schema

Add optional fields to `src/content/config.ts`:
```typescript
titleFr: z.string().optional(),
descriptionFr: z.string().optional(),
```

## CSS for Language Switcher

Styles are defined inline in `BlogPostLayout.astro`:

```css
.language-switcher {
  display: flex;
  gap: 0.5rem;
}

.lang-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-bg);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.lang-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
```

## Listening to Language Changes

```javascript
document.addEventListener('languagechange', (e) => {
  console.log('Language changed to:', e.detail.language);
});
```

## Best Practices

### DO:
- Keep both language versions in sync structurally
- Use semantic HTML in both versions
- Test both languages after changes
- Add `titleVi` and `descriptionVi` to frontmatter for listing page support
- Maintain consistent formatting across languages

### DON'T:
- Mix languages within a single `data-lang` block
- Forget the `hidden` attribute on non-default languages
- Hard-code language strings in JavaScript
- Forget `aria-pressed` on language buttons
