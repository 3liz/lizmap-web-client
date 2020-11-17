* [ ] When clicking on single `layer_with_no_filter` layer's feature, the popup should show edition and deletion capabilities

* When not connected :
    * [ ] No `filter_layer_by_user` layer's features should be visible
    * [ ] All three `filter_layer_by_user_edition_only` layer's features should be visible

* When connected as `admin` :
    * [ ] Only point label `admin` of `filter_layer_by_user` layer should be visible
    * [ ] All three `filter_layer_by_user_edition_only` layer's features should be visible
    * [ ] When clicking on two points with label 'admin', the popup should show edition and deletion capabilities
    * [ ] When clicking on other points, the popup should NOT show edition and deletion capabilities

* [ ] When adding `admins` group with `Always see complete layers data, even if filtered by login` parameter for `tests` repository in administration => all 3 features of `filter_layer_by_user` layer should be visible. Check this with or without Lizmap as QGIS Server plugin. (disable this repository option for other tests then)
