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

### Changed

### Fixed

* Popup - Compact table of children features: build the columns from all the displayed features instead of the first one only, so features having more empty fields no longer produce rows with missing cells and a DataTables `Requested unknown parameter` warning

### Backend
