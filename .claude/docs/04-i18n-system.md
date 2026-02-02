# Internationalization (i18n) System

## Overview

The blog section supports multiple languages using a client-side JavaScript implementation. Currently supports:

- **English (en)** - Default
- **Vietnamese (vi)** - Secondary

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      HTML Content                           │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  data-lang="en" │    │  data-lang="vi" │                │
│  │  (visible)      │    │  (hidden)       │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       i18n.js                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Detection   │  │ Switching   │  │ Persistence         │ │
│  │ (browser)   │→ │ (toggle)    │→ │ (localStorage)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## HTML Markup Pattern

### Content Blocks

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

### File: `blog/js/i18n.js`

```javascript
(function() {
  const SUPPORTED_LANGUAGES = ['en', 'vi'];
  const DEFAULT_LANGUAGE = 'en';
  const STORAGE_KEY = 'blog-language';

  // Get saved or detected language
  function getInitialLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;

    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(browserLang)) return browserLang;

    return DEFAULT_LANGUAGE;
  }

  // Switch language
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

    // Dispatch event for other components
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

  // Expose API
  window.i18n = { setLanguage, getLanguage: getInitialLanguage };
})();
```

## Detection Priority

1. **localStorage** - User's previous choice (highest priority)
2. **Browser language** - `navigator.language` (e.g., "vi-VN" → "vi")
3. **Default** - English (fallback)

## Adding New Languages

### Step 1: Update i18n.js

```javascript
const SUPPORTED_LANGUAGES = ['en', 'vi', 'fr']; // Add new language code
```

### Step 2: Add Language Button

```html
<div class="language-switcher">
  <button class="lang-btn" data-lang="en">EN</button>
  <button class="lang-btn" data-lang="vi">VI</button>
  <button class="lang-btn" data-lang="fr">FR</button> <!-- New -->
</div>
```

### Step 3: Add Content Blocks

```html
<div data-lang="en">English content</div>
<div data-lang="vi" hidden>Vietnamese content</div>
<div data-lang="fr" hidden>French content</div> <!-- New -->
```

## CSS for Language Switcher

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

.lang-btn:hover {
  border-color: var(--color-primary);
}

.lang-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
```

## Listening to Language Changes

Other scripts can react to language changes:

```javascript
document.addEventListener('languagechange', (e) => {
  console.log('Language changed to:', e.detail.language);
  // Update dynamic content, analytics, etc.
});
```

## Blog Post Template with i18n

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title data-lang="en">Post Title - English</title>
  <title data-lang="vi" hidden>Tiêu đề bài viết - Tiếng Việt</title>
  <link rel="stylesheet" href="../css/blog.css">
</head>
<body>
  <header>
    <a href="../index.html" class="logo">Blog</a>
    <div class="language-switcher">
      <button class="lang-btn active" data-lang="en">EN</button>
      <button class="lang-btn" data-lang="vi">VI</button>
    </div>
  </header>

  <main>
    <article>
      <!-- English Version -->
      <div data-lang="en">
        <h1>Post Title</h1>
        <p>Post content in English...</p>
      </div>

      <!-- Vietnamese Version -->
      <div data-lang="vi" hidden>
        <h1>Tiêu đề bài viết</h1>
        <p>Nội dung bài viết tiếng Việt...</p>
      </div>
    </article>
  </main>

  <script src="../js/i18n.js"></script>
</body>
</html>
```

## Best Practices

### DO:
- Keep both language versions in sync structurally
- Use semantic HTML in both versions
- Test both languages after changes
- Maintain consistent formatting across languages

### DON'T:
- Mix languages within a single `data-lang` block
- Forget the `hidden` attribute on non-default languages
- Hard-code language strings in JavaScript
- Forget `aria-pressed` on language buttons

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Content not switching | Missing `data-lang` attribute | Add attribute to all translatable elements |
| Wrong initial language | localStorage has old value | Clear localStorage or check detection logic |
| Button not highlighting | Missing `.lang-btn` class | Ensure buttons have correct class |
| Flash of wrong language | Script loading late | Move script to head with `defer` |
