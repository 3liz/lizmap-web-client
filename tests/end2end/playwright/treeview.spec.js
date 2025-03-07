// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Treeview', () => {

    const locale = 'en-US';

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=treeview';
        // Wait for WMS GetCapabilities promise
        let getCapabilitiesWMSPromise = page.waitForRequest(/SERVICE=WMS&REQUEST=GetCapabilities/);
        // Wait for WMS GetLegendGraphic promise
        const getLegendGraphicPromise = page.waitForRequest(
            request => request.method() === 'POST' &&
            request.postData() != null &&
            request.postData()?.includes('GetLegendGraphic') === true
        );
        await page.goto(url);
        // Wait for WMS GetCapabilities
        await getCapabilitiesWMSPromise;
        // Wait for WMS GetLegendGraphic
        let getLegendGraphicRequest = await getLegendGraphicPromise;

        // Check WMS GetLegendGraphic postData
        const searchParams = new URLSearchParams(getLegendGraphicRequest.postData() ?? '');
        expect(searchParams.get('SERVICE')).toBe('WMS');
        expect(searchParams.get('REQUEST')).toBe('GetLegendGraphic');
        expect(searchParams.get('LAYER')).toBe(
            'sousquartiers,quartiers,shop_bakery_pg,tramway_lines,group_as_layer_1,group_as_layer_2'
        );

        // Check that the map scale is the right one
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (100180).toLocaleString(locale))

        // Wait to be sure the map is ready
        await page.waitForTimeout(1000)
    });

    test('layer/group UI', async ({ page }) => {

        await expect(page.getByTestId('group1')).toHaveCount(1)
        await expect(page.getByTestId('group1')).toBeVisible()
        await expect(page.getByTestId('group1').getByTestId('sub-group1')).toHaveCount(1)
        await expect(page.getByTestId('sub-group1')).toBeVisible();
        await expect(page.getByTestId('sub-group1').getByTestId('subdistricts')).toHaveCount(1)
        await expect(page.getByTestId('subdistricts')).toBeVisible()
        await expect(page.getByTestId('group with space in name and shortname defined')).toHaveCount(1)
        await expect(
            page.getByTestId('group with space in name and shortname defined').getByTestId('quartiers')
        ).toHaveCount(1)
        await expect(
            page.getByTestId('group with space in name and shortname defined').getByTestId('shop_bakery_pg')
        ).toHaveCount(1)
        await expect(page.getByTestId('tramway_lines')).toHaveCount(1)
        await expect(page.getByTestId('tramway_lines')).toHaveText('Tramway lines')
        await expect(page.getByTestId('group-without-children')).toHaveCount(0)
        await expect(page.getByTestId('mutually exclusive group with multiple groups as layer')).toHaveCount(1)
        await expect(
            page.getByTestId('mutually exclusive group with multiple groups as layer').getByTestId('group as layer 1')
        ).toHaveCount(1)
        await expect(
            page.getByTestId('mutually exclusive group with multiple groups as layer').getByTestId('group as layer 2')
        ).toHaveCount(1)
    });

    test('layer/group visibility UI', async ({ page }) => {
        await expect(page.getByTestId('subdistricts')).toHaveClass('not-visible');

        // zoom to display 'subdistricts' layer defined with scale dependent visibility (minimum 1:51000)
        await page.locator('.zoom-in').click();
        await page.waitForRequest(/REQUEST=GetMap/);
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (50090).toLocaleString(locale));
        await expect(page.getByTestId('subdistricts')).not.toHaveClass('not-visible');

        // Disable root group visibility
        await page.getByTestId('group1').locator('> div input').click();
        await expect(page.getByTestId('sub-group1')).toHaveClass('not-visible');
        await expect(page.getByTestId('subdistricts')).toHaveClass('not-visible');

        // Disable parent group visibility
        await page.getByTestId('group1').locator('> div input').click();
        await page.getByTestId('sub-group1').locator('> div input').click();
        await expect(page.getByTestId('subdistricts')).toHaveClass('not-visible');

        // Disable layer visibility
        await page.getByTestId('sub-group1').locator('> div input').click();
        await page.getByTestId('subdistricts').locator('> div input').click();
        await expect(page.getByTestId('subdistricts')).toHaveClass('not-visible');
    });

    test('displays mutually exclusive group', async ({ page }) => {
        await expect(page.getByText('group with space in name and shortname defined')).toHaveCount(1);

        await expect(page.locator('#node-quartiers')).toHaveClass('rounded-checkbox');
        await expect(page.locator('#node-shop_bakery_pg')).toHaveClass('rounded-checkbox');

        await expect(page.locator('#node-quartiers')).toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).not.toBeChecked();

        // switch visibility
        await page.locator('#node-shop_bakery_pg').click();

        await expect(page.locator('#node-quartiers')).not.toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).toBeChecked();
    });

    test('displays "title" defined in Lizmap plugin', async ({ page }) => {
        await expect(page.getByTestId('tramway_lines').locator('label')).toHaveText('Tramway lines');
    });

    test('double clicking', async ({ page }) => {
        // All group1 is checked
        await expect(page.locator('#node-group1')).toBeChecked();
        await expect(page.locator('#node-sub-group1')).toBeChecked();
        await expect(page.locator('#node-subdistricts')).toBeChecked();
        // Unchecked all group1 by double clicking the label
        await page.getByText('group1', { exact: true }).dblclick();
        // All group1 is not checked
        await expect(page.locator('#node-group1')).not.toBeChecked();
        await expect(page.locator('#node-sub-group1')).not.toBeChecked();
        await expect(page.locator('#node-subdistricts')).not.toBeChecked();
        // Checked all group1 by double clicking the input
        await page.getByLabel('group1', { exact: true }).dblclick();
        // All group1 is checked
        await expect(page.locator('#node-group1')).toBeChecked();
        await expect(page.locator('#node-sub-group1')).toBeChecked();
        await expect(page.locator('#node-subdistricts')).toBeChecked();

        // Click to uncheck group1
        await page.getByLabel('group1', { exact: true }).click();
        // Only group1 is not checked
        await expect(page.locator('#node-group1')).not.toBeChecked();
        await expect(page.locator('#node-sub-group1')).toBeChecked();
        await expect(page.locator('#node-subdistricts')).toBeChecked();

        // Double clicking sub-group1 does not change the group1 checked state
        // Because it because unchecked and group1 is already unchecked
        await page.getByLabel('sub-group1', { exact: true }).dblclick();
        await expect(page.locator('#node-group1')).not.toBeChecked();
        await expect(page.locator('#node-sub-group1')).not.toBeChecked();
        await expect(page.locator('#node-subdistricts')).not.toBeChecked();

        // Double clicking sub-group1 changes the group1 checked state
        await page.getByLabel('sub-group1', { exact: true }).dblclick();
        await expect(page.locator('#node-group1')).toBeChecked();
        await expect(page.locator('#node-sub-group1')).toBeChecked();
        await expect(page.locator('#node-subdistricts')).toBeChecked();

        // Verify the status of mutually exclusive group
        await expect(page.getByLabel('group with space in name and shortname defined')).toBeChecked();
        await expect(page.locator('#node-quartiers')).toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).not.toBeChecked();
        // Unchecked all mutually exclusive group by double clicking the label
        await page.getByText('group with space in name and shortname defined').dblclick();
        await expect(page.getByLabel('group with space in name and shortname defined')).not.toBeChecked();
        await expect(page.locator('#node-quartiers')).not.toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).not.toBeChecked();
        // Checked all mutually exclusive group by double clicking the label, only the first child is clicked
        await page.getByLabel('group with space in name and shortname defined').dblclick();
        await expect(page.getByLabel('group with space in name and shortname defined')).toBeChecked();
        await expect(page.locator('#node-quartiers')).toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).not.toBeChecked();
        // switch visibility in mutually exclusive group
        await page.locator('#node-shop_bakery_pg').click();
        await expect(page.getByLabel('group with space in name and shortname defined')).toBeChecked();
        await expect(page.locator('#node-quartiers')).not.toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).toBeChecked();
        // Unchecked all mutually exclusive group by double clicking the label
        await page.getByText('group with space in name and shortname defined').dblclick();
        await expect(page.getByLabel('group with space in name and shortname defined')).not.toBeChecked();
        await expect(page.locator('#node-quartiers')).not.toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).not.toBeChecked();
        // Checked all mutually exclusive group by double clicking the label, only the first child is clicked
        await page.getByLabel('group with space in name and shortname defined').dblclick();
        await expect(page.getByLabel('group with space in name and shortname defined')).toBeChecked();
        await expect(page.locator('#node-quartiers')).toBeChecked();
        await expect(page.locator('#node-shop_bakery_pg')).not.toBeChecked();
    });
});

