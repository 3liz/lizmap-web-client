# Changelog Lizmap 3.6

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords : backend, tests, test, translation, funders, important
-->

## Unreleased

## 3.6.14 - 2024-07-04

### Funders

* *[WPD](https://www.wpd.fr/)*
* *[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)*

### Changed

* Admin - Add legend about warning icon in project table

### Fixed

* Fix printing of external base-layer
* Improve debug about failing PDF print, especially when parenthesis are in the layer name
* Fix cross-site scripting issue with the `theme` parameter

## 3.6.13 - 2024-05-27

### Funders

* *[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)*

### Changed

* Check for the Desktop plugin version first instead of showing possible warnings from the plugin

### Fixed

* Fix issue in Dutch language
* Fix children popup in compact table

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

## 3.6.12 - 2024-05-07

### Fixed

* Fix some XSS issues into features forms

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

## 3.6.11 - 2024-03-18

### Added

* Show warnings if the project has some, when connected as an admin

### Changed

* Update the table of QGIS projects in the administration panel
* Update limit to 500 000 for the row limit in the attribute table tool

### Fixed

* Fix the message "Feature not editable" if the user has the right
* Fix issue about rights for anonymous users
* Fix language for compact table in a children popup

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Backend

* Enhancing the way Lizmap build Etag and add an Etag to `GetKeyValueConfig`
* Upgrade Jelix to version 1.8.8

### Funders

* *[PNR Haut-Jura](https://www.parc-haut-jura.fr)*
* *[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)*

## 3.6.10 - 2024-02-07

### Fixed

* Too many embedded layers cause PHP to hit `max_execution_time`, contributions from @mind84
* Fix search result with IGN
* Register projections from lizProj4 if unknown
* Fix layer group visible only and location
* Popup from the attribute table, use the correct content for the popup
* Fixing WMTS capabilities for cached layers with a shortname defined

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Funders

* [Faunalia](https://www.faunalia.eu/fr)
* [Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)
* [Agence de l'eau Rhône Méditerranée Corse](https://www.eaurmc.fr/)

## 3.6.9 - 2024-01-16

### Update

* Update URL from the French map provider IGN about geocoding service

### Fixed

* Fix support of SSL PostgreSQL connection in PostgreSQL layers
* Fix on the Feature toolbar :
  * zoom to the feature
  * center map on the feature

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Backend

* Upgrade Jelix to version 1.8.6

## 3.6.8 - 2023-11-28

### Update

* Update URL from the French map provider IGN

### Fixed

* For an "embedded layer", both contributions from @mind84:
  * Fix loading relations
  * Fix typo about wrong key used for caching
* Do not block the loading of the map if the layer name is wrong in a permalink
* Fix error when executing the command `jcommunity~user:create` and
  when the "multiauth" module is installed
* Fix the auto-login feature ("remember me" checkbox)
  The encryption key was not upgraded during upgrade from Lizmap 3.5 to 3.6
* Fix a potential regression in the password reset feature
* Fix getting the table for sub-queries with escaped double-quotes
* Form filter - Date range: add a day to the max values when requesting data
* In the Lizmap atlas, fix the popup when the name has an accent or a space

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Backend

* Upgrade Jelix to version 1.8.4
* Update some PHP packages

### Funders

* [Faunalia](https://www.faunalia.eu/fr)
* [CIRAD](https://www.cirad.fr/)

## 3.6.7 - 2023-10-12

### Added

* Add a message about exporting data is in on progress

### Fixed

* When creating/editing a geometry, check the spatial constraint
* Fix an error about GetFeatureInfo and GetFilterToken requests to QGIS server
* Fix cascade layer's filter to use the parent WMS name instead of the layer name
* A locale for the account registration was missing, generating a 500 error

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Funders

* [WPD](https://www.wpd.fr/)
* [Calvados province in France](https://www.calvados.fr/)
* [Vaucluse province in France](https://www.vaucluse.fr/)

## 3.6.6 - 2023-10-04

### Added

* New password security checker

### Fixed

* Improve the display on mobile about the menu
* Improve logs displayed in the administration panel
* Fix loading of the editing form having a nullable checkbox
* Fix address search when results of the query to api-adresse.data.gouv.fr are empty
* Fix popup when opened from a Lizmap Atlas when the layer has a shortname
* When the layer has an accent :
  * Fix the export of the layer
  * Fix filtered features disappear from map* Do not display child plot in popup when there is no data
* Fix some grammar
* Allow import/export in selection tool
* Fix 500 error in the administration panel when the "Lizmap server" plugin was not found
* Fix increase the login length in the database in order to use email as logins
* The minimal length of password is now 12 characters to improve the security
* Fix PHP notice about CRS variable

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Funders

* [Faunalia](https://www.faunalia.eu/fr)

## 3.6.5 - 2023-08-08

### Added

* Support for the QGIS widget "number": min, max and step are supported from QGIS desktop

### Fixed

* Use layer name as option label for locate-by-layer selector in mobile
* Support for [OpenTopoMap](https://opentopomap.org/)
* Editing & Filter - Fix editing right access from popup
* Fix a visibility error for a QGIS preset/theme
* Warning about "qgsmtime" for an embedded layer
* Improve the checklist when installing Lizmap Web Client about QGIS Server

### Changed

* Better backend log management, especially when updating a layer has failed
* Improve the QGIS project panel in the administration :
  * Add some colours in the legend
  * Improve the display, better UX

### Backend

* Some JavaScript cleaning
* Fix some PHP notice when running PHP 8, contribution from @Antoviscomi

### Translations

* Improve an English sentence, contribution from @gioman
* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Tests

* Add PHP 8.2 to the matrix for PHP tests
* Improvements to the Playwright stack

### Funders

* [Geolab.re](https://geolab.re/)

## 3.6.4 - 2023-05-30

### Added

* Quick help to open an online color picker
* Add a reminder to check the QGIS server URL
* Add **uuid** in forms for relational values

### Fixed

* Display zoom and center buttons if "Add geometry to feature response" is checked
* Fix the export from the popup feature toolbar
* Data filtering was broken on children layers
* Plots have to be refreshed when a filter is applied on the parent layer
* Issues in rights management when setting some specific rights to "forbidden"

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Tests

* Better test environment for automatic testing with QGIS server

### Backend

* Include the latest updates from Jelix 1.8.1

## 3.6.3 - 2023-04-17

### Added

* Display feature geometries defined in map parameter

### Changed

* Update some CLI tools : `wmts:capabilities`, `wmts:seed` and `wmts:clean`

### Fixed

* Add a check for requesting a QGIS server WMS GetFeatureInfo whe the layer name was not the same as in the filter
* Display the reverse geometry button only for linestrings and polygons, not for points
* UX - Transform `_` and `-` to a space when creating a repository
* Improve QGIS server detection and debugging when the Lizmap server plugin is not installed
* Increase the timeout when fetching data for a layer export with WfsOutputExtension
* Fix issue for retrieving a CSS file
* Fix a possible crash from OpenLayers 7 map when the map was dragged and released
* Fix installation of the multiauth module. Be sure to install the version 1.2.1 or higher, of the module
* Remove a warning from Spatialite in the logs, which was not supported for a long time in the QGIS plugin
* Fix display of key/value when the layer is not published as WFS in the form filter and the attribute table panel
* Check if the centroid is used for the filtering by polygon when editing the layer
* If the layer has a shortname :
  * fix the PDF print request
  * the user does a selection
* The `EXP_FILTER` URL parameter was not built for cascade and pivot layers

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Backend

* Include the latest updates from Jelix 1.8
* Some bugfix about the docker image

## 3.6.2 - 2023-02-28

### Added

* Improve the wizard for the repository creation :
  * Better form with auto-completion
  * Some rights are now already checked by default when creating a new repository
* Add some explanations about the rules and colours in the administration project page
* Script to make it easier to migrate from Lizmap Web Client 3.5

### Fixed

* Fix no display of table with value relation fields when there is no layer name
* Fix a bug about a hidden checkbox in a form
* In a QGIS project, the primary key defined by QGIS desktop for a Postgres layer may not be a field.
* Add XML header in the GetCapabilities request to avoid a message in the web browser console
* Change the color if the highlighted selected line in the project table
* In a WFS request, no PostGIS features were returned if SRSNAME was different from the layer SRID
* When you click on the zoom to feature button, from the popup or the attribute table tool, the zoom/pan could be broken
* When you try to select features with a point, no selection were performed
* In the administration panel, allow to edit the name for the sender email

### Changed

* Use streamed response to improve performance on the server
* Update some command line utilities

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Backend

* Update the way to check the validity about :
  * a geometry in a Well Known Text format
  * a proj4 string in tests
* Update OpenLayers to 7.2.2

### Tests

* Add more tests about End2End integration to avoid regressions

## 3.6.1 - 2023-01-23

### Added

* Webp and AVIF file formats can be used for the default image of a project. It speeds up first page load by reducing bandwidth
* New API to fetch the dataviz configuration for a given plot, useful in the QGIS Desktop plugin to have a preview
* New API to access a lot of metadata from the Lizmap Web Client server such as groups, directories etc. It's useful in the QGIS Desktop plugin as well.
* A lot of new rights in the administration panel have been added to have a **publisher** group. It allows you to better distinguish between administrators and QGIS publishers.

### Changed

* Improve the user experience when creating a new repository in the administration interface

### Fixed

* Projects page: display projects title and buttons at bottom whatever the thumbnail's image size is
* Improve performance in the dataviz panel to avoid too many requests to the server
* Change some CSS about the digitizing toolbar
* No PostGIS features were returned if the map projection was different from the layer projection
* Form filter - Add a max height with a scroll for the unique values checkboxes container
* Fix some deployments with Docker, contribution from @u-cav
* Fix an error about postgresql connection closing when 2 identical pgsql profile are set into profiles.ini.php
* Fix various internal issues

### Backend

* Upgrade Jelix to version 1.8.0 to avoid errors
  * during installation
  * if 2 identical pgsql profiles set in `profiles.ini.php`
* Bump minimum version Lizmap QGIS server plugin to 1.2.2

### Translations

* Update translated strings from the Transifex website

## 3.6.0 - 2022-12-09

### Added

* **Base maps**: New https://opentopomap.org as basemap, it's available in the QGIS desktop plugin
* **Popup**: New option in the desktop plugin to allow the download or not of the feature
* **Maps**: Use **values** instead of **keys** in the layer attribute table and Lizmap form filter tool.
  It works for fields configured with the widgets "Value map", "Value relation", "Relation reference"
  (if the layer which is the source of the field widget content is published in WFS).
* **Maps**: take care of `filter` and `popup` parameters from the URL when viewing a map
  in order to zoom directly to the defined features and to display popups
* **Maps**: When an error appeared during the load of a project, the user interface
  has been improved to show a better message, instead of the unreadable "SERVICE NON DISPONIBLE" error message.
  * Note that an error in a custom Javascript script will raise this new error message as well now
* **Form filter**: If the filtered layer is related to other layers with a "one to many" relations, the child
  features of the related layers will also be filtered when the parent layer is filtered with the form
  (cascading filter). The parent filtered layer and the related layers should be added
  in the attribute table tool to activate this behavior.
* **Layer legend**: Enable auto display the legend image for a layer at startup
* **Edition**: New button to restart drawing geometry - Provide the capability to update geometry with GPS and form coordinates
* **Before opening a QGIS project**, Lizmap is now checking that :
  * Lizmap QGIS server plugin is running with a minimum required version
  * QGIS server version is running with at least **3.10**
  * These two versions are hardcoded in the source code and updated when a new version of Lizmap is released
* Lizmap Web Client won't display **old CFG** file according to the Lizmap Web Client target version defined in QGIS Desktop
  * For this release, the minimum version of the CFG file is set to **Lizmap Web Client 3.3 included**.
  * These projects will still be visible in the administration panel to let you know that you need to upgrade them
  * Be careful to the combobox selector in the QGIS plugin.
  * The minimum version required will be raised and advertised for each release of a major version of Lizmap Web Client.
* In the administration panel, server information tab :
  * Display the URL to use in the QGIS desktop plugin
  * Display the version of Py-QGIS-Server if it's used
* In the administration panel, repository management :
  * New configuration for CORS headers per Lizmap repository
* In the administration panel, **new page** showing the **list of published projects** in a dynamic table :
  * **Visible properties**: `repository`, project `name`, `modification date`, `projection`,
    `layer count`, `qgis desktop version`, `lizmap plugin version`, `authorized groups`
  * The background of some properties are **colored based on the values**
    to help the admin see what must be corrected:
    * QGIS version:
      * `lightyellow` if the version is old compared to the QGIS Server (minor version difference > 6)
      * `lightcoral` if the QGIS desktop version is above the installed QGIS Server version
    * Layer count:
      * `lightyellow` if above 100,
      * `lightcoral` if above 200
    * Projection:
      * `lightcoral` if it is a user defined projection
  * **Tooltips** have been added to show more information on hover
    * Repository: shows the label
    * Project name: shows the project `title` and `abstract`
    * QGIS version, layer count and projection: shows a help message if an issue has been detected
  * The admin user will be able to **sort the projects* by clicking on the columns header
    or **filter the list** by typing the searched value in the top text input.
  * A right **sidebar** shows the project information when a line is selected: project image, title, abstract.
  * More project properties are shown if the proprietary tool `qgis-project-validator` has been used to
    generate the expected JSON and LOG files for each project:
    * **Invalid layers** count and list of layer names with the `datasource` visible in the tooltip
    * **Memory used** to load the project (in Mo)
    * **Loading time** of the project (in seconds)
    * **QGIS Log file** written when loading the project
* In the administration panel, new interface to manage rights, easier to use, especially when there are many groups
* New configuration to set up the Content Security Policy header (CSP)
* New `-dry-run` for the cache generation to see how many tiles might be generated

### Fixed

* Avoid a request to QGIS Server without a `MAP` parameter when the Lizmap server response is OK
* Editing - Fix the HTML form widget must use a WYSIWYG editor
* IP into the logs was not the real IP when a reverse proxy was used
* Fix an issue when reading a QGIS project with different capitalization in some values in the QGS files :
  `allownull` in the RelationReference widget for instance
* Scales displayed according to the base layer which is used, ticket https://github.com/3liz/lizmap-web-client/issues/2978
* Dataviz: fix fetching WFS data from file
* QGIS project filename can now have multiple dots and spaces in its name
* Fix the download of files (layer export, PDF) depending on the web-browser (and its version)
* Selected theme can be selected again without selecting another one before
* The style was not updated when the layer has a shortname and was included in a QGIS theme
* CLI tool about cache : fix an issue about the `-bbox` parameter out of the tile matrix limit
* Provide the dataviz button in the left menu only there is at least one non filtered dataviz
* Javascript error when clicking on an atlas link when no feature ID was found
* Fix infinite HTTP loop when the user hasn't any access to the default project
* Fix the attribute table order defined in QGIS desktop
* Fix the "zoom to layer" button when the layer is in EPSG:4326 (Funded by Geocobet)
* When a layer has a shortname, fix one issue about dataviz & relations and fix the children popup wasn't displayed
* Dataviz & relations - Fix possible bug when layer has a shortname

### Changed

* Update to DataTables 1.12.1, jQuery, jQueryUI, CKEditor etc
* Improve the table in the right's management panel when having a dozen of groups
* Add tolerance for clicking on mobile to get the popup
* Do not build the attribute table when refreshing attribute table
* The option "Use layer IDs" in the project properties is not possible anymore

### Backend

* Upgrade the Jelix framework to 1.8.x
* Update PHP CS Fixer to 3.8.0
* Update to NodeJS 16
* Fix some issues when deployed with Docker
* Support from PHP 7.4 to 8.1
* Lizmap QGIS server plugin has been split in two different plugins : server and desktop.
  * **Install only** the correct one on your environment
* Internal PHP code
  * New method in `AppContext` to get user public groups id
  * Convert QGIS XML `Option` value based on type attribute
  * Add a revision parameter on assets url for cache
  * Add ETag HTTP header to GetCapabilities, GetProjectConfig, GetProj4 and WMTS GetTile responses
  * New class `\Lizmap\Request\OGCResponse`

### Translations

* Update translated strings from Transifex
* New Norwegian language 🇳🇴

### Tests

* End2End: Add Lizmap Service requests tests
* End2End: Update Cypress to 9.5.0
* Use the new command line `docker compose`

### Funders

* [Communauté d'agglomération du Grand Narbonne](https://www.legrandnarbonne.com/)
* [Conseil Départemental du Gard](https://www.gard.fr)
* [Les Portes du Soleil](https://www.portesdusoleil.com/)
* [Natur&ëmwelt](https://www.naturemwelt.lu/)
* [Syndicat Départemental d'Énergie et d'Équipement 48](https://sdee-lozere.fr/)
* [Valabre](https://www.valabre.com/)

## 3.6.0-rc.2 - 2022-11-10

### Fixed

* Fix the button to copy to clip board in the administration interface
* Avoid a request to QGIS Server without a `MAP` parameter when the Lizmap server response is OK
* Editing - Fix the HTML form widget must use a WYSIWYG editor
* IP into the logs was not the real IP when a reverse proxy was used
* Fix an issue when reading a QGIS project with different capitalization in some values in the QGS files :
  `allownull` in the RelationReference widget for instance
* Scales displayed according to the base layer which is used, ticket https://github.com/3liz/lizmap-web-client/issues/2978
* Dataviz: fix fetching WFS data from file
* QGIS project filename can now have multiple dots and spaces in its name

### Changed

* Display links to QGIS and Py-QGIS-Server releases
* Update to DataTables 1.12.1, jQuery, jQueryUI, CKEditor etc

### Translations

* Update from Transifex about translated strings

### Backend

* Fix some issues when deployed with Docker

### Tests

* Upgrade Cypress to 4.2.0

## 3.6.0-rc.1 - 2022-10-10

### Added

* Display the URL to use in the QGIS desktop plugin in the administration panel
* Before opening a QGIS project, Lizmap is now checking that :
  * Lizmap QGIS server plugin is running with a minimum required version
  * QGIS server version is running with at least 3.10
  * These two versions are hardcoded in the source code and updated when a new version of Lizmap is released
* Lizmap Web Client won't display old CFG file according to the Lizmap Web Client target version defined in QGIS Desktop
  * These projects will still be visible in the administration panel to let you know that you need to upgrade them
  * Be careful to the combobox selector in the QGIS plugin.
  * The minimum version required will be raised and advertised for each release of a major version of Lizmap Web Client.
* Display the version of Py-QGIS-Server in the administration panel if it's used
* New configuration to set up the Content Security Policy header

### Fixed

* Fix button to toggle compact/explode table view in popups. Also, each button only toggle its own children popup group
* Better management of paths for Lizmap repositories
* Fixed PHP syntax error in the dataviz module, contribution from @RobiFag
* Fix some requests to QGIS Server
* Fix an issue with PHP 8 when editing data
* Fix an issue about group ID when restricting a project to a few groups
* Fix a regression in form
* Fix some access control permissions in the editing toolbar (new, remove, edit features)
* Fix extent synchro between OL2 and OL6
* Fix a PHP error when displaying the administration panel when a project was removed

### Translations

* Update from Transifex about translated strings

### Backend

* Upgrade the Jelix framework to 1.8
* Fix some configurations in the docker image

### Tests

* Add more tests about Cypress

## 3.6.0-beta.2 - 2022-07-29

### Fixed

* Fix configuration form of email: sender email was always required.
  Add also more explanations to fill correctly email parameters.
* Fix display of the new rights interface
* Fix display of admin forms for themes & landing page
* Fix some compatibility issue with some php packages of dependencies with PHP 7.4
* Fix some potential issues about rights on some temporary files

## 3.6.0-beta.1 - 2022-07-27

### Added

* **Base maps**: New https://opentopomap.org as basemap, it's available in the QGIS desktop plugin
* **Popup**: New option in the desktop plugin to allow the download or not of the feature
* **Maps**: Use values instead of keys in the layer attribute table and Lizmap form filter tool.
  It works for fields configured with the widgets "Value map", "Value relation", "Relation reference"
  (if the layer which is the source of the field widget content is published in WFS).
* **Maps**: take care of `filter` and `popup` parameters from the URL when viewing a map
  in order to zoom directly to the defined features and to display popups
* **Maps**: When an error appeared during the load of a project, the user interface
  has been improved to show a better message, instead of the unreadable "SERVICE NON DISPONIBLE" error message.
* **Form filter**: If the filtered layer is related to other layers with a "one to many" relations, the child
  features of the related layers will also be filtered when the parent layer is filtered with the form
  (cascading filter). The parent filtered layer and the related layers should be added
  in the attribute table tool to activate this behavior.
* **Administration**: add a new page in the admin panel showing the **list of published projects**
  in a dynamic table.
  * **Visible properties**: `repository`, project `name`, `modification date`, `projection`,
    `layer count`, `qgis desktop version`, `lizmap plugin version`, `authorized groups`
  * The background of some properties are **colored based on the values**
    to help the admin see what must be corrected:
    * QGIS version:
      * `lightyellow` if the version is old compared to the QGIS Server (minor version difference > 6)
      * `lightcoral` if the QGIS desktop version is above the installed QGIS Server version
    * Layer count:
      * `lightyellow` if above 100,
      * `lightcoral` if above 200
    * Projection:
      * `lightcoral` if it is a user defined projection
  * **Tooltips** have been added to show more information on hover
    * Repository: shows the label
    * Project name: shows the project `title` and `abstract`
    * QGIS version, layer count and projection: shows a help message if an issue has been detected
  * The admin user will be able to **sort the projects* by clicking on the columns header
    or **filter the list** by typing the searched value in the top text input.
  * A right **sidebar** shows the project information when a line is selected: project image, title, abstract.
  * More project properties are shown if the proprietary tool `qgis-project-validator` has been used to
    generate the expected JSON and LOG files for each project:
    * **Invalid layers** count and list of layer names with the `datasource` visible in the tooltip
    * **Memory used** to load the project (in Mo)
    * **Loading time** of the project (in seconds)
    * **QGIS Log file** written when loading the project
  * Funded by **Valabre** (Centre de gravité de la formation des métiers de la Sécurité Civile,
    de la Recherche, des Nouvelles Technologies et de la Prévention dans le domaine des risques naturels)
* **Administration** new interface to manage rights, easier to use, especially when there are many groups
* **Layer legend**: Enable auto display the legend image for a layer at startup
* **Edition**: New button to restart drawing geometry - Provide the capability to update geometry with GPS and form coordinates
* New `-dry-run` for the cache generation to see how many tiles might be generated

### Fixed

* Fix the download of files (layer export, PDF) depending on the web-browser (and its version)
* Selected theme can be selected again without selecting another one before
* The style was not updated when the layer has a shortname and was included in a QGIS theme
* CLI tool about cache : fix an issue about the `-bbox` parameter out of the tile matrix limit
* Provide the dataviz button in the left menu only there is at least one non filtered dataviz
* Javascript error when clicking on an atlas link when no feature ID was found
* Fix infinite HTTP loop when the user hasn't any access to the default project
* Fix the attribute table order defined in QGIS desktop
* Fix the "zoom to layer" button when the layer is in EPSG:4326 (Funded by Geocobet)
* When a layer has a shortname, fix one issue about dataviz & relations and fix the children popup wasn't displayed
* Dataviz & relations - Fix possible bug when layer has a shortname

### Changed

* Improve the table in the right's management panel when having a dozen of groups
* Add tolerance for clicking on mobile to get the popup
* Do not build the attribute table when refreshing attribute table
* The option "Use layer IDs" in the project properties is not possible anymore

### Backend

* Support from PHP 7.4 to 8.1
* Lizmap QGIS server plugin has been split in two different plugins : server and desktop
* Internal PHP code
  * New method in `AppContext` to get user public groups id
  * Convert QGIS XML `Option` value based on type attribute
  * Add a revision parameter on assets url for cache
  * Add ETag HTTP header to GetCapabilities, GetProjectConfig, GetProj4 and WMTS GetTile responses
  * New class `\Lizmap\Request\OGCResponse`
* Update Jelix to 1.8-pre
* Update PHP CS Fixer to 3.8.0
* Update to NodeJS 16

### Translations

* Update from Transifex about translated strings
* New Norwegian language

### Tests

* End2End: Add Lizmap Service requests tests
* End2End: Update Cypress to 9.5.0
* Use the new command line `docker compose`
