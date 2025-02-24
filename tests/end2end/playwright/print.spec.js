// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap, expectParametersToContain, getAuthStorageStatePath, expectToHaveLengthCompare } from './globals';

test.describe('Print', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print';
        await gotoMap(url, page)

        await page.locator('#button-print').click();

        await page.locator('#print-scale').selectOption('100000');
    });

    test('Print UI', async ({ page }) => {
        // Scales
        await expect(page.locator('#print-scale > option')).toHaveCount(6);
        await expect(page.locator('#print-scale > option')).toContainText(
            ['500,000', '250,000', '100,000', '50,000', '25,000', '10,000']);
        // Templates
        await expect(page.locator('#print-template > option')).toHaveCount(3);
        await expect(page.locator('#print-template > option')).toContainText(['print_labels', 'print_map']);

        // Test `print_labels` template

        // Format and DPI are not displayed as there is only one value
        await expect(page.locator('#print-format')).toHaveCount(0);
        await expect(page.locator('.print-dpi')).toHaveCount(0);

        // Test `print_map` template
        await page.locator('#print-template').selectOption('1');

        // Format and DPI lists exist as there are multiple values
        await expect(page.locator('#print-format > option')).toHaveCount(2);
        await expect(page.locator('#print-format > option')).toContainText(['JPEG', 'PNG']);
        await expect(page.locator('.btn-print-dpis > option')).toHaveCount(2);
        await expect(page.locator('.btn-print-dpis > option')).toContainText(['100', '200']);

        // PNG is default
        expect(await page.locator('#print-format').inputValue()).toBe('jpeg');
        // 200 DPI is default
        expect(await page.locator('.btn-print-dpis').inputValue()).toBe('200');
    });

    test('Print requests', async ({ page }) => {
        // Required GetPrint parameters
        const expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'pdf',
            'TRANSPARENT': 'true',
            'CRS': 'EPSG:2154',
            'DPI': '100',
            'TEMPLATE': 'print_labels',
        }
        // Test `print_labels` template
        let getPrintPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData()?.includes('GetPrint') === true
        );

        // Launch print
        await page.locator('#print-launch').click();
        // check message
        await expect(page.locator('div.alert')).toHaveCount(1)
        // Close message
        await page.locator('div.alert button.btn-close').click();

        // check request
        let getPrintRequest = await getPrintPromise;
        // Extend GetPrint parameters
        const expectedParameters1 = Object.assign({}, expectedParameters, {
            'map0:EXTENT': /759249.\d+,6271892.\d+,781949.\d+,6286892.\d+/,
            'map0:SCALE': '100000',
            'map0:LAYERS': 'OpenStreetMap,quartiers,sousquartiers',
            'map0:STYLES': 'default,défaut,défaut',
            'map0:OPACITIES': '204,255,255',
            'simple_label': 'simple label',
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // 'multiline_label': 'Multiline label',
        })
        let name = "Print requests";
        let getPrintParams = await expectParametersToContain(
            name, getPrintRequest.postData() ?? '', expectedParameters1);
        await expectToHaveLengthCompare(name, Array.from(getPrintParams.keys()), 15, Object.keys(expectedParameters1));

        // Close message
        await page.locator('.btn-close').click();

        // Test `print_map` template
        await page.locator('#print-template').selectOption('1');

        getPrintPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData()?.includes('GetPrint') === true
        );
        await page.locator('#print-launch').click();
        getPrintRequest = await getPrintPromise;
        // Extend and update GetPrint parameters
        const expectedParameters2 = Object.assign({}, expectedParameters, {
            'FORMAT': 'jpeg',
            'DPI': '200',
            'TEMPLATE': 'print_map',
            'map0:EXTENT': /765699.\d+,6271792.\d+,775499.\d+,6286992.\d+/,
            'map0:SCALE': '100000',
            'map0:LAYERS': 'OpenStreetMap,quartiers,sousquartiers',
            'map0:STYLES': 'default,défaut,défaut',
            'map0:OPACITIES': '204,255,255',
        })
        name = 'Print requests 2';
        getPrintParams = await expectParametersToContain(name, getPrintRequest.postData() ?? '', expectedParameters2);
        await expectToHaveLengthCompare(
            name,
            Array.from(getPrintParams.keys()),
            13, Object.keys(expectedParameters2)
        );

        // Test `print_overview` template
        await page.locator('#print-template').selectOption('2');
        getPrintPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData()?.includes('GetPrint') === true
        );

        // Launch print
        await page.locator('#print-launch').click();
        // check message
        await expect(page.locator('div.alert')).toHaveCount(1)
        // Close message
        await page.locator('div.alert button.btn-close').click();

        // check request
        getPrintRequest = await getPrintPromise;
        // Extend and update GetPrint parameters
        const expectedParameters3 = Object.assign({}, expectedParameters, {
            'TEMPLATE': 'print_overview',
            'map1:EXTENT': /757949.\d+,6270842.\d+,783249.\d+,6287942.\d+/,
            'map1:SCALE': '100000',
            'map1:LAYERS': 'OpenStreetMap,quartiers,sousquartiers',
            'map1:STYLES': 'default,défaut,défaut',
            'map1:OPACITIES': '204,255,255',
            'map0:EXTENT': /761864.\d+,6274266.\d+,779334.\d+,6284518.\d+/,
        })
        name = 'Print requests 3';
        getPrintParams = await expectParametersToContain(name, getPrintRequest.postData() ?? '', expectedParameters3);
        await expectToHaveLengthCompare(
            name,
            Array.from(getPrintParams.keys()),
            14,
            Object.keys(expectedParameters3)
        );

        // Redlining with circle
        await page.locator('#button-draw').click();
        await page.getByRole('button', { name: 'Toggle Dropdown' }).click();
        await page.locator('#draw .digitizing-circle > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 610,
                y: 302
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 722,
                y: 300
            }
        });

        await page.locator('#button-print').click();
        await page.locator('#print-scale').selectOption('100000');

        getPrintPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData()?.includes('GetPrint') === true
        );

        // Launch print
        await page.locator('#print-launch').click();
        // check message
        await expect(page.locator('div.alert')).toHaveCount(1)
        // Close message
        await page.locator('div.alert button.btn-close').click();

        // check request
        getPrintRequest = await getPrintPromise;
        // Extend and update GetPrint parameters
        /* eslint-disable no-useless-escape, @stylistic/js/max-len --
         * Block of SLD
        **/
        const expectedParameters4 = Object.assign({}, expectedParameters, {
            'TEMPLATE': 'print_labels',
            'map0:EXTENT': /759249.\d+,6271892.\d+,781949.\d+,6286892.\d+/,
            'map0:SCALE': '100000',
            'map0:LAYERS': 'OpenStreetMap,quartiers,sousquartiers',
            'map0:STYLES': 'default,défaut,défaut',
            'map0:OPACITIES': '204,255,255',
            'map0:HIGHLIGHT_GEOM': /CURVEPOLYGON\(CIRCULARSTRING\(\n +772265.\d+ 6279008.\d+,\n +775229.\d+ 6281972.\d+,\n +778193.\d+ 6279008.\d+,\n +775229.\d+ 6276044.\d+,\n +772265.\d+ 6279008.\d+\)\)/,
            'map0:HIGHLIGHT_SYMBOL': `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
    <StyledLayerDescriptor xmlns=\"http://www.opengis.net/sld\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"1.1.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xsi:schemaLocation=\"http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd\" xmlns:se=\"http://www.opengis.net/se\">
            <UserStyle>
                <FeatureTypeStyle>
                    <Rule>
                        <PolygonSymbolizer>
                <Stroke>
            <SvgParameter name=\"stroke\">#ff0000</SvgParameter>
            <SvgParameter name=\"stroke-opacity\">1</SvgParameter>
            <SvgParameter name=\"stroke-width\">2</SvgParameter>
        </Stroke>
        <Fill>
            <SvgParameter name=\"fill\">#ff0000</SvgParameter>
            <SvgParameter name=\"fill-opacity\">0.2</SvgParameter>
        </Fill>
            </PolygonSymbolizer>
                    </Rule>
                </FeatureTypeStyle>
            </UserStyle>
        </StyledLayerDescriptor>`,
            'simple_label': 'simple label',
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // 'multiline_label': 'Multiline label',
        })
        /* eslint-enable no-useless-escape, @stylistic/js/max-len */
        name = 'Print requests 4';
        getPrintParams = await expectParametersToContain(
            name,
            getPrintRequest.postData() ?? '', expectedParameters4
        );
        await expectToHaveLengthCompare(
            name,
            Array.from(getPrintParams.keys()),
            17,
            Object.keys(expectedParameters4)
        );
    });

    test('Print requests with selection', async ({ page }) => {
        // Select a feature
        await page.locator('#button-attributeLayers').click();
        await page.getByRole('button', { name: 'Detail' }).click();
        await page.locator(
            'lizmap-feature-toolbar:nth-child(1) > div:nth-child(1) > button:nth-child(1)').first().click();
        await page.locator('#bottom-dock-window-buttons .btn-bottomdock-clear').click();

        const getPrintPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData()?.includes('GetPrint') === true
        );

        // Launch print
        await page.locator('#print-launch').click();
        // check message
        await expect(page.locator('div.alert')).toHaveCount(1)
        // Close message
        await page.locator('div.alert button.btn-close').click();

        // check request
        const getPrintRequest = await getPrintPromise;
        const expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'pdf',
            'TRANSPARENT': 'true',
            'CRS': 'EPSG:2154',
            'DPI': '100',
            'TEMPLATE': 'print_labels',
            'map0:EXTENT': /759249.\d+,6271892.\d+,781949.\d+,6286892.\d+/,
            'map0:SCALE': '100000',
            'map0:LAYERS': 'OpenStreetMap,quartiers,sousquartiers',
            'map0:STYLES': 'default,défaut,défaut',
            'map0:OPACITIES': '204,255,255',
            'simple_label': 'simple label',
            'SELECTIONTOKEN': /[a-z\d]+/,
        }
        const name = "Print requests with selection";
        const getPrintParams = await expectParametersToContain(name, getPrintRequest.postData() ?? '', expectedParameters);
        await expectToHaveLengthCompare(name, Array.from(getPrintParams.keys()), 16, Object.keys(expectedParameters));

    });

    test('Print requests with filter', async ({ page }) => {
        // Select a feature
        await page.locator('#button-attributeLayers').click();
        await page.getByRole('button', { name: 'Detail' }).click();
        await page.locator('lizmap-feature-toolbar:nth-child(1) > div:nth-child(1) > button:nth-child(1)').first().click();
        await page.locator('#bottom-dock-window-buttons .btn-bottomdock-clear').click();

        // Filter selected feature
        await page.locator('#button-attributeLayers').click();
        const responseMatchGetFilterTokenFunc = function (response) {
            return (response.request().method() == 'POST' && response.request().postData().match(/GetFilterToken/i));
        };
        await page.locator('.btn-filter-attributeTable').click();
        let getFilterTokenPromise = page.waitForResponse(responseMatchGetFilterTokenFunc);
        await getFilterTokenPromise;

        await page.locator('#bottom-dock-window-buttons .btn-bottomdock-clear').click();
        const getPrintPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetPrint') === true);

        // Launch print
        await page.locator('#print-launch').click();
        // check message
        await expect(page.locator('div.alert')).toHaveCount(1)
        // Close message
        await page.locator('div.alert button.btn-close').click();

        // check request
        const getPrintRequest = await getPrintPromise;
        const expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'pdf',
            'TRANSPARENT': 'true',
            'CRS': 'EPSG:2154',
            'DPI': '100',
            'TEMPLATE': 'print_labels',
            'map0:EXTENT': /759249.\d+,6271892.\d+,781949.\d+,6286892.\d+/,
            'map0:SCALE': '100000',
            'map0:LAYERS': 'OpenStreetMap,quartiers,sousquartiers',
            'map0:STYLES': 'default,défaut,défaut',
            'map0:OPACITIES': '204,255,255',
            'simple_label': 'simple label',
            'FILTERTOKEN': /[a-z\d]+/,
        }
        const name = 'Print requests with filter';
        const getPrintParams = await expectParametersToContain(name, getPrintRequest.postData() ?? '', expectedParameters);
        await expectToHaveLengthCompare(name, Array.from(getPrintParams.keys()), 16, Object.keys(expectedParameters));
    });
});

