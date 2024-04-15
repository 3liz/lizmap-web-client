// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Dataviz in popup', ()=>{
    test('Check lizmap feature toolbar', async ({page}) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=popup_bar';
        await page.goto(url, { waitUntil: 'networkidle' });
        
        await page.locator("#dock-close").click();

        await page.waitForTimeout(300);

        let getPlot= page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('getPlot'));
        
        await page.locator('#newOlMap').click({
            position: {
              x: 355,
              y: 280
            }
        });

        await getPlot;

        // inspect feature toolbar, expect to find only one
        await expect(page.locator("#popupcontent > div.menu-content > div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > lizmap-feature-toolbar .feature-toolbar")).toHaveCount(1)

        // click again on the same point
        await page.locator('#newOlMap').click({
            position: {
              x: 355,
              y: 280
            }
        });

        await getPlot;
        // inspect feature toolbar, expect to find only one
        await expect(page.locator("#popupcontent > div.menu-content > div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > lizmap-feature-toolbar .feature-toolbar")).toHaveCount(1)
        
        // click on another point
        await page.locator('#newOlMap').click({
            position: {
                x: 410,
                y: 216
            }
        });

        await getPlot;
        // inspect feature toolbar, expect to find only one
        await expect(page.locator("#popupcontent > div.menu-content > div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > lizmap-feature-toolbar .feature-toolbar")).toHaveCount(1)

        // click where there is no feature
        await page.locator('#newOlMap').click({
            position: {
                x: 410,
                y: 300
            }
        });

        await page.waitForTimeout(500);

        // reopen previous popup
        await page.locator('#newOlMap').click({
            position: {
                x: 410,
                y: 216
            }
        });

        await getPlot;
        // inspect feature toolbar, expect to find only one
        await expect(page.locator("#popupcontent > div.menu-content > div.lizmapPopupContent > div.lizmapPopupSingleFeature > div.lizmapPopupDiv > lizmap-feature-toolbar .feature-toolbar")).toHaveCount(1)


    })
})

test.describe('Popup', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=popup';
        await page.goto(url, { waitUntil: 'networkidle' });
    });

    test('click on the shape to show the popup', async ({ page }) => {
        // When clicking on triangle feature a popup with two tabs must appear
        await page.locator('#newOlMap').click({
            position: {
                x: 510,
                y: 415
            }
        });
        await expect(page.locator('#newOlMap #liz_layer_popup')).toBeVisible();
        await expect(page.locator('#newOlMap #liz_layer_popup_contentDiv > div > div > div > ul > li.active > a')).toBeVisible();
        await expect(page.locator('#newOlMap #liz_layer_popup_contentDiv > div > div > div > ul > li:nth-child(2) > a')).toBeVisible();
    });

    test('changes popup tab', async ({ page }) => {
        // When clicking `tab2`, `tab2_value` must appear
        await page.locator('#newOlMap').click({
            position: {
                x: 510,
                y: 490
            }
        });
        await page.waitForTimeout(300);
        await page.getByRole('link', { name: 'tab2' }).click({force: true});
        await expect(page.locator('#popup_dd_1_tab2')).toHaveClass(/active/);
    });

    test('displays children popups', async ({ page }) => {
        await page.locator('#newOlMap').click({
            position: {
                x: 510,
                y: 415
            }
        });
        await expect(page.locator('#newOlMap #liz_layer_popup .lizmapPopupChildren .lizmapPopupSingleFeature')).toHaveCount(2);
    });

    test('getFeatureInfo request should contain a FILTERTOKEN parameter when the layer is filtered', async ({ page }) => {
        await page.locator('#button-filter').click();

        // Select a feature to filter and wait for GetMap request with FILTERTOKEN parameter
        let getMapRequestPromise = page.waitForRequest(/FILTERTOKEN/);
        await page.locator('#liz-filter-field-test').selectOption('1');
        await getMapRequestPromise;

        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeatureInfo'));
        await page.locator('#newOlMap').click({
          position: {
            x: 486,
            y: 136
          }
        });

        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        expect(getFeatureInfoRequest.postData()).toMatch(/FILTERTOKEN/);
    });
});