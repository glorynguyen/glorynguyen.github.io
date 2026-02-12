# Development Patterns & Conventions

## Astro Component Pattern

### Page Structure (.astro files)

```astro
---
// Frontmatter: runs at build time (server-side)
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const posts = await getCollection('blog');
---

<!-- Template: rendered to static HTML -->
<BaseLayout title="Page Title">
  <main>
    <h1>Content</h1>
    {posts.map(post => (
      <article>{post.data.title}</article>
    ))}
  </main>
</BaseLayout>

<style>
  /* Scoped CSS: auto-scoped to this component */
  main { max-width: var(--max-width); }
</style>
```

### Layout Pattern

```astro
---
// src/layouts/BaseLayout.astro
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  {description && <meta name="description" content={description} />}
</head>
<body>
  <slot />  <!-- Child content injected here -->
</body>
</html>
```

### Component Pattern

```astro
---
// src/components/PostCard.astro
interface Props {
  title: string;
  description: string;
  slug: string;
  pubDate: Date;
  tags: string[];
}

const { title, description, slug, pubDate, tags } = Astro.props;
---

<article class="post-card">
  <h2>{title}</h2>
  <p>{description}</p>
  <a href={`/blog/posts/${slug}`}>Read more</a>
</article>

<style>
  .post-card { /* scoped styles */ }
</style>
```

## Content Collection Pattern

### Schema Definition (src/content/config.ts)

```typescript
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default('Vinh Nguyen'),
    tags: z.array(z.string()),
    titleVi: z.string().optional(),
    descriptionVi: z.string().optional(),
  }),
});

export const collections = { 'blog': blogCollection };
```

### Querying Content

```astro
---
import { getCollection } from 'astro:content';

// Get all posts sorted by date
const posts = (await getCollection('blog'))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
```

### Dynamic Routes

```astro
---
// src/pages/blog/posts/[...slug].astro
import { getCollection } from 'astro:content';
import BlogPostLayout from '../../../layouts/BlogPostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<BlogPostLayout frontmatter={post.data}>
  <Content />
</BlogPostLayout>
```

## CSS Conventions

### Property Order

```css
.element {
  /* 1. Positioning */
  position: relative;
  top: 0;
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

/* Utility: descriptive action */
.skip-link { }
.visually-hidden { }
```

### Where Styles Live

| Location | Scope | What goes here |
|----------|-------|----------------|
| `src/styles/global.css` | Global | CSS variables, reset, base styles |
| `src/styles/blog.css` | Blog pages | Blog listing and shared blog styles |
| `<style>` in `.astro` files | Scoped | Component-specific styles |
| `<style is:global>` | Global | Styles that need to pierce component boundaries |

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

### Inline Script Pattern (for Astro pages)

JavaScript is kept minimal and typically inline within Astro layouts/pages:

```astro
<script>
  // Runs on the client, bundled by Astro
  document.addEventListener('DOMContentLoaded', () => {
    // Setup code
  });
</script>
```

### IIFE Pattern (for i18n)

```javascript
(function() {
  'use strict';
  const CONSTANT = 'value';

  function privateHelper() { }
  function publicMethod() { }

  document.addEventListener('DOMContentLoaded', () => {
    // Initialize
  });

  window.ModuleName = { publicMethod };
})();
```

### Event Handling

```javascript
// addEventListener preferred
element.addEventListener('click', handleClick);

// Custom events for cross-component communication
document.dispatchEvent(new CustomEvent('eventname', {
  detail: { data: value }
}));
```

## Git Conventions

### Branch Naming

```
claude/feature-description-sessionId
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

1. Create feature branch from `master`
2. Make changes with descriptive commits
3. Push to remote
4. Create PR with summary
5. Merge to `master` after review
6. GitHub Actions auto-builds and deploys

## Accessibility Patterns

### Semantic HTML

```html
<header>   <!-- not <div class="header"> -->
<nav>      <!-- not <div class="nav"> -->
<main>     <!-- not <div class="main"> -->
<article>  <!-- not <div class="article"> -->
<section>  <!-- not <div class="section"> -->
<footer>   <!-- not <div class="footer"> -->
```

### ARIA When Needed

```html
<button aria-pressed="false">Toggle</button>
<a href="..." aria-label="LinkedIn Profile">
  <svg>...</svg>
</a>
```

### Focus Management

```css
a:focus, button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

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

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing Checklist

### Before Committing

- [ ] `npm run build` succeeds without errors
- [ ] HTML validates
- [ ] No console errors
- [ ] Links work (internal and external)
- [ ] Images load correctly
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1200px)

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Color contrast passes (4.5:1 for text)
- [ ] Skip link works

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome (Android)
