# CLAUDE.md - Project Knowledge Base

> This file serves as the primary context for Claude AI when working with this repository.

## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Project** | vinhnguyenba.dev |
| **Type** | Static Portfolio Website (GitHub Pages) |
| **Owner** | Vinh Nguyen (Vincent) - Front-End Technical Lead |
| **Stack** | Astro 5.3, MDX, TypeScript, CSS3 |
| **URL** | https://vinhnguyenba.dev |
| **Node** | 20 |
| **Package Manager** | npm |

## Project Structure

```
vinhnguyenba.dev/
├── src/
│   ├── pages/                       # Astro page routes
│   │   ├── index.astro              # Main portfolio page (~1200 lines)
│   │   ├── gitsage.astro            # Project page: GitSage MCP Server
│   │   ├── ollama-code-review.astro # Project page: Ollama Code Review
│   │   ├── gsap-mcp.astro           # Project page: GSAP MCP Server
│   │   ├── confluence-mcp.astro     # Project page: Confluence MCP Server
│   │   └── blog/
│   │       ├── index.astro          # Blog listing page
│   │       └── posts/
│   │           └── [...slug].astro  # Dynamic blog post route
│   ├── layouts/
│   │   ├── BaseLayout.astro         # HTML/SEO wrapper layout
│   │   ├── BlogLayout.astro         # Blog listing layout
│   │   └── BlogPostLayout.astro     # Blog post layout (with inline styles)
│   ├── components/
│   │   ├── BlogHeader.astro         # Blog header with nav
│   │   ├── BlogFooter.astro         # Blog footer
│   │   ├── PostCard.astro           # Blog post card component
│   │   └── blog/
│   │       ├── Callout.astro        # Info/success/warning/error callout boxes
│   │       ├── CodeDemo.astro       # Interactive code demo component
│   │       ├── ImageComparison.astro # Before/after image slider
│   │       ├── ShareButtons.astro   # Social sharing buttons
│   │       └── TableOfContents.astro # Auto-generated TOC
│   ├── content/
│   │   ├── config.ts               # Zod schema for blog collection
│   │   └── blog/                    # 13 MDX blog posts
│   │       ├── ai-2026-coworker-or-crutch.mdx
│   │       ├── ai-agent-security-warning.mdx
│   │       ├── ai-not-next-abstraction-risky-role-reversal.mdx
│   │       ├── ai-will-not-replace-developers.mdx
│   │       ├── battle-of-brains-open-standards-ai.mdx
│   │       ├── beyond-nvm-volta-future-nodejs.mdx
│   │       ├── e18e-frontend-leadership-2026.mdx
│   │       ├── gsap-mcp-animation-tool.mdx
│   │       ├── headless-architecture-distributed-teams.mdx
│   │       ├── mastering-react-context.mdx
│   │       ├── mcp-ai-real-world-data.mdx
│   │       ├── pm-tech-lead-duo.mdx
│   │       └── the-tinkerers-path.mdx
│   └── styles/
│       ├── global.css               # CSS variables and base reset
│       └── blog.css                 # Blog page styles
├── public/
│   ├── assets/profile.webp          # Profile image
│   ├── demos/                       # GSAP demo HTML files
│   │   ├── gsap-text-reveal.html
│   │   ├── compare-scroll-trigger.html
│   │   └── morph-toggle.html
│   ├── favicon.ico                  # Favicons and PWA icons
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── site.webmanifest
│   ├── CNAME                        # Custom domain pointer
│   └── .nojekyll                    # Disable Jekyll on GitHub Pages
├── .claude/docs/                    # Knowledge base documents
├── .github/workflows/deploy.yml     # GitHub Actions: build & deploy
├── astro.config.mjs                 # Astro configuration
├── tsconfig.json                    # TypeScript (strict mode)
├── package.json                     # npm dependencies
└── CLAUDE.md                        # This file
```

## Key Technical Decisions

