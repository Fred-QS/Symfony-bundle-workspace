ARG NODE_VERSION=18.18.2
FROM node:${NODE_VERSION} AS page_builder_nodejs

# Set custom yarn configuration
COPY --chmod=777 docker/nodejs/.yarnrc /.yarnrc

ENV BABEL_CACHE_PATH /home/node/.cache/babel

WORKDIR /srv/page_builder
