# Authority Amplifier™ Build Package

This package contains two standalone React + Netlify apps:

1. `authority-amplifier-toolkit` — the 6-tool core product
2. `authority-rewriter` — the order bump rewrite tool

Both apps use a Netlify Function proxy at `/.netlify/functions/claude` so the Anthropic API key is never exposed in browser code.

## Required Netlify environment variables

Add these inside each Netlify site:

```bash
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

`ANTHROPIC_MODEL` is optional because the code defaults to `claude-sonnet-4-20250514`.

## Local development

From either app folder:

```bash
npm install
npm run dev
```

Netlify Dev will serve the Vite app and the Function together. `npm run dev` requires the Netlify CLI (`npm install -g netlify-cli`). To preview the UI alone without the Function, use `npm run vite`.

## Deployment

Recommended setup:

- Deploy `authority-amplifier-toolkit` to `amplifier.c3global.co` or `app.c3global.co`
- Deploy `authority-rewriter` to `rewriter.c3global.co`

For each Netlify project:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Notes

- Profile data for Authority Amplifier™ is stored in `localStorage`.
- No login, no database, no ChatGPT account required.
- Each tool has loading, error, clear, output, and copy-to-clipboard states.
- The API key is server-side only inside Netlify Functions.
