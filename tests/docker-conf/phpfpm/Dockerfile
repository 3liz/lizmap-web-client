ARG php_version=8.1

FROM 3liz/liz-php-fpm:${php_version}

ARG php_version
ARG DEBIAN_FRONTEND=noninteractive
ENV PHP_VERSION=${php_version}


RUN set -eux; \
    apt-get update; \
    apt-get -y install inotify-tools \
    ldap-utils \
    libsqlite3-mod-spatialite \
    php${PHP_VERSION}-xdebug \
    ; apt-get clean

# Install nodejs and npm to build js files
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs

RUN set -eux; \
    mkdir -p /etc/openldap/ /etc/ssl/ldap/; \
    chmod 755 /etc/openldap/ /etc/ssl/ldap/; \
    mkdir -p /srv/sqlite_ext; \
    sed -i "/^;sqlite3.extension_dir =/c\sqlite3.extension_dir = \/srv\/sqlite_ext\/" /etc/php/${PHP_VERSION}/fpm/php.ini; \
    cp /usr/lib/x86_64-linux-gnu/mod_spatialite.so /srv/sqlite_ext/mod_spatialite.so

COPY ldap.conf /etc/openldap/ldap.conf
COPY lizmap-entrypoint.sh /bin/entrypoint.d/
COPY appctl.sh /bin/
COPY profile.start /etc/profile.d/start
COPY xdebug.ini /etc/php/${PHP_VERSION}/fpm/conf.d/90-xdebug.ini
RUN chmod 755 /bin/entrypoint.d/lizmap-entrypoint.sh /bin/appctl.sh

WORKDIR /srv/lzm/
