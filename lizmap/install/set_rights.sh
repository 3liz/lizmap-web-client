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

VARDIR="$SCRIPTDIR/../var"
WWWDIR="$SCRIPTDIR/../www"

DIRS="$VARDIR/config $VARDIR/db $VARDIR/log $VARDIR/themes $VARDIR/overloads"
DIRS="$DIRS $VARDIR/mails $VARDIR/uploads $VARDIR/lizmap-theme-config"
DIRS="$DIRS $SCRIPTDIR/../../temp/lizmap $WWWDIR/cache/ $WWWDIR/document/ $WWWDIR/live/"

chown -R $USER:$GROUP $DIRS
chmod -R ug+w $DIRS
