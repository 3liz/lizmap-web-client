# Changelog Lizmap 3.5

## Version 3.5.0

### Added

- Add Romanian localization PlotLy file for the dataviz panel (contribution from @ygorigor)
- Allow PostgreSQL geography type (contribution from @flobz)
- Reverse geometry button: when editing a line or polygon feature, you can reverse vertices order.

### Changed

- Replace OpenLayers 2 overviewmap by OL6 one. Overviewmap now zoom in/out with main map.
- Update OpenLayers to 6.5

### Fixed

### New JS events

- `lizmappopupallchildrendisplayed` is raised when all children popups have been displayed