test.describe('Print in popup', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print';
        await gotoMap(url, page)
        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);
        await page.locator('#newOlMap').click({ position: { x: 409, y: 186 } });
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        expect(getFeatureInfoRequest.postData()).toMatch(/GetFeatureInfo/);
    });

    test('Popup content print', async ({ page }) => {
        const featureAtlasQuartiers = page.locator('#popupcontent lizmap-feature-toolbar[value="quartiers_cc80709a_cd4a_41de_9400_1f492b32c9f7.1"] .feature-print');
        await expect(featureAtlasQuartiers).toHaveCount(1);

        const featureAtlasSousQuartiers = page.locator('#popupcontent lizmap-feature-toolbar[value="sousquartiers_e27e6af0_dcc5_4700_9730_361437f69862.2"] .feature-print');
        await expect(featureAtlasSousQuartiers).toHaveCount(1);
    });

    test('Atlas print in popup UI', async ({ page }) => {
        // "quartiers" layer has one atlas (name "atlas_quartiers") button configured with a custom icon
        const featureAtlasQuartiers = page.locator('#popupcontent lizmap-feature-toolbar[value="quartiers_cc80709a_cd4a_41de_9400_1f492b32c9f7.1"] .feature-atlas');
        await expect(featureAtlasQuartiers).toHaveCount(1);
        await expect(featureAtlasQuartiers.locator('button')).toHaveAttribute('data-bs-title', 'atlas_quartiers');
        await expect(featureAtlasQuartiers.locator('img')).toHaveAttribute('src', '/index.php/view/media/getMedia?repository=testsrepository&project=print&path=media/svg/tree-fill.svg');

        // "sousquartiers" layer has one atlas (name "atlas_sousquartiers") button configured with the default icon
        const featureAtlasSousQuartiers = page.locator('#popupcontent lizmap-feature-toolbar[value="sousquartiers_e27e6af0_dcc5_4700_9730_361437f69862.2"] .feature-atlas');
        await expect(featureAtlasSousQuartiers).toHaveCount(1);
        await expect(featureAtlasSousQuartiers.locator('button')).toHaveAttribute('data-bs-title', 'atlas_sousquartiers');
        await expect(featureAtlasSousQuartiers.locator('svg use')).toHaveAttribute('xlink:href', '#map-print');
    });

    test('Atlas print in popup requests', async ({ page }) => {
        // Test `atlas_quartiers` print atlas request
        const featureAtlasQuartiers = page.locator('#popupcontent lizmap-feature-toolbar[value="quartiers_cc80709a_cd4a_41de_9400_1f492b32c9f7.1"] .feature-atlas');

        const getPrintPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetPrint') === true);
        await featureAtlasQuartiers.locator('button').click();
        const getPrintRequest = await getPrintPromise;
        const expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrintAtlas',
            'VERSION': '1.3.0',
            'FORMAT': 'pdf',
            'TRANSPARENT': 'true',
            'DPI': '100',
            'TEMPLATE': 'atlas_quartiers',
            'LAYER': 'quartiers',
            'EXP_FILTER': '$id IN (1)',
        }
        const name = 'Atlas print in popup requests';
        const getPrintParams = await expectParametersToContain(name, getPrintRequest.postData() ?? '', expectedParameters);
        await expectToHaveLengthCompare(name, Array.from(getPrintParams.keys()), 10, Object.keys(expectedParameters));

        await expect(getPrintParams.has('CRS')).toBe(false)
        await expect(getPrintParams.has('LAYERS')).toBe(false)
        await expect(getPrintParams.has('ATLAS_PK')).toBe(false)

        // Test `atlas_quartiers` print atlas response
        const response = await getPrintRequest.response();
        await expect(response?.status()).toBe(200)

        await expect(response?.headers()['content-type']).toBe('application/pdf');
        await expect(response?.headers()['content-disposition']).toBe('attachment; filename="print_atlas_quartiers.pdf"');
    });
});

