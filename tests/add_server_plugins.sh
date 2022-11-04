#!/usr/bin/env bash

set -e

# Remove legacy folders about qgis-plugin-manager
if [ -d /srv/plugins/.cache_qgis_plugin_manager ]; then
  rm -rf /srv/plugins/.cache_qgis_plugin_manager
fi
if [ -f /srv/plugins/sources.list ]; then
  rm -f /srv/plugins/sources.list
fi

echo "QGIS Server Lizmap, WfsOutputExtension and AtlasPrint plugins"
echo "Unstable from https://packages.3liz.org"
# qgis-plugin-manager init
echo "https://packages.3liz.org/pub/server-plugins-repository/unstable/plugins.[VERSION].xml" > /tmp/sources-plugin-manager.list
qgis-plugin-manager update
qgis-plugin-manager install "Lizmap server"
qgis-plugin-manager install atlasprint
qgis-plugin-manager install wfsOutputExtension
