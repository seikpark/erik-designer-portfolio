# Erik Park Designer Portfolio - Design Reference

## Purpose

This repository contains the public static portfolio site for Erik Park. It is a dependency-free HTML/CSS/JavaScript project deployed with GitHub Pages.

## Site Structure

The portfolio must not rely on one-page anchor navigation. Primary areas are separate pages:

- `index.html`: Work-first landing page and portfolio entry point.
- `pages/work.html`: Portfolio case index.
- `pages/workshop.html`: Workshops, AI hackathons, mentoring, and design education.
- `pages/about.html`: Designer biography, career proof points, skills, education, and contact.
- `pages/ai.html`: AI product strategy, multimodal UX, validation, and AI design education.

Case-study detail pages live under `cases/`:

- `cases/bero-ai.html`
- `cases/rise-partners.html`
- `cases/brickmate.html`
- `cases/butler.html`

## Navigation Rules

- Main navigation must use page links, not `#work`, `#workshop`, `#about`, or `#ai`.
- Work links from subpages must point to `pages/work.html` or `work.html` depending on relative path.
- Case-study pages must provide a clear route back to the Work index.
- The active navigation state is driven by each page's `data-page` value.

## Visual Direction

- Medium-inspired editorial layout.
- White background, dark text, light dividers, restrained accent colors.
- Content-first hierarchy with readable case-study pages.
- No fictional screenshots, awards, clients, or unsupported metrics.

## Reusable Primitives

### Language Toggle

- The language toggle appears only on Projects, project case studies, and About, directly before the Contact action in the global header.
- English is the default. The button reads `한국어` as the available action; in Korean mode it reads `EN` and uses the existing dark active surface.
- Reuse the header action geometry: 34px minimum height, pill radius, 10px inline padding, and the existing ink, surface, muted-surface, and divider tokens.
- Required states are default, hover, keyboard focus, and Korean selected (`aria-pressed="true"`). The shared focus-visible rule remains the focus treatment.
- The selected language persists locally across supported pages. Only translated nodes receive `lang="ko"`; global navigation, Contact, recommendations, and unsupported pages remain English.
- On small screens the language toggle remains visible when Contact is hidden, preserving the same 8px header-action gap.

### Recommendation Rail

- Projects and Workshop share the same Recommendations, Skills, profile links, and credit sections in the right rail.
- The first section is contextual: Projects shows featured workshops; Workshop shows featured projects.
- Workshop's featured projects are BeroAI Smart Collar and Butler, linked to their case studies.

### Story List Thumbnails

- Project and Workshop list thumbnails share the `list-story-thumb` primitive and its 3:4 aspect ratio across desktop and mobile layouts.

### Story List Typography

- Project and Workshop list titles use the shared `--story-title-weight` token at 700 in both English and Korean Pretendard.
- List titles, project tile titles, and article top-level titles use the shared `--display-title-line-height` token at 1.2 (120%) in both English and Korean.
- The same language-aware title weight applies to project tile overlays; article-detail headings keep their existing hierarchy.

## Deployment

GitHub Pages serves the site from the `main` branch root.
