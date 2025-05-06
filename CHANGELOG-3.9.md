# Changelog Lizmap 3.9

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords: backend, tests, test, translation, funders, important
-->

## Unreleased

### Funders

* **[Agence des 50 pas de Guadeloupe](https://www.50pasguadeloupe.fr/)**
* **[AUDIAR](https://www.audiar.org/)**
* **[Cartophyl](http://www.cartophyl.com/)**
* **[Etra](https://www.etraspa.it/)**, and developed by **[Faunalia](https://www.faunalia.eu/fr)** with @mind84
* **[FM Projet](https://fmprojet.fr/)**
* **[SMICA](https://www.smica.fr/)**
* **[Syslor](https://syslor.net/)**
* **[TDPA](https://www.terredeprovence-agglo.com/)**
* **[Valabre](https://www.valabre.com/)**
* **[WPD](https://www.wpd.fr/)**

### Important

* Py-QGIS-Server is now required by default.
  Read in `lizmap/var/config/localconfig.ini.php.dist` if necessary about QGIS wrapper.

### Added

* Enable `lizmap-features-table` for children in popup according to a new setting in the plugin
* Layer export capabilities based on attribute layers configuration, for groups
* Evaluate QGIS expressions which are in `lizmap-field`, in the `lizmap-features-table`
* Lizmap API REST, see Swagger documentation
* A new flag `DEBUG=TRUE` to `lizmap_search` to ease a little bit the debugging
* UX - Add tooltips on buttons in the "maps management" page and also for the project switcher button
* Add layer ID in the "highlighted" signal from [Lizmap features table](https://docs.3liz.org/lizmap-web-client/js/module-FeaturesTable.html) component
* Feature JS Digitizing: Add scaling tool

### Removed

* Remove BBOX and projection name from the landing page and the project information panel
* Drop support of QGIS FCGI by default, see important note above

### Changed

* Internal refactoring of the drawing box tool, which can lead to some UX changes
  * Simplify the UI if only one tool is available
* Popup: Improve styling of drag-and-drop designed popups

### Fixed

* When using the quick search menu, you can't zoom back to a feature after moving the map
* Attribute table: format big data
* Fix CORS allow methods when OPTIONS Request
* Atlas: features were not projected to map
* Search: IGN French address search uses map view instead of maxExtent
* Fix UI regression: Clear popup geometry
* Tile WMS layer has no loading status updated
* Webpack: set publicPath:auto to get JS assets with a correct path
* Use media in a popup :
  * Fix incorrect replacement in `<a href="media/"><img src="media/"></a>`
  * Fix the regular expression if the extension has two characters
* Lizmap Atlas: Keep the current selected feature after layer updates

### Backend

* Update library EsLint JS to 9.25.1
* Update library FlatGeobuf 4.0.1

## 3.9.0-beta.2 - 2025-03-14

### Fixed

* Avoid an admin to not see some projects in the administration panel
* Add HTML anchors to repositories page in the administration panel
* `X-Request-Id` could be an array when doing an HTTP request, fixing logging issue about HTTP requests which have failed
* Locate By Layer - Error after automatic ESlint
* Fix tooltips in some dialogs
* Support Google Tag instead of the old Analytics

### Backend

* Update Jelix to [1.8.17](https://github.com/jelix/jelix/releases/tag/v1.8.16)
* Code refactoring :
  * ESLint, StyleLint, Rector...

## 3.9.0-beta.1 - 2025-02-07

### Funders

* **[Andromède Océanologie](https://www.andromede-ocean.com/)**
* **[CC Bièvre Est](https://www.bievre-est.fr/)**
* **[Etra](https://www.etraspa.it/)**, and developed by **[Faunalia](https://www.faunalia.eu/fr)** with @mind84
* **[Métropole Aix-Marseille-Provence](https://ampmetropole.fr/)**
* **[Golfe du Morbihan Vannes agglomération](https://www.golfedumorbihan-vannesagglomeration.bzh/)**
* **[VSB Energy](https://www.vsb.energy/)**

### Important

* PHP 8.1 minimum is **required**

### Added

* Editing
  * Make sure the dock with the form is visible before opening the cancellation confirmation dialog
* Drawing :
  * Circular geometry measurement on draw, contribution from @mind84
  * Add button to rotate geometries
  * Add split tool. Switch to editing and select split features
* `lizmap-features-table`, optionally :
  * Show the currently highlighted feature geometry in the map with `data-show-highlighted-feature-geometry="true"`
  * Centre the map to this geometry with `data-center-to-highlighted-feature-geometry="true"`
  * Improve the logic of the opening
* Import and export drawings as [FlatGeobuf](https://flatgeobuf.org/)
* Form filter: filter autocomplete list based on previous applied filters
* Be able to set a maximum zoom for points, lines or polygons when zooming
* New import Shapefile into the drawing toolbox
* JS External OpenLayers Layer: defined custom title
* Adding Open Layers format for reading WFS capabilities data
* Support for `X-Request-Id`

### Changed

* Activate the "Locate by layer" by default

### Backend

* Only use Guzzle to send requests from PHP
* Parsing QGIS Project with PHP XMLReader instead of DOM
* Expose more OpenLayers and lit classes
* Reduce `mainLizmap` dependencies in all JavaScript code
* Raise PHP to version 8.1
* Dataviz with PlotlyJS
  * Update to v2.35.2
  * Use a custom build to reduce file size
* Code refactoring :
  * ESLint, StyleLint...
