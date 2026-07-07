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

* Dataviz - Plotly.js is now installed as a regular npm dependency (custom bundle: scatter, bar, box, pie, histogram, histogram2d, scatterpolar, sunburst traces) and exposed as `lizMap.plotlyjs`, instead of being vendored as a static file. It is lazy-loaded (own chunk, plus one small chunk per locale) the first time a plot is actually drawn.

### Backend
