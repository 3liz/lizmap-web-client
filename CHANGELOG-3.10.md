# Changelog Lizmap 3.10

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords: backend, tests, test, translation, funders, important
-->

## Unreleased

### Funders

* **[Terre De Provence Agglomération](https://www.terredeprovence-agglo.com/)**
* **[Klein und Leber GbR](https://www.gisgeometer.de/)** with @meyerlor

### Added

* Can dislay geoloc orientation arrow
* DXF export
* Can exclude basemaps from single WMS layer option
* Multi atlas printing for selection
* Geometry "copy&paste" functionality for digitizing workflow
* JS: Add "subscribe" method to EventDispatcher class and to lizMap object
* Use background color defned in QGIS for tab in edition form

## Changed

* e2e: definitly remove cypress tests

### Tests

* e2e: move GetCapabilities requests from cypress to Playwright
* e2e: move GetProjectConfig requests from cypress to Playwright
* e2e: move service requests from cypress to Playwright
* Bump Redis to 8 in docker compose
* e2e: location search enhancement
* e2e: replace expectParametersToContain by expectRequest
* e2e: remove gotomap
* e2e: time manager enhancing and modernization
* e2e: Move external_wms_layer from Cypress to Playwright
* e2e: wrap the Buffer<ArrayBufferLike> into an Uint8Array for writeFile
* e2e: Move key_value_mapping from Cypress to Playwright
* e2e: Move action tests form Cypress to Playwright
* e2e: Move export data tests from Cypress to Playwright
* e2e: well unroute
* e2e: Modernize base_layers tests
* e2e: revival of draw import tests
* e2e: Enhancing Should select / filter / refresh with map interaction
* e2e: re-import the same file to draw on map

### API

* JS - constant MEDIA_REGEX
* JS - Defined image symbology for layer
* PHP - Enhancing getBooleanOption by using filter_var

### Backend

* Upgrade JavaScript dependancies
* QGIS Server plugins repository: using qgis-plugins.3liz.org

## 3.10.0-alpha.1 - 2025-12-30

### Funders

* **[Digi-Studio](https://digi-stud.io/)**

### Important

* PHP 8.2 minimum is required

### Added

* PHP: Implementing a Psr-3 Logger upper \jLog::log
* Preload link for CSS and JS files, and map's resources

### Changed

* Migrate datatables from client to server side
* JS: Replace proj4js by proj4rs WASM

### Removed

* PHP: drop `lizmapRepository` class, use `\Lizmap\Project\Repository` instead
* PHP: drop `lizmapProject` class, use `\Lizmap\Project\Project` instead
* PHP: drop `lizmapOGCRequest` class, use `\Lizmap\Request\OGCRequest`
* PHP: drop `lizmapProxy` class, use `\Lizmap\Request\Proxy`
* PHP: drop `qgisServer` class, useless since 3.7
* PHP: drop `qgisProject` class, useless since 3.5

### Deprecated

* PHP: deprecate `lizmapWkt` class, use `\Lizmap\App\WktTools` instead

### Backend

* Raise PHP to version 8.2
* Raise docker from Alpine 17 to 21
* Update to Bootstrap 5
* CI: copy .module.wasm files whatever their names are
