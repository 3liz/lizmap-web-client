// @ts-check
import { test, expect } from '@playwright/test';
import {ProjectPage} from "./pages/project";

test.describe('Display embedded relation in popup',
    {
        tag: ['@readonly'],
    }, () =>
    {

        test('Visualize popup for embedded layers', async ({ page }) => {

            const project = new ProjectPage(page, 'relations_project_embed');
            await project.open();
            await project.closeLeftDock();

            let getFeatureInfoRequestPromise = page.waitForRequest(
                request => request.method() === 'POST'
                && request.postData()?.includes('GetFeatureInfo') === true
            );

            //first point
            await project.clickOnMap(74, 40);

            await getFeatureInfoRequestPromise;

            //time for rendering the popup
            await page.waitForTimeout(500);

            let popup = await project.identifyContentLocator(
                '3',
                'father_layer_79f5a996_39db_4a1f_b270_dfe21d3e44ff'
            );

            await expect(popup.locator('.lizmapPopupTitle').first()).toHaveText('father_layer');

            let fatherElements = popup.locator(".container.popup_lizmap_dd").first().locator(".before-tabs .control-group");
            await expect(fatherElements).toHaveCount(3);
            await expect(fatherElements.nth(0).locator('label')).toHaveText("fid");
            await expect(fatherElements.nth(0).locator('.jforms-control-input')).toHaveText("3");
            await expect(fatherElements.nth(1).locator('label')).toHaveText("ref_id");
            await expect(fatherElements.nth(1).locator('.jforms-control-input')).toHaveText("1");
            await expect(fatherElements.nth(2).locator('label')).toHaveText("description");
            await expect(fatherElements.nth(2).locator('.jforms-control-input')).toHaveText("Father 1");

            //check childrens
            let childrenElements = popup.locator('.lizmapPopupChildren .lizmapPopupSingleFeature');
            await expect(childrenElements).toHaveCount(2);

            // first children
            let firstChildRows = childrenElements.nth(0).getByRole('table').locator('tbody tr');
            await expect(firstChildRows).toHaveCount(3);
            await expect(firstChildRows.nth(0).locator("td")).toHaveText("2");
            await expect(firstChildRows.nth(1).locator("td")).toHaveText("1");
            await expect(firstChildRows.nth(2).locator("td")).toHaveText("Child 2");
            // second children
            let secondChildRow = childrenElements.nth(1).getByRole('table').locator('tbody tr');
            await expect(secondChildRow.nth(0).locator("td")).toHaveText("1");
            await expect(secondChildRow.nth(1).locator("td")).toHaveText("1");
            await expect(secondChildRow.nth(2).locator("td")).toHaveText("Child 1");

            //clear screen
            await project.closeLeftDock();

            //second point
            await project.clickOnMap(392, 257);
            await getFeatureInfoRequestPromise;

            //time for rendering the popup
            await page.waitForTimeout(500);

            popup = await project.identifyContentLocator(
                '4',
                'father_layer_79f5a996_39db_4a1f_b270_dfe21d3e44ff'
            );

            await expect(popup.locator('.lizmapPopupTitle').first()).toHaveText('father_layer');

            fatherElements = popup.locator(".container.popup_lizmap_dd").first().locator(".before-tabs .control-group");
            await expect(fatherElements).toHaveCount(3);
            await expect(fatherElements.nth(0).locator('label')).toHaveText("fid");
            await expect(fatherElements.nth(0).locator('.jforms-control-input')).toHaveText("4");
            await expect(fatherElements.nth(1).locator('label')).toHaveText("ref_id");
            await expect(fatherElements.nth(1).locator('.jforms-control-input')).toHaveText("2");
            await expect(fatherElements.nth(2).locator('label')).toHaveText("description");
            await expect(fatherElements.nth(2).locator('.jforms-control-input')).toHaveText("Father 2");

            childrenElements = popup.locator('.lizmapPopupChildren .lizmapPopupSingleFeature');
            // first children
            firstChildRows = childrenElements.nth(0).getByRole('table').locator('tbody tr');
            await expect(firstChildRows).toHaveCount(3);
            await expect(firstChildRows.nth(0).locator("td")).toHaveText("4");
            await expect(firstChildRows.nth(1).locator("td")).toHaveText("2");
            await expect(firstChildRows.nth(2).locator("td")).toHaveText("Child 4");
            // second children
            secondChildRow = childrenElements.nth(1).getByRole('table').locator('tbody tr');
            await expect(secondChildRow.nth(0).locator("td")).toHaveText("3");
            await expect(secondChildRow.nth(1).locator("td")).toHaveText("2");
            await expect(secondChildRow.nth(2).locator("td")).toHaveText("Child 3");
        });
    });
