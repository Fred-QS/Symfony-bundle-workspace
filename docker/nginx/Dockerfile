ARG NGINX_VERSION=1.21.5

FROM nginx:${NGINX_VERSION}-alpine AS page_builder_nginx

COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/

WORKDIR /srv/page_builder
