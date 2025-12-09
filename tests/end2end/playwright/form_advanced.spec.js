import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';

test.describe('Advanced form', function () {

    test.beforeEach(async function ({ page }) {
        const project = new ProjectPage(page, 'form_advanced');
        const getMapRequestPromise = project.waitForGetMapRequest();
        await project.open();
        const getMapRequest = await getMapRequestPromise;
        await getMapRequest.response();

        const formRequest = await project.openEditingFormWithLayer('form_advanced_point');
        await formRequest.response();

        // Create the promise to wait for GetData response
        const getDataPromise = page.waitForResponse(/jelix\/forms\/getdata/)

        // Click on map as form needs a geometry
        project.clickOnMapLegacy(410, 175);

        // wait for the response completed
        let getDataResponse = await getDataPromise;
        await getDataResponse.finished();
    });

    test('should toggle tab visibility when toggling checkbox @readonly', async function ({
        page,
    }) {
        const project = new ProjectPage(page, 'form_advanced');
        await expect(
            page.locator('#jforms_view_edition-tabs > li:nth-child(2)')
        ).toBeHidden();
        await expect(
            page.locator('#jforms_view_edition-tabs > li:nth-child(2)')
        ).toHaveText('photo');
        await expect(
            project.editingField('has_photo')
        ).not.toBeChecked();

        // 't' is a legacy value meaning true. This might change in future
        await expect(project.editingField('has_photo')).toHaveValue('t');
        // Create the promise to wait for GetGroupVisibilities response
        let getGroupVisibilitiesPromise = page.waitForResponse(/lizmap\/edition\/getGroupVisibilities/)
        // Click on the checkbox has_photo
        await project.editingField('has_photo').click();
        // wait for the response completed
        let getGroupVisibilities = await getGroupVisibilitiesPromise;
        await getGroupVisibilities.finished();
        await expect(getGroupVisibilities.status()).toBe(200);
        expect(getGroupVisibilities.headers()['content-type']).toBe('application/json');
        // check body
        let getGroupVisibilitiesBody = await getGroupVisibilities.json();
        expect(getGroupVisibilitiesBody).toHaveProperty('jforms_view_edition-tab1');
        expect(getGroupVisibilitiesBody['jforms_view_edition-tab1']).toBe(true);
        expect(getGroupVisibilitiesBody).toHaveProperty('jforms_view_edition-tab2');
        expect(getGroupVisibilitiesBody['jforms_view_edition-tab2']).toBe(true);

        // check the checkbox is checked
        await expect(project.editingField('has_photo')).toBeChecked();
        // check the tab is now visible
        await expect(
            page.locator('#jforms_view_edition-tabs > li:nth-child(2)')
        ).toBeVisible();

        // Create the promise to wait for GetGroupVisibilities response
        getGroupVisibilitiesPromise = page.waitForResponse(/lizmap\/edition\/getGroupVisibilities/)
        // Click on the checkbox has_photo
        await project.editingField('has_photo').click();
        // wait for the response completed
        getGroupVisibilities = await getGroupVisibilitiesPromise;
        await getGroupVisibilities.finished();
        await expect(getGroupVisibilities.status()).toBe(200);
        expect(getGroupVisibilities.headers()['content-type']).toBe('application/json');
        // check body
        getGroupVisibilitiesBody = await getGroupVisibilities.json();
        expect(getGroupVisibilitiesBody).toHaveProperty('jforms_view_edition-tab1');
        expect(getGroupVisibilitiesBody['jforms_view_edition-tab1']).toBe(true);
        expect(getGroupVisibilitiesBody).toHaveProperty('jforms_view_edition-tab2');
        expect(getGroupVisibilitiesBody['jforms_view_edition-tab2']).toBe(false);

        // check the checkbox is not checked
        await expect(
            project.editingField('has_photo')
        ).not.toBeChecked();
        // check the tab is again not visible
        await expect(
            page.locator('#jforms_view_edition-tabs > li:nth-child(2)')
        ).not.toBeVisible();
    });

    test('should have expression constraint on field @write', async function ({ page }) {
        const project = new ProjectPage(page, 'form_advanced');
        // Type string not valid for expression constraint
        await project.editingField('website').fill('a');
        await project.editingSubmit('submit').click();

        // Assert an error is returned
        await expect(
            page.locator('#jforms_view_edition_website_label')
        ).toHaveClass(/jforms-error/);
        await expect(project.editingField('website')).toHaveClass(
            /jforms-error/
        );
        await expect(page.locator('#jforms_view_edition_errors')).toHaveClass(
            /jforms-error-list/
        );
        await expect(page.locator('#jforms_view_edition_errors p')).toHaveText(
            "Web site URL must start with 'http'"
        );

        // Type string valid for expression constraint
        await project.editingField('website')
            .fill('https://www.3liz.com');
        await project.editingSubmit('submit').click();

        // A message should confirm form had been saved and form selector should be displayed back
        await expect(page.locator('#lizmap-edition-message')).toBeVisible();
        await expect(page.locator('#edition-layer')).toBeVisible();
    });

    test('should change selected quartier and sousquartier based on drawn point @readonly', async function ({
        page,
    }) {
        const project = new ProjectPage(page, 'form_advanced');
        await expect(
            project.editingField('quartier').locator('option')
        ).toHaveCount(2);
        await expect(
            project.editingField('quartier').locator('option').first()
        ).toHaveText('');
        await expect(
            project.editingField('quartier').locator('option').last()
        ).toHaveText('HOPITAUX-FACULTES');

        // Cancel and open form
        page.on('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
        await page.locator('#edition-draw').click();

        // Create the promise to wait for the request to GetData for quartier
        let getDataQuartierPromise = page.waitForRequest(
            request => request.method() === 'POST' && /jelix\/forms\/getdata/.test(request.url()) &&
            request.postData()?.includes('_ref=quartier')
        );
        // Create the promise to wait for the request to GetData for sousquartier
        let getDataSousQuartierPromise = page.waitForRequest(
            request => request.method() === 'POST' && /jelix\/forms\/getdata/.test(request.url()) &&
            request.postData()?.includes('_ref=sousquartier')
        );
        // Assert quartier value is good for another drawn point
        project.clickOnMapLegacy(455, 250);
        // Wait for GetData quartier completed (based on geometry)
        let getDataQuartier = await (await getDataQuartierPromise).response();
        expect(getDataQuartier.status()).toBe(200);
        expect(getDataQuartier.headers()['content-type']).toBe('application/json');
        // check body
        let getDataQuartierBody = await getDataQuartier.json();
        expect(getDataQuartierBody.length).toBe(1);

        // Wait for GetData quartier completed (based on quartier)
        let getDataSousQuartier = await (await getDataSousQuartierPromise).response();
        expect(getDataSousQuartier.status()).toBe(200);
        expect(getDataSousQuartier.headers()['content-type']).toBe('application/json');
        // check body
        let getDataSousQuartierBody = await getDataSousQuartier.json();
        expect(getDataSousQuartierBody.length).toBe(0);

        // Assert 2 options are proposed for quartier list
        await expect(
            project.editingField('quartier').locator('option')
        ).toHaveCount(2);

        // Assert 1 option are proposed for sousquartier list
        await expect(
            project.editingField('sousquartier').locator('option')
        ).toHaveCount(1);

        // Create the promise to wait for the request to GetData for sousquartier
        getDataSousQuartierPromise = page.waitForRequest(
            request => request.method() === 'POST' && /jelix\/forms\/getdata/.test(request.url()) &&
            request.postData()?.includes('_ref=sousquartier')
        );
        // Select MONTPELLIER CENTRE
        await project.editingField('quartier')
            .selectOption({ label: 'MONTPELLIER CENTRE' });
        // Wait for GetData quartier completed (based on quartier)
        getDataSousQuartier = await (await getDataSousQuartierPromise).response();
        expect(getDataSousQuartier.status()).toBe(200);
        expect(getDataSousQuartier.headers()['content-type']).toBe('application/json');
        // check body
        getDataSousQuartierBody = await getDataSousQuartier.json();
        expect(getDataSousQuartierBody.length).toBe(10);

        // Assert 11 options are proposed for sousquartier list
        await expect(
            project.editingField('sousquartier').locator('option')
        ).toHaveCount(11);
    });
});
