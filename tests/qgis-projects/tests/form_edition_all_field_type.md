###  Integer

* [ ] When typing text (e.g. 'foo') in `integer_field` and submiting an error message should warn about invalidity
* [ ] When typing '2147483648' value (too big) in `integer_field` and submiting an error message should warn about invalidity
* [ ] When typing '-2147483649' value (negative too big) in `integer_field` and submiting an error message should warn about invalidity

* [ ] When typing negative value (e.g. '-1') in `integer_field` and submiting an message should confirm form had been saved
* [ ] When typing zero value in `integer_field` and submiting an message should confirm form had been saved
* [ ] When typing positive value (e.g. '1') in `integer_field` and submiting an message should confirm form had been saved

###  Boolean

* [ ] `boolean_notnull_for_checkbox` field should be submitted w or w/ being checked (FAIL)
* [ ] `boolean_nullable` should show a dropdown menu with an NULL/empty, a true and a false value (FAIL)
