import { test, expect } from '@playwright/test';

test.describe('Print', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print';
        await page.goto(url, { waitUntil: 'networkidle' });

        await page.locator('#button-print').click();

        await page.locator('#print-scale').selectOption('100000');
    });

    test('Print UI', async ({ page }) => {
        // Scales
        await expect(page.locator('#print-scale > option')).toHaveCount(6);
        await expect(page.locator('#print-scale > option')).toContainText(['500,000', '250,000', '100,000', '50,000', '25,000', '10,000']);
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
        // Test `print_labels` template
        page.once('request', request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WMS')
            expect(postData).toContain('REQUEST=GetPrint')
            expect(postData).toContain('VERSION=1.3.0')
            expect(postData).toContain('FORMAT=pdf')
            expect(postData).toContain('TRANSPARENT=true')
            expect(postData).toContain('CRS=EPSG%3A2154')
            expect(postData).toContain('DPI=100')
            expect(postData).toContain('TEMPLATE=print_labels')
            expect(postData).toMatch(/map0%3AEXTENT=759249.\d+%2C6271892.\d+%2C781949.\d+%2C6286892.\d+/)
            expect(postData).toContain('map0%3ASCALE=100000')
            expect(postData).toContain('map0%3ALAYERS=OpenStreetMap%2Cquartiers%2Csousquartiers')
            expect(postData).toContain('map0%3ASTYLES=default%2Cd%C3%A9faut%2Cd%C3%A9faut')
            expect(postData).toContain('map0%3AOPACITIES=255%2C255%2C255&simple_label=simple%20label');
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // expect(postData).toContain('multiline_label=Multiline%20label');
        });
        await page.locator('#print-launch').click();

        // Test `print_map` template
        await page.locator('#print-template').selectOption('1');

        page.once('request', request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WMS')
            expect(postData).toContain('REQUEST=GetPrint')
            expect(postData).toContain('VERSION=1.3.0')
            expect(postData).toContain('FORMAT=jpeg')
            expect(postData).toContain('TRANSPARENT=true')
            expect(postData).toContain('CRS=EPSG%3A2154')
            expect(postData).toContain('DPI=200')
            expect(postData).toContain('TEMPLATE=print_map')
            expect(postData).toMatch(/map0%3AEXTENT=765699.\d+%2C6271792.\d+%2C775499.\d+%2C6286992.\d+/)
            expect(postData).toContain('map0%3ASCALE=100000')
            expect(postData).toContain('map0%3ALAYERS=OpenStreetMap%2Cquartiers%2Csousquartiers')
            expect(postData).toContain('map0%3ASTYLES=default%2Cd%C3%A9faut%2Cd%C3%A9faut')
            expect(postData).toContain('map0%3AOPACITIES=255%2C255%2C255');
        });

        await page.locator('#print-launch').click();

        // Redlining with circle
        page.once('request', request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WMS')
            expect(postData).toContain('REQUEST=GetPrint')
            expect(postData).toContain('VERSION=1.3.0')
            expect(postData).toContain('FORMAT=pdf')
            expect(postData).toContain('TRANSPARENT=true')
            expect(postData).toContain('CRS=EPSG%3A2154')
            expect(postData).toContain('DPI=100')
            expect(postData).toContain('TEMPLATE=print_labels')
            expect(postData).toMatch(/map0%3AEXTENT=759249.\d+%2C6271892.\d+%2C781949.\d+%2C6286892.\d+/)
            expect(postData).toContain('map0%3ASCALE=100000')
            expect(postData).toContain('map0%3ALAYERS=OpenStreetMap%2Cquartiers%2Csousquartiers')
            expect(postData).toContain('map0%3ASTYLES=default%2Cd%C3%A9faut%2Cd%C3%A9faut')
            expect(postData).toContain('map0%3AOPACITIES=255%2C255%2C255')
            expect(postData).toMatch(/map0%3AHIGHLIGHT_GEOM=CIRCULARSTRING\(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20772265.\d+%206279008.\d+%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20775229.\d+%206281972.\d+%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20778193.\d+%206279008.\d+%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20775229.\d+%206276044.\d+%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20772265.\d+%206279008.\d+\)/)
            expect(postData).toContain('map0%3AHIGHLIGHT_SYMBOL=%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%20%20%20%20%3CStyledLayerDescriptor%20xmlns%3D%22http%3A%2F%2Fwww.opengis.net%2Fsld%22%20xmlns%3Aogc%3D%22http%3A%2F%2Fwww.opengis.net%2Fogc%22%20xmlns%3Axsi%3D%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema-instance%22%20version%3D%221.1.0%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20xsi%3AschemaLocation%3D%22http%3A%2F%2Fwww.opengis.net%2Fsld%20http%3A%2F%2Fschemas.opengis.net%2Fsld%2F1.1.0%2FStyledLayerDescriptor.xsd%22%20xmlns%3Ase%3D%22http%3A%2F%2Fwww.opengis.net%2Fse%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CUserStyle%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CFeatureTypeStyle%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CRule%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CPolygonSymbolizer%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CStroke%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CSvgParameter%20name%3D%22stroke%22%3E%23ff0000%3C%2FSvgParameter%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CSvgParameter%20name%3D%22stroke-opacity%22%3E1%3C%2FSvgParameter%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CSvgParameter%20name%3D%22stroke-width%22%3E2%3C%2FSvgParameter%3E%0A%20%20%20%20%20%20%20%20%3C%2FStroke%3E%0A%20%20%20%20%20%20%20%20%3CFill%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CSvgParameter%20name%3D%22fill%22%3E%23ff0000%3C%2FSvgParameter%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CSvgParameter%20name%3D%22fill-opacity%22%3E0.2%3C%2FSvgParameter%3E%0A%20%20%20%20%20%20%20%20%3C%2FFill%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FPolygonSymbolizer%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FRule%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FFeatureTypeStyle%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FUserStyle%3E%0A%20%20%20%20%20%20%20%20%3C%2FStyledLayerDescriptor%3E')
            expect(postData).toContain('simple_label=simple%20label');
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // expect(postData).toContain('multiline_label=Multiline%20label');
        });

        await page.locator('#button-draw').click();
        await page.locator('#draw').click();
        await page.locator('#draw .digitizing-buttons').click();
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
        await page.locator('#print-launch').click();
    });

    test('Print requests with selection', async ({ page }) => {
        // Select a feature
        await page.locator('#button-attributeLayers').click();
        await page.getByRole('button', { name: 'Detail' }).click();
        await page.locator('lizmap-feature-toolbar:nth-child(1) > div:nth-child(1) > button:nth-child(1)').first().click();
        await page.locator('#bottom-dock-window-buttons .btn-bottomdock-clear').click();

        page.on('request', request => {
            if(request.method() === "POST") {
                const postData = request.postData();
                if (postData != null && postData.includes('GetPrint')){
                    expect(postData).toContain('SERVICE=WMS')
                    expect(postData).toContain('REQUEST=GetPrint')
                    expect(postData).toContain('VERSION=1.3.0')
                    expect(postData).toContain('FORMAT=pdf')
                    expect(postData).toContain('TRANSPARENT=true')
                    expect(postData).toContain('CRS=EPSG%3A2154')
                    expect(postData).toContain('DPI=100')
                    expect(postData).toContain('TEMPLATE=print_labels')
                    expect(postData).toContain('map0%3ASCALE=100000')
                    expect(postData).toContain('map0%3ALAYERS=OpenStreetMap%2Cquartiers%2Csousquartiers')
                    expect(postData).toContain('map0%3ASTYLES=default%2Cd%C3%A9faut%2Cd%C3%A9faut')
                    expect(postData).toContain('map0%3AOPACITIES=255%2C255%2C255');
                    expect(postData).toContain('simple_label=simple%20label');
                    expect(postData).toContain('SELECTIONTOKEN=');
                }
            }
        });

        await page.locator('#print-launch').click();
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

        page.on('request', request => {
            if(request.method() === "POST") {
                const postData = request.postData();
                if (postData != null && postData.includes('GetPrint')){
                    expect(postData).toContain('SERVICE=WMS')
                    expect(postData).toContain('REQUEST=GetPrint')
                    expect(postData).toContain('VERSION=1.3.0')
                    expect(postData).toContain('FORMAT=pdf')
                    expect(postData).toContain('TRANSPARENT=true')
                    expect(postData).toContain('CRS=EPSG%3A2154')
                    expect(postData).toContain('DPI=100')
                    expect(postData).toContain('TEMPLATE=print_labels')
                    expect(postData).toContain('map0%3ASCALE=100000')
                    expect(postData).toContain('map0%3ALAYERS=OpenStreetMap%2Cquartiers%2Csousquartiers')
                    expect(postData).toContain('map0%3ASTYLES=default%2Cd%C3%A9faut%2Cd%C3%A9faut')
                    expect(postData).toContain('map0%3AOPACITIES=255%2C255%2C255');
                    expect(postData).toContain('simple_label=simple%20label');
                    expect(postData).toContain('FILTERTOKEN=');
                }
            }
        });

        await page.locator('#bottom-dock-window-buttons .btn-bottomdock-clear').click();
        await page.locator('#print-launch').click();
    });
});

