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
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4-mini
RESEND_API_KEY=your_resend_api_key
NOTIFICATION_FROM_EMAIL="Outsiders <notifications@yourdomain.com>"
```

Run the SQL in `supabase-schema.sql` from the Supabase SQL editor to create the `profiles`, `groups`, and `hangouts` tables used by signup availability, shared crew invites, anonymous debrief cases, hangout scheduling, and the crew bill-watch roster. If your database is already set up, re-run the file after pull/update so the personalized crew-invite migration and `find_group_by_join_code` RPC are added too.

## Hangout Assistant

The Create Hangout screen includes a Hangout Assistant that compares saved participant availability and recommends the best times for the group. It runs locally in the app with deterministic scheduling logic, so no external AI API key is required.

## Outsiders AI

Outsiders now also supports a separate bona fide assistant that works across the whole app. It does not replace the existing Hangout Assistant. Instead:

- the existing Hangout Assistant still owns availability overlap and timing recommendations
- the new Outsiders AI helps with brainstorming, proposal writing, trip planning, debrief wording, review writing, summaries, and next-step suggestions using the live app context

The real AI assistant uses the OpenAI Responses API through `api/assistant.js`, so `OPENAI_API_KEY` must be set in the server environment. The default model is `gpt-5.4-mini`, which is a good fit for fast, cost-sensitive assistant workloads.

If you are testing locally, note that the assistant route lives in `api/assistant.js`. Plain `vite dev` serves the frontend only, so use a server environment that runs Vercel functions locally or deploy the app with `OPENAI_API_KEY` configured.

## Notification Email

Notification emails use `api/send-email.js` and Resend. Set `RESEND_API_KEY` and `NOTIFICATION_FROM_EMAIL` in your server environment before testing. Like the assistant route, this is a Vercel function, so plain `vite dev` will not serve it by itself.