1. **Astro 5.3 Framework** - Static site generator with MDX support for blog content
2. **MDX for Blog Posts** - Markdown + JSX components for rich blog content
3. **Astro Content Collections** - Type-safe content management with Zod schema validation
4. **No CSS Frameworks** - Custom CSS with design system via CSS variables
5. **No JS Frameworks** - Vanilla JavaScript only (i18n language switching)
6. **Scoped/Inline Styles** - CSS embedded in Astro components
7. **SVG Icons** - Inline SVGs, no icon libraries
8. **Static Output** - Pre-rendered HTML, no server-side runtime

## npm Scripts

```bash
npm run dev      # Start Astro dev server
npm run build    # Build static site to dist/
npm run preview  # Preview production build locally
```

## Astro Configuration

- **Site URL**: `https://vinhnguyenba.dev`
- **Output**: `static` (SSG)
- **Build format**: `file` (e.g., `/blog.html` not `/blog/index.html`)
- **Trailing slash**: `never`
- **Integrations**: `@astrojs/mdx`

## Design System (CSS Variables)

Defined in `src/styles/global.css`:

```css
--color-primary: #2563eb     /* Blue - main brand color */
--color-primary-dark: #1d4ed8
--color-accent: #10b981      /* Green - highlights/active states */
--color-text: #1f2937        /* Dark gray */
--color-text-light: #6b7280  /* Light gray */
--color-bg: #ffffff
--color-bg-alt: #f9fafb
--color-border: #e5e7eb
--shadow-sm / --shadow-md / --shadow-lg
--radius: 8px
--max-width: 1100px
```

**Font**: Inter (Google Fonts) with system font fallbacks
**Responsive breakpoint**: 768px (mobile)

## Main Sections (src/pages/index.astro)

1. **Header** - Profile image, hero text, gradient background
2. **Navigation** - Sticky nav with section links + Blog link
3. **Leadership Highlights** - 4 metric cards (10+ years, 50+ mentored, Global, 5+)
4. **Leadership Philosophy** - 4 pillar cards with SVG icons
5. **Technical Skills** - 8 category skill tags
6. **Experience Timeline** - 7 positions with timeline visualization
7. **Side Projects** - 8 project cards (4 MCP servers + 4 personal projects)
8. **About** - Personal narrative
9. **Contact** - LinkedIn/GitHub links with CTA
10. **Footer** - Copyright notice

Inline scoped CSS is at the bottom of the file (~620 lines).

## Blog System

### Architecture

- **Content Collection**: `src/content/blog/` with MDX files
- **Schema** (`src/content/config.ts`): Zod-validated frontmatter
- **Listing Page**: `src/pages/blog/index.astro` uses `getCollection('blog')`
- **Dynamic Route**: `src/pages/blog/posts/[...slug].astro` renders each post
- **Layout**: `src/layouts/BlogPostLayout.astro` (763 lines, includes inline styles)

### Blog Post Frontmatter Schema

```typescript
{
  title: string,          // Required - English title
  description: string,    // Required - English description
  pubDate: date,          // Required - Publication date
  author: string,         // Default: 'Vinh Nguyen'
  tags: string[],         // Required - Array of tag strings
  titleVi?: string,       // Optional - Vietnamese title
  descriptionVi?: string, // Optional - Vietnamese description
}
```

### Blog Components (src/components/blog/)

| Component | Purpose |
|-----------|---------|
| `Callout.astro` | Info/success/warning/error callout boxes |
| `CodeDemo.astro` | Interactive code demonstrations |
| `ImageComparison.astro` | Before/after image slider |
| `ShareButtons.astro` | Social sharing buttons |
| `TableOfContents.astro` | Auto-generated table of contents |

### i18n Support

- **Languages**: English (en) and Vietnamese (vi)
- **Detection**: Browser language → localStorage → fallback to English
- **Content Marking**: `data-lang="en"` or `data-lang="vi"` attributes on HTML elements
- **Switching**: Language buttons toggle visibility via inline vanilla JavaScript
- **Persistence**: User preference stored in localStorage (`blog-language` key)

## Project Pages

