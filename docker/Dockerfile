ARG REGISTRY_PREFIX=''
FROM ${REGISTRY_PREFIX}alpine:3.22 AS build

COPY lizmap_web_client.zip .
RUN unzip lizmap_web_client.zip

FROM alpine:3.22
LABEL org.opencontainers.image.authors="David Marteau <david.marteau@3liz.com>"
LABEL Description="Lizmap web client" Vendor="3liz.org" Version="23.02.0"

RUN apk update && apk upgrade && \
    apk --no-cache add git fcgi \
    icu-data-full \
    php83 \
    php83-ctype \
    php83-curl \
    php83-dom \
    php83-exif \
    php83-fileinfo \
    php83-fpm \
    php83-gd \
    php83-gettext \
    php83-iconv \
    php83-intl \
    php83-json \
    php83-ldap \
    php83-mbstring \
    php83-opcache \
    php83-openssl \
    php83-pdo \
    php83-pdo_sqlite \
    php83-pdo_pgsql \
    php83-pgsql \
    php83-phar \
    php83-redis \
    php83-session \
    php83-simplexml \
    php83-sqlite3 \
    php83-tokenizer \
    php83-xml \
    php83-xmlreader \
    php83-xmlwriter \
    php83-zip \
    composer \
    shadow

COPY --from=build /lizmap_web_client /www
## Rename original config files so that they wont be overriden at startup
## Backup lizmap/my-packages/composer.json.dist so it may be reinstalled
## in mounted volume
RUN mv /www/lizmap/var/config /www/lizmap/var/config.dist \
 && mv /www/lizmap/www /www/lizmap/www.dist \
 && mv /www/lizmap/my-packages/composer.json.dist /my-packages.composer.json.dist

RUN addgroup -g 1000 groupphp; \
    adduser -u 1000 -H -G groupphp -D userphp ;

COPY factory.manifest /build.manifest
COPY lizmap-entrypoint.sh update-config.php /bin/
COPY scripts/* /usr/local/bin/

## Install healtcheck script
COPY php-fpm-healthcheck /usr/local/bin/

RUN chmod 755 /bin/lizmap-entrypoint.sh /bin/update-config.php /usr/local/bin/php-fpm-healthcheck

ENV PHP_INI_DIR=/etc/php83

HEALTHCHECK \
    --interval=30s \
    --timeout=30s \
    --start-interval=2s \
    --start-period=10s \
    CMD php-fpm-healthcheck || exit 1

WORKDIR /www
ENTRYPOINT ["/bin/lizmap-entrypoint.sh"]
CMD ["/usr/sbin/php-fpm83", "-F", "-O"]
