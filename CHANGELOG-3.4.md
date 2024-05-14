# Changelog Lizmap 3.4

## Unreleased

## 3.4.14 - 2022-10-18

### Fixed

* Fix wrong host URL when the WMS is used in another GIS client such as QGIS

### Backend

* Upgrade Jelix to version 1.6.39

## 3.4.13 - 2022-09-20

### Fixed

* Form filter - Use OR between the uniques values of the same field
* Fix some requests to QGIS Server
* New configuration to set up the Content Security Policy header

### Translations

* Update from Transifex about translated strings

### Tests

* Add more tests about Cypress

### Backend

* Update Jelix to version 1.6.38

## 3.4.12 - 2022-07-01

### Added

* New `-dry-run` for the cache generation to see how many tiles might be generated

### Changed

* Improve the table in the right's management panel when having a dozen of groups
* Add tolerance for clicking on mobile to get the popup

### Fixed

* Fix the download of files (layer export, PDF) depending on the web-browser (and its version)
* CLI tool about cache : fix an issue about the `-bbox` parameter out of the tile matrix limit
* Provide the dataviz button in the left menu only there is at least one non filtered dataviz
* The style was not updated when the layer has a shortname and was included in a QGIS theme
* Javascript error when clicking on an atlas link when no feature ID was found
* Fix infinite HTTP loop when the user hasn't any access to the default project
* Fix the attribute table order defined in QGIS desktop
* Fix the "zoom to layer" button when the layer is in EPSG:4326 (Funded by Geocobet)

### Backend

* Update Jelix to version 1.6.38-pre

### Translations

* Update from Transifex about translated strings

### Tests

* Update end-to-end Cypress tests about continuous integration

## 3.4.11 - 2022-04-29

### Fixed

* Allow a project thumbnail with capital letters in the extension
* Open a PDF in a new tab when possible on Firefox instead of the internal viewer
* Fix about dataviz panel : plot order and custom plot layout, contribution from @tethysgeco
* Fix some exports issues when there is a selection
* Fix an issue about editing capabilities when using a geometry involved in a QGIS expression
* Fix about some WFS requests about vector data
* Fix about QGIS 3.22 when a group has a shortname
* Fix about QGIS 3.22 with the "Show feature count"
* Fix about geometries in WKT when it's multipart.

### Translations

* Update from Transifex about translated strings

### Backend

* Update of Jelix 1.6

## 3.4.10 - 2022-03-24

### Fixed

- Fix when an attribute name is starting with a capital name
- Fix editing feature having an ID equal to 0
- Do not show custom labels when printing from a popup about `lizmap_user` and `lizmap_user_groups`
- Check version attribute in WxS request in XML to return error
- Fix the GetProj4 request to get proj4 CRS definition from QGIS project
- Speed up GetProjectConfig request by using cache for QGIS Server plugins data
- Do not send private user group to QGIS Server for access control
- Fix regression in form - empty value is added to required menu list field
- Check Version parameters in WxS request to return error
- Fix the GetProjectConfig mime-type as application/json

### Backend

- Upgrade jelix to 1.6.36

## 3.4.9 - 2022-02-04

### Added

- Add new Ukrainian language

### Fixed

- Fix the value relation widget with multiple text values on feature modification
- Fix the link of selected features between a parent and a child in the attribute table
- Fix a warning into QgisProject with expanded-group-node
- Update IGN URL searching address, the old one will no longer be usable as of February 1, 2022
- Fix snapping missing when editing existing feature
- Fix geom can be created on existing feature without geometry
- Fix some account management issues with some other authentication modules
- Fix the backup script about third-party modules such as MapBuilder and AltiProfil
- Fix the mime type for SVG files. It should be `image/svg+xml`
- Fix the layer export when :
  - a selection or a filter is active
  - the layer is not spatial
  - the layer has parenthesis inside its name
- Update translations

## 3.4.8 - 2021-12-23

### Fixed

- Update URLs for the French IGN basemap provider,
  It's highly recommended updating before first February 2022.
- Refresh atlas input list after update layer feature
- Don't show search results if search query is empty
- Use white icons on button.btn-primary class hover
- Translate mini-dock-close button
- Selection: improve the export tool to allow bigger selections
  - use the selection token instead of a list of feature identifiers
  - internally use POST instead of GET requests to query data from QGIS Server

## 3.4.7 - 2021-11-16

### Fixed

