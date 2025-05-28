#!/bin/bash
ROOTDIR="/srv/lzm"
APPDIR="$ROOTDIR/lizmap"
APP_USER=userphp
APP_GROUP=groupphp

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

    $APPDIR/install/reset.sh reset

    if [ ! -d $APPDIR/var/log ]; then
        mkdir $APPDIR/var/log
        chown $APP_USER:$APP_GROUP $APPDIR/var/log
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

    launch "$1"
}


function launchConfigure() {
    su $APP_USER -c "php $APPDIR/install/configurator.php"
}


function launchInstaller() {
    php /srv/lzm/tests/docker-conf/phpfpm/initpgsql.php
    su $APP_USER -c "php $APPDIR/install/installer.php -v"
}

function launchScript() {
    su $APP_USER -c "php $APPDIR/scripts/script.php $*"
}

function launchConsole() {
    su $APP_USER -c "php $APPDIR/console.php $*"
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

function composerRun() {
    composer --working-dir=$ROOTDIR/tests/units/ run $*
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

function setupAdmin() {
    source=$LIZMAP_ADMIN_DEFAULT_PASSWORD_SOURCE
    if [ "$source" == "" ]; then
       echo '[ERROR] LIZMAP_ADMIN_DEFAULT_SOURCE is empty'
       return 1
    fi
    if [ "$source" == "__random" ]; then
        su $APP_USER -c "php $APPDIR/scripts/script.php jcommunity~user:create -v --admin --no-error-if-exists $LIZMAP_ADMIN_LOGIN $LIZMAP_ADMIN_EMAIL"
    elif [ "$source" == "__reset" ]; then
        su $APP_USER -c "php $APPDIR/scripts/script.php jcommunity~user:create -v --admin --no-error-if-exists --reset $LIZMAP_ADMIN_LOGIN $LIZMAP_ADMIN_EMAIL"
    elif [ -f $source ]; then
        pass=$(cat $source)
        su $APP_USER -c "php $APPDIR/scripts/script.php jcommunity~user:create -v --admin --no-error-if-exists $LIZMAP_ADMIN_LOGIN $LIZMAP_ADMIN_EMAIL $pass"
    else
        echo '[ERROR] Invalid LIZMAP_ADMIN_DEFAULT_SOURCE'
        return 1
    fi
}

function launch() {
    if [ ! -f $APPDIR/var/config/profiles.ini.php ]; then
       if [ "$1" == "sqlite" ]; then
         cp $ROOTDIR/tests/docker-conf/phpfpm/profiles-sqlite.ini.php $APPDIR/var/config/profiles.ini.php
       else
         cp $ROOTDIR/tests/docker-conf/phpfpm/profiles.ini.php $APPDIR/var/config/profiles.ini.php
       fi
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

    if [ ! -d "$ROOTDIR/node_modules/" ]; then
      (
        cd "$ROOTDIR/";
        su $APP_USER -c "npm install"
      )
    fi

    cd "$ROOTDIR/";
    if [[ -z "${CYPRESS_CI}" ]]; then
      (
        su $APP_USER -c "npm run build"
      )
    else
      (
        su $APP_USER -c "npm run watch"
      )
    fi

    if [ ! -d $APPDIR/lizmap-modules/lizmapdemo ]; then
        su $APP_USER -c "$APPDIR/install/demo.sh install --no-installer"
    fi

    launchInstaller
    setRights
    cleanTmp
    setupAdmin
}

function launchUnitTests() {
    su $APP_USER -c "cd $ROOTDIR/tests/units/ && vendor/bin/phpunit"
}

function launchPhpStan() {
    su $APP_USER -c "cd $ROOTDIR/ && tests/units/vendor/bin/phpstan analyze"
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
    configure)
        launchConfigure;;
    install)
        launchInstaller;;
    script)
        launchScript ${*:2};;
    console)
        launchConsole ${*:2};;
    rights)
        setRights;;
    composer_install)
        composerInstall;;
    composer_run)
        composerRun ${*:2};;
    composer_update)
        composerUpdate;;
    unittests)
        launchUnitTests;;
    phpstan)
        launchPhpStan;;
    *)
        echo "app-ctl.sh: wrong command"
        exit 2
        ;;
esac
