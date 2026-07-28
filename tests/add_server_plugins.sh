#!/usr/bin/env bash

set -e

if [[ ! -f "$QGIS_PLUGIN_MANAGER_SOURCES_FILE" ]]; then
    echo "Please set QGIS_PLUGIN_MANAGER_SOURCES_FILE to a valid file (found \"$QGIS_PLUGIN_MANAGER_SOURCES_FILE\")"
    exit 1
fi

# Remove legacy folders about qgis-plugin-manager
if [ -d /srv/plugins/.cache_qgis_plugin_manager ]; then
  rm -rf /srv/plugins/.cache_qgis_plugin_manager
fi
if [ -f /srv/plugins/sources.list ]; then
  rm -f /srv/plugins/sources.list
fi

echo "QGIS Server Lizmap and WfsOutputExtension plugins"
echo "Loading from $(cat $QGIS_PLUGIN_MANAGER_SOURCES_FILE)"
qgis-plugin-manager update
# Pinned to 2.14.1: releases 2.15.0/2.15.1 (2026-07-27) throw a server error (HTTP 500) on the
# GetFeatureInfo(FILTER=..., with_maptip=true) request used to fetch embedded relation children,
# breaking the popup children display (see e2e embedded-relation.spec.js).
# Unpin once https://github.com/3liz/qgis-lizmap-server-plugin ships a fix for this regression.
qgis-plugin-manager install -f "Lizmap server"==2.14.1
qgis-plugin-manager install -f wfsOutputExtension
qgis-plugin-manager install -f atlasprint

# echo "QGIS Server Lizmap plugin"
# Latest commit
# echo "Latest commit from https://qgis-plugins.3liz.org"
# qgis-plugin-manager install --pre -f "Lizmap server"

# Specific version
# VERSION=2.14.1
# echo "Specific version from https://qgis-plugins.3liz.org"
# qgis-plugin-manager install -f "Lizmap server"==${VERSION}

# Latest release
# VERSION=2.14.1
# echo "Stable release from GitHub"
# wget https://github.com/3liz/qgis-lizmap-server-plugin/releases/latest/download/lizmap_server.${VERSION}.zip -O /tmp/lizmap_server.master.zip
# unzip -o /tmp/lizmap_server.master.zip -d /srv/plugins/
# rm /tmp/lizmap_server.master.zip
