#!/bin/bash

if [ "$1" == "" ]; then
    echo "Error: target directory is missing"
fi
BACKUPDIR="$1"
SCRIPTDIR=$(dirname $0)
LIZMAP=$SCRIPTDIR/..

if  [ -d $BACKUPDIR ]; then
    if [ -f $LIZMAP/var/jauth.db ]; then
        cp $LIZMAP/var/jauth.db     $BACKUPDIR/
    fi
    if [ -f $LIZMAP/var/logs.db ]; then
        cp $LIZMAP/var/logs.db      $BACKUPDIR/
    fi
    if [ -f $LIZMAP/var/cacheTemplate.db ]; then
        cp $LIZMAP/var/cacheTemplate.db      $BACKUPDIR/
    fi
    cp $LIZMAP/var/config/lizmapConfig.ini.php $BACKUPDIR/lizmapConfig.ini.php
    cp $LIZMAP/var/config/lizmapLogConfig.ini.php $BACKUPDIR/lizmapLogConfig.ini.php
    cp $LIZMAP/var/config/installer.ini.php    $BACKUPDIR/installer.ini.php
    cp $LIZMAP/var/config/profiles.ini.php     $BACKUPDIR/profiles.ini.php
else
    echo "backup directory does not exists"
    exit 1
fi
