import { test, expect } from '@playwright/test';

test.describe('Legend tests', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=layer_legends';
        await page.goto(url, { waitUntil: 'networkidle' });
    });

    test('Tests the legend display option expand/hide/disabled', async ({ page }) => {
        // Show image legend at startup
        await expect(page.getByTestId('expand_at_startup').locator('.expandable')).toHaveClass(/expanded/);

        // Disable the legend image
        expect(await page.getByTestId('disabled').locator('.expandable').count()).toEqual(0);
        expect(await page.getByTestId('disabled').locator('ul.symbols').count()).toEqual(0);

        // Hide legend image at startup
        await expect(page.getByTestId('hide_at_startup').locator('.expandable')).not.toHaveClass(/expanded/);
        expect(await page.getByTestId('hide_at_startup').locator('.expandable').count()).toEqual(1);
        expect(await page.getByTestId('hide_at_startup').locator('ul.symbols').count()).toEqual(1);
    });
});