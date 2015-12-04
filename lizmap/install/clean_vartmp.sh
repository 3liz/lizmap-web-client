#!/bin/bash
SCRIPTDIR=$(dirname $0)

rm -rf $SCRIPTDIR/../var/log/*
rm -rf $SCRIPTDIR/../var/mails/*
rm -rf $SCRIPTDIR/../var/uploads/*
rm -rf $SCRIPTDIR/../../temp/lizmap/*

