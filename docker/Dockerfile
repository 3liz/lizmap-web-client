ARG REGISTRY_PREFIX=''
FROM ${REGISTRY_PREFIX}alpine:3.11
MAINTAINER David Marteau <david.marteau@3liz.com>
LABEL Description="Lizmap web client" Vendor="3liz.org"

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
    php7-ldap

COPY lizmap_web_client.zip .
## Install lizmap web client
RUN echo "installing lizmap from given package" \
    && unzip lizmap_web_client.zip \
    && mv lizmap_web_client /www \
    && mv /www/lizmap/var/config /www/lizmap/var/config.dist \
    && mv /www/lizmap/www /www/lizmap/www.dist

COPY factory.manifest /build.manifest
COPY lizmapConfig.ini.php.dist localconfig.ini.php.dist /www/lizmap/var/config.dist/
COPY lizmap-entrypoint.sh update-config.php /bin/
## Install healtcheck script
COPY php-fpm-healthcheck /usr/local/bin/

RUN chmod 755 /bin/lizmap-entrypoint.sh /bin/update-config.php /usr/local/bin/php-fpm-healthcheck

ENV PHP_INI_DIR /etc/php7

HEALTHCHECK --interval=60s --timeout=30s CMD php-fpm-healthcheck || exit 1

WORKDIR /www
ENTRYPOINT ["/bin/lizmap-entrypoint.sh"]
CMD ["/usr/sbin/php-fpm7", "-F", "-O"]




