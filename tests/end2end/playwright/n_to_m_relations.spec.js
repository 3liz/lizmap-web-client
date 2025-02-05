// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('N to M relations', () => {
    test('Attribute table and popup behavior', async ({ page }) => {
        /* eslint-disable no-unused-vars */
        const url = '/index.php/view/map/?repository=testsrepository&project=n_to_m_relations';
        await gotoMap(url, page);

        // open attribute table panel
        await page.locator('#button-attributeLayers').click();

        // maximize panel
        await page.getByRole('button', { name: 'Maximize' }).click();

        let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);

        // open main layer attribute table panel
        await page.locator('#attribute-layer-list button[value="natural_areas"]').click();
        await getFeatureRequestPromise;

        // open birds spots attribute table panel
        let birdSpotRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);
        await page.locator('#nav-tab-attribute-summary').click();
        await page.locator('#attribute-layer-list button[value="birds_spots"]').click();
        await getFeatureRequestPromise;

        // open birds attribute table panel
        let birdsRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);
        await page.locator('#nav-tab-attribute-summary').click();
        await page.locator('#attribute-layer-list button[value="birds"]').click();
        await getFeatureRequestPromise;

        //back to natural areas panel
        await page.locator('#nav-tab-attribute-layer-natural_areas').click();

        let attrTable = page.locator("#attribute-layer-table-natural_areas");
        await expect(attrTable).toHaveCount(1);

        // inspect main table
        await expect(attrTable.locator("tbody tr")).toHaveCount(3);
        await expect(attrTable.locator("tbody tr").nth(0).locator("td").nth(1)).toHaveText("1");
        await expect(attrTable.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("Étang du Galabert");
        await expect(attrTable.locator("tbody tr").nth(1).locator("td").nth(1)).toHaveText("2");
        await expect(attrTable.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("Étang de la Vignalie");
        await expect(attrTable.locator("tbody tr").nth(2).locator("td").nth(1)).toHaveText("3");
        await expect(attrTable.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("Étang Saint Anne");

        // inspect feature toolbar of main table
        let naturalAreasTableFeatureToolbar = attrTable.locator("tbody tr").all();
        for (const tr of await naturalAreasTableFeatureToolbar) {
            const featToolbar = tr.locator("td").nth(0).locator("lizmap-feature-toolbar");
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Select']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Filter']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Zoom']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Center']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Edit']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Delete']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Unlink child']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Create feature']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar .feature-create-child ul li a")).toHaveText("Bird sposts");
        }

        // check child layer html divs
        await expect(page.locator("#nav-tab-attribute-child-tab-natural_areas-birds")).toHaveCount(1);
        await expect(page.locator("#nav-tab-attribute-child-tab-natural_areas-birds_spots")).toHaveCount(1);

        // click on first row of main table and open "m" layer attribute table
        let firstChildRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);
        await attrTable.locator("tbody tr").nth(0).click();
        await getFeatureRequestPromise;

        let nRelatedAttrTable = page.locator("#attribute-layer-table-natural_areas-birds");
        await expect(attrTable).toHaveCount(1);

        // inspect "m" layer related table
        await expect(nRelatedAttrTable.locator("tbody tr")).toHaveCount(4);
        await expect(nRelatedAttrTable.locator("tbody tr").nth(0).locator("td").nth(1)).toHaveText("1");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("Greater flamingo");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(1).locator("td").nth(1)).toHaveText("2");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("Black-winged stilt");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(2).locator("td").nth(1)).toHaveText("6");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("Common tern");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(3).locator("td").nth(1)).toHaveText("8");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(3).locator("td").nth(2)).toHaveText("Little grebe");

        // inspect feature toolbar of "m" related layer
        let mTableFeatureToolbarFirst = nRelatedAttrTable.locator("tbody tr").all();
        for (const tr of await mTableFeatureToolbarFirst) {
            const featToolbar = tr.locator("td").nth(0).locator("lizmap-feature-toolbar");
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Select']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Filter']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Zoom']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Center']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Edit']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Delete']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Unlink child']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Create feature']")).toBeHidden();
        }

        // change main record
        let secondChildRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);
        await attrTable.locator("tbody tr").nth(1).click();
        await getFeatureRequestPromise;

        // inspect new list of birds
        await expect(nRelatedAttrTable.locator("tbody tr")).toHaveCount(3);
        await expect(nRelatedAttrTable.locator("tbody tr").nth(0).locator("td").nth(1)).toHaveText("1");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("Greater flamingo");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(1).locator("td").nth(1)).toHaveText("3");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("Purple heron");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(2).locator("td").nth(1)).toHaveText("5");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("Eurasian teal");

        let mTableFeatureToolbarSecond = nRelatedAttrTable.locator("tbody tr").all();
        for (const tr of await mTableFeatureToolbarSecond) {
            const featToolbar = tr.locator("td").nth(0).locator("lizmap-feature-toolbar");
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Select']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Filter']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Zoom']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Center']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Edit']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Delete']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Unlink child']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Create feature']")).toBeHidden();
        }

        // back to first record
        //let backToFirstChildRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);
        //await attrTable.locator("tbody tr").nth(0).click();
        //await getFeatureRequestPromise;

        // change tab to inspect bird spots (1:n control)
        await page.locator("#nav-tab-attribute-child-tab-natural_areas-birds_spots").click();

        // inspect 1:n layer related table
        let oneToNAttrTable = page.locator("#attribute-layer-table-natural_areas-birds_spots");
        await expect(oneToNAttrTable).toHaveCount(1);

        // inspect 1:n layer table
        await expect(oneToNAttrTable.locator("tbody tr")).toHaveCount(2);
        await expect(oneToNAttrTable.locator("tbody tr").nth(0).locator("td").nth(1)).toHaveText("3");
        await expect(oneToNAttrTable.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("Étang de la Vignalie");
        await expect(oneToNAttrTable.locator("tbody tr").nth(0).locator("td").nth(3)).toHaveText("East tower");
        await expect(oneToNAttrTable.locator("tbody tr").nth(1).locator("td").nth(1)).toHaveText("4");
        await expect(oneToNAttrTable.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("Étang de la Vignalie");
        await expect(oneToNAttrTable.locator("tbody tr").nth(1).locator("td").nth(3)).toHaveText("Vignalie tower");

        // inspect feature toolbar of 1:n layer table
        let oneToNTableFeatureToolbar = oneToNAttrTable.locator("tbody tr").all();
        for (const tr of await oneToNTableFeatureToolbar) {
            const featToolbar = tr.locator("td").nth(0).locator("lizmap-feature-toolbar");
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Select']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Filter']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Zoom']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Center']")).toBeHidden();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Edit']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Delete']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Unlink child']")).toBeVisible();
            await expect(featToolbar.locator(".feature-toolbar button[data-bs-title='Create feature']")).toBeHidden();
        }

        // unlink bird spot from second natural area record
        let unlinkOneToN = page.waitForRequest(request => request.method() === 'POST' && request.url().includes('unlinkChild'));

        await oneToNAttrTable.locator("tbody tr").nth(0).locator("td").nth(0).locator("lizmap-feature-toolbar").locator(".feature-toolbar button[data-bs-title='Unlink child']").click();
        await unlinkOneToN;

        // wait for UI to reload properly
        await page.waitForTimeout(300);

        await expect(page.locator("#lizmap-edition-message")).toBeVisible();
        await expect(page.locator("#lizmap-edition-message li.jelix-msg-item-success")).toHaveText("The child feature has correctly been unlinked.");
        await page.locator("#lizmap-edition-message .btn-close").click();


        // check 1:n table
        await expect(oneToNAttrTable.locator("tbody tr")).toHaveCount(1);
        await expect(oneToNAttrTable.locator("tbody tr").nth(0).locator("td").nth(1)).toHaveText("4");
        await expect(oneToNAttrTable.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("Étang de la Vignalie");
        await expect(oneToNAttrTable.locator("tbody tr").nth(0).locator("td").nth(3)).toHaveText("Vignalie tower");

        // go to birds spots tab and check the unlinked record
        await page.locator('#nav-tab-attribute-layer-birds_spots').click();
        let birdsSpotsTable = page.locator("#attribute-layer-table-birds_spots");

        await expect(birdsSpotsTable.locator("tbody tr")).toHaveCount(5);
        await expect(birdsSpotsTable.getByRole('row', { name: '3 East tower' }).getByRole('cell').nth(2)).toHaveText("");


        // insert new bird associated with first area

        //back to natural areas panel first
        await page.locator('#nav-tab-attribute-layer-natural_areas').click();

        let addBirdsRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
        await page.locator("#attribute-layer-main-natural_areas .edition-children-add-buttons button[value='birds']").click();
        await addBirdsRequestPromise;

        // check info message for link pivot
        await expect(page.locator("#edition-link-pivot")).toHaveText("The new record will be linked to the feature ID \"2\" of \"Natural areas\" layer")

        // fill the form and submit
        await page.locator("#jforms_view_edition").getByLabel('Name', { exact: true }).fill("Northern pintail");
        await page.locator("#jforms_view_edition").getByLabel('Scientific name', { exact: true }).fill("Anas acuta");

        await page.locator('#jforms_view_edition__submit_submit').click();

        await addBirdsRequestPromise;

        await expect(page.locator("#lizmap-edition-message")).toBeVisible();
        await expect(page.locator("#lizmap-edition-message ul.jelix-msg").nth(0)).toHaveText("Data has been saved.");
        await expect(page.locator("#lizmap-edition-message ul.jelix-msg").nth(1)).toHaveText('The new feature of layer "Birds" was successfully linked to the layer "Natural areas"');

        // check birds child table
        await page.locator("#nav-tab-attribute-child-tab-natural_areas-birds").click();

        await expect(nRelatedAttrTable.locator("tbody tr")).toHaveCount(4);
        await expect(nRelatedAttrTable.locator("tbody tr").nth(0).locator("td").nth(1)).toHaveText("1");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("Greater flamingo");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(1).locator("td").nth(1)).toHaveText("3");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("Purple heron");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(2).locator("td").nth(1)).toHaveText("5");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("Eurasian teal");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(3).locator("td").nth(1)).toHaveText("9");
        await expect(nRelatedAttrTable.locator("tbody tr").nth(3).locator("td").nth(2)).toHaveText("Northern pintail");

        // go to birds panel and look for the new inserted record
        await page.locator('#nav-tab-attribute-layer-birds').click();

        let birdsTable = page.locator("#attribute-layer-table-birds");
        await expect(birdsTable.locator("tbody tr")).toHaveCount(9);
        await expect(birdsTable.locator("tbody tr").nth(0).locator("td").nth(1)).toHaveText("1");
        await expect(birdsTable.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("Greater flamingo");
        await expect(birdsTable.locator("tbody tr").nth(1).locator("td").nth(1)).toHaveText("2");
        await expect(birdsTable.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("Black-winged stilt");
        await expect(birdsTable.locator("tbody tr").nth(2).locator("td").nth(1)).toHaveText("3");
        await expect(birdsTable.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("Purple heron");
        await expect(birdsTable.locator("tbody tr").nth(3).locator("td").nth(1)).toHaveText("4");
        await expect(birdsTable.locator("tbody tr").nth(3).locator("td").nth(2)).toHaveText("Kingfisher");
        await expect(birdsTable.locator("tbody tr").nth(4).locator("td").nth(1)).toHaveText("5");
        await expect(birdsTable.locator("tbody tr").nth(4).locator("td").nth(2)).toHaveText("Eurasian teal");
        await expect(birdsTable.locator("tbody tr").nth(5).locator("td").nth(1)).toHaveText("6");
        await expect(birdsTable.locator("tbody tr").nth(5).locator("td").nth(2)).toHaveText("Common tern");
        await expect(birdsTable.locator("tbody tr").nth(6).locator("td").nth(1)).toHaveText("7");
        await expect(birdsTable.locator("tbody tr").nth(6).locator("td").nth(2)).toHaveText("Black-headed gull");
        await expect(birdsTable.locator("tbody tr").nth(7).locator("td").nth(1)).toHaveText("8");
        await expect(birdsTable.locator("tbody tr").nth(7).locator("td").nth(2)).toHaveText("Little grebe");
        await expect(birdsTable.locator("tbody tr").nth(8).locator("td").nth(1)).toHaveText("9");
        await expect(birdsTable.locator("tbody tr").nth(8).locator("td").nth(2)).toHaveText("Northern pintail");

        // click on last inserted record and check child attribute table
        let naturalAreaChildPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);
        await birdsTable.locator("tbody tr").nth(8).click();
        await getFeatureRequestPromise;

        let childNaturalAreasTable = page.locator("#attribute-layer-table-birds-natural_areas");
        await expect(childNaturalAreasTable.locator("tbody tr")).toHaveCount(1);
        await expect(childNaturalAreasTable.locator("tbody tr").nth(0).locator("td").nth(1)).toHaveText("2");
        await expect(childNaturalAreasTable.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("Étang de la Vignalie");

        // unlink area from birds, this should delete the pivot record
        page.once('dialog', dialog => {
            expect(dialog.message()).toBe("Are you sure you want to unlink the selected feature from \"Birds\" layer?");
            return dialog.accept();
        });

        let unlinkPivotFeature = page.waitForResponse(response => response.request().method() === 'POST' && response.request().postData()?.includes('%22bird_id%22+%3D+%279%27') === true)
        await childNaturalAreasTable.locator("tbody tr").nth(0).locator("td").nth(0).locator("lizmap-feature-toolbar").locator(".feature-toolbar button[data-bs-title='Unlink child']").click();
        await unlinkPivotFeature;


        await page.waitForTimeout(300);

        await expect(childNaturalAreasTable.locator("tbody tr")).toHaveCount(1)
        await expect(childNaturalAreasTable.locator("tbody tr").nth(0).locator("td").nth(0)).toHaveText("No data available in table");

        // delete a bird record, this should remove pivot records too
        page.once('dialog', dialog => {
            expect(dialog.message()).toBe("Are you sure you want to delete the selected feature? \n\nThe related links with the following layers:\n \nNatural areas \n\nwill be also deleted");
            return dialog.accept();
        });

        let deleteBirdFeature = page.waitForResponse(response => response.request().method() === 'POST'
            && response.request().postData()?.includes('GetFeature') === true
            && response.request().postData()?.includes('birds') === true
            && response.request().postData()?.includes('extent') === true)
        await expect(birdsTable.locator("tbody tr").nth(6).locator("td").nth(0).locator("lizmap-feature-toolbar").locator(".feature-toolbar button[data-bs-title='Delete']")).toHaveCount(1);
        await birdsTable.locator("tbody tr").nth(6).locator("td").nth(0).locator("lizmap-feature-toolbar").locator(".feature-toolbar button[data-bs-title='Delete']").click();
        await deleteBirdFeature;

        await expect(birdsTable.locator("tbody tr")).toHaveCount(8);

        // popup behavior
        await page.locator("#bottom-dock-window-buttons button.btn-bottomdock-clear").click()

        // click on map to get popup list
        let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeatureInfo') === true);
        await page.locator('#newOlMap').click({
            position: {
                x: 413,
                y: 232
            }
        });
        await getFeatureInfoRequestPromise;

        //time for rendering the popup
        await page.waitForTimeout(500);

        await expect(page.locator('.lizmapPopupContent > .lizmapPopupSingleFeature .lizmapPopupTitle').first()).toHaveText("Natural areas");
        await expect(page.locator(".container.popup_lizmap_dd").nth(0).locator(".before-tabs div.field")).toHaveCount(2);
        await expect(page.locator(".container.popup_lizmap_dd").nth(0).locator(".before-tabs div.field").nth(0)).toHaveText("1");
        await expect(page.locator(".container.popup_lizmap_dd").nth(0).locator(".before-tabs div.field").nth(1)).toHaveText("Étang du Galabert");

        // inspect popup children
        await expect(page.locator(".lizmapPopupContent .lizmapPopupChildren")).toHaveCount(2);
        await expect(page.locator(".lizmapPopupContent .lizmapPopupChildren").nth(0).locator(".lizmapPopupSingleFeature")).toHaveCount(4);

        // unlink a bird from popup

        page.once('dialog', dialog => {
            expect(dialog.message()).toBe("Are you sure you want to unlink the selected feature from \"Natural areas\" layer?");
            return dialog.accept();
        });

        let unlinkPopupPivotFeature = page.waitForResponse(response => response.request().method() === 'GET' && response.request().url().includes('deleteFeature'));
        await page.locator(".lizmapPopupContent .lizmapPopupChildren").nth(0).locator(".lizmapPopupSingleFeature").nth(0).locator(".lizmapPopupDiv lizmap-feature-toolbar .feature-toolbar button[data-bs-title='Unlink child']").click();
        await unlinkPopupPivotFeature;

        await expect(page.locator(".lizmapPopupContent .lizmapPopupChildren").nth(0).locator(".lizmapPopupSingleFeature").nth(0).locator(".lizmapPopupDiv")).toHaveCount(0)

        // add a new bird from natural areas popup
        let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
        await page.locator('.lizmapPopupContent > .lizmapPopupSingleFeature').nth(0).locator("lizmap-feature-toolbar").first().locator(".feature-toolbar button[data-bs-title='Edit']").click()
        await editFeatureRequestPromise;

        await expect(page.locator("#edition-child-tab-natural_areas-birds")).toHaveCount(1);

        // click on the add feature button
        await page.locator("#edition-child-tab-natural_areas-birds .attribute-layer-feature-create").nth(0).click()
        await editFeatureRequestPromise;

        await expect(page.locator("#edition-link-pivot")).toHaveText("The new record will be linked to the feature ID \"1\" of \"Natural areas\" layer")

        // fill the form and submit
        await page.locator("#jforms_view_edition").getByLabel('Name', { exact: true }).fill("Common snipe");
        await page.locator("#jforms_view_edition").getByLabel('Scientific name', { exact: true }).fill("Gallinago gallinago");

        await page.locator('#jforms_view_edition__submit_submit').click();
        await editFeatureRequestPromise;

        await page.waitForTimeout(500);

        // inspect birds table in edition form
        let editionFormBirdsTable = page.locator("#edition-table-natural_areas-birds");

        await expect(editionFormBirdsTable).toHaveCount(1);
        await expect(editionFormBirdsTable.locator("tbody tr")).toHaveCount(4);
        await expect(editionFormBirdsTable.locator("tbody tr").nth(0).locator("td").nth(1)).toHaveText("1");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("Greater flamingo");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(1).locator("td").nth(1)).toHaveText("2");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("Black-winged stilt");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(2).locator("td").nth(1)).toHaveText("6");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("Common tern");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(3).locator("td").nth(1)).toHaveText("10");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(3).locator("td").nth(2)).toHaveText("Common snipe");

        // insert new bird with "create new feature" submit option, this should create the pivot record again
        // click on the add feature button
        await page.locator("#edition-child-tab-natural_areas-birds .attribute-layer-feature-create").nth(0).click()
        await editFeatureRequestPromise;

        await expect(page.locator("#edition-link-pivot")).toHaveText("The new record will be linked to the feature ID \"1\" of \"Natural areas\" layer")

        await page.locator('#jforms_view_edition_liz_future_action').selectOption("create");
        // fill the form and submit
        await page.locator("#jforms_view_edition").getByLabel('Name', { exact: true }).fill("Mute swan");
        await page.locator("#jforms_view_edition").getByLabel('Scientific name', { exact: true }).fill("Cygnus olor");

        await page.locator('#jforms_view_edition__submit_submit').click();
        await editFeatureRequestPromise;

        await page.waitForTimeout(500);
        await expect(page.locator(".alert-linkaddedfeature p")).toHaveText('The new feature of layer "Birds" was successfully linked to the layer "Natural areas"');
        await expect(page.locator("#edition-link-pivot")).toHaveText("The new record will be linked to the feature ID \"1\" of \"Natural areas\" layer")

        // insert new bird with option "reopen form", this should not add the pivot record in order to avoid duplication

        await page.locator('#jforms_view_edition_liz_future_action').selectOption("edit");

        // fill the form and submit
        await page.locator("#jforms_view_edition").getByLabel('Name', { exact: true }).fill("Common shelduck");
        await page.locator("#jforms_view_edition").getByLabel('Scientific name', { exact: true }).fill("Tadorna tadorna");

        await page.locator('#jforms_view_edition__submit_submit').click();
        await editFeatureRequestPromise;
        await expect(page.locator(".alert-linkaddedfeature p")).toHaveText('The new feature of layer "Birds" was successfully linked to the layer "Natural areas"');
        await expect(page.locator("#edition-link-pivot")).toHaveCount(0);

        // submit again to update
        await page.locator('#jforms_view_edition__submit_submit').click();
        await editFeatureRequestPromise;

        await expect(page.locator(".alert-linkaddedfeature")).toHaveCount(0);
        await expect(page.locator("#edition-link-pivot")).toHaveCount(0);

        // cancel edition and inspect new child attribute table
        page.once('dialog', dialog => {
            return dialog.accept();
        });
        await page.locator('#jforms_view_edition__submit_cancel').click();
        await editFeatureRequestPromise;

        await expect(editionFormBirdsTable).toHaveCount(1);
        await expect(editionFormBirdsTable.locator("tbody tr")).toHaveCount(6);
        await expect(editionFormBirdsTable.locator("tbody tr").nth(0).locator("td").nth(1)).toHaveText("1");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("Greater flamingo");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(1).locator("td").nth(1)).toHaveText("2");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("Black-winged stilt");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(2).locator("td").nth(1)).toHaveText("6");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(2).locator("td").nth(2)).toHaveText("Common tern");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(3).locator("td").nth(1)).toHaveText("10");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(3).locator("td").nth(2)).toHaveText("Common snipe");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(4).locator("td").nth(1)).toHaveText("11");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(4).locator("td").nth(2)).toHaveText("Mute swan");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(5).locator("td").nth(1)).toHaveText("12");
        await expect(editionFormBirdsTable.locator("tbody tr").nth(5).locator("td").nth(2)).toHaveText("Common shelduck");
        /* eslint-enable no-unused-vars */
    })
})
