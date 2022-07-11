ARG REGISTRY_PREFIX=''
FROM ${REGISTRY_PREFIX}alpine:3.14 as build

COPY lizmap_web_client.zip .
RUN unzip lizmap_web_client.zip

FROM ${REGISTRY_PREFIX}alpine:3.14
MAINTAINER David Marteau <david.marteau@3liz.com>
LABEL Description="Lizmap web client" Vendor="3liz.org" Version="22.07.0"

RUN apk update && apk upgrade
RUN apk --no-cache add git fcgi php7 php7-fpm \
    php7-tokenizer \
    php7-opcache \
    php7-session \
    php7-iconv \
    php7-intl \
    php7-mbstring \
    php7-openssl \
    php7-fileinfo \
    php7-curl \
    php7-json \
    php7-redis \
    php7-pgsql \
    php7-sqlite3 \
    php7-gd \
    php7-dom \
    php7-xml \
    php7-xmlrpc \
    php7-xmlreader \
    php7-xmlwriter \
    php7-simplexml \
    php7-phar \
    php7-gettext \
    php7-ctype \
    php7-zip \
    php7-ldap \
    composer 

COPY --from=build /lizmap_web_client /www
## Rename original config files so that they wont be overriden at startup
## Backup lizmap/my-packages/composer.json.dist so it may be reinstalled
## in mounted volume
RUN mv /www/lizmap/var/config /www/lizmap/var/config.dist \
 && mv /www/lizmap/www /www/lizmap/www.dist \
 && mv /www/lizmap/my-packages/composer.json.dist /my-packages.composer.json.dist
 

COPY factory.manifest /build.manifest
COPY lizmap-entrypoint.sh update-config.php /bin/
COPY scripts/* /usr/local/bin/

## Install healtcheck script
COPY php-fpm-healthcheck /usr/local/bin/

RUN chmod 755 /bin/lizmap-entrypoint.sh /bin/update-config.php /usr/local/bin/php-fpm-healthcheck

ENV PHP_INI_DIR /etc/php7

HEALTHCHECK --interval=60s --timeout=30s CMD php-fpm-healthcheck || exit 1

WORKDIR /www
ENTRYPOINT ["/bin/lizmap-entrypoint.sh"]
CMD ["/usr/sbin/php-fpm7", "-F", "-O"]




