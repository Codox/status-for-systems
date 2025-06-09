FROM node:20-alpine AS web
WORKDIR /app/web
COPY web/ .
RUN npm install && npm run build

FROM node:18 AS server
WORKDIR /app/server
COPY server/ .
RUN npm install && npm run build