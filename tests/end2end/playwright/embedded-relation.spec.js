// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap, expectParametersToContain } from './globals';

test.describe('Display embedded relation in popup', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=relations_project_embed';
        await gotoMap(url, page);
        await page.locator('#dock-close').click();
    });

    test('Visualize popup for embedded layers', async ({ page }) => {

        let getFeatureInfoRequestPromise = page.waitForRequest(
            request => request.method() === 'POST' &&
            request.postData()?.includes('GetFeatureInfo') === true
        );

        //first point
        await page.locator('#newOlMap').click({
            position: {
                x: 74,
                y: 40
            }
        });

        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;

        let expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetFeatureInfo',
            'VERSION': '1.3.0',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'child_layer,father_layer',
            'QUERY_LAYERS': 'child_layer,father_layer',
            'STYLE': 'default,default',
            'WIDTH': '870',
            'HEIGHT': '575',
            'I': '74',
            'J': '40',
            'FEATURE_COUNT': '10',
            'CRS': 'EPSG:4326',
            'BBOX': /-0.2789\d+,-0.7174\d+,0.4056\d+,0.3183\d+/,
        }
        await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', expectedParameters);

        // wait for response
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        expect(getFeatureInfoResponse).not.toBeNull();
        expect(getFeatureInfoResponse?.ok()).toBe(true);
        expect(await getFeatureInfoResponse?.headerValue('Content-Type')).toContain('text/html');

        // time for rendering the popup
        await page.waitForTimeout(100);

        await expect(page.locator('.lizmapPopupContent > .lizmapPopupSingleFeature .lizmapPopupTitle').first()).toHaveText("father_layer");

        let firstPointElements = page.locator(".container.popup_lizmap_dd .before-tabs div.control-group label.control-label");
        await expect(firstPointElements).toHaveCount(3);

        await expect(firstPointElements.nth(0)).toHaveText("fid");
        await expect(firstPointElements.nth(1)).toHaveText("ref_id");
        await expect(firstPointElements.nth(2)).toHaveText("description");


        let firstElementsValues = page.locator(".container.popup_lizmap_dd .before-tabs div.control-group span.jforms-control-input");
        await expect(firstElementsValues).toHaveCount(3);
        await expect(firstElementsValues.nth(0)).toHaveText("3");
        await expect(firstElementsValues.nth(1)).toHaveText("1");
        await expect(firstElementsValues.nth(2)).toHaveText("Father 1");

        //check childrens
        let firstChildrendElements = page.locator('.lizmapPopupSingleFeature .lizmapPopupChildren .lizmapPopupSingleFeature');
        await expect(firstChildrendElements).toHaveCount(2);

        let firstElementfirstChildRows = firstChildrendElements.nth(0).getByRole('table').locator('tbody tr');
        await expect(firstElementfirstChildRows).toHaveCount(3);
        await expect(firstElementfirstChildRows.nth(0).locator("td")).toHaveText("2");
        await expect(firstElementfirstChildRows.nth(1).locator("td")).toHaveText("1");
        await expect(firstElementfirstChildRows.nth(2).locator("td")).toHaveText("Child 2");
        let firstElementSecondChildRow = firstChildrendElements.nth(1).getByRole('table').locator('tbody tr');
        await expect(firstElementSecondChildRow.nth(0).locator("td")).toHaveText("1");
        await expect(firstElementSecondChildRow.nth(1).locator("td")).toHaveText("1");
        await expect(firstElementSecondChildRow.nth(2).locator("td")).toHaveText("Child 1");

        //clear screen
        await page.locator('#dock-close').click();

        getFeatureInfoRequestPromise = page.waitForRequest(
            request => request.method() === 'POST' &&
            request.postData()?.includes('GetFeatureInfo') === true
        );

        //second point
        await page.locator('#newOlMap').click({
            position: {
                x: 392,
                y: 257
            }
        });

        getFeatureInfoRequest = await getFeatureInfoRequestPromise;

        expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetFeatureInfo',
            'VERSION': '1.3.0',
            'INFO_FORMAT': /^text\/html/,
            'LAYERS': 'child_layer,father_layer',
            'QUERY_LAYERS': 'child_layer,father_layer',
            'STYLE': 'default,default',
            'WIDTH': '870',
            'HEIGHT': '575',
            'I': '392',
            'J': '257',
            'FEATURE_COUNT': '10',
            'CRS': 'EPSG:4326',
            'BBOX': /-0.2789\d+,-0.7174\d+,0.4056\d+,0.3183\d+/,
        }
        await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', expectedParameters);

        // wait for response
        getFeatureInfoResponse = await getFeatureInfoRequest.response();
        expect(getFeatureInfoResponse).not.toBeNull();
        expect(getFeatureInfoResponse?.ok()).toBe(true);
        expect(await getFeatureInfoResponse?.headerValue('Content-Type')).toContain('text/html');

        // time for rendering the popup
        await page.waitForTimeout(100);

        await expect(page.locator('.lizmapPopupContent > .lizmapPopupSingleFeature .lizmapPopupTitle').first()).toHaveText("father_layer");

        let elements = page.locator(".container.popup_lizmap_dd .before-tabs div.control-group label.control-label");
        await expect(elements).toHaveCount(3);

        await expect(elements.nth(0)).toHaveText("fid");
        await expect(elements.nth(1)).toHaveText("ref_id");
        await expect(elements.nth(2)).toHaveText("description");


        let elementsValues = page.locator(".container.popup_lizmap_dd .before-tabs div.control-group span.jforms-control-input");
        await expect(elementsValues).toHaveCount(3);
        await expect(elementsValues.nth(0)).toHaveText("4");
        await expect(elementsValues.nth(1)).toHaveText("2");
        await expect(elementsValues.nth(2)).toHaveText("Father 2");

        //check childrens
        let childrendElements = page.locator('.lizmapPopupSingleFeature .lizmapPopupChildren .lizmapPopupSingleFeature');
        await expect(childrendElements).toHaveCount(2);

        let firstChildRows = childrendElements.nth(0).getByRole('table').locator('tbody tr');
        await expect(firstChildRows).toHaveCount(3);
        await expect(firstChildRows.nth(0).locator("td")).toHaveText("4");
        await expect(firstChildRows.nth(1).locator("td")).toHaveText("2");
        await expect(firstChildRows.nth(2).locator("td")).toHaveText("Child 4");
        let secondChildRow = childrendElements.nth(1).getByRole('table').locator('tbody tr');
        await expect(secondChildRow.nth(0).locator("td")).toHaveText("3");
        await expect(secondChildRow.nth(1).locator("td")).toHaveText("2");
        await expect(secondChildRow.nth(2).locator("td")).toHaveText("Child 3");
    });
})
