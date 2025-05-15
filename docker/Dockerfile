ARG REGISTRY_PREFIX=''
FROM ${REGISTRY_PREFIX}alpine:3.21 AS build

COPY lizmap_web_client.zip .
RUN unzip lizmap_web_client.zip

FROM alpine:3.21
LABEL org.opencontainers.image.authors="David Marteau <david.marteau@3liz.com>"
LABEL Description="Lizmap web client" Vendor="3liz.org" Version="23.02.0"

RUN apk update && apk upgrade && \
    apk --no-cache add git fcgi \
    icu-data-full \
    php82 \
    php82-ctype \
    php82-curl \
    php82-dom \
    php82-exif \
    php82-fileinfo \
    php82-fpm \
    php82-gd \
    php82-gettext \
    php82-iconv \
    php82-intl \
    php82-json \
    php82-ldap \
    php82-mbstring \
    php82-opcache \
    php82-openssl \
    php82-pdo \
    php82-pdo_sqlite \
    php82-pdo_pgsql \
    php82-pgsql \
    php82-phar \
    php82-redis \
    php82-session \
    php82-simplexml \
    php82-sqlite3 \
    php82-tokenizer \
    php82-xml \
    php82-xmlreader \
    php82-xmlwriter \
    php82-zip \
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

ENV PHP_INI_DIR=/etc/php82

HEALTHCHECK --interval=60s --timeout=30s CMD php-fpm-healthcheck || exit 1

WORKDIR /www
ENTRYPOINT ["/bin/lizmap-entrypoint.sh"]
CMD ["/usr/sbin/php-fpm81", "-F", "-O"]
