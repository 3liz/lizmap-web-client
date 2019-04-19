#!/bin/sh
SCRIPTDIR=$(dirname $0)

USER="$1"
GROUP="$2"

if [ "$USER" = "" ]; then
    USER="www-data"
fi

if [ "$GROUP" = "" ]; then
    GROUP="www-data"
fi


DIRS="$SCRIPTDIR/../install/qgis/edition $SCRIPTDIR/../install/qgis/media/upload  $SCRIPTDIR/../var/config $SCRIPTDIR/../var/db $SCRIPTDIR/../var/log $SCRIPTDIR/../var/mails $SCRIPTDIR/../var/uploads $SCRIPTDIR/../var/lizmap-theme-config $SCRIPTDIR/../../temp/lizmap"

chown -R $USER:$GROUP $DIRS
chmod -R ug+w $DIRS
