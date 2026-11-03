# Changelog Lizmap 3.10

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords: backend, tests, test, translation, funders, important
-->

## Unreleased

### Funders

* **[Le Grand Narbonne](https://www.legrandnarbonne.com/)**
* **[Conseil Départemental du Calvados](https://www.calvados.fr/)**
* **[WPD Onshore France](https://www.wpd.fr/)**
* **[SMICA](https://www.smica.fr/)**
* **[Communauté de communes du Val d'Argent](https://www.cc-valdargent.fr/)**
* **[EBERL ZivilTechniker](https://www.zt-eberl.at/)**

### Contributors

* @meyerlor
* @brown789
* @guenterw
* @geographit2

### Added

* Limit export formats per layer #7149
* Edition - Copy-paste geometry: display the QGIS feature display name in the feature picker #7210

### Fixed

* JS: using initial config API in attribute table legacy #7144
* JS: using initial config and other main Lizmap API in switcher layers #7150
* Tooltip - Do not apply the light popup table style inside the dark map tooltip, which made the text unreadable #7163
* JS selection tool : Selected features in visible layers and close message #7164
* JS: Enhancing isExportable method in selection tool module #7169
* PHP: Use sha1 to prevent long file/dir name in cache path #7140 **Needing cache to be rebuild**
* PHP: Action parameter value not passed to lizmap_get_data if empty (or 0) #7141
* Proxy - Increase client timeout for requests sent to QGIS Server #7174
* JS Atlas: provide primary-key values in option elements #7179
* PHP: New parser for layer datasources #7067
* PHP: logout after HTTP Basic authentication #7226
* Admin page : check if QGIS is reachable #7159
* PHP: GetFeatureInfo Error 500 on unkown layer #7242
* Edition - Make non editable date fields really non editable #7230
* Store and serve WebP tiles as WebP in the server tile cache #7232 fixes #7225
* PHP: request's headers has to be string - partial #7034
* PHP: Project in a US survey feet CRS (+units=us-ft) fails to load: division by zero in lizmapTiler::getTileMatrixSetList #7272 fixes #7262
* PHP: Keep decimal size and position of QGIS layout items #7285
* PHP: WMTS GetCapabilities: TopLeftCorner is rounded to 14 significant digits (differs from internal value) #7271 fixes #7264
* Print: request the overview map as defined in the layout #7286
* Print scales are multiplied by 3.2808 in a feet CRS #7298 fixes #7263
* PHP: editable fields could be null for old QGIS projects #7309
* JS: selection tool selects features of unchecked legend symbols #7250
* PHP: WMTS EPSG:4326 TileMatrix #7295
* Printing map in projection with axis orientation neu #7320 fixes #4862 and #6164
* PHP: Support PostgreSQL float arrays in edition forms with QGIS List widget #7209

### Security

* Return error if selection token is unknown or expired - #7131
* Docker image has been updated with PHP 8.3.36 to fix CVE-2026-109618 and CVE-2026-109619 in the PHP engine.
* html editor (ckeditor): strengthens the validation of uploaded images to prevent security issues caused by improper
  configuration of web servers and PHP (for example web configuration allowing foo.php.jpg to be sent to PHP, or allowing
  foo.jpg having php code into its content). #7155
* SQL filters - Use a new algorithm with a stronger validation method #7186
* sanitize HTML content before DOM insertion (XSS) #7306
* block SSRF via external WMS layer URLs in getFeatureInfo requests #7307

### Tests

* e2e: enhancing WFS requests by using toBeGeoJson #7132
* e2e: add method toHaveGeoJsonFeaturesLength to fixture expect response #7138
* e2e: selection tool enhancing #7160
* e2e: form filter enhancement #7211
* end2end: New tests to check WMS GetFeatureInfo requests responses #7238
* e2e: about wrong display expression in textwidget #7270
* PHP Unit: Enhancing Proxy::buildHeader for checking X-Lizmap-Override-Filter #7277
* e2e: enhancing export data - #7296
* Update Playwright to 1.63
* Update Chai to 6.3
* Update Dotenv to 18.0
* Update Mocha to 12.0
* Update Styleint to 17.16
* Update Undici to 8.11

### Backend

* Update sldreader to 2.1
* Update flatgeobuf to 4.5
* Update ol to 10.11
* Upgrade Jelix to version 1.8.28

## 3.10.0-rc.3 - 2026-09-09

### Funders

* **[Klein und Leber GbR](https://www.gisgeometer.de/)** with @meyerlor
* **[Faunalia](https://www.faunalia.eu/)** with @mind84
* **[Terre De Provence Agglomération](https://www.terredeprovence-agglo.com/)**
* **[SBE](https://www.sbe-engineering.com/)**

### Fixed

* Remove unnecessary div wrapper in bottom dock template
* Remove leftover Bootstrap tab classes from dataviz dock templates
* Restore the dataviz panel title in the right-dock
* Services URL to be compatible with some external clients
* Admin page listing projects: filter by repository / UI fix + inspection file tests https://github.com/3liz/lizmap-web-client/pull/6925
* Search: resolve relative nominatim URL against the page URL https://github.com/3liz/lizmap-web-client/pull/7008
* Quote column names in DataTables search filter expressions https://github.com/3liz/lizmap-web-client/pull/7018
* Undefined property readOnly in checkboxes_htmlbootstrap widget https://github.com/3liz/lizmap-web-client/pull/7017
* CSS - Improve form UI for Bootstrap 5 https://github.com/3liz/lizmap-web-client/pull/7014
* WFS/filter selection: translate all geometry operators to PostGIS https://github.com/3liz/lizmap-web-client/pull/6994
* PHP: preload GetCapabilities as JS done https://github.com/3liz/lizmap-web-client/pull/7031
* Honor external wms toggle https://github.com/3liz/lizmap-web-client/pull/7010
* Permalink basemap https://github.com/3liz/lizmap-web-client/pull/7019
* PHP qgisVectorLayerDatasource: password may contain single quotes https://github.com/3liz/lizmap-web-client/pull/7069
* PHP: Allow empty user agent for maptoken https://github.com/3liz/lizmap-web-client/pull/7076
* PHP: add PROPFIND method to test webdav server connection https://github.com/3liz/lizmap-web-client/pull/7099
* Popup - Compact table of children features: build the columns from all the displayed features, so features having more empty fields no longer produce rows with missing cells and a DataTables `Requested unknown parameter` warning
* Edition: read the parent feature again when creating a child feature https://github.com/3liz/lizmap-web-client/pull/7098
* Panoramax: update colors to 5.2.0 ones and reduce line width
* Add max zoom level constant for Panoramax MVT tile endpoint
* Update Panoramax min-width to prevent overflow and unwanted scrollbar
* Add pnx-widget-player to pnx-photo-viewer
* Edition: save the parent foreign key of a read-only child field https://github.com/3liz/lizmap-web-client/pull/7097
* WMTS Layer without TileMatrixSetLimits https://github.com/3liz/lizmap-web-client/pull/7120
* Action: Feature ID can be a big interger
* Action: feature button can be display in single feature popup

### Security

* Harden sanitizeGFIContent (hook leak, iframe handling) https://github.com/3liz/lizmap-web-client/pull/7047
* enforce access control on datatables endpoints https://github.com/3liz/lizmap-web-client/pull/7091

### Tests

* GA: Retry all curl errors when checking QGIS Server status in e2e workflow
* GA: Speed up e2e: shard Playwright tests across isolated jobs (~27min → ~13min)
* Prevent Node.js/dependency version drift from silently breaking CI https://github.com/3liz/lizmap-web-client/pull/7039
* Fix/e2e flaky tests https://github.com/3liz/lizmap-web-client/pull/7062
* e2e playwright fixture expect for resquest add toContainParametersInPostFormData method https://github.com/3liz/lizmap-web-client/pull/7081
* e2e lizmap-features-table to wait for and check displayExpression requests https://github.com/3liz/lizmap-web-client/pull/7081
* e2e: replace checkJson by response to be JSON https://github.com/3liz/lizmap-web-client/pull/7109

### Backend

* Update JS dependencies
* Update Jelix version 1.8.26
* Update jCommunity
* Update rspack to 2.2.1 https://github.com/3liz/lizmap-web-client/pull/7089
* Update @playwright/test dependency to version 1.62.x
* Update OpenLayers to 10.10.0
* Update Panoramax web viewer to 5.2.0

## 3.10.0-rc.2 - 2026-07-11

### Funders

* **[Terres d'Argentan](https://terresdargentan.fr/)**
* **[Faunalia](https://www.faunalia.eu/)** with @mind84
* **[Terre De Provence Agglomération](https://www.terredeprovence-agglo.com/)**

### Added

* Improve FTS search: ordering, result limits and 2-column display
* FTS search: live search while typing, debounced at 100ms
* Add panoramax photo-viewer
* Actions - Add the ability to send dynamic parameters from JavaScript

### Fixed

* Popup: restore children features-table font-size
* Prevent edition from removing hash information
* Edition - Persist dynamic default-value expressions on read-only fields (e.g. `$x`, `round($length, 2)`), which were evaluated but not saved
* Attribute table - Searchbuilder: key-value description to string
* UI: Prevent tooltip added via addDock function to be persistent
* Sync edition map and view map
* Add upgrade script for short link permalink
* UI: Migration from BS2 to BS5
* Geolocation bind heading and rotate map
* GetPrint file extension based on FORMAT parameter
* Popup true highlights
* Optimize the getMedia controller
* Log key for login should not contain folder

### Tests

* Fix permalink server management test

### Backend

* Update JS dependencies: dompurify, lit-html, mocha, stylelint, undici, ol, proj4, line-split and dotenv
* Fix phpstan errors
* Add simulateClick function to simulate a click on map
* Fix PHP: Since guzzlehttp/psr7 2.11: Passing a non-uppercase HTTP method is deprecated
* Handle ol-layer and ext-group visibility change events in Treeview
* Disable xdebug by default

## 3.10.0-rc.1 - 2026-05-28

### Funders

* **[Klein und Leber GbR](https://www.gisgeometer.de/)** with @meyerlor
* **[ETRA SpA Società benefit](https://www.etraspa.it/)** with Faunalia and @mind84
* **[Faunalia](https://www.faunalia.eu/)** with @mind84
* **[Terre De Provence Agglomération](https://www.terredeprovence-agglo.com/)**
* **[Conseil Départemental du Calvados](https://www.calvados.fr/)**
* **[JP Énergie Environnement](https://www.jpee.fr/)**

### Added

* UI - New Group by layer popup mode
* JS - Locate by layers loaded event
* Rely on attributeEditorRelation cardinality to display many to many relations
* Short link permalink functionality
* Edition - Support QGIS dynamic default-value expressions in edit forms, including geometry-based (`$x`, `$y`, `$area`, `$length`, `$geometry`) and field-referencing expressions (e.g. `"firstname" || ' ' || "lastname"`). Defaults are re-evaluated when the geometry is drawn/edited and when a referenced field changes, honoring QGIS's `applyOnUpdate` flag.
* UI - Auto-activate box selection when opening the selection tool
* MAP - Geolocation tracking orientation: rotate map view
* Action - add actionStarted event
* Add symbology to the permalink

### Security

* admin - sanitize file name of the uploaded image
* admin - escape html content into links on the user admin page
* lizmap - strengthen some requests processing
* media - don't disclose full path of unknown media in 404 page
* xmltools - do not load explicity entities when loading XML files

### Fixed

* Service - WFS PostGIS path SRSNAME handling and snap datum-shift error
* UI -close minidock added via JS addDock method
* Edition - digitization tab layout overflow and button alignment
* UI - Activate drag-drop popup tabs for both dock and map popup modes
* UI - Render QGIS CheckBox-widget fields as real checkboxes in popups
* UI - Consider bbox e filteredfeaturesid param in zoom to filtered feature extent
* PHP - QgisProject: Checking that getLayerById returns null
* Filter - JS request_params not yet defined for layer
* Map - WMS baselayers from QGIS layers now proxy through QGIS Server
* Popup - Place children features tables inside drag-and-drop relation placeholders
* Print - Respect cfg layout order in print panel
* GetPrint PDF with always text option
* Map - geometry type case mismatch in zoomToGeometryOrExtent function
* Action - reset ignored when called from actionResultReceived event
* Edition - copy-paste geometry

### Tests

* e2e snap edition: Enhance Snap panel functionalities

### Backend

* Docker - Upgrade Alpine to 3.22 and Php to 8.3
* Upgrade Jelix to version 1.8.24
* Upgrade jCommunity to version 1.4.5

## 3.10.0-beta.3 - 2026-04-20

### Funders

* **[Klein und Leber GbR](https://www.gisgeometer.de/)** with @meyerlor
* **[ETRA SpA Società benefit](https://www.etraspa.it/)** with Faunalia and @mind84
* **[Faunalia](https://www.faunalia.eu/)** with @mind84
* **[Valabre](https://www.valabre.com/)**
* **[Municipality of Mirandela](https://www.cm-mirandela.pt/)** with @NaturalGIS and @gioman

### Added

* Attribute table - Search builder: introduce support for subconditions
* UI - Using bootstrap close button for mini-dock
* Portfolio
* UI - Double clicking on layer legend propagates the checked state on symbology checkbox
* Attribute table - Select all filtered features server side

### Fixed

* Print - Enhance download by defining a FileDownloader class with Promise
* Admin - syntax error in lizmapConfig.ini.php into the list of domains for CORS
* Attribute table - sorting order for DataTables requests with PostgreSQL layer
* Admin - invalid repository path locked update
* UI - default atlas print icon not well displayed
* Edit - Remove capture attribute for image upload, use it in accept for ImageUpload control
* Commands - sqlite migration
* JS - dispatch closed dock event when a new one is opened
* UI - search clear button not visible and not clearing highlight

### Tests

* e2e: WMS single image, fix switch baselayer
* add copy-paste geometry end-to-end tests

### Backend

* CSS - Drop outdated rules about btn-stop and btn-print-clear


## 3.10.0-beta.2 - 2026-03-25

### Funders

* **[Klein und Leber GbR](https://www.gisgeometer.de/)** with @meyerlor
* **[Conseil Départemental du Gard](https://www.gard.fr/)**
* **[ETRA SpA Società benefit](https://www.etraspa.it/)** with Faunalia and @mind84
* **[Faunalia](https://www.faunalia.eu/)** with @mind84
* **[CC Bièvre Est](https://www.bievre-est.fr/)**

### Added

* Print - Atlas Print Button for Selected Features
* Print - PDF Filename from Atlas Expression
* Edition - Add geometry "copy&paste" functionality for digitizing workflow
* Tooltip - Add the capability to render layer features with QGIS Style (using SLD)
* Attribute table - Management of Value relation/Value Map fields in the new datatables Search Builder panel
* Edition - Rename uploaded attachments using field default value as filename stem
* Map - Layer opacity when "Load layers as single WMS request"
* Edition - Auto-activate snapping via snap_on_start config
* Print - Add mode to let user put a custom scale

### Tests

* e2e: PostgreSQL 18

### Backend

* Update rspack to 1.7 and remove webpack
* OpenLayers 10.8.x

## 3.10.0-beta.1 - 2026-02-11

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
