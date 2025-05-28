# Mock

### Helper

To save request response in a file for mocking, you can copy/paste this snippet temporary.

Please consider using a low size PDF file, for testing, if there isn't test done on the PDF file itself, like :
* [tests/qgis-projects/tests/media/test.pdf](../../../qgis-projects/tests/media/test.pdf)
* [tests/end2end/playwright/mock/playwright-test.pdf](./playwright-test.pdf)

```js
const downloadPromise = page.waitForEvent('download');
const download = await downloadPromise;
await download.saveAs(playwrightTestFile('mock', 'print_in_project_projection', 'baselayer', 'Paysage_A4.pdf'));
```
