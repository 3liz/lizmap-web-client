#!/usr/bin/env bash


echo "QGIS Server Lizmap plugin"

# Latest commit on alpha release
VERSION=1.1.2
wget https://packages.3liz.org/pub/lizmap_server-qgis-plugin/unstable/lizmap_server.${VERSION}-alpha.zip -O lizmap_server.master.zip

# Latest release
# VERSION=1.1.1
# wget https://github.com/3liz/qgis-lizmap-server-plugin/releases/latest/download/lizmap_server.${VERSION}.zip -O lizmap_server.master.zip

unzip -o lizmap_server.master.zip -d qgis-server-plugins/
rm lizmap_server.master.zip

# Remove legacy package for a few weeks
if [ -d qgis-server-plugins/lizmap/ ]; then
  rm -rf qgis-server-plugins/lizmap
fi

# AtlasPrint
VERSION=3.3.1
wget https://github.com/3liz/qgis-atlasprint/releases/latest/download/atlasprint.${VERSION}.zip -O atlasprint.zip
unzip -o atlasprint.zip -d qgis-server-plugins/
rm atlasprint.zip

# WfsOutputExtension
VERSION=1.7.0
wget https://github.com/3liz/qgis-wfsOutputExtension/releases/latest/download/wfsOutputExtension.${VERSION}.zip -O wfsoutputextension.zip
unzip -o wfsoutputextension.zip -d qgis-server-plugins/
rm wfsoutputextension.zip
