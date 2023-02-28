# Editing - Test the upload of files and images

**Project : form_edition_all_field_type**

## Requirements

Check that there is a folder `media` aside the `tests` folder, containing a sub-folder `specific_media_folder`:

```
|-- tests
  |-- form_edition_all_field_type.qgs
  |-- form_edition_all_field_type.qgs.cfg
  |-- form_edition_all_field_type.md
    |-- media
|-- media
  |-- specific_media_folder
```

## Procedure

* [ ] Go to the **Edition** menu
* [ ] Select the item `form_edition_upload` in the combo box & click on the `Add` button
* In the opened form,
  * [ ] Let empty the first three fields about upload because these are not mandatory
  * [ ] choose not empty text file for the field `text_file_mandatory`, for example the file `tests/qgis-projects/demoqgis/media/text/exemple.txt`
  * [ ] choose an image file for the field `image_file_mandatory`, for example the file `tests/qgis-projects/demoqgis/montpellier.qgs.png`
  * [ ] choose an image file for the field `image_file_specific_root_folder`, for example the file `tests/qgis-projects/demoqgis/montpellier.qgs.png`
* [ ] Validate the form with the button **Save**
* [ ] Go to the **attribute table** panel and open the `form_edition_upload`
* [ ] Check that the content of the field :
  * [ ] `text_file_mandatory` is working
  * [ ] `image_file_mandatory` is working with the `media/` directory
  * [ ] `image_file_specific_root_folder`, in a **new tab** is working  with the `../media/specific_media_folder/`
* [ ] Delete the data line with the **trash** button
* [ ] Refresh the tab showing `image_file_specific_root_folder`, it must return a 404
