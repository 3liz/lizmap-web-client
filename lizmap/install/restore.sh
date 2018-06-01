#!/bin/sh

if [ "$1" = "" ]; then
    echo "Error: path to backup directory is missing"
    exit 1
fi
BACKUPDIR="$1"
SCRIPTDIR=$(dirname $0)
LIZMAP=$SCRIPTDIR/..

if  [ -d $BACKUPDIR ]; then
    if [ -f $BACKUPDIR/jauth.db ]; then
        cp -p $BACKUPDIR/jauth.db                   $LIZMAP/var/db/jauth.db
    fi
    if [ -f $BACKUPDIR/logs.db ]; then
        cp -p $BACKUPDIR/logs.db                    $LIZMAP/var/db/logs.db
    fi
    if [ -f $BACKUPDIR/cacheTemplate.db ]; then
        cp -p $BACKUPDIR/cacheTemplate.db           $LIZMAP/var/cacheTemplate.db
    fi
    if [ -f $BACKUPDIR/localconfig.ini.php ]; then
        cp -p $BACKUPDIR/localconfig.ini.php        $LIZMAP/var/config/
    else
        cp -p $LIZMAP/var/config/localconfig.ini.php.dist   $LIZMAP/var/config/localconfig.ini.php
    fi
    if [ -f $BACKUPDIR/liveconfig.ini.php ]; then
        cp -p $BACKUPDIR/liveconfig.ini.php        $LIZMAP/var/config/
    fi
    if [ -f $BACKUPDIR/lizmapLogConfig.ini.php ]; then
        cp -p $BACKUPDIR/lizmapLogConfig.ini.php    $LIZMAP/var/config/lizmapLogConfig.ini.php
    fi
    if [ -f $BACKUPDIR/authldap.coord.ini.php ]; then
        cp -p $BACKUPDIR/authldap.coord.ini.php     $LIZMAP/var/config/authldap.coord.ini.php
        cp -p $BACKUPDIR/mainconfig.ini.php         $LIZMAP/var/config/mainconfig.ini.php
        cp -p $BACKUPDIR/admin/config.ini.php       $LIZMAP/var/config/admin/config.ini.php
        cp -p $BACKUPDIR/index/config.ini.php       $LIZMAP/var/config/index/config.ini.php
    fi 
    if [ -d $BACKUPDIR/lizmap-theme-config ]; then
        cp -Rp $BACKUPDIR/lizmap-theme-config       $LIZMAP/var/
    fi
    cp -p $BACKUPDIR/lizmapConfig.ini.php           $LIZMAP/var/config/lizmapConfig.ini.php
    cp -p $BACKUPDIR/installer.ini.php              $LIZMAP/var/config/installer.ini.php
    cp -p $BACKUPDIR/profiles.ini.php               $LIZMAP/var/config/profiles.ini.php
else
    echo "backup directory does not exists"
    exit 1
fi