test.describe('Print - user in group a', () => {
    test.use({ storageState: getAuthStorageStatePath('user_in_group_a') });

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print';
        await gotoMap(url, page)

        await page.locator('#button-print').click();

        await page.locator('#print-scale').selectOption('100000');
    });

    test('Print UI', async ({ page }) => {
        // Templates
        await expect(page.locator('#print-template > option')).toHaveCount(3);
        await expect(page.locator('#print-template > option')).toContainText(['print_labels', 'print_map']);

        // Test `print_labels` template

        // Format and DPI are not displayed as there is only one value
        await expect(page.locator('#print-format')).toHaveCount(0);
        await expect(page.locator('.print-dpi')).toHaveCount(0);

        // Test `print_map` template
        await page.locator('#print-template').selectOption('1');

        // Format and DPI lists exist as there are multiple values
        await expect(page.locator('#print-format > option')).toHaveCount(2);
        await expect(page.locator('#print-format > option')).toContainText(['JPEG', 'PNG']);
        await expect(page.locator('.btn-print-dpis > option')).toHaveCount(2);
        await expect(page.locator('.btn-print-dpis > option')).toContainText(['100', '200']);

        // PNG is default
        expect(await page.locator('#print-format').inputValue()).toBe('jpeg');
        // 200 DPI is default
        expect(await page.locator('.btn-print-dpis').inputValue()).toBe('200');
    });
});

