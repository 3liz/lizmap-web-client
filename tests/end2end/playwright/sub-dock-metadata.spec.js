// @ts-check
import { test, expect } from '@playwright/test';
import { expectParametersToContain } from './globals';
import { ProjectPage } from "./pages/project";

test.describe('Sub dock', () => {

    test('Metadata layer in attribute table project', async ({ page }) => {
        const project = new ProjectPage(page, 'attribute_table');
        await project.open();

        // Display info button
        await expect(page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign')).toBeHidden();
        await page.getByTestId('Les quartiers à Montpellier').hover();
        await expect(page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign')).toBeVisible();

        // Display sub dock metadata
        await expect(page.locator('#sub-dock')).toBeHidden();
        await page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(5);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(4)).toHaveText('Export');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd')).toHaveCount(5);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(0)).toHaveText('Les quartiers à Montpellier');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(1)).toHaveText('Layer');

        //close sub dock
        await expect(page.locator('#hide-sub-dock')).toBeVisible();
        await page.locator('#hide-sub-dock').click();
        await expect(page.locator('#sub-dock')).toBeHidden();

        // Display sub dock metadata for group
        await page.getByTestId('relation').locator('> div.group > div.node').hover();
        await expect(page.getByTestId('relation').locator('> div.group > div.node .icon-info-sign')).toBeVisible();
        await page.getByTestId('relation').locator('> div.group > div.node .icon-info-sign').click();
        await expect(page.locator('#hide-sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(0)).toHaveText('relation');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd').nth(1)).toHaveText('Group');

        //close sub dock
        await expect(page.locator('#hide-sub-dock')).toBeVisible();
        await page.locator('#hide-sub-dock').click();
        await expect(page.locator('#sub-dock')).toBeHidden();
    });

    test('Metadata one on two layers in WFS with attribute table config', async ({ page }) => {
        const project = new ProjectPage(page, 'permalink');
        await project.open();

        // Display sub dock metadata for layer in WFS with multiple styles
        await page.getByTestId('sousquartiers').hover();
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(6);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Change layer style');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(4)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(5)).toHaveText('Export');

        // Display sub dock metadata for layer not in WFS and no multiple styles
        await page.getByTestId('Les quartiers à Montpellier').hover();
        await page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
    });

    test('Export layer with attribute table config', async ({ page }) => {
        const project = new ProjectPage(page, 'permalink');
        await project.open();

        // Display sub dock metadata
        await page.getByTestId('sousquartiers').hover();
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Export
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(5)).toHaveText('Export');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd select.exportLayer')).toHaveCount(1);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd button.exportLayer')).toHaveCount(1);
        await page.locator('#sub-dock .sub-metadata .menu-content dd select.exportLayer').selectOption('GeoJSON');
        const getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await page.locator('#sub-dock .sub-metadata .menu-content dd button.exportLayer').click();
        const getFeatureRequest = await getFeatureRequestPromise;
        const expectedParameters = {
            'SERVICE': 'WFS',
            'REQUEST': 'GetFeature',
            'VERSION': '1.0.0',
            'OUTPUTFORMAT': 'GeoJSON',
            'TYPENAME': 'sousquartiers',
        };
        await expectParametersToContain('Export GeoJSON from sub-dock', getFeatureRequest.postData() ?? '', expectedParameters);
        const response = await getFeatureRequest.response();

        // check response
        expect(response?.ok()).toBeTruthy();
        expect(response?.status()).toBe(200);
        // check content-type header
        expect(response?.headers()['content-type']).toContain('application/vnd.geo+json');
    });

    test('Metadata one on two layers in WFS without attribute table config', async ({ page }) => {
        // Remove attribute table config
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.attributeLayers = {};
            await route.fulfill({ response, json });
        });

        const project = new ProjectPage(page, 'permalink');
        await project.open();

        // Display sub dock metadata for layer in WFS with multiple styles
        await page.getByTestId('sousquartiers').hover();
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(6);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Change layer style');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(4)).toHaveText('Opacity');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(5)).toHaveText('Export');

        // Display sub dock metadata for layer not in WFS and no multiple styles
        await page.getByTestId('Les quartiers à Montpellier').hover();
        await page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
    });

    test('Export layer without attribute table config', async ({ page }) => {
        // Remove attribute table config
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.attributeLayers = {};
            await route.fulfill({ response, json });
        });

        const project = new ProjectPage(page, 'permalink');
        await project.open();

        // Display sub dock metadata
        await page.getByTestId('sousquartiers').hover();
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Export
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(5)).toHaveText('Export');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd select.exportLayer')).toHaveCount(1);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dd button.exportLayer')).toHaveCount(1);
        await page.locator('#sub-dock .sub-metadata .menu-content dd select.exportLayer').selectOption('GeoJSON');
        const getFeatureRequestPromise = project.waitForGetFeatureRequest();
        await page.locator('#sub-dock .sub-metadata .menu-content dd button.exportLayer').click();
        const getFeatureRequest = await getFeatureRequestPromise;
        const expectedParameters = {
            'SERVICE': 'WFS',
            'REQUEST': 'GetFeature',
            'VERSION': '1.0.0',
            'OUTPUTFORMAT': 'GeoJSON',
            'TYPENAME': 'sousquartiers',
        };
        await expectParametersToContain('Export GeoJSON from sub-dock', getFeatureRequest.postData() ?? '', expectedParameters);
        const response = await getFeatureRequest.response();

        // check response
        expect(response?.ok()).toBeTruthy();
        expect(response?.status()).toBe(200);
        // check content-type header
        expect(response?.headers()['content-type']).toContain('application/vnd.geo+json');
    });

    test('Metadata one on two layers in WFS with export disable in attribute table config', async ({ page }) => {
        // Remove attribute table config
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.attributeLayers.sousquartiers.export_enabled = 'False';
            await route.fulfill({ response, json });
        });

        const project = new ProjectPage(page, 'permalink');
        await project.open();

        // Display sub dock metadata for layer in WFS with multiple styles
        await page.getByTestId('sousquartiers').hover();
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(5);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Change layer style');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(4)).toHaveText('Opacity');

        // Display sub dock metadata for layer not in WFS and no multiple styles
        await page.getByTestId('Les quartiers à Montpellier').hover();
        await page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign').click();
        await expect(page.locator('#sub-dock')).toBeVisible();

        // Check sub dock metadata content
        await expect(page.locator('#sub-dock .sub-metadata h3 .text')).toHaveText('Information');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt')).toHaveCount(4);
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(0)).toHaveText('Name');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(1)).toHaveText('Type');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(2)).toHaveText('Zoom to the layer extent');
        await expect(page.locator('#sub-dock .sub-metadata .menu-content dt').nth(3)).toHaveText('Opacity');
    });
});
