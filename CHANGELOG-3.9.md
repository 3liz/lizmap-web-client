# Changelog Lizmap 3.9

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords: backend, tests, test, translation, funders, important
-->

## Unreleased

## 3.9.0-beta.1 - 2025-02-07

### Funders

* **[Andromède Océanologie](https://www.andromede-ocean.com/)**
* **[CC Bièvre Est](https://www.bievre-est.fr/)**
* **[Etra](https://www.etraspa.it/)**, and developed by **[Faunalia](https://www.faunalia.eu/fr)** with @mind84
* **[Métropole Aix-Marseille-Provence](https://ampmetropole.fr/)**
* **[Golfe du Morbihan Vannes agglomération](https://www.golfedumorbihan-vannesagglomeration.bzh/)**
* **[VSB Energy](https://www.vsb.energy/)**

### Important

* PHP 8.1 minimum is **required**

### Added

* Editing
  * Make sure the dock with the form is visible before opening the cancellation confirmation dialog
* Drawing :
  * Circular geometry measurement on draw, contribution from @mind84
  * Add button to rotate geometries
  * Add split tool. Switch to editing and select split features
* `lizmap-features-table`, optionally :
  * Show the currently highlighted feature geometry in the map with `data-show-highlighted-feature-geometry="true"`
  * Centre the map to this geometry with `data-center-to-highlighted-feature-geometry="true"`
  * Improve the logic of the opening
* Import and export drawings as [FlatGeobuf](https://flatgeobuf.org/)
* Form filter: filter autocomplete list based on previous applied filters
* Be able to set a maximum zoom for points, lines or polygons when zooming
* New import Shapefile into the drawing toolbox
* JS External OpenLayers Layer: defined custom title
* Adding Open Layers format for reading WFS capabilities data
* Support for `X-Request-Id`

### Changed

* Activate the "Locate by layer" by default

### Backend

* Only use Guzzle to send requests from PHP
* Parsing QGIS Project with PHP XMLReader instead of DOM
* Expose more OpenLayers and lit classes
* Reduce `mainLizmap` dependencies in all JavaScript code
* Raise PHP to version 8.1
* Dataviz with PlotlyJS
  * Update to v2.35.2
  * Use a custom build to reduce file size
* Code refactoring :
  * ESLint, StyleLint...
