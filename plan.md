# Migration Plan: From `.astro` to `.mdx` for Blog Posts

## Overview
Transform the blog structure from `.astro` files to `.mdx` to leverage:
- Faster content authoring using Markdown.
- Improved compatibility for AI-generated content.
- Clear separation between content and layout logic.
- Ability to embed interactive components directly within posts.

---

## Phase 1: Preparation & Setup

### 1.1 Install MDX Integration
```bash
npx astro add mdx
```

### 1.2 Update Astro Config
- Configure Content Collections in `src/content/config.ts`.
- Establish a Zod schema for blog post validation.

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content', // For MDX files
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default('Vinh Nguyen'),
    tags: z.array(z.string()),
    // Support bilingual content
    titleVi: z.string().optional(),
    descriptionVi: z.string().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};
```

### 1.3 Folder Restructuring
```
src/
├── content/
│   └── blog/           # Move posts here
│       ├── battle-of-brains-open-standards-ai.mdx
│       ├── the-tinkerers-path.mdx
│       └── ...
├── pages/
│   └── blog/
│       ├── index.astro    # Lists all posts
│       └── [...slug].astro  # Dynamic route for single posts
└── layouts/
    └── BlogPostLayout.astro  # Layout for MDX posts
```

---

## Phase 2: Create Base Components

### 2.1 BlogPostLayout.astro
The layout wrapper for all MDX posts handles:
- SEO metadata.
- Language toggle (EN/VI).
- Consistent styling.

```astro
---
// src/layouts/BlogPostLayout.astro
interface Props {
  frontmatter: {
    title: string;
    titleVi?: string;
    description: string;
    descriptionVi?: string;
    pubDate: Date;
    tags: string[];
  };
}

const { frontmatter } = Astro.props;
---

<html lang={Astro.currentLocale || 'en'}>
  <head>
    <title>{frontmatter.title} | Blog</title>
    <meta name="description" content={frontmatter.description} />
  </head>
  <body>
    <article class="blog-post">
      <!-- Language Toggle -->
      <div class="lang-switcher">
        <button data-lang="en">EN</button>
        <button data-lang="vi">VI</button>
      </div>
      
      <!-- Content Container -->
      <div class="post-content">
        <slot />
      </div>
    </article>
  </body>
</html>
```

### 2.2 Post Components Library
Create reusable components to use inside MDX:

```
src/components/blog/
├── Callout.astro       # Highlight boxes
├── CodeDemo.astro      # Interactive code examples
├── ImageComparison.astro # Before/After sliders
├── TableOfContents.astro # Auto-generated TOC
└── ShareButtons.astro  # Social sharing
```

---

## Phase 3: Content Migration Strategy

### 3.1 Migration Template for each post

**Current (.astro):**
```astro
---
import BlogLayout from '../../layouts/BlogLayout.astro';
---

<BlogLayout title="..." description="...">
  <div data-lang="en">
    <h1>...</h1>
    <p>...</p>
  </div>
  <div data-lang="vi" hidden>
    <h1>...</h1>
    <p>...</p>
  </div>
</BlogLayout>
```

**Target (.mdx):**
```mdx
---
title: "The Battle of Brains..."
titleVi: "Cuộc Chiến Của Những Bộ Não..."
description: "AI giants want proprietary..."
descriptionVi: "Các ông lớn AI muốn..."
pubDate: 2026-02-07
tags: ["AI", "Open Standards"]
---

import { Callout } from '../../components/blog/Callout.astro';

{/* English Version */}
<div data-lang="en">

# The Battle of Brains and Nervous Systems

AI giants want proprietary ecosystems...

<Callout type="info">
  This is a key insight about the MCP protocol.
</Callout>

</div>

{/* Vietnamese Version */}
<div data-lang="vi">

# Cuộc Chiến Của Những Bộ Não Và Hệ Thần Kinh Chung

Các ông lớn AI muốn sở hữu...

