# Technical Architecture

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 GitHub Pages (Hosting)                       │
├─────────────────────────────────────────────────────────────┤
│               GitHub Actions (CI/CD)                        │
│         Node 20 → npm ci → astro build → dist/             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Astro 5.3    │  │ @astrojs/mdx │  │ TypeScript      │   │
│  │ (SSG)        │  │ (Blog)       │  │ (Strict)        │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Astro Components + Scoped CSS + Vanilla JavaScript         │
├─────────────────────────────────────────────────────────────┤
│  Google Fonts (Inter) - External Dependency                 │
└─────────────────────────────────────────────────────────────┘
```

## Source Structure

```
src/
├── pages/                           # File-based routing
│   ├── index.astro                  # Main portfolio (single-page, ~1200 lines)
│   ├── gitsage.astro                # Project page (standalone)
│   ├── ollama-code-review.astro     # Project page (standalone)
│   ├── gsap-mcp.astro               # Project page (standalone)
│   ├── confluence-mcp.astro         # Project page (standalone)
│   └── blog/
│       ├── index.astro              # Blog listing (uses getCollection)
│       └── posts/
│           └── [...slug].astro      # Dynamic route for blog posts
│
├── layouts/
│   ├── BaseLayout.astro             # HTML wrapper with SEO meta tags
│   ├── BlogLayout.astro             # Blog listing page layout
│   └── BlogPostLayout.astro         # Blog post layout (763 lines, inline CSS)
│
├── components/
│   ├── BlogHeader.astro             # Blog header with navigation
│   ├── BlogFooter.astro             # Blog footer with links
│   ├── PostCard.astro               # Blog post card (94 lines)
│   └── blog/                        # MDX-usable blog components
│       ├── Callout.astro            # Alert boxes (info/success/warning/error)
│       ├── CodeDemo.astro           # Interactive code demos
│       ├── ImageComparison.astro    # Before/after slider
│       ├── ShareButtons.astro       # Social sharing buttons
│       └── TableOfContents.astro    # Auto-generated TOC
│
├── content/
│   ├── config.ts                    # Zod schema for blog collection
│   └── blog/                        # 13 MDX blog posts
│
└── styles/
    ├── global.css                   # CSS variables and base reset
    └── blog.css                     # Blog page styles (525 lines)
```

## Static Assets (public/)

```
public/
├── assets/profile.webp              # Profile image (81 KB)
├── demos/                           # GSAP demo HTML files
│   ├── gsap-text-reveal.html
│   ├── compare-scroll-trigger.html
│   └── morph-toggle.html
├── favicon.ico, favicon-16x16.png, favicon-32x32.png
├── apple-touch-icon.png
├── android-chrome-192x192.png, android-chrome-512x512.png
├── site.webmanifest                 # PWA manifest
├── CNAME                            # Custom domain: vinhnguyenba.dev
└── .nojekyll                        # Disable Jekyll processing
```

## Design Decisions

### Why Astro?

| Reason | Benefit |
|--------|---------|
| Static output | Pre-rendered HTML, no runtime overhead |
| MDX support | Rich blog content with embedded components |
| Content Collections | Type-safe content with Zod validation |
| File-based routing | Intuitive page structure |
| Scoped CSS | Component-level styling without conflicts |
| Zero JS by default | Ships no JavaScript unless explicitly needed |

### Why MDX for Blog?

1. **Markdown simplicity** - Write content naturally
2. **Component embedding** - Use Astro components (Callout, CodeDemo, etc.) within posts
3. **Frontmatter validation** - Zod schema ensures all posts have required metadata
4. **Auto-collection** - New MDX files automatically appear in blog listing

### Why Scoped/Inline CSS?

1. **No FOUC** - Styles load with the component
2. **Component isolation** - Styles scoped to their component
3. **No naming conflicts** - Astro auto-scopes CSS classes
4. **Single-file components** - Template + styles in one file

### Why Vanilla JavaScript?

1. **Blog i18n only** - Minimal JS needed (language switching)
2. **No runtime** - Zero framework overhead
3. **Fast load** - No large bundle to parse
4. **Astro islands** - Could add interactive islands if needed in the future

## Build Pipeline

```
Source (src/)
    │
    ▼
Astro Build (npm run build)
    ├── Process .astro pages and layouts
    ├── Compile MDX blog posts
    ├── Apply Zod schema validation
    ├── Generate static HTML
    ├── Bundle and scope CSS
    └── Copy public/ assets
    │
    ▼
Output (dist/)
    │
    ▼
GitHub Actions uploads dist/ as Pages artifact
    │
    ▼
Live at vinhnguyenba.dev
```

## Page Load Sequence

```
1. Browser requests page (e.g., index.html)
2. HTML parsing begins
   ├── <head> parsed
   │   ├── Meta tags processed
   │   ├── Font preconnect initiated
   │   └── Scoped <style> applied immediately
   └── <body> rendered progressively
3. Google Fonts loaded (async, swap)
4. Images loaded (profile.webp)
5. Page interactive (minimal JS, only on blog pages for i18n)
```

## Blog Architecture

```
src/content/blog/*.mdx          → Content source (Markdown + components)
        │
        ▼
src/content/config.ts           → Zod schema validation
        │
        ▼
src/pages/blog/index.astro      → getCollection('blog') → sorted listing
src/pages/blog/posts/[...slug]  → getStaticPaths() → individual pages
        │
        ▼
src/layouts/BlogPostLayout.astro → Full page layout with styles & i18n
src/components/PostCard.astro    → Card component for listing page
```

## SEO Architecture

### Structured Data (JSON-LD)

- **index.astro**: Person schema (name, jobTitle, url, sameAs, knowsAbout)
- **BlogPostLayout.astro**: BlogPosting schema (headline, datePublished, author)

### Meta Tag Strategy (via BaseLayout.astro)

| Tag | Purpose |
|-----|---------|
| `<title>` | Search result title |
| `<meta description>` | Search result snippet |
| `<link canonical>` | Authoritative URL |
| `og:*` tags | Facebook/LinkedIn sharing |
| `twitter:*` tags | Twitter sharing |

## Accessibility Architecture

```
Skip Link (hidden until focused)
    │
    ▼
Header (semantic <header>)
    │
    ▼
Navigation (semantic <nav>)
    │
    ▼
Main Content (semantic <main>)
    ├── Sections with headings (h2)
    │   └── Subsections (h3)
    └── Proper landmark structure
    │
    ▼
Footer (semantic <footer>)
```

## Deployment Flow

```
Local Development (npm run dev)
       │
       ▼
Git Commit (claude/* branch)
       │
       ▼
Pull Request Created
       │
       ▼
Review & Merge to master
       │
       ▼
GitHub Actions: checkout → npm ci → astro build → upload artifact
       │
       ▼
GitHub Pages Deploy
       │
       ▼
Live at vinhnguyenba.dev
```
