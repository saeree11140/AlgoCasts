# Build from repository root: docker build -f web/Dockerfile -t algocasts-web .
# Both stages start from plain Alpine: the official node and nginx images ship extra
# tooling (bundled npm, optional nginx modules) that carries known CVEs.
FROM alpine:3.24.4 AS build
RUN apk upgrade --no-cache && apk add --no-cache nodejs pnpm
WORKDIR /app/web
COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY web/ ./
COPY exercises/ /app/exercises/
COPY completed_exercises/ /app/completed_exercises/
COPY competency/ /app/competency/
COPY diagrams/ /app/diagrams/
COPY chocolatestype/ /app/chocolatestype/
RUN pnpm run check

FROM alpine:3.24.4 AS production
RUN apk upgrade --no-cache && apk add --no-cache nginx \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log
COPY web/deploy/nginx-main.conf /etc/nginx/nginx.conf
COPY web/deploy/nginx.conf /etc/nginx/http.d/default.conf
COPY --from=build /app/web/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
STOPSIGNAL SIGQUIT
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
