# TMDB Renamer — Documentation

TMDB Renamer is a web application that reads video files from a folder on the host machine, queries the TMDB API for TV episode metadata, lets the user map source files to destination names, and renames files on disk.

---

## Documentation Index

| Document | Description |
|---|---|
| [Architecture](./architecture.md) | Tech stack, folder structure, design decisions |
| [Getting Started](./getting-started.md) | Installation, configuration, running locally and with Docker |
| [Backend — Overview](./backend/overview.md) | Entry point, middleware, request lifecycle |
| [Backend — API Reference](./backend/api-reference.md) | All endpoints, request/response schemas |
| [Backend — Services](./backend/services.md) | Business logic layer |
| [Backend — Utilities](./backend/utilities.md) | Formatter, file system, TMDB client, title cleaner, logger |
| [Backend — Data Models](./backend/models.md) | DTOs and TypeScript interfaces |
| [Frontend — Overview](./frontend/overview.md) | Module structure, routing, Angular setup |
| [Frontend — Components](./frontend/components.md) | All components, inputs, outputs, templates |
| [Frontend — Services](./frontend/services.md) | ApiService, MappingService, StorageService |
| [Frontend — Mapping Algorithm](./frontend/mapping-algorithm.md) | Core episode-linking logic explained in depth |
| [Docker](./docker.md) | Container setup, volumes, environment config |

---

## Quick Summary

```
User pastes folder path
      │
      ▼
Backend reads video files + extracts show title from path
      │
      ▼
TMDB API is queried → returns seasons and episodes
      │
      ▼
Frontend auto-maps files → episodes (sequential, top-priority)
      │
      ▼
User adjusts links via modal (add/remove episode links per file)
      │
      ▼
User clicks Save → backend renames files on disk
```

---

## Port Reference

| Context | Frontend | Backend |
|---|---|---|
| Local dev | `localhost:4204` | `localhost:3004` |
| Docker dev | `localhost:4204` | `localhost:3004` |
| Docker prod | `localhost:4200` | `localhost:3000` |
