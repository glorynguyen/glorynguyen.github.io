# Content Guide

## Portfolio Sections (src/pages/index.astro)

### Section Overview

| Section | Purpose |
|---------|---------|
| Header | Hero with profile image and intro |
| Navigation | Sticky nav links (8 sections + Blog) |
| Highlights | 4 metric cards |
| Leadership | 4 philosophy pillar cards |
| Skills | 8 skill categories with tags |
| Experience | 7-position timeline |
| Projects | 8 side project cards (4 MCP + 4 personal) |
| About | Personal narrative (3 paragraphs) |
| Contact | CTA with LinkedIn/GitHub links |
| Footer | Copyright |

### Highlight Card Template

```html
<div class="highlight-card">
  <div class="highlight-number">10+</div>
  <div class="highlight-label">Years Experience</div>
</div>
```

### Leadership Pillar Template

```html
<div class="philosophy-card">
  <div class="philosophy-icon">
    <svg><!-- Icon SVG --></svg>
  </div>
  <h3>Pillar Title</h3>
  <p>Description of the leadership principle...</p>
</div>
```

### Skill Category Template

```html
<div class="skill-category">
  <h3>Category Name</h3>
  <div class="skill-tags">
    <span class="skill-tag">Skill 1</span>
    <span class="skill-tag">Skill 2</span>
    <span class="skill-tag">Skill 3</span>
  </div>
</div>
```

### Experience Entry Template

```html
<div class="timeline-item">
  <div class="timeline-dot active"></div> <!-- Remove 'active' for past roles -->
  <div class="timeline-content">
    <div class="timeline-header">
      <h3>Job Title</h3>
      <span class="timeline-date">2023 - Present</span>
    </div>
    <p class="timeline-company">Company Name</p>
    <p>Role description and achievements...</p>
    <ul>
      <li>Achievement 1</li>
      <li>Achievement 2</li>
    </ul>
    <div class="timeline-tech">
      <span>React</span>
      <span>Next.js</span>
    </div>
  </div>
</div>
```

### Project Card Template

```html
<div class="project-card">
  <div class="project-header">
    <h3>Project Name</h3>
    <a href="https://github.com/..." target="_blank" rel="noopener">
      <svg><!-- GitHub icon --></svg>
    </a>
  </div>
  <p class="project-description">Project description...</p>
  <div class="project-tech">
    <span>Technology 1</span>
    <span>Technology 2</span>
  </div>
</div>
```

## Blog Content

### Adding a New Blog Post

1. Create an MDX file in `src/content/blog/` with a URL-friendly slug name
2. Add required frontmatter (see schema below)
3. Write content using Markdown + optional Astro components
4. The post auto-appears on the blog listing (sorted by date, newest first)

### Blog Post Frontmatter Schema

```yaml
---
title: "Post Title in English"
description: "English description for SEO and listing page"
pubDate: 2026-02-12
author: "Vinh Nguyen"           # Optional, defaults to "Vinh Nguyen"
tags: ["AI", "Leadership"]
titleVi: "Tiêu đề tiếng Việt"  # Optional
descriptionVi: "Mô tả tiếng Việt" # Optional
---
```

### Using Components in MDX

```mdx
---
title: "My Post"
description: "Description"
pubDate: 2026-02-12
tags: ["topic"]
---
import Callout from '../../components/blog/Callout.astro';
import CodeDemo from '../../components/blog/CodeDemo.astro';

Regular markdown content here.

<Callout type="info">
  This is an informational callout box.
</Callout>

<Callout type="warning">
  This is a warning callout box.
</Callout>
```

### Available Blog Components

| Component | Usage | Props |
|-----------|-------|-------|
| `Callout` | Alert/info boxes | `type`: info, success, warning, error |
| `CodeDemo` | Interactive code demos | Varies |
| `ImageComparison` | Before/after slider | Image sources |
| `ShareButtons` | Social sharing | Auto-detects URL |
| `TableOfContents` | Auto-generated TOC | Reads headings |

### Bilingual Content in Blog Posts

Blog posts use `data-lang` attributes for bilingual content within the `BlogPostLayout`:

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

The frontmatter fields `titleVi` and `descriptionVi` are used on the blog listing page to show Vietnamese titles/descriptions.

### Current Blog Posts (13)

| Slug | Topic |
|------|-------|
| ai-2026-coworker-or-crutch | AI trends |
| ai-agent-security-warning | AI security |
| ai-not-next-abstraction-risky-role-reversal | AI abstractions |
| ai-will-not-replace-developers | AI & developers |
| battle-of-brains-open-standards-ai | Open AI standards |
| beyond-nvm-volta-future-nodejs | Node.js tooling |
| e18e-frontend-leadership-2026 | Frontend leadership |
| gsap-mcp-animation-tool | GSAP MCP Server |
| headless-architecture-distributed-teams | Headless architecture |
| mastering-react-context | React patterns |
| mcp-ai-real-world-data | MCP servers |
| pm-tech-lead-duo | PM & tech lead collaboration |
| the-tinkerers-path | Career reflections |

## Writing Guidelines

### Voice & Tone

- **Professional** but approachable
- **Technical** but accessible
- **Confident** without being arrogant
- First person ("I") for personal sections
- Active voice preferred

### Content Formatting

| Element | Usage |
|---------|-------|
| **Bold** | Key terms, emphasis |
| *Italic* | Technical terms, titles |
| `Code` | Technical terms, commands |
| Lists | Multiple related items |
| Quotes | External citations, key points |

### Blog Post Checklist

- [ ] Title is clear and descriptive
- [ ] Meta description is compelling (150-160 chars)
- [ ] Both EN and VI versions provided (if bilingual)
- [ ] Frontmatter validates against Zod schema
- [ ] Links work (internal and external)
- [ ] Images have alt text (if any)
- [ ] Tags are assigned
- [ ] Date is correct

## SEO Guidelines

### Title Formula

```
[Topic] - [Benefit/Hook] | Vinh Nguyen Blog
```

### Meta Description

- 150-160 characters
- Include primary keyword
- Include call-to-action or hook
- Unique for each page

### Heading Hierarchy

```
<h1> - Page/Post title (one per page)
  <h2> - Major sections
    <h3> - Subsections
```

## Image Guidelines

### Optimization

- WebP for photos (preferred)
- PNG for graphics with transparency
- SVG for icons and logos
- Use `loading="lazy"` for below-fold images
- Add explicit width/height to prevent layout shift
