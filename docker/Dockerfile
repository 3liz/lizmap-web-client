ARG REGISTRY_PREFIX=''
FROM ${REGISTRY_PREFIX}alpine:3.16 as build

COPY lizmap_web_client.zip .
RUN unzip lizmap_web_client.zip

FROM ${REGISTRY_PREFIX}alpine:3.16
MAINTAINER David Marteau <david.marteau@3liz.com>
LABEL Description="Lizmap web client" Vendor="3liz.org" Version="22.06.0"

RUN apk update && apk upgrade && \
    apk --no-cache add git fcgi php8 \
    php8-ctype \
    php8-curl \
    php8-dom \
    php8-exif \
    php8-fileinfo \
    php8-fpm \
    php8-gd \
    php8-gettext \
    php8-iconv \
    php8-intl \
    php8-json \
    php8-ldap \
    php8-mbstring \
    php8-opcache \
    php8-openssl \
    php8-pdo \
    php8-pdo_sqlite \
    php8-pdo_pgsql \
    php8-pgsql \
    php8-phar \
    php8-redis \
    php8-session \
    php8-simplexml \
    php8-sqlite3 \
    php8-tokenizer \
    php8-xml \
    php8-xmlreader \
    php8-xmlwriter \
    php8-zip \
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

ENV PHP_INI_DIR /etc/php8

HEALTHCHECK --interval=60s --timeout=30s CMD php-fpm-healthcheck || exit 1

WORKDIR /www
ENTRYPOINT ["/bin/lizmap-entrypoint.sh"]
CMD ["/usr/sbin/php-fpm8", "-F", "-O"]
