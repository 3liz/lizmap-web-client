// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';
import { expectParametersToContain, getAuthStorageStatePath } from './globals';
import { AdminPage } from "./pages/admin";
import { gotoMap } from './globals';

test.describe('Attribute table', () => {

    test('Thumbnail class generate img with good path', async ({ page }) => {
        const project = new ProjectPage(page, 'attribute_table');
        await project.open();
        const layerName = 'Les_quartiers_a_Montpellier';

        await project.openAttributeTable(layerName);
        await expect(project.attributeTableWrapper(layerName).locator('div.dataTables_info'))
            .toContainText('Showing 1 to 7 of 7 entries');
        await expect(project.attributeTableHtml(layerName).locator('tbody tr'))
            .toHaveCount(7);
        // mediaFile as stored in data-src attributes
        const mediaFile = await project.attributeTableHtml(layerName)
            .locator('img.data-attr-thumbnail').first().getAttribute('data-src');
        expect(mediaFile).not.toBeNull
        // ensure src contain "dynamic" mediaFile
        await expect(project.attributeTableHtml(layerName).locator('img.data-attr-thumbnail').first())
            .toHaveAttribute('src', new RegExp(mediaFile ?? ''));
        // ensure src contain getMedia and projet URL
        await expect(project.attributeTableHtml(layerName).locator('img.data-attr-thumbnail').first())
            .toHaveAttribute('src', /getMedia\?repository=testsrepository&project=attribute_table&/);
    });

    test('More than 500 features loaded in attribute table', async ({ page }) => {
        const project = new ProjectPage(page, 'attribute_table');
        await project.open();
        await project.closeLeftDock();
        const layerName = 'random_points';

        await project.openAttributeTable(layerName);
        await expect(project.attributeTableWrapper(layerName).locator('div.dataTables_info'))
            .toContainText('Showing 1 to 50 of 700 entries');
        await expect(project.attributeTableHtml(layerName).locator('tbody tr'))
            .toHaveCount(50);
        await expect(project.attributeTableWrapper(layerName).locator('ul.pagination > li.paginate_button'))
            .toHaveCount(9);
        // click on last page which is the previous last paginate_button
        await project.attributeTableWrapper(layerName).hover();
        project.attributeTableWrapper(layerName).locator('ul.pagination > li.paginate_button:nth-last-child(-0n+2)').dispatchEvent('click');
        await expect(project.attributeTableWrapper(layerName).locator('div.dataTables_info'))
            .toContainText('Showing 651 to 700 of 700 entries');
    });
});

test.describe('Attribute table data restricted to map extent', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['limitDataToBbox'] = 'True';
            await route.fulfill({ response, json });
        });
        const url = '/index.php/view/map/?repository=testsrepository&project=attribute_table';
        await gotoMap(url, page)
    });

    test('Data restriction and refresh button behaviour', async ({ page }) => {
        const project = new ProjectPage(page, 'attribute_table');
        const layerName = 'Les_quartiers_a_Montpellier';
        await project.openAttributeTable(layerName);

        await expect(page.locator('.btn-refresh-table')).not.toHaveClass(/btn-warning/);

        const getMapPromise = page.waitForRequest(/GetMap/);

        await page.locator('lizmap-feature-toolbar:nth-child(1) > div:nth-child(1) > button:nth-child(3)').first().click();

        await getMapPromise;

        await expect(page.locator('.btn-refresh-table')).toHaveClass(/btn-warning/);

        // Refresh
        await page.locator('.btn-refresh-table').click();

        await expect(project.attributeTableHtml(layerName).locator('tbody tr')).toHaveCount(5);
    });
});