test.describe('Print - admin', () => {
    test.use({ storageState: getAuthStorageStatePath('admin') });

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print';
        await gotoMap(url, page)

        await page.locator('#button-print').click();

        await page.locator('#print-scale').selectOption('100000');
    });

    test('Print UI', async ({ page }) => {
        // Templates
        await expect(page.locator('#print-template > option')).toHaveCount(4);
        await expect(page.locator('#print-template > option')).toContainText(['print_labels', 'print_map', 'print_allowed_groups']);

        // Test `print_labels` template

        // Format and DPI are not displayed as there is only one value
        await expect(page.locator('#print-format')).toHaveCount(0);
        await expect(page.locator('.print-dpi')).toHaveCount(0);

        // Test `print_map` template
        await page.locator('#print-template').selectOption('1');

        // Format and DPI lists exist as there are multiple values
        await expect(page.locator('#print-format > option')).toHaveCount(2);
        await expect(page.locator('#print-format > option')).toContainText(['JPEG', 'PNG']);
        await expect(page.locator('.btn-print-dpis > option')).toHaveCount(2);
        await expect(page.locator('.btn-print-dpis > option')).toContainText(['100', '200']);

        // PNG is default
        expect(await page.locator('#print-format').inputValue()).toBe('jpeg');
        // 200 DPI is default
        expect(await page.locator('.btn-print-dpis').inputValue()).toBe('200');

        // Test `print_allowed_groups` template
        await page.locator('#print-template').selectOption('2');

        // Format and DPI lists exist as there are multiple values
        await expect(page.locator('#print-format > option')).toHaveCount(4);
        await expect(page.locator('#print-format > option')).toContainText(['PDF', 'SVG', 'PNG', 'JPEG']);
        await expect(page.locator('.btn-print-dpis > option')).toHaveCount(3);
        await expect(page.locator('.btn-print-dpis > option')).toContainText(['100', '200', '300']);

        // PNG is default
        expect(await page.locator('#print-format').inputValue()).toBe('pdf');
        // 200 DPI is default
        expect(await page.locator('.btn-print-dpis').inputValue()).toBe('100');
    });
});

