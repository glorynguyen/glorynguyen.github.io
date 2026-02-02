# Technical Architecture

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Pages (Hosting)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  index.html │  │  blog/      │  │  assets/            │  │
│  │  (Main)     │  │  (Blog)     │  │  (Static Files)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  HTML5 + CSS3 (inline) + Vanilla JavaScript                 │
├─────────────────────────────────────────────────────────────┤
│  Google Fonts (Inter) - External Dependency                 │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
glorynguyen.github.io/
├── index.html                    # Main portfolio (single-page)
│   ├── <style> block             # All CSS (~800 lines)
│   └── HTML content              # All sections
│
├── assets/
│   └── profile.webp               # Profile image (82KB)
│
├── blog/
│   ├── index.html                # Blog listing page
│   ├── css/
│   │   └── blog.css              # Blog-specific styles (~520 lines)
│   ├── js/
│   │   └── i18n.js               # Internationalization (~120 lines)
│   └── posts/
│       └── [post-name].html      # Individual blog posts
│
├── .claude/
│   └── docs/                     # Knowledge base (you are here)
│
├── CLAUDE.md                     # Main context file for Claude
└── .git/                         # Git repository
```

## Design Decisions

### Why No Build Tools?

| Reason | Benefit |
|--------|---------|
| Simplicity | No npm, webpack, or toolchain setup |
| Speed | Instant deployment, no build step |
| Maintenance | No dependency updates or vulnerabilities |
| Portability | Works anywhere, any server |
| Debugging | WYSIWYG - what you write is what runs |

### Why Inline CSS?

1. **Single Request** - No additional HTTP requests for stylesheets
2. **No FOUC** - Flash of Unstyled Content eliminated
3. **Atomic Deployment** - One file = complete page
4. **Cache Efficiency** - Entire page cached together

### Why Vanilla JavaScript?

1. **Blog i18n only** - Minimal JS needed (language switching)
2. **No Runtime** - Zero framework overhead
3. **Fast Load** - No large bundle to parse
4. **Future-proof** - Browser APIs are stable

## Page Load Sequence

```
1. Browser requests index.html
2. HTML parsing begins
   ├── <head> parsed
   │   ├── Meta tags processed
   │   ├── Font preconnect initiated
   │   └── Inline <style> applied immediately
   └── <body> rendered progressively
3. Google Fonts loaded (async, swap)
4. Images loaded (profile.webp)
5. Page interactive (no JS blocking)
```

## Blog Architecture

```
blog/
├── index.html          # Entry point
│   ├── Links to blog.css
│   ├── Links to i18n.js
│   └── Post list cards
│
├── css/blog.css        # External stylesheet
│   ├── CSS variables (same as main)
│   ├── Blog-specific components
│   └── Responsive styles
│
├── js/i18n.js          # Language system
│   ├── Language detection
│   ├── localStorage persistence
│   ├── DOM visibility toggling
│   └── Custom event dispatch
│
└── posts/
    └── [post].html     # Each post is standalone
        ├── Own <head> with meta tags
        ├── Links to ../css/blog.css
        ├── Links to ../js/i18n.js
        ├── data-lang="en" content
        └── data-lang="vi" content
```

## SEO Architecture

### Structured Data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Vinh Nguyen",
  "jobTitle": "Front-End Technical Lead",
  "url": "https://glorynguyen.github.io",
  "sameAs": ["linkedin-url", "github-url"],
  "knowsAbout": ["React", "Next.js", "Angular", ...]
}
```

### Meta Tag Strategy

| Tag | Purpose |
|-----|---------|
| `<title>` | Search result title |
| `<meta description>` | Search result snippet |
| `<meta keywords>` | SEO keywords (limited value) |
| `<link canonical>` | Authoritative URL |
| `og:*` tags | Facebook/LinkedIn sharing |
| `twitter:*` tags | Twitter sharing |

## Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| **HTML Size** | ~45KB | Includes inline CSS |
| **Total Assets** | ~250KB | Including profile image |
| **HTTP Requests** | 3-4 | HTML, font, image |
| **Time to Interactive** | <1s | No JS blocking |
| **Lighthouse Score** | 95+ | Performance optimized |

## Accessibility Architecture

```
Skip Link (hidden until focused)
    │
    ▼
Header (role="banner")
    │
    ▼
Navigation (role="navigation")
    │
    ▼
Main Content (role="main")
    ├── Sections with headings (h2)
    │   └── Subsections (h3)
    └── Proper landmark roles
    │
    ▼
Footer (role="contentinfo")
```

## Deployment Flow

```
Local Development
       │
       ▼
Git Commit (claude/* branch)
       │
       ▼
Pull Request Created
       │
       ▼
Review & Merge to main
       │
       ▼
GitHub Pages Auto-Deploy
       │
       ▼
Live at glorynguyen.github.io
```
