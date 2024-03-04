import { test, expect } from '@playwright/test';

test.describe('Attribute table', () => {
  test.beforeEach(async ({ page }) => {
    const url = '/index.php/view/map/?repository=testsrepository&project=attribute_table';
    await page.goto(url, { waitUntil: 'networkidle' });

    await page.locator('#button-attributeLayers').click();
  });

  test('should have correct column order', async ({ page }) => {
    const correct_column_order = [
      '',
      'quartier',
      'quartmno',
      'libquart',
      'photo',
      'url',
    ];

    // postgreSQL layer
    var getFeaturePromise = page.waitForResponse(response => 
      response.request().postData().match(/SERVICE=WFS/i) &&
      response.request().postData().match(/REQUEST=GetFeature/i) &&
      response.request().postData().match(/TYPENAME=quartiers/i) &&
      response.request().postData().match(/OUTPUTFORMAT=GeoJSON/i)
    );

    await page
      .locator(
        'button[value="Les_quartiers_a_Montpellier"].btn-open-attribute-layer'
      )
      .click({ force: true });

    // Wait for features
    await getFeaturePromise;

    var theaders = await page.locator(
      '#attribute-layer-table-Les_quartiers_a_Montpellier_wrapper div.dataTables_scrollHead th'
    ).allInnerTexts();

    expect(theaders).toEqual(correct_column_order);

    // shapefile layer
    var getFeaturePromise = page.waitForResponse(response => 
      response.request().postData().match(/SERVICE=WFS/i) &&
      response.request().postData().match(/REQUEST=GetFeature/i) &&
      response.request().postData().match(/TYPENAME=quartiers_shp/i) &&
      response.request().postData().match(/OUTPUTFORMAT=GeoJSON/i)
    );

    await page.locator('#nav-tab-attribute-summary').click();

    await page
      .locator('button[value="quartiers_shp"].btn-open-attribute-layer')
      .click({ force: true });

    // Wait for features
    await getFeaturePromise;

    var theaders = await page.locator(
      '#attribute-layer-table-quartiers_shp_wrapper div.dataTables_scrollHead th'
    ).allInnerTexts();

    expect(theaders).toEqual(correct_column_order);
  });

  test('should select / filter / refresh', async ({ page }) => {
    await page
      .locator('#bottom-dock-window-buttons .btn-bottomdock-size')
      .click();

    // PostgreSQL layer
    var getFeaturePromise = page.waitForResponse(response => 
      response.request().postData().match(/SERVICE=WFS/i) &&
      response.request().postData().match(/REQUEST=GetFeature/i) &&
      response.request().postData().match(/TYPENAME=quartiers/i) &&
      response.request().postData().match(/OUTPUTFORMAT=GeoJSON/i)
    );

    await page
      .locator(
        'button[value="Les_quartiers_a_Montpellier"].btn-open-attribute-layer'
      )
      .click({ force: true });

    // Wait for features
    await getFeaturePromise;

    // Check table lines
    await expect(
      page.locator(
        '#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr'
      )
    ).toHaveCount(7);

    // select feature 2
    var getSelectionTokenPromise = page.waitForResponse(response => 
      response.request().postData().match(/SERVICE=WMS/i) &&
      response.request().postData().match(/REQUEST=GETSELECTIONTOKEN/i) &&
      response.request().postData().match(/TYPENAME=quartiers/i) &&
      response.request().postData().match(/ids=2/i)
    );

    var getMapPromise = page.waitForResponse(response => 
      response.request().url().match(/REQUEST=GETMAP/i)
    );

    await page
      .locator(
        '#attribute-layer-table-Les_quartiers_a_Montpellier tr[id="2"] lizmap-feature-toolbar .feature-select'
      )
      .click({ force: true });

    const getSelectionResponse = await getSelectionTokenPromise;
    const getSelectionToken = (await getSelectionResponse.json()).token;
    expect(getSelectionToken).not.toBeNull;

    const getMapResponse = await getMapPromise;
    const getMapToken = new URL(getMapResponse.request().url()).searchParams.get('SELECTIONTOKEN');
    
    // Check that GetMap is requested with the selection token
    expect(getSelectionToken).toEqual(getMapToken);

  //   // filter
  //   await page
  //     .locator(
  //       '#attribute-layer-main-Les_quartiers_a_Montpellier .attribute-layer-action-bar .btn-filter-attributeTable'
  //     )
  //     .click({ force: true });

  //   // Wait for features
  //   await page.FIXME_wait('@postGetFeature');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('SERVICE=WFS');
  //     expect(interception.request.body).toContain('REQUEST=GetFeature');
  //     expect(interception.request.body).toContain('TYPENAME=quartiers');
  //     expect(interception.request.body).toContain('OUTPUTFORMAT=GeoJSON');
  //     expect(interception.request.body).toContain('EXP_FILTER=%24id+IN+(+2+)');
  //     expect(interception.response.body).toHaveProperty('type');
  //     expect(interception.response.body.type).FIXME_be_eq('FeatureCollection');
  //     expect(interception.response.body).toHaveProperty('features');
  //     expect(interception.response.body.features).toHaveLength(1);
  //   }

  //   // Check WMS GetFilterToken request
  //   // and store the filter token
  //   let filtertoken = '';
  //   await page.FIXME_wait('@postGetFilterToken');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('service=WMS');
  //     expect(interception.request.body).toContain('request=GETFILTERTOKEN');
  //     expect(interception.request.body).toContain('typename=quartiers');
  //     expect(interception.request.body).toContain(
  //       'filter=quartiers%3A%22quartier%22+IN+%28+2+%29'
  //     );
  //     expect(interception.response.body).toHaveProperty('token');
  //     expect(interception.response.body.token).FIXME_be_not_null();

  //     filtertoken = interception.response.body.token;
  //   }

  //   // Check that GetMap is requested without the selection token
  //   {
  //     const interception = await getMap;
  //     const req_url = new URL(interception.request.url);
  //     expect(req_url.searchParams.get('SELECTIONTOKEN')).toBeNull();
  //     expect(req_url.searchParams.get('FILTERTOKEN')).toBeNull();
  //   }

  //   // Check that GetMap is requested with the filter token
  //   {
  //     const interception = await getMap;
  //     const req_url = new URL(interception.request.url);
  //     expect(req_url.searchParams.get('FILTERTOKEN')).FIXME_be_eq(filtertoken);
  //   }

  //   // check background
  //   await expect(
  //     page.locator('[data-testid="Les quartiers à Montpellier"] div.node')
  //   ).toHaveClass(/filtered/);

  //   // Check table lines
  //   await expect(
  //     page.locator(
  //       '#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr'
  //     )
  //   ).toHaveCount(1);

  //   // refresh
  //   await page
  //     .locator(
  //       '#attribute-layer-main-Les_quartiers_a_Montpellier .attribute-layer-action-bar .btn-filter-attributeTable'
  //     )
  //     .click({ force: true });

  //   // Wait for features
  //   await page.FIXME_wait('@postGetFeature');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('SERVICE=WFS');
  //     expect(interception.request.body).toContain('REQUEST=GetFeature');
  //     expect(interception.request.body).toContain('TYPENAME=quartiers');
  //     expect(interception.request.body).toContain('OUTPUTFORMAT=GeoJSON');
  //     expect(interception.request.body).FIXME_not_contain('EXP_FILTER');
  //     expect(interception.response.body).toHaveProperty('type');
  //     expect(interception.response.body.type).FIXME_be_eq('FeatureCollection');
  //     expect(interception.response.body).toHaveProperty('features');
  //     expect(interception.response.body.features).toHaveLength(7);
  //   }

  //   // Check that GetMap is requested without the filter token
  //   {
  //     const interception = await getMap;
  //     const req_url = new URL(interception.request.url);
  //     expect(req_url.searchParams.get('SELECTIONTOKEN')).toBeNull();
  //     expect(req_url.searchParams.get('FILTERTOKEN')).toBeNull();
  //   }

  //   // check background
  //   await expect(
  //     page.locator('[data-testid="Les quartiers à Montpellier"] div.node')
  //   ).not.toHaveClass(/filtered/);

  //   // Check table lines
  //   await expect(
  //     page.locator(
  //       '#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr'
  //     )
  //   ).toHaveCount(7);

  //   // select feature 2,4,6
  //   // click to select 2
  //   await page
  //     .locator(
  //       '#attribute-layer-table-Les_quartiers_a_Montpellier tr[id="2"] lizmap-feature-toolbar .feature-select'
  //     )
  //     .click({ force: true }); // Check WMS GetSelectionToken request
  //   // Check WMS GetSelectionToken request
  //   // and store the selection token
  //   selectiontoken = '';
  //   await page.FIXME_wait('@postGetSelectionToken');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('service=WMS');
  //     expect(interception.request.body).toContain('request=GETSELECTIONTOKEN');
  //     expect(interception.request.body).toContain('typename=quartiers');
  //     expect(interception.request.body).toContain('ids=2');
  //     expect(interception.response.body).toHaveProperty('token');
  //     expect(interception.response.body.token).FIXME_be_not_null();

  //     selectiontoken = interception.response.body.token;
  //   }

  //   // Check that GetMap is requested with the selection token
  //   {
  //     const interception = await getMap;
  //     const req_url = new URL(interception.request.url);
  //     expect(req_url.searchParams.get('SELECTIONTOKEN')).FIXME_be_eq(
  //       selectiontoken
  //     );
  //   }

  //   // click to select 4
  //   await page
  //     .locator(
  //       '#attribute-layer-table-Les_quartiers_a_Montpellier tr[id="4"] lizmap-feature-toolbar .feature-select'
  //     )
  //     .click({ force: true });
  //   // Check WMS GetSelectionToken request
  //   // and store the selection token
  //   await page.FIXME_wait('@postGetSelectionToken');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('service=WMS');
  //     expect(interception.request.body).toContain('request=GETSELECTIONTOKEN');
  //     expect(interception.request.body).toContain('typename=quartiers');
  //     expect(interception.request.body).toContain('ids=2%2C4');
  //     expect(interception.response.body).toHaveProperty('token');
  //     expect(interception.response.body.token).FIXME_be_not_null();

  //     selectiontoken = interception.response.body.token;
  //   }

  //   // Check that GetMap is requested with the selection token
  //   {
  //     const interception = await getMap;
  //     const req_url = new URL(interception.request.url);
  //     expect(req_url.searchParams.get('SELECTIONTOKEN')).FIXME_be_eq(
  //       selectiontoken
  //     );
  //   }

  //   // click to select 6
  //   await page
  //     .locator(
  //       '#attribute-layer-table-Les_quartiers_a_Montpellier tr[id="6"] lizmap-feature-toolbar .feature-select'
  //     )
  //     .click({ force: true });
  //   // Check WMS GetSelectionToken request
  //   // and store the selection token
  //   await page.FIXME_wait('@postGetSelectionToken');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('service=WMS');
  //     expect(interception.request.body).toContain('request=GETSELECTIONTOKEN');
  //     expect(interception.request.body).toContain('typename=quartiers');
  //     expect(interception.request.body).toContain('ids=2%2C4%2C6');
  //     expect(interception.response.body).toHaveProperty('token');
  //     expect(interception.response.body.token).FIXME_be_not_null();

  //     selectiontoken = interception.response.body.token;
  //   }

  //   // Check that GetMap is requested with the selection token
  //   {
  //     const interception = await getMap;
  //     const req_url = new URL(interception.request.url);
  //     expect(req_url.searchParams.get('SELECTIONTOKEN')).FIXME_be_eq(
  //       selectiontoken
  //     );
  //   }

  //   // filter
  //   await page
  //     .locator(
  //       '#attribute-layer-main-Les_quartiers_a_Montpellier .attribute-layer-action-bar .btn-filter-attributeTable'
  //     )
  //     .click({ force: true });

  //   // Wait for features
  //   await page.FIXME_wait('@postGetFeature');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('SERVICE=WFS');
  //     expect(interception.request.body).toContain('REQUEST=GetFeature');
  //     expect(interception.request.body).toContain('TYPENAME=quartiers');
  //     expect(interception.request.body).toContain('OUTPUTFORMAT=GeoJSON');
  //     expect(interception.request.body).toContain(
  //       'EXP_FILTER=%24id+IN+(+2+%2C+4+%2C+6+)'
  //     );
  //     expect(interception.response.body).toHaveProperty('type');
  //     expect(interception.response.body.type).FIXME_be_eq('FeatureCollection');
  //     expect(interception.response.body).toHaveProperty('features');
  //     expect(interception.response.body.features).toHaveLength(3);
  //   }

  //   // Check WMS GetFilterToken request
  //   // and store the filter token
  //   filtertoken = '';
  //   await page.FIXME_wait('@postGetFilterToken');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('service=WMS');
  //     expect(interception.request.body).toContain('request=GETFILTERTOKEN');
  //     expect(interception.request.body).toContain('typename=quartiers');
  //     expect(interception.request.body).toContain(
  //       'filter=quartiers%3A%22quartier%22+IN+%28+2+%2C+6+%2C+4+%29'
  //     );
  //     expect(interception.response.body).toHaveProperty('token');
  //     expect(interception.response.body.token).FIXME_be_not_null();

  //     filtertoken = interception.response.body.token;
  //   }

  //   // Check that GetMap is requested without the selection token
  //   {
  //     const interception = await getMap;
  //     const req_url = new URL(interception.request.url);
  //     expect(req_url.searchParams.get('SELECTIONTOKEN')).toBeNull();
  //     expect(req_url.searchParams.get('FILTERTOKEN')).toBeNull();
  //   }

  //   // Check that GetMap is requested with the filter token
  //   {
  //     const interception = await getMap;
  //     const req_url = new URL(interception.request.url);
  //     expect(req_url.searchParams.get('FILTERTOKEN')).FIXME_be_eq(filtertoken);
  //   }

  //   // check background
  //   await expect(
  //     page.locator('[data-testid="Les quartiers à Montpellier"] div.node')
  //   ).toHaveClass(/filtered/);

  //   // Check table lines
  //   await expect(
  //     page.locator(
  //       '#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr'
  //     )
  //   ).toHaveCount(3);

  //   // close the tab
  //   await page
  //     .locator(
  //       '#nav-tab-attribute-layer-Les_quartiers_a_Montpellier .btn-close-attribute-tab'
  //     )
  //     .click({ force: true });

  //   // reopen the tab
  //   await page
  //     .locator(
  //       'button[value="Les_quartiers_a_Montpellier"].btn-open-attribute-layer'
  //     )
  //     .click({ force: true });
  //   // The content of the table has to be fetched again
  //   // Wait for features
  //   await page.FIXME_wait('@postGetFeature');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('SERVICE=WFS');
  //     expect(interception.request.body).toContain('REQUEST=GetFeature');
  //     expect(interception.request.body).toContain('TYPENAME=quartiers');
  //     expect(interception.request.body).toContain('OUTPUTFORMAT=GeoJSON');
  //     expect(interception.request.body).toContain(
  //       'EXP_FILTER=%24id+IN+%28+2+%2C+4+%2C+6+%29+'
  //     );
  //     expect(interception.response.body).toHaveProperty('type');
  //     expect(interception.response.body.type).FIXME_be_eq('FeatureCollection');
  //     expect(interception.response.body).toHaveProperty('features');
  //     expect(interception.response.body.features).toHaveLength(3);
  //   }

  //   // check that the layer is filtered
  //   await expect(
  //     page.locator(
  //       '#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr'
  //     )
  //   ).toHaveCount(3);

  //   // refresh
  //   await page
  //     .locator(
  //       '#attribute-layer-main-Les_quartiers_a_Montpellier .attribute-layer-action-bar .btn-filter-attributeTable'
  //     )
  //     .click({ force: true });

  //   // Wait for features
  //   await page.FIXME_wait('@postGetFeature');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('SERVICE=WFS');
  //     expect(interception.request.body).toContain('REQUEST=GetFeature');
  //     expect(interception.request.body).toContain('TYPENAME=quartiers');
  //     expect(interception.request.body).toContain('OUTPUTFORMAT=GeoJSON');
  //     expect(interception.request.body).FIXME_not_contain('EXP_FILTER');
  //     expect(interception.response.body).toHaveProperty('type');
  //     expect(interception.response.body.type).FIXME_be_eq('FeatureCollection');
  //     expect(interception.response.body).toHaveProperty('features');
  //     expect(interception.response.body.features).toHaveLength(7);
  //   }

  //   // Check that GetMap is requested without the filter token
  //   {
  //     const interception = await getMap;
  //     const req_url = new URL(interception.request.url);
  //     expect(req_url.searchParams.get('SELECTIONTOKEN')).toBeNull();
  //     expect(req_url.searchParams.get('FILTERTOKEN')).toBeNull();
  //   }

  //   // check background
  //   await expect(
  //     page.locator('[data-testid="Les quartiers à Montpellier"] div.node')
  //   ).not.toHaveClass(/filtered/);

  //   // Check table lines
  //   await expect(
  //     page.locator(
  //       '#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr'
  //     )
  //   ).toHaveCount(7);

  //   // Go to tables tab to open an other table
  //   await page.locator('#nav-tab-attribute-summary').click({ force: true });

  //   // Shapefile layer
  //   await page
  //     .locator('button[value="quartiers_shp"].btn-open-attribute-layer')
  //     .click({ force: true });

  //   // Wait for features
  //   await page.FIXME_wait('@postGetFeature');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('SERVICE=WFS');
  //     expect(interception.request.body).toContain('REQUEST=GetFeature');
  //     expect(interception.request.body).toContain('TYPENAME=quartiers_shp');
  //     expect(interception.request.body).toContain('OUTPUTFORMAT=GeoJSON');
  //     expect(interception.request.body).FIXME_not_contain('EXP_FILTER');
  //     expect(interception.response.body).toHaveProperty('type');
  //     expect(interception.response.body.type).FIXME_be_eq('FeatureCollection');
  //     expect(interception.response.body).toHaveProperty('features');
  //     expect(interception.response.body.features).toHaveLength(7);
  //   }

  //   // Check table lines
  //   await expect(
  //     page.locator('#attribute-layer-table-quartiers_shp tbody tr')
  //   ).toHaveCount(7);

  //   // select feature 2
  //   await page
  //     .locator(
  //       '#attribute-layer-table-quartiers_shp tr[id="2"] lizmap-feature-toolbar .feature-select'
  //     )
  //     .click({ force: true });
  //   // Check WMS GetSelectionToken request
  //   await page.FIXME_wait('@postGetSelectionToken');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('service=WMS');
  //     expect(interception.request.body).toContain('request=GETSELECTIONTOKEN');
  //     expect(interception.request.body).toContain('typename=quartiers_shp');
  //     expect(interception.request.body).toContain('ids=2');
  //     expect(interception.response.body).toHaveProperty('token');
  //     expect(interception.response.body.token).FIXME_be_not_null();
  //   }

  //   // filter
  //   await page
  //     .locator(
  //       '#attribute-layer-main-quartiers_shp .attribute-layer-action-bar .btn-filter-attributeTable'
  //     )
  //     .click({ force: true });
  //   // Wait for features
  //   await page.FIXME_wait('@postGetFeature');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('SERVICE=WFS');
  //     expect(interception.request.body).toContain('REQUEST=GetFeature');
  //     expect(interception.request.body).toContain('TYPENAME=quartiers_shp');
  //     expect(interception.request.body).toContain('OUTPUTFORMAT=GeoJSON');
  //     expect(interception.request.body).toContain('EXP_FILTER=%24id+IN+(+2+)');
  //     expect(interception.response.body).toHaveProperty('type');
  //     expect(interception.response.body.type).FIXME_be_eq('FeatureCollection');
  //     expect(interception.response.body).toHaveProperty('features');
  //     expect(interception.response.body.features).toHaveLength(1);
  //   }

  //   // Check WMS GetFilterToken request
  //   await page.FIXME_wait('@postGetFilterToken');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('service=WMS');
  //     expect(interception.request.body).toContain('request=GETFILTERTOKEN');
  //     expect(interception.request.body).toContain('typename=quartiers');
  //     expect(interception.request.body).toContain(
  //       'filter=quartiers_shp%3A%22quartier%22+IN+%28+3+%29'
  //     );
  //     expect(interception.response.body).toHaveProperty('token');
  //     expect(interception.response.body.token).FIXME_be_not_null();
  //   }

  //   // check background
  //   await expect(page.locator('#node-quartiers_shp ~ div.node')).toHaveClass(
  //     /filtered/
  //   );

  //   // Check table lines
  //   await expect(
  //     page.locator('#attribute-layer-table-quartiers_shp tbody tr')
  //   ).toHaveCount(1);

  //   // refresh
  //   await page
  //     .locator(
  //       '#attribute-layer-main-quartiers_shp .attribute-layer-action-bar .btn-filter-attributeTable'
  //     )
  //     .click({ force: true });
  //   // Wait for features
  //   await page.FIXME_wait('@postGetFeature');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('SERVICE=WFS');
  //     expect(interception.request.body).toContain('REQUEST=GetFeature');
  //     expect(interception.request.body).toContain('TYPENAME=quartiers_shp');
  //     expect(interception.request.body).toContain('OUTPUTFORMAT=GeoJSON');
  //     expect(interception.request.body).FIXME_not_contain('EXP_FILTER');
  //     expect(interception.response.body).toHaveProperty('type');
  //     expect(interception.response.body.type).FIXME_be_eq('FeatureCollection');
  //     expect(interception.response.body).toHaveProperty('features');
  //     expect(interception.response.body.features).toHaveLength(7);
  //   }

  //   // check background
  //   await expect(
  //     page.locator('#node-quartiers_shp ~ div.node')
  //   ).not.toHaveClass(/filtered/);

  //   // Check table lines
  //   await expect(
  //     page.locator('#attribute-layer-table-quartiers_shp tbody tr')
  //   ).toHaveCount(7);

  //   // select feature 2,4,6
  //   // Click to select 2
  //   await page
  //     .locator(
  //       '#attribute-layer-table-quartiers_shp tr[id="2"] lizmap-feature-toolbar .feature-select'
  //     )
  //     .click({ force: true });
  //   // Check WMS GetSelectionToken request
  //   await page.FIXME_wait('@postGetSelectionToken');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('service=WMS');
  //     expect(interception.request.body).toContain('request=GETSELECTIONTOKEN');
  //     expect(interception.request.body).toContain('typename=quartiers_shp');
  //     expect(interception.request.body).toContain('ids=2');
  //     expect(interception.response.body).toHaveProperty('token');
  //     expect(interception.response.body.token).FIXME_be_not_null();
  //   }

  //   // Click to select 4
  //   await page
  //     .locator(
  //       '#attribute-layer-table-quartiers_shp tr[id="4"] lizmap-feature-toolbar .feature-select'
  //     )
  //     .click({ force: true });
  //   // Check WMS GetSelectionToken request
  //   await page.FIXME_wait('@postGetSelectionToken');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('service=WMS');
  //     expect(interception.request.body).toContain('request=GETSELECTIONTOKEN');
  //     expect(interception.request.body).toContain('typename=quartiers_shp');
  //     expect(interception.request.body).toContain('ids=2%2C4');
  //     expect(interception.response.body).toHaveProperty('token');
  //     expect(interception.response.body.token).FIXME_be_not_null();
  //   }

  //   // Click to select 6
  //   await page
  //     .locator(
  //       '#attribute-layer-table-quartiers_shp tr[id="6"] lizmap-feature-toolbar .feature-select'
  //     )
  //     .click({ force: true });
  //   // Check WMS GetSelectionToken request
  //   await page.FIXME_wait('@postGetSelectionToken');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('service=WMS');
  //     expect(interception.request.body).toContain('request=GETSELECTIONTOKEN');
  //     expect(interception.request.body).toContain('typename=quartiers_shp');
  //     expect(interception.request.body).toContain('ids=2%2C4%2C6');
  //     expect(interception.response.body).toHaveProperty('token');
  //     expect(interception.response.body.token).FIXME_be_not_null();
  //   }

  //   // filter
  //   await page
  //     .locator(
  //       '#attribute-layer-main-quartiers_shp .attribute-layer-action-bar .btn-filter-attributeTable'
  //     )
  //     .click({ force: true });
  //   // Wait for features
  //   await page.FIXME_wait('@postGetFeature');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('SERVICE=WFS');
  //     expect(interception.request.body).toContain('REQUEST=GetFeature');
  //     expect(interception.request.body).toContain('TYPENAME=quartiers');
  //     expect(interception.request.body).toContain('OUTPUTFORMAT=GeoJSON');
  //     expect(interception.request.body).toContain(
  //       'EXP_FILTER=%24id+IN+(+2+%2C+4+%2C+6+)'
  //     );
  //     expect(interception.response.body).toHaveProperty('type');
  //     expect(interception.response.body.type).FIXME_be_eq('FeatureCollection');
  //     expect(interception.response.body).toHaveProperty('features');
  //     expect(interception.response.body.features).toHaveLength(3);
  //   }

  //   // Check WMS GetFilterToken request
  //   await page.FIXME_wait('@postGetFilterToken');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('service=WMS');
  //     expect(interception.request.body).toContain('request=GETFILTERTOKEN');
  //     expect(interception.request.body).toContain('typename=quartiers');
  //     expect(interception.request.body).toContain(
  //       'filter=quartiers_shp%3A%22quartier%22+IN+%28+3+%2C+7+%2C+4+%29'
  //     );
  //     expect(interception.response.body).toHaveProperty('token');
  //     expect(interception.response.body.token).FIXME_be_not_null();
  //   }

  //   // check background
  //   await expect(page.locator('#node-quartiers_shp ~ div.node')).toHaveClass(
  //     /filtered/
  //   );

  //   // Check table lines
  //   await expect(
  //     page.locator('#attribute-layer-table-quartiers_shp tbody tr')
  //   ).toHaveCount(3);

  //   // refresh
  //   await page
  //     .locator(
  //       '#attribute-layer-main-quartiers_shp .attribute-layer-action-bar .btn-filter-attributeTable'
  //     )
  //     .click({ force: true });
  //   // Wait for features
  //   await page.FIXME_wait('@postGetFeature');
  //   {
  //     const interception = page;
  //     expect(interception.request.body).toContain('SERVICE=WFS');
  //     expect(interception.request.body).toContain('REQUEST=GetFeature');
  //     expect(interception.request.body).toContain('TYPENAME=quartiers_shp');
  //     expect(interception.request.body).toContain('OUTPUTFORMAT=GeoJSON');
  //     expect(interception.request.body).FIXME_not_contain('EXP_FILTER');
  //     expect(interception.response.body).toHaveProperty('type');
  //     expect(interception.response.body.type).FIXME_be_eq('FeatureCollection');
  //     expect(interception.response.body).toHaveProperty('features');
  //     expect(interception.response.body.features).toHaveLength(7);
  //   }

  //   // check background
  //   await expect(
  //     page.locator('#node-quartiers_shp ~ div.node')
  //   ).not.toHaveClass(/filtered/);

  //   // Check table lines
  //   await expect(
  //     page.locator('#attribute-layer-table-quartiers_shp tbody tr')
  //   ).toHaveCount(7);

  //   // Go to quartiers tab
  //   await page
  //     .locator('#nav-tab-attribute-layer-Les_quartiers_a_Montpellier')
  //     .click({ force: true });
  });
});
