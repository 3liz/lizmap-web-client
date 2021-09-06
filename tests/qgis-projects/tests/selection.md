# Tests selection tool

!!! This test is now made with `selectionTool_spec.js` in Cypress !!!

## Requirements

- `testsrepository` repository must not have any checked checkbox in `Always see complete layers data, even if filtered by login` (Lizmap configuration)!
- Use selection tool with star icon in the dock to make selection

## Procedure

* [ ] When connected as `admin` in `admins` group. Select single point with 'admins' label 
=> '1 selected object' should be displayed and blue point should change to yellow colour

* [ ] Check this behavior with or without Lizmap as QGIS Server plugin (don't forget to restart QGIS Server after Lizmap plugin installation/desinstallation).
