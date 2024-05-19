ARG PHP_VERSION=8.3
ARG COMPOSER_VERSION=2.7.2

FROM composer:${COMPOSER_VERSION} AS composer
FROM php:${PHP_VERSION}-fpm AS page_builder_php

ENV PANTHER_NO_SANDBOX 1
ENV PANTHER_CHROME_ARGUMENTS='--disable-dev-shm-usage'

RUN apt-get update \
    && apt-get install -y --no-install-recommends supervisor chromium chromium-driver \
    && rm -rf /var/lib/apt/lists/*

RUN apt update && apt install -y \
        zlib1g-dev \
        g++ git libicu-dev zip libzip-dev \
    	libfreetype6-dev \
    	libjpeg62-turbo-dev \
    	libpng-dev \
        libglib2.0-0 \
        libnss3 \
    && docker-php-ext-configure zip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && pecl install apcu \
    && docker-php-ext-enable apcu \
    && docker-php-ext-install -j$(nproc) \
        intl \
        opcache \
        pdo \
        pdo_mysql \
        zip \
	    gd

RUN rm -rf /etc/localtime && ln -s /usr/share/zoneinfo/Europe/Paris /etc/localtime

# Copy the PHP-FPM configuration file
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
# Copy Supervisor configuration file
COPY docker/supervisor/supervisor.conf /etc/supervisor/conf.d/supervisor.conf

COPY --from=composer /usr/bin/composer /usr/bin/composer
COPY docker/php/php.ini /usr/local/etc/php/php.ini
COPY docker/php/php-cli.ini /usr/local/etc/php/php-cli.ini

# https://getcomposer.org/doc/03-cli.md#composer-allow-superuser
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_MEMORY_LIMIT=-1
ENV PATH="${PATH}:/root/.composer/vendor/bin"

WORKDIR /srv/page_builder