test.describe('Print 3857', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print_3857';
        await gotoMap(url, page)

        await page.locator('#button-print').click();

        await page.locator('#print-scale').selectOption('72224');
    });

    test('Print UI', async ({ page }) => {
        // Scales
        await expect(page.locator('#print-scale > option')).toHaveCount(5);
        await expect(page.locator('#print-scale > option')).toContainText(['288,895', '144,448', '72,224', '36,112', '18,056']);
        // Templates
        await expect(page.locator('#print-template > option')).toHaveCount(2);
        await expect(page.locator('#print-template > option')).toContainText(['print_labels', 'print_map']);

        // Test `print_labels` template

        // Format and DPI are not displayed as there is only one value
        await expect(page.locator('#print-format')).toHaveCount(0);
        await expect(page.locator('.print-dpi')).toHaveCount(0);

        // Test `print_map` template
        await page.locator('#print-template').selectOption('1');

        // Format and DPI lists exist as there are multiple values
        await expect(page.locator('#print-format > option')).toHaveCount(2);
        await expect(page.locator('#print-format > option')).toContainText(['JPEG', 'PNG']);
        await expect(page.locator('.btn-print-dpis > option')).toHaveCount(2);
        await expect(page.locator('.btn-print-dpis > option')).toContainText(['100', '200']);

        // PNG is default
        expect(await page.locator('#print-format').inputValue()).toBe('jpeg');
        // 200 DPI is default
        expect(await page.locator('.btn-print-dpis').inputValue()).toBe('200');
    });

    test('Print requests', async ({ page }) => {
        // Required GetPrint parameters
        const expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'pdf',
            'TRANSPARENT': 'true',
            'CRS': 'EPSG:3857',
            'DPI': '100',
            'TEMPLATE': 'print_labels',
        }
        // Test `print_labels` template
        let getPrintPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetPrint') === true);

        // Launch print
        await page.locator('#print-launch').click();
        // check message
        await expect(page.locator('div.alert')).toHaveCount(1)
        // Close message
        await page.locator('div.alert button.btn-close').click();

        // check request
        let getPrintRequest = await getPrintPromise;
        // Extend GetPrint parameters
        const expectedParameters1 = Object.assign({}, expectedParameters, {
            'map0:EXTENT': /423093.\d+,5399873.\d+,439487.\d+,5410707.\d+/,
            'map0:SCALE': '72224',
            'map0:LAYERS': 'OpenStreetMap,quartiers,sousquartiers',
            'map0:STYLES': 'default,défaut,défaut',
            'map0:OPACITIES': '204,255,255',
            'simple_label': 'simple label',
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // 'multiline_label': 'Multiline label',
        })
        let name = "Print requests 1";
        let getPrintParams = await expectParametersToContain(
            name,
            getPrintRequest.postData() ?? '',
            expectedParameters1
        );
        await expectToHaveLengthCompare(
            name,
            Array.from(getPrintParams.keys()),
            15,
            Object.keys(expectedParameters1)
        );

        // Test `print_map` template
        await page.locator('#print-template').selectOption('1');
        getPrintPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData()?.includes('GetPrint') === true
        );

        // Launch print
        await page.locator('#print-launch').click();
        // check message
        await expect(page.locator('div.alert')).toHaveCount(1)
        // Close message
        await page.locator('div.alert button.btn-close').click();

        // check request
        getPrintRequest = await getPrintPromise;
        // Extend and update GetPrint parameters
        const expectedParameters2 = Object.assign({}, expectedParameters, {
            'FORMAT': 'jpeg',
            'DPI': '200',
            'TEMPLATE': 'print_map',
            'map0:EXTENT': /427751.\d+,5399801.\d+,434829.\d+,5410779.\d+/,
            'map0:SCALE': '72224',
            'map0:LAYERS': 'OpenStreetMap,quartiers,sousquartiers',
            'map0:STYLES': 'default,défaut,défaut',
            'map0:OPACITIES': '204,255,255',
        })
        name = 'Print requests 2';
        getPrintParams = await expectParametersToContain(name, getPrintRequest.postData() ?? '', expectedParameters2)
        await expectToHaveLengthCompare(
            name,
            Array.from(getPrintParams.keys()),
            13,
            Object.keys(expectedParameters2)
        );

        // Close message
        await page.locator('.btn-close').click();

        // Redlining with circle
        await page.locator('#button-draw').click();
        await page.getByRole('button', { name: 'Toggle Dropdown' }).click();
        await page.locator('#draw .digitizing-circle > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 610,
                y: 302
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 722,
                y: 300
            }
        });

        await page.locator('#button-print').click();
        await page.locator('#print-scale').selectOption('72224');

        getPrintPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData()?.includes('GetPrint') === true
        );

        // Launch print
        await page.locator('#print-launch').click();
        // check message
        await expect(page.locator('div.alert')).toHaveCount(1)
        // Close message
        await page.locator('div.alert button.btn-close').click();

        // check request
        getPrintRequest = await getPrintPromise;
        // Extend and update GetPrint parameters
        /* eslint-disable no-useless-escape, @stylistic/js/max-len --
         * Block of SLD
        **/
        const expectedParameters3 = Object.assign({}, expectedParameters, {
            'map0:EXTENT': /423093.\d+,5399873.\d+,439487.\d+,5410707.\d+/,
            'map0:SCALE': '72224',
            'map0:LAYERS': 'OpenStreetMap,quartiers,sousquartiers',
            'map0:STYLES': 'default,défaut,défaut',
            'map0:OPACITIES': '204,255,255',
            'map0:HIGHLIGHT_GEOM': /CURVEPOLYGON\(CIRCULARSTRING\(\n +433697.\d+ 5404736.\d+,\n +437978.\d+ 5409017.\d+,\n +442259.\d+ 5404736.\d+,\n +437978.\d+ 5400455.\d+,\n +433697.\d+ 5404736.\d+\)\)/,
            'map0:HIGHLIGHT_SYMBOL': `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
    <StyledLayerDescriptor xmlns=\"http://www.opengis.net/sld\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"1.1.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xsi:schemaLocation=\"http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd\" xmlns:se=\"http://www.opengis.net/se\">
            <UserStyle>
                <FeatureTypeStyle>
                    <Rule>
                        <PolygonSymbolizer>
                <Stroke>
            <SvgParameter name=\"stroke\">#ff0000</SvgParameter>
            <SvgParameter name=\"stroke-opacity\">1</SvgParameter>
            <SvgParameter name=\"stroke-width\">2</SvgParameter>
        </Stroke>
        <Fill>
            <SvgParameter name=\"fill\">#ff0000</SvgParameter>
            <SvgParameter name=\"fill-opacity\">0.2</SvgParameter>
        </Fill>
            </PolygonSymbolizer>
                    </Rule>
                </FeatureTypeStyle>
            </UserStyle>
        </StyledLayerDescriptor>`,
            'simple_label': 'simple label',
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // 'multiline_label': 'Multiline label',
        })
        /* eslint-enable no-useless-escape, @stylistic/js/max-len */
        name = 'Print requests 3';
        getPrintParams = await expectParametersToContain(
            name,
            getPrintRequest.postData() ?? ''
            , expectedParameters3
        );
        await expectToHaveLengthCompare(
            name,
            Array.from(getPrintParams.keys()),
            17,
            Object.keys(expectedParameters3)
        );
    });
});

