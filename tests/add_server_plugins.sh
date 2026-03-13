#!/usr/bin/env bash

set -e

# Remove legacy folders about qgis-plugin-manager
if [ -d /srv/plugins/.cache_qgis_plugin_manager ]; then
  rm -rf /srv/plugins/.cache_qgis_plugin_manager
fi
if [ -f /srv/plugins/sources.list ]; then
  rm -f /srv/plugins/sources.list
fi

echo "QGIS Server Lizmap and WfsOutputExtension plugins"
echo "Loading from https://qgis-plugins.3liz.org"
# qgis-plugin-manager init
echo "https://qgis-plugins.3liz.org/plugins.xml?qgis=[VERSION]" > /tmp/sources-plugin-manager.list
qgis-plugin-manager update
qgis-plugin-manager install -f "Lizmap server"
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
