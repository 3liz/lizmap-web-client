# Changelog Lizmap 3.7

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords: backend, tests, test, translation, funders, important
-->

## Unreleased

## 3.7.15 - 2025-02-07

### Added

* Add `X-Request-Id` in request to QGIS Server headers :
   * Useful with latest versions of [Py-QGIS-Server](https://github.com/3liz/py-qgis-server) and [QJazz](https://github.com/3liz/qjazz)
   * The `Q-Request-Id` is shown in the administration log panel

### Fixed

* Wrong distance constraint value
* When drawing a single segment, display correct total measure for linestring without distance constraint
* WFS GetFeature request to QGIS Server returns error

### Backend

* Update Jelix to [1.8.16](https://github.com/jelix/jelix/releases/tag/v1.8.16)

### Tests

* Improve workflow about PHP and End2End tests

## 3.7.14 - 2025-01-07

### Funders

* **[Biotope](https://www.biotope.fr/)**

### Fixed

* Fix the print overlay stacking
* Fix order popups following layers order

## 3.7.13 - 2024-12-12

### Fixed

* Tail admin logs to always display data
* In case of HTTP request error, log it into the admin logs
  * It's easier to debug and see OGC requests to QGIS server
* Remove the print overlay when some dialogs are opened
* Speed up the landing page loading with a lazy loading of each QGIS projects
* Attribute table - Fix bugs
  * Remove the need to highlight a line when clicking on the "Create feature" button
  * Fix the "Create feature" button not visible in some cases
  * Fix the child table not visible in some cases after clicking on a parent feature
  * Allow `target="_blank"` in cells
* Fix display of error message when launching a Lizmap action

### Backend

* Update Jelix to 1.8.14

## 3.7.12 - 2024-11-07

### Funders

* **[AUDRNA](https://www.audrna.com/)**
* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84

### Fixed

* Fix expanded for categorized symbology in group as layer
* Encode layer style in hash, contribution from @mind84
* Fix Relation Reference Form control order by value
* Fix enclosing correctly `filter` when requesting QGIS Server with brackets
* Fix: reinit form filter

## 3.7.11 - 2024-10-02

### Funders

* **[Valabre](https://www.valabre.com/)**
* Villefranche Agglomération

### Added

* Button to reload the map without additional JavaScript in case of error

### Fixed

* In the Javascript digitizing measure, provide a map projection
* Fix reprojection of circle when printing and use a `CURVEPOLYGON`
* Fix: allow tiled WMS when `singleTile=False` and the layer is not cached
* Fix issues on datetime pickers and localization
* Remove unwanted web assets from local configuration
* `lizMap.getFeaturePopupContentByFeatureIntersection` according to the choosing scale

### Backend

* Update Playwright to 1.46.0
* Some updates on PHPUnit 10

## 3.7.10 - 2024-08-01

### Funders

* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84
* **FM Projet**
* **[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)**
* **[Valabre](https://www.valabre.com/)**

### Added

* New option to disable the automatic permalink in the URL when a pan or a zoom is done

### Changed

* Enable popup when digitizing is disabled

### Fixed

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
* Fix project properties when the WMS extent is empty
* Fix Projects switcher in maps

### Tests

* Improve End2End automatic tests

### Backend

* Fire `treecreated` event at proper time, contribution from @mind84
* Fix pacakge `map-projects.js`
* Update dompurify to 3.1.6

## 3.7.9 - 2024-07-04

### Funders

* **[Conseil Départemental du Calvados](https://www.calvados.fr)**
* **[Karum](https://www.karum.fr/)**
* **[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)**
* **[WPD](https://www.wpd.fr/)**

### Added

* Add `mapTheme` in the URL parameter to open a map with a predefined map theme

### Changed

* Admin - Add legend about warning icon in project table
* Admin - Display the list of warning ID in the admin panel, in the tooltip

### Fixed

* Popup: respect `popupMaxFeatures` parameter
* `default-background-color` on startup with QGIS 3.34
* Fix Popup is not shown in atlas container
* Fix: let min/max resolutions be handled by OpenLayers for WMTS
* Fix cross-site scripting issue with the `theme` parameter
* Baselayers :
    * Refresh dropdown selection on change
    * Handle visibility in **theme**
* Remove CSS height and width (16px) for legends, useful for raster legend, contributions from @Antoviscomi
* Fix feature filtering when PK is of type string, contribution from @maxencelaurent
* Fix installation: some upgrades were not launched when upgrading from 3.5
* Fix activate first map theme
* Fix printing of the overview map in a QGIS layout

### Removed

* Remove unused button zoom to layer extent

### Backend

* Expose more OpenLayers 9 classes
* Expose some Lit HTML classes

## 3.7.8 - 2024-05-27

### Funders

* *[Bièvre Est](https://www.bievre-est.fr/)*
* *[Chateauroux Agglomération](https://www.chateauroux-metropole.fr)*
* *[Drosera écologie appliquée SA](https://www.drosera-vs.ch/)*, @katagen
* *[EPF Haut De france](https://www.epf-hdf.fr/)*
* *[Faunalia](https://www.faunalia.eu/fr)*, contributions on source code from @mind84
* *[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)*

### Changed

* Check for the Desktop plugin version first instead of showing possible warnings from the plugin
* Review code snipped to add thumbnail in the attribute table

### Fixed

* Improve detection of the geometry column when the layer has many
* Fix attribution for layers not being in the `baselayers` group
* Fix and improvements in the legend :
  * Greyscale symbols when layer is not visible
  * Italic and greyscaled uncheked symbols and their children
  * Improve legend when symbols are out of the current map scale
* For popup, fix the item was visible or not, `LEGEND_ON` and `LEGEND_OFF` parameters in GetFeatureInfo
* Fix popup display in minidock
* Group with layers can be used as baselayer
* For XYZ or WMTS layers from QGIS, the use external access was not well-used
* Reduce loading image size and get back previous white color on animation

### Backend

* Upgrade of the Dompurify Javascript library

## 3.7.7 - 2024-05-14

### Added

* Better handling of error message
    * Editing capabilities, display and saving the form
    * Printing

### Fixed

* Dataviz - Fix display of HTML plots in popups
* Fix issue in Dutch language
* Fix children popup in compact table about DataTable
* Use external WMS URL when activated, not using QGIS Server
* Fix some XSS issues into features forms and attribute table
* Check for `hidden` group when generating the Base layers group
* Handle symbols expanded state
* Map themes :
    * Fix expanding sub-groups
    * Handle case where there is no visible layers
    * Handle symbols expanded state
* Print :
    * Take care of map projection for redlining
    * Correctly select default format
* Caching CLI tool : fix when input is 0
* Add `STYLE` parameter in the `GetFeatureInfo`
* Rephrase sentence about CORS settings
* Layer tree : fix if the group is empty (after filtering for instance)

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Backend

* Fix a few issues about XSS
* Expose some OpenLayers classes in a library
* Update OpenLayers to 9.1.0
* Upgrade Jelix to version 1.8.9

### Funders

* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84
* **[Le Grand Narbonne](https://www.legrandnarbonne.com/)**
* **[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)**

## 3.7.6 - 2024-03-22

### Added

* Show warnings if the project has some, when connected as an admin

### Changed

* Update the table of QGIS projects in the administration panel
* Update limit to 500 000 for the row limit in the attribute table tool

### Fixed

* Fix printing base layers with layers in the `hidden` group
* Fix the message "Feature not editable" if the user has the right
* Fix issue about rights for anonymous users
* Fix language for compact table in a children popup
* Drag and drop form configuration is not taken into account for the embedded layers, contribution from @mind84
* Apply minimum and maximum resolutions to base layers
* Webdav upload was failing when evaluating expressions that uses feature fields
* Fix an issue about the empty background when using QGIS Server 3.34

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Backend

* Enhancing the way Lizmap build Etag and add an Etag to `GetKeyValueConfig`
* Upgrade Jelix to version 1.8.8

### Funders

* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84
* **[PNR Haut-Jura](https://www.parc-haut-jura.fr)**
* **[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)**

## 3.7.5 - 2024-02-27

### Fixed

* Fix a JavaScript error when loading a map in some locales

## 3.7.4 - 2024-02-26

### Added

* New JavaScript event when the map state is ready
* Add HTTP Etag header on the project illustration
* Display a warning when the CFG file contains some warnings
* Display the count of warnings in the administrator panel

### Changed

* Publishers can see now "legacy" syntax about actions

### Fixed

* Fix use of the "Hide checkbox for groups" from the plugin
* Fix if the layer is explicitly hidden from the legend
* Forward the state of the legend for categories when printing a QGIS layout
* Use map projection if the project projection is not well-defined
* Fix permalink precision to 6 digits if the EPSG:4326
* Fix display of layers when the map projection has inverted axis
* Fix display of UI widgets about print and create child object
* Fix error when there isn't any icon in the GetLegendGraphic from QGIS Server
* Fix export of drawings due to the map projection
* Fix CSS issue about blank panel
* Disable High DPI support
* Fix print capabilities when "Group as layer" is used

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Backend

* Update Jelix to 1.8.7

## 3.7.3 - 2024-02-07

### Added

* Editing form - Upload fields: allow to use an expression to set up the storage path

### Changed

* Reintroduce the [AtlasPrint](https://docs.lizmap.com/current/en/install/pre_requirements.html#qgis-server-plugins) plugin for printing an atlas
* Load custom JavaScript as a module

### Fixed

* Fix a 500 error if the folder was not existing on the file system
* Fix the option "Display when layer is visible" in the dataviz for non-spatial layer
* When importing a KML :
  * Fix extent used
  * Use the correct projection
* Fix wrong order of baselayers (using the zIndex in OpenLayers)
* Fix opening of "old" project not having a configuration in the 3.7 format :
  * Fix projection and scales when the project has some "legacy" baselayers
  * Keep print configurations
* Fix the selection tool about layer name used
* Fix using WMTS requests
  * For baselayers, contribution from @mind84
  * When there is a shortname
* Fix search result with IGN
* Fix using Bing with OpenLayers, contribution from @mind84
* Register projections from lizProj4 if unknown
* Fix layer group visible only and location
* Popup from the attribute table, use the correct content for the popup
* Fix display of a child layer in attribute table tool, get the correct layer name from the parent layer
* Fix display of the map if there is a single resolution in the configuration file
* Do not refresh child layer not displayed in map
* Check if previous drawing made before Lizmap Web Client 3.7 in the local storage of the web browser is valid
* Some fixes about permalink and theme
* Too many embedded layers cause PHP to hit `max_execution_time`, contributions from @mind84
* Fix inversions between two French layers
* Fix display of layers on 4K screens

### Tests

* Improvements on the Playwright stack

### Funders

* **[Agence de l'eau Rhône Méditerranée Corse](https://www.eaurmc.fr/)**
* **[Avignon](https://www.avignon.fr)**
* **[Calvados](https://www.calvados.fr)**
* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84
* **[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com/)**
* **[Territoire de Belfort](https://www.territoiredebelfort.fr/)**

## 3.7.2 - 2024-01-18

### Fixed

* Fix tile mode when `GetMap` requests are greater than the value `wmsMaxWidth` and `wmsMaxHeight` in the settings

## 3.7.1 - 2024-01-17

### Update

* Update URL from the French map provider IGN about geocoding service

### Fixed

* Fix the display order of layers when the `Group as layer` option is used
* Fix support of SSL PostgreSQL connection in PostgreSQL layers
* Javascript: Layer ID can be used as WMS Name
* Fix uncaught exception on `layerFilterParamChanged` event
* Fix a warning with PHP 8.2 about `emptyItemLabel`
* The permalink has changed so the way to provide bbox between maps.

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

## 3.7.0 - 2023-12-13

### Added

* New theme of the Lizmap Web Client interface
* **Dataviz**
  * Use the popup title when showing plot in a popup
  * Respect the new option "trigger filter" to avoid filtering the plot on layer filtered
  * The editor can now configure how the plots will be organized in the web interface.
    A new **Drag & Drop layout** tab has been added in Lizmap plugin Dataviz tab,
    which allows to create **tabs and groups** like it can be done for forms.
* **Legend**
  * Add checkbox in the legend to enable/disable some symbols within the layer
  * Add symbols of the legend item by default for all layers and rendering rules
  * Group `project-background-color` to display the default background color
  * Use any base layer as a background, the usage of legacy keywords `osm-mapnik` etc. is now deprecated
  * These new background layers must be in a group called `baselayers`.
* Improve the "QGIS theme" feature
* **Editing**
  * Better user experience with **1-n** relations: the data tables of the related child layers
    now respect the position configured in the QGIS editing drag&drop designer.
  * Add a combobox in the popup to allow creating a new child feature for the related
    layers. This will allow creating child features directly from the parent popup.
  * Add some constraints : distance, angle when adding a new geometry
  * Add a button to paste a geometry
* Drawing tool
  * New display for measurements on the map
  * Set feature's color individually
  * Delete features individually
  * **Draw text** on the map canvas
    * Rotation
    * Scaling
* **Form filter**: Allow using a second field for the numeric type like it is already possible for dates.
  This is useful when the layer features contain two fields describing a minimum and maximum value of the same property.
* **Action module**
  * New support for `project` and `layer` scopes: the actions can now be used outside the popup, for a specific chosen layer or as a generic project action.
    * A **new web component** `<lizmap-action-selector>` is used to let the user choose an action and run it (for the layer and project scopes)
    * A **new dock** is available and shows the list of the **project actions**, with buttons to run an action and another to reset the results.
    * For the layers with actions configured, a click on the layer in the legend also shows the action selector and buttons and allows running this **layer actions**
  * An **SVG icon** can be used instead of a bootstrap icon as a background of the popup action buttons
  * the current **map extent** and **map center** are sent as parameters in `WKT` format (projection `EPSG:4326`) and can be used in the PostgreSQL function
  * Actions can be run from external **JavaScript** scripts, for example:
    ```javascript
    // Run an action
    lizMap.mainLizmap.action.runLizmapAction(actionName, scope = 'feature', layerId = null, featureId = null, wkt = null);
    // Reset the action
    lizMap.mainLizmap.action.resetLizmapAction()
    ```
  * A WKT in `EPSG:4326` can also be sent as an **additional parameter**.
    This is only possible when running the action with JavaScript.
    This allows to **send a geometry** to be used by the PostgreSQL action
    (for example, to get data from another table with geometries intersecting this passed WKT geometry)
  * The **JavaScript and HTML code** has been **modernized** (no more jQuery calls, usage of web components, etc.)
* Review of the **permalink** feature
  * The URL is now automatically updated when we pan or zoom, or check/uncheck some layers
* **Print configurations**.
  * For each layout, you can:
    * enable/disable it
    * set allowed groups
    * set formats and default one
    * set DPIs and default one
    * set a custom icon for a QGIS atlas layout in the feature's popup
  * New user interface for printing
    * print area is now displayed as a [mask on the map](https://user-images.githubusercontent.com/2145040/216579235-8b438ea5-7ea3-4549-95fa-398dea1450e8.png)
    * an advanced panel allows you to:
      * set X/Y parameters for the grid
      * set main map rotation
      * set DPI
* Add [MGRS](https://en.wikipedia.org/wiki/Military_Grid_Reference_System) coordinates display on the map
* Support of the **Webdav** attachement widget (contributions from @mind84) :
  * Upload and delete files on a Webdav server from Lizmap Web Client
  * View files stored in a webdav server within a Lizmap popup
* Set a custom title on the landing page, instead of "Projects"
* On the **landing page**, possible to add some content in the footer.
  It's set in the administration interface, then "Landing page"
* Login
  * New password security checker
  * Add possibility to log with an email

### Changed

* Avoid downloading the default project image multiple times.
  This improves the first load of the project page
* Change the configurations of the Lizmap editing form fields published with autocompletion
  * add a delay of 300ms to lessen the number of requests sent to the server
  * add a minimum of 3 characters to trigger the autocompletion
  * the search is now accent-insensitive : You can type forets and it will find Forêts
* Refactor the geobookmark feature
* Javascript events `lizmapeditionfeaturecreated` and `lizmapeditionfeaturemodified`
* Update URLs from the French IGN map provider
* Fix increase the login length in the database in order to use email as logins
* The minimal length of password is now 12 characters to improve the security
* The keyword `overview` for a group in the legend is not case-sensitive

### Deprecated

* The AtlasPrint QGIS server plugin should be removed from the installation. It's not used anymore.
* Layers called `osm-mapnik`, `ign-photo`, `google-satellite` etc
  * See the documentation about these ["legacy" layers](https://docs.lizmap.com/3.6/en/publish/configuration/print.html#allow-printing-of-external-baselayers)

### Fixed

* Fix typo about wrong key used for caching an embedded layer, contribution from @mind84
* Fix selected default style on a WMS layer
* In the Lizmap atlas, fix the popup when the name has an accent or a space
* Do not block the loading of the map if the layer name is wrong in a permalink
* Round the `I` and `J` parameters of WMS GetFeatureInfo service, contributions from @mind84
* Display the reverse geometry button only for linestring and polygons, not for points
* When creating/editing a geometry, check the spatial constraint
* Fix an error about GetFeatureInfo and GetFilterToken requests to QGIS server
* Fix cascade layer's filter to use the parent WMS name instead of the layer name
* Fix latest features about QGIS layouts : groups allowed, order etc
* Fix getting the table for sub-queries with escaped double-quotes
* Use layer name as option label for locate-by-layer selector in mobile
* Editing & Filter - Fix editing right access from popup
* Warning about "qgsmtime" for an embedded layer

### Removed

* Some code about OpenLayers 2

### Backend

* Upgrade Lizmap Web Client target minimum version to 3.4
* A lot of JavaScript code cleanups
* Remove some old code about QGIS Server 2
* Switch to PHP 8.1 in the docker image
* Update of Jelix to version 1.8.4
* Update some PHP packages
* Update OpenLayers to 8.2.0
* Update proj4 to 2.9.2
* Update Plotly.js to 2.16.3
* Update some JavaScript dependencies
* Fix some PHP notice when running PHP 8, contribution from @Antoviscomi

### Funders

* **[Faunalia](https://www.faunalia.eu/fr)**, contributions on source code from @mind84
* **[Avignon](https://www.avignon.fr)**
* **[Calvados](https://www.calvados.fr)**
* **Direction Départementale des Territoires et de la Mer de l’Hérault (DDTM 34)**
* **[ICRC](https://www.icrc.org/)**
* **[Geolab.re](https://geolab.re/)**
* **[Le Grand Narbonne](https://www.legrandnarbonne.com/)**
* **[Lons-le-Saunier](https://www.lonslesaunier.fr/)**
* **[Parc naturel régional du Haut-Jura](http://www.parc-haut-jura.fr/)**
* **[Portes du Soleil](https://www.portesdusoleil.com/)**
* **[SDEC Energie](https://www.sdec-energie.fr/)**
* **[Tenergie](https://tenergie.fr/)**
* **[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com)**
* **[Territoire de Belfort](https://www.territoiredebelfort.fr/)**
* **[Vaucluse province in France](https://www.vaucluse.fr/)**
* **[WPD](https://www.wpd.fr/)**

## 3.7.0-rc.1 - 2023-11-24

### Added

* Support of the Webdav attachement widget (contributions from @mind84) :
  * Upload and delete files on a Webdav server from Lizmap Web Client
  * View files stored in a webdav server within a Lizmap popup
* Dataviz :
  * Use the popup title when showing plot in a popup
  * Respect the new option "trigger filter" to avoid filtering the plot on layer filtered

### Fixed

* Fix missing attributions (name and links) found in the layer properties
* Fix typo about wrong key used for caching an embedded layer, contribution from @mind84
* Dataviz : Fix the option "Display when layer is visible" option
* Fix selected default style on a WMS layer
* In the Lizmap atlas, fix the popup when the name has an accent or a space
* Do not block the loading of the map if the layer name is wrong in a permalink
* Round the `I` and `J` parameters of WMS GetFeatureInfo service, contributions from @mind84
* When clicking for a popup, fix the mouse spinner

### Changed

* Change the configurations of the Lizmap editing form fields published with autocompletion
  * add a delay of 300ms to lessen the number of requests sent to the server
  * add a minimum of 3 characters to trigger the autocompletion
  * the search is now accent-insensitive : You can type forets and it will find Forêts
* Permalink :
  * Opacity,style, layer with a comma in its name
  * use mini-dock
  * review the hash used
* Refactor the geobookmark feature
* Improve UI about adding text on top of the map : rotation, scales etc
* Improve UI about geometric constraints
* Javascript events `lizmapeditionfeaturecreated` and `lizmapeditionfeaturemodified`
* Update URLs from the French IGN map provider

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Backend

* Update of Jelix to version 1.8.4
* Update some PHP packages
* Update OL to 8.2.0 and proj4 to 2.9.2
* Update some JS dependencies

### Removed

* Remove some code from OpenLayers 2

### Funders

* [Faunalia](https://www.faunalia.eu/fr), contributions from @mind84
* [Avignon city](https://www.avignon.fr/)
* Direction Départementale des Territoires et de la Mer de l’Hérault (DDTM 34)

## 3.7.0-beta.1 - 2023-10-13

### Added

* Add some content in the footer of the main landing page. It's set in the administration interface, then "Landing page"
* New password security checker
* Add possibility to log with an email
* Review of the permalink feature
* Add the possibility to authenticate with the email
* Draw text on the map canvas :
  * Rotation
  * Scaling

### Changed

* Treeview: scale dependent visibility of legend items
* Fix increase the login length in the database in order to use email as logins
* The minimal length of password is now 12 characters to improve the security

### Fixed

* When the layer has an accent :
  * Fix the export of the layer
  * Fix filtered features disappear from map* Do not display child plot in popup when there is no data
* Fix loading of the editing form having a nullable checkbox
* Review the popup order according to the list of layers
* Fix PHP notice about CRS variable
* Fix permalink generation when there isn't any layer checked
* Fix loading relations from embedded layers in a project
* Fix home page title in the top bar of the UI
* When creating/editing a geometry, check the spatial constraint
* Fix an error about GetFeatureInfo and GetFilterToken requests to QGIS server
* Fix cascade layer's filter to use the parent WMS name instead of the layer name
* Fix latest features about QGIS layouts : groups allowed, order etc
* Fix getting the table for sub-queries with escaped double-quotes

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

### Backend

* Upgrade OpenLayers to version 8.1

### Funders

* [WPD](https://www.wpd.fr/)
* [Calvados province in France](https://www.calvados.fr/)
* [Vaucluse province in France](https://www.vaucluse.fr/)
* [Faunalia](https://www.faunalia.eu/fr)

## 3.7.0-alpha.2 - 2023-08-28

### Fixed

* Use the layer name defined in the Lizmap CFG file if defined instead of the one in the legend
* Editing & Filter - Fix editing right access from popup
* Refresh WMS layer after edition follow up
* Fix some regressions about the new legend :
  * Option "Group as layer"
  * External layer
  * Handle QGIS `Control rendering order`
* Check if the scale is `0` in the Lizmap CFG file before doing a division
* Use layer name as option label for locate-by-layer selector in mobile
* Support for [OpenTopoMap](https://opentopomap.org/)
* Editing & Filter - Fix editing right access from popup
* Fix a visibility error for a QGIS preset/theme
* Warning about "qgsmtime" for an embedded layer
* Improve the checklist when installing Lizmap Web Client about QGIS Server
* Do not display child plot in popup when there is no data

### Changed

* The keyword `overview` for a group in the legend is not case-sensitive
* Improve the QGIS project panel in the administration :
  * Add some colours in the legend
  * Improve the display, better UX

### Removed

* Some code about OpenLayers 2

### Backend

* Upgrade OpenLayers to version 7.5.1
* Fix some PHP notice when running PHP 8, contribution from @Antoviscomi

### Translations

* Update translated strings from the Transifex website :
  * [Lizmap Web Client](https://www.transifex.com/3liz-1/lizmap-locales/dashboard/)
  * [Jelix](https://www.transifex.com/3liz-1/jelix/dashboard/)

## 3.7.0-alpha.1 - 2023-07-25

### Added

* Refactoring of the legend:
  * Add checkbox in the legend to enable/disable some symbols within the layer
  * Add symbols of the legend item by default for all layers and rendering rules
  * Group `project-background-color` to display the default background color
  * Use any base layer as a background, the usage of legacy keywords `osm-mapnik` etc. is now deprecated
  * These new background layers must be in a group called `baselayers`.
* Improve the "QGIS theme"
* Editing capabilities: Better user experience with 1-n relations: the data tables of the related child layers
  now respect the position configured in the QGIS editing drag&drop designer.
* Popup/Editing - Add a combobox in the popup to allow creating a new child feature for the related
  layers. This will allow creating child features directly from the parent popup.
* New display for measurements on the map when drawing
* Better management of **QGIS projects** about versions (desktop, plugin versions, etc.)
* **Form filter**: Allow using a second field for the numeric type like it is already possible for dates.
  This is useful when the layer features contain two fields describing a minimum and maximum value of the same property.
* **Action module**:
  * New support for `project` and `layer` scopes: the actions can now be used outside the popup, for a specific chosen layer or as a generic project action.
    - A **new web component** `<lizmap-action-selector>` is used to let the user choose an action and run it (for the layer and project scopes)
    - A **new dock** is available and shows the list of the **project actions**, with buttons to run an action and another to reset the results.
    - For the layers with actions configured, a click on the layer in the legend also shows the action selector and buttons and allows running this **layer actions**
  * An **SVG icon** can be used instead of a bootstrap icon as a background of the popup action buttons
  * the current **map extent** and **map center** are sent as parameters in `WKT` format (projection `EPSG:4326`) and can be used in the PostgreSQL function
  * Actions can be run from external **JavaScript** scripts, for example:
    ```javascript
    // Run an action
    lizMap.mainLizmap.action.runLizmapAction(actionName, scope = 'feature', layerId = null, featureId = null, wkt = null);
    // Reset the action
    lizMap.mainLizmap.action.resetLizmapAction()
    ```
  * A WKT in `EPSG:4326` can also be sent as an **additional parameter**.
    This is only possible when running the action with JavaScript.
    This allows to **send a geometry** to be used by the PostgreSQL action
    (for example, to get data from another table with geometries intersecting this passed WKT geometry)
  * The **JavaScript and HTML code** has been **modernized** (no more jQuery calls, usage of web components, etc.)
* **Dataviz** The editor can now configure how the plots will be organized in the web interface.
  * A new **Drag & Drop layout** tab has been added in Lizmap plugin Dataviz tab,
    which allows to create **tabs and groups** like it can be done for forms.
* New print configurations. For each layout, you can:
  * enable/disable it
  * set allowed groups
  * set formats and default one
  * set DPIs and default one
  * set a custom icon for a QGIS atlas layout in the feature's popup
* New display of print options
  * print area is now displayed as a [mask on the map](https://user-images.githubusercontent.com/2145040/216579235-8b438ea5-7ea3-4549-95fa-398dea1450e8.png)
  * an advanced panel allows you to:
    * set X/Y parameters for the grid
    * set main map rotation
    * set DPI
* Add a button to paste a geometry
* Add [MGRS](https://en.wikipedia.org/wiki/Military_Grid_Reference_System) coordinates display on the map

### Fixed

* The "locate by layer" selector shows the layer title when unselected on mobile
* Display the reverse geometry button only for linestring and polygons, not for points

### Changed

* Avoid downloading the default project image multiple times. This improves the first load of the project page
* Update home page title configuration

### Updated

* New drawing toolbar, migration from OpenLayers 2 to OpenLayers 6
* Update Plotly.js to 2.16.3
* Update proj4 library

### Translations

* Update translated strings from the Transifex website

### Deprecated

* The AtlasPrint QGIS server plugin should be removed from the installation. It's not used anymore.
* Layers called `osm-mapnik`, `ign-photo`, `google-satellite` etc
  * See the documentation about these ["legacy" layers](https://docs.lizmap.com/3.6/en/publish/configuration/print.html#allow-printing-of-external-baselayers)

### Backend

* A lot of JavaScript code cleanups
* Update some JavaScript dependencies
* Remove some old code about QGIS Server 2
* Update the OpenLayers library to version 7.3.0
* Fix some issues when deployed with Docker
* Switch to PHP 8.1 in the docker image
* Upgrade Lizmap Web Client target minimum version to 3.4

### Funders

* **[Avignon](https://www.avignon.fr)**
* **[Calvados](https://www.calvados.fr)**
* **[ICRC](https://www.icrc.org/)**
* **[Geolab.re](https://geolab.re/)**
* **[Le Grand Narbonne](https://www.legrandnarbonne.com/)**
* **[Parc naturel régional du Haut-Jura](http://www.parc-haut-jura.fr/)**
* **[Tenergie](https://tenergie.fr/)**
* **[Terre de Provence Agglomération](https://www.terredeprovence-agglo.com)**
