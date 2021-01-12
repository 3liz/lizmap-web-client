### Test value relation widget

Lizmap plugin installed for QGIS Server is needed

#### Check the default form

* [ ] Click on add a `point` in the *Edition* panel (do not  click on the map yet)
* [ ] Check that the *No expression* available values are **Zone A1**, **Zone A2**, **Zone B1**, **Zone B2** and an empty value : 5 options
* [ ] Check that the *Simple expression* available values are **Zone A1**, **Zone B1** and an empty value : 3 options
* [ ] Check that the *Child field* available values are an empty value : 1 option
* [ ] Check that the *Geom expression* available values are an empty value : 1 option

#### Check the drill-down fields

* [ ] Click on add a `point` in the *Edition* panel (do not  click on the map yet)
* [ ] Select **Zone A** for *Parent field*
* [ ] Check that the *Child field* available values are **Zone A1**, **Zone A2** and an empty value : 3 options
* [ ] Select **Zone B** for *Parent field*
* [ ] Check that the *Child field* available values are **Zone B1**, **Zone B2** and an empty value : 3 options
* [ ] Select **No Zone** for *Parent field*
* [ ] Check that the *Child field* available values are an empty value : 1 option

#### Check the field available values filtered by geometry

* [ ] Click on add a `point` in the *Edition* panel
* [ ] Click on the map to draw the point within **Zone A1**
* [ ] Check that the *Geom expression* available values are **Zone A1** and an empty value : 2 options
* [ ] Move the point on the map within **Zone A2**
* [ ] Check that the *Geom expression* available values are **Zone A2** and an empty value : 2 options
* [ ] Move the point on the map within **Zone B1**
* [ ] Check that the *Geom expression* available values are **Zone B1** and an empty value : 2 options
* [ ] Move the point on the map within **Zone B2**
* [ ] Check that the *Geom expression* available values are **Zone B2** and an empty value : 2 options
* [ ] Move the point **outside Zones**
* [ ] Check that the *Geom expression* available values are an empty value : 1 option
