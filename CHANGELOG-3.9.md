# Changelog Lizmap 3.9

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords: backend, tests, test, translation, funders, important
-->

## Unreleased

### Funders

* **[CC Bièvre Est](https://www.bievre-est.fr/)**
* **[Etra](https://www.etraspa.it/)**, and developed by **[Faunalia](https://www.faunalia.eu/fr)** with @mind84
* **[Golfe du Morbihan Vannes agglomération](https://www.golfedumorbihan-vannesagglomeration.bzh/)**
* **[VSB Energy](https://www.vsb.energy/)**

### Added

* Circular geometry measurement on draw
* Import and export drawings as [FlatGeobuf](https://flatgeobuf.org/)
* Form filter: filter autocomplete list based on previous applied filters
* Be able to set a maximum zoom for points, lines or polygons when zooming
* New import Shapefile into the drawing toolbox
* JS External OpenLayers Layer: defined custom title
* Adding Open Layers format for reading WFS capabilities data

### Changed

* Changed HTML layout due to migration to Bootstrap 5

### Backend

* Expose more OpenLayers and lit classes
* Reduce `mainLizmap` dependencies in all JavaScript code
