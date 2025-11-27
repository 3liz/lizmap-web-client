// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import {ProjectPage} from "./pages/project";
import { expectParametersToContain } from './globals';

test.describe('N to M relations',
    {
        tag:['@write'],
    },
    () => {
        test('Attribute table and popup behavior', async ({ page }) => {
            const project = new ProjectPage(page, 'n_to_m_relations');
            await project.open();

            // open attribute table panel
            await page.locator('#button-attributeLayers').click();

            // maximize panel
            await page.getByRole('button', { name: 'Maximize' }).click();

            let getFeatureRequestPromise = page.waitForRequest(
                request => request.method() === 'POST'
                && request.postData()?.includes('GetFeature') === true
            );

            // open main layer attribute table panel
            await page.locator('#attribute-layer-list button[value="natural_areas"]').click();
            await getFeatureRequestPromise;

            // open birds spots attribute table panel
            await page.locator('#nav-tab-attribute-summary').click();
            await page.locator('#attribute-layer-list button[value="birds_spots"]').click();
            await getFeatureRequestPromise;

            // open birds attribute table panel
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
                await expect(featToolbar.locator(".feature-toolbar button[title='Select']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Filter']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Zoom']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Center']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Edit']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Delete']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Unlink child']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Create feature']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar .feature-create-child ul li a")).toHaveText("Bird sposts");
            }

            // check child layer html divs
            await expect(page.locator("#nav-tab-attribute-child-tab-natural_areas-birds")).toHaveCount(1);
            await expect(page.locator("#nav-tab-attribute-child-tab-natural_areas-birds_spots")).toHaveCount(1);

            // click on first row of main table and open "m" layer attribute table
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
                await expect(featToolbar.locator(".feature-toolbar button[title='Select']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Filter']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Zoom']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Center']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Edit']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Delete']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Unlink child']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Create feature']")).toBeHidden();
            }

            // change main record
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
                await expect(featToolbar.locator(".feature-toolbar button[title='Select']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Filter']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Zoom']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Center']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Edit']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Delete']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Unlink child']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Create feature']")).toBeHidden();
            }

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
                await expect(featToolbar.locator(".feature-toolbar button[title='Select']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Filter']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Zoom']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Center']")).toBeHidden();
                await expect(featToolbar.locator(".feature-toolbar button[title='Edit']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Delete']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Unlink child']")).toBeVisible();
                await expect(featToolbar.locator(".feature-toolbar button[title='Create feature']")).toBeHidden();
            }

            // unlink bird spot from second natural area record
            let unlinkOneToN = page.waitForRequest(request => request.method() === 'POST' && request.url().includes('unlinkChild'));

            await oneToNAttrTable.locator("tbody tr").nth(0).locator("td").nth(0).locator("lizmap-feature-toolbar")
                .locator(".feature-toolbar button[title='Unlink child']").click();
            await unlinkOneToN;

            // wait for UI to reload properly
            await page.waitForTimeout(300);

            await expect(page.locator("#lizmap-edition-message")).toBeVisible();
            await expect(page.locator("#lizmap-edition-message li.jelix-msg-item-success"))
                .toHaveText("The child feature has correctly been unlinked.");
            await page.locator("#lizmap-edition-message a.close").click();

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
            await expect(project.editionForm.locator("#edition-link-pivot"))
                .toHaveText("The new record will be linked to the feature ID \"2\" of \"Natural areas\" layer");

            // fill the form and submit
            await project.fillEditionFormTextInput('bird_name', 'Northern pintail');
            await project.fillEditionFormTextInput('bird_scientific_name', 'Anas acuta');

            await project.editingSubmitForm();

            await addBirdsRequestPromise;
            await expect(page.locator("#lizmap-edition-message ul.jelix-msg").nth(0)).toHaveText("Data has been saved.");
            await expect(page.locator("#lizmap-edition-message ul.jelix-msg").nth(1))
                .toHaveText('The new feature of layer "Birds" was successfully linked to the layer "Natural areas"');

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

            let unlinkPivotFeature = page.waitForResponse(response =>
                response.request().method() === 'POST'
                && response.request().postData()?.includes('%22bird_id%22+%3D+%279%27') === true
            );
            await childNaturalAreasTable.locator("tbody tr").nth(0).locator("td").nth(0).locator("lizmap-feature-toolbar")
                .locator(".feature-toolbar button[title='Unlink child']").click();
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
                && response.request().postData()?.includes('extent') === true
            );

            await expect(birdsTable.locator("tbody tr").nth(6).locator("td").nth(0).locator("lizmap-feature-toolbar").locator(".feature-toolbar button[title='Delete']")).toHaveCount(1);
            await birdsTable.locator("tbody tr").nth(6).locator("td").nth(0).locator("lizmap-feature-toolbar").locator(".feature-toolbar button[title='Delete']").click();
            await deleteBirdFeature;

            await expect(birdsTable.locator("tbody tr")).toHaveCount(8);

            // popup behavior
            await page.locator("#bottom-dock-window-buttons button.btn-bottomdock-clear").click()

            // click on map to get popup list
            let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();

            await project.clickOnMap(413, 232);

            let getFeatureInfoRequest = await getFeatureInfoRequestPromise;

            const expectedParameters = {
                'SERVICE': 'WMS',
                'REQUEST': 'GetFeatureInfo',
                'VERSION': '1.3.0',
                'INFO_FORMAT': /^text\/html/,
                'LAYERS': 'natural_areas',
                'QUERY_LAYERS': 'natural_areas',
                'STYLE': 'default',
                'WIDTH': '870',
                'HEIGHT': '575',
                'I': '413',
                'J': '232',
                'FEATURE_COUNT': '10',
                'CRS': 'EPSG:4326',
                'BBOX': /43.2302\d+,4.3586\d+,43.5724\d+,4.8765\d+/,
            }
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', expectedParameters);

            // wait for response
            let getFeatureInfoResponse = await getFeatureInfoRequest.response();
            responseExpect(getFeatureInfoResponse).toBeHtml();

            // time for rendering the popup
            await page.waitForTimeout(100);

            let popup = await project.identifyContentLocator(
                '1',
                'natural_areas_5f5587de_ddf8_4740_a724_00bcdf518813'
            );
            await expect(popup.locator('.lizmapPopupTitle').first()).toHaveText('Natural areas');

            let natAreaElements = popup.locator(".container.popup_lizmap_dd").first().locator(".before-tabs .control-group");
            await expect(natAreaElements).toHaveCount(2);
            await expect(natAreaElements.nth(0).locator('.jforms-control-input')).toHaveText("1");
            await expect(natAreaElements.nth(1).locator('.jforms-control-input')).toHaveText("Étang du Galabert");

            // inspect popup children
            let childrenBirds = popup.locator('.lizmapPopupChildren.birds .lizmapPopupSingleFeature');
            await expect(childrenBirds).toHaveCount(4);

            // unlink a bird from popup
            page.once('dialog', dialog => {
                expect(dialog.message()).toBe("Are you sure you want to unlink the selected feature from \"Natural areas\" layer?");
                return dialog.accept();
            });

            let unlinkPopupPivotFeature = page.waitForResponse(response =>
                response.request().method() === 'GET'
                && response.request().url().includes('deleteFeature')
            );
            await childrenBirds.nth(0).locator("lizmap-feature-toolbar button.feature-unlink").click();
            await unlinkPopupPivotFeature;

            await expect(childrenBirds.nth(0).locator(".lizmapPopupDiv")).toHaveCount(0);

            // add a new bird from natural areas popup
            let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
            await popup.locator("lizmap-feature-toolbar").first().locator('.feature-toolbar button.feature-edit').click();
            await editFeatureRequestPromise;

            await expect(page.locator("#edition-child-tab-natural_areas-birds")).toHaveCount(1);

            // click on the add feature button
            await page.locator("#edition-child-tab-natural_areas-birds .attribute-layer-feature-create").nth(0).click();
            await editFeatureRequestPromise;

            await expect(page.locator("#edition-link-pivot")).toHaveText("The new record will be linked to the feature ID \"1\" of \"Natural areas\" layer")

            // fill the form and submit
            await project.fillEditionFormTextInput('bird_name', 'Common snipe');
            await project.fillEditionFormTextInput('bird_scientific_name', 'Gallinago gallinago');

            await project.editingSubmitForm();
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

            //await project.editionForm.locator('#jforms_view_edition_liz_future_action').selectOption('create');
            // fill the form and submit
            await project.fillEditionFormTextInput('bird_name', 'Mute swan');
            await project.fillEditionFormTextInput('bird_scientific_name', 'Cygnus olor');
            await project.editingSubmitForm('create');

            await editFeatureRequestPromise;

            await page.waitForTimeout(500);
            await expect(page.locator(".alert-linkaddedfeature p")).toHaveText('The new feature of layer "Birds" was successfully linked to the layer "Natural areas"');
            await expect(page.locator("#edition-link-pivot")).toHaveText("The new record will be linked to the feature ID \"1\" of \"Natural areas\" layer")

            // insert new bird with option "reopen form", this should not add the pivot record in order to avoid duplication
            // fill the form and submit
            await project.fillEditionFormTextInput('bird_name', 'Common shelduck');
            await project.fillEditionFormTextInput('bird_scientific_name', 'Tadorna tadorna');
            await project.editingSubmitForm('edit');

            await editFeatureRequestPromise;
            await expect(page.locator(".alert-linkaddedfeature p")).toHaveText('The new feature of layer "Birds" was successfully linked to the layer "Natural areas"');
            await expect(page.locator("#edition-link-pivot")).toHaveCount(0);

            // submit again to update
            await project.editingSubmitForm('edit');

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
        });
    });
