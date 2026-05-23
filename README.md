# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Outsiders

## Supabase

Create a local `.env` file with your Supabase project credentials:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SITE_URL=https://outsiders-alpha.vercel.app
```

Run the SQL in `supabase-schema.sql` from the Supabase SQL editor to create the `profiles` and `groups` tables used by signup, shared crew invites, anonymous debrief cases, and the crew bill-watch roster.

## AI Copilot

The app now includes a site-wide `Outsiders AI` panel that appears on every screen.

- It uses the OpenAI Responses API.
- It automatically sends the current screen name plus shared `appData` as context.
- It is designed for copywriting, product ideas, summaries, planning help, and friendlier UX suggestions across the whole app.

### Local setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_OPENAI_MODEL` if you want a model other than `gpt-5-mini`.
3. Either paste an OpenAI API key into the in-app AI panel or set `VITE_OPENAI_API_KEY` for local testing.

### Important note

This implementation calls OpenAI directly from the browser, which is okay for local prototyping but not for production. For a real deployment, move the OpenAI request into your own backend or serverless function so the API key stays private.
