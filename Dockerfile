## ---- Frontend build stage ----
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

## ---- Backend deps stage ----
FROM node:20-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev

## ---- Final runtime image ----
FROM node:20-alpine
WORKDIR /app

# Backend code
COPY backend/ ./backend/
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules

# Frontend dist -> backend public
RUN mkdir -p ./backend/src/public
COPY --from=frontend-build /app/frontend/dist ./backend/src/public

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "backend/src/server.js"]

