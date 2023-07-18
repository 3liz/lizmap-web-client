import { test, expect } from '@playwright/test';

test.describe('Legend tests', () => {
    test('Tests the legend display option expand/hide/disabled', async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=layer_legends';
        await page.goto(url, { waitUntil: 'networkidle' });

        // Show image legend at startup
        await expect(page.locator('li:nth-child(3) > ul > li > .expandable').first()).toHaveClass(/expanded/);

        // Disable the legend image
        expect(await page.locator('li:nth-child(3) > ul > li:nth-child(2) > .expandable').count()).toEqual(0);
        expect(await page.locator('li:nth-child(3) > ul > li:nth-child(2) > ul.symbols').count()).toEqual(0);

        // Hide legend image at startup
        await expect(page.locator('li:nth-child(3) > ul > li:nth-child(3) > .expandable')).not.toHaveClass(/expanded/);
        expect(await page.locator('li:nth-child(3) > ul > li:nth-child(3) > .expandable').count()).toEqual(1);
        expect(await page.locator('li:nth-child(3) > ul > li:nth-child(3) > ul.symbols').count()).toEqual(1);
    });
});