test.describe('Print base layers', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=base_layers';
        await gotoMap(url, page)

        await page.locator('#button-print').click();

        await page.locator('#print-scale').selectOption('72224');
    });

    test('Print requests', async ({ page }) => {
        // Required GetPrint parameters
        const expectedParameters = {
            'SERVICE': 'WMS',
            'REQUEST': 'GetPrint',
            'VERSION': '1.3.0',
            'FORMAT': 'pdf',
            'TRANSPARENT': 'true',
            'CRS': 'EPSG:3857',
            'DPI': '100',
            'TEMPLATE': 'simple',
            'map0:EXTENT': /420548.\d+,5397710.\d+,441999.\d+,5412877.\d+/,
            'map0:SCALE': '72224',
        }
        // Print osm-mapnik
        let getPrintRequestPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData()?.includes('GetPrint') === true
        );

        // Launch print
        await page.locator('#print-launch').click();
        // check message
        await expect(page.locator('div.alert')).toHaveCount(1)
        // Close message
        await page.locator('div.alert button.btn-close').click();

        // check request
        let getPrintRequest = await getPrintRequestPromise;
        // Extend GetPrint parameters
        const expectedParameters1 = Object.assign({}, expectedParameters, {
            'map0:LAYERS': 'osm-mapnik',
            'map0:STYLES': 'défaut',
            'map0:OPACITIES': '255',
        })
        let name = 'Print requests 1';
        let getPrintParams = await expectParametersToContain(
            name,
            getPrintRequest.postData() ?? '',
            expectedParameters1,
        );
        await expectToHaveLengthCompare(
            name,
            Array.from(getPrintParams.keys()),
            13,
            Object.keys(expectedParameters1)
        );

        let getPrintResponse = await getPrintRequest.response();
        await expect(getPrintResponse?.status()).toBe(200)
        await expect(getPrintResponse?.headers()['content-type']).toBe('application/pdf');

        // Print osm-mapnik & quartiers
        let getMapRequestPromise = page.waitForRequest(/REQUEST=GetMap/);
        await page.getByLabel('quartiers').check();
        let getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        getPrintRequestPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData()?.includes('GetPrint') === true
        );

        // Launch print
        await page.locator('#print-launch').click();
        // check message
        await expect(page.locator('div.alert')).toHaveCount(1)
        // Close message
        await page.locator('div.alert button.btn-close').click();

        // check request
        getPrintRequest = await getPrintRequestPromise;
        // Extend and update GetPrint parameters
        const expectedParameters2 = Object.assign({}, expectedParameters, {
            'map0:LAYERS': 'osm-mapnik,quartiers',
            'map0:STYLES': 'défaut,default',
            'map0:OPACITIES': '255,255',
        })
        name = 'Print requests 2';
        getPrintParams = await expectParametersToContain(
            name,
            getPrintRequest.postData() ?? '',
            expectedParameters2
        );
        await expectToHaveLengthCompare(
            name,
            Array.from(getPrintParams.keys()),
            13,
            Object.keys(expectedParameters2)
        );

        getPrintResponse = await getPrintRequest.response();
        await expect(getPrintResponse?.status()).toBe(200)
        await expect(getPrintResponse?.headers()['content-type']).toBe('application/pdf');

        // Print quartiers not open-topo-map
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('open-topo-map');

        await page.waitForResponse(
            response =>
                response.status() === 200 &&
                response.headers()['content-type'] === 'image/png'
        );

        getPrintRequestPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData()?.includes('GetPrint') === true
        );

        // Launch print
        await page.locator('#print-launch').click();
        // check message
        await expect(page.locator('div.alert')).toHaveCount(1)
        // Close message
        await page.locator('div.alert button.btn-close').click();

        // check request
        getPrintRequest = await getPrintRequestPromise;
        // Extend and update GetPrint parameters
        const expectedParameters3 = Object.assign({}, expectedParameters, {
            'map0:LAYERS': 'quartiers',
            'map0:STYLES': 'default',
            'map0:OPACITIES': '255',
        })
        name = 'Print requests 3';
        getPrintParams = await expectParametersToContain(
            name,
            getPrintRequest.postData() ?? '',
            expectedParameters3
        );
        await expectToHaveLengthCompare(
            name,
            Array.from(getPrintParams.keys()),
            13,
            Object.keys(expectedParameters3)
        );

        getPrintResponse = await getPrintRequest.response();
        await expect(getPrintResponse?.status()).toBe(200)
        await expect(getPrintResponse?.headers()['content-type']).toBe('application/pdf');

        // Print quartiers_baselayer & quartiers
        await page.locator('#switcher-baselayer').getByRole('combobox').selectOption('quartiers_baselayer');
        getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        getPrintRequestPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData()?.includes('GetPrint') === true
        );

        // Launch print
        await page.locator('#print-launch').click();
        // check message
        await expect(page.locator('div.alert')).toHaveCount(1)
        // Close message
        await page.locator('div.alert button.btn-close').click();

        // check request
        getPrintRequest = await getPrintRequestPromise;
        // Extend and update GetPrint parameters
        const expectedParameters4 = Object.assign({}, expectedParameters, {
            'map0:LAYERS': 'quartiers_baselayer,quartiers',
            'map0:STYLES': 'default,default',
            'map0:OPACITIES': '255,255',
        })
        name = 'Print requests 4';
        getPrintParams = await expectParametersToContain(name, getPrintRequest.postData() ?? '', expectedParameters4)
        await expectToHaveLengthCompare(
            name,
            Array.from(getPrintParams.keys()),
            13,
            Object.keys(expectedParameters4)
        );

        getPrintResponse = await getPrintRequest.response();
        await expect(getPrintResponse?.status()).toBe(200)
        await expect(getPrintResponse?.headers()['content-type']).toBe('application/pdf');
    });
});

