#!/bin/bash
SCRIPTDIR=$(dirname $0)

DIRS="$SCRIPTDIR/../var/log $SCRIPTDIR/../var/mails $SCRIPTDIR/../var/uploads $SCRIPTDIR/../../temp/lizmap"

rm -rf $SCRIPTDIR/../var/log/*
rm -rf $SCRIPTDIR/../var/mails/*
rm -rf $SCRIPTDIR/../var/uploads/*
rm -rf $SCRIPTDIR/../../temp/lizmap/*
touch $SCRIPTDIR/../../temp/lizmap/.empty
