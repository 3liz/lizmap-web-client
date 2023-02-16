// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Print', () => {

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

    test('Print requests', async ({ page }) => {
        // Test `print_labels` template
        page.once('request', request => {
            expect(request.postData()).toBe('SERVICE=WMS&REQUEST=GetPrint&VERSION=1.3.0&FORMAT=pdf&TRANSPARENT=true&SRS=EPSG%3A2154&DPI=100&TEMPLATE=print_labels&map0%3AEXTENT=759249.549002605%2C6271892.11637865%2C781949.549002605%2C6286892.11637865&map0%3ASCALE=100000&map0%3ALAYERS=quartiers%2Csousquartiers&map0%3ASTYLES=d%C3%A9faut%2Cd%C3%A9faut&map0%3AOPACITIES=255%2C255&simple_label=simple%20label&multiline_label=Multiline%20label');
        });
        await page.locator('#print-launch').click();

        // Test `print_map` template
        await page.locator('#print-template').selectOption('1');

        page.once('request', request => {
            expect(request.postData()).toBe('SERVICE=WMS&REQUEST=GetPrint&VERSION=1.3.0&FORMAT=jpeg&TRANSPARENT=true&SRS=EPSG%3A2154&DPI=200&TEMPLATE=print_map&map0%3AEXTENT=765699.549002605%2C6271792.11637865%2C775499.549002605%2C6286992.11637865&map0%3ASCALE=100000&map0%3ALAYERS=quartiers%2Csousquartiers&map0%3ASTYLES=d%C3%A9faut%2Cd%C3%A9faut&map0%3AOPACITIES=255%2C255');
        });

        await page.locator('#print-launch').click();
    });
});

test.describe('Print in popup', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=print';
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.locator('#map').click({ position: { x: 409, y: 186 } });

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
            if(request.method() === "POST"){
                expect(request.postData()).toBe('SERVICE=WMS&REQUEST=GetPrint&VERSION=1.3.0&FORMAT=pdf&TRANSPARENT=true&SRS=EPSG%3A2154&DPI=100&TEMPLATE=atlas_quartiers&ATLAS_PK=1&LAYERS=quartiers');
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