const { test, expect } = require('@playwright/test');

test.describe('Time Manager', () => {

  test('Time Manager', async ({ page }) => {
    const url = '/index.php/view/map?repository=testsrepository&project=time_manager';
    await page.goto(url, { waitUntil: 'networkidle' });

    const timeRequest = [
      { 'start': '2007-01-01', 'end': '2011-12-31' },
      { 'start': '2012-01-01', 'end': '2016-12-31' },
      { 'start': '2017-01-01', 'end': '2021-12-31' }
    ];
    let firstRun = true;
    for (let timeObj of timeRequest) {
      let getFilterTokenPromise = page.waitForResponse(rep => rep.request().method() == 'POST');
      let getMapRequestPromise = page.waitForRequest(/GetMap/);
      if (firstRun) {
        await page.locator('#button-timemanager').click();
        await page.locator('#tmTogglePlay').click();
        firstRun = false;
      }
      let getFiltertokenResponse = await getFilterTokenPromise;
      expect((await getFiltertokenResponse.json())).toHaveProperty('token');
      let echoGetMap = await page.request.get((await getMapRequestPromise).url() + '&__echo__');
      let getMapParams = [/SERVICE=WMS/i,
        /VERSION=1\.3\.0/i,
        /REQUEST=GetMap/i,
        new RegExp('filter=time_manager:\\s\\(\\s\\(\\s"test_date"\\s>=\\s\'' + timeObj.start + "'\\s\\)\\sAND\\s\\(\\s\"test_date\"\\s<=\\s'" + timeObj.end + "'\\s\\)\\s\\)", 'i'),
        /EXCEPTIONS=application\/vnd\.ogc\.se_inimage/i,
        /FORMAT=image\/png/i,
        /TRANSPARENT=TRUE/i,
      ];
      const originalUrl = decodeURIComponent(await echoGetMap.text());
      for (let y in getMapParams) {
        expect(originalUrl).toMatch(getMapParams[y]);
      }
    }
    
    let getMapNoFiltertPromise = page.waitForRequest(/GetMap/);
    // closing time manager
    await page.locator('.btn-timemanager-clear').click();
    // move to force request
    await page.locator('button.zoom-in').click();
    let getMapNoFilter = await getMapNoFiltertPromise;
    expect(getMapNoFilter.url()).not.toContain('filter=');
  });


});