test.describe('Print in popup', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print';
        await page.goto(url, { waitUntil: 'networkidle' });
        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData() != null && request.postData().includes('GetFeatureInfo'));
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
        await expect(featureAtlasQuartiers.locator('button')).toHaveAttribute('data-original-title', 'atlas_quartiers');
        await expect(featureAtlasQuartiers.locator('img')).toHaveAttribute('src', '/index.php/view/media/getMedia?repository=testsrepository&project=print&path=media/svg/tree-fill.svg');

        // "sousquartiers" layer has one atlas (name "atlas_sousquartiers") button configured with the default icon
        const featureAtlasSousQuartiers = page.locator('#popupcontent lizmap-feature-toolbar[value="sousquartiers_e27e6af0_dcc5_4700_9730_361437f69862.2"] .feature-atlas');
        await expect(featureAtlasSousQuartiers).toHaveCount(1);
        await expect(featureAtlasSousQuartiers.locator('button')).toHaveAttribute('data-original-title', 'atlas_sousquartiers');
        await expect(featureAtlasSousQuartiers.locator('svg use')).toHaveAttribute('xlink:href', '#map-print');
    });

    test('Atlas print in popup requests', async ({ page }) => {
        // Test `atlas_quartiers` print atlas request
        const featureAtlasQuartiers = page.locator('#popupcontent lizmap-feature-toolbar[value="quartiers_cc80709a_cd4a_41de_9400_1f492b32c9f7.1"] .feature-atlas');

        page.on('request', request => {
            if(request.method() === "POST") {
                const postData = request.postData();
                if (postData != null && postData.includes('GetPrint')){
                    expect(postData).toContain('SERVICE=WMS')
                    expect(postData).toContain('REQUEST=GetPrintAtlas')
                    expect(postData).toContain('VERSION=1.3.0')
                    expect(postData).toContain('FORMAT=pdf')
                    expect(postData).toContain('TRANSPARENT=true')
                    expect(postData).not.toContain('CRS=EPSG%3A2154')
                    expect(postData).toContain('DPI=100')
                    expect(postData).toContain('TEMPLATE=atlas_quartiers')
                    expect(postData).not.toContain('LAYERS=quartiers')
                    expect(postData).toContain('LAYER=quartiers')
                    expect(postData).not.toContain('ATLAS_PK=1')
                    expect(postData).toContain('EXP_FILTER=%24id%20IN%20(1)')
                }
            }
        });

        await featureAtlasQuartiers.locator('button').click();

        // Test `atlas_quartiers` print atlas response
        const responsePromise = page.waitForResponse(response => response.status() === 200);
        const response = await responsePromise;

        expect(response.headers()['content-type']).toBe('application/pdf');
        expect(response.headers()['content-disposition']).toBe('attachment; filename="print_atlas_quartiers.pdf"');
    });
});

