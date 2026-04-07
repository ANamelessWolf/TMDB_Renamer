# Architecture

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Angular 17 (module-based) |
| Frontend UI | Angular Material 17 |
| Frontend styling | SCSS with BEM naming |
| Backend runtime | Node.js 20 |
| Backend framework | Express 4 + TypeScript 5 |
| API documentation | Swagger / OpenAPI 3.0 (swagger-jsdoc + swagger-ui-express) |
| HTTP client (backend) | Axios |
| Logging | Winston |
| Containerization | Docker + Docker Compose |
| Web server (prod frontend) | Nginx |

---

## Folder Structure

```
TMDB_Renamer/
├── docs/                        ← This documentation
├── docker-compose.dev.yml       ← Dev compose (ports 3004/4204)
├── docker-compose.prod.yml      ← Prod compose (ports 3000/4200)
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts           ← Environment variable loader
│   │   │   └── swagger.ts       ← OpenAPI spec definition
│   │   ├── controllers/         ← HTTP request handlers
│   │   │   ├── files.controller.ts
│   │   │   ├── health.controller.ts
│   │   │   ├── rename.controller.ts
│   │   │   └── tmdb.controller.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts  ← Global Express error handler
│   │   │   └── requestLogger.ts ← HTTP access log per request
│   │   ├── models/
│   │   │   └── dtos/            ← TypeScript request/response interfaces
│   │   │       ├── files.dto.ts
│   │   │       ├── rename.dto.ts
│   │   │       └── tmdb.dto.ts
│   │   ├── routes/              ← Express router definitions (with Swagger JSDoc)
│   │   │   ├── index.ts
│   │   │   ├── files.routes.ts
│   │   │   ├── health.routes.ts
│   │   │   ├── rename.routes.ts
│   │   │   └── tmdb.routes.ts
│   │   ├── services/            ← Business logic (no HTTP concerns)
│   │   │   ├── files.service.ts
│   │   │   ├── rename.service.ts
│   │   │   └── tmdb.service.ts
│   │   ├── utils/               ← Pure utility functions
│   │   │   ├── fileSystem.ts    ← Read/rename files on disk
│   │   │   ├── formatter.ts     ← Filename building rules
│   │   │   ├── logger.ts        ← Winston logger instance
│   │   │   ├── titleCleaner.ts  ← Extracts show name from folder path
│   │   │   └── tmdbClient.ts    ← Axios wrapper for TMDB API
│   │   ├── app.ts               ← Express app factory
│   │   └── server.ts            ← Process entry point
│   ├── Dockerfile               ← Production image
│   ├── Dockerfile.dev           ← Development image
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── core/            ← Singleton services, models, utilities
    │   │   │   ├── models/
    │   │   │   │   ├── api.models.ts      ← API response types
    │   │   │   │   └── mapping.models.ts  ← App-level state types
    │   │   │   ├── services/
    │   │   │   │   ├── api.service.ts     ← HTTP calls to backend
    │   │   │   │   ├── mapping.service.ts ← Episode-linking algorithm
    │   │   │   │   └── storage.service.ts ← LocalStorage persistence
    │   │   │   └── utils/
    │   │   │       ├── formatter.util.ts  ← Mirrors backend formatter
    │   │   │       └── validator.util.ts  ← Windows filename validation
    │   │   ├── features/
    │   │   │   └── renamer/     ← Lazy-loaded feature module
    │   │   │       ├── pages/
    │   │   │       │   └── renamer-home/  ← Main SPA page
    │   │   │       ├── components/
    │   │   │       │   ├── file-mapping-item/   ← List card per file
    │   │   │       │   ├── episode-link-modal/  ← Episode picker dialog
    │   │   │       │   └── confirm-save-modal/  ← Save confirmation dialog
    │   │   │       └── renamer.module.ts
    │   │   ├── shared/
    │   │   │   └── components/
    │   │   │       └── top-bar/           ← Application header
    │   │   ├── app.module.ts
    │   │   └── app-routing.module.ts
    │   ├── environments/
    │   │   ├── environment.ts      ← Dev config (apiUrl)
    │   │   └── environment.prod.ts ← Prod config
    │   ├── styles/
    │   │   ├── _variables.scss     ← Design tokens (colors, spacing, etc.)
    │   │   └── styles.scss         ← Global styles + Material theme
    │   ├── index.html
    │   └── main.ts
    ├── Dockerfile
    ├── Dockerfile.dev
    ├── nginx.conf
    ├── proxy.conf.json
    ├── angular.json
    ├── package.json
    └── tsconfig.json
```

---

## Request Lifecycle

```
Browser
  │
  │  HTTP Request (e.g. POST /api/files/list)
  ▼
Express App (app.ts)
  │
  ├─ CORS middleware
  ├─ JSON body parser
  ├─ requestLogger (logs method + URL on response finish)
  │
  ▼
Router (routes/index.ts)
  │  → /api/health  → healthRouter
  │  → /api/files   → filesRouter
  │  → /api/tmdb    → tmdbRouter
  │  → /api/rename  → renameRouter
  │
  ▼
express-validator (input validation)
  │
  ▼
Controller (e.g. files.controller.ts)
  │  validates, delegates to service
  ▼
Service (e.g. files.service.ts)
  │  business logic, calls utilities
  ▼
Utility (e.g. fileSystem.ts / tmdbClient.ts)
  │  pure operations
  ▼
Controller sends res.json(result)
  │
  │  On error → next(err) → errorHandler middleware
  ▼
Browser receives JSON response
```

---

## Key Design Decisions

### Formatter is duplicated (frontend + backend)
The filename-building rules (`buildEpisodePrefix`, `truncateTitle`, `sanitizeWindowsFilename`, `buildDestinationFilename`) exist in both:
- `backend/src/utils/formatter.ts`
- `frontend/src/app/core/utils/formatter.util.ts`

This is intentional. The frontend needs to preview destinations in real time without a round-trip. The backend applies the same rules when validating/renaming. They must be kept in sync manually.

### Only `extraEpisodeNumbers` is persisted per file
The full computed mapping (which episode is auto-assigned to which file) is never saved. Only the user's manual additions are stored. The auto-assignment is always recalculated from scratch, which keeps the state minimal and deterministic. See [Mapping Algorithm](./frontend/mapping-algorithm.md) for details.

### Docker path mapping
When running inside Docker, Windows-style paths (`M:\...`) are auto-converted to the mounted Linux path (`/mnt/m/...`) by `normalizeFolderPath()` in `fileSystem.ts`. This lets users type Windows paths in the UI regardless of the backend runtime environment.
