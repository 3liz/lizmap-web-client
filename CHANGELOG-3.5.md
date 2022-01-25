# Changelog Lizmap 3.5

## Unreleased

### Added

- A new panel in the administration interface can display QGIS Server information such version and plugins.
  - This information can be retrieved as well in the QGIS Desktop plugin if the administrator login is provided

### Fixed

- Fix server URL when using FCGI for the Lizmap entrypoint
- Fix the value relation widget with multiple text values on feature modification
- Fix a regression in the ValueMap widget config parsing
- Fix the link of selected features between a parent and a child in the attribute table
- Fix a warning into QgisProject with expanded-group-node
- Update IGN URL searching address, the old one will no longer be usable as of February 1, 2022
- Fix Snapping missing when editing existing feature
- Fix geom can be created on existing feature without geometry
- Fix some account management issues with some other authentication modules
- Fix the backup script about third-party modules such as MapBuilder and AltiProfil
- Fix a regression during the init of relation references into forms
- Fix a regression during the loading of embedded projects
- Fix the landing page using modern CSS - Remove JS resizing project thumbnails and use CSS Grid
- Update Lizmap locales about missing languages in the package like Romanian and others

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
