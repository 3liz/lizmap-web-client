# Changelog Lizmap 3.9

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords: backend, tests, test, translation, funders, important
-->

## Unreleased

### Backend

* CI: copy .module.wasm files whatever their names are

## 3.9.5 - 2025-12-29

### Funders

* **[Klein und Leber GbR](https://www.gisgeometer.de/)** with @meyerlor
* **[Faunalia](https://www.faunalia.eu/fr)** with @mind84

### Fixed

* QGIS project parsing - error when raster renderer & huesaturation are not defined
* Respect legend_image_option setting when loading symbology
* Editable features in attribute table
* QGIS project parsing - error in visibility-preset when checked-legend-nodes is empty
* use same change opacity listener for base Layers and root map group
* Prevent parent groups from being auto-checked
* Error on add child element from parent attribute table

### Tests

* e2e Playwright: add fixture expect request
* Update every tests project to QGIS 3.34 and Lizmap plugin 4.4.9
* e2e Playwright: open attribute table returns WFS GetFeature request
* e2e Playwright: enhancing editable features
* e2e: move Projects homepage from cypress to playwright
* e2e Playwright: enhancing openEditingFormWithLayer
* e2e: Move form_edition from Cypress to Playwright
* e2e Playwright: enhancing n_to_m relations
* e2e: move reverse_geom from Cypress to Playwright
* e2e: move from Cypress to Playwright form_edition_all_fields_types
* e2e Playwright: enhancing some edition form tests
* e2e: Move form_edit_related_child_data from Cypress to Playwright
* e2e: move form_edition_value_relation_field from Cypress to Playwright
* e2e Playwright: Enhancing some form tests
* e2e Playwright Theme: enhancing
* e2e CLI with BATS and remove from cypress

### Backend

* PHP Repository class enhancement

## 3.9.4 - 2025-11-25

### Funders

* **[Faunalia](https://www.faunalia.eu/fr)** with @mind84
* **[DEAL de la Martinique](https://www.martinique.developpement-durable.gouv.fr/)**
* **[Avignon](https://www.avignon.fr/)**
* **[Communauté de Communes du Grand-Figeac](https://www.grand-figeac.fr/)**
* **[SMICA](https://www.smica.fr/)**
* **[Terre De Provence Agglomération](https://www.terredeprovence-agglo.com/)**
* **[SMAVD](https://www.smavd.org/)**
* **[digi-studio](https://digi-stud.io/)**
* **[Groupe Rouge Vif](https://grouperougevif.fr/)** and **[Projet InspiRe Clermont Auvergne Métropole](https://inspire-clermontmetropole.fr/)**
* **[Châteauroux Métropole](https://www.chateauroux-metropole.fr)**
* **[Cédégis](https://www.cedegis.fr/)**
* **[Klein und Leber GbR](https://www.gisgeometer.de/)** with @meyerlor
* **[Destination Bretagne Sud Golfe du Morbihan](https://destination-bretagnesud.bzh/)**
* **[Karum](https://www.karum.fr/)**
* **[Conseil Départemental du Calvados](https://www.calvados.fr/)**

### Added

* OpenLayers WebGLTile layer & GeoTiff source to the build

### Fixed

* Duplicated baselayers in single wms mode
* Export layer from sub-dock
* Request IP now provided by JelixContext for logging event
* ProjectCache not updated for form controls
* Undefined array key "HTTP_USER_AGENT"
* Show feature Count is requested even if it's value is 0
* Location search zoom to
* Action: zoom to features using zoomToGeometryOrExtent
* Replace getView().fit() by zoomToGeometryOrExtent()
* Filter unique values list is empty if one is null
* Selection tool - new, add & remove selection buttons shift vertically on hover
* jAcl2Db cache clear when user is added to or removed from a group administration
* Add German localization for DataTables, contribution from @meyerlor
* Session cookie has been blocked by Chrome/chromium
* Admin CORS: spaces in accessControlAllowOrigin
* Base layer opacity is not set by sub-dock
* Fix digitizing tool to accept decimal values for distance and angle
* Editing - Allow to create a feature on a layer with login based attribute filter
* PHP: VectorLayer provider can be null
* CSS: legend image min width
* Fix QGIS theme layer visibility for nested groups
* WFS GetFeature - Query database on RESULTTYPE=hits requests for PostgreSQL layers

### Tests

* e2e Playwright: Extend WFS GetFeature requests
* e2e: Port Dataviz from Cypress to Playwright
* e2e: migration from Cypress to Playwright attribte table
* e2e Playwright : Store logs in Project POM
* e2e Playwright: requests displayExpression
* e2e: migrate zoom-to-layer test to playwright

### Backend

* Upgrade Jelix to version 1.8.21 - Fix a security issue in authentication.
* Update OpenLayers to version [v10.7.0](https://github.com/openlayers/openlayers/releases/tag/v10.7.0) with:
  * Several WebGL renderer bug fixes, along with improved memory management
  * Updates for the Polyline feature format
  * API improvements and bug fixes on the Select, Extent and Snap interactions
  * Reprojection support for VectorTile layers
  * Full web worker support for Map, with an (Offscreen)Canvas as map target
  * Fixed cache and rendering for reprojected raster/image tile layers
  * Several updated and new examples, including a globe-like map with Equal Earth projection

## 3.9.3 - 2025-10-09

### Funders

* **[Cédégis](https://www.cedegis.fr/)**

### Added

* Support QGIS Project 3.44

### Fixed

* FeaturesTable - error when the features list is empty
* login key for other entrypoint
* Editing - Avoid checking valuerelation & relationreference fields as valid WFS typenames
* Media - Improve HTTP error codes when the user is not authenticated
* Regression: exporter disappear from layer information sub dock
* Provide default values for *very* old qgs files with missing attributes
* Edition - External Resource - Default root
* Editing - Upload widget preview and keep value

### Tests

* Bump some Github Actions
* e2e: move feature-toolbar from Cypress to Playwright
* GH Action - E2E QGIS - BLEEDING_EDGE with QGIS 3.44

## 3.9.2 - 2025-09-09

### Funders

* **[Le Grand Narbonne](https://www.legrandnarbonne.com/)**
* **[FM Projet](https://fmprojet.fr/)**

### Fixed

* Replace lizmapRepository static properties usage by Repository static properties
* Tooltip - Fix configured fields not used when HTML template is not defined
* Check URL when submitting AccessControlAllowOrigin in admin Form
* Fix locate by layer
* WFS GetFeature on PostGIS does not checked if the layer is published
* QGIS Project form_advanced: group visibility expression
* Zoom to point features at startup
* Fix version count
* Api - improve rights

### Changed

* Use rspack instead of webpack
* lizmap-features-table: Display a message when no features found
* PHP: Apply simplify if return bool from Rector

### Tests

* e2e Playwright checkJSON: explicite response not ok
* e2e: Porting Dataviz API form Cypress to Playwright
* e2e playwright tests popup: default buffer length
* e2e: enhancing tooltips tests
* fix restrict key for dumping database
* Improve docker containers startup
* Deprecate run-docker
* GH Action - Update PHP-Unit version for PHP 8.3 and 8.4
* e2e playwright: enhancing Overview and Treeview tests
* GH Action tests: add setup-node to get npm cache
* Pre-commit: Update ESLint and StyleLint to have the same version as in package.json
* e2e Playwright: enhancing group visibilities and filtered list
* e2e Playwright: enhancing page.openEditingFormWithLayer to wait for form
* refacto : move proxy echo feature to as guzzle middleware
* e2e Playwright: enhancing checking Getcapabilities URL in API

## 3.9.1 - 2025-07-15

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
