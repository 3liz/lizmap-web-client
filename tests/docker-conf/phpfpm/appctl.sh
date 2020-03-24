#!/bin/bash
ROOTDIR="/srv/lzm"
APPDIR="$ROOTDIR/lizmap"
APP_USER=usertest
APP_GROUP=grouptest

COMMAND="$1"

if [ "$COMMAND" == "" ]; then
    echo "Error: command is missing"
    exit 1;
fi


function cleanTmp() {
    if [ ! -d $APPDIR/var/log ]; then
        mkdir $APPDIR/var/log
        chown $APP_USER:$APP_GROUP $APPDIR/var/log
    fi

    if [ ! -d $ROOTDIR/temp/lizmap ]; then
        mkdir $ROOTDIR/temp/lizmap
        chown $APP_USER:$APP_GROUP $ROOTDIR/temp
    else
        rm -rf $ROOTDIR/temp/lizmap/*
    fi
    touch $ROOTDIR/temp/lizmap/.empty
    chown $APP_USER:$APP_GROUP $ROOTDIR/temp/lizmap/.empty
}


function resetApp() {
    if [ -f $APPDIR/var/config/CLOSED ]; then
        rm -f $APPDIR/var/config/CLOSED
    fi

    if [ ! -d $APPDIR/var/log ]; then
        mkdir $APPDIR/var/log
        chown $APP_USER:$APP_GROUP $APPDIR/var/log
    fi

    echo "parametre resetApp: $1"

    if [ "$1" == "sqlite" ]; then
      cp $ROOTDIR/tests/docker-conf/phpfpm/profiles-sqlite.ini.php $APPDIR/var/config/profiles.ini.php
    else
      cp $ROOTDIR/tests/docker-conf/phpfpm/profiles.ini.php $APPDIR/var/config/profiles.ini.php
    fi

    cp $ROOTDIR/tests/docker-conf/phpfpm/localconfig.ini.php $APPDIR/var/config/localconfig.ini.php
    cp $ROOTDIR/tests/docker-conf/phpfpm/lizmapConfig.ini.php $APPDIR/var/config/lizmapConfig.ini.php

    chown -R $APP_USER:$APP_GROUP $APPDIR/var/config/profiles.ini.php $APPDIR/var/config/localconfig.ini.php $APPDIR/var/config/lizmapConfig.ini.php

    if [ -f $APPDIR/var/config/installer.ini.php ]; then
        rm -f $APPDIR/var/config/installer.ini.php
    fi
    if [ -f $APPDIR/var/config/liveconfig.ini.php ]; then
        rm -f $APPDIR/var/config/liveconfig.ini.php
    fi
    rm -rf $APPDIR/var/log/*
    rm -rf $APPDIR/var/db/*
    rm -rf $APPDIR/var/mails/*
    rm -rf $APPDIR/var/uploads/*
    touch $APPDIR/var/log/.empty && chown $APP_USER:$APP_GROUP $APPDIR/var/log/.empty
    touch $APPDIR/var/db/.empty && chown $APP_USER:$APP_GROUP $APPDIR/var/db/.empty
    touch $APPDIR/var/mails/.empty && chown $APP_USER:$APP_GROUP $APPDIR/var/mails/.empty
    touch $APPDIR/var/uploads/.empty && chown $APP_USER:$APP_GROUP $APPDIR/var/uploads/.empty

    php /srv/lzm/tests/docker-conf/phpfpm/resetpgsql.php

    cleanTmp
    setRights
    launchInstaller
}


function launchInstaller() {
    php /srv/lzm/tests/docker-conf/phpfpm/initpgsql.php
    su $APP_USER -c "php $APPDIR/install/installer.php"
}

function setRights() {
    USER="$1"
    GROUP="$2"

    if [ "$USER" = "" ]; then
        USER="$APP_USER"
    fi

    if [ "$GROUP" = "" ]; then
        GROUP="$APP_GROUP"
    fi

    DIRS="$APPDIR/var/config $APPDIR/var/db $APPDIR/var/log $APPDIR/var/mails $ROOTDIR/temp/lizmap"

    chown -R $USER:$GROUP $DIRS
    chmod -R ug+w $DIRS
    chmod -R o-w $DIRS
}

function composerInstall() {
    if [ -f $APPDIR/composer.lock ]; then
        rm -f $APPDIR/composer.lock
    fi
    composer install --prefer-dist --no-progress --no-ansi --no-interaction --working-dir=$APPDIR
    chown -R $APP_USER:$APP_GROUP $APPDIR/vendor $APPDIR/composer.lock

    if [ -f $ROOTDIR/tests/composer.lock ]; then
        rm -f $ROOTDIR/tests/composer.lock
    fi
    composer install --prefer-dist --no-progress --no-ansi --no-interaction --working-dir=$ROOTDIR/tests/units/
    chown -R $APP_USER:$APP_GROUP $ROOTDIR/tests/units/vendor $ROOTDIR/tests/units/composer.lock

    if [ -f $APPDIR/my-packages/composer.json ]; then
      if [ -f $APPDIR/my-packages/composer.lock ]; then
          rm -f $APPDIR/my-packages/composer.lock
      fi
      composer install --prefer-dist --no-progress --no-ansi --no-interaction --working-dir=$APPDIR/my-packages/
      chown -R $APP_USER:$APP_GROUP $APPDIR/my-packages/vendor $APPDIR/my-packages/composer.lock
    fi

}

function composerUpdate() {
    composer update --prefer-dist --no-progress --no-ansi --no-interaction --working-dir=$APPDIR
    chown -R $APP_USER:$APP_GROUP $APPDIR/vendor $APPDIR/composer.lock

    composer update --prefer-dist --no-progress --no-ansi --no-interaction --working-dir=$ROOTDIR/tests/units/
    chown -R $APP_USER:$APP_GROUP $ROOTDIR/tests/units/vendor $ROOTDIR/tests/units/composer.lock

    if [ -f $APPDIR/my-packages/composer.json ]; then
      composer update --prefer-dist --no-progress --no-ansi --no-interaction --working-dir=$APPDIR/my-packages/
      chown -R $APP_USER:$APP_GROUP $APPDIR/my-packages/vendor $APPDIR/my-packages/composer.lock
    fi
}

function launch() {
    if [ ! -f $APPDIR/var/config/profiles.ini.php ]; then
        cp $ROOTDIR/tests/docker-conf/phpfpm/profiles.ini.php $APPDIR/var/config/profiles.ini.php
    fi
    if [ ! -f $APPDIR/var/config/localconfig.ini.php ]; then
        cp $ROOTDIR/tests/docker-conf/phpfpm/localconfig.ini.php $APPDIR/var/config/localconfig.ini.php
    fi
    if [ ! -f $APPDIR/var/config/lizmapConfig.ini.php ]; then
        cp $ROOTDIR/tests/docker-conf/phpfpm/lizmapConfig.ini.php $APPDIR/var/config/lizmapConfig.ini.php
    fi

    chown -R $APP_USER:$APP_GROUP $APPDIR/var/config/profiles.ini.php $APPDIR/var/config/localconfig.ini.php $APPDIR/var/config/lizmapConfig.ini.php

    if [ ! -d $APPDIR/vendor ]; then
      composerInstall
    fi

    launchInstaller
    setRights
    cleanTmp
}

function launchUnitTests() {
    su $APP_USER -c "cd $ROOTDIR/tests/units/ && vendor/bin/phpunit"
}


case $COMMAND in
    clean_tmp)
        cleanTmp;;
    reset)
        resetApp pgsql;;
    reset-sqlite)
        resetApp sqlite;;
    launch)
        launch;;
    install)
        launchInstaller;;
    rights)
        setRights;;
    composer_install)
        composerInstall;;
    composer_update)
        composerUpdate;;
    unittests)
        launchUnitTests;;
    *)
        echo "app-ctl.sh: wrong command"
        exit 2
        ;;
esac

