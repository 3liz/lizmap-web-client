import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    const url = '/index.php/view/map?repository=testsrepository&project=permalink#3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254|sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier|red,d%C3%A9faut|0.6,0.8|sousquartiers:%22id%22%20IN%20(%201%20,%202%20)%20';
    await page.goto(url, { waitUntil: 'networkidle' });
});

test.describe('Permalink', () => {
    test('UI according to permalink parameters', async ({ page }) => {
        // Visibility
        await expect(page.getByTestId('sousquartiers').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('Les quartiers à Montpellier').locator('> div input')).toBeChecked();

        // Style and opacity
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click({force:true});
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('red');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');

        await page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign').click({force:true});
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('80');

        // Filter
        await expect(page.getByTestId('sousquartiers').locator('.node')).toHaveClass(/filtered/);

        await page.locator('#button-attributeLayers').click();
        await page.locator('button[value="sousquartiers"].btn-open-attribute-layer').click({ force: true });

        await expect(page.locator('#attribute-layer-table-sousquartiers tbody tr')).toHaveCount(2);
    });
});