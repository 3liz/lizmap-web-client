# Changelog Lizmap 3.5

## Version 3.5.0

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

### Changed

- Overviewmap now zoom in/out with main map. Replace OpenLayers 2 overviewmap by the OpenLayers 6 one.
- Allow new OpenLayers Map to be used on top of OL2 one
- Update OpenLayers to 6.5

### Fixed

### New JS events

- `lizmappopupallchildrendisplayed` is raised when all children popups have been displayed

### Backend

- Major refactoring of Lizmap source code done by @alagroy-42
- Upgrade Jelix to 1.6.32  
- Improve testings using Docker, Cypress, PHPUnit etc