test.describe('Print - user in group a', () => {
    test.use({ storageState: 'playwright/.auth/user_in_group_a.json' });

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print';
        await page.goto(url, { waitUntil: 'networkidle' });

        await page.locator('#button-print').click();

        await page.locator('#print-scale').selectOption('100000');
    });

    test('Print UI', async ({ page }) => {
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
});

test.describe('Print - admin', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print';
        await page.goto(url, { waitUntil: 'networkidle' });

        await page.locator('#button-print').click();

        await page.locator('#print-scale').selectOption('100000');
    });

    test('Print UI', async ({ page }) => {
        // Templates
        await expect(page.locator('#print-template > option')).toHaveCount(3);
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
        await page.goto(url, { waitUntil: 'networkidle' });

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
        // Test `print_labels` template
        page.once('request', request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WMS')
            expect(postData).toContain('REQUEST=GetPrint')
            expect(postData).toContain('VERSION=1.3.0')
            expect(postData).toContain('FORMAT=pdf')
            expect(postData).toContain('TRANSPARENT=true')
            expect(postData).toContain('CRS=EPSG%3A3857')
            expect(postData).toContain('DPI=100')
            expect(postData).toContain('TEMPLATE=print_labels')
            expect(postData).toContain('map0%3AEXTENT=423093.00655000005%2C5399873.567900001%2C439487.85455000005%2C5410707.167900001')
            expect(postData).toContain('map0%3ASCALE=72224')
            expect(postData).toContain('map0%3ALAYERS=OpenStreetMap%2Cquartiers%2Csousquartiers')
            expect(postData).toContain('map0%3ASTYLES=default%2Cd%C3%A9faut%2Cd%C3%A9faut')
            expect(postData).toContain('map0%3AOPACITIES=255%2C255%2C255')
            expect(postData).toContain('simple_label=simple%20label');
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // expect(postData).toContain('multiline_label=Multiline%20label');
        });
        await page.locator('#print-launch').click();

        // Test `print_map` template
        await page.locator('#print-template').selectOption('1');

        page.once('request', request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WMS')
            expect(postData).toContain('REQUEST=GetPrint')
            expect(postData).toContain('VERSION=1.3.0')
            expect(postData).toContain('FORMAT=jpeg')
            expect(postData).toContain('TRANSPARENT=true')
            expect(postData).toContain('CRS=EPSG%3A3857')
            expect(postData).toContain('DPI=200')
            expect(postData).toContain('TEMPLATE=print_map')
            expect(postData).toContain('map0%3AEXTENT=427751.45455%2C5399801.343900001%2C434829.4065500001%2C5410779.391900001')
            expect(postData).toContain('map0%3ASCALE=72224')
            expect(postData).toContain('map0%3ALAYERS=OpenStreetMap%2Cquartiers%2Csousquartiers')
            expect(postData).toContain('map0%3ASTYLES=default%2Cd%C3%A9faut%2Cd%C3%A9faut')
            expect(postData).toContain('map0%3AOPACITIES=255%2C255%2C255');
        });

        await page.locator('#print-launch').click();

        // Redlining with circle
        page.once('request', request => {
            const postData = request.postData();
            expect(postData).toContain('SERVICE=WMS')
            expect(postData).toContain('REQUEST=GetPrint')
            expect(postData).toContain('VERSION=1.3.0')
            expect(postData).toContain('FORMAT=pdf')
            expect(postData).toContain('TRANSPARENT=true')
            expect(postData).toContain('CRS=EPSG%3A3857')
            expect(postData).toContain('DPI=100')
            expect(postData).toContain('TEMPLATE=print_labels')
            expect(postData).toContain('map0%3AEXTENT=423093.00655000005%2C5399873.567900001%2C439487.85455000005%2C5410707.167900001')
            expect(postData).toContain('map0%3ASCALE=72224')
            expect(postData).toContain('map0%3ALAYERS=OpenStreetMap%2Cquartiers%2Csousquartiers')
            expect(postData).toContain('map0%3ASTYLES=default%2Cd%C3%A9faut%2Cd%C3%A9faut')
            expect(postData).toContain('map0%3AOPACITIES=255%2C255%2C255')
            expect(postData).toContain('map0%3AHIGHLIGHT_GEOM=CIRCULARSTRING(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20433697.51452157885%205404736.19944501%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20437978.67052402196%205409017.355447453%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20442259.82652646507%205404736.19944501%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20437978.67052402196%205400455.043442567%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20433697.51452157885%205404736.19944501)')
            expect(postData).toContain('map0%3AHIGHLIGHT_SYMBOL=%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%20%20%20%20%3CStyledLayerDescriptor%20xmlns%3D%22http%3A%2F%2Fwww.opengis.net%2Fsld%22%20xmlns%3Aogc%3D%22http%3A%2F%2Fwww.opengis.net%2Fogc%22%20xmlns%3Axsi%3D%22http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema-instance%22%20version%3D%221.1.0%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20xsi%3AschemaLocation%3D%22http%3A%2F%2Fwww.opengis.net%2Fsld%20http%3A%2F%2Fschemas.opengis.net%2Fsld%2F1.1.0%2FStyledLayerDescriptor.xsd%22%20xmlns%3Ase%3D%22http%3A%2F%2Fwww.opengis.net%2Fse%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CUserStyle%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CFeatureTypeStyle%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CRule%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CPolygonSymbolizer%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CStroke%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CSvgParameter%20name%3D%22stroke%22%3E%23ff0000%3C%2FSvgParameter%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CSvgParameter%20name%3D%22stroke-opacity%22%3E1%3C%2FSvgParameter%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CSvgParameter%20name%3D%22stroke-width%22%3E2%3C%2FSvgParameter%3E%0A%20%20%20%20%20%20%20%20%3C%2FStroke%3E%0A%20%20%20%20%20%20%20%20%3CFill%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CSvgParameter%20name%3D%22fill%22%3E%23ff0000%3C%2FSvgParameter%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CSvgParameter%20name%3D%22fill-opacity%22%3E0.2%3C%2FSvgParameter%3E%0A%20%20%20%20%20%20%20%20%3C%2FFill%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FPolygonSymbolizer%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FRule%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FFeatureTypeStyle%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FUserStyle%3E%0A%20%20%20%20%20%20%20%20%3C%2FStyledLayerDescriptor%3E')
            expect(postData).toContain('simple_label=simple%20label');
            // Disabled because of the migration when project is saved with QGIS >= 3.32
            // expect(postData).toContain('multiline_label=Multiline%20label');
        });

        await page.locator('#button-draw').click();
        await page.locator('#draw').click();
        await page.locator('#draw .digitizing-buttons').click();
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
        await page.locator('#print-launch').click();
    });
});
