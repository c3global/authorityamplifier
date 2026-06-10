# Authority Amplifier™

A single hosted React + Netlify app containing both products:

1. **Authority Amplifier™ Toolkit** — the 6-tool core product (Confidence Translator, Meeting Prep Assistant, Recovery Coach, Mini-Frameworks, Elevator Pitch Builder, Authority Audit)
2. **Authority Rewriter™** — the premium add-on (order bump), shown in the sidebar as a gated tier unlocked with an access code

The app calls the Anthropic API through a Netlify Function proxy at `/.netlify/functions/claude`, so the API key is never exposed in browser code.

## Required Netlify environment variables

```bash
ANTHROPIC_API_KEY=your_key_here          # required
ANTHROPIC_MODEL=claude-sonnet-4-20250514 # optional — this is the default
REWRITER_ACCESS_CODE=your_chosen_code    # optional — gates the Authority Rewriter™
```

### How the Rewriter gate works

- If `REWRITER_ACCESS_CODE` is set, the Authority Rewriter™ appears locked (🔒) in the sidebar until the user enters that code. Deliver the code in the GHL purchase email for the order bump.
- If `REWRITER_ACCESS_CODE` is **not** set, any code unlocks it (effectively open). Codes are compared case-insensitively.
- Once unlocked, the unlock is remembered in the user's browser (`localStorage`).

## Local development

```bash
npm install
npm run dev
```

Netlify Dev will serve the Vite app and the Function together. `npm run dev` requires the Netlify CLI (`npm install -g netlify-cli`). To preview the UI alone without the Function, use `npm run vite`.

## Deployment

Deploy to Netlify at `app.c3global.co` or `amplifier.c3global.co`:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Notes

- User profile is stored in `localStorage`. No login, no database, no ChatGPT account required.
- Every tool personalizes its system prompt with the user's name, role, industry, native language, and communication challenge.
- Each tool has loading, error, clear, output, and copy-to-clipboard states.
- The Rewriter returns five style panels (Executive, Diplomatic, Direct, Persuasive, Culturally Intelligent) plus a Coaching Note, each with its own copy button.
