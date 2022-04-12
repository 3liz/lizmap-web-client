# Test value relation widget

**Project : form_edition_value_relation_field**

Lizmap plugin installed for QGIS Server is needed

## Procedure

### Check the field available values filtered by geometry

Partially covered by Cypress (the move part is not covered)

* [ ] Click on add a `point` in the *Edition* panel
* [ ] Click on the map to draw the point within **Zone A1**
* [ ] Check that the *Geom expression* available values has **2** options :
  * [ ] **Zone A1**
  * [ ] an empty value
* [ ] Move the point on the map within **Zone A2**
* [ ] Check that the *Geom expression* available values has **2** options :
  * [ ] **Zone A2**
  * [ ] an empty value
* [ ] Move the point on the map within **Zone B1**
* [ ] Check that the *Geom expression* available values has **2** options :
  * [ ] **Zone B1**
  * [ ] an empty value
* [ ] Move the point on the map within **Zone B2**
* [ ] Check that the *Geom expression* available values has **2** options
  * [ ] **Zone B2**
  * [ ] an empty value
* [ ] Move the point **outside Zones**
* [ ] Check that the *Geom expression* available values has **1** option :
  * [ ] an empty value
