# Content Guide

## Portfolio Sections (index.html)

### Section Overview

| Section | Line Range | Purpose |
|---------|------------|---------|
| Header | ~855-900 | Hero with profile image and intro |
| Navigation | ~900-920 | Sticky nav links |
| Highlights | ~920-980 | 4 metric cards |
| Leadership | ~980-1050 | 4 philosophy pillars |
| Skills | ~1050-1150 | 8 skill categories |
| Experience | ~1150-1280 | Timeline with 4 positions |
| Projects | ~1280-1380 | 5 side project cards |
| About | ~1380-1420 | Personal narrative |
| Contact | ~1420-1460 | CTA with social links |
| Footer | ~1460-1470 | Copyright |

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

### Blog Index (blog/index.html)

```html
<div class="posts-list">
  <article class="post-card">
    <a href="posts/post-slug.html" class="post-link">
      <h2 data-lang="en">Post Title in English</h2>
      <h2 data-lang="vi" hidden>Tiêu đề tiếng Việt</h2>
      <p class="post-meta">
        <time datetime="2026-02-02">February 2, 2026</time>
        <span class="post-category">Category</span>
      </p>
      <p data-lang="en" class="post-excerpt">English excerpt...</p>
      <p data-lang="vi" hidden class="post-excerpt">Vietnamese excerpt...</p>
    </a>
  </article>
</div>
```

### Blog Post Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SEO Meta Tags -->
  <title>Post Title | Vinh Nguyen Blog</title>
  <meta name="description" content="Post description...">

  <!-- Open Graph -->
  <meta property="og:title" content="Post Title">
  <meta property="og:description" content="Post description...">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://vinhnguyenba.dev/blog/posts/...">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Post Title">

  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Post Title",
    "datePublished": "2026-02-02",
    "author": {
      "@type": "Person",
      "name": "Vinh Nguyen"
    }
  }
  </script>

  <link rel="stylesheet" href="../css/blog.css">
</head>
<body>
  <header class="blog-header">
    <a href="../index.html" class="logo">Vinh's Blog</a>
    <div class="language-switcher">
      <button class="lang-btn active" data-lang="en">EN</button>
      <button class="lang-btn" data-lang="vi">VI</button>
    </div>
  </header>

  <main class="blog-main">
    <article class="blog-post">
      <a href="../index.html" class="back-link">&larr; Back to posts</a>

      <header class="post-header">
        <h1 data-lang="en">English Title</h1>
        <h1 data-lang="vi" hidden>Vietnamese Title</h1>
        <div class="post-meta">
          <time datetime="2026-02-02">February 2, 2026</time>
          <span class="category-tag">Category</span>
        </div>
      </header>

      <!-- English Content -->
      <div data-lang="en" class="post-content">
        <p>Introduction paragraph...</p>

        <h2>Section Heading</h2>
        <p>Section content...</p>

        <blockquote>
          <p>Notable quote or callout...</p>
        </blockquote>

        <div class="highlight-box">
          <p><strong>Key Point:</strong> Important information...</p>
        </div>
      </div>

      <!-- Vietnamese Content -->
      <div data-lang="vi" hidden class="post-content">
        <p>Đoạn giới thiệu...</p>
        <!-- Mirror structure of English content -->
      </div>
    </article>
  </main>

  <footer class="blog-footer">
    <p>&copy; 2026 Vinh Nguyen</p>
  </footer>

  <script src="../js/i18n.js"></script>
</body>
</html>
```

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
- [ ] Both EN and VI versions complete
- [ ] Structured data is accurate
- [ ] Links work (internal and external)
- [ ] Images have alt text (if any)
- [ ] Category is assigned
- [ ] Date is correct

## SEO Guidelines

### Title Formula

```
[Topic] - [Benefit/Hook] | Vinh Nguyen Blog
```

Example: "AI Won't Replace Developers - Empty Encouragement or Truth? | Vinh Nguyen Blog"

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
      <h4> - (rarely needed)
```

## Image Guidelines

### File Naming

```
descriptive-name-width.extension
# Example: team-collaboration-800.jpg
```

### Dimensions

| Usage | Size |
|-------|------|
| Profile | 180x180px |
| Blog featured | 1200x630px (OG image) |
| Inline images | Max 800px width |

### Optimization

- JPEG for photos (80% quality)
- PNG for graphics with transparency
- SVG for icons and logos
- Use `loading="lazy"` for below-fold images