test.describe('Error while printing', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print';
        await gotoMap(url, page)
    });

    test('Print error', async ({ page }) => {
        await page.locator('#button-print').click();

        await page.locator('#print-scale').selectOption('100000');

        await page.route('**/service*', async route => {
            if (route.request()?.postData()?.includes('GetPrint'))
                await route.fulfill({
                    status: 404,
                    contentType: 'text/plain',
                    body: 'Not Found!'
                });
            else
                await route.continue();
        });

        await page.locator('#print-launch').click();

        await expect(
            page.getByText('The output is currently not available. Please contact the system administrator.')
        ).toBeVisible();

        await expect(page.locator("#message > div:last-child")).toHaveClass(/alert-danger/);
    });


    test('Print Atlas error', async ({ page }) => {

        let getFeatureInfoRequestPromise = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.postData()?.includes('GetFeatureInfo') === true
        );
        await page.locator('#newOlMap').click({ position: { x: 409, y: 186 } });
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
        expect(getFeatureInfoRequest.postData()).toMatch(/GetFeatureInfo/);

        // Test `atlas_quartiers` print atlas request
        const featureAtlasQuartiers = page.locator(
            '#popupcontent lizmap-feature-toolbar[value="quartiers_cc80709a_cd4a_41de_9400_1f492b32c9f7.1"] .feature-atlas'
        );

        await page.route('**/service*', async route => {
            if (route.request()?.postData()?.includes('GetPrint'))
                await route.fulfill({
                    status: 404,
                    contentType: 'text/plain',
                    body: 'Not Found!'
                });
            else
                await route.continue();
        });

        await featureAtlasQuartiers.locator('button').click();

        await expect(page.getByText(
            'The output is currently not available. Please contact the system administrator.'
        )).toBeVisible();

        await expect(page.locator("#message > div:last-child")).toHaveClass(/alert-danger/);
    });

    test('Remove print overlay when switching to another minidock', async ({ page }) => {
        await page.locator('#button-print').click();

        await page.locator('#button-selectiontool').click();

        await expect(page.locator('.ol-unselectable > canvas')).toHaveCount(0);
    });
});
