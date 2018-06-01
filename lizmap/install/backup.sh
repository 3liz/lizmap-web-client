#!/bin/sh

if [ "$1" = "" ]; then
    echo "Error: path to the target directory is missing"
    exit 1
fi
BACKUPDIR="$1"
SCRIPTDIR=$(dirname $0)
LIZMAP=$SCRIPTDIR/..

if  [ -d $BACKUPDIR ]; then
    if [ -f $LIZMAP/var/db/jauth.db ]; then
        cp -p $LIZMAP/var/db/jauth.db           $BACKUPDIR/
    else
        if [ -f $LIZMAP/var/jauth.db ]; then
            cp -p $LIZMAP/var/jauth.db              $BACKUPDIR/
        fi
    fi
    if [ -f $LIZMAP/var/db/logs.db ]; then
        cp -p $LIZMAP/var/db/logs.db            $BACKUPDIR/
    else
        if [ -f $LIZMAP/var/logs.db ]; then
            cp -p $LIZMAP/var/logs.db               $BACKUPDIR/
        fi
    fi
    if [ -f $LIZMAP/var/db/cacheTemplate.db ]; then
        cp -p $LIZMAP/var/db/cacheTemplate.db   $BACKUPDIR/
    else
        if [ -f $LIZMAP/var/cacheTemplate.db ]; then
            cp -p $LIZMAP/var/cacheTemplate.db      $BACKUPDIR/
        fi
    fi
    if [ -f $LIZMAP/var/config/localconfig.ini.php ]; then
        cp -p $LIZMAP/var/config/localconfig.ini.php    $BACKUPDIR/
    fi
    if [ -f $LIZMAP/var/config/liveconfig.ini.php ]; then
        cp -p $LIZMAP/var/config/liveconfig.ini.php    $BACKUPDIR/
    fi
    if [ -f $LIZMAP/var/config/authldap.coord.ini.php ]; then
        cp -p $LIZMAP/var/config/authldap.coord.ini.php $BACKUPDIR/
        cp -p $LIZMAP/var/config/mainconfig.ini.php     $BACKUPDIR/
        cp -Rp $LIZMAP/var/config/admin                 $BACKUPDIR/
        cp -Rp $LIZMAP/var/config/index                 $BACKUPDIR/
    fi
    if [ -d $LIZMAP/var/lizmap-theme-config ]; then
    cp -Rp $LIZMAP/var/lizmap-theme-config              $BACKUPDIR/
    fi
    cp -p $LIZMAP/var/config/lizmapConfig.ini.php       $BACKUPDIR/
    cp -p $LIZMAP/var/config/lizmapLogConfig.ini.php    $BACKUPDIR/
    cp -p $LIZMAP/var/config/installer.ini.php          $BACKUPDIR/
    cp -p $LIZMAP/var/config/profiles.ini.php           $BACKUPDIR/
else
    echo "backup directory does not exists"
    exit 1
fi
