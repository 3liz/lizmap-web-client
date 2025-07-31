import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';

let project;

test.describe('Advanced form', function () {

    test.beforeEach(async function ({ page }) {
        project = new ProjectPage(page, 'form_advanced');
        await project.open();

        const formRequest = await project.openEditingFormWithLayer('form_advanced_point');
        await formRequest.response();

        // Click on map as form needs a geometry
        project.clickOnMapLegacy(410, 175);
    });

    test('should toggle tab visibility when toggling checkbox', async function ({
        page,
    }) {
        await expect(
            page.locator('#jforms_view_edition-tabs > li:nth-child(2)')
        ).toBeHidden();
        await expect(
            page.locator('#jforms_view_edition-tabs > li:nth-child(2)')
        ).toHaveText('photo');
        await expect(
            page.locator('#jforms_view_edition_has_photo')
        ).not.toBeChecked();

        // 't' is a legacy value meaning true. This might change in future
        await expect(page.locator('#jforms_view_edition_has_photo')).toHaveValue(
            't'
        );
        await page.locator('#jforms_view_edition_has_photo').click();
        await expect(
            page.locator('#jforms_view_edition-tabs > li:nth-child(2)')
        ).toBeVisible();
        await expect(page.locator('#jforms_view_edition_has_photo')).toBeChecked();
        await page.locator('#jforms_view_edition_has_photo').click();
        await expect(
            page.locator('#jforms_view_edition-tabs > li:nth-child(2)')
        ).not.toBeVisible();
        await expect(
            page.locator('#jforms_view_edition_has_photo')
        ).not.toBeChecked();
    });

    test('should have expression constraint on field', async function ({ page }) {
        // Type string not valid for expression constraint
        await page.locator('#jforms_view_edition_website').fill('a');
        await page.locator('#jforms_view_edition__submit_submit').click();

        // Assert an error is returned
        await expect(
            page.locator('#jforms_view_edition_website_label')
        ).toHaveClass(/jforms-error/);
        await expect(page.locator('#jforms_view_edition_website')).toHaveClass(
            /jforms-error/
        );
        await expect(page.locator('#jforms_view_edition_errors')).toHaveClass(
            /jforms-error-list/
        );
        await expect(page.locator('#jforms_view_edition_errors p')).toHaveText(
            "Web site URL must start with 'http'"
        );

        // Type string valid for expression constraint
        await page
            .locator('#jforms_view_edition_website')
            .fill('https://www.3liz.com');
        await page.locator('#jforms_view_edition__submit_submit').click();

        // A message should confirm form had been saved and form selector should be displayed back
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();
        await expect(page.locator('#edition-layer')).toBeVisible();
    });

    test('should change selected quartier and sousquartier based on drawn point', async function ({
        page,
    }) {
        await expect(
            page.locator('#jforms_view_edition_quartier option')
        ).toHaveCount(2);
        await expect(
            page.locator('#jforms_view_edition_quartier option').first()
        ).toHaveText('');
        await expect(
            page.locator('#jforms_view_edition_quartier option').last()
        ).toHaveText('HOPITAUX-FACULTES');

        // Cancel and open form
        page.on('dialog', dialog => dialog.accept());
        await page.locator('#jforms_view_edition__submit_cancel').click();
        await page.locator('#edition-draw').click();

        // Create the promise to wait for the response to GetData
        const getDataPromise = page.waitForResponse(/jelix\/forms\/getdata/);
        // Assert quartier value is good for another drawn point
        project.clickOnMapLegacy(455, 250);
        // Wait for GetData  completed before checking the select (for quartier based on geometry)
        await getDataPromise;
        await expect(
            page.locator('#jforms_view_edition_quartier option')
        ).toHaveCount(2);

        await page.waitForTimeout(100);

        // Select MONTPELLIER CENTRE
        await page
            .locator('#jforms_view_edition_quartier')
            .selectOption({ label: 'MONTPELLIER CENTRE' });
        // Wait for GetData completed before checking the select (for sousquartier based on quartier)
        await getDataPromise;

        // Assert 11 options are proposed for sousquartier list
        await expect(
            page.locator('#jforms_view_edition_sousquartier option')
        ).toHaveCount(11);
    });
});
