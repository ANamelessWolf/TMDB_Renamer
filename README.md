# TMDB Renamer

TMDB Renamer is a web app for renaming TV episode files using data from The Movie Database (TMDB).

The app:
- Reads video files from a folder on your machine
- Looks up show, season, and episode metadata from TMDB
- Lets you review or adjust the file-to-episode mapping
- Renames the files on disk

## Stack

- Frontend: Angular 17 + Angular Material
- Backend: Node.js + Express + TypeScript
- Docs/API: Swagger OpenAPI
- Optional runtime: Docker + Docker Compose

## Project Structure

```text
TMDB_Renamer/
├── frontend/   Angular application
├── backend/    Express API
├── docs/       Project documentation
├── docker-compose.dev.yml
└── docker-compose.prod.yml
```

## Local Development

### Requirements

- Node.js 20+
- npm 9+
- TMDB API key

### 1. Configure the backend

```powershell
cd backend
Copy-Item .env.example .env
```

Set your TMDB API key in `backend/.env`.

### 2. Run the backend

```powershell
cd backend
npm install
npm run dev
```

Backend URLs:
- API: `http://localhost:3004/api`
- Swagger UI: `http://localhost:3004/api-docs`

### 3. Run the frontend

Make sure `frontend/src/environments/environment.ts` points to the backend API:

```ts
apiUrl: 'http://localhost:3004/api'
```

Then start the frontend:

```powershell
cd frontend
npm install
npm start
```

Frontend URL:
- App: `http://localhost:4204`

## Docker

Development:

```powershell
docker compose -f docker-compose.dev.yml up --build
```

Production:

```powershell
docker compose -f docker-compose.prod.yml up --build
```

Default ports:
- Docker dev: frontend `4204`, backend `3004`
- Docker prod: frontend `4200`, backend `3000`

## Documentation

More details are available in the docs folder:

- [docs/index.md](/z:/dev/node/TMDB_Renamer/docs/index.md)
- [docs/getting-started.md](/z:/dev/node/TMDB_Renamer/docs/getting-started.md)
- [docs/architecture.md](/z:/dev/node/TMDB_Renamer/docs/architecture.md)
- [docs/backend/overview.md](/z:/dev/node/TMDB_Renamer/docs/backend/overview.md)
