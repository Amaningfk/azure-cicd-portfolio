# Static site image: nginx running as a non-root user, serving site/ on port 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine

LABEL org.opencontainers.image.title="azure-cicd-portfolio" \
      org.opencontainers.image.description="Static portfolio site served by an unprivileged nginx" \
      org.opencontainers.image.licenses="MIT"

# The base image ships a default server block; ours replaces it.
COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/

USER 101

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
