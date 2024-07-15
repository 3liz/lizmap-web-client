// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Edition of an embedded layer', () => {
    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=edition_embed';
        await gotoMap(url, page);
        await page.locator('#dock-close').click();
    });

    test('Open embedded layer edition form', async ({ page }) => {
        let editPointRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));

        await page.locator('#button-edition').click();
        await page.locator('#edition-layer').selectOption({ label: 'Embedded Point' });
        await page.locator('#edition-draw').click();

        await editPointRequestPromise;

        // Wait a bit for the UI
        await page.waitForTimeout(300);

        // inspect the form
        // id
        await expect(page.locator('#jforms_view_edition_id')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_id_label')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_id_label')).toHaveText("Id");

        // external_ref
        await expect(page.locator('#jforms_view_edition_id_ext_point')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_id_ext_point_label')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_id_ext_point_label')).toHaveText("external_ref");
        await page.locator('#jforms_view_edition_id_ext_point').selectOption("1");
        await page.locator('#jforms_view_edition_id_ext_point').selectOption("2");

        // description
        await expect(page.locator('#jforms_view_edition_descr')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_descr_label')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_descr_label')).toHaveText("Point description");

        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.accept()
        });
        //close form
        await page.locator("#jforms_view_edition__submit_cancel").click()



        let editLineRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));


        //await page.locator('#button-edition').click();
        await page.locator('#edition-layer').selectOption({ label: 'Embedded Line' });
        await page.locator('#edition-draw').click();

        await editLineRequestPromise;

        // Wait a bit for the UI
        await page.waitForTimeout(300);

        // inspect the form
        // id
        await expect(page.locator('#jforms_view_edition_id')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_id_label')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_id_label')).toHaveText("id");

        // descr
        await expect(page.locator('#jforms_view_edition_descr')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_descr_label')).toBeVisible();
        await expect(page.locator('#jforms_view_edition_descr_label')).toHaveText("Description");
    })
})
