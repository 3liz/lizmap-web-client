
const { test, expect } = require('@playwright/test');

test.describe('QGIS Requests', () => {


  test('QGIS legend Request Content-type and param', async ({ page }) => {
    const url = '/index.php/view/map?repository=testsrepository&project=layer_legends';
    await page.goto(url, { waitUntil: 'networkidle' });

    const layers_to_check = ['layer_legend_single_symbol', 'layer_legend_categorized']
    for (const layer_name of layers_to_check) {
      // Start waiting for request before clicking. Note no await.
      const legendRequestPromise = page.waitForRequest(/GetLegend/);
      await page.locator('#layer-' + layer_name + ' a[class="expander"]').click();
      let legendRequest = await legendRequestPromise;

      // check response is type image/png
      let legendResponse = await legendRequest.response();
      expect(await legendResponse?.headerValue('Content-Type')).toBe('image/png');

      // get Original WMS request
      let echoLegend = await page.request.get(legendRequest.url() + '&__echo__');
      const originalUrl = decodeURIComponent(await echoLegend.text());

      // expected request params
      const expectedParamValue = [
        {'param' : 'version', 'expectedvalue' : '1.3.0'},
        {'param' : 'service', 'expectedvalue' : 'WMS'},
        {'param' : 'format', 'expectedvalue' : 'image/png'},
        {'param' : 'request', 'expectedvalue' : 'getlegendgraphic'},
        {'param' : 'layer', 'expectedvalue' : layer_name},
      ];

      // check if WMS Request params are as expected
      const urlObj = new URLSearchParams(originalUrl);
      for( let obj of expectedParamValue) {
        expect(urlObj.get(obj.param)).toBe(obj.expectedvalue);
      }
    }
  });
});
