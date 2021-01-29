# Changelog Lizmap 3.4

## Version 3.4.2

Not released yet

- Fix lizmap/install/set_rights.sh: some directories were missing
- Fix visual blank line between the map and the right-dock
- Fix error about script.php into the docker container 

## Version 3.4.1

Release on 2021-01-14

- Fix drill-down (cascading) forms in Lizmap based on QGIS expression
- Fix draw: import KML does not draw anythings if xml headers
- Fix regression in 3.4.0 about Primary Keys enclosing for UPDATE RETURNING
- Fix the landing page shouldn't show project when not available for groups ACL
  Users in admins groups with rights to remove repositories no longer have
  access to every maps
- Fix cache does not work after authorization
- Fix edition tab content is not visible on mobile screen
- Fix regression in edition form with multiple values from relationnal value

- Enhance Drag'N Drop Edition form test to avoid regression
- Enhance form_type_relational_value test

- Fix assert crs is not empty before loading
- Remove warning about lizmap_search
- Fix issues with rights managements: removing rights to manage rights, from all
  users, was still possible in specific case.
- new config parameter to disable the behavior change of the login page,
  introduced in lizmap 3.3.12, which redirect to the main page when the user
  is already authenticated. You can disable it by setting `noRedirectionOnAuthenticatedLoginPage=on`
  into the jcommunity section of the configuration (localconfig.ini.php).
- Fix attribute edition sets to null unedited fields
- Search - Use a transaction to avoid PostgreSQL connection issue

## Version 3.4.0

Released on 2020-12-18

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
