// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from "./pages/project.js";

test.describe('Display lizmap-features-table component in popup from QGIS tooltip',     {
    tag: ['@readonly'],
},() => {

    test('Visualize popup for layer quartiers', async ({ page }) => {

        const project = new ProjectPage(page, 'lizmap_features_table');
        await project.open();
        await project.closeLeftDock();

        let getFeatureInfoRequestPromise = page.waitForRequest(
            request => request.method() === 'POST' &&
                request.postData()?.includes('GetFeatureInfo') === true
        );

        // First point, on "MC" Centre district with 10 sub-districts
        await project.clickOnMap(400, 300);
        await getFeatureInfoRequestPromise;

        // Time for rendering the popup
        await page.waitForTimeout(500);

        const identify = await project.identifyContentLocator(
            '7', 'quartiers_a7f4da66_f870_4f68_9b08_e48473c23742');

        await expect(identify.locator('.lizmapPopupTitle')).toHaveText("quartiers");

        // Check lizmap-features-table is present
        let lizmapFeaturesTable = identify.locator('lizmap-features-table');
        await expect(lizmapFeaturesTable).toHaveCount(1);
        await expect(lizmapFeaturesTable.locator("h4")).toHaveText("child sub-districts");

        // Check items count
        // "MC" has 10 sub-districts
        await expect(
            lizmapFeaturesTable.locator("table.lizmap-features-table-container tr.lizmap-features-table-item")
        ).toHaveCount(10);

        // Checking virtual columns
        await expect(lizmapFeaturesTable.locator('thead tr th:nth-child(1)')).toHaveText('');
        await expect(lizmapFeaturesTable.locator('thead tr th:nth-child(2)')).toHaveText('Virtual code');
        await expect(lizmapFeaturesTable.locator('thead tr th:nth-child(3)')).toHaveText('Virtual area');

        // Get first item and check it
        let firstItem = lizmapFeaturesTable.locator(
            "table.lizmap-features-table-container tr.lizmap-features-table-item").first();
        await expect(firstItem).toHaveAttribute('data-line-id', '1');
        await expect(firstItem).toHaveAttribute('data-feature-id', '17');
        await expect(firstItem.locator('td:nth-child(1)')).not.toBeEmpty();
        await expect(firstItem.locator('td:nth-child(2)')).toHaveText('MCN');
        await expect(firstItem.locator('td:nth-child(3)')).toHaveText('INVALID EXPRESSION');

        // Click on first item and check sub-popup
        await firstItem.click();
        await expect(
            lizmapFeaturesTable.locator(
                'div.lizmap-features-table'
            )
        ).toHaveClass(/popup-displayed/);
        await expect(firstItem).toHaveClass(/popup-displayed/);

        // Sub-district identify result
        let popupContainer = lizmapFeaturesTable.locator('div.lizmap-features-table-item-popup');
        await expect(popupContainer).toBeVisible();
        await expect(
            popupContainer.locator('table.lizmapPopupTable tbody tr:first-child td')
        ).toHaveText('17');

        // Next item
        let nextItemButton = lizmapFeaturesTable.locator(
            'div.lizmap-features-table-toolbar button.next-popup');
        await nextItemButton.click();
        await expect(popupContainer).toBeVisible();
        await expect(
            popupContainer.locator('table.lizmapPopupTable tbody tr:first-child td')
        ).toHaveText('9');

        // Close Item
        let closeItemButton = lizmapFeaturesTable.locator(
            'div.lizmap-features-table-toolbar button.close-popup');
        await closeItemButton.click();
        await expect(popupContainer).toBeHidden();
        await expect(
            lizmapFeaturesTable.locator('div.lizmap-features-table')
        ).not.toHaveClass(/popup-displayed/);
        await expect(firstItem).not.toHaveClass(/popup-displayed/);

        // Drag and Drop Item
        await page.locator(
            '.lizmap-features-table-container > tbody > tr:nth-child(2)'
        ).dragTo(
            page.locator('.lizmap-features-table-container > tbody > tr:first-child')
        );

        await expect(firstItem).toHaveAttribute('data-line-id', '1');
        await expect(firstItem).toHaveAttribute('data-feature-id', '9');

        let secondItem = lizmapFeaturesTable.locator(
            ".lizmap-features-table-container > tbody > tr:nth-child(2)");
        await expect(secondItem).toHaveAttribute('data-line-id', '2');
        await expect(secondItem).toHaveAttribute('data-feature-id', '17');

        // "expression filter" attribute listening changes
        // Changing "live" the expression filter from MC to MI
        const featTable = page.locator(`lizmap-features-table`);
        const idFeatTable = featTable.getAttribute("id");
        await featTable.evaluate(
            element => element.setAttribute('expressionfilter','quartmno = \'MI\''));

        await page.waitForTimeout(200);

        const newFeatTable = page.locator(`lizmap-features-table`);
        const newIdFeatTable = newFeatTable.getAttribute("id");

        await expect(idFeatTable).not.toEqual(newIdFeatTable);
    });
})