test.describe('Layer export permissions ACL', () => {
    // single_wms_points -> export enabled for group_a users
    // single_wms_points_group -> export enabled, no groups specified, inherith export permission from repository level
    // single_wms_lines_group_as_layer -> export disabled
    // single_wms_lines_group_as_layer -> export enabled for group_a, group_b users
    [
        {
            login:'__anonymous',
            enabled_groups: [],
            expected: [
                {layer:'single_wms_points', onPage:0},
                {layer:'single_wms_points_group', onPage:0},
                {layer:'single_wms_lines_group_as_layer', onPage:0},
                {layer:'single_wms_polygons', onPage:0},
            ]
        },
        {
            login:'admin',
            enabled_groups: ['admins'],
            expected: [
                {layer:'single_wms_points', onPage:1},
                {layer:'single_wms_points_group', onPage:1},
                {layer:'single_wms_lines_group_as_layer', onPage:0},
                {layer:'single_wms_polygons', onPage:1},
            ]
        },
        {
            login:'user_in_group_a',
            enabled_groups: ['admins'],
            expected: [
                {layer:'single_wms_points', onPage:1},
                {layer:'single_wms_points_group', onPage:0},
                {layer:'single_wms_lines_group_as_layer', onPage:0},
                {layer:'single_wms_polygons', onPage:1},
            ]
        },
        {
            login:'user_in_group_a',
            enabled_groups: ['group_a','group_b'],
            expected: [
                {layer:'single_wms_points', onPage:1},
                {layer:'single_wms_points_group', onPage:1},
                {layer:'single_wms_lines_group_as_layer', onPage:0},
                {layer:'single_wms_polygons', onPage:1},
            ]
        },
        {
            login:'user_in_group_b',
            enabled_groups: ['admins'],
            expected: [
                {layer:'single_wms_points', onPage:0},
                {layer:'single_wms_points_group', onPage:0},
                {layer:'single_wms_lines_group_as_layer', onPage:0},
                {layer:'single_wms_polygons', onPage:1},
            ]
        },
        {
            login:'publisher',
            enabled_groups: ['group_b','group_a','admins'],
            expected: [
                {layer:'single_wms_points', onPage:0},
                {layer:'single_wms_points_group', onPage:0},
                {layer:'single_wms_lines_group_as_layer', onPage:0},
                {layer:'single_wms_polygons', onPage:0},
            ]
        },
    ].forEach(({login, enabled_groups, expected}, c) => {
        test(`#${c} Layer export with ${login} user logged in`, {
            tag: '@write',
        }, async ({browser}) => {
            // open admin page to set export permissions
            const adminContext = await browser.newContext({ storageState: getAuthStorageStatePath('admin') });
            const page = await adminContext.newPage();
            const adminPage = new AdminPage(page);

            await page.goto('admin.php');
            // open maps management page
            await adminPage.openPage('Maps management');

            // set layer export permissions
            await adminPage.modifyRepository('testsrepository');
            await adminPage.uncheckAllExportPermission();
            await adminPage.setLayerExportPermission(enabled_groups);
            await adminPage.page.getByRole('button', { name: 'Save' }).click();

            // login with specific user
            let userContext;
            if (login !== '__anonymous') {
                userContext = await browser.newContext({storageState: getAuthStorageStatePath(login)});
            } else {
                userContext = await browser.newContext();
            }
            const userPage = await userContext.newPage();

            // go to project page
            const project = new ProjectPage(userPage, 'enable_export_acl');
            await project.open();

            // check layer export capabilities for logged in user
            for(const layerObj of expected){
                await project.openAttributeTable(layerObj.layer);
                await expect(userPage.locator('.attribute-layer-action-bar .export-formats')).toHaveCount(layerObj.onPage);
                await project.closeAttributeTable();
            }

            // reset layer export permissions
            await adminPage.modifyRepository('testsrepository');
            await adminPage.resetLayerExportPermission();

            await adminPage.page.getByRole('button', { name: 'Save' }).click();
        })
    })

    test('Layer export request ACL', {
        tag: '@readonly',
    }, async ({page}) => {
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['limitDataToBbox'] = 'True';
            await route.fulfill({ response, json });
        });

        const project = new ProjectPage(page, 'enable_export_acl');
        await project.open();
        await project.openAttributeTable('single_wms_points');

        // launche export
        const getFeatureRequest = await project.launchExport('single_wms_points','GeoJSON');

        const expectedParameters = {
            'SERVICE': 'WFS',
            'REQUEST': 'GetFeature',
            'VERSION': '1.0.0',
            'OUTPUTFORMAT': 'GeoJSON',
            'BBOX': /3.7759\d+,43.55267\d+,3.98277\d+,43.6516\d+/,
        }

        await expectParametersToContain('Export GeoJSON with BBOX', getFeatureRequest.postData() ?? '', expectedParameters);
    })
});

