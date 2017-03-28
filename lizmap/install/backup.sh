#!/bin/bash

if [ "$1" == "" ]; then
    echo "Error: target directory is missing"
fi
BACKUPDIR="$1"
SCRIPTDIR=$(dirname $0)
LIZMAP=$SCRIPTDIR/..

if  [ -d $BACKUPDIR ]; then
    if [ -f $LIZMAP/var/db/jauth.db ]; then
        cp $LIZMAP/var/db/jauth.db     $BACKUPDIR/
    else
        if [ -f $LIZMAP/var/jauth.db ]; then
            cp $LIZMAP/var/jauth.db     $BACKUPDIR/
        fi
    fi
    if [ -f $LIZMAP/var/db/logs.db ]; then
        cp $LIZMAP/var/db/logs.db      $BACKUPDIR/
    else
        if [ -f $LIZMAP/var/logs.db ]; then
            cp $LIZMAP/var/logs.db      $BACKUPDIR/
        fi
    fi
    if [ -f $LIZMAP/var/db/cacheTemplate.db ]; then
        cp $LIZMAP/var/db/cacheTemplate.db      $BACKUPDIR/
    else
        if [ -f $LIZMAP/var/cacheTemplate.db ]; then
            cp $LIZMAP/var/cacheTemplate.db      $BACKUPDIR/
        fi
    fi
    if [ -f $LIZMAP/var/config/localconfig.ini.php ]; then
        cp $LIZMAP/var/config/localconfig.ini.php       $BACKUPDIR/
    fi
    if [ -d $LIZMAP/var/lizmap-theme-config ]; then
        cp -R $LIZMAP/var/lizmap-theme-config $BACKUPDIR/
    fi
    cp $LIZMAP/var/config/lizmapConfig.ini.php $BACKUPDIR/lizmapConfig.ini.php
    cp $LIZMAP/var/config/lizmapLogConfig.ini.php $BACKUPDIR/lizmapLogConfig.ini.php
    cp $LIZMAP/var/config/installer.ini.php    $BACKUPDIR/installer.ini.php
    cp $LIZMAP/var/config/profiles.ini.php     $BACKUPDIR/profiles.ini.php
else
    echo "backup directory does not exists"
    exit 1
fi
