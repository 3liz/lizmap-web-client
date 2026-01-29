// @ts-check
import { test, expect } from '@playwright/test';
// import { expect as requestExpect } from './fixtures/expect-request.js'
import { expect as responseExpect } from './fixtures/expect-response.js'
import { ProjectPage } from './pages/project';

test.describe('Lizmap actions @readonly', () => {

    test.beforeEach(async ({ page }) => {
        const project = new ProjectPage(page, 'feature_toolbar');
        await project.open();
    });

    test('should display working project action', async ({ page }) => {
        // Check the button action and the action dock exists
        await expect(page.locator('#button-action')).toHaveCount(1);
        const actionDock = page.locator('#action');
        await expect(actionDock).toHaveCount(1);
        const actionContainer = page.locator('#lizmap-project-actions');
        await expect(actionContainer).toHaveCount(1);
        const actionSelect = actionContainer.locator('select.action-select');
        await expect(actionSelect).toHaveCount(1);

        // The action dock is hidden
        await actionDock.isHidden();
        await actionContainer.isHidden();
        await actionSelect.isHidden();

        // The action message is hidden
        const actionMessage = page.locator('#lizmap-action-message');
        actionMessage.isHidden();

        // Open action dock
        await page.locator('#button-action').click();

        // Check that the action dock is opened
        await actionDock.isVisible();
        await actionContainer.isVisible();
        await actionSelect.isVisible();

        // The action message is still hidden
        actionMessage.isHidden();

        // Check select options
        const action_options = await actionSelect.locator('option').allTextContents();
        expect(action_options).toHaveLength(3);
        expect(action_options).toEqual(expect.arrayContaining([
            '-- Choose an action -- ',
            'Get the buffer of the current map center point',
            'Get the buffer of the point drawn by the user',
        ]));

        // Check select options values, it should be the same length
        const action_values = await actionSelect.locator('option')
            // @ts-ignore HTMLOptionElement has value property but it is not known
            .evaluateAll(list => list.map(opt => opt.value));
        expect(action_values).toHaveLength(3);
        expect(action_values).toEqual(expect.arrayContaining([
            '',
            'project_map_center_buffer',
            'project_map_drawn_point_buffer',
        ]));

        // Check the select default value
        await expect(actionSelect).toHaveValue('');
        // Check the default description
        await expect(actionContainer.locator('div.action-description')).toHaveText(
            'Choose an action to run'
        );

        // Select an action
        await actionSelect.selectOption('project_map_center_buffer');

        // Check the action description
        await expect(actionContainer.locator('div.action-description')).toHaveText(
            'This is an example action which returns a circle at the center of the map'
        );

        // Create the promise to wait for the request to action service
        const actionPromise = page.waitForRequest(/action\/service/);
        // Run the action
        await actionContainer.locator('button.action-run-button').click();
        // Wait for the request to action service
        const actionRequest = await actionPromise;
        /*
        The content-type of the POST request is application/JSON
        We have to implement a new method
        requestExpect(actionRequest).toContainJsonInPostData({
            featureId: null,
            layerId: null,
            mapCenter: /^POINT\(\d\.\d* \d\d\.\d*\)$/,
            mapExtent: /^POLYGON\(\(\d\.\d* \d\.\d*,\d\.\d* \d\.\d*,\d\.\d* \d\.\d*,\d\.\d* \d\.\d*,\d\.\d* \d\.\d*\)\)$/,
            name: 'project_map_center_buffer',
            wkt: null,
        });
        */
        // Wait for the response
        const actionResponse = await actionRequest.response();
        // Check the response
        responseExpect(actionResponse).toBeJson();

        // Check the dsiplay message
        actionMessage.isVisible();
        await expect(actionMessage).toHaveText(
            '×The displayed geometry represents the buffer 2000 m of the current map center'
        );

        // Deactivate
        await actionContainer.locator('button.action-deactivate-button').click();

        // The action message is back to be hidden
        actionMessage.isHidden();
    });

    test('should display working layer action selector', async ({ page }) => {
        const layerName = 'parent_layer';
        // Display info button
        await expect(page.getByTestId(layerName).locator('.icon-info-sign')).toBeHidden();
        await page.getByTestId(layerName).hover();
        await expect(page.getByTestId(layerName).locator('.icon-info-sign')).toBeVisible();

        // Display sub dock metadata
        await expect(page.locator('#sub-dock')).toBeHidden();
        await page.getByTestId(layerName).locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(6);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(4)).toHaveText('Export');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(5)).toHaveText('Actions');

        // Check actions container
        const actionContainer = page.locator('#sub-dock .layer-action-selector-container');
        await expect(actionContainer).toHaveCount(1);
        await expect(actionContainer).toBeVisible();
        await expect(page.locator('#sub-dock lizmap-action-selector')).toHaveCount(1);
        await expect(page.locator('#sub-dock lizmap-action-selector')).toBeVisible();
        const actionSelect = actionContainer.locator('select.action-select');
        await expect(actionSelect).toHaveCount(1);
        await expect(actionSelect).toBeVisible();

        // The action message is hidden
        const actionMessage = page.locator('#lizmap-action-message');
        actionMessage.isHidden();

        // Check select options
        const action_options = await actionSelect.locator('option').allTextContents();
        expect(action_options).toHaveLength(2);
        expect(action_options).toEqual(expect.arrayContaining([
            '-- Choose an action -- ',
            'Get the contour of all the layer features',
        ]));

        // Check select options values, it should be the same length
        const action_values = await actionSelect.locator('option')
            // @ts-ignore HTMLOptionElement has value property but it is not known
            .evaluateAll(list => list.map(opt => opt.value));
        expect(action_values).toHaveLength(2);
        expect(action_values).toEqual(expect.arrayContaining([
            '',
            'layer_spatial_extent',
        ]));

        // Check the select default value
        await expect(actionSelect).toHaveValue('');
        // Check the default description
        await expect(actionContainer.locator('div.action-description')).toHaveText(
            'Choose an action to run'
        );

        // Select an action
        await actionSelect.selectOption('layer_spatial_extent');

        // Check the action description
        await expect(actionContainer.locator('div.action-description')).toHaveText(
            'This action will draw a polygon which represents the contour of all the features'
        );

        // Create the promise to wait for the request to action service
        const actionPromise = page.waitForRequest(/action\/service/);
        // Run the action
        await actionContainer.locator('button.action-run-button').click();
        // Wait for the request to action service
        const actionRequest = await actionPromise;

        // Wait for the response
        const actionResponse = await actionRequest.response();
        // Check the response
        responseExpect(actionResponse).toBeJson();

        // Check the dsiplay message
        actionMessage.isVisible();
        await expect(actionMessage).toHaveText(
            '×The displayed geometry represents the contour of all the layer features'
        );

        // Deactivate
        await actionContainer.locator('button.action-deactivate-button').click();

        // The action message is back to be hidden
        actionMessage.isHidden();
    });
});
