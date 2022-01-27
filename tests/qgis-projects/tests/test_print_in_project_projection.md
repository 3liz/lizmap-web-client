# Test Print in QGIS project projection

Since LWC 3.4.4 and 3.5.x, the print command uses the project projection to print the map,
whenever the LWC web map is not in the same projection as the project.

This allows to avoid scale issues in printed PDF or PNG.

For LWC >= 3.4.4 and < 3.5.0, this behaviour is deactivated by default, but can
be manually activated within the browser javascript console

**Project : test_print**

## Procedure

### Test with the QGIS project with an external IGN base layer

* [ ] Check that the project in Pseudo-Mercator: scale must be like `1:4 514` and not like `1:1 000`
* [ ] Open the Javascript console in your Web browser and set the variable: `lizMap.config.options.printInProjectProjection = 'True'`
* [ ] Click on print tool in the left menu
* [ ] Choose the scale `1000`, keep the other fields as default
* [ ] Launch the print by clicking on the blue button
* [ ] Open the exported PDF, set the Zoom to 100%.
With Evince on Ubuntu, make sure that the 100% Zoom respects your screen resolution and shows the real size.
If you have a real A4 paper sheet, you can check the size of the page in the screen equals the real A4 page
and adapt the Zoom accordingly.
* [ ] Measure one of the line with your real school ruler, for example the one with the label `68.82`.
* [ ] Check this line is drawn at the correct size: it should measure approximately `6.9 cm` on your screen
* [ ] Check the extent of the map in the PDF corresponds to the rectangle drawn with the print tool
It could be 1 to 3 % different, but not 20%
* [ ] Check a green line (or point) is visible in the Overview map in the PDF
* [ ] Refresh the map, do not change the variable `lizMap.config.options.printInProjectProjection` in the console, and re-test. The line must have a wrong size
