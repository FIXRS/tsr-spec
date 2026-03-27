# TSR Spec Starter

This repository is a Docusaurus-friendly starter for the **Task Surface Runtime (TSR)** specification.

It gives you a strong first-pass information architecture and draft content for a public specification site. The content is intentionally opinionated enough to anchor a standard, while still leaving room for you and your IDE agents to expand, refine, or split sections into more detailed documents.

## What is included

- `docs/intro.md` — top-level entry point for the specification
- `docs/<section>/index.md` — starter draft for each major specification section
- `docs/<section>/_category_.json` — category metadata for Docusaurus
- `sidebars.js` — a simple sidebar for the docs tree
- `docusaurus.config.ts` — minimal starter config for a docs site

## Suggested repo strategy

- Make the **spec repo public** if you want TSR to function as a real standard.
- Keep runtime and generator repos separate if you want an ecosystem rather than a single bundled implementation.
- Treat this repo as the canonical source of truth for terminology, schemas, event semantics, security requirements, and conformance.

## Quick start with Docusaurus

If you have not already initialized a Docusaurus site:

```bash
npx create-docusaurus@latest tsr-spec classic --typescript
cd tsr-spec
```

Then copy the contents of this starter into the new repo, replacing the generated `docs`, `sidebars.js`, and `docusaurus.config.ts` as needed.

Run locally:

```bash
npm install
npm run start
```

Build:

```bash
npm run build
```

## GitHub Pages notes

Docusaurus typically deploys to GitHub Pages by building the site and publishing the output to a `gh-pages` branch.

Typical setup:

1. Create a public GitHub repo, for example `tsr-spec`.
2. Set `url` and `baseUrl` in `docusaurus.config.ts`.
3. Set `organizationName` and `projectName` in `docusaurus.config.ts`.
4. Run the deploy command:

```bash
GIT_USER=<your-github-username> npm run deploy
```

GitHub Pages is simply GitHub's static website hosting. Once configured, your repo can publish a site such as:

```text
https://yourusername.github.io/tsr-spec/
```

## Recommended next moves

1. Tighten terminology and normative language.
2. Add machine-readable schemas and examples.
3. Split large sections into subpages once the structure stabilizes.
4. Add a conformance section once you have a reference runtime.
5. Keep examples realistic and tied to real task surfaces.

