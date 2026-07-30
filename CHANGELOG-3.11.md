# Changelog Lizmap 3.11

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords: backend, tests, test, translation, funders, important
-->

## Unreleased

### Funders

### Important

### Added

* Edition - Support QGIS dynamic default-value expressions in edit forms, including geometry-based (`$x`, `$y`, `$area`, `$length`, `$geometry`) and field-referencing expressions (e.g. `"firstname" || ' ' || "lastname"`). Defaults are re-evaluated when the geometry is drawn/edited and when a referenced field changes, honoring QGIS's `applyOnUpdate` flag.
* New per-layer option `excludeFromSingleWMS` to exclude a layer from the bundled "Load layers as a single WMS layer" request. The excluded layer is fetched individually (directly from its WMS server if `externalWmsToggle` is set, otherwise via QGIS Server). Useful for keeping slow third-party WMS layers out of the bundle. Requires the Lizmap plugin ≥ 5.x to expose the toggle in the UI. ([#6631](https://github.com/3liz/lizmap-web-client/issues/6631))

### Changed

### Backend
