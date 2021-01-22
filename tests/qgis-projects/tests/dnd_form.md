# Test Drag&Drop form

## Procedure

### Update features

* [ ] Click on the only one `dnd_form_geom` feature to open the popup
  * [ ] Check that `Field in` field should not be empty
  * [ ] Check that `Field not in` field should not be empty
* [ ] Click edition button, save form without modification, click on the feature to display the popup
  * [ ] Check that `Field in`  field should not be empty
  * [ ] Check that `Field not in` field should not be empty
* [ ] Click edition button, save form with `Field in` modification, click on the feature to display the popup
  * [ ] Check that `Field in` field should be modified
  * [ ] Check that `Field not in` field should not be empty and has not changed
* [ ] Click edition button, move the point and save form without modification
  * [ ] Check that the point has moved

* [ ] Open attribute table tool then `dnd_form` layer details
  * [ ] Click edition button and save form without modification
  * [ ] Check that `Field not in` field should not be empty
  * [ ] Click edition button and save form with `Field in` modification
  * [ ] Check that `Field in` field should be modified
  * [ ] Check that `Field not in` field should not be empty

### Create features

* [ ] Create a new `dnd_form_geom` feature
  * [ ] Set `Field in` input value and draw a point
  * [ ] Save the new `dnd_form_geom` feature and get no error message
  * [ ] Check that a new point is displayed on the map
* [ ] Click on the new `dnd_form_geom` feature
  * [ ] Check that `Field in`  field should not be empty
  * [ ] Check that `Field not in` field should be empty

* [ ] Open attribute table tool then `dnd_form` layer details
  * [ ] Click Add a feature button, set `Field in` input value and save
  * [ ] Check that a new line has been added to the table
  * [ ] Check that `Field in` field should not be empty
  * [ ] Check that `Field not in` field should be empty

### Display forms

* [ ] In desktop and mobile context, launch `dnd_form` edition and look at `dnd_form` form
  * [ ] `tab1` must display `id` input field and `tab2` must display `Field in` input
