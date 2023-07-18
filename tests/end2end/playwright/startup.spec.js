// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Startup', () => {

  test('Zoom to features extent', async ({ page }) => {
    const url = '/index.php/view/map/?repository=testsrepository&project=startup&layer=sousquartiers&filter="quartmno"%20=%20%27PA%27%20OR%20"quartmno"%20=%20%27HO%27';
    await page.goto(url, { waitUntil: 'networkidle' });

    // Hide all elements but #map and its children
    await page.$eval("*", el => el.style.visibility = 'hidden');
    await page.$eval("#baseLayersOlMap, #baseLayersOlMap *", el => el.style.visibility = 'visible');

    expect(await page.locator('#baseLayersOlMap').screenshot()).toMatchSnapshot('zoom-features-extent.png', {
      maxDiffPixels: 700
    });
  });
  
  test('Projects with dot or space can load', async ({page}) => {
    const url_dots = '/index.php/view/map/?repository=testsrepository&project=base_layers+with+space';
    await page.goto(url_dots, { waitUntil: 'networkidle' });
    await page.$eval("#map, #map *", el => el.style.visibility = 'visible');
    await expect( page.locator('#node-quartiers')).toHaveCount(1);
    
    const url_space = '/index.php/view/map/?repository=testsrepository&project=base_layers.withdot';
    await page.goto(url_space, { waitUntil: 'networkidle' });
    await page.$eval("#map, #map *", el => el.style.visibility = 'visible');
     
    await expect( page.locator('#node-quartiers')).toHaveCount(1);
  });
});