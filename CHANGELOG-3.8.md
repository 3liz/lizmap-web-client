# Changelog Lizmap 3.8

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords: backend, tests, test, translation, funders, important
-->

## Unreleased

### Fixed

* HTTP Etag for:
  * media files get by GetMedia
  * illustration files
  * default illustration file
* Media controller only allow GET and HEAD HTTP Method
* Atlas: Typing error for hideFeaturesAtStartup

## 3.8.11 - 2025-06-18

### Funders

* **Antonio Viscomi**
* **[DVP SOLAR](https://dvpsolar.com/)**
* **[Klein und Leber Gbr](https://www.gisgeometer.de/)**
* **[Lozère province](https://lozere.fr/)**
* **[SMICA](https://www.smica.fr/)**

### Added

* REST API on Lizmap repositories and projects
* Upgrade `item_filter` to accept a comma separated list of values in Lizmap search, contribution from @meyerlor Klein und Leber Gbr

### Fixed

* Fixed a JavaScript error, contribution on the source code from @Antoviscomi
* Tooltip: fix tooltip layer not removed as a tool layer
* Optimize FTS query to use the index
* Fix: 0 integer is transformed to an empty string by DOMPurify.sanitize()
* Fix: Printing with text drawing/labels is broken
* QGIS Server GetPrint Highlight Label Alignment
* Add Etag to WMS GetLegendGraphic Request
* WMS GetLegendGraphic:
  * Perform GET request for single layer
  * Put single layer request in project cache
  * JS initialize Lizmap Application from not legacy code
  * JS legacy map: defined an initialized property
* Catching Guzzle client exceptions
* Fix: zoomToFeatures in filter
* Fix setting projection axis orientation in a simple way

## 3.8.10 - 2025-05-16

### Funders

* **[Avignon](https://www.avignon.fr/)**
* **[DVPSolar](https://dvpsolar.com/)**
* **[TDPA](https://www.terredeprovence-agglo.com/)**
* **[WPD](https://www.wpd.fr/)**

### Fixed

* The WMS Capability root layer has no bounding boxes
* Digitizing module: deactivate it when the drawing box is closed
* Regression about the attribute table being limited to 500 features
* Improve reading GetCapabilities with QGIS 3.40 about a possible null in the bounding box

## 3.8.9 - 2025-05-12

### Added

* Add login into the registration email
* In the login form, show the button to see the password

### Fixed

* Fix regression in Jelix about rights during a user deletion

### Backend

* Upgrade Jelix to 1.8.18.1

## 3.8.8 - 2025-05-07

### Funders

* **[Agence des 50 pas de Guadeloupe](https://www.50pasguadeloupe.fr/)**
* **[AUDIAR](https://www.audiar.org/)**
* **[Cartophyl](http://www.cartophyl.com/)**
* **[FM Projet](https://fmprojet.fr/)**
* **[SMICA](https://www.smica.fr/)**
* **[Syslor](https://syslor.net/)**
* **[TDPA](https://www.terredeprovence-agglo.com/)**
* **[Valabre](https://www.valabre.com/)**

### Added

* A new flag `DEBUG=TRUE` to `lizmap_search` to ease a little bit the debugging
* UX - Add tooltips on buttons in the "maps management" page and also for the project switcher button
* Add layer ID in the "highlighted" signal from [Lizmap features table](https://docs.3liz.org/lizmap-web-client/js/module-FeaturesTable.html) component

### Fixed

* When using the quick search menu, you can't zoom back to a feature after moving the map
* Attribute table: format big data
* Fix UI regression: Clear popup geometry
* Tile WMS layer has no loading status updated
* Webpack: set publicPath:auto to get JS assets with a correct path
* Fix CORS allow methods when OPTIONS Request
* Use media in a popup :
  * Fix incorrect replacement in `<a href="media/"><img src="media/"></a>`
  * Fix the regular expression if the extension has two characters
* Lizmap Atlas: Keep the current selected feature after layer updates

## 3.8.7 - 2025-04-01

### Funders

* **[Etra](https://www.etraspa.it/)**, and developed by **[Faunalia](https://www.faunalia.eu/fr)** with @mind84
* **[Destination Bretagne Sud Golfe du Morbihan](https://destination-bretagnesud.bzh/)**
* **[SMICA](https://www.smica.fr/)**

### Changed

* Google Analytics is now Google Tag Manager

### Fixed

* Fix measurement when both angle and dimension constraints are set
* Administration panel: drop the build number from the version when comparing Lizmap Web Client modules.
* Fix: zoom in form filter
* Popup - Improve styling of drag-and-drop designed popups

## 3.8.6 - 2025-03-10

### Funders

* **[Avignon city](https://cartes.mairie-avignon.com)**
* **[CédéGIS](https://www.cedegis.fr/)**
* **[Faunalia](https://www.faunalia.eu)**
* **[Syslor](https://syslor.net/)**
* **[TDPA](https://www.terredeprovence-agglo.com/)**
* **[Qair](https://www.qair.energy)**

### Added

* Add Google "Terrain" layer in the `baselayers` group
* Add authenticated user organization in hidden fields

### Fixed

* Add a workaround when QGIS server timed out when requesting the legend per layer
* `X-Request-Id` could be an array when doing an HTTP request, fixing logging issue about HTTP requests which have failed
* Display an error message if the layer is found in the QGS file, but not in the CFG file
* Display an error message in the administration panel if the installation is not completed
* Consider the opacity of groups for printing, contribution from @mind84
* Distance constraint in the measure tool is not correctly interpreted in the map
* QGIS constraints with geometry
* Rely on the relation ID for children popup positioning
* Fix Javascript error if `pivotAttributeLayerConf` is undefined
* Fix WKT geometry string provided by QGIS Server in GetFeatureInfo
* Sandbox all iframes except those from the same origin
* Fix tooltips in some dialogs

## 3.8.5 - 2025-02-07

### Funders

* [Destination Bretagne Sud - Golfe du Morbihan](https://destination-bretagnesud.bzh/)

### Added

* Preparing [QJazz](https://github.com/3liz/qjazz)

### Fixed

* Add `X-Request-Id` in request to QGIS Server headers :
  * Useful with latest versions of [Py-QGIS-Server](https://github.com/3liz/py-qgis-server) and [QJazz](https://github.com/3liz/qjazz)
  * The `Q-Request-Id` is shown in the administration log panel
* Form filter : Also search for `NULL` values when empty string is checked
* Authenticating layers with QGIS native "auth" config, contribution from @cfsgarcia
* Wrong distance constraint value
* When drawing a single segment, display correct total measure for linestring without distance constraint
* Administrator logs :
  * Add new panel about `errors`
* Tooltip
  * Remove CSS `text-align:center`
  * Use `addToolLayer` instead of `addLayer`
* Performance issue about opacity and embedded layers
* `lizmap-features-table` - Improve the logic of the feature detail opening

### Backend

* Update Jelix to [1.8.16](https://github.com/jelix/jelix/releases/tag/v1.8.16)
* Update JavaScript dependencies

### Tests

* Improve workflow about PHP and End2End tests

## 3.8.4 - 2025-01-07

### Funders

* Contributions on source code from @erw-1
* **[Andromède Océanologie](https://www.andromede-ocean.com)**
* **[Avignon](https://www.avignon.fr)**
* **[Biotope](https://www.biotope.fr/)**
* **[Conseil Départemental du Calvados](https://www.calvados.fr)**
* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84
* **[Haute-Saône Numérique](https://www.hautesaonenumerique.fr)**
* **[Keolis Rennes](https://www.keolis-rennes.com)**
* **[Le Grand Narbonne](https://www.legrandnarbonne.com/)**
* **[Métropole Aix-Marseille-Provence](https://ampmetropole.fr/)**

### Added

* Popup - Add layer ID and feature ID as data attributes in the HTML
* HTML component `lizmap-features-table`
  * Use a table with additional columns from fields
  * `data-show-highlighted-feature-geometry="true"`
  * `data-center-to-highlighted-feature-geometry="true"`
  * `data-max-features` : Request a maximum number of features
  * Sort data server-side
* Enable translate a geometry
* Draw: inform user he can hold "Alt" and click to delete a vertex

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
* Editing :
  * Make sure the dock with the form is visible before opening the cancellation confirmation dialog
  * Hide "select" when launched from attribute table via parent
  * Exec a SQL DELETE can return 0 in some cases
* Dataviz
  * Update PlotlyJS to v2.35.2 and do custom build to reduce file size
* Fix the print overlay stacking
* Fix order popups following layers order

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
