# Changelog Lizmap 3.5

## Version 3.5.0

### Added

- Add Romanian localization PlotLy file for the dataviz panel (contribution from @ygorigor)
- Allow PostgreSQL geography type (contribution from @flobz)
- Reverse geometry button: when editing a line or polygon feature, you can reverse vertices order.

### Changed

- Replace OpenLayers 2 overviewmap by OL6 one. Overviewmap now zoom in/out with main map.
- Allow new OpenLayers Map to be used on top of OL2 one
- Update OpenLayers to 6.5

### Fixed

### New JS events

- `lizmappopupallchildrendisplayed` is raised when all children popups have been displayed
