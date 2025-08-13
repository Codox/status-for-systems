# API Builder
FROM node:20-alpine AS api-builder

WORKDIR /app/api

COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Flutter Builder
FROM ubuntu:22.04 AS flutter-builder

RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    xz-utils \
    zip \
    libglu1-mesa \
    && rm -rf /var/lib/apt/lists/*

ENV FLUTTER_HOME="/opt/flutter"
ENV PATH="$FLUTTER_HOME/bin:$PATH"

RUN git clone https://github.com/flutter/flutter.git $FLUTTER_HOME
RUN cd $FLUTTER_HOME && git checkout stable
RUN flutter doctor --android-licenses || true
RUN flutter config --enable-web

WORKDIR /app/web
COPY web/ ./
RUN flutter pub get
RUN flutter build web --release

# Production Image
FROM nginx:alpine

RUN apk add --no-cache nodejs npm supervisor

WORKDIR /app

COPY --from=api-builder /app/api/dist ./api/dist
COPY --from=api-builder /app/api/package*.json ./api/

WORKDIR /app/api
RUN npm ci --only=production

COPY --from=flutter-builder /app/web/build/web /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN mkdir -p /var/log/supervisor

EXPOSE 80

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]