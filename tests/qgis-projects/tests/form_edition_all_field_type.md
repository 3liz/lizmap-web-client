# Test inputs

* [ ] Start by creating a new feature

##  Integer

### Expected error

* [ ] Typing text `foo` in `integer_field` and submit
  * [ ] an error message should warn about invalidity
* [ ] Typing `2147483648` value (too big) in `integer_field` and submit
  * [ ] an error message should warn about invalidity
* [ ] Typing `-2147483649` value (negative too big) in `integer_field` and submit
  * [ ] an error message should warn about invalidity

### Success

* [ ] Typing negative value `-1` in `integer_field` and submit
  * [ ] a message should confirm form had been saved
* [ ] Typing zero value in `integer_field` and submit
  * [ ] a message should confirm form had been saved
* [ ] Typing positive value (e.g. '1') in `integer_field` and submit
  * [ ] a message should confirm form had been saved

###  Boolean

**Note from Etienne 14/01/21**, these 2 tests below are failing for now, and it seems expected for now :(

* [ ] `boolean_notnull_for_checkbox` field should be submitted with or without being checked
* [ ] `boolean_nullable` should show a dropdown menu with :
  * an NULL/empty
  * a true value
  * a false value
