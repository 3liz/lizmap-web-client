# Changelog Lizmap 3.5

## Version 3.5.0

- Fix: export button allowed in filter data with form when format is ODS

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

### Changed

- Speed up map page loading.
- Overview map now zoom in/out with main map. Replace OpenLayers 2 overview map by the OpenLayers 6 one.
- Allow new OpenLayers Map to be used on top of OL2 one
- Update OpenLayers to 6.6.1
- Update jQuery-ui to 1.12.1
- Action popup module has been improved with new options: confirm property, display a message if configured, raise a JS event with the returned result.

### Fixed

- Print
  - If the map has external base layers such as OpenStreetMap, and is then displayed in Pseudo Mercator (EPSG:3857),
  the exported map is now printed in the QGIS project projection (e.g. EPSG:2154) to avoid wrong scale.
  You can now use your ruler in the printed paper and trust your measure.

### New JS events

- `lizmappopupallchildrendisplayed` is raised when all children popups have been displayed
- `actionResultReceived` is raised when a popup action result is returned

### Backend

- Major refactoring of Lizmap source code done by @alagroy-42
- Keep lizmapProxy and lizmapOGCRequest classes for modules compatibility
- Upgrade Jelix to 1.6.32
- Improve testings using Docker, Cypress, PHPUnit etc
