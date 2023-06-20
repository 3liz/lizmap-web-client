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
echo "Unstable from https://packages.3liz.org"
# qgis-plugin-manager init
echo "https://packages.3liz.org/pub/server-plugins-repository/unstable/plugins.[VERSION].xml" > /tmp/sources-plugin-manager.list
qgis-plugin-manager update
qgis-plugin-manager install -f "Lizmap server"
qgis-plugin-manager install -f wfsOutputExtension
qgis-plugin-manager remove atlasprint || true

# echo "QGIS Server Lizmap plugin"
# Latest commit
# echo "Latest commit from https://packages.3liz.org"
# wget https://packages.3liz.org/pub/lizmap-server-qgis-plugin/lizmap_server.master.zip -O /tmp/lizmap_server.master.zip

# Latest release
# VERSION=1.1.1
# echo "Stable release from GitHub"
# wget https://github.com/3liz/qgis-lizmap-server-plugin/releases/latest/download/lizmap_server.${VERSION}.zip -O /tmp/lizmap_server.master.zip

# unzip -o /tmp/lizmap_server.master.zip -d /srv/plugins/
# rm /tmp/lizmap_server.master.zip
