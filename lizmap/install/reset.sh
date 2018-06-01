#!/bin/sh

if [ "$1" != "install" &&  "$1" != "reset" ]; then
    echo "Error: confirmation is missing"
    echo ""
    echo "This script resets the installation of lizmap, destroying all references to projects"
    echo "and erasing logs, rights, and users..."
    echo "Launch this script with one of these parameter:"
    echo " - 'install' to confirm the reset and to launch the installer."
    echo "    Add 'demo' as second parameter if you want to install/reset with the"
    echo "    demo activated"
    echo " - 'reset' to only confirm the reset (if you want to launch the wizard)"
    echo ""
    exit 1
fi

SCRIPTDIR=$(dirname $0)
LIZMAP=$SCRIPTDIR/..

$SCRIPTDIR/clean_vartmp.sh


if [ -f $LIZMAP/var/db/jauth.db ]; then
    rm -f $LIZMAP/var/db/jauth.db
fi
if [ -f $LIZMAP/var/db/logs.db ]; then
    rm -f $LIZMAP/var/db/logs.db
fi

if [ -f $LIZMAP/var/config/localconfig.ini.php ]; then
    rm -f $LIZMAP/var/config/localconfig.ini.php
fi
if [ -f $LIZMAP/var/config/liveconfig.ini.php ]; then
    rm -f $LIZMAP/var/config/liveconfig.ini.php
fi
if [ -f $LIZMAP/var/config/lizmapConfig.ini.php ]; then
    rm -f $LIZMAP/var/config/lizmapConfig.ini.php
fi
if [ -f $LIZMAP/var/config/installer.ini.php ]; then
    rm -f $LIZMAP/var/config/installer.ini.php
fi
if [ -f $LIZMAP/var/config/profiles.ini.php ]; then
    rm -f $LIZMAP/var/config/profiles.ini.php
fi


if [ "$1" = "install" ]; then
    cp $LIZMAP/var/config/localconfig.ini.php.dist $LIZMAP/var/config/localconfig.ini.php
    cp $LIZMAP/var/config/profiles.ini.php.dist $LIZMAP/var/config/profiles.ini.php

    if [ "$2" = "demo" ]; then
        echo "[modules]" >> $LIZMAP/var/config/localconfig.ini.php
        echo "lizmap.installparam=demo" >> $LIZMAP/var/config/localconfig.ini.php
    fi
    (cd $LIZMAP/install && php installer.php)
fi
