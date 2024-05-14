#!/bin/sh

set -e
#set -x

# use deprecated variable LIZMAP_USER which was the user id
if [ ! -z "$LIZMAP_USER" ]; then
    if [ -z "$LIZMAP_USER_ID" ]; then
      LIZMAP_USER_ID="$LIZMAP_USER"
      LIZMAP_GROUP_ID="$LIZMAP_USER"
    fi
fi

LIZMAP_USER_ID=${LIZMAP_USER_ID:-1000}
LIZMAP_GROUP_ID=${LIZMAP_GROUP_ID:-1000}
LIZMAP_ADMIN_LOGIN=${LIZMAP_ADMIN_LOGIN:-admin}
LIZMAP_ADMIN_EMAIL=${LIZMAP_ADMIN_EMAIL:-root@local.localhost}

LIZMAP_USER=userphp
LIZMAP_GROUP=groupphp

CURRENT_USER_ID=$(id -u)
if [ "$CURRENT_USER_ID" == "0" ]; then

  GROUPID=$(getent group $LIZMAP_GROUP | cut -d: -f3)
  USERID=$(id -u $LIZMAP_USER)

  if [ "$LIZMAP_GROUP_ID" != "$GROUPID" ]; then
     groupmod -g $LIZMAP_GROUP_ID $LIZMAP_GROUP
  fi
  if [ "$LIZMAP_USER_ID" != "$USERID" ]; then
     usermod -u $LIZMAP_USER_ID $LIZMAP_USER
  fi
fi

export LIZMAP_USER_ID
export LIZMAP_USER
export LIZMAP_GROUP_ID
export LIZMAP_GROUP

# Define default drop-in directories
LIZMAP_CONFIG_INCLUDE=${LIZMAP_CONFIG_INCLUDE:-/www/lizmap/var/config}
export LIZMAP_LIZMAPCONFIG_INCLUDE=${LIZMAP_LIZMAPCONFIG_INCLUDE:-$LIZMAP_CONFIG_INCLUDE/lizmapconfig.d}
export LIZMAP_LOCALCONFIG_INCLUDE=${LIZMAP_LOCALCONFIG_INCLUDE:-$LIZMAP_CONFIG_INCLUDE/localconfig.d}
export LIZMAP_PROFILES_INCLUDE=${LIZMAP_PROFILES_INCLUDE:-$LIZMAP_CONFIG_INCLUDE/profiles.d}

# Root repository for projects
export LIZMAP_ROOT_REPOSITORIES=${LIZMAP_ROOT_REPOSITORIES:-/srv/projects}

# Quick module install
if [ "$1" = "lizmap-install-module" ]; then
    "$@"
    exit 0
fi

# Default redis cache configuration
export LIZMAP_CACHEREDISHOST=${LIZMAP_CACHEREDISHOST:-redis}
export LIZMAP_CACHEREDISPORT=${LIZMAP_CACHEREDISPORT:-6379}

# php ini override
if [ ! -z "$PHP_INI" ]; then
    echo -e "$PHP_INI" > $PHP_INI_DIR/conf.d/00_lizmap.ini
fi

