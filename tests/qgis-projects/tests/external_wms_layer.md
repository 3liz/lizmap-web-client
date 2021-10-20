# Test the respect of WMS external layer image format

The QGIS project contains 3 layers:

* **bakeries**: a SHP point layer in EPSG:4326
* **IGN plan**
  * **Plan IGN v2 2154 jpeg**: a WMS layer from the French IGN organization, requested in `image/jpeg`
  * **Plan IGN v2 2154 png**: the same layer but requested in `image/png`.


## Procedure

Load the map `external_wms_layer`,

* [ ] open your browser developer panel with `CTRL+MAJ+i`,
* [ ] activate the `Network` tab with the `Images` filter (to see the requested images in the log),
* [ ] empty the log (search for a `bin` icon in the `Network` panel),
* [ ] move the map to trigger a map refresh,
* [ ] check the image requested for the active layer `bakeries` is in **PNG** format
* [ ] check the image requested for the active layer `Plan IGN v2 2154 jpeg` is in **JPEG** format
* [ ] activate the layer `Plan IGN v2 2154 png` in the legend
* [ ] check the image requested for the active layer `Plan IGN v2 2154 png` is in **PNG** format and much bigger
