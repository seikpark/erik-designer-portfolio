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

## Deployment

GitHub Pages serves the site from the `main` branch root.
