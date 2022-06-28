FROM debian:bullseye-slim

ARG composer_version=2.3.7
ARG lizmap_user_id
ARG lizmap_group_id

ENV LIZMAP_USER_ID=${lizmap_user_id}
ENV LIZMAP_GROUP_ID=${lizmap_group_id}
ENV PHP_VERSION=8.1

RUN set -eux; \
	apt-get update; \
    apt-get -y install apt-transport-https lsb-release ca-certificates curl wget git unzip inotify-tools; \
    wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg; \
    sh -c 'echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list'; \
    apt-get  update;

RUN apt-get -y install \
    php${PHP_VERSION}-cli \
    php${PHP_VERSION}-curl \
    php${PHP_VERSION}-fpm \
    php${PHP_VERSION}-gd \
    php${PHP_VERSION}-intl \
    php${PHP_VERSION}-ldap \
    php${PHP_VERSION}-mbstring \
    php${PHP_VERSION}-pgsql \
    php${PHP_VERSION}-sqlite3 \
    php${PHP_VERSION}-xml \
    php${PHP_VERSION}-zip \
    php${PHP_VERSION}-redis \
    ldap-utils \
    libsqlite3-mod-spatialite \
    ; apt-get clean

# Install Composer
RUN wget -O /bin/composer https://getcomposer.org/download/$composer_version/composer.phar \
    && chmod +x /bin/composer && /bin/composer self-update

# Install nodejs and npm to build js files
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs

RUN set -eux; \
    sed -i "/^display_errors =/c\display_errors = On" /etc/php/${PHP_VERSION}/fpm/php.ini; \
    addgroup --gid $LIZMAP_GROUP_ID grouptest; \
    useradd --uid $LIZMAP_USER_ID --gid $LIZMAP_GROUP_ID usertest ; \
    mkdir -p /etc/openldap/ /etc/ssl/ldap/; \
    chmod 755 /etc/openldap/ /etc/ssl/ldap/; \
    ln -s /usr/sbin/php-fpm${PHP_VERSION} /usr/sbin/php-fpm; \
    mkdir -p /run/php/ /srv/sqlite_ext; \
    sed -i "/^;sqlite3.extension_dir =/c\sqlite3.extension_dir = \/srv\/sqlite_ext\/" /etc/php/${PHP_VERSION}/fpm/php.ini; \
    cp /usr/lib/x86_64-linux-gnu/mod_spatialite.so /srv/sqlite_ext/mod_spatialite.so

COPY ldap.conf /etc/openldap/ldap.conf
COPY www.conf /etc/php/$PHP_VERSION/fpm/pool.d/www.conf
COPY entrypoint.sh /bin/
COPY appctl.sh /bin/
COPY profile.start /etc/profile.d/start
RUN chmod 755 /bin/entrypoint.sh /bin/appctl.sh

WORKDIR /srv/lzm/
ENTRYPOINT ["/bin/entrypoint.sh"]
CMD ["/usr/sbin/php-fpm", "-F", "-O"]
