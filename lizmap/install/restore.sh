#!/bin/bash

if [ "$1" == "" ]; then
    echo "Error: backup directory is missing"
fi
BACKUPDIR="$1"
SCRIPTDIR=$(dirname $0)
LIZMAP=$SCRIPTDIR/..

if  [ -d $BACKUPDIR ]; then
    if [ -f $BACKUPDIR/jauth.db ]; then
        cp $BACKUPDIR/jauth.db $LIZMAP/var/db/jauth.db
    fi
    if [ -f $BACKUPDIR/logs.db ]; then
        cp $BACKUPDIR/logs.db $LIZMAP/var/db/logs.db
    fi
    if [ -f $BACKUPDIR/cacheTemplate.db ]; then
        cp $BACKUPDIR/cacheTemplate.db $LIZMAP/var/cacheTemplate.db
    fi
    if [ -f $BACKUPDIR/localconfig.ini.php ]; then
        cp $BACKUPDIR/localconfig.ini.php $LIZMAP/var/config/
    else
        cp $LIZMAP/var/config/localconfig.ini.php.dist $LIZMAP/var/config/localconfig.ini.php
    fi
    if [ -f $BACKUPDIR/lizmapLogConfig.ini.php ]; then
        cp $BACKUPDIR/lizmapLogConfig.ini.php $LIZMAP/var/config/
    fi
    if [ -d $BACKUPDIR/lizmap-theme-config ]; then
        cp -R $BACKUPDIR/lizmap-theme-config/* $LIZMAP/var/lizmap-theme-config/
    fi
    cp $BACKUPDIR/lizmapConfig.ini.php $LIZMAP/var/config/lizmapConfig.ini.php
    cp $BACKUPDIR/installer.ini.php    $LIZMAP/var/config/installer.ini.php
    cp $BACKUPDIR/profiles.ini.php     $LIZMAP/var/config/profiles.ini.php
else
    echo "backup directory does not exists"
    exit 1
fi
