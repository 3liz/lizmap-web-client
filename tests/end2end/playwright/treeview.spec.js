// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from "./pages/project";

test.describe('Treeview', () => {

    const locale = 'en-US';

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=treeview';
        // Wait for WMS GetCapabilities promise
        let getCapabilitiesWMSPromise = page.waitForRequest(/SERVICE=WMS&REQUEST=GetCapabilities/);

        const GetMaps = [];
        const GetLegends = [];
        await page.route('**/service*', async route => {
            const request = await route.request();
            if (request.method() !== 'POST') {
                // GetMap and GetLegendGraphic are GET requests
                const searchParams = new URLSearchParams(request.url().split('?')[1]);
                if (searchParams.get('SERVICE') === 'WMS' &&
                    searchParams.has('REQUEST')) {
                    if (searchParams.get('REQUEST') === 'GetLegendGraphic') {
                        GetLegends.push(searchParams);
                    } else if (searchParams.get('REQUEST') === 'GetMap') {
                        GetMaps.push(searchParams);
                    }
                }
            }
            // Continue the request
            await route.continue();
            return;
        });
        await page.goto(url);

        // Wait for WMS GetCapabilities
        let getCapabilitiesWMSRequest = await getCapabilitiesWMSPromise;
        await getCapabilitiesWMSRequest.response();

        // Wait for WMS GetMap
        // at least 2 GetMap requests are expected
        let timeCount = 0;
        while (GetMaps.length < 2) {
            timeCount += 100;
            if (timeCount > 1000) {
                break;
            }
            await page.waitForTimeout(100);
        }

        // Wait for WMS all GetLegendGraphic
        timeCount = 0;
        while (GetLegends.length < 6) {
            timeCount += 100;
            if (timeCount > 1000) {
                break;
            }
            await page.waitForTimeout(100);
        }

        await expect(GetMaps.length).toBeGreaterThanOrEqual(2);
        await expect(GetLegends).toHaveLength(6);

        // Check that the map scale is the right one
        await expect(page.locator('#overview-bar .ol-scale-text')).toHaveText('1 : ' + (100180).toLocaleString(locale))

        // Stop listening to WMS requests
        await page.unroute('**/service*');
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

        const project = new ProjectPage(page, 'treeview');
        await project.open();

        await expect(page.locator('lizmap-treeview div.group > input')).toHaveCount(0);
    });

    test('Catch GetLegendGraphic requests and timeout on GetLegendGraphic with multi layers',
        {
            tag: ['@mock', '@readonly'],
        }, async ({ page }) => {
            // we can't use Project page, because we are making GetLegendGraphic failing on purpose
            const timedOutRequest = [];
            const GetLegends = [];
            await page.route('**/service*', async route => {
                const request = await route.request();
                if (request.method() !== 'POST') {
                    // GetLegendGraphic is a GET request for single layer
                    const searchParams = new URLSearchParams(request.url().split('?')[1]);
                    if (searchParams.get('SERVICE') === 'WMS' &&
                        searchParams.has('REQUEST') &&
                        searchParams.get('REQUEST') === 'GetLegendGraphic') {
                        GetLegends.push(searchParams);
                    }
                    // Continue the request
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
            let getCapabilitiesWMSRequest = await getCapabilitiesWMSPromise;
            await getCapabilitiesWMSRequest.response();

            // Wait for WMS GetLegendGraphic
            // At least 2 GetLegendGraphic requests on 6
            // no more timed out request because no more POST requests
            let timeCount = 0;
            let timeStep = 100;
            while (GetLegends.length < 3) {
                timeCount += timeStep;
                if (timeCount > 1000) {
                    break;
                }
                await page.waitForTimeout(timeStep);
            }

            await expect(timedOutRequest.length).toBeGreaterThanOrEqual(0);
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

            /* No more timed out request because no more POST requests
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
            */

            await page.unroute('**/service*');
        });

    test('Catch GetMap requests and GetLegendGraphic requests to check order',
        {
            tag: ['@mock', '@readonly'],
        }, async ({ page }) => {
            // we can't use Project page, because we are making GetLegendGraphic failing on purpose
            const timedOutRequest = [];
            const GetMaps = [];
            const GetLegends = [];
            await page.route('**/service*', async route => {
                const request = await route.request();
                if (request.method() !== 'POST') {
                    // GetLegendGraphic is a GET request for single layer
                    const searchParams = new URLSearchParams(request.url().split('?')[1]);
                    if (searchParams.get('SERVICE') === 'WMS' &&
                        searchParams.has('REQUEST')) {
                        if (searchParams.get('REQUEST') === 'GetLegendGraphic') {
                            GetLegends.push(searchParams);
                        } else if (searchParams.get('REQUEST') === 'GetMap') {
                            GetMaps.push(searchParams);
                        }
                    }
                    // Continue the request
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
            let getCapabilitiesWMSRequest = await getCapabilitiesWMSPromise;
            await getCapabilitiesWMSRequest.response();

            // Wait for WMS GetMap
            // At least 2 GetMap requests
            let timeCount = 0;
            let timeStep = 100;
            while (GetMaps.length < 3) {
                timeCount += timeStep;
                if (timeCount > 1000) {
                    break;
                }
                await page.waitForTimeout(timeStep);
            }

            await expect(timedOutRequest.length).toBe(0);
            await expect(GetMaps.length).toBeGreaterThanOrEqual(2);
            await expect(GetMaps.length).toBeLessThanOrEqual(6);
            await expect(GetLegends.length).toBe(0);

            // Layer tree view already visible
            await expect(page.locator('#switcher')).toBeVisible();
            await expect(page.locator('#switcher lizmap-treeview div.group > input')).toHaveCount(4);

            // Check that the GetLegendGraphic requests are well formed
            GetMaps.forEach((searchParams) => {
                expect(searchParams.get('SERVICE')).toBe('WMS');
                expect(searchParams.get('REQUEST')).toBe('GetMap');
                expect(searchParams.get('VERSION')).toBe('1.3.0');
                expect(searchParams.get('FORMAT')).toContain('image/png');
                expect(searchParams.get('LAYERS')).toBeDefined();
                expect(searchParams.get('LAYERS')).not.toContain(',');
                expect(searchParams.get('STYLES')).toBeDefined();
                expect(searchParams.get('STYLES')).not.toContain(',');
            });

            // Wait for WMS GetLegendGraphic
            // At least 2 GetLegendGraphic requests on 6
            // no more timed out request because no more POST requests
            timeCount = 0;
            while (GetLegends.length < 3) {
                timeCount += timeStep;
                if (timeCount > 1000) {
                    break;
                }
                await page.waitForTimeout(timeStep);
            }

            await expect(timedOutRequest.length).toBeGreaterThanOrEqual(0);
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

            await page.unroute('**/service*');
        });
});
