# Post Input Format

This document defines the local article package format for Anemone's Blog.
Use this format when asking an AI tool to generate posts that can be imported by the local post admin.

## Package Layout

One article is one folder:

```text
my-post-slug/
├── post.md
└── assets/
    ├── cover.png
    ├── diagram-1.png
    └── demo.zip
```

`assets/` is optional. If present, it may contain images, downloads, or nested folders.

## Required `post.md`

`post.md` must start with YAML front-matter:

```markdown
---
title: "Article Title"
slug: "my-post-slug"
date: "2026-07-01 20:30:00"
categories:
  - Frontend
tags:
  - React
  - Hexo
excerpt: "Optional short summary"
---

Article body in Markdown.

![Cover](assets/cover.png)
[Download demo](assets/demo.zip)
```

## Required Fields

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `title` | Yes | string | The visible post title. |
| `slug` | Yes | string | Lowercase letters, numbers, and hyphens only. Used as the output filename. |
| `date` | Yes | string | Recommended format: `YYYY-MM-DD HH:mm:ss`. |
| `categories` | Yes | list | At least one category. |
| `tags` | Yes | list | At least one tag. |
| `excerpt` | No | string | Optional summary. |

## Slug Rules

Use only:

```text
a-z
0-9
-
```

Good:

```text
react-state-management
hexo-post-admin
ai-notes-2026
```

Bad:

```text
React State Management
hexo_post_admin
中文标题
post.md
```

## Asset References

Inside `post.md`, reference package assets with relative `assets/...` paths:

```markdown
![Architecture](assets/architecture.png)
[Download source](assets/source.zip)
```

During import, the tool rewrites paths:

```markdown
![Architecture](/images/posts/my-post-slug/architecture.png)
[Download source](/files/posts/my-post-slug/source.zip)
```

Image extensions are routed to `source/images/posts/<slug>/`.
Other file extensions are routed to `source/files/posts/<slug>/`.

Supported image extensions:

```text
.apng .avif .gif .ico .jpeg .jpg .png .svg .webp
```

## Batch Import

For multiple articles, place many article folders under one parent folder:

```text
incoming/
├── post-a/
│   ├── post.md
│   └── assets/
└── post-b/
    ├── post.md
    └── assets/
```

Then run:

```bash
npm run post:import -- ./incoming
```

## Commands

Import one package:

```bash
npm run post:import -- ./incoming/my-post-slug
```

Import many packages:

```bash
npm run post:import -- ./incoming
```

Overwrite an existing post:

```bash
npm run post:import -- ./incoming/my-post-slug --force
```

List current posts:

```bash
npm run post:list
```

Preview a delete operation:

```bash
npm run post:delete -- my-post-slug
```

Move a post and its assets to trash:

```bash
npm run post:delete -- my-post-slug --yes
```

Start the local web admin:

```bash
npm run post:admin
```

Open:

```text
http://127.0.0.1:4100/
```

## Output Locations

Imported article:

```text
source/_posts/<slug>.md
```

Imported images:

```text
source/images/posts/<slug>/
```

Imported files:

```text
source/files/posts/<slug>/
```

Deleted posts are moved to:

```text
.trash/posts/<slug>-<timestamp>/
```
