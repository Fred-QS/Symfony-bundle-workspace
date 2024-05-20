ARG NGINX_VERSION=1.21.5

FROM nginx:${NGINX_VERSION}-alpine AS symfony-test-nginx

COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/

WORKDIR /srv/symfony
