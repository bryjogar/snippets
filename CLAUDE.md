# CLAUDE.md — snippets

Project rules for **Snippets**. Bryan's house rules (`~/Repos/app-template/CLAUDE.md`) apply
where this file is silent.

## Keep it as built (Bryan 2026-11-14)

Bryan likes how this app is built. Don't restructure it toward app-template's stack, layout
or scaffold, and don't "modernize" it unasked. Change only what a task asks for, in the
existing style.

## What this is

Self-hosted code snippet storage: tags, language filter, MongoDB full-text search, offline
PWA, single-user Bearer auth. Preact + Signals + esbuild client, Express + TypeScript server,
MongoDB 7. README.md has the API and layout.

## Run and test

- Port 3008 (`PORT` in `.env`). The server refuses to start without `AUTH_TOKEN` (unless
  `NODE_ENV=development`).
- `docker compose up -d --build` runs the app with a bundled MongoDB.
- `npm run dev` watches and rebuilds; `npm run build` bundles to `dist/`.
- `.github/workflows/build.yml` builds on pushes and PRs to `main`.

## Where it runs

Not deployed anywhere as of 2026-11-14. `snippets.service` is a systemd template that
expects `/opt/snippets`. If Bryan wants it running, the dev-server is the place, from
`~/Repos/snippets`; ask before deploying.

## Repo and branches

Private repo `bryjogar/snippets`, `main` only.
