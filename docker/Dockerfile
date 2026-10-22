ARG REGISTRY_PREFIX=''
FROM ${REGISTRY_PREFIX}alpine:3.24 AS build

COPY lizmap_web_client.zip .
RUN unzip lizmap_web_client.zip

FROM alpine:3.24
LABEL org.opencontainers.image.authors="David Marteau <david.marteau@3liz.com>"
LABEL Description="Lizmap web client" Vendor="3liz.org" Version="23.02.0"

RUN apk update && apk upgrade && \
    apk --no-cache add git fcgi \
    icu-data-full \
    php85 \
    php85-ctype \
    php85-curl \
    php85-dom \
    php85-exif \
    php85-fileinfo \
    php85-fpm \
    php85-gd \
    php85-gettext \
    php85-iconv \
    php85-intl \
    php85-json \
    php85-ldap \
    php85-mbstring \
    php85-openssl \
    php85-pdo \
    php85-pdo_sqlite \
    php85-pdo_pgsql \
    php85-pgsql \
    php85-phar \
    php85-redis \
    php85-session \
    php85-simplexml \
    php85-sqlite3 \
    php85-tokenizer \
    php85-xml \
    php85-xmlreader \
    php85-xmlwriter \
    php85-zip \
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

ENV PHP_INI_DIR=/etc/php85

HEALTHCHECK \
    --interval=30s \
    --timeout=30s \
    --start-interval=2s \
    --start-period=10s \
    CMD php-fpm-healthcheck || exit 1

WORKDIR /www
ENTRYPOINT ["/bin/lizmap-entrypoint.sh"]
CMD ["/usr/sbin/php-fpm85", "-F", "-O"]
