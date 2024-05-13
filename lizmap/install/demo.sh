#!/bin/bash

ACTION="$1"

usage()
{
    echo "$0 (install|remove)"
    echo ""
    echo "This script install or remove the demo module"
    echo ""
}

if [ "$ACTION" == "" ]; then
    echo "'install' or 'remove' sub-command is missing."
    usage
    exit 1
fi

SCRIPTDIR=$(dirname $0)
LIZMAP=$SCRIPTDIR/..

if [ "$ACTION" = "install" ]; then

    if [ ! -d $SCRIPTDIR/../../extra-modules/lizmapdemo ]; then
        if [ ! -d $SCRIPTDIR/../lizmap-modules/lizmapdemo ]; then
          HAS_UNZIP=$(command -v unzip)
          if [ "$HAS_UNZIP" = "" ]; then
            echo "Error: cannot install the lizmapdemo module: unzip is not installed"
            exit 1
          fi

          LZM_VERSION=$(sed -n 's:.*<version[^>]*>\(.*\)</version>.*:\1:p' $SCRIPTDIR/../project.xml)
          MAJOR_VERSION=$(echo $LZM_VERSION | cut -d'.' -f 1)
          MINOR_VERSION=$(echo $LZM_VERSION | cut -d'.' -f 2)
          STABILITY=$(echo $LZM_VERSION | cut -d'-' -f 2)
          if [ "$STABILITY" = "$LZM_VERSION" ]; then
            URL="https://packages.3liz.org/pub/lizmap/release"
          else
            URL="https://packages.3liz.org/pub/lizmap/unstable"
          fi
          URL=$URL/${MAJOR_VERSION}.${MINOR_VERSION}/lizmapdemo-module-${MAJOR_VERSION}.${MINOR_VERSION}.zip
          if [ ! -f lizmapdemo.zip ]; then
            HAS_WGET=$(command -v wget)
            HAS_CURL=$(command -v curl)
            if [ "$HAS_WGET" != "" ]; then
              wget -O lizmapdemo.zip $URL
            else
              if [ "$HAS_CURL" != "" ]; then
                curl $URL -L -o lizmapdemo.zip
              else
                echo "Error: cannot download the lizmapdemo module: wget or curl is not installed"
                exit 2
              fi
            fi
          fi
          unzip lizmapdemo.zip
          mv lizmapdemo $SCRIPTDIR/../lizmap-modules/
        fi
        if [ -d $LIZMAP/vendor ]; then
            php $LIZMAP/dev.php app:ini-change $LIZMAP/var/config/localconfig.ini.php lizmapdemo.enabled on modules
        fi
    else
      if [ -d $LIZMAP/vendor ]; then
        php $LIZMAP/dev.php app:ini-change $LIZMAP/var/config/localconfig.ini.php lizmapdemo.path "app:../extra-modules/lizmapdemo" modules
        php $LIZMAP/dev.php app:ini-change $LIZMAP/var/config/localconfig.ini.php lizmapdemo.enabled on modules
      fi
    fi

else
    rm -rf $LIZMAP/lizmap-modules/lizmapdemo
    if [ -d $LIZMAP/vendor ]; then
      php $LIZMAP/dev.php app:ini-change $LIZMAP/var/config/localconfig.ini.php lizmapdemo.enabled off modules
      php $LIZMAP/dev.php app:ini-change --del $LIZMAP/var/config/localconfig.ini.php lizmapdemo.path dummy modules
    fi
fi


if [ "$2" != "--no-installer" ]; then
  if [ -d $LIZMAP/vendor ]; then
    (cd $LIZMAP/install && php installer.php)
  fi
fi
