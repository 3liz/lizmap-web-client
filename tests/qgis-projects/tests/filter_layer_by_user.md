# Tests login filtering

**Project : filter_layer_by_user**

## Requirements

For the folder `tests`, do not have any `Show even if admin for feature filtered by login` !

## Procedure

* [ ] When clicking on the single red feature of `red_layer_with_no_filter` layer :
  * [ ] the popup should show editing and deleting capabilities

* When not connected :
    * [ ] No `blue_filter_layer_by_user` layer's features should be visible
    * [ ] All three `green_filter_layer_by_user_edition_only` layer's features should be visible

* When connected as `admin` (not even `demo` on lizmap.com) :
    * [ ] Only point label `admin` of `blue_filter_layer_by_user` layer should be visible
    * [ ] All three `green_filter_layer_by_user_edition_only` layer's features should be visible
    * [ ] When clicking on the two points with label `admin`, the popup should show editing and deleting capabilities
    * [ ] When clicking on other points, the popup should **NOT** show editing and deleting capabilities

* [ ] When adding `admins` group with `Always see complete layers data, even if filtered by login` parameter for `tests` repository in administration
  * [ ] All 3 features of `filter_layer_by_user` layer should be visible.
