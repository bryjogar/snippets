# Snippets

Self-hosted code snippet storage with tagging, language filtering, and full-text search. A Preact + Express + MongoDB PWA that follows the shared toolkit conventions (see [`TOOLKIT.md`](../TOOLKIT.md)).

## Features

- **Full-text search** — MongoDB text index across title, content, and tags
- **Tags** — filter by tag, tag autocomplete from the `/-/tags` endpoint
- **Language filtering** — filter by language (python, bash, powershell, …)
- **CRUD** — create, edit, and delete snippets with syntax-preserving plain-text content
- **Offline-first PWA** — service worker with network-first caching
- **Single-user auth** — Bearer token via `AUTH_TOKEN` (shared toolkit pattern)

## Quick Start

```bash
# Prerequisite: shared MongoDB 7 instance (see repo README)
docker run -d --name mongodb --restart unless-stopped \
  -p 127.0.0.1:27017:27017 -v mongo_data:/data/db mongo:7

# Start snippets
cp .env.example .env     # set AUTH_TOKEN to anything long/random
docker compose up -d --build
```

The app listens on **http://localhost:3008**. Set `AUTH_TOKEN` in `.env`; the
web UI asks for the same token on first load.

## Configuration

| Env | Default | Purpose |
|-----|---------|---------|
| `PORT` | `3008` | HTTP port (also set in `docker-compose.yml`) |
| `AUTH_TOKEN` | *(required)* | Bearer token guarding all `/api/*` routes |
| `MONGO_URL` | `mongodb://127.0.0.1:27017` | Shared MongoDB instance |
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
client/            # Preact app (app.tsx, router, store, views/)
server/            # Express API (routes/snippets.ts, auth, db)
scripts/           # copy-assets.sh (static asset copy)
snippets.service   # systemd unit template
Dockerfile / docker-compose.yml
```
