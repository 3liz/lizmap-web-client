# Changelog Lizmap 3.6

## Unreleased

### Added

* Administration: add a new page in the admin panel showing the list of published projects in a dynamic table. 

  * **visible properties**: repository, project name, modification date, projection, 
    layer count, qgis desktop version, lizmap plugin version, acl groups
  * The background of some properties are colored based on the values 
    to help the admin see what must be corrected:
    * QGIS version: 
      * lightyellow if the version is old compared to the QGIS Server (minor version difference > 6)
      * lightcoral if the QGIS desktop version is above the installed QGIS Server version
    * Layer count: 
      * lightyellow if above 100, 
      * lightcoral if above 200
    * Projection: 
      * lightcoral if it is a user defined projection
  * **Tooltips** have been added to show more information on hover
    * Repository: shows the label
    * Project: shows the title and abtract
    * QGIS version, layer count and projection: shows a help message if an issue has been detected
  * The admin user will be able to sort the projects by clicking on the columns header 
    or filter the list by typing the searched value in the top text input.
  * Funded by Valabre (Centre de gravité de la formation des métiers de la Sécurité Civile, de la Recherche, des Nouvelles Technologies et de la Prévention dans le domaine des risques naturels)

* Internal PHP code

  * New method in AppContext to get user public groups id
  * Convert QGis XML Option value based on type attribute
  - Add a revision parameter on assets url for cache



### Tests

- e2e: Add Lizmap Service requests tests
- e2e: Update Cypress to 9.5.0
