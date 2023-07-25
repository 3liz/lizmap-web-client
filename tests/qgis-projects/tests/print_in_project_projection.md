# Test Print in QGIS project projection

**Project : print_in_project_projection**

## Procedure

### Test with the QGIS project with an external IGN base layer

* [ ] Click on print tool in the left menu
* [ ] Choose the scale `1000`, keep the other fields as default
* [ ] Launch the print by clicking on the blue button
* [ ] Open the exported PDF, set the Zoom to 100%.
      On 3Liz Dell screen, set to 49% to have a A4 size. (Etienne's screen)
With Evince on Ubuntu, make sure that the 100% Zoom respects your screen resolution and shows the real size.
If you have a real A4 paper sheet, you can check the size of the page in the screen equals the real A4 page
and adapt the Zoom accordingly.
* [ ] Measure one of the line with your real school ruler, for example the one with the label `68.82`.
* [ ] Check this line is drawn at the correct size: it should measure approximately `6.9 cm` on your screen
* [ ] Check the extent of the map in the PDF corresponds to the rectangle drawn with the print tool
It could be 1 to 3 % different, but not 20%
* [ ] Check a green line (or point) is visible in the Overview map in the PDF
