# Snippets

Self-hosted code snippet storage with tagging, language filtering, and full-text search. A lightweight Preact + Express + MongoDB PWA.

## Features

- **Full-text search** — MongoDB text index across title, content, and tags
- **Tags** — filter by tag and discover existing tags via the `/-/tags` endpoint
- **Language filtering** — filter snippets by language (python, bash, powershell, etc.)
- **CRUD** — create, view, edit, and delete snippets with syntax-preserving plain-text content
- **Offline-first PWA** — service worker with network-first caching and web app manifest
- **Single-user auth** — Bearer token authentication guarding API routes via `AUTH_TOKEN`

## Quick Start

```bash
# 1. Copy sample environment file and set AUTH_TOKEN
cp .env.example .env     # set AUTH_TOKEN to a secure secret

# 2. Build and start services (includes bundled MongoDB 7)
docker compose up -d --build
```

The app listens on **http://localhost:3008**. Set `AUTH_TOKEN` in `.env`; the web UI asks for the same token on first load.

The server refuses to start without AUTH_TOKEN (unless NODE_ENV=development).

## Configuration

| Env | Default | Purpose |
|-----|---------|---------|
| `PORT` | `3008` | HTTP port (also mapped in `docker-compose.yml`) |
| `AUTH_TOKEN` | *(required)* | Bearer token guarding all `/api/*` routes |
| `MONGO_URL` | `mongodb://mongo:27017` | MongoDB connection URL (bundled service by default, or point to external instance) |
| `MONGO_DB` | `snippets` | Database name |

## Development

```bash
npm install
npm run dev        # esbuild watch for server + client
npm run build      # production bundle → dist/
npm start          # serve dist/server.js
```

## Layout

```
client/            # Preact frontend (app.tsx, router, store, views/)
server/            # Express backend API (routes/snippets.ts, auth, db)
scripts/           # copy-assets.sh (static asset build helper)
snippets.service   # systemd unit template for host deployment
Dockerfile         # Multi-stage container build
docker-compose.yml # Container service definitions (app + MongoDB)
```

## License

MIT

