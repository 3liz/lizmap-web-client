# Changelog Lizmap 3.5

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords : backend, tests, test, translation, funders, important
-->

## Unreleased

## 3.5.16 - 2023-10-11

### Fixed

* Fix cascade layer's filter to use the parent WMS name instead of the layer name

## 3.5.15 - 2023-10-03

### Fixed

* Improve the display on mobile about the menu
* Improve logs displayed in the administration panel
* Fix loading of the editing form having a nullable checkbox
* Fix address search when results of the query to api-adresse.data.gouv.fr are empty
* Fix popup when opened from a Lizmap Atlas when the layer has a shortname
* Fix some issues about editing capabilities
* Improve the polygon filtering to get the computed polygon from the cache
* When the layer has an accent :
  * Fix the export of the layer
  * Fix filtered features disappear from map
* Fix some grammar
* Fix PHP notice about CRS variable

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

## 3.5.14 - 2023-07-31

### Important

* Minimum [Lizmap server plugin](https://github.com/3liz/qgis-lizmap-server-plugin) needed 2.8.0
* Minimum QGIS server needed 3.10

### Fixed

* Fix a visibility error for a QGIS preset/theme
* Warning about "qgsmtime" for an embedded layer
* Avoid a division by 0 when the scale was set to 0

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Backend

* Fix some PHP notice when running PHP 8, contribution from @Antoviscomi
* Upgrade Jelix to the latest version 1.6 and jCommunity to 1.3.20

### Funders

* Geolab.re

## 3.5.13 - 2023-05-30

### Important

* Minimum [Lizmap server plugin](https://github.com/3liz/qgis-lizmap-server-plugin) needed 2.7.1
* Minimum QGIS server needed 3.10

### Added

* Quick help to open an online color picker
* Add a reminder to check the QGIS server URL
* Add **uuid** in forms for relational values

### Fixed

* If the layer has a shortname :
  * fix the PDF print request
  * the user does a selection
* The `EXP_FILTER` URL parameter was not built for cascade and pivot layers
* Data filtering was broken on children layers
* Plots have to be refreshed when a filter is applied on the parent layer

## 3.5.12 - 2023-04-12

### Important

* Minimum [Lizmap server plugin](https://github.com/3liz/qgis-lizmap-server-plugin) needed 2.7.0
* Minimum QGIS server needed 3.10

### Fixed

* Add a check for requesting a QGIS server WMS GetFeatureInfo whe the layer name was not the same as in the filter
* Display the reverse geometry button only for linestrings and polygons, not for points
* UX - Transform `_` and `-` to a space when creating a repository
* Fix issue for retrieving a CSS file
* Fix a possible crash from OpenLayers 7 map when the map was dragged and released
* Remove a warning from Spatialite in the logs, which was not supported for a long time in the QGIS plugin

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

## 3.5.11 - 2023-02-28

### Important

* Minimum [Lizmap server plugin](https://github.com/3liz/qgis-lizmap-server-plugin) needed 1.3.1
* Minimum QGIS server needed 3.10

### Added

* Improve the wizard for the repository creation :
  * Better form with auto-completion
  * Some rights are now already checked by default when creating a new repository

### Fixed

* In a QGIS project, the primary key defined by QGIS desktop for a Postgres layer may not be a field.
* In a WFS request, no PostGIS features were returned if SRSNAME was different from the layer SRID
* When you click on the zoom to feature button, from the popup, the zoom/pan could be broken
* When you try to select features by point, no selection were performed
* Improve the error message when QGIS server and the Lizmap QGIS server plugin are not installed correctly

### Backend

* Update the way to check the validity about :
  * a geometry in a Well Known Text format
  * a proj4 string in tests

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Tests

* Add more tests about End2End integration to avoid regressions

## 3.5.10 - 2023-01-25

### Fixed

* Fix a bug about a hidden checkbox in a form
* Add XML header in the GetCapabilities request to avoid a message in the web browser console
* Fix an error during the upgrade

### Backend

* Update the minimum Lizmap server plugin to version 1.3.0

### Translations

* Update translated strings from the Transifex website

## 3.5.9 - 2023-01-23

### Changed

* Improve the user experience when creating a new repository in the administration interface

### Fixed

* Projects page: display projects title and buttons at bottom whatever the thumbnail's image size is
* Improve performance in the dataviz panel to avoid too many requests to the server
* Change some CSS about the digitizing toolbar
* No PostGIS features were returned if the map projection was different from the layer projection

### Backend

* Upgrade Jelix to version 1.6.39 to avoid an exception during installation

### Translations

* Update translated strings from the Transifex website

## 3.5.8 - 2022-12-08

### Fixed

* Editing - Fix the HTML form widget must use a WYSIWYG editor
* IP into the logs was not the real IP when a reverse proxy was used
* Fix an issue when reading a QGIS project with different capitalization in some values in the QGS files :
  `allownull` in the **RelationReference** widget for instance
* Scales displayed according to the base layer which is used, ticket https://github.com/3liz/lizmap-web-client/issues/2978
* Fix loading of projects having a space or several dot in their filename
* Docker: the `var/themes` content was lost when mounting a volume on this directory
* Docker: some PHP extensions (PDO) were missing
* Fix some GetFeatureInfo requests when it is in parent popup
* Dataviz - Fix wrong display for the horizontal bar charts
* Overview has to use projection and not QGIS Project projection

### Backend

* Upgrade Jelix, improve configuration of SMTP with no TLS
* Fix some issues when deployed with Docker

### Tests

* Upgrade Cypress to 4.2.0

## 3.5.7 - 2022-10-18

### Fixed

* Fix wrong host URL when the WMS is used in another GIS client such as QGIS
* Fix extent synchro between OL2 and OL6 which could cause the center of the map to wrongly move when zooming with mouse
* Update datatables to 1.12.1. This fixes the bad display of sort images in Firefox

### Tests

* Improve some automatic testing with Cypress

### Translations

* Update from Transifex about translated strings

## 3.5.6 - 2022-09-20

### Added

* New configuration to set up the Content Security Policy header

### Fixed

* Better management of paths for Lizmap repositories
* Form filter - Use OR between the uniques values of the same field
* Fix some requests to QGIS Server
* Fix some minor issues when reading the JSON file about editing capabilities
* Improve the settings about the mail server
* Improve the error message when the Lizmap server plugin is not found
* Fix button to toggle compact/explode table view in popups. Also each button only toggle its own children popup group
* Fixed PHP syntax error in the dataviz module, contribution from @RobiFag
* Fix one issue with PHP8

### Translations

* Update from Transifex about translated strings

### Backend

* Update Jelix to version 1.6.38
* Update OpenLayers to 6.15.1

### Tests

* Add more tests about Cypress

## 3.5.5 - 2022-07-21

### Fixed

* fix some issues into the Docker image of lizmap
* fixed the SQL query produced from the form filtering

## 3.5.4 - 2022-07-01

### Added

* New `-dry-run` for the cache generation to see how many tiles might be generated

### Changed

* Improve the table in the right's management panel when having a dozen of groups
* Minify legacy JS files to save 400Ko in best case. This reduces first page load
* Add tolerance for clicking on mobile to get the popup
* Do not build the attribute table when refreshing attribute table

### Fixed

* Fix the download of files (layer export, PDF) depending on the web-browser (and its version)
* Selected theme can be selected again without selecting another one before
* The style was not updated when the layer has a shortname and was included in a QGIS theme
* CLI tool about cache : fix an issue about the `-bbox` parameter out of the tile matrix limit
* Provide the dataviz button in the left menu only there is at least one non filtered dataviz
* Children popups were not displayed when layer had shortname
* Javascript error when clicking on an atlas link when no feature ID was found
* Fix infinite HTTP loop when the user hasn't any access to the default project
* Fix the attribute table order defined in QGIS desktop
* Fix the "zoom to layer" button when the layer is in EPSG:4326 (Funded by Geocobet)
* When a layer has a shortname, fix one issue about dataviz & relations and fix the children popup wasn't displayed
* Dataviz & relations - Fix possible bug when layer has a shortname

### Backend

* Update Jelix to version 1.6.38-pre
* Update PHP CS Fixer to 3.8.0
* Update the code to support PHP 8.1

### Translations

* Update from Transifex about translated strings

### Tests

* Update end-to-end Cypress tests about continuous integration
* Use the new command line `docker compose`

## 3.5.3 - 2022-04-29

### Changed

* Restore the previous behavior from Lizmap 3.4 about the overview map
  Use the new parameter in the Lizmap QGIS plugin to have a dynamic scale

### Fixed

* Allow a project thumbnail with capital letters in the extension
* Open a PDF in a new tab when possible on Firefox instead of the internal viewer
* Fix about dataviz panel : plot order and custom plot layout, contribution from @tethysgeco
* Fix some exports issues when there is a selection
* Fix an issue about editing capabilities when using a geometry involved in a QGIS expression
* Fix about some WFS requests about vector data
* Fix about QGIS 3.22 when a group has a shortname
* Fix about QGIS 3.22 with the "Show feature count"
* Fix about geometries in WKT when it's multipart
* Fix the `lizmap_search` feature

### Translations

* Update from Transifex about translated strings

### Backend

* Upgrade our coding standards by fixing a lot of warnings from PHPStan
* Update of Jelix 1.6

### Tests

* Improve the testing infrastructure
* Upgrade to Cypress 9.5.3
* Upgrade PHPStan

## 3.5.2 - 2022-03-24

### Fixed

- Improve the image dialog upload size on tiny screens
- Review the error message about the HTTP code from QGIS Server
- Fix editing feature having an ID equal to 0
- Fix when an attribute name is starting with a capital name
- Do not show custom labels when printing from a popup about `lizmap_user` and `lizmap_user_groups`
- Fix: HTTP Status Messages for lizmap service responses
- Check version attribute in WxS request in XML to return error
- Fix: GetProj4 request to get proj4 CRS definition from QGIS project
- Speed up GetProjectConfig request by using cache for QGIS Server plugins data
- Fix typo in English sentences
- Do not send private user group to QGIS Server for access control
- Fix regression in form - empty value is added to required menu list field
- Check Version parameters in WxS request to return error
- Fix the GetProjectConfig mime-type as application/json

### Added

- New method in `AppContext` to get user public groups ID
- Convert QGis XML Option value based on type attribute
- Add a revision parameter on assets url for cache

### Backend

- Upgrade jelix to 1.6.36

### Tests

- e2e: Add Lizmap Service requests tests
- e2e: Update Cypress to 9.5.0

## 3.5.1 - 2022-02-08

### Added

- Add new Ukrainian and Romanian languages
- A new panel in the administration interface can display QGIS Server information such version and plugins.
  - This information can be retrieved as well in the QGIS Desktop plugin if the administrator login is provided

### Fixed

- Fix the value relation widget with multiple text values on feature modification
- Fix a regression in the ValueMap widget config parsing
- Fix the link of selected features between a parent and a child in the attribute table
- Fix a warning into QgisProject with expanded-group-node
- Update IGN URL searching address, the old one will no longer be usable as of February 1, 2022
- Fix snapping missing when editing existing feature
- Fix geom can be created on existing feature without geometry
- Fix some account management issues with some other authentication modules
- Fix the backup script about third-party modules such as MapBuilder and AltiProfil
- Fix a regression during the init of relation references into forms
- Fix a regression during the loading of embedded projects
- Fix editing when a geom can be created on an existing feature without a geometry on update only
- Fix wrong file storage path for images with the `media` folder
- Fix the landing page using modern CSS - Remove JS resizing project thumbnails and use CSS Grid
- Fix the mime type for SVG files. It should be `image/svg+xml`
- Fix the layer export when :
  - a selection or a filter is active
  - the layer is not spatial
  - the layer has parenthesis inside its name
- Update Lizmap locales

## 3.5.0 - 2021-12-15

### Added

- User experience
  - Reverse geometry button: when editing a line or polygon feature, you can reverse vertices order.
  - Display message when a PDF print starts
- Translation
  - Add Romanian localization PlotLy file for the dataviz panel (contribution from @ygorigor)
- Data provider
  - Allow PostgreSQL geography type (contribution from @flobz)
  - Allow to use the new Lizmap "form" from the QGIS Desktop plugin
- Javascript
  - Allow use of JS modules (ES6) with docks, by indicating the `type` attribute of `<script>` to `lizmapMapDockItem`.
- Editing
  - New feature `Filter data with polygon` allowing to filter the layers data spatially by testing the intersection of the features against a chosen polygon layer. The filtering polygons are selected based on a field containing a list of user groups.
  - Enhanced the support of image upload into feature forms: an image editor allows you to crop or to rotate a selected image,
    and the image is resized if its width or height is higher than a length you can specify into the Lizmap configuration.

### Changed

- Speed up map page loading.
- Overview map now zoom in/out with main map. Replace OpenLayers 2 overview map by the OpenLayers 6 one.
- Allow new OpenLayers Map to be used on top of OL2 one
- Update OpenLayers to 6.6.1
- Update jQuery-ui to 1.12.1
- Form filter: prepare the possibility to select more than one items in the comboboxes.
- CSS: make background header easier to override with custom CSS
- Action popup module has been improved with new options: confirm property, display a message if configured, raise a JS event with the returned result.
- Update URL for IGN basemap

### Fixed

- External WMS layers : respect the image format of the source WMS layer.
  The format specified in the Lizmap configuration is not used.
- Print
  - If the map has external base layers such as OpenStreetMap, and is then displayed in Pseudo Mercator (EPSG:3857),
  the exported map is now printed in the QGIS project projection (e.g. EPSG:2154) to avoid wrong scale.
  You can now use your ruler in the printed paper and trust your measure.
- Editing
  - In case of more than one editable layers, when there is a filter by login (or by polygon) activated,
  some of the popup items could miss the pencil button to open the editing form. Corrected by requesting
  the editable features for all the editable layers of the displayed popup items, and not only the first.
  - When using a text field with a `value relation` widget, configured with `allow multiple` on, Lizmap could not
  always set the values for the generated checkboxes when modifying an existing feature. We fix this bug
  by removing the additionnal double-quotes that QGIS sometimes adds in the array of values
  (ex: `{"one_value", "second_value"}`)
  - Lizmap user and groups was not forwarded to the QGIS Server backend. It's now possible to use
   `@lizmap_user` and `@lizmap_user_groups` in a QGIS Expression in an editing form.
- Selection: improve the export tool to allow bigger selections
  - use the selection token instead of a list of feature identifiers
  - internally use POST instead of GET requests to query data from QGIS Server
- Before the button export to ODS was always visible. The button is now shown only if available

### New JS events

- `lizmappopupallchildrendisplayed` is raised when all children popups have been displayed
- `actionResultReceived` is raised when a popup action result is returned

### Backend

- Major refactoring of Lizmap source code done by @alagroy-42
- Keep lizmapProxy and lizmapOGCRequest classes for modules compatibility
- Upgrade Jelix to 1.6.35
- Improve testings using Docker, Cypress, PHPUnit etc

## 3.5.0-rc.4 - 2021-11-24

* Release candidate

## 3.5.0-rc.3 - 2021-10-19

* Release candidate

## 3.5.0-rc.2 - 2021-09-14

* Release candidate

## 3.5.0-rc.1 - 2021-06-21

* Release candidate
