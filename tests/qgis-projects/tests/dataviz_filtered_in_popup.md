# Tests the dataviz is properly displayed in the parent popup even when it is not displayed in the dataviz dock

**Project : dataviz_filtered_in_popup**

## Procedure

* [ ] Click on the dataviz menu to verify no plot is displayed
  (at present, LWC does not hide the dataviz menu when there is no non-filtered dataviz plots to show in the dock)
* [ ] Click on the central polygon with the number **5**:
  you should see in the popup the dataviz bar chart showing a single bar with the value `4`
  (because there are 4 points in the polygon with ID 5)
