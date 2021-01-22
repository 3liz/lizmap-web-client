### Test value relation widget

Lizmap plugin installed for QGIS Server is needed

#### Check the default form

* [ ] Click on add a `point` in the *Edition* panel (do not  click on the map yet)
* [ ] Check that the *No expression* available values has **5** options :
  * [ ] **Zone A1**
  * [ ] **Zone A2**
  * [ ] **Zone B1**
  * [ ] **Zone B2**
  * [ ] an empty value
* [ ] Check that the *Simple expression* available values has **3** options :
  * [ ] **Zone A1**
  * [ ] **Zone B1**
  * [ ] an empty value
* [ ] Check that the *Child field* available values has **1** option :
  * [ ] an empty value
* [ ] Check that the *Geom expression* available values has **1** option
  * [ ] an empty value

#### Check the drill-down fields

* [ ] Click on add a `point` in the *Edition* panel (do not  click on the map yet)
* [ ] Select **Zone A** for *Parent field*
* [ ] Check that the *Child field* available values has **3** options :
  * [ ] **Zone A1**
  * [ ] **Zone A2**
  * [ ] an empty value
* [ ] Select **Zone B** for *Parent field*
* [ ] Check that the *Child field* available values has **3** options :
  * [ ] **Zone B1**
  * [ ] **Zone B2**
  * [ ] an empty value
* [ ] Select **No Zone** for *Parent field*
* [ ] Check that the *Child field* available values has **1** option :
  * [ ] an empty value

#### Check the field available values filtered by geometry

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
