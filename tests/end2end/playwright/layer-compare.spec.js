// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';

// 1x1 transparent PNG
const PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
);

const CAPABILITIES = `<?xml version="1.0" encoding="UTF-8"?>
<WMS_Capabilities version="1.3.0" xmlns="http://www.opengis.net/wms">
  <Service><Name>WMS</Name><Title>Test</Title></Service>
  <Capability>
    <Layer>
      <Title>Root</Title>
      <Layer><Name>ortho2018</Name><Title>Ortho 2018</Title></Layer>
      <Layer><Name>ortho2025</Name><Title>Ortho 2025</Title></Layer>
    </Layer>
  </Capability>
</WMS_Capabilities>`;

test.describe('Layer compare @readonly', () => {
    test('Compare two external WMS layers with a draggable divider', async ({ page }) => {
        const wmsRequests = [];
        await page.route('https://wms.example.com/**', async route => {
            const params = new URL(route.request().url()).searchParams;
            if (params.get('REQUEST') === 'GetCapabilities') {
                await route.fulfill({ contentType: 'text/xml', body: CAPABILITIES });
                return;
            }
            wmsRequests.push(params.get('LAYERS'));
            await route.fulfill({ contentType: 'image/png', body: PNG });
        });

        const project = new ProjectPage(page, 'base_layers');
        await project.open();

        await page.locator('#mapmenu li.layercompare a').click();
        const tool = page.locator('lizmap-layercompare');
        await expect(tool.locator('select.layercompare-left')).toBeVisible();

        // A line with the layer name is added directly
        await tool.locator('details').evaluate(details => details.open = true);
        await tool.locator('.layercompare-ext-url').fill('Ortho 2018|wms|https://wms.example.com/ows|ortho2018');
        await tool.locator('.layercompare-ext-load').click();

        // A GetCapabilities URL lists the layers to choose from
        await tool.locator('.layercompare-ext-url').fill(
            'https://wms.example.com/ows?service=wms&version=1.3.0&request=GetCapabilities'
        );
        await tool.locator('.layercompare-ext-load').click();
        await expect(tool.locator('select.layercompare-ext-layer option')).toHaveText(['Ortho 2018', 'Ortho 2025']);
        await tool.locator('select.layercompare-ext-layer').selectOption('ortho2025');
        await tool.locator('.layercompare-ext-add').click();
        await expect(tool.locator('select.layercompare-left option:checked')).toHaveText('Ortho 2018');
        await expect(tool.locator('select.layercompare-right option:checked')).toHaveText('Ortho 2025');

        await tool.locator('.layercompare-toggle').click();
        const divider = page.locator('.lizmap-layercompare-divider');
        await expect(divider).toBeVisible();
        await expect.poll(() => wmsRequests.includes('ortho2018') && wmsRequests.includes('ortho2025')).toBe(true);

        // Drag the divider to the left
        const box = await divider.boundingBox();
        await page.mouse.move(box.x + 2, box.y + 200);
        await page.mouse.down();
        await page.mouse.move(box.x - 100, box.y + 200, { steps: 5 });
        await page.mouse.up();
        expect((await divider.boundingBox()).x).toBeLessThan(box.x - 50);

        // Stop comparing removes the divider
        await tool.locator('.layercompare-toggle').click();
        await expect(divider).toHaveCount(0);
    });
});
