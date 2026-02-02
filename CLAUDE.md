# CLAUDE.md - Project Knowledge Base

> This file serves as the primary context for Claude AI when working with this repository.

## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Project** | vinhnguyenba.dev |
| **Type** | Static Portfolio Website (GitHub Pages) |
| **Owner** | Vinh Nguyen (Vincent) - Front-End Technical Lead |
| **Stack** | HTML5, CSS3, Vanilla JavaScript |
| **URL** | https://vinhnguyenba.dev |

## Project Structure

```
vinhnguyenba.dev/
├── index.html              # Main portfolio page (~1100 lines)
├── assets/
│   └── profile.webp         # Profile image
├── blog/
│   ├── index.html          # Blog listing page
│   ├── css/blog.css        # Blog styles
│   ├── js/i18n.js          # Internationalization utility
│   └── posts/              # Blog post HTML files
│       └── ai-will-not-replace-developers.html
└── .claude/docs/           # Knowledge base documents
```

## Key Technical Decisions

1. **No Build Tools** - Pure static site, no bundlers or preprocessors
2. **No CSS Frameworks** - Custom CSS with design system via CSS variables
3. **No JS Frameworks** - Vanilla JavaScript only (lightweight)
4. **Inline Styles** - CSS embedded in HTML for single-request loading
5. **SVG Icons** - Inline SVGs, no icon libraries

## Design System (CSS Variables)

```css
--color-primary: #2563eb     /* Blue - main brand color */
--color-primary-dark: #1d4ed8
--color-accent: #10b981      /* Green - highlights/active states */
--color-text: #1f2937        /* Dark gray */
--color-text-light: #6b7280  /* Light gray */
--color-bg: #ffffff
--color-bg-alt: #f9fafb
--color-border: #e5e7eb
--max-width: 1100px
--radius: 8px
```

## Main Sections (index.html)

1. **Header** - Profile image, hero text, gradient background
2. **Navigation** - Sticky nav with section links + Blog link
3. **Leadership Highlights** - 4 metric cards (10+ years, 50+ mentored, etc.)
4. **Leadership Philosophy** - 4 pillar cards with SVG icons
5. **Technical Skills** - 8 category skill tags
6. **Experience Timeline** - 4 positions with timeline visualization
7. **Side Projects** - 5 personal project cards
8. **About** - Personal narrative
9. **Contact** - LinkedIn/GitHub links with CTA

## Blog System

- **i18n Support**: English (en) and Vietnamese (vi)
- **Language Detection**: Browser language → localStorage → fallback to English
- **Content Marking**: `data-lang="en"` or `data-lang="vi"` attributes
- **Switching**: Language buttons update visibility via JavaScript

## Common Tasks

### Add a New Blog Post

1. Create HTML file in `blog/posts/`
2. Use existing post as template
3. Include both `data-lang="en"` and `data-lang="vi"` content blocks
4. Add post card to `blog/index.html`

### Modify Styles

1. Locate the `<style>` block in `index.html` (lines ~14-850)
2. Use CSS variables for consistency
3. Follow existing naming conventions
4. Test responsive breakpoints (768px, mobile)

### Add New Portfolio Section

1. Add section in `index.html` after existing sections
2. Add navigation link in `.nav-links`
3. Use existing section patterns for consistency
4. Include proper heading hierarchy (h2 for sections)

## Accessibility Checklist

- [ ] Skip link exists (`.skip-link`)
- [ ] Semantic HTML (header, nav, main, article, section, footer)
- [ ] ARIA labels where needed
- [ ] Focus states visible (outline: 2px solid var(--color-primary))
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG

## SEO Elements

- Open Graph meta tags for social sharing
- Twitter Card support
- JSON-LD structured data (Person, BlogPosting schemas)
- Canonical URLs
- Meta description and keywords

## Knowledge Base Documents

For detailed documentation, see `.claude/docs/`:

| File | Purpose |
|------|---------|
| [01-project-overview.md](.claude/docs/01-project-overview.md) | Project context and professional profile |
| [02-architecture.md](.claude/docs/02-architecture.md) | Technical architecture details |
| [03-design-system.md](.claude/docs/03-design-system.md) | CSS patterns and styling guide |
| [04-i18n-system.md](.claude/docs/04-i18n-system.md) | Internationalization implementation |
| [05-content-guide.md](.claude/docs/05-content-guide.md) | Content structure and templates |
| [06-development-patterns.md](.claude/docs/06-development-patterns.md) | Code patterns and conventions |

## Development Notes

- **Git Workflow**: PR-based with Claude-assisted development
- **Commit Style**: Descriptive messages with context
- **Testing**: Manual browser testing (Chrome, Firefox, Safari, mobile)
- **Deployment**: Automatic via GitHub Pages on push to main

---

*Last updated: February 2026*
