# Changelog Lizmap 3.8

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords: backend, tests, test, translation, funders, important
-->

## Unreleased

### Funders

* Contributions on source code from @erw-1
* **[Avignon](https://www.avignon.fr)**
* **[Conseil Départemental du Calvados](https://www.calvados.fr)**
* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84
* **[Haute-Saône Numérique](https://www.hautesaonenumerique.fr)**
* **[Keolis Rennes](https://www.keolis-rennes.com)**
* **[Le Grand Narbonne](https://www.legrandnarbonne.com/)**

### Added

* Popup - Add layer ID and feature ID as data attributes in the HTML
* `lizmap-features-table` component - Use a table with additional columns from fields
* Enable translate a geometry

### Fixed

* Fix CSS : hide only adjacent non-popup-displayed table items, contribution on the source code from @erw-1
* Tail admin logs to always display data
* In case of HTTP request error, log it into the admin logs
  * It's easier to debug and see OGC requests to QGIS server
* Remove the print overlay when some dialogs are opened
* Speed up the landing page loading with a lazy loading of each QGIS projects
* Feature toolbar: child layer is pivot
* Put highlight layer in tools layer group
* Include layer opacity info for embedded layers
* JS State Symbology : checking `ruleKey` for WMS parameters
* `<lizmap-features-table>` : lower case `sortingOrder` and `draggable` attribute values
* Attribute table - Fix bugs
  * Remove the need to highlight a line when clicking on the "Create feature" button
  * Fix the "Create feature" button not visible in some cases
  * Fix the child table not visible in some cases after clicking on a parent feature
* Fix display of error message when launching a Lizmap action
* Fix editing : hide "select" when launched from attribute table via parent
* Editing : exec a SQL DELETE can return 0 in some cases

### Deprecated

* To get layer ID and feature ID in a JavaScript code, use data-attributes, instead of the legacy `<input class="lizmap-popup-layer-feature-id">`

### Backend

* Update Jelix to 1.8.14

## 3.8.3 - 2024-11-08

### Funders

* **[AUDRNA](https://www.audrna.com/)**
* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84
* **[Valabre](https://www.valabre.com/)**

### Added

* Move related child in corresponding div for **1:n** and **n:m** relations in popups

### Changed

* Rename "only maps" to "Disable landing page"

### Fixed

* Loading of `iframe` into a popup
* Fix expanded for categorized symbology in group as layer
* Encode layer style in hash, contribution from @mind84
* Set raster layers opacity, contribution from @mind84
* Fix base layer (i) information button
* IGN search string length must be between 3 and 200 chars
* Fix Relation Reference Form control order by value
* Fix enclosing correctly `filter` when requesting QGIS Server with brackets
* Minor refactoring of embedded projects referencing during projects loading
* Fix the URL used for the OSM Nominatim search and use `bounded=1` to restrict results
* Fix display of the highlight after an OSM and IGN geocoding
* `lizmap-features-table` :
  * Improve popup table style
  * Fix ordering of rows in the table, contribution from @neo-garaix
* Reset the form filter when changing the dropdown menu

## 3.8.2 - 2024-10-01

### Added

* Show the list of installed modules in the administration panel
* Add a link to QGIS Server individual plugin help URL if available

### Changed

* Better user experience about a JavaScript error, possible to add `no_user_defined_js=1` in the URL

### Fixed

* Fix extent when clicking on the zoom to initial extent button
* Fix opening layer group information window, contribution from @cfsgarcia
* Fix reprojection of circle when printing and use a `CURVEPOLYGON`
* Fix: allow tiled WMS when `singleTile=False` and the layer is not cached

### Backend

* Update OpenLayers to 10.2.1

## 3.8.1 - 2024-09-18

### Funders

* **[Valabre](https://www.valabre.com/)**
* Villefranche Agglomération

### Fixed

* Permalink: checked groups are not respected when hash is applied
* Get correct connection object for fields quoting : PostgreSQL, SQLite
* Cache : Lookup layer by any name for client and server sides, contribution from @ppetru
* Shifted geometry during editing
* Target `_blank` disappeared on hyperlinks in popups
* In the Javascript digitizing measure, provide a map projection
* Fix issues on datetime pickers and localization
* Remove unwanted web assets from local configuration
* `lizMap.getFeaturePopupContentByFeatureIntersection` according to the choosing scale

### Changed

* Use OpenLayers10 map instead of OpenLayers2 for Lizmap Actions

### Backend

* Update Playwright to 1.46.0
* Some updates on PHPUnit 10

## 3.8.0 - 2024-09-02

### Added

* Load layers as a single WMS layer, contribution from @mind84
* Improve snapping functionalities, contribution from @mind84
* New management of the N to M relations data editor, contribution from @mind84
* Display features at startup when set in URL
* Improvement on the landing page HTML content (logged and not logged user)
* Initialization of group checkboxes based on Lizmap configuration, from @mind84
* Web component `lizmap-features-table` to display a compact list of features
* **Digitizing**
    * JS Digitizing: Add erase all
    * JS Digitizing component: measure attribute
* Review of the **tooltip** feature using the new version of the plugin
* Popup: FeatureToolbar in compact table
* New JavaScript API to load external layer straight in the legend tree and in the map
* Option to disable the automatic permalink in the URL

### Changed

* Enable popup when digitizing is disabled
* UI: Double-clicking on a group in the legend is now propagated to child items

### Fixed

* Handle baselayers visibility in theme
* Popup was not shown in the **Atlas** container
* Let min/max resolutions be handled by OpenLayers for WMTS
* Drawing tool : keep draw visible when closing minidock
* Dataviz in popup generate two feature toolbar in parent popup
* Apply min and max resolutions to base layers removed by single WMS Layer
* More fixes about XSS
* Tooltip :
  * Don't show tooltip tool when device has coarse pointer
  * Remove legacy code
  * Handle linestring layers
* Fix loading GIF about Lizmap being transformed about color
* Refresh the layer after editing when using the "single WMS tile mode"
* Fix feature filtering when PK is of type string, contribution from @maxencelaurent
* Popup: respect `popupMaxFeatures` parameter
* Fix cross-site scripting issue with the `theme` parameter
* Use proper OpenLayers class for layers issued by Google Maps, contribution from @mind84
* Refresh data button when new OL9 map moves
* Avoid zoom to initial extent on window resize
* **Group as layer**
    * checked by theme
    * Layer group not automatically active despite corresponding setting
* Dataviz
    * Fix JavaScript when dataviz is not available
* Digitizing :
  * Fixing measure not removed from selection to draw
* **Lizmap search**: order first by `similarity` then by `item_label`
* Zoom to feature when `limitDataToBbox` is `true`
* Fixing tiles resolutions
  * Geoplateforme WMTS layers have 19 zoom levels
  * Fix JavaScript XYZ Grid Tile
* Permalink :
  * If geobookmark is the same as the hash there is no hash change event. In this case we run permalink
  * Fix permalink after location change

### Backend

* JavaScript
  * Review ESLint configuration
  * New `lizmap-message` JS component
  * Some JavaScript and PHP refactoring, code cleaning
  * Update OpenLayers to version 10
  * Improve migration to OpenLayers 10
    * OL 9 map on top now
    * Popup
    * Locate by layer highlight
* Fire `treecreated` event at proper time, contribution from @mind84
* Fix JS externalLayer: default OpenLayers icon and events
* Popup: remove remaining OL2 dependencies
* Expose more OpenLayers 10 classes
* Expose some Lit HTML classes
* Update dompurify to 3.1.6
* Update proj4 to 2.11.0
* Update to Jelix 1.8.11-rc.2

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Funders

* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84
* **[Conseil Départemental du Calvados](https://www.calvados.fr)**
* **FM Projet**
* **[JPEE](https://www.jpee.fr/)**
* **[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)**
* **[Valabre](https://www.valabre.com/)**

## 3.8.0-rc.4 - 2024-08-19

### Funders

* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84
* **FM Projet**
* **[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)**

### Added

* Initialization of group checkboxes based on Lizmap configuration, from @mind84
* Web component `lizmap-features-table` to display a compact list of features

### Changed

* Enable popup when digitizing is disabled

### Fixed

* Fix project properties when the WMS extent is empty
* Fix Projects switcher in maps

### Backend

* Fire `treecreated` event at proper time, contribution from @mind84
* Fix JS externalLayer: default OpenLayers icon and events
* JS: `mainLizmap.center` has to be provided by map state
* Fix package `map-projects.js`
* Update dompurify to 3.1.6
* Update OpenLayers to 10 and proj4 to 2.11.0
* Upgrade to Jelix 1.8.11-rc.2

## 3.8.0-rc.3 - 2024-07-19

### Funders

* **FM Projet**
* **[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)**
* **[Valabre](https://www.valabre.com/)**

### Added

* **Digitizing**
    * JS Digitizing: Add erase all
    * JS Digitizing component: measure attribute

### Fixed

* Refresh data button when new OL9 map moves
* Avoid zoom to initial extent on window resize
* **Group as layer**
    * checked by theme
    * Layer group not automatically active despite corresponding setting
* Dataviz
    * Fix JavaScript when dataviz is not available
* Digitizing :
  * Fixing measure not removed from selection to draw
* **Lizmap search**: order first by `similarity` then by `item_label`
* Zoom to feature when `limitDataToBbox` is `true`
* Fixing tiles resolutions
  * Geoplateforme WMTS layers have 19 zoom levels
  * Fix JavaScript XYZ Grid Tile
* Permalink :
  * If geobookmark is the same as the hash there is no hash change event. In this case we run permalink
  * Fix permalink after location change

### Tests

* Upgrade to Jelix 1.8.11-rc.2
* Improve End2End automatic tests

## 3.8.0-rc.2 - 2024-07-08

### Funders

* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84

### Added

* Option to disable the automatic permalink in the URL

### Changed

* UI: Double-clicking on a group in the legend is now propagated to child items
* Admin - Add legend about warning icon in project table
* Admin - Display the list of warning ID in the admin panel, in the tooltip

### Fixed

* Fix feature filtering when PK is of type string, contribution from @maxencelaurent
* Popup: respect `popupMaxFeatures` parameter
* Fix cross-site scripting issue with the `theme` parameter
* Use proper OpenLayers class for layers issued by Google Maps, contribution from @mind84

### Removed

* Remove unused button zoom to layer extent

### Backend

* Popup: remove remaining OL2 dependencies
* Expose more OpenLayers 9 classes
* Expose some Lit HTML classes

## 3.8.0-rc.1 - 2024-06-06

### Added

* New JavaScript API to load external layer straight in the legend tree and in the map
* Popup: FeatureToolbar in compact table
* Review of the **tooltip** feature using the new version of the plugin

### Removed

* Zoom history
* Unused button about the layer extent

### Fixed

* Handle baselayers visibility in theme
* Popup was not shown in the **Atlas** container
* Let min/max resolutions be handled by OpenLayers for WMTS
* Drawing tool : keep draw visible when closing minidock
* Dataviz in popup generate two feature toolbar in parent popup
* Apply min and max resolutions to base layers removed by single WMS Layer
* More fixes about XSS
* Tooltip :
  * Don't show tooltip tool when device has coarse pointer
  * Remove legacy code
  * Handle linestring layers
* Fix loading GIF about Lizmap being transformed about color
* Refresh the layer after editing when using the "single WMS tile mode"

### Backend

* New `lizmap-message` component
* Defer JavaScript scripts loading
* Refactoring of Web Components, about OpenLayers
* Review the way to load JavaScript
* Review ESLint configuration
* Upgrade Jelix to 1.8.9
* Upgrade OpenLayers to 9.2.3

## 3.8.0-alpha.1 - 2024-03-21

### Added

* Load layers as a single WMS layer, contribution from @mind84
* Improve snapping functionalities, contribution from @mind84
* New management of the N to M relations data editor, contribution from @mind84
* Display features at startup when set in URL
* Improvement on the landing page HTML content (logged and not logged user)

### Removed

* Buttons about zoom history

### Backend

* Some JavaScript and PHP refactoring, code cleaning
* Update OpenLayers to version 9
* Improve migration to OpenLayers 9
  * OL 9 map on top now
  * Popup
  * Locate by layer highlight

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Funders

* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84
* **[JPEE](https://www.jpee.fr/)**
