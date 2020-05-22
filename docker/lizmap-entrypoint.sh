#!/bin/sh

set -e
set -x

LIZMAP_USER=${LIZMAP_USER:-9001}

# php ini override
if [ ! -z $PHP_INI ]; then
    echo -e "$PHP_INI" > $PHP_INI_DIR/conf.d/lizmap-php-0.ini
fi

# lizmapConfig.ini.php.dist

# Copy config files to mount point
cp -aR lizmap/var/config.dist/* lizmap/var/config
[ ! -f lizmap/var/config/lizmapConfig.ini.php ] && cp lizmap/var/config/lizmapConfig.ini.php.dist lizmap/var/config/lizmapConfig.ini.php
[ ! -f lizmap/var/config/localconfig.ini.php  ] && cp lizmap/var/config/localconfig.ini.php.dist  lizmap/var/config/localconfig.ini.php
[ ! -f lizmap/var/config/profiles.ini.php     ] && cp lizmap/var/config/profiles.ini.php.dist     lizmap/var/config/profiles.ini.php


# Copy static files
# Note: static files needs to be resolved by external web server
# We have to copy them on the host
if [ -e lizmap/www ]; then
    cp -aR lizmap/www.dist/* lizmap/www/
    chown -R $LIZMAP_USER:$LIZMAP_USER lizmap/www
else
    mv lizmap/www.dist lizmap/www
fi

# Update localconfig and lizmapConfig
update-config.php

# Set up Configuration  
php lizmap/install/installer.php

# Set owner/and group
sh lizmap/install/set_rights.sh $LIZMAP_USER $LIZMAP_USER

# Clean cache files in case we are 
# Restarting the container
sh lizmap/install/clean_vartmp.sh

# Create link to lizmap prefix
mkdir -p $(dirname $LIZMAP_HOME)
ln -sf /www/lizmap $LIZMAP_HOME

# Override php-fpm configuration
sed -i "/^user =/c\user = ${LIZMAP_USER}"   /etc/php7/php-fpm.d/www.conf
sed -i "/^group =/c\group = ${LIZMAP_USER}" /etc/php7/php-fpm.d/www.conf
sed -i "/^listen =/c\listen = 9000" /etc/php7/php-fpm.d/www.conf

sed -i "/^pm.max_children =/c\pm.max_children = ${PM_MAX_CHILDREN:-50}"   /etc/php7/php-fpm.d/www.conf
sed -i "/^pm.start_servers =/c\pm.start_servers = ${PM_START_SERVERS:-5}" /etc/php7/php-fpm.d/www.conf
sed -i "/^pm.min_spare_servers =/c\pm.min_spare_servers = ${PM_MIN_SPARE_SERVERS:-5}" /etc/php7/php-fpm.d/www.conf
sed -i "/^pm.max_spare_servers =/c\pm.max_spare_servers = ${PM_MAX_SPARE_SERVERS:-35}" /etc/php7/php-fpm.d/www.conf
# Add custom env variables
sed -i "/^pm =/c\pm = ${PM_CHILD_PROCESS:-dynamic}" /etc/php7/php-fpm.d/www.conf
sed -i "/^;pm.max_requests =/c\pm.max_requests = ${PM_MAX_REQUESTS:-100}" /etc/php7/php-fpm.d/www.conf
sed -i "/^;pm.process_idle_timeout =/c\pm.process_idle_timeout = ${PM_PROCESS_IDLE_TIMEOUT:-10s}" /etc/php7/php-fpm.d/www.conf


# Enable status path
sed -i "/^;pm.status_path /c\pm.status_path = /status" /etc/php7/php-fpm.d/www.conf

sed -i "/^session.cookie_httponly =/c\session.cookie_httponly = 1" /etc/php7/php.ini

# Enable environment
sed -i "/^;clear_env =/c\clear_env = no" /etc/php7/php-fpm.d/www.conf

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- php-fpm7 -F -O "$@"
fi

# For compatibility
if [ $1 == "php-fpm" ]; then
    shift
    set -- php-fpm7 -F -O "$@"
fi

exec "$@"

