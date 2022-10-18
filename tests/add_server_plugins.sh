#!/usr/bin/env bash


echo "QGIS Server Lizmap plugin"

# Latest release
VERSION=1.2.0
wget https://github.com/3liz/qgis-lizmap-server-plugin/releases/download/${VERSION}/lizmap_server.${VERSION}.zip -O lizmap_server.master.zip

unzip -o lizmap_server.master.zip -d qgis-server-plugins/
rm lizmap_server.master.zip

# Remove legacy package for a few weeks
if [ -d qgis-server-plugins/lizmap/ ]; then
  rm -rf qgis-server-plugins/lizmap
fi
