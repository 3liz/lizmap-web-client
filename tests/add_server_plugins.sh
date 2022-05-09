#!/usr/bin/env bash

echo "Lizmap"
wget https://packages.3liz.org/pub/lizmap-server-qgis-plugin/lizmap_server.master.zip
unzip -o lizmap_server.master.zip -d qgis-server-plugins/
rm lizmap_server.master.zip

# Remove legacy package for a few weeks
if [ -d qgis-server-plugins/lizmap/ ]; then
  rm -rf qgis-server-plugins/lizmap
fi
