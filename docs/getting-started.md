# Getting Started

## Prerequisites

- Node.js 20+
- npm 9+
- Docker Desktop (optional, for containerized run)
- A TMDB API key — get one free at https://www.themoviedb.org/settings/api

---

## Local Development (no Docker)

This is the recommended mode for development since the backend needs access to the host file system.

### 1. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=3004
NODE_ENV=development
TMDB_API_KEY=your_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
CORS_ORIGINS=http://localhost:4204,http://localhost:4200
LOG_LEVEL=info
```

### 2. Install and Run Backend

```bash
cd backend
npm install
npm run dev
# → Listening on http://localhost:3004
# → Swagger UI at http://localhost:3004/api-docs
```

### 3. Configure Frontend

Edit `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3004/api',
};
```

### 4. Install and Run Frontend

```bash
cd frontend
npm install
npm start
# → Angular app at http://localhost:4204
```

---

## Docker — Development

> **Note:** When using Docker, the backend runs inside a Linux container. Windows drives must be mounted. The backend auto-converts Windows paths (`M:\...`) to Docker mount paths (`/mnt/m/...`).

### 1. Configure Backend `.env`

```bash
cd backend
cp .env.example .env
# Edit TMDB_API_KEY in .env
```

### 2. Add Drive Mounts

In `docker-compose.dev.yml`, add volumes for each Windows drive you need:

```yaml
volumes:
  - M:/:/mnt/m
  - D:/:/mnt/d
```

### 3. Start

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend → `http://localhost:4204`
- Backend → `http://localhost:3004`
- Swagger UI → `http://localhost:3004/api-docs`

### 4. Clean Restart

```bash
docker compose -f docker-compose.dev.yml down --volumes --remove-orphans
docker compose -f docker-compose.dev.yml up --build
```

---

## Docker — Production

```bash
docker compose -f docker-compose.prod.yml up --build
```

- Frontend → `http://localhost:4200` (served by Nginx)
- Backend → `http://localhost:3000`

> Update `frontend/src/environments/environment.prod.ts` with the real backend URL before building for production.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3004` | Port the Express server listens on |
| `NODE_ENV` | `development` | `development` or `production` |
| `TMDB_API_KEY` | *(required)* | TMDB v3 API key |
| `TMDB_BASE_URL` | `https://api.themoviedb.org/3` | TMDB API base URL |
| `CORS_ORIGINS` | `http://localhost:4204,...` | Comma-separated allowed origins |
| `LOG_LEVEL` | `info` | Winston log level (`error`, `warn`, `info`, `debug`) |

### Frontend (`src/environments/environment.ts`)

| Property | Description |
|---|---|
| `apiUrl` | Full URL to the backend API (e.g. `http://localhost:3004/api`) |
| `production` | Boolean, controls Angular production mode |

---

## Swagger UI

Once the backend is running, open:

```
http://localhost:3004/api-docs
```

All endpoints are documented with request/response schemas and example values.

Raw OpenAPI JSON is available at:

```
http://localhost:3004/api-docs.json
```