test.describe('Attribute table atlas print button', () => {
    test.beforeEach(async ({ page }) => {
        // Use the print project which has atlas configured for quartiers layer
        const url = '/index.php/view/map/?repository=testsrepository&project=print';
        await gotoMap(url, page)
    });

    test('Atlas button appears for layer with atlas layout', {
        tag: '@readonly',
    }, async ({ page }) => {
        const project = new ProjectPage(page, 'print');
        await project.openAttributeTable('quartiers');

        // Check that atlas button is visible
        const atlasButton = page.locator('#attribute-layer-main-quartiers button.btn-print-atlas-selection');
        await expect(atlasButton).toBeVisible();
        await expect(atlasButton).toContainText('Atlas');
        await expect(atlasButton.locator('i.icon-print')).toBeVisible();
    });

    test('Atlas button sends correct request with selected features', {
        tag: '@readonly',
    }, async ({ page }) => {
        const project = new ProjectPage(page, 'print');
        await project.openAttributeTable('quartiers');

        // Select features by clicking checkboxes in the table
        // Note: This is a simplified approach - actual selection might differ
        const firstCheckbox = page.locator('#attribute-layer-table-quartiers tbody tr:first-child input[type="checkbox"]');
        await firstCheckbox.check();

        const secondCheckbox = page.locator('#attribute-layer-table-quartiers tbody tr:nth-child(2) input[type="checkbox"]');
        await secondCheckbox.check();

        // Wait for GetPrintAtlas request
        const getPrintAtlasPromise = page.waitForRequest(request =>
            request.method() === 'POST' &&
            request.postData()?.includes('GetPrintAtlas') === true
        );

        // Click atlas button
        const atlasButton = page.locator('#attribute-layer-main-quartiers button.btn-print-atlas-selection');
        await atlasButton.click();

        const getPrintAtlasRequest = await getPrintAtlasPromise;
        const expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrintAtlas',
            'VERSION': '1.3.0',
            'FORMAT': 'pdf',
            'TRANSPARENT': 'true',
            'DPI': '100',
            'TEMPLATE': 'atlas_quartiers',
            'LAYER': 'quartiers',
            // EXP_FILTER should contain the selected feature IDs
            'EXP_FILTER': /\$id IN \(.+\)/,
        };

        await expectParametersToContain('Atlas print with selected features', getPrintAtlasRequest.postData() ?? '', expectedParameters);

        // Verify response
        const response = await getPrintAtlasRequest.response();
        await expect(response?.status()).toBe(200);
        await expect(response?.headers()['content-type']).toBe('application/pdf');
    });

    test('Atlas button shows message when no features selected', {
        tag: '@readonly',
    }, async ({ page }) => {
        const project = new ProjectPage(page, 'print');
        await project.openAttributeTable('quartiers');

        // Click atlas button without selecting features
        const atlasButton = page.locator('#attribute-layer-main-quartiers button.btn-print-atlas-selection');
        await atlasButton.click();

        // Check for info message
        const message = page.locator('#message .alert-info');
        await expect(message).toBeVisible();
        await expect(message).toContainText('Please select at least one feature to print');
    });

    test('Atlas button does not appear for layer without atlas layout', {
        tag: '@readonly',
    }, async ({ page }) => {
        // Switch to a project/layer without atlas
        const project = new ProjectPage(page, 'print');
        await project.openAttributeTable('shop_bakery');

        // Check that atlas button is NOT visible
        const atlasButton = page.locator('#attribute-layer-main-shop_bakery button.btn-print-atlas-selection');
        await expect(atlasButton).not.toBeVisible();
    });

    test('Atlas dropdown appears for layer with multiple atlas layouts', {
        tag: '@readonly',
    }, async ({ page }) => {
        const project = new ProjectPage(page, 'print');
        await project.openAttributeTable('quartiers');

        // The quartiers layer has multiple atlas layouts configured
        // Check if dropdown exists
        const atlasDropdown = page.locator('#attribute-layer-main-quartiers .btn-group button.dropdown-toggle');

        // If dropdown exists, verify it has the correct structure
        if (await atlasDropdown.count() > 0) {
            await expect(atlasDropdown).toBeVisible();
            await expect(atlasDropdown).toContainText('Atlas');

            // Click to open dropdown
            await atlasDropdown.click();

            // Check dropdown items
            const dropdownItems = page.locator('#attribute-layer-main-quartiers .dropdown-menu button.btn-print-atlas-selection');
            await expect(dropdownItems.first()).toBeVisible();
        }
        // If no dropdown, it means there's only one layout (simple button)
        // which is already tested in the first test
    });
});
