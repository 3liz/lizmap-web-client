# Editing - Test the upload of files and images

**Project : form_edition_all_field_type**

## Requirements

Check that there is a folder `media` aside the `tests` folder, containing a subfolder `specific_media_folder`:

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
  * [ ] choose a text file for the field `text_file_mandatory`, for example the file `tests/qgis-projects/demoqgis/media/text/exemple.txt`
  * [ ] choose an image file for the field `image_file_mandatory`, for example the file `tests/qgis-projects/demoqgis/montpellier.qgs.png`
  * [ ] choose an image file for the field `image_file_specific_root_folder`, for example the file `tests/qgis-projects/demoqgis/montpellier.qgs.png`
* [ ] Validate the form with the button **Save**
* [ ] Check that the image `montpellier.qgs.png` has been stored in the folder `../media/specific_media_folder/`
* [ ] Go to the **data** menu and click on the button **Detail** next to the layer name `form_edition_upload`
* [ ] Check that the content of the field `image_file_specific_root_folder` is a working link to the media http://lizmap.local:8130/index.php/view/media/getMedia?repository=testsrepository&project=form_edition_all_field_type&path=../media/specific_media_folder/montpellier.qgs.png
* [ ] Delete the data line with the **trash** button and check that the file `../media/specific_media_folder/montpellier.qgs.png` has also been deleted.
