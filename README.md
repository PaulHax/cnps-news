# CNPS Marin Newsletter Builder

A client-side newsletter builder for the [CNPS Marin](https://www.cnps.org/marin) chapter. Paste articles from Word, email, or Google Docs, auto-clean the formatting, attach and resize images, arrange everything, and copy out clean HTML for Luminate (Blackbaud CMS).

**Live site:** [cnps-news.netlify.app](https://cnps-news.netlify.app)

## Features

- **Paste cleaning** — strips Word/Docs/email formatting, keeps only semantic HTML (bold, italic, links, lists)
- **Image handling** — drag-and-drop or file picker, auto-resize via Canvas API, per-image width/alignment/alt text controls
- **Live preview** — see the assembled newsletter as you edit
- **HTML output** — toggle to view raw HTML, copy articles-only or full newsletter to clipboard
- **Editable CSS** — customize newsletter styles directly in the editor
- **Multiple newsletters** — save, load, switch, and delete newsletters by name
- **Persistence** — auto-saves to localStorage (text) and IndexedDB (images)
- **Drag-and-drop reorder** — rearrange articles with native HTML5 drag-and-drop

## Development

No build step. Single external dependency: [DOMPurify](https://github.com/cure53/DOMPurify) loaded from CDN.

```bash
npx serve .
```

### Tests

```bash
npm test
```

Runs [Playwright](https://playwright.dev/) end-to-end tests against a local server.

## Deployment

Static site hosted on Netlify. Deploys automatically on push to `main`.
