# Changelog Lizmap 3.6

## Unreleased

### Added

* Before opening a QGIS project, Lizmap is now checking that :
  * Lizmap QGIS server plugin is running with a minimum required version
  * QGIS server version is running with at least 3.10
  * These two versions are hardcoded in the source code and updated when a new version of Lizmap is released
* Lizmap Web Client won't display old CFG file according to the Lizmap Web Client target version defined in QGIS Desktop
  * These projects will still be visible in the administration panel to let you know that you need to upgrade them
  * Be careful to the combobox selector in the QGIS plugin.
  * The minimum version will be raised and advertised for each release of a major version of Lizmap Web Client.
* Display the version of Py-QGIS-Server in the administration panel if it's used

### Fixed

* Better management of paths for Lizmap repositories
* Fixed PHP syntax error in the dataviz module, contribution from @RobiFag
* Fix button to toggle compact/explode table view in popups. Also each button only toggle its own children popup group
* Fix some requests to QGIS Server

### Tests

* Add more tests about Cypress

## 3.6.0-beta.2 - 2022-07-29

### Fixed

* Fix configuration form of email: sender email was always required.
  Add also more explanations to fill correctly email parameters.
* Fix display of the new rights interface
* Fix display of admin forms for themes & landing page
* Fix some compatibility issue with some php packages of dependencies with PHP 7.4
* Fix some potential issues about rights on some temporary files

## 3.6.0-beta.1 - 2022-07-27

### Added

* **Base maps**: New https://opentopomap.org as basemap, it's available in the QGIS desktop plugin
* **Popup**: New option in the desktop plugin to allow the download or not of the feature
* **Maps**: Use values instead of keys in the layer attribute table and Lizmap form filter tool.
  It works for fields configured with the widgets "Value map", "Value relation", "Relation reference"
  (if the layer which is the source of the field widget content is published in WFS).
* **Maps**: take care of `filter` and `popup` parameters from the URL when viewing a map
  in order to zoom directly to the defined features and to display popups
* **Maps**: When an error appeared during the load of a project, the user interface
  has been improved to show a better message, instead of the unreadable "SERVICE NON DISPONIBLE" error message.
* **Form filter**: If the filtered layer is related to other layers with a "one to many" relations, the child
  features of the related layers will also be filtered when the parent layer is filtered with the form
  (cascading filter). The parent filtered layer and the related layers should be added
  in the attribute table tool to activate this behavior.
* **Administration**: add a new page in the admin panel showing the **list of published projects**
  in a dynamic table.
  * **Visible properties**: `repository`, project `name`, `modification date`, `projection`,
    `layer count`, `qgis desktop version`, `lizmap plugin version`, `authorized groups`
  * The background of some properties are **colored based on the values**
    to help the admin see what must be corrected:
    * QGIS version:
      * `lightyellow` if the version is old compared to the QGIS Server (minor version difference > 6)
      * `lightcoral` if the QGIS desktop version is above the installed QGIS Server version
    * Layer count:
      * `lightyellow` if above 100,
      * `lightcoral` if above 200
    * Projection:
      * `lightcoral` if it is a user defined projection
  * **Tooltips** have been added to show more information on hover
    * Repository: shows the label
    * Project name: shows the project `title` and `abstract`
    * QGIS version, layer count and projection: shows a help message if an issue has been detected
  * The admin user will be able to **sort the projects* by clicking on the columns header
    or **filter the list** by typing the searched value in the top text input.
  * A right **sidebar** shows the project information when a line is selected: project image, title, abstract.
  * More project properties are shown if the proprietary tool `qgis-project-validator` has been used to
    generate the expected JSON and LOG files for each project:
    * **Invalid layers** count and list of layer names with the `datasource` visible in the tooltip
    * **Memory used** to load the project (in Mo)
    * **Loading time** of the project (in seconds)
    * **QGIS Log file** written when loading the project
  * Funded by **Valabre** (Centre de gravité de la formation des métiers de la Sécurité Civile,
    de la Recherche, des Nouvelles Technologies et de la Prévention dans le domaine des risques naturels)
* **Administration** new interface to manage rights, easier to use, especially when there are many groups
* **Layer legend**: Enable auto display the legend image for a layer at startup
* **Edition**: New button to restart drawing geometry - Provide the capability to update geometry with GPS and form coordinates
* New `-dry-run` for the cache generation to see how many tiles might be generated

### Fixed

* Fix the download of files (layer export, PDF) depending on the web-browser (and its version)
* Selected theme can be selected again without selecting another one before
* The style was not updated when the layer has a shortname and was included in a QGIS theme
* CLI tool about cache : fix an issue about the `-bbox` parameter out of the tile matrix limit
* Provide the dataviz button in the left menu only there is at least one non filtered dataviz
* Javascript error when clicking on an atlas link when no feature ID was found
* Fix infinite HTTP loop when the user hasn't any access to the default project
* Fix the attribute table order defined in QGIS desktop
* Fix the "zoom to layer" button when the layer is in EPSG:4326 (Funded by Geocobet)
* When a layer has a shortname, fix one issue about dataviz & relations and fix the children popup wasn't displayed
* Dataviz & relations - Fix possible bug when layer has a shortname

### Changed

* Improve the table in the right's management panel when having a dozen of groups
* Add tolerance for clicking on mobile to get the popup
* Do not build the attribute table when refreshing attribute table
* The option "Use layer IDs" in the project properties is not possible anymore

### Backend

* Support from PHP 7.4 to 8.1
* Lizmap QGIS server plugin has been split in two different plugins : server and desktop
* Internal PHP code
  * New method in `AppContext` to get user public groups id
  * Convert QGIS XML `Option` value based on type attribute
  * Add a revision parameter on assets url for cache
  * Add ETag HTTP header to GetCapabilities, GetProjectConfig, GetProj4 and WMTS GetTile responses
  * New class `\Lizmap\Request\OGCResponse`
* Update Jelix to 1.8-pre
* Update PHP CS Fixer to 3.8.0
* Update to NodeJS 16

### Translations

* Update from Transifex about translated strings
* New Norwegian language

### Tests

* End2End: Add Lizmap Service requests tests
* End2End: Update Cypress to 9.5.0
* Use the new command line `docker compose`
