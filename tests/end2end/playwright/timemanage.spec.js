const { test, expect } = require('@playwright/test');

test.describe('Time Manager', () => {

  test('Time Manager', async ({ page }) => {
    const url = '/index.php/view/map?repository=testsrepository&project=time_manager';
    await page.goto(url, { waitUntil: 'networkidle' });

    const timeRequest = [
      { 'start': '2007-01-01', 'end': '2011-12-31' },
      { 'start': '2012-01-01', 'end': '2016-12-31' }
    ];
    let firstRun = true;
    for (let timeObj of timeRequest) {
      let legendRequestPromise = page.waitForRequest(/GetMap/);
      if (firstRun) {
        await page.locator('#button-timemanager').click();
        await page.locator('#tmTogglePlay').click();
        firstRun = false;
      }

      let echoLegend = await page.request.get((await legendRequestPromise).url() + '&__echo__');
      let legendParams = [/SERVICE=WMS/i,
        /VERSION=1\.3\.0/i,
        /REQUEST=GetMap/i,
        new RegExp('filter=time_manager:\\s\\(\\s\\(\\s"test_date"\\s>=\\s\'' + timeObj.start + "'\\s\\)\\sAND\\s\\(\\s\"test_date\"\\s<=\\s'" + timeObj.end + "'\\s\\)\\s\\)", 'i'),
        /EXCEPTIONS=application\/vnd\.ogc\.se_inimage/i,
        /FORMAT=image\/png/i,
        /TRANSPARENT=TRUE/i,
      ];
      const originalUrl = decodeURIComponent(await echoLegend.text());
      for (let y in legendParams) {
        expect(originalUrl).toMatch(legendParams[y]);
      }


    }
  });


});
