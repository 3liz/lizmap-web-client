// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Display lizmap-features-table component in popup from QGIS tooltip', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=lizmap_features_table';
        await gotoMap(url, page);
        await page.locator('#dock-close').click();
    });

    test('Visualize popup for layer quartiers', async ({ page }) => {

        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);

        //first point
        await page.locator('#newOlMap').click({
            position: {
                x: 400,
                y: 300
            }
        });

        await getFeatureInfoRequestPromise;

        //time for rendering the popup
        await page.waitForTimeout(500);

        await expect(page.locator('.lizmapPopupContent > .lizmapPopupSingleFeature .lizmapPopupTitle').first()).toHaveText("quartiers");

        // check lizmap-features-table is present
        let lizmapFeaturesTable = page.locator('.lizmapPopupSingleFeature .lizmapPopupDiv lizmap-features-table');
        await expect(lizmapFeaturesTable).toHaveCount(1);
        await expect(lizmapFeaturesTable.locator("h4")).toHaveText("child sub-districts");

        // Check items count
        await expect(lizmapFeaturesTable.locator("table.lizmap-features-table-container tr.lizmap-features-table-item")).toHaveCount(10);

        // Get first item and check it
        let firstItem = lizmapFeaturesTable.locator("table.lizmap-features-table-container tr.lizmap-features-table-item").first();
        await expect(firstItem).toHaveAttribute('data-line-id', '1');
        await expect(firstItem).toHaveAttribute('data-feature-id', '17');

        // Click on first item and check sub-popup
        firstItem.click();
        await expect(lizmapFeaturesTable.locator('div.lizmap-features-table')).toHaveClass(/popup-displayed/);
        await expect(firstItem).toHaveClass(/popup-displayed/);
        let popupContainer = lizmapFeaturesTable.locator('div.lizmap-features-table-item-popup');
        await expect(popupContainer).toBeVisible();
        await expect(popupContainer.locator('table.lizmapPopupTable tbody tr:first-child td')).toHaveText('17');

        // Next item
        let nextItemButton = lizmapFeaturesTable.locator('div.lizmap-features-table-toolbar button.next-popup');
        nextItemButton.click();
        await expect(popupContainer).toBeVisible();
        await expect(popupContainer.locator('table.lizmapPopupTable tbody tr:first-child td')).toHaveText('9');

        // Close Item
        let closeItemButton = lizmapFeaturesTable.locator('div.lizmap-features-table-toolbar button.close-popup');
        closeItemButton.click();
        await expect(popupContainer).toBeHidden();
        await expect(lizmapFeaturesTable.locator('div.lizmap-features-table')).not.toHaveClass(/popup-displayed/);
        await expect(firstItem).not.toHaveClass(/popup-displayed/);

        // Drag and Drop Item
        await page.locator('.lizmap-features-table-container > tbody > tr:nth-child(2)').dragTo(page.locator('.lizmap-features-table-container > tbody > tr:first-child'));

        await expect(firstItem).toHaveAttribute('data-line-id', '1');
        await expect(firstItem).toHaveAttribute('data-feature-id', '9');

        let secondItem = lizmapFeaturesTable.locator(".lizmap-features-table-container > tbody > tr:nth-child(2)");
        await expect(secondItem).toHaveAttribute('data-line-id', '2');
        await expect(secondItem).toHaveAttribute('data-feature-id', '17');

        // expressionfilter attribute listening changes
        const featTable = page.locator(`lizmap-features-table`);
        const idFeatTable = featTable.getAttribute("id");
        await featTable.evaluate(element => element.setAttribute('expressionfilter','quartmno = \'MI\''));

        await page.waitForTimeout(200);

        const newFeatTable = page.locator(`lizmap-features-table`);
        const newIdFeatTable = newFeatTable.getAttribute("id");

        await expect(idFeatTable).not.toEqual(newIdFeatTable);

        //clear screen
        await page.locator('#dock-close').click();
    });
})
