# Backend — Overview

## Entry Points

### `src/server.ts`
Process entry point. Creates the Express app, starts the HTTP server, and registers shutdown handlers for `SIGTERM` / `SIGINT`. Also sets up global `unhandledRejection` and `uncaughtException` handlers.

```typescript
const app = createApp();
app.listen(env.port, () => { /* log startup */ });
```

### `src/app.ts`
Express app factory (`createApp()`). Registers all middleware and routes in order:

1. **CORS** — allows configured origins (`env.cors.origins`)
2. **JSON body parser** — accepts up to 10 MB
3. **requestLogger** — logs every request on `res.finish`
4. **Swagger UI** — mounted at `/api-docs`
5. **API router** — mounted at `/api`
6. **errorHandler** — must be last, catches all `next(err)` calls

---

## Configuration (`src/config/env.ts`)

Loads `.env` via `dotenv` and exports a typed `env` object used throughout the app:

```typescript
export const env = {
  port: 3004,
  nodeEnv: 'development',
  tmdb: { apiKey: '...', baseUrl: 'https://api.themoviedb.org/3' },
  cors: { origins: ['http://localhost:4204'] },
  logLevel: 'info',
}
```

A startup warning is printed if `TMDB_API_KEY` is not set.

---

## Middleware

### `src/middleware/requestLogger.ts`
Attaches a `res.on('finish')` listener to every request. Logs the method, URL, status code, and duration after the response is sent. Uses `error` level for 5xx, `warn` for 4xx, `info` for everything else.

```
2026-04-07 21:00:00 [info] GET /api/health 200 3ms
2026-04-07 21:00:10 [warn] POST /api/files/list 400 5ms
2026-04-07 21:00:20 [error] POST /api/tmdb/search 500 112ms
```

### `src/middleware/errorHandler.ts`
Global Express error handler (4-argument signature). Receives all errors passed via `next(err)`.

- **5xx errors** → logged as `error` with stack trace
- **4xx errors** → logged as `warn` with route context
- Always returns `{ error: "message" }` JSON to the client
- In `development` mode, the stack trace is also included in the response body

```typescript
// createError() helper — used in controllers and services
const err = createError('Path not found', 404);
// err.statusCode = 404, err.isOperational = true
```

---

## Routes (`src/routes/`)

All routes are mounted at `/api` by `routes/index.ts`:

| Prefix | Router file | Description |
|---|---|---|
| `/api/health` | `health.routes.ts` | Health check |
| `/api/files` | `files.routes.ts` | File listing |
| `/api/tmdb` | `tmdb.routes.ts` | TMDB search and seasons |
| `/api/rename` | `rename.routes.ts` | File rename |

Each route file includes Swagger JSDoc comments (`@openapi`) that are picked up by `swagger-jsdoc` at startup to build the OpenAPI spec.

See [API Reference](./api-reference.md) for full endpoint documentation.

---

## Layering Rules

```
Route → validates input (express-validator)
      → calls Controller
           → delegates to Service
                → calls Utilities (fileSystem, tmdbClient, formatter)
                → throws AppError on failure
           → returns DTO to Controller
      → Controller calls res.json(dto)
```

- **Routes** know about HTTP (paths, methods, validators, Swagger docs)
- **Controllers** know about `req`/`res`/`next` — nothing else
- **Services** know about business rules — no HTTP
- **Utilities** are pure functions — no HTTP, no Express, no state
