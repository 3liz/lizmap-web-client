#!/bin/sh

if [ "$1" = "" ]; then
    echo "Error: path to backup directory is missing"
    exit 1
fi
BACKUPDIR="$1"
SCRIPTDIR=$(dirname $0)
LIZMAP=$SCRIPTDIR/..

if  [ -d $BACKUPDIR ]; then
  if  [ ! -d $BACKUPDIR/db ]; then
    # lizmap <=3.5 backups
    if [ -f $BACKUPDIR/jauth.db -o -f $BACKUPDIR/logs.db ]; then
        cp -Rp $BACKUPDIR/*.db $LIZMAP/var/db/
    fi
  else
    cp -Rp $BACKUPDIR/db $LIZMAP/var/
  fi

  if  [ ! -d $BACKUPDIR/config ]; then
    # lizmap <=3.5 backups
    if [ -f $BACKUPDIR/installer.ini.php ]; then
      cp -Rp $BACKUPDIR/*.ini.php $LIZMAP/var/config/
    fi
  else
    cp -Rp $BACKUPDIR/config $LIZMAP/var/
  fi

  if [ -d $BACKUPDIR/lizmap-theme-config ]; then
      cp -Rp $BACKUPDIR/lizmap-theme-config       $LIZMAP/var/
  fi

  if [ -d $BACKUPDIR/my-packages ]; then
      cp -Rp $BACKUPDIR/my-packages       $LIZMAP/
  fi
  if [ -d $BACKUPDIR/lizmap-modules ]; then
      cp -Rp $BACKUPDIR/lizmap-modules       $LIZMAP/
  fi

  if [ ! -f $LIZMAP/var/config/localconfig.ini.php ]; then
      cp -p $LIZMAP/var/config/localconfig.ini.php.dist   $LIZMAP/var/config/localconfig.ini.php
  fi

else
    echo "backup directory does not exists"
    exit 1
fi
