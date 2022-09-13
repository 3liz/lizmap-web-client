#!/usr/bin/env bash


echo "QGIS Server Lizmap plugin"

# Latest commit
echo "Latest commit from https://packages.3liz.org"
wget https://packages.3liz.org/pub/lizmap-server-qgis-plugin/lizmap_server.master.zip -O /tmp/lizmap_server.master.zip

# Latest release
# VERSION=1.1.1
# echo "Stable release from GitHub"
# wget https://github.com/3liz/qgis-lizmap-server-plugin/releases/latest/download/lizmap_server.${VERSION}.zip -O /tmp/lizmap_server.master.zip

unzip -o /tmp/lizmap_server.master.zip -d /srv/plugins/
rm /tmp/lizmap_server.master.zip

echo "QGIS Server WfsOutputExtension and AlasPrint plugins"
echo "Stable releases from http://plugins.qgis.org"
qgis-plugin-manager init
qgis-plugin-manager update
# qgis-plugin-manager install "Lizmap server"
qgis-plugin-manager install atlasprint
qgis-plugin-manager install wfsOutputExtension
