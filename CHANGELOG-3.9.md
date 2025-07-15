# Changelog Lizmap 3.9

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords: backend, tests, test, translation, funders, important
-->

## Unreleased

### Funders

* **[Cadageo](https://www.cadageo.com/)**
* **[Faunalia](https://www.faunalia.eu/fr)** with @mind84
* **[SMAVD](https://www.smavd.org/)**

### Added

* Support HTTP Range header for files in media with GetMedia
* Add opengraph tag for map page, better link preview

### Fixed

* Locate By Layer does not support NULL values because of `DOMPurify.sanitize`
* Editing - Fix getting wrong feature when layer has an SQL filter
* Fix GetLegendGraphic Etag by adding layer
* Allow the same pivot to be defined multiple times
* Fix: set alphanumeric order in form filter
* Fix: Modal is not closed when Lizmap is opened in a new tab from another page
* Fix ValueRelation edit widget parsing
* Fix the way to check if the `lizmap_search` table is available
* Allow the same pivot to be defined multiple times
* Selection tool, fix "plus" and "minus" buttons
* HTTP Etag for:
  * media files get by GetMedia
  * illustration files
  * default illustration file
* Media controller only allow GET and HEAD HTTP Method
* Atlas: Typing error for hideFeaturesAtStartup
* Admin - Show unsuccessful Lizmap Web Client metadata access, useful with `curl`, or from QGIS plugin

### Backend

* Update OL to 10.6.1
* Update playwright to 1.53.x
* Use "rspack" instead of "webpack"
* CI: copy .bundle.js and .bundle.js.map files whatever their names are

## 3.9.0 - 2025-06-19

### Funders

* **[Andromède Océanologie](https://www.andromede-ocean.com/)**
* **[Antonio Viscomi](https://github.com/Antoviscomi)**
* **[Agence des 50 pas de Guadeloupe](https://www.50pasguadeloupe.fr/)**
* **[AUDIAR](https://www.audiar.org/)**
* **[Avignon](https://www.avignon.fr/)**
* **[Cartophyl](http://www.cartophyl.com/)**
* **[CC Bièvre Est](https://www.bievre-est.fr/)**
* **[DVP SOLAR](https://dvpsolar.com/)**
* **[Etra](https://www.etraspa.it/)**, and developed by **[Faunalia](https://www.faunalia.eu/fr)** with @mind84
* **[FM Projet](https://fmprojet.fr/)**
* **[Klein und Leber Gbr](https://www.gisgeometer.de/)**
* **[Golfe du Morbihan Vannes agglomération](https://www.golfedumorbihan-vannesagglomeration.bzh/)**
* **[Lozère province](https://lozere.fr/)**
* **[Métropole Aix-Marseille-Provence](https://ampmetropole.fr/)**
* **[SMICA](https://www.smica.fr/)**
* **[Syslor](https://syslor.net/)**
* **[TDPA](https://www.terredeprovence-agglo.com/)**
* **[Valabre](https://www.valabre.com/)**
* **[VSB Energy](https://www.vsb.energy/)**
* **[WPD](https://www.wpd.fr/)**

### Important

* PHP 8.1 minimum is **required**
* Py-QGIS-Server is now required by default.
  Read in `lizmap/var/config/localconfig.ini.php.dist` if necessary about QGIS wrapper and
  in the [documentation](https://docs.lizmap.com/current/en/install/py-qgis-server.html).

### Added

* Editing
  * Make sure the dock with the form is visible before opening the cancellation confirmation dialog
* Drawing :
  * Import and export drawings as [FlatGeobuf](https://flatgeobuf.org/)
  * Import Shapefile into the drawing toolbox
  * Circular geometry measurement on draw, contribution from @mind84
  * Add button to rotate geometries
  * Add scaling tool
  * Add split tool. Switch to editing and select split features
* Display of related children features using relations from a parent popup
  * `lizmap-features-table` for children in popup according to a new setting in the plugin
  * For now, the layer **must be published** in the "Attribute table tool". This will be avoided in next release 3.9.1
  * Evaluate QGIS expressions which are in `lizmap-field`, in the `lizmap-features-table`
  * Add layer ID in the "highlighted" signal from [Lizmap features table](https://docs.3liz.org/lizmap-web-client/js/module-FeaturesTable.html) component
  * New optional settings :
    * Show the currently highlighted feature geometry in the map with `data-show-highlighted-feature-geometry="true"`
    * Centre the map to this geometry with `data-center-to-highlighted-feature-geometry="true"`
    * Improve the logic of the opening
* Attribute table
  * Layer export capabilities based on attribute layers configuration, for groups
* Form filter
  * Filter autocomplete list based on previous applied filters
* Map viewer
  * Be able to set a maximum zoom for points, lines or polygons when zooming, setting in the plugin
* JavaScript
  * JS External OpenLayers Layer: defined custom title
* Adding Open Layers format for reading WFS capabilities data
* Support for `X-Request-Id` for Py-QGIS-Server debug
* REST API on Lizmap repositories and projects, see Swagger documentation
* Lizmap search
  * A new flag `DEBUG=TRUE` to `lizmap_search` to ease a little bit the debugging
  * Upgrade `item_filter` to accept a comma separated list of values in Lizmap search, contribution from @meyerlor Klein und Leber Gbr
* Metadata: Add the WFS link if the user has enough rights
* Landing page
  * Add the project abstract in data attributes on the landing page
* Users
  * Add login into the registration email
  * In the login form, show the button to see the password
* UX - Add tooltips on buttons in the "maps management" page and also for the project switcher button

### Changed

* Activate the "Locate by layer" by default
* Internal refactoring of the drawing box tool, which can lead to some UX changes
* Simplify the UI if only one tool is available
* Popup: Improve styling of drag-and-drop designed popups
* Avoid login from QGIS to be displayed in the administration panel

### Fixed

* Administration panel
  * Avoid an admin to not see some projects
  * Add HTML anchors to repositories page
* `X-Request-Id` could be an array when doing an HTTP request, fixing logging issue about HTTP requests which have failed
* Locate By Layer - Error after automatic ESlint
* Fix tooltips in some dialogs
* Support Google Tag instead of the old Analytics
* JS Action - reset HTML message
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
* The WMS Capability root layer has no bounding boxes
* Digitizing module: deactivate it when the drawing box is closed
* Regression about the attribute table being limited to 500 features
* Improve reading GetCapabilities with QGIS 3.40 about a possible null in the bounding box
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

### Removed

* Remove BBOX and projection name from the landing page and the project information panel
* Drop support of QGIS FCGI by default, see important note above

### Backend

* Update Jelix to [1.8.18.1](https://github.com/jelix/jelix/releases/tag/v1.8.18.1)
* Code refactoring :
  * ESLint, StyleLint, Rector...
* Only use Guzzle to send requests from PHP
* Parsing QGIS Project with PHP XMLReader instead of DOM
* Expose more OpenLayers and lit classes
* Reduce `mainLizmap` dependencies in all JavaScript code
* Raise PHP to version 8.1
* Dataviz with PlotlyJS
  * Update to v2.35.2
  * Use a custom build to reduce file size
* Update lit-html to 3.3.0
* Update dompurify to 3.2.5

## 3.9.0-rc.3 - 2025-05-16

### Funders

* **[Avignon](https://www.avignon.fr/)**
* **[DVPSolar](https://dvpsolar.com/)**
* **[TDPA](https://www.terredeprovence-agglo.com/)**
* **[WPD](https://www.wpd.fr/)**

### Added

* Metadata: Add the WFS link if the user has enough rights
* Add the project abstract in data attributes on the landing page

### Fixed

* The WMS Capability root layer has no bounding boxes
* Digitizing module: deactivate it when the drawing box is closed
* Regression about the attribute table being limited to 500 features
* Improve reading GetCapabilities with QGIS 3.40 about a possible null in the bounding box

### Changed

* UX - Rephrase the error message about the QGIS wrapper

### Backend

* Update lit-html to 3.3.0
* Update dompurify to 3.2.5

## 3.9.0-rc.2 - 2025-05-12

### Added

* Add login into the registration email
* In the login form, show the button to see the password

### Fixed

* Fix regression in Jelix about rights during a user deletion

### Backend

* Upgrade Jelix to 1.8.18.1

## 3.9.0-rc.1 - 2025-05-07

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
  Read in `lizmap/var/config/localconfig.ini.php.dist` if necessary about QGIS wrapper and
  in the [documentation](https://docs.lizmap.com/current/en/install/py-qgis-server.html).

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
