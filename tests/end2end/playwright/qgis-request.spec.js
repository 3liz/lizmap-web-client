
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
      let legendParams = [/SERVICE=WMS/i,
        /VERSION=1\.3\.0/i,
        /REQUEST=GetLegendGraphic/i,
        new RegExp('LAYER=' + layer_name, 'i'),
        /STYLE=défaut/i,
        /EXCEPTIONS=application\/vnd\.ogc\.se_inimage/i,
        /FORMAT=image\/png/i,
        /TRANSPARENT=TRUE/i,
        /WIDTH=150/i
      ];
      const originalUrl = decodeURIComponent(await echoLegend.text());
      for (let y in legendParams) {
        expect(originalUrl).toMatch(legendParams[y]);
      }
    }
  });
});