# Copy config files to mount point
cp -aR lizmap/var/config.dist/* lizmap/var/config

# Copy configuration file in their initial states if they do no exists
[ ! -f lizmap/var/config/lizmapConfig.ini.php ] && cp lizmap/var/config/lizmapConfig.ini.php.dist lizmap/var/config/lizmapConfig.ini.php
[ ! -f lizmap/var/config/localconfig.ini.php  ] && cp lizmap/var/config/localconfig.ini.php.dist  lizmap/var/config/localconfig.ini.php
[ ! -f lizmap/var/config/profiles.ini.php     ] && cp lizmap/var/config/profiles.ini.php.dist     lizmap/var/config/profiles.ini.php

# Copy static files
# Note: static files needs to be resolved by external web server
# We have to copy them on the host
if [ -e lizmap/www ]; then
    cp -aR lizmap/www.dist/* lizmap/www/
    chown -R $LIZMAP_USER:$LIZMAP_GROUP lizmap/www
else
    mv lizmap/www.dist lizmap/www
fi

# Update localconfig and lizmapConfig
echo "Updating configuration"
update-config.php

echo "Set files rights"
# Set owner/and group
sh lizmap/install/set_rights.sh $LIZMAP_USER $LIZMAP_GROUP

echo "Launch installer"
# Set up Configuration
su -c "php lizmap/install/installer.php -v" $LIZMAP_USER

echo "Clean temp"
# Clean cache files in case we are
# Restarting the container
sh lizmap/install/clean_vartmp.sh

echo "Setup config php-fpm"
# Create link to lizmap prefix
mkdir -p $(dirname $LIZMAP_HOME)
ln -sf /www/lizmap $LIZMAP_HOME

# Override php-fpm configuration
sed -i "/^user =/c\user = ${LIZMAP_USER}"   $PHP_INI_DIR/php-fpm.d/www.conf
sed -i "/^group =/c\group = ${LIZMAP_GROUP}" $PHP_INI_DIR/php-fpm.d/www.conf
sed -i "/^listen =/c\listen = 9000" $PHP_INI_DIR/php-fpm.d/www.conf

sed -i "/^pm.max_children =/c\pm.max_children = ${PM_MAX_CHILDREN:-50}"   $PHP_INI_DIR/php-fpm.d/www.conf
sed -i "/^pm.start_servers =/c\pm.start_servers = ${PM_START_SERVERS:-5}" $PHP_INI_DIR/php-fpm.d/www.conf
sed -i "/^pm.min_spare_servers =/c\pm.min_spare_servers = ${PM_MIN_SPARE_SERVERS:-5}" $PHP_INI_DIR/php-fpm.d/www.conf
sed -i "/^pm.max_spare_servers =/c\pm.max_spare_servers = ${PM_MAX_SPARE_SERVERS:-35}" $PHP_INI_DIR/php-fpm.d/www.conf
# Add custom env variables
sed -i "/^pm =/c\pm = ${PM_CHILD_PROCESS:-dynamic}" $PHP_INI_DIR/php-fpm.d/www.conf
sed -i "/^;pm.max_requests =/c\pm.max_requests = ${PM_MAX_REQUESTS:-100}" $PHP_INI_DIR/php-fpm.d/www.conf
sed -i "/^;pm.process_idle_timeout =/c\pm.process_idle_timeout = ${PM_PROCESS_IDLE_TIMEOUT:-10s}" $PHP_INI_DIR/php-fpm.d/www.conf


# Enable status path
sed -i "/^;pm.status_path /c\pm.status_path = /status" $PHP_INI_DIR/php-fpm.d/www.conf

sed -i "/^session.cookie_httponly =/c\session.cookie_httponly = 1" $PHP_INI_DIR/php.ini

# Enable environment
sed -i "/^;clear_env =/c\clear_env = no" $PHP_INI_DIR/php-fpm.d/www.conf

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- php-fpm81 -F -O "$@"
fi

# For compatibility
if [ $1 == "php-fpm" ]; then
    shift
    set -- php-fpm81 -F -O "$@"
fi

echo "Create the account for $LIZMAP_ADMIN_LOGIN"
source=$LIZMAP_ADMIN_DEFAULT_PASSWORD_SOURCE
if [ "$source" == "" ]; then
  source="__default"
fi
if [ "$source" == "__random" ]; then
    su -c "php lizmap/scripts/script.php jcommunity~user:create -v --no-error-if-exists --admin $LIZMAP_ADMIN_LOGIN $LIZMAP_ADMIN_EMAIL" $LIZMAP_USER
elif [ "$source" == "__reset" ]; then
    su -c "php lizmap/scripts/script.php jcommunity~user:create -v --no-error-if-exists --admin --reset $LIZMAP_ADMIN_LOGIN $LIZMAP_ADMIN_EMAIL" $LIZMAP_USER
elif [ "$source" == "__default" ]; then
    su -c "php lizmap/scripts/script.php jcommunity~user:create -v --no-error-if-exists --admin --reset $LIZMAP_ADMIN_LOGIN $LIZMAP_ADMIN_EMAIL admin" $LIZMAP_USER
elif [ -f $source ]; then
    pass=$(cat $source)
    su -c "php lizmap/scripts/script.php jcommunity~user:create -v --no-error-if-exists --admin $LIZMAP_ADMIN_LOGIN $LIZMAP_ADMIN_EMAIL $pass" $LIZMAP_USER
else
    echo '[ERROR] Invalid LIZMAP_ADMIN_DEFAULT_SOURCE'
    exit 1
fi

exec "$@"
