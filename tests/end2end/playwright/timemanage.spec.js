const { test, expect } = require('@playwright/test');

test.describe('Time Manager', () => {

  test('Time Manager', async ({ page }) => {
    const url = '/index.php/view/map?repository=testsrepository&project=time_manager';
    await page.goto(url, { waitUntil: 'networkidle' });

    // when Time manager is running, 2 requests are send for each time range
    // - getFilterToken with method POST, returning a json with a token
    // - getMap that use the token 
    // there is 3 time range in the test data, we'll check each
    const timeRequest = [
      { 'start': '2007-01-01', 'end': '2011-12-31' },
      { 'start': '2012-01-01', 'end': '2016-12-31' },
      { 'start': '2017-01-01', 'end': '2021-12-31' }
    ];
    
    const responseMatchGetFilterTokenFunc = function (response) {
      return (response.request().method() == 'POST' &&  response.request().postData().match(/GetFilterToken/i));
    };

    let firstRun = true;
    for (let timeObj of timeRequest) {
      // will catch getFilterToken response
      let getFilterTokenPromise = page.waitForResponse(responseMatchGetFilterTokenFunc);

      // will catch GetMapRequest
      let getMapRequestPromise = page.waitForRequest(/GetMap/);

      if (firstRun) {
        // promises are setup, launch the timemanager
        await page.locator('#button-timemanager').click();
        await page.locator('#tmTogglePlay').click();
        firstRun = false;
      }
      // wait for the getFilterToken response
      let getFiltertokenResponse = await getFilterTokenPromise;
      // check the json response contains token prop
      expect((await getFiltertokenResponse.json())).toHaveProperty('token');
      let getMapRequest = await getMapRequestPromise;
      // check request is build with token
      expect(getMapRequest.url()).toMatch(/FILTERTOKEN/);
      // re-send the request with additionnal echo param to retrieve the WMS Request
      let echoGetMap = await page.request.get(getMapRequest.url() + '&__echo__');
      const originalUrl = decodeURIComponent(await echoGetMap.text());

      // expected request params
      const expectedParamValue = [
        {'param' : 'version', 'expectedvalue' : '1.3.0'},
        {'param' : 'service', 'expectedvalue' : 'WMS'},
        {'param' : 'format', 'expectedvalue' : 'image/png'},
        {'param' : 'request', 'expectedvalue' : 'getmap'},
        {'param' : 'filter', 'expectedvalue' : 'time_manager: ( ( "test_date" >= \''+ timeObj.start +'\' ) AND ( "test_date" <= \''+ timeObj.end +'\' ) ) '},

      ];
      // check if WMS Request params are as expected 
      const urlObj = new URLSearchParams(originalUrl);
      for( let obj of expectedParamValue) {
        expect(urlObj.get(obj.param)).toBe(obj.expectedvalue);
      }
    }

    // back to normal behaviour => no token in request
    // closing time manager
    await page.locator('.btn-timemanager-clear').click();
    
    // will catch GetMapRequest
    let getMapNoFiltertPromise = page.waitForRequest(/GetMap/);
    // move to force request
    await page.locator('button.zoom-in').click();
    let getMapNoFilter = await getMapNoFiltertPromise;
    // assert no more filter token
    expect(getMapNoFilter.url()).not.toMatch(/FILTERTOKEN/i);
   
  });


});
