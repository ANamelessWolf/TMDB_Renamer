# ── Production Dockerfile ──────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

# ── Nginx stage ────────────────────────────────────────
FROM nginx:1.25-alpine AS runtime

COPY --from=builder /app/dist/tmdb-renamer-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