- Expressions: Lizmap user and groups was not forwarded to the QGIS Server backend.
  It's now possible to use `@lizmap_user` and `@lizmap_user_groups` in a QGIS Expression
  in an editing form.
- External WMS layers - respect the image format of the source WMS layer.
  The format specified in the Lizmap configuration is not used.
- WMS GetPrint Request: do not encode URI labels
- View Popup class: manually canonize path to authorize symlink

### Added

- New **save** button to let users decide if they want their drawings to be saved.
  If drawings are not saved, they will be removed when the webpage is refreshed.

## 3.4.6 - 2021-09-21

- Fix: issue during the installation of the ldapdao module. Upgrade it to 2.2.1
- Fix: export button allowed in filter data with form when format is ODS
- Fix: integer key column sorted as text in attribute table tool
- Fix: Editing
  - In case of more than one editable layers, when there is a filter by login (or by polygon) activated,
  some of the popup items could miss the pencil button to open the editing form. Corrected by requesting
  the editable features for all the editable layers of the displayed popup items, and not only the first.

## 3.4.5 - 2021-09-14

- Fix: multiple selection edition w/ text field. Values can be integer but also string
- UI: when dock is closed, show edition is pending with green background on dock button
- Fix: use IGN PLANIGNV2 with free and paid keys
- UI: replace dock close button text by icon. This makes it more clear the dock is closed but tool can remain active
- Translation: add Romanian for dataTables (contribution from @ygorigor)
- Create utils method to parse XML and get error parsing message
- Fix: Object of class LibXMLError could not be converted to string
- Fix: Log errors about loading QGIS Project and provides errors messages
- Fix: lizmapTiler log errors when loading WMS GetCapabilities

## 3.4.4 - 2021-06-17

- Fix: form's labels partially hidden when too long. A line break and a hyphen are now used when needed
- Fix: In QGIS 3.16, the host in datasource can be written between single quotes
- Display spinner and disable button while waiting for print.
- Fix: fields are correctly hidden when 'Do not expose via WFS' is set in QGIS >=3.16
- Fix: QGIS >= 3.16 datasource compatibility
- Fix: Pre-generated cache is not used since Lizmap 3.4.1
- Fix: links into mails for registration or password recovery

## 3.4.3 - 2021-03-26

- Fix form not displayed when editing an existing feature
- Some fixes in the js to getprint
- Fix measurement result not shown on tablet
- Fix/performance Get only projects metadata for the landing page
- Update to Webpack 5
- Update Jelix to fix an issue in the installer

## 3.4.2 - 2021-03-04

- Fix lizmap/install/set_rights.sh: some directories were missing
- Make MultiGeometry KML importable/exportable and focus on features extent after load
- Fix geobookmark sql: remove explicit public schema
- Fix popup compact table margin-left
- Fix the adding of the user into group
- Fix visual blank line between the map and the right-dock
- Fix can't launch children layers edition from parent form
- Fix error about script.php into the docker container
- UX Display form first in edition mode for desktop and mobile
- Fix hide digitization tab for non geom layer
- Hide label in legend for layers with single symbol rendering
- Fix WMTS Request - use specific $wmsRequest parameters array

## 3.4.1 - 2021-01-14

- Fix drill-down (cascading) forms in Lizmap based on QGIS expression
- Fix draw: import KML does not draw anything if xml headers
- Fix regression in 3.4.0 about Primary Keys enclosing for UPDATE RETURNING
- Fix the landing page shouldn't show project when not available for groups ACL
  Users in admins groups with rights to remove repositories no longer have
  access to every maps
- Fix cache does not work after authorization
- Fix edition tab content is not visible on mobile screen
- Fix regression in edition form with multiple values from relational value

- Enhance Drag'N Drop Edition form test to avoid regression
- Enhance form_type_relational_value test

- Fix assert crs is not empty before loading
- Remove warning about lizmap_search
- Fix issues with rights managements: removing rights to manage rights, from all
  users, was still possible in specific case.
- new config parameter to disable the behavior change of the login page,
  introduced in lizmap 3.3.12, which redirect to the main page when the user
  is already authenticated. You can disable it by setting `noRedirectionOnAuthenticatedLoginPage=on`
  into the jcommunity section of the configuration (`localconfig.ini.php`).
- Fix attribute edition sets to null unedited fields
- Search - Use a transaction to avoid PostgreSQL connection issue

## 3.4.0 - 2020-12-18

### QGIS Plugin Desktop and Server

