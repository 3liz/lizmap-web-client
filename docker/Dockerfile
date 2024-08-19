ARG REGISTRY_PREFIX=''
FROM ${REGISTRY_PREFIX}alpine:3.17 as build

COPY lizmap_web_client.zip .
RUN unzip lizmap_web_client.zip

FROM alpine:3.17
LABEL org.opencontainers.image.authors="David Marteau <david.marteau@3liz.com>"
LABEL Description="Lizmap web client" Vendor="3liz.org" Version="23.02.0"

RUN apk update && apk upgrade && \
    apk --no-cache add git fcgi \
    icu-data-full \
    php81 \
    php81-ctype \
    php81-curl \
    php81-dom \
    php81-exif \
    php81-fileinfo \
    php81-fpm \
    php81-gd \
    php81-gettext \
    php81-iconv \
    php81-intl \
    php81-json \
    php81-ldap \
    php81-mbstring \
    php81-opcache \
    php81-openssl \
    php81-pdo \
    php81-pdo_sqlite \
    php81-pdo_pgsql \
    php81-pgsql \
    php81-phar \
    php81-redis \
    php81-session \
    php81-simplexml \
    php81-sqlite3 \
    php81-tokenizer \
    php81-xml \
    php81-xmlreader \
    php81-xmlwriter \
    php81-zip \
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

ENV PHP_INI_DIR=/etc/php81

HEALTHCHECK --interval=60s --timeout=30s CMD php-fpm-healthcheck || exit 1

WORKDIR /www
ENTRYPOINT ["/bin/lizmap-entrypoint.sh"]
CMD ["/usr/sbin/php-fpm81", "-F", "-O"]