test.describe('Treeview mocked', () => {

    test('"Hide checkboxes for groups" option', async ({ page }) => {
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['hideGroupCheckbox'] = 'True';
            await route.fulfill({ response, json });
        });

        const url = '/index.php/view/map/?repository=testsrepository&project=treeview';
        await gotoMap(url, page);

        await expect(page.locator('lizmap-treeview div.group > input')).toHaveCount(0);
    });

    test('Timeout on GetLegendGraphic with multi layers',
        {
            tag: ['@mock', '@readonly'],
        }, async ({ page }) => {
            // we can't use Project page, because we are making GetLegendGraphic failing on purpose
            const timedOutRequest = [];
            const GetLegends = [];
            await page.route('**/service*', async route => {
                const request = await route.request();
                if (request.method() !== 'POST') {
                    // GetLegendGraphic is a POST request
                    // Continue the request for non POST requests
                    await route.continue();
                    return;
                }
                const searchParams = new URLSearchParams(request.postData() ?? '');
                if (searchParams.get('SERVICE') !== 'WMS' ||
                    !searchParams.has('REQUEST') ||
                    searchParams.get('REQUEST') !== 'GetLegendGraphic') {
                    // Continue the request for non GetLegendGraphic requests
                    await route.continue();
                    return;
                }
                if (!searchParams.has('LAYER')) {
                    // Continue the request for GetLegendGraphic without LAYER parameter
                    await route.continue();
                    return;
                }
                const layers = searchParams.get('LAYER')?.split(',');
                if (layers?.length == 1) {
                    // Continue the request for GetLegendGraphic with one layer
                    GetLegends.push(searchParams);
                    await route.continue();
                    return;
                }
                timedOutRequest.push(searchParams);
                // Timeout on GetLegendGraphic with multi layers
                await route.fulfill({
                    status: 504,
                    contentType: 'text/plain',
                    body: 'Timeout',
                });
            });
            const url = '/index.php/view/map/?repository=testsrepository&project=treeview';
            // Wait for WMS GetCapabilities promise
            let getCapabilitiesWMSPromise = page.waitForRequest(/SERVICE=WMS&REQUEST=GetCapabilities/);

            await page.goto(url);

            // Wait for WMS GetCapabilities
            await getCapabilitiesWMSPromise;

            // Wait for WMS GetLegendGraphic
            // 1 timed out request and at least 2 GetLegendGraphic requests on 6
            let timeCount = 0;
            while (timedOutRequest.length < 1 || GetLegends.length < 2) {
                timeCount += 100;
                if (timeCount > 1000) {
                    break;
                }
                await page.waitForTimeout(100);
            }

            await expect(timedOutRequest.length).toBeGreaterThanOrEqual(1);
            await expect(GetLegends.length).toBeGreaterThanOrEqual(2);
            await expect(GetLegends.length).toBeLessThanOrEqual(6);

            // Check that the GetLegendGraphic requests are well formed
            GetLegends.forEach((searchParams) => {
                expect(searchParams.get('SERVICE')).toBe('WMS');
                expect(searchParams.get('REQUEST')).toBe('GetLegendGraphic');
                expect(searchParams.get('VERSION')).toBe('1.3.0');
                expect(searchParams.get('FORMAT')).toBe('application/json');
                expect(searchParams.get('LAYER')).toBeDefined();
                expect(searchParams.get('LAYER')).not.toContain(',');
                expect(searchParams.get('STYLES')).toBeDefined();
                expect(searchParams.get('STYLES')).not.toContain(',');
            });

            // Check that the timed out GetLegendGraphic requests are well formed
            timedOutRequest.forEach((searchParams) => {
                expect(searchParams.get('SERVICE')).toBe('WMS');
                expect(searchParams.get('REQUEST')).toBe('GetLegendGraphic');
                expect(searchParams.get('VERSION')).toBe('1.3.0');
                expect(searchParams.get('FORMAT')).toBe('application/json');
                expect(searchParams.get('LAYER')).toBeDefined();
                expect(searchParams.get('LAYER')).toContain(',');
                expect(searchParams.get('STYLES')).toBeDefined();
                expect(searchParams.get('STYLES')).toContain(',');
            });

            await page.unroute('**/service*');
        });

    test('Error on GetLegendGraphic',
        {
            tag: ['@mock', '@readonly'],
        }, async ({ page }) => {
            // we can't use Project page, because we are making GetLegendGraphic failing on purpose
            const abortedRequest = [];
            const GetLegends = [];
            await page.route('**/service*', async route => {
                const request = await route.request();
                if (request.method() !== 'POST') {
                    // GetLegendGraphic is a POST request
                    // Continue the request for non POST requests
                    await route.continue();
                    return;
                }
                const searchParams = new URLSearchParams(request.postData() ?? '');
                if (searchParams.get('SERVICE') !== 'WMS' ||
                    !searchParams.has('REQUEST') ||
                    searchParams.get('REQUEST') !== 'GetLegendGraphic') {
                    // Continue the request for non GetLegendGraphic requests
                    await route.continue();
                    return;
                }
                if (!searchParams.has('LAYER')) {
                    // Continue the request for GetLegendGraphic without LAYER parameter
                    await route.continue();
                    return;
                }
                const layers = searchParams.get('LAYER')?.split(',');
                if (layers?.length == 1) {
                    // Continue the request for GetLegendGraphic with one layer
                    GetLegends.push(searchParams);
                    await route.continue();
                    return;
                }
                abortedRequest.push(searchParams);
                // Abort the request for GetLegendGraphic with multiple layers
                await route.abort();
                //await route.abort('failed');
            });

            const url = '/index.php/view/map/?repository=testsrepository&project=treeview';
            // Wait for WMS GetCapabilities promise
            let getCapabilitiesWMSPromise = page.waitForRequest(/SERVICE=WMS&REQUEST=GetCapabilities/);

            await page.goto(url);

            // Wait for WMS GetCapabilities
            await getCapabilitiesWMSPromise;

            // Wait for WMS GetLegendGraphic
            // 1 aborted request and at least 2 potential GetLegendGraphic requests on 6
            // even if we do not have to get all the GetLegendGraphic requests
            // we have to wait to be sure that no more GetLegendGraphic requests are done
            let timeCount = 0;
            while (abortedRequest.length < 1 || GetLegends.length < 2) {
                timeCount += 100;
                if (timeCount > 1000) {
                    break;
                }
                await page.waitForTimeout(100);
            }

            // Check if the GetLegendGraphic requests were all aborted
            await expect(GetLegends.length).toBe(0);
            await expect(abortedRequest.length).toBe(1);

            // Check that the aborted GetLegendGraphic requests are well formed
            abortedRequest.forEach((searchParams) => {
                expect(searchParams.get('SERVICE')).toBe('WMS');
                expect(searchParams.get('REQUEST')).toBe('GetLegendGraphic');
                expect(searchParams.get('VERSION')).toBe('1.3.0');
                expect(searchParams.get('FORMAT')).toBe('application/json');
                expect(searchParams.get('LAYER')).toBeDefined();
                expect(searchParams.get('LAYER')).toContain(',');
                expect(searchParams.get('STYLES')).toBeDefined();
                expect(searchParams.get('STYLES')).toContain(',');
            });

            await page.unroute('**/service*');
        });
});
