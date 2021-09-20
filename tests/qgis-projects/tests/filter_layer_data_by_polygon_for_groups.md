# Test the filter by polygon

The QGIS project contains 5 layers

* PostgreSQL
  * **townhalls_pg** is a PostgreSQL point layer configured with editing and attribute table. The filter is set with the context `Editing only`.
  * **shop_bakery_pg** is another PostgreSQL point layer configured with editing and attribute table. The filter is set with the context `Display and editing`.
* Shapefiles
  * **townhalls** The same layer in SHP, configured only with attribute table. The filter is set with the context `Display and editing`.
  * **shop_bakery** The bakey layer in SHP, configured only with attribute table. The filter is set with the context `Display and editing`.

* **polygons** is the layer containing the polygons to filter by. The field `groups` contains the list of group(s) for each feature. The polygons containings the group `group_a` are drawn with a red border. The label helps to see the content of the `groups` field.

## Procedure

In LWC admin panel,

* [ ] Create a group `group_a` and a user `user_in_group_a`,
* [ ] Add `user_in_group_a` to the group `group_a`,
* [ ] Give the group `group_a` the right to view the projects and to edit the data in the Lizmap `tests` repository.

* When not connected :
    * [ ] The user can see the data in the map, popup and attribute table only for the layer `townhalls_pg`.
    * [ ] The user cannot edit the data, even for the layer `townhalls_pg`.

* When connected as `admin` :
    * [ ] All the data of all the layers can be seen in the map and edited.
    * [ ] When clicking on the map on any point in the 2 PostgreSQL layers, the popup should show edition and deletion capabilities.

* When connected as `user_in_group_a`
  * [ ] The user can see all the data in the map, popup and attribute table for the layers `townhalls_pg` and `townhalls_EPSG2154`.
  * [ ] The user can see the data in the map, popup and attribute table for the layers `shop_bakery_pg` and `shop_bakery` **only inside the 3 red polygons**.
  * [ ] The user can only edit data for the layers `townhalls_pg` and `shop_bakery_pg` **inside the 3 red polygons**
    * [ ] For these layers, if the user creates a point or move a point outside the red polygons, an error must be raised: "The given geometry is outside the authorized polygon".
