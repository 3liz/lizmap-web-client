#!/bin/sh

if [ "$1" = "" ]; then
    echo "Error: path to the target directory is missing"
    exit 1
fi
BACKUPDIR="$1"
SCRIPTDIR=$(dirname $0)
LIZMAP=$SCRIPTDIR/..

if  [ -d $BACKUPDIR ]; then

    cp -Rp $LIZMAP/var/db $BACKUPDIR/
    cp -Rp $LIZMAP/var/config $BACKUPDIR/

    if [ -f $BACKUPDIR/config/localconfig.ini.php.dist ]; then
      rm $BACKUPDIR/config/localconfig.ini.php.dist
    fi
    if [ -f $BACKUPDIR/config/lizmapConfig.ini.php.dist ]; then
      rm $BACKUPDIR/config/lizmapConfig.ini.php.dist
    fi
    if [ -f $BACKUPDIR/config/profiles.ini.php.dist ]; then
      rm $BACKUPDIR/config/profiles.ini.php.dist
    fi

    if [ -d $LIZMAP/var/lizmap-theme-config ]; then
      cp -Rp $LIZMAP/var/lizmap-theme-config              $BACKUPDIR/
    fi
    if [ -d $LIZMAP/my-packages ]; then
      cp -Rp $LIZMAP/my-packages				$BACKUPDIR/
    fi
    if [ -d $LIZMAP/lizmap-modules ]; then
      cp -Rp $LIZMAP/lizmap-modules        		$BACKUPDIR/
    fi
else
    echo "backup directory does not exists"
    exit 1
fi