Standalone Astro pages for featured side projects:

| Page | Project |
|------|---------|
| `gitsage.astro` | GitSage MCP Server |
| `ollama-code-review.astro` | Ollama Code Review VS Code Extension |
| `gsap-mcp.astro` | GSAP MCP Server |
| `confluence-mcp.astro` | Confluence MCP Server |

## Common Tasks

### Add a New Blog Post

1. Create an MDX file in `src/content/blog/` (e.g., `my-new-post.mdx`)
2. Add frontmatter with required fields (`title`, `description`, `pubDate`, `tags`)
3. Optionally add `titleVi` and `descriptionVi` for Vietnamese support
4. Write content using Markdown + optional Astro components (Callout, CodeDemo, etc.)
5. The post auto-appears on the blog listing page (sorted by date, newest first)

### Use a Blog Component in MDX

```mdx
---
title: "My Post"
description: "Description"
pubDate: 2026-02-12
tags: ["topic"]
---
import Callout from '../../components/blog/Callout.astro';

<Callout type="info">
  This is an informational callout.
</Callout>
```

### Modify Styles

- **Global variables**: Edit `src/styles/global.css`
- **Main page styles**: Edit the `<style>` block at the bottom of `src/pages/index.astro`
- **Blog styles**: Edit `src/styles/blog.css` or the inline styles in `src/layouts/BlogPostLayout.astro`
- Use CSS variables for consistency
- Test responsive breakpoints (768px mobile)

### Add New Portfolio Section

1. Add section HTML in `src/pages/index.astro` after existing sections
2. Add navigation link in the `<nav>` section
3. Add corresponding styles in the `<style>` block
4. Use existing section patterns for consistency
5. Maintain heading hierarchy (h2 for sections)

### Add a New Project Page

1. Create a new `.astro` file in `src/pages/`
2. Use existing project pages (e.g., `gitsage.astro`) as a template
3. Add a link to the project from `src/pages/index.astro` side projects section

## Deployment

- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)
- **Trigger**: Push to `master` branch or manual dispatch
- **Build**: Node 20, `npm ci`, `npm run build`
- **Output**: `dist/` directory uploaded as GitHub Pages artifact
- **Domain**: Custom domain via `public/CNAME` → `vinhnguyenba.dev`

## Accessibility

- Skip link (`.skip-link`)
- Semantic HTML5 elements (header, nav, main, article, section, footer)
- ARIA labels on interactive elements
- Focus states (2px solid outline)
- Keyboard navigation support
- Reduced motion support (`prefers-reduced-motion`)
- Print styles included

## SEO

- Open Graph meta tags for social sharing
- Twitter Card support
- JSON-LD structured data (Person schema on index, BlogPosting on posts)
- Canonical URLs
- Meta description and keywords
- Managed via `src/layouts/BaseLayout.astro`

## Knowledge Base Documents

For additional documentation, see `.claude/docs/`:

| File | Purpose |
|------|---------|
| [01-project-overview.md](.claude/docs/01-project-overview.md) | Project context and professional profile |
| [02-architecture.md](.claude/docs/02-architecture.md) | Technical architecture details |
| [03-design-system.md](.claude/docs/03-design-system.md) | CSS patterns and styling guide |
| [04-i18n-system.md](.claude/docs/04-i18n-system.md) | Internationalization implementation |
| [05-content-guide.md](.claude/docs/05-content-guide.md) | Content structure and templates |
| [06-development-patterns.md](.claude/docs/06-development-patterns.md) | Code patterns and conventions |

> **Note**: Some docs may reference the pre-migration vanilla HTML structure. The source of truth is this CLAUDE.md and the actual codebase.

## Development Notes

- **Git Workflow**: PR-based with Claude-assisted development on `claude/*` branches
- **Commit Style**: Descriptive messages with context (type: description)
- **Testing**: Manual browser testing (Chrome, Firefox, Safari, mobile)
- **TypeScript**: Strict mode via `astro/tsconfigs/strict`

---

*Last updated: February 2026*