* Changelog in the Lizmap QGIS plugin related to this new version is available
  [here](https://github.com/3liz/lizmap-plugin/blob/master/CHANGELOG.md#330---25112020)

### New features

- Projects page
  - Possibility to add HTML content on the projects page, with image upload
  - Search filter : filter projects by text or tags
- Popup
  - Add button to get a single table for all children's feature
  - [New module `action` to run PostgreSQL actions from feature popup.](https://docs.lizmap.com/next/en/publish/configuration/action_popup.html)
    This module allows to add action buttons in the popup which trigger PostgreSQL queries and return a
    geometry to display on the map
  - Print PDF from a popup (layout having an atlas enabled). You can now define values for custom fields
- Atlas tool
  - Allow multiple atlas layer coverage
- Map view
  - Improved UI for mobile. Hamburger button to toggle menu's view
  - Add drawing tools in map canvas
  - Possible to print these drawings (redlining)
  - [QGIS theme](https://docs.qgis.org/3.16/en/docs/user_manual/introduction/general_tools.html?highlight=theme#configuring-map-themes) switcher on a map
    - Display the QGIS Map theme by default
    - Option to change from one map theme to another one
  - Improvements in the geolocation feature
  - Angle measurement tool
  - Display mouse position in QGIS project's projection
  - Edit mouse position coordinates to center map to given ones
- Selection tool
  - Select on multiple layers or a single one
  - Invert selection
- Edition tool
  - Use QGIS expression in Lizmap edition (needs Lizmap plugin installed as a QGIS Server plugin)
      - Group visibility
      - Default value
      - Constraint
      - Form drilldown using Value Relation widget
  - Split tool
  - Enhanced selection
  - Snapping while editing
  - Display angle, current and total segment length
  - Geolocation survey show GPS accuracy, emitting bip
- Dataviz tool
    - Add new sunburst chart type
    - Add new graph type HTML
    - Add internal theme support, between dark (default) and light
    - New options horizontal, display legend, stacked, description
    - Hide/show plot when source layer visibility changes
    - Support multiple traces & remove limit of 2 Y fields for Scatter & HTML
    - Localization
    - Check if layer is in scale range to toggle the corresponding map layer
    - Add new user layout option && replace resizePlot by responsive cfg && UI improvements
    - Add mode bar: zoom in, out & export to PNG
    - Add the resizePlot function back
- Attribute Table view
  - A Lizmap Javascript script to show description labels instead of values in
    the attribute table for columns with ValueMap widget
  - Allow the use of the Lizmap Javascript script also for numeric columns
- Timemanager tool
  - Review the configuration
- Search tool
  - French BAN Search - Add lon and lat parameters to prefer local search around map initial extent center
- Access rights
  - Send user info to QGIS Server through parameters to get access control
    performed by Lizmap plugin as a QGIS Server plugin
  - Restrict filter by user on edition only, based on lizmap plugin config
- Administration
  - Project management and Lizmap configuration are now into separate pages
- Command line tool
  - A command line to request project WMS GetCapabilities to put project in QGIS Server cache
- Other
  - Support of user packages into `lizmap/my-packages/`. A user can install
    additional PHP packages like vendor modules for Lizmap, into the `my-packages/`
    directory. He should create a `my-packages/composer.json`.
  - Lizmap does not support anymore Internet Explorer (11 and lower)
  - Map themes - check layer legend checkbox even if not in scale range
  - Expose QGIS themes in Lizmap JSON config

### New JS events

- `lizmapeditionfeatureinit` to customize edition layers
- `mapthemechanged` and `mapthemesadded`
- `lizmapchangelayervisibility` when map layer visibility changes

### New PHP events:

- None

### Under the hood:

- Configuration: remove the support of `proxyMethod`. Lizmap now guesses automatically
  if it can use curl to do HTTP queries.
- Starting to use some OpenLayers 6 features
- Starting to migrate the javascript code base to modern syntax and organization:
  - web components
  - webpack etc
  - A sourcemap has been added too.
- Upgrade jQuery to 3.5.1 with jQuery-migrate
- Use PHP Composer to import external PHP libraries (jcommunity module, Proj4Php, ...)
- Locales files are moved to `lizmap/app/locales/`
- Tests environment with Docker (Vagrant is still there)
- More unit tests in PHP and Javascript
- Deprecated class lizmapCache removed
- Optimizations to speed up launch

### Bugfix

- Read the version changelog