</div>
```

### 3.2 Migration Script (Optional)
Write a script to automate `.astro` → `.mdx` conversion:
- Parse frontmatter metadata.
- Extract content for each language.
- Generate the final MDX structure.

---

## Phase 4: Update Routing

### 4.1 Dynamic Route for Single Posts
```astro
---
// src/pages/blog/[...slug].astro
import { getCollection } from 'astro:content';
import BlogPostLayout from '../../layouts/BlogPostLayout.astro';

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

### 4.2 Update Blog Index Page
Update `PostCard` props to fetch from the content collection:

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content';
import BlogLayout from '../../layouts/BlogLayout.astro';
import PostCard from '../../components/PostCard.astro';

const posts = await getCollection('blog');
const sortedPosts = posts.sort((a, b) => 
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
---

<BlogLayout title="Blog | ...">
  <div class="posts-list">
    {sortedPosts.map(post => (
      <PostCard
        slug={post.slug}
        titleEn={post.data.title}
        titleVi={post.data.titleVi}
        dateEn={post.data.pubDate.toLocaleDateString('en-US')}
        dateVi={post.data.pubDate.toLocaleDateString('vi-VN')}
        // ... other props
      />
    ))}
  </div>
</BlogLayout>
```

---

## Phase 5: Enhanced Features (Future)

### 5.1 AI-Generated Content Workflow
```
1. Provide outline → AI generates MDX draft.
2. AI auto-suggests components: "Should I add <Callout> here?"
3. Review → Approve → Auto-publish.
```

### 5.2 Interactive Elements in MDX
```mdx
---
title: "My Post"
---

import { CodePlayground } from '../../components/blog/CodePlayground.astro';

Here's a live demo:

<CodePlayground 
  code={`console.log("Hello MDX!")`}
  language="javascript"
  runnable={true}
/>

Or an interactive chart:

import { GrowthChart } from '../../components/blog/GrowthChart.astro';

<GrowthChart data={[10, 25, 40, 80]} client:load />
```

### 5.3 Content Analytics
- Track which sections are read the most.
- A/B test different CTAs directly within MDX.

---

## Phase 6: Migration Checklist

| Task | Priority | Status |
|------|----------|--------|
| Install MDX integration | High | ⬜ |
| Create content config schema | High | ⬜ |
| Build `BlogPostLayout.astro` | High | ⬜ |
| Create blog components library | Medium | ⬜ |
| Migrate first 2 posts (test) | High | ⬜ |
| Update blog index to use collection | High | ⬜ |
| Update RSS feed generation | Medium | ⬜ |
| Migrate remaining posts | Medium | ⬜ |
| Add search functionality | Low | ⬜ |
| Implement related posts | Low | ⬜ |

---

## Benefits After Migration

| Aspect | Before (.astro) | After (.mdx) |
|--------|-----------------|--------------|
| **AI Content Generation** | Difficult (requires Astro tags) | Native Markdown support |
| **Content Editing** | Mixed code + content | Clean separation |
| **Interactive Elements** | Limited | Full component support |
| **Team Collaboration** | Requires Astro knowledge | Anyone familiar with Markdown |
| **Content Validation** | Manual | Automatic Zod schema validation |
| **Future Extensibility** | Tight coupling | Flexible, portable architecture |

---

## Notes

- **Timing**: Migration can be incremental—migrate posts as you need to edit or update them.
- **Bilingual Strategy**: Consider using separate files (e.g., `.en.mdx`, `.vi.mdx`) or a single file with language-wrapped sections.
- **SEO**: Ensure proper redirects from old URLs or maintain the existing slug structure.
- **Backup**: Keep original `.astro` files in a backup folder before deletion.

---

## Next Actions (Immediate)

1. ⬜ Run `npx astro add mdx` on a test branch.
2. ⬜ Create `src/content/config.ts` with a basic schema.
3. ⬜ Migrate one test post (e.g., `the-tinkerers-path`).
4. ⬜ Review the result before proceeding with batch migration.