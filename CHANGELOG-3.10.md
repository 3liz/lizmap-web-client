# Changelog Lizmap 3.10

<!--
Format from https://keepachangelog.com/en/1.0.0/
added, fixed, changed, removed, deprecated, security
with some extra keywords: backend, tests, test, translation, funders, important
-->

## Unreleased

### Funders

* **[Digi-Studio](https://digi-stud.io/)**

### Important

* PHP 8.2 minimum is required

### Added

### Changed

* Migrate datatables from client to server side

### Removed

* PHP: drop `lizmapRepository` class, use `\Lizmap\Project\Repository` instead
* PHP: drop `lizmapProject` class, use `\Lizmap\Project\Project` instead
* PHP: drop `lizmapOGCRequest` class, use `\Lizmap\Request\OGCRequest`
* PHP: drop `lizmapProxy` class, use `\Lizmap\Request\Proxy`
* PHP: drop `qgisServer` class, useless since 3.7

### Deprecated

* PHP: deprecate `lizmapWkt` class, use `\Lizmap\App\WktTools` instead

### Backend

* Raise PHP to version 8.2
* Raise docker from Alpine 17 to 21
