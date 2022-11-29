# Changelog Lizmap 3.7

## Unreleased

### Added

* New display for measurements on the map when drawing
* Better management of QGIS projects about versions (desktop, plugin versions etc)
* **Form filter**: Allow to use a second field for the numeric type like it is already possible for dates.
  Useful when the layer features contain two fields describing a minimum and maximum value of the same property.
* **Action module**:
  * Add the possibility to run actions for the map project and for some layers. Before, it was only possible
    for the features of a layer (the action buttons added in the popup toolbar).
  * The map center and map extent are now passed to the PostgreSQL function `lizmap_get_data`,
    as WKT geometries, in projection `EPSG:4326`
  * A new public JavaScript function is available to programmatically run an action with:
    `lizAction.runLizmapAction(actionName, scope, layerId, featureId, wkt);`
  * The JavaScript code has been modernized (no more jQuery calls, usage of web components, etc.)

### Updated

* New drawing toolbar, migration from OpenLayers 2 to OpenLayers 6
* Update Plotly.js to 2.16.3

### Backend

* Update some JavaScript dependencies
* Some old code about QGIS Server 2
* Update the OpenLayers library to version 7.1
* Fix some issues when deployed with Docker

### Funders

* **[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com)**
* **[Avignon city](https://www.avignon.fr)**
* **[Parc naturel régional du Haut-Jura](http://www.parc-haut-jura.fr/)**
