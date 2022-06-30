#!/bin/sh

usage()
{
    echo "$0 [options] (install|reset)"
    echo ""
    echo "This script resets the installation of lizmap, destroying all references to projects"
    echo "and erasing logs, rights, and users..."
    echo "Launch this script with one of these parameter:"
    echo " - 'reset' to reset the installation (in case you want to launch the wizard later)"
    echo " - 'install' to reset the installation and to launch the installer."
    echo "    Add '--demo' as second parameter if you want to install/reset with the"
    echo "    demo activated"
    echo ""
    echo "Options:"
    echo "   --demo         configure the demo during the 'install' action "
    echo "   --keep-config  do not erase configuration files (localconfig, profiles, lizmapConfig...)"
    echo " "
}

SCRIPTDIR=$(dirname $0)
LIZMAP=$SCRIPTDIR/..

ACTION=""
WITH_DEMO="N"
KEEP_CONFIG="N"

for i in $*
do
case $i in
    -h|--help)
    usage
    exit 0
    ;;
    --demo)
    WITH_DEMO="Y"
    ;;
    --keep-config)
    KEEP_CONFIG="Y"
    ;;
    -*)
      echo "ERROR: Unknown option: $i"
      echo ""
      usage
      exit 1
    ;;
    *)
    if [ "$ACTION" = "" ]; then
        ACTION="$i"
        if [ "$ACTION" != "install" -a "$ACTION" != "reset" ]; then
            echo "ERROR: action parameter has not an expected value"
            usage
            exit 2
        fi
    else
        if [ "$i" = "demo" ]; then
            #compatibility with previous version
            WITH_DEMO="Y"
        else
            echo "ERROR: Two many arguments"
            usage
            exit 3
        fi
    fi
    ;;
esac
done


if [ "$ACTION" = "" ]; then
    echo "ERROR: action 'install' or 'reset' is missing"
    usage
    exit 4
fi



$SCRIPTDIR/clean_vartmp.sh


if [ -f $LIZMAP/var/db/jauth.db ]; then
    rm -f $LIZMAP/var/db/jauth.db
fi

if [ -f $LIZMAP/var/db/logs.db ]; then
    rm -f $LIZMAP/var/db/logs.db
fi

if [ -f $LIZMAP/var/config/installer.ini.php ]; then
    rm -f $LIZMAP/var/config/installer.ini.php
fi

if [ "$KEEP_CONFIG" = "N" ]; then

    if [ -f $LIZMAP/var/config/CLOSED ]; then
        rm -f $LIZMAP/var/config/CLOSED
    fi

    if [ -f $LIZMAP/var/config/profiles.ini.php ]; then
        rm -f $LIZMAP/var/config/profiles.ini.php
    fi
    if [ -f $LIZMAP/var/config/liveconfig.ini.php ]; then
        rm -f $LIZMAP/var/config/liveconfig.ini.php
    fi
    if [ -f $LIZMAP/var/config/localframework.ini.php ]; then
        rm -f $LIZMAP/var/config/localframework.ini.php
    fi
    if [ -f $LIZMAP/var/config/lizmapConfig.ini.php ]; then
        rm -f $LIZMAP/var/config/lizmapConfig.ini.php
    fi
    if [ -f $LIZMAP/var/config/localconfig.ini.php ]; then
        rm -f $LIZMAP/var/config/localconfig.ini.php
    fi
    if [ -f $LIZMAP/var/config/localurls.xml ]; then
        rm -f $LIZMAP/var/config/localurls.xml
    fi
    if [ -f $LIZMAP/var/config/installer.bak.ini.php ]; then
        rm -f $LIZMAP/var/config/installer.bak.ini.php
    fi
    $SCRIPTDIR/demo.sh remove --no-installer
fi

if [ "$ACTION" = "install" ]; then
    if [ ! -f $LIZMAP/var/config/localconfig.ini.php ]; then
        cp $LIZMAP/var/config/localconfig.ini.php.dist $LIZMAP/var/config/localconfig.ini.php
    fi
    if [ ! -f $LIZMAP/var/config/profiles.ini.php ]; then
        cp $LIZMAP/var/config/profiles.ini.php.dist $LIZMAP/var/config/profiles.ini.php
    fi
    if [ ! -f $LIZMAP/var/config/lizmapConfig.ini.php ]; then
        cp $LIZMAP/var/config/lizmapConfig.ini.php.dist $APPDIR/var/config/lizmapConfig.ini.php
    fi

    if [ "$WITH_DEMO" = "Y" ]; then
        $SCRIPTDIR/demo.sh install
    else
        $SCRIPTDIR/demo.sh remove
    fi
fi
