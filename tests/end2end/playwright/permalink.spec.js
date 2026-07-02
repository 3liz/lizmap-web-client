// @ts-check
import { test, expect } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js';
import { expect as responseExpect } from './fixtures/expect-response.js'
import {gotoMap, reloadMap} from './globals';
import { ProjectPage } from './pages/project';

test.describe('Permalink', () => {

    test.beforeEach(async ({ page }) => {
        // force automatic permalink
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['automatic_permalink'] = true;
            if ('Group as layer' in json.layers) {
                json.layers['Group as layer'].toggled = false;
            }
            await route.fulfill({ response, json });
        });
    });

    test.afterEach(async ({ page }) => {
        // Remove catching GetProjectConfig
        await page.unroute('**/service/getProjectConfig*');
    });

    test('Hash changes when map center is changed', async ({ page }) => {
        await gotoMap('/index.php/view/map?repository=testsrepository&project=layer_legends', page);
        await page.evaluate(() => lizMap.mainLizmap.map.getView().setCenter([770485, 6277813]));

        await page.waitForTimeout(200);

        const checked_url = new URL(page.url());
        await expect(checked_url.hash).toMatch(/#3.5148\d+,43.4213\d+,4.2324\d+,43.7692\d+|/)
        await expect(checked_url.hash).toContain('layer_legend_single_symbol,layer_legend_categorized,layer_legend_ruled,tramway_lines,legend_option_test|d%C3%A9faut,d%C3%A9faut,d%C3%A9faut,a_single,|1,1,1,1,1');

        // Check Permalink tool
        await page.locator('#button-permaLink').click();
        const share_value = await page.locator('#input-share-permalink').inputValue();
        const share_url = new URL(share_value);
        await expect(share_url.pathname).toBe('/index.php/view/map')
        await expect(share_url.search).toBe('?repository=testsrepository&project=layer_legends')
        await expect(share_url.hash).toMatch(/#3.5148\d+,43.4213\d+,4.2324\d+,43.7692\d+|/)
        await expect(share_url.hash).toContain('|layer_legend_single_symbol,layer_legend_categorized,layer_legend_ruled,tramway_lines,legend_option_test|d%C3%A9faut,d%C3%A9faut,d%C3%A9faut,a_single,|1,1,1,1,1')
    });

    test('UI according to permalink parameters', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=permalink'
        const bbox = '3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254'
        const layers = 'sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier'
        const styles = 'red,d%C3%A9faut'
        const opacities = '0.6,0.8'
        const url = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        await gotoMap(url, page);

        // Visibility
        await expect(page.getByTestId('sousquartiers').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('Les quartiers à Montpellier').locator('> div input')).toBeChecked();

        // Style and opacity
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('red');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');

        await page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('80');
        await page.getByRole('button', { name: 'Close' }).click();

        // The url does not change
        const checked_url = new URL(page.url());
        await expect(checked_url.hash).not.toHaveLength(0);
        // The decoded hash is
        // #3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254
        // |sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier
        // |red,d%C3%A9faut
        // |0.6,0.8
        await expect(checked_url.hash).toMatch(/#3.798064\d+,43.597569\d+,3.904383\d+,43.672963\d+\|/)
        await expect(checked_url.hash).toContain('|sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier|red,d%C3%A9faut|0.6,0.8')

        // Check Permalink tool
        await page.locator('#button-permaLink').click();
        const share_value = await page.locator('#input-share-permalink').inputValue();
        const share_url = new URL(share_value);
        await expect(share_url.pathname).toBe('/index.php/view/map')
        await expect(share_url.search).toBe('?repository=testsrepository&project=permalink')
        await expect(share_url.hash).toMatch(/#3.798064\d+,43.597569\d+,3.904383\d+,43.672963\d+\|/)
        await expect(share_url.hash).toContain('|sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier|red,d%C3%A9faut|0.6,0.8')
    });

    test('Group as layer : UI according to permalink parameters', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=layer_legends'
        const bbox = '3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636'
        const layers = 'layer_legend_single_symbol,tramway_lines,Group as layer'
        const styles = 'défaut,categorized,'
        const opacities = '1,1,1,1'
        const url = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        await gotoMap(url, page);

        // Visibility
        await expect(page.getByTestId('layer_legend_single_symbol').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('layer_legend_categorized').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('tramway_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('legend_option_test').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('expand_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('disabled').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('hide_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('Group as layer').locator('> div input')).toBeChecked();

        // Style
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('categorized');

        // Close subdock
        await page.getByRole('button', { name: 'Close' }).click();
    });

    test('Empty string for style : UI according to permalink parameters', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=layer_legends'
        const bbox = '3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636'
        const layers = 'layer_legend_single_symbol,tramway_lines,Group as layer'
        const styles = ',,'
        const opacities = '1,1,1'
        const url = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        await gotoMap(url, page);

        // Visibility
        await expect(page.getByTestId('layer_legend_single_symbol').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('layer_legend_categorized').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('tramway_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('legend_option_test').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('expand_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('disabled').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('hide_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('Group as layer').locator('> div input')).toBeChecked();

        // Style
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('a_single');

        // Close subdock
        await page.getByRole('button', { name: 'Close' }).click();
    });

    test('Groups and layers checked: UI according to permalink parameters', async ({ page }) => {
        const baseUrl = 'http://localhost:8130/index.php/view/map?repository=testsrepository&project=treeview'
        const bbox = '3.765504,43.559321,3.982897,43.660755'
        const layers = 'group1,subdistricts,group%20with%20space%20in%20name%20and%20shortname%20defined,quartiers,group%20as%20layer%202'
        const styles = ',default,,default,'
        const opacities = '1,1,1,1,1'
        const url = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        await gotoMap(url, page);

        // Visibility
        await expect(page.getByTestId('subdistricts').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('sub-group1').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('group1').locator('> div input')).toBeChecked();

        await expect(page.getByTestId('group as layer 1').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('group as layer 2').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('mutually exclusive group with multiple groups as layer').locator('> div input')).not.toBeChecked();
    });

    test('Build permalink, reload and apply one', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=layer_legends'
        await gotoMap(baseUrl, page);

        // Initial url has no hash
        let url = new URL(page.url());
        await expect(url.hash).toHaveLength(0);

        // Default Visibility
        await expect(page.getByTestId('layer_legend_single_symbol').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('layer_legend_categorized').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('tramway_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('legend_option_test').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('expand_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('disabled').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('hide_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('Group as layer').locator('> div input')).not.toBeChecked();

        // Style
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('a_single');

        // Close subdock
        await page.getByRole('button', { name: 'Close' }).click();

        // Set Group as layer visibility
        await page.getByLabel('Group as layer').check();
        // The url has been updated with an hash
        url = new URL(page.url());
        await expect(url.hash).not.toHaveLength(0);
        // The decoded hash is
        // #3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636
        // |layer_legend_single_symbol,layer_legend_categorized,layer_legend_ruled,tramway_lines,Group as layer
        // |défaut,défaut,défaut,a_single,
        // |1,1,1,1,1
        await expect(url.hash[0]).toBe('#');
        let hashContent = url.hash.split('|')
        await expect(hashContent).toHaveLength(4)
        let hashLayers = hashContent[1].split(',')
        await expect(hashLayers).toHaveLength(6)
        let hashStyles = hashContent[2].split(',')
        await expect(hashStyles).toHaveLength(6)
        let hashOpacities = hashContent[3].split(',')
        await expect(hashOpacities).toHaveLength(6)

        // layer_legend_single_symbol has défaut style
        await expect(hashLayers[0]).toBe(encodeURI('layer_legend_single_symbol'))
        await expect(hashStyles[0]).toBe(encodeURI('défaut'))
        await expect(hashOpacities[0]).toBe('1')

        // layer_legend_single_symbol has défaut style
        await expect(hashLayers[1]).toBe(encodeURI('layer_legend_categorized'))
        await expect(hashStyles[1]).toBe(encodeURI('défaut'))
        await expect(hashOpacities[1]).toBe('1')

        // layer_legend_ruled has défaut style
        await expect(hashLayers[2]).toBe(encodeURI('layer_legend_ruled'))
        await expect(hashStyles[2]).toBe(encodeURI('défaut'))
        await expect(hashOpacities[2]).toBe('1')

        // tramway_lines has a_single style
        await expect(hashLayers[3]).toBe(encodeURI('tramway_lines'))
        await expect(hashStyles[3]).toBe(encodeURI('a_single'))
        await expect(hashOpacities[3]).toBe('1')

        // legend_option_test is a group, it has no style
        await expect(hashLayers[4]).toBe(encodeURI('legend_option_test'))
        await expect(hashStyles[4]).toBe(encodeURI(''))
        await expect(hashOpacities[4]).toBe('1')

        // Group as layer has an empty string style ''
        await expect(hashLayers[5]).toBe(encodeURI('Group as layer'))
        await expect(hashStyles[5]).toBe('')
        await expect(hashOpacities[5]).toBe('1')

        // Change the tramway_lines style to categorized
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({ force: true });
        await page.locator('#sub-dock').getByRole('combobox').selectOption('categorized');
        await page.getByRole('button', { name: 'Close' }).click();

        // The url has been updated
        url = new URL(page.url());
        await expect(url.hash).not.toHaveLength(0);
        // The decoded hash is
        // #3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636
        // |layer_legend_single_symbol,layer_legend_categorized,layer_legend_ruled,tramway_lines,Group as layer
        // |défaut,défaut,défaut,categorized,
        // |1,1,1,1
        await expect(url.hash[0]).toBe('#');
        hashContent = url.hash.split('|')
        await expect(hashContent).toHaveLength(4)
        hashLayers = hashContent[1].split(',')
        await expect(hashLayers).toHaveLength(6)
        hashStyles = hashContent[2].split(',')
        await expect(hashStyles).toHaveLength(6)
        hashOpacities = hashContent[3].split(',')
        await expect(hashOpacities).toHaveLength(6)

        // layer_legend_single_symbol has défaut style
        await expect(hashLayers[0]).toBe(encodeURI('layer_legend_single_symbol'))
        await expect(hashStyles[0]).toBe(encodeURI('défaut'))
        await expect(hashOpacities[0]).toBe('1')

        // layer_legend_single_symbol has défaut style
        await expect(hashLayers[1]).toBe(encodeURI('layer_legend_categorized'))
        await expect(hashStyles[1]).toBe(encodeURI('défaut'))
        await expect(hashOpacities[1]).toBe('1')

        // layer_legend_ruled has défaut style
        await expect(hashLayers[2]).toBe(encodeURI('layer_legend_ruled'))
        await expect(hashStyles[2]).toBe(encodeURI('défaut'))
        await expect(hashOpacities[2]).toBe('1')

        // tramway_lines has categorized style
        await expect(hashLayers[3]).toBe(encodeURI('tramway_lines'))
        await expect(hashStyles[3]).toBe(encodeURI('categorized'))
        await expect(hashOpacities[3]).toBe('1')

        // legend_option_test is a group, it has no style
        await expect(hashLayers[4]).toBe(encodeURI('legend_option_test'))
        await expect(hashStyles[4]).toBe(encodeURI(''))
        await expect(hashOpacities[4]).toBe('1')

        // Group as layer has an empty string style ''
        await expect(hashLayers[5]).toBe(encodeURI('Group as layer'))
        await expect(hashStyles[5]).toBe('')
        await expect(hashOpacities[5]).toBe('1')

        // Deactivate layer_legend_categorized and layer_legend_ruled
        await page.getByLabel('layer_legend_categorized').uncheck();
        await page.getByLabel('layer_legend_ruled').uncheck();

        // The url has been updated
        url = new URL(page.url());
        await expect(url.hash).not.toHaveLength(0);
        // The decoded hash is
        // #3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636
        // |layer_legend_single_symbol,tramway_lines,Group as layer
        // |défaut,categorized,
        // |1,1,1
        await expect(url.hash[0]).toBe('#');
        hashContent = url.hash.split('|')
        await expect(hashContent).toHaveLength(4)
        hashLayers = hashContent[1].split(',')
        await expect(hashLayers).toHaveLength(4)
        hashStyles = hashContent[2].split(',')
        await expect(hashStyles).toHaveLength(4)
        hashOpacities = hashContent[3].split(',')
        await expect(hashOpacities).toHaveLength(4)

        // layer_legend_single_symbol has défaut style
        await expect(hashLayers[0]).toBe(encodeURI('layer_legend_single_symbol'))
        await expect(hashStyles[0]).toBe(encodeURI('défaut'))
        await expect(hashOpacities[0]).toBe('1')

        // tramway_lines has a_single style
        await expect(hashLayers[1]).toBe(encodeURI('tramway_lines'))
        await expect(hashStyles[1]).toBe(encodeURI('categorized'))
        await expect(hashOpacities[1]).toBe('1')

        // legend_option_test is a group, it has no style
        await expect(hashLayers[2]).toBe(encodeURI('legend_option_test'))
        await expect(hashStyles[2]).toBe(encodeURI(''))
        await expect(hashOpacities[2]).toBe('1')

        // Group as layer has an empty string style ''
        await expect(hashLayers[3]).toBe(encodeURI('Group as layer'))
        await expect(hashStyles[3]).toBe('')
        await expect(hashOpacities[3]).toBe('1')

        // Change the layer_legend_single_symbol opacity
        await page.getByTestId('layer_legend_single_symbol').locator('.icon-info-sign').click({ force: true });
        await page.locator('#sub-dock .btn-opacity-layer', { hasText: '60' }).click();
        await page.getByRole('button', { name: 'Close' }).click();

        // The url has been updated
        url = new URL(page.url());
        await expect(url.hash).not.toHaveLength(0);
        // The decoded hash is
        // #3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636
        // |layer_legend_single_symbol,tramway_lines,Group as layer
        // |défaut,categorized,
        // |0.6,1,1
        await expect(url.hash[0]).toBe('#');
        hashContent = url.hash.split('|')
        await expect(hashContent).toHaveLength(4)
        hashLayers = hashContent[1].split(',')
        await expect(hashLayers).toHaveLength(4)
        hashStyles = hashContent[2].split(',')
        await expect(hashStyles).toHaveLength(4)
        hashOpacities = hashContent[3].split(',')
        await expect(hashOpacities).toHaveLength(4)

        // layer_legend_single_symbol has défaut style
        await expect(hashLayers[0]).toBe(encodeURI('layer_legend_single_symbol'))
        await expect(hashStyles[0]).toBe(encodeURI('défaut'))
        await expect(hashOpacities[0]).toBe('0.6')

        // tramway_lines has a_single style
        await expect(hashLayers[1]).toBe(encodeURI('tramway_lines'))
        await expect(hashStyles[1]).toBe(encodeURI('categorized'))
        await expect(hashOpacities[1]).toBe('1')

        // legend_option_test is a group, it has no style
        await expect(hashLayers[2]).toBe(encodeURI('legend_option_test'))
        await expect(hashStyles[2]).toBe(encodeURI(''))
        await expect(hashOpacities[2]).toBe('1')

        // Group as layer has an empty string style ''
        await expect(hashLayers[3]).toBe(encodeURI('Group as layer'))
        await expect(hashStyles[3]).toBe('')
        await expect(hashOpacities[3]).toBe('1')

        // Reload
        await reloadMap(page);

        // Visibility
        await expect(page.getByTestId('layer_legend_single_symbol').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('layer_legend_categorized').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('tramway_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('legend_option_test').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('expand_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('disabled').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('hide_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('Group as layer').locator('> div input')).toBeChecked();

        // Style
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('categorized');

        // Opacity
        await page.getByTestId('layer_legend_single_symbol').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');

        // Close subdock
        await page.getByRole('button', { name: 'Close' }).click();

        // The check hash url before changing it
        const old_url = new URL(page.url());
        await expect(old_url.hash).not.toHaveLength(0);
        // The decoded hash is
        // #3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636
        // |layer_legend_single_symbol,tramway_lines,Group%20as%20layer
        // |d%C3%A9faut,categorized,
        // |1,1,1,1
        await expect(old_url.hash).toContain('|layer_legend_single_symbol,tramway_lines,legend_option_test,Group%20as%20layer|')
        await expect(old_url.hash).toContain('|d%C3%A9faut,categorized,,|')
        await expect(old_url.hash).toContain('|0.6,1,1')

        // Test permalink with empty string styles
        const bbox = '3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636'
        const layers = 'layer_legend_single_symbol,layer_legend_categorized,tramway_lines,Group as layer'
        const styles = ',,,'
        const opacities = '1,1,1,1'
        const newUrl = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        // Goto does not reload, just set the URL without hash update event
        await page.goto(newUrl, { waitUntil: 'networkidle' });
        // Reload to force applying hash with empty string styles
        await reloadMap(page);

        // Visibility
        await expect(page.getByTestId('layer_legend_single_symbol').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('layer_legend_categorized').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('tramway_lines').locator('> div input')).toBeChecked();
        // legend_option_test is checked by default and must be unchecked by the
        // permalink restore, which runs asynchronously after the reload. Wait
        // longer than the default 5s: this assertion gates the whole block (the
        // restore sets every item's state in one pass), so once it passes the
        // remaining visibility assertions are stable.
        await expect(page.getByTestId('legend_option_test').locator('> div input')).not.toBeChecked({ timeout: 15000 });
        await expect(page.getByTestId('expand_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('disabled').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('hide_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('Group as layer').locator('> div input')).toBeChecked();

        // Style
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('a_single');

        // Opacity
        await page.getByTestId('layer_legend_single_symbol').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('100');

        // Close subdock
        await page.getByRole('button', { name: 'Close' }).click();

        // The url has changed
        const checked_url = new URL(page.url());
        await expect(checked_url.hash).not.toHaveLength(0);
        // The decoded hash is
        // #3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636
        // |layer_legend_single_symbol,layer_legend_categorized,tramway_lines,Group%20as%20layer
        // |d%C3%A9faut,d%C3%A9faut,a_single,
        // |1,1,1,1
        await expect(checked_url.hash).toContain('|layer_legend_single_symbol,layer_legend_categorized,tramway_lines,Group%20as%20layer|')
        // Test below is temporary disabled, as it seems flaky
        // await expect(checked_url.hash).toContain('|d%C3%A9faut,d%C3%A9faut,a_single,|')
        await expect(checked_url.hash).toContain('|1,1,1,1')
    });

    test('Build permalink and change hash', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=layer_legends'
        await gotoMap(baseUrl, page);

        // Initial url has no hash
        let url = new URL(page.url());
        await expect(url.hash).toHaveLength(0);

        // Visibility
        await expect(page.getByTestId('layer_legend_single_symbol').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('layer_legend_categorized').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('tramway_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('legend_option_test').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('expand_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('disabled').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('hide_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('Group as layer').locator('> div input')).not.toBeChecked();

        // Style
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('a_single');

        // Opacity
        await page.getByTestId('layer_legend_single_symbol').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('100');

        // Close subdock
        await page.getByRole('button', { name: 'Close' }).click();

        // The decoded hash is
        const bbox = '3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636'
        const layers = 'layer_legend_single_symbol,tramway_lines,Group as layer'
        const styles = 'défaut,categorized,'
        const opacities = '0.6,1,1'
        const newHash = bbox + '|' + layers + '|' + styles + '|' + opacities;

        await page.evaluate(token => window.location.hash = token, newHash);

        // No error
        await expect(page.locator('p.error-msg')).toHaveCount(0);
        await expect(page.locator('#switcher lizmap-treeview ul li')).not.toHaveCount(0);

        // Visibility
        await expect(page.getByTestId('layer_legend_single_symbol').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('layer_legend_categorized').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('tramway_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('legend_option_test').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('expand_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('disabled').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('hide_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('Group as layer').locator('> div input')).toBeChecked();

        // Style
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('categorized');

        // Opacity
        await page.getByTestId('layer_legend_single_symbol').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');

        // Close subdock
        await page.getByRole('button', { name: 'Close' }).click();
    });

    test('Permalink parameters error: too many styles -> No errors', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=permalink'
        const bbox = '3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254'
        const layers = 'sousquartiers'
        const styles = 'red,d%C3%A9faut'
        const opacities = '0.6'
        const url = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        await gotoMap(url, page);

        // Visibility
        await expect(page.getByTestId('sousquartiers').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('Les quartiers à Montpellier').locator('> div input')).not.toBeChecked();

        // Style and opacity
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('red');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');
    });

    test('Permalink parameters error: too many opacities -> No errors', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=permalink'
        const bbox = '3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254'
        const layers = 'sousquartiers'
        const styles = 'red'
        const opacities = '0.6,0.8'
        const url = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        await gotoMap(url, page);

        // Visibility
        await expect(page.getByTestId('sousquartiers').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('Les quartiers à Montpellier').locator('> div input')).not.toBeChecked();

        // Style and opacity
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('red');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');
    });

    test('Permalink parameters error: not enough styles -> No errors', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=permalink'
        const bbox = '3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254'
        const layers = 'sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier'
        const styles = 'red'
        const opacities = '0.6,0.8'
        const url = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        await gotoMap(url, page);
    });

    test('Permalink parameters error: not enough opacities -> No errors', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=permalink'
        const bbox = '3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254'
        const layers = 'sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier'
        const styles = 'red,d%C3%A9faut'
        const opacities = '0.6'
        const url = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        await gotoMap(url, page);
    });

});

test.describe('Automatic permalink disabled', () => {

    test.beforeEach(async ({ page }) => {
        // disable automatic permalink
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['automatic_permalink'] = false;
            if ('Group as layer' in json.layers) {
                json.layers['Group as layer'].toggled = false;
            }
            await route.fulfill({ response, json });
        });
    });

    test.afterEach(async ({ page }) => {
        // Remove catching GetProjectConfig
        await page.unroute('**/service/getProjectConfig*');
    });

    test('Hash does not change when map center is changed', async ({ page }) => {
        await gotoMap('/index.php/view/map?repository=testsrepository&project=layer_legends', page);
        await page.evaluate(() => lizMap.mainLizmap.map.getView().setCenter([770485, 6277813]));

        await page.waitForTimeout(200);

        const checked_url = new URL(page.url());
        await expect(checked_url.hash).toHaveLength(0);

        // Check Permalink tool
        await page.locator('#button-permaLink').click();
        const share_value = await page.locator('#input-share-permalink').inputValue();
        const share_url = new URL(share_value);
        await expect(share_url.pathname).toBe('/index.php/view/map')
        await expect(share_url.search).toBe('?repository=testsrepository&project=layer_legends')
        await expect(share_url.hash).toMatch(/#3.5148\d+,43.4213\d+,4.2324\d+,43.7692\d+|/)
        await expect(share_url.hash).toContain('|layer_legend_single_symbol,layer_legend_categorized,layer_legend_ruled,tramway_lines,legend_option_test|d%C3%A9faut,d%C3%A9faut,d%C3%A9faut,a_single,|1,1,1,1,1')
    });

    test('UI according to permalink parameters', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=permalink'
        const bbox = '3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254'
        const layers = 'sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier'
        const styles = 'red,d%C3%A9faut'
        const opacities = '0.6,0.8'
        const url = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        await gotoMap(url, page);

        // Visibility
        await expect(page.getByTestId('sousquartiers').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('Les quartiers à Montpellier').locator('> div input')).toBeChecked();

        // Style and opacity
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('red');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');

        await page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('80');
        await page.getByRole('button', { name: 'Close' }).click();

        // The url does not change
        const checked_url = new URL(page.url());
        await expect(checked_url.hash).not.toHaveLength(0);
        // The decoded hash is
        // #3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254
        // |sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier
        // |red,d%C3%A9faut
        // |0.6,0.8
        await expect(checked_url.hash).toMatch(/#3.798064\d+,43.597569\d+,3.904383\d+,43.672963\d+\|/)
        await expect(checked_url.hash).toContain('|sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier|red,d%C3%A9faut|0.6,0.8')

        // Check Permalink tool
        await page.locator('#button-permaLink').click();
        const share_value = await page.locator('#input-share-permalink').inputValue();
        const share_url = new URL(share_value);
        await expect(share_url.pathname).toBe('/index.php/view/map')
        await expect(share_url.search).toBe('?repository=testsrepository&project=permalink')
        await expect(share_url.hash).toMatch(/#3.798064\d+,43.597569\d+,3.904383\d+,43.672963\d+\|/)
        await expect(share_url.hash).toContain('|sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier|red,d%C3%A9faut|0.6,0.8')
    });

    test('Hash does not change when changing layers', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=layer_legends'
        await gotoMap(baseUrl, page);

        // Initial url has no hash
        let url = new URL(page.url());
        await expect(url.hash).toHaveLength(0);

        // Set Group as layer visibility
        await expect(page.getByTestId('Group as layer').locator('> div input')).not.toBeChecked();
        await page.getByLabel('Group as layer').check();
        // The url has not been updated with an hash
        url = new URL(page.url());
        await expect(url.hash).toHaveLength(0);

        // Change the tramway_lines style to categorized
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('a_single');
        await page.locator('#sub-dock').getByRole('combobox').selectOption('categorized');
        await page.getByRole('button', { name: 'Close' }).click();

        // The url has been updated
        url = new URL(page.url());
        await expect(url.hash).toHaveLength(0);

        // Change the layer_legend_single_symbol opacity
        await page.getByTestId('layer_legend_single_symbol').locator('.icon-info-sign').click({ force: true });
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('100');
        await page.locator('#sub-dock .btn-opacity-layer', { hasText: '60' }).click();
        await page.getByRole('button', { name: 'Close' }).click();

        // The url has been updated
        url = new URL(page.url());
        await expect(url.hash).toHaveLength(0);

        // Check Permalink tool
        await page.locator('#button-permaLink').click();
        const share_value = await page.locator('#input-share-permalink').inputValue();
        const share_url = new URL(share_value);
        await expect(share_url.pathname).toBe('/index.php/view/map')
        await expect(share_url.search).toBe('?repository=testsrepository&project=layer_legends')
        await expect(share_url.hash).toMatch(/#3.45433\d+,43.48926\d+,4.17242\d+,43.8367\d+\|/)
        await expect(share_url.hash).toContain('|layer_legend_single_symbol,layer_legend_categorized,layer_legend_ruled,tramway_lines,legend_option_test,Group%20as%20layer|d%C3%A9faut,d%C3%A9faut,d%C3%A9faut,categorized,,|0.6,1,1,1,1,1')
    });

});

test.describe('BBox parameter', () => {

    test('BBox only', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=permalink'
        const bbox = '3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254'
        const url = baseUrl + '&bbox=' + bbox
        await gotoMap(url, page);

        // The url does not change
        const checked_url = new URL(page.url());
        // No hash
        await expect(checked_url.hash).toHaveLength(0);

        // Check Permalink tool
        await page.locator('#button-permaLink').click();
        const share_value = await page.locator('#input-share-permalink').inputValue();
        const share_url = new URL(share_value);
        await expect(share_url.pathname).toBe('/index.php/view/map')
        await expect(share_url.search).toMatch(/\?repository=testsrepository&project=permalink&bbox=/)
        await expect(share_url.search).toMatch(/bbox=3.798064\d+%2C43.597569\d+%2C3.904383\d+%2C43.672963\d+/)

        // Check GetMap
        const getMapPromise = page.waitForRequest(/GetMap/);
        await page.getByLabel('sousquartiers').check();
        const getMapRequest = await getMapPromise;
        const expectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /image\/png/, // "image/png; mode=8bit"
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'sousquartiers',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /762375.04\d+,6277986.97\d+,775048.61\d+,6286361.05\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(expectedParameters);

        // Check Permalink tool
        const new_share_value = await page.locator('#input-share-permalink').inputValue();
        const new_share_url = new URL(new_share_value);
        await expect(new_share_url.pathname).toBe('/index.php/view/map')
        await expect(new_share_url.search).toBe('?repository=testsrepository&project=permalink')
        await expect(new_share_url.hash).toMatch(/#3.77950\d+,43.60047\d+,3.92309\d+,43.67003\d+\|/)
        await expect(new_share_url.hash).toContain('|sousquartiers|d%C3%A9faut|1')
    });

    test('BBox and CRS', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=permalink'
        const bbox = '762375.0458996765,6277986.972249089,775048.6129134771,6286361.051497247'
        const crs = 'EPSG:2154'
        const url = baseUrl + '&bbox=' + bbox + '&crs=' + crs;
        await gotoMap(url, page);

        // The url does not change
        const checked_url = new URL(page.url());
        // No hash
        await expect(checked_url.hash).toHaveLength(0);

        // Check Permalink tool
        await page.locator('#button-permaLink').click();
        const share_value = await page.locator('#input-share-permalink').inputValue();
        const share_url = new URL(share_value);
        await expect(share_url.pathname).toBe('/index.php/view/map')
        await expect(share_url.search).toMatch(/\?repository=testsrepository&project=permalink&bbox=/)
        await expect(share_url.search).toMatch(/bbox=762375.04\d+%2C6277986.97\d+%2C775048.61\d+%2C6286361.05\d+/)
        await expect(share_url.search).toMatch(/&crs=EPSG%3A2154/)

        // Check GetMap
        const getMapPromise = page.waitForRequest(/GetMap/);
        await page.getByLabel('sousquartiers').check();
        const getMapRequest = await getMapPromise;
        const expectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /image\/png/, // "image/png; mode=8bit"
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'sousquartiers',
            'CRS': 'EPSG:2154',
            'STYLES': 'défaut',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /762375.04\d+,6277986.97\d+,775048.61\d+,6286361.05\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(expectedParameters);

        // Check Permalink tool
        const new_share_value = await page.locator('#input-share-permalink').inputValue();
        const new_share_url = new URL(new_share_value);
        await expect(new_share_url.pathname).toBe('/index.php/view/map')
        await expect(new_share_url.search).toBe('?repository=testsrepository&project=permalink')
        await expect(new_share_url.hash).toMatch(/#3.77950\d+,43.60047\d+,3.92309\d+,43.67003\d+\|/)
        await expect(new_share_url.hash).toContain('|sousquartiers|d%C3%A9faut|1')
    });
});

test.describe('Read short link permalink @readonly', () => {
    test.beforeEach(async ({ page }) => {
        // force automatic permalink and short link permalink
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['automatic_permalink'] = true;
            json.options['short_link_permalink'] = true;
            if ('Group as layer' in json.layers) {
                json.layers['Group as layer'].toggled = false;
            }
            await route.fulfill({ response, json });
        });
    });

    test.afterEach(async ({ page }) => {
        // Remove catching GetProjectConfig
        await page.unroute('**/service/getProjectConfig*');
    });

    test('Permalink parameters, basic map interaction', async ({ page }) => {
        const project = new ProjectPage(page, 'layer_legends');
        await project.open();

        await page.evaluate(() => lizMap.mainLizmap.map.getView().setCenter([770485, 6277813]));

        await page.waitForTimeout(200);
        /** @type {{[key: string]: string|RegExp|Array}} */
        let expectedPermalinkParameters = {
            repository:'testsrepository',
            project:'layer_legends',
            bbox: /3.5148\d+,43.4213\d+,4.2324\d+,43.7692\d+/,
            layers: 'layer_legend_single_symbol,layer_legend_categorized,layer_legend_ruled,tramway_lines,legend_option_test',
            styles:'d%C3%A9faut,d%C3%A9faut,d%C3%A9faut,a_single,',
            opacities:'1,1,1,1,1',
            symbology: ['','','','','']
        }
        await project.checkShortLinkPermalink(expectedPermalinkParameters);

        // zoom
        await project.zoomIn();
        await page.waitForTimeout(500);

        await project.checkShortLinkPermalink({...expectedPermalinkParameters, bbox: /#3.7314\d+,43.5261\d+,4.0184\d+,43.6653\d+|/});

        // toggle layer_legend_ruled layer
        await page.getByTestId('layer_legend_ruled').locator('> div input').click();
        await project.checkShortLinkPermalink({
            ...expectedPermalinkParameters,
            bbox: /3.7292\d+,43.5261\d+,4.0163\d+,43.6653\d+/,
            layers: 'layer_legend_single_symbol,layer_legend_categorized,tramway_lines,legend_option_test',
            styles:'d%C3%A9faut,d%C3%A9faut,a_single,',
            opacities:'1,1,1,1',
            symbology: ['','','','']
        });

        // change layer opacity
        await project.setLayerOpacity('layer_legend_single_symbol','20');
        await project.checkShortLinkPermalink({
            ...expectedPermalinkParameters,
            bbox: /3.7292\d+,43.5261\d+,4.0163\d+,43.6653\d+/,
            layers: 'layer_legend_single_symbol,layer_legend_categorized,tramway_lines,legend_option_test',
            styles:'d%C3%A9faut,d%C3%A9faut,a_single,',
            opacities:'0.2,1,1,1',
            symbology: ['','','','']
        });

        // toggle group as layer
        await page.getByTestId('Group as layer').locator('> div input').click();
        await project.checkShortLinkPermalink({
            ...expectedPermalinkParameters,
            bbox: /3.7292\d+,43.5261\d+,4.0163\d+,43.6653\d+/,
            layers: 'layer_legend_single_symbol,layer_legend_categorized,tramway_lines,legend_option_test,Group%20as%20layer',
            styles:'d%C3%A9faut,d%C3%A9faut,a_single,,',
            opacities:'0.2,1,1,1,1',
            symbology: ['','','','','']
        });

        // change layer style
        await project.changeLayerStyle('tramway_lines','categorized');
        await project.checkShortLinkPermalink({
            ...expectedPermalinkParameters,
            bbox: /3.7292\d+,43.5261\d+,4.0163\d+,43.6653\d+/,
            layers: 'layer_legend_single_symbol,layer_legend_categorized,tramway_lines,legend_option_test,Group%20as%20layer',
            styles:'d%C3%A9faut,d%C3%A9faut,categorized,,',
            opacities:'0.2,1,1,1,1',
            symbology: ['','','','','']
        });

        // reload page
        await reloadMap(page);
        // NOTE: Converting the CRS to EPSG:4326 may result in different approximations.
        // This is especially true when reloading the page with a initial extent parameter.
        // The extent of the approximation depends on the project's CRS.
        await project.checkShortLinkPermalink({
            ...expectedPermalinkParameters,
            bbox: /3.7296\d+,43.5261\d+,4.0166\d+,43.6653\d+/,
            layers: 'layer_legend_single_symbol,layer_legend_categorized,tramway_lines,legend_option_test,Group%20as%20layer',
            styles:'d%C3%A9faut,d%C3%A9faut,categorized,,',
            opacities:'0.2,1,1,1,1',
            symbology: ['','','','','']
        });

        // check user interface
        // layers
        await expect(page.getByTestId('layer_legend_single_symbol').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('layer_legend_categorized').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('layer_legend_ruled').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('tramway_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('legend_option_test').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('Group as layer').locator('> div input')).toBeChecked();

        // styles
        await project.openLayerInfo('tramway_lines');
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('categorized');
        // opacity
        await project.openLayerInfo('layer_legend_single_symbol');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('20');
    })

    test('Load short link permalink', async ({ page }) => {
        const project = new ProjectPage(page, 'short_link_permalink');
        let permalinkRequestPromise = project.waitForPermalinkGetRequest();
        await project.open(false,"#permalink=18cpdxABubeZ");

        let permalinkRequest = await permalinkRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const permalinkParameters = {
            'o': 'g',
            'repository': 'testsrepository',
            'project': 'short_link_permalink',
            'id': '18cpdxABubeZ',
        }
        requestExpect(permalinkRequest).toContainParametersInUrl(permalinkParameters);
        let permalinkResponse = await permalinkRequest.response();
        responseExpect(permalinkResponse).toBeJson();
        await page.waitForTimeout(500);

        await expect(page.getByTestId('single_wms_points').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_baselayer').locator('> div input')).toBeChecked();

        // hash should be equal to map_status
        let url_to_check = new URL(page.url());
        await expect(url_to_check.hash).toBe("#map_status");

        // toggle single_wms_points layer
        await page.getByTestId('single_wms_points').locator('> div input').click();
        await project.changeLayerStyle('single_wms_points','default');

        // hash should be equal to map_status
        url_to_check = new URL(page.url());
        await expect(url_to_check.hash).toBe("#map_status");
        /** @type {{[key: string]: string|RegExp|Array}} */
        let expectedPermalinkParameters = {
            repository:'testsrepository',
            project:'short_link_permalink',
            bbox: /3.7810\d+,43.5318\d+,3.988\d+,43.6688\d+/,
            layers: 'single_wms_points,single_wms_lines,single_wms_baselayer',
            styles:'default,default,default',
            opacities:'1,1,1',
            symbology: ['','','']
        }
        await project.checkShortLinkPermalink(expectedPermalinkParameters);

        // reload map
        await reloadMap(page);
        await project.checkShortLinkPermalink(expectedPermalinkParameters);

        // hash should be equal to map_status
        url_to_check = new URL(page.url());
        expect(url_to_check.hash).toBe("#map_status");
    })

    test("Unknown permalink", async ({ page }) => {
        const project = new ProjectPage(page, 'short_link_permalink');
        let permalinkRequestPromise = project.waitForPermalinkGetRequest();
        await project.open(false,"#permalink=unknownPermalink");

        let permalinkRequest = await permalinkRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const permalinkParameters = {
            'o': 'g',
            'repository': 'testsrepository',
            'project': 'short_link_permalink',
            'id': 'unknownPermalink',
        }

        requestExpect(permalinkRequest).toContainParametersInUrl(permalinkParameters);
        let permalinkResponse = await permalinkRequest.response();
        responseExpect(permalinkResponse).toBeJson();
        await page.waitForTimeout(500);

        let body = await permalinkResponse?.json();

        expect(body).toHaveProperty('error');
        expect(body.error).toStrictEqual(['The permalink does not exists']);
        await expect(page.locator('#content div.alert.alert-danger')).toHaveCount(1);
        await expect(page.locator('#content div.alert.alert-danger')).toHaveText('The permalink does not exists');
        // close message panel
        await(page.locator('#content div.alert.alert-danger .btn-close')).click();

        let url_to_check = new URL(page.url());
        // on init, if the permalink does not exists se hash to map_status if automatic_permalink is enabled
        expect(url_to_check.hash).toBe("#map_status");

        // change hash with another invalid permalink
        const newHash = '#permalink=newUnknownPermalink';
        permalinkRequestPromise = project.waitForPermalinkGetRequest();
        await page.evaluate(token => window.location.hash = token, newHash);
        permalinkRequest = await permalinkRequestPromise;

        /** @type {{[key: string]: string|RegExp}} */
        const newPermalinkParameters = {
            'o': 'g',
            'repository': 'testsrepository',
            'project': 'short_link_permalink',
            'id': 'newUnknownPermalink',
        }

        requestExpect(permalinkRequest).toContainParametersInUrl(newPermalinkParameters);
        permalinkResponse = await permalinkRequest.response();
        responseExpect(permalinkResponse).toBeJson();
        await page.waitForTimeout(500);

        body = await permalinkResponse?.json();

        expect(body).toHaveProperty('error');
        expect(body.error).toStrictEqual(['The permalink does not exists']);
        await expect(page.locator('#content div.alert.alert-danger')).toHaveCount(1);
        await expect(page.locator('#content div.alert.alert-danger')).toHaveText('The permalink does not exists');
        url_to_check = new URL(page.url());
        await page.waitForTimeout(500);

        // on hash change, if the permalink does not exists, the hash sould be #map_status
        expect(url_to_check.hash).toBe("#map_status");
    })
})

test.describe('Write short link permalink @write', () => {
    test('Add short link permalink', async ({ page }) => {
        const project = new ProjectPage(page, 'short_link_permalink');
        await project.open();

        // change map appearance
        await page.getByTestId('single_wms_baselayer').locator('> div input').click();
        await project.setLayerOpacity('single_wms_lines','60');
        await project.changeLayerStyle('single_wms_points','default');
        await project.closeLayerInfo();
        /** @type {{[key: string]: string|RegExp|Array}} */
        let expectedPermalinkParameters = {
            repository:'testsrepository',
            project:'short_link_permalink',
            bbox: /3.6273\d+,43.4294\d+,4.1451\d+,43.7717\d+/,
            layers: 'single_wms_points,single_wms_lines',
            styles:'default,default',
            opacities:'1,0.6',
            symbology:['','']
        }

        await project.checkShortLinkPermalink(expectedPermalinkParameters);

        // open permalink panel
        await project.openPermalinkPanel();
        expect(page.locator("#permalink-generator")).toBeVisible();
        expect(page.locator("#permalink-history table")).toHaveCount(0);

        // add new short link
        let permalinkAddRequestPromise = project.waitForPermalinkAddRequest();
        await page.locator("#lizmap-new-permalink").click();
        let permalinkAddRequest = await permalinkAddRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const permalinkUrlParameters = {
            'o': 'add',
            'repository': 'testsrepository',
            'project': 'short_link_permalink',
        }

        requestExpect(permalinkAddRequest).toContainParametersInUrl(permalinkUrlParameters);
        let permalinkResponse = await permalinkAddRequest.response();
        responseExpect(permalinkResponse).toBeJson();

        let body = await permalinkResponse?.json();

        expect(body).toHaveProperty('permalink','9jjvi-P30Xl8');

        // check permalink panel interface
        expect(page.locator("#lizmap-new-permalink")).toBeDisabled();
        expect(await page.locator("#lizmap-new-permalink").textContent()).toBe("Permalink copied to clipboard");

        // inspect history table
        expect(page.locator("#permalink-history table tr")).toHaveCount(1);
        await project.inspectPermalinkHistoryTableRecord("9jjvi-P30Xl8");
        await project.copyPermalinkToClipboard("9jjvi-P30Xl8");

        // switch layer on/off
        await page.getByTestId('single_wms_baselayer').locator('> div input').click();
        // button to create a new permalink should be enabled now
        expect(page.locator("#lizmap-new-permalink")).toBeEnabled();

        expect(await page.locator("#lizmap-new-permalink").textContent()).toBe("Create new permalink");
        await page.getByTestId('single_wms_baselayer').locator('> div input').click();

        // create a new permalink: since the map has not been modified, a new permalink should not be created
        permalinkAddRequestPromise = project.waitForPermalinkAddRequest();
        await page.locator("#lizmap-new-permalink").click();
        permalinkAddRequest = await permalinkAddRequestPromise;
        requestExpect(permalinkAddRequest).toContainParametersInUrl(permalinkUrlParameters);
        permalinkResponse = await permalinkAddRequest.response();
        responseExpect(permalinkResponse).toBeJson();

        body = await permalinkResponse?.json();

        expect(body).toHaveProperty('permalink','9jjvi-P30Xl8');
        expect(page.locator("#lizmap-new-permalink")).toBeDisabled();
        expect(await page.locator("#lizmap-new-permalink").textContent()).toBe("Permalink copied to clipboard");

        // inspect history table
        expect(page.locator("#permalink-history table tr")).toHaveCount(1);
        await project.inspectPermalinkHistoryTableRecord("9jjvi-P30Xl8");

        // create new permalink
        await page.getByTestId('single_wms_baselayer').locator('> div input').click();

        // create a new permalink: since map has changed, a new permalink should be added to history table
        permalinkAddRequestPromise = project.waitForPermalinkAddRequest();
        await page.locator("#lizmap-new-permalink").click();
        permalinkAddRequest = await permalinkAddRequestPromise;
        requestExpect(permalinkAddRequest).toContainParametersInUrl(permalinkUrlParameters);
        permalinkResponse = await permalinkAddRequest.response();
        responseExpect(permalinkResponse).toBeJson();

        body = await permalinkResponse?.json();

        expect(body).toHaveProperty('permalink','gEnvQzYMxZGt');
        expect(page.locator("#lizmap-new-permalink")).toBeDisabled();
        expect(await page.locator("#lizmap-new-permalink").textContent()).toBe("Permalink copied to clipboard");
        expect(page.locator("#permalink-history table tr")).toHaveCount(2);
        await project.inspectPermalinkHistoryTableRecord("gEnvQzYMxZGt");

        // inspect share functionality
        await project.inspectPermalinkSharePanel("9jjvi-P30Xl8");
        await project.inspectPermalinkSharePanel("gEnvQzYMxZGt");

        // hash should be equal to map_status
        let url_to_check = new URL(page.url());
        expect(url_to_check.hash).toBe("#map_status");

        //add another permalink and remove permalink from local storage
        await page.getByTestId('single_wms_points').locator('> div input').click();

        // create a new permalink: since map has changed, a new permalink should be added to history table
        permalinkAddRequestPromise = project.waitForPermalinkAddRequest();
        await page.locator("#lizmap-new-permalink").click();
        permalinkAddRequest = await permalinkAddRequestPromise;
        requestExpect(permalinkAddRequest).toContainParametersInUrl(permalinkUrlParameters);
        permalinkResponse = await permalinkAddRequest.response();
        responseExpect(permalinkResponse).toBeJson();

        body = await permalinkResponse?.json();

        expect(body).toHaveProperty('permalink','LMZam0ZnK3Ps');
        expect(page.locator("#lizmap-new-permalink")).toBeDisabled();
        expect(await page.locator("#lizmap-new-permalink").textContent()).toBe("Permalink copied to clipboard");
        expect(page.locator("#permalink-history table tr")).toHaveCount(3);
        await project.inspectPermalinkHistoryTableRecord("LMZam0ZnK3Ps");
        await project.inspectPermalinkSharePanel("LMZam0ZnK3Ps");

        // remove permalink
        await project.removePermalinkFromLocalStorage("LMZam0ZnK3Ps");
        expect(page.locator("#permalink-history table tr")).toHaveCount(2);

        // clear history
        await project.clearPermalinkHistory();
        expect(page.locator("#permalink-history table")).toHaveCount(0);
    })

    test('Add short link permalink with symbology', async ({browser, page}) => {
        const project = new ProjectPage(page, 'short_link_permalink');
        await project.open();
        // interaction on symbology
        await project.changeLayerStyle('single_wms_points','default');
        await project.setLayerOpacity('single_wms_lines','60');
        await project.closeLayerInfo();

        await page.waitForTimeout(500);

        /** @type {{[key: string]: string|RegExp|Array}} */
        let expectedPermalinkParameters = {
            repository:'testsrepository',
            project:'short_link_permalink',
            bbox: /3.6273\d+,43.4294\d+,4.1451\d+,43.7717\d+/,
            layers: 'single_wms_points,single_wms_lines,single_wms_baselayer',
            styles:'default,default,default',
            opacities:'1,0.6,1',
            symbology:['','','']
        }

        await project.checkShortLinkPermalink(expectedPermalinkParameters);
        await project.changeLayerStyle('single_wms_points','classified');
        await page.waitForTimeout(500);
        await project.toggleLayerSymbol('single_wms_points',0,false);
        await project.closeLayerInfo();

        /** @type {{[key: string]: string|RegExp|Array}} */
        expectedPermalinkParameters = {
            repository:'testsrepository',
            project:'short_link_permalink',
            bbox: /3.6273\d+,43.4294\d+,4.1451\d+,43.7717\d+/,
            layers: 'single_wms_points,single_wms_lines,single_wms_baselayer',
            styles:'classified,default,default',
            opacities:'1,0.6,1',
            symbology:[{
                LEGEND_ON: 'single_wms_points:{fa9e5723-097e-4212-bf40-4a9ccc70c024},{888c4c7c-c27b-45e4-ad28-5a75c2ca231b},'+
                '{bffd7db7-e86c-4ee4-b5f3-66d75a7ada61},{77b11021-37e2-40d5-8880-c0f79581b67e},'+
                '{f3a2bb5b-da44-4afe-b55a-3badae61b697},{a5641572-5c16-4f3c-8c8c-c585d0b889ce}',
                LEGEND_OFF: 'single_wms_points:{d68c60ac-411c-4907-a31c-8d6aaac78b37}'},'',''
            ]
        }
        await project.checkShortLinkPermalink(expectedPermalinkParameters);

        let url_to_check = new URL(page.url());
        expect(url_to_check.hash).toBe("#map_status");
        /** @type {{[key: string]: string|RegExp}} */
        const permalinkUrlParameters = {
            'o': 'add',
            'repository': 'testsrepository',
            'project': 'short_link_permalink',
        }
        // open permalink panel
        await project.openPermalinkPanel();
        expect(page.locator("#permalink-generator")).toBeVisible();
        expect(page.locator("#permalink-history table")).toHaveCount(0);

        // add permalink with symbology
        let permalinkAddRequestPromise = project.waitForPermalinkAddRequest();
        await page.locator("#lizmap-new-permalink").click();
        let permalinkAddRequest = await permalinkAddRequestPromise;
        requestExpect(permalinkAddRequest).toContainParametersInUrl(permalinkUrlParameters);
        let permalinkResponse = await permalinkAddRequest.response();
        responseExpect(permalinkResponse).toBeJson();

        let body = await permalinkResponse?.json();

        expect(body).toHaveProperty('permalink','a6ADNM4iC66O');
        expect(page.locator("#lizmap-new-permalink")).toBeDisabled();
        expect(await page.locator("#lizmap-new-permalink").textContent()).toBe("Permalink copied to clipboard");
        expect(page.locator("#permalink-history table tr")).toHaveCount(1);
        await project.inspectPermalinkHistoryTableRecord("a6ADNM4iC66O");
        await project.inspectPermalinkSharePanel("a6ADNM4iC66O");

        url_to_check = new URL(page.url());
        expect(url_to_check.hash).toBe("#map_status");

        // reload map
        await reloadMap(page);
        await project.checkShortLinkPermalink(expectedPermalinkParameters);

        // hash should be equal to map_status
        url_to_check = new URL(page.url());
        expect(url_to_check.hash).toBe("#map_status");

        // Visibility
        await expect(page.getByTestId('single_wms_points').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_baselayer').locator('> div input')).toBeChecked();

        // Style
        await project.openLayerInfo('single_wms_points');
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('classified');
        await project.closeLayerInfo();

        // Opacity
        await project.openLayerInfo('single_wms_lines');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');
        await project.closeLayerInfo();

        // Symbology
        await page.getByTestId('single_wms_points').locator('div.expandable').click();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(0).locator('input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(1).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(2).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(3).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(4).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(5).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(6).locator('input')).toBeChecked();

        // change layer style, visibility and then reload
        await project.changeLayerStyle('single_wms_points','default');
        await page.getByTestId('single_wms_baselayer').locator('> div input').click();

        /** @type {{[key: string]: string|RegExp|Array}} */
        expectedPermalinkParameters = {
            repository:'testsrepository',
            project:'short_link_permalink',
            bbox: /3.6273\d+,43.4294\d+,4.1451\d+,43.7717\d+/,
            layers: 'single_wms_points,single_wms_lines',
            styles:'default,default',
            opacities:'1,0.6',
            symbology:['','']
        }

        page.waitForTimeout(500);
        // reload map
        await reloadMap(page);
        await project.checkShortLinkPermalink(expectedPermalinkParameters);

        // change hash with a valid permalink
        let newHash = '#permalink=a6ADNM4iC66O';
        let permalinkRequestPromise = project.waitForPermalinkGetRequest();
        await page.evaluate(token => window.location.hash = token, newHash);
        let permalinkGetRequest = await permalinkRequestPromise;

        /** @type {{[key: string]: string|RegExp}} */
        const newPermalinkParameters = {
            'o': 'g',
            'repository': 'testsrepository',
            'project': 'short_link_permalink',
            'id': 'a6ADNM4iC66O',
        }
        requestExpect(permalinkGetRequest).toContainParametersInUrl(newPermalinkParameters);
        permalinkResponse = await permalinkGetRequest.response();
        responseExpect(permalinkResponse).toBeJson();

        await page.waitForTimeout(500);

        /** @type {{[key: string]: string|RegExp|Array}} */
        expectedPermalinkParameters = {
            repository:'testsrepository',
            project:'short_link_permalink',
            bbox: /3.6273\d+,43.4294\d+,4.1451\d+,43.7717\d+/,
            layers: 'single_wms_points,single_wms_lines,single_wms_baselayer',
            styles:'classified,default,default',
            opacities:'1,0.6,1',
            symbology:[
                {LEGEND_ON: 'single_wms_points:{fa9e5723-097e-4212-bf40-4a9ccc70c024},{888c4c7c-c27b-45e4-ad28-5a75c2ca231b},'+
                '{bffd7db7-e86c-4ee4-b5f3-66d75a7ada61},{77b11021-37e2-40d5-8880-c0f79581b67e},{f3a2bb5b-da44-4afe-b55a-3badae61b697},{a5641572-5c16-4f3c-8c8c-c585d0b889ce}',
                LEGEND_OFF: 'single_wms_points:{d68c60ac-411c-4907-a31c-8d6aaac78b37}'},'',''
            ]
        }

        await project.checkShortLinkPermalink(expectedPermalinkParameters);

        // Visibility
        await expect(page.getByTestId('single_wms_points').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_baselayer').locator('> div input')).toBeChecked();


        // Style
        await project.openLayerInfo('single_wms_points');
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('classified');
        await project.closeLayerInfo();

        // Opacity
        await project.openLayerInfo('single_wms_lines');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');
        await project.closeLayerInfo();

        // Symbology
        await page.getByTestId('single_wms_points').locator('div.expandable').click();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(0).locator('input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(1).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(2).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(3).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(4).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(5).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(6).locator('input')).toBeChecked();

        // hash should be equal to map_status
        url_to_check = new URL(page.url());
        expect(url_to_check.hash).toBe("#map_status");

        // reload map and check permalink
        await reloadMap(page);
        await project.checkShortLinkPermalink(expectedPermalinkParameters);

        // Visibility
        await expect(page.getByTestId('single_wms_points').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_baselayer').locator('> div input')).toBeChecked();

        // Style
        await project.openLayerInfo('single_wms_points');
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('classified');
        await project.closeLayerInfo();

        // Opacity
        await project.openLayerInfo('single_wms_lines');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');
        await project.closeLayerInfo();

        // Symbology
        await page.getByTestId('single_wms_points').locator('div.expandable').click();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(0).locator('input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(1).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(2).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(3).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(4).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(5).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(6).locator('input')).toBeChecked();

        // hash should be equal to map_status
        url_to_check = new URL(page.url());
        expect(url_to_check.hash).toBe("#map_status");

        // load a fresh page with permalink for initialization
        const context = await browser.newContext();
        const pageP = await context.newPage();
        const projectP = new ProjectPage(pageP, 'short_link_permalink');
        await projectP.open(false,"#permalink=a6ADNM4iC66O");
        let permalinkRequest = await permalinkRequestPromise;

        /** @type {{[key: string]: string|RegExp}} */
        const permalinkParameters = {
            'o': 'g',
            'repository': 'testsrepository',
            'project': 'short_link_permalink',
            'id': 'a6ADNM4iC66O',
        }
        requestExpect(permalinkRequest).toContainParametersInUrl(permalinkParameters);
        permalinkResponse = await permalinkRequest.response();
        responseExpect(permalinkResponse).toBeJson();

        await pageP.waitForTimeout(500);
        await projectP.checkShortLinkPermalink(expectedPermalinkParameters);
        // Visibility
        await expect(pageP.getByTestId('single_wms_points').locator('> div input')).toBeChecked();
        await expect(pageP.getByTestId('single_wms_lines').locator('> div input')).toBeChecked();
        await expect(pageP.getByTestId('single_wms_baselayer').locator('> div input')).toBeChecked();

        // Style
        await projectP.openLayerInfo('single_wms_points');
        await expect(pageP.locator('#sub-dock select.styleLayer')).toHaveValue('classified');
        await projectP.closeLayerInfo();

        // Opacity
        await projectP.openLayerInfo('single_wms_lines');
        await expect(pageP.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');
        await projectP.closeLayerInfo();

        // Symbology
        await pageP.getByTestId('single_wms_points').locator('div.expandable').click();
        await expect(pageP.getByTestId('single_wms_points').locator('ul li').nth(0).locator('input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(1).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(2).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(3).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(4).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(5).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('ul li').nth(6).locator('input')).toBeChecked();

        // hash should be equal to map_status
        url_to_check = new URL(pageP.url());
        expect(url_to_check.hash).toBe("#map_status");

    })

    test('Add short link permalink with symbology using single wms option', async ({page, browser})=>{

        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['short_link_permalink'] = true;
            await route.fulfill({ response, json });
        });
        const project = new ProjectPage(page, 'single_wms_image');
        await project.open();

        await project.changeLayerStyle('single_wms_points','white_dots');
        await project.toggleLayerSymbol('single_wms_lines',0,false);
        await project.toggleLayerSymbol('single_wms_lines',1,false);
        await project.setLayerOpacity('single_wms_polygons','60');
        await project.closeLayerInfo();
        await page.getByTestId('single_wms_lines_group').locator('> div input').click();

        /** @type {{[key: string]: string|RegExp|Array}} */
        let expectedPermalinkParameters = {
            repository:'testsrepository',
            project:'single_wms_image',
            bbox: /3.5969\d+,43.4696\d+,4.1943\d+,43.7555\d+/,
            layers: 'GroupAsLayer,Group_1,single_wms_points_group,single_wms_points,single_wms_lines,single_wms_polygons',
            styles:',,default,white_dots,default,default',
            opacities:'1,1,1,1,1,0.6',
            symbology:['','','','',{LEGEND_ON: 'single_wms_lines:2,3,4',LEGEND_OFF: 'single_wms_lines:0,1'},'']
        }
        await project.checkShortLinkPermalink(expectedPermalinkParameters);
        // hash should be equal to map_status
        let url_to_check = new URL(page.url());
        expect(url_to_check.hash).toBe("#map_status");
        // reload page and check layer tree

        await reloadMap(page);
        await project.checkShortLinkPermalink(expectedPermalinkParameters);
        // Visibility
        await expect(page.getByTestId('GroupAsLayer').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('Group_1').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines_group').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_points_group').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_polygons').locator('> div input')).toBeChecked();

        // Style
        await project.openLayerInfo('single_wms_points');
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('white_dots');
        await project.closeLayerInfo();

        // Opacity
        await project.openLayerInfo('single_wms_polygons');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');
        await project.closeLayerInfo();

        // Symbology
        await page.getByTestId('single_wms_lines').locator('div.expandable').click();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(0).locator('input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(1).locator('input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(2).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(3).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(4).locator('input')).toBeChecked();

        // save new permalink
        // open permalink panel
        await project.openPermalinkPanel();
        /** @type {{[key: string]: string|RegExp}} */
        const permalinkUrlParameters = {
            'o': 'add',
            'repository': 'testsrepository',
            'project': 'single_wms_image',
        }
        expect(page.locator("#permalink-generator")).toBeVisible();
        expect(page.locator("#permalink-history table")).toHaveCount(0);
        // add permalink with symbology
        let permalinkAddRequestPromise = project.waitForPermalinkAddRequest();
        await page.locator("#lizmap-new-permalink").click();
        let permalinkAddRequest = await permalinkAddRequestPromise;
        requestExpect(permalinkAddRequest).toContainParametersInUrl(permalinkUrlParameters);
        let permalinkResponse = await permalinkAddRequest.response();
        responseExpect(permalinkResponse).toBeJson();

        let body = await permalinkResponse?.json();

        expect(body).toHaveProperty('permalink','_oWA_g8p0fWw');
        expect(page.locator("#lizmap-new-permalink")).toBeDisabled();
        expect(await page.locator("#lizmap-new-permalink").textContent()).toBe("Permalink copied to clipboard");
        expect(page.locator("#permalink-history table tr")).toHaveCount(1);
        await project.inspectPermalinkHistoryTableRecord("_oWA_g8p0fWw");
        await project.inspectPermalinkSharePanel("_oWA_g8p0fWw");

        url_to_check = new URL(page.url());
        expect(url_to_check.hash).toBe("#map_status");

        // change layer style
        await project.changeLayerStyle('single_wms_points','default');
        await project.closeLayerInfo();
        expectedPermalinkParameters = {
            repository:'testsrepository',
            project:'single_wms_image',
            bbox: /3.5969\d+,43.4696\d+,4.1943\d+,43.7555\d+/,
            layers: 'GroupAsLayer,Group_1,single_wms_points_group,single_wms_points,single_wms_lines,single_wms_polygons',
            styles:',,default,default,default,default',
            opacities:'1,1,1,1,1,0.6',
            symbology:['','','','',{LEGEND_ON: 'single_wms_lines:2,3,4',LEGEND_OFF: 'single_wms_lines:0,1'},'']
        }
        await project.checkShortLinkPermalink(expectedPermalinkParameters);
        // hash should be equal to map_status
        url_to_check = new URL(page.url());
        expect(url_to_check.hash).toBe("#map_status");

        // reload map and check permalink parameters
        await reloadMap(page);
        await project.checkShortLinkPermalink(expectedPermalinkParameters);

        // Visibility
        await expect(page.getByTestId('GroupAsLayer').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('Group_1').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines_group').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_points_group').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_polygons').locator('> div input')).toBeChecked();

        // Style
        await project.openLayerInfo('single_wms_points');
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('default');
        await project.closeLayerInfo();

        // Opacity
        await project.openLayerInfo('single_wms_polygons');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');
        await project.closeLayerInfo();

        // Symbology
        await page.getByTestId('single_wms_lines').locator('div.expandable').click();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(0).locator('input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(1).locator('input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(2).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(3).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(4).locator('input')).toBeChecked();

        // change hash with a valid permalink
        let newHash = '#permalink=_oWA_g8p0fWw';
        let permalinkRequestPromise = project.waitForPermalinkGetRequest();
        await page.evaluate(token => window.location.hash = token, newHash);
        let permalinkGetRequest = await permalinkRequestPromise;

        /** @type {{[key: string]: string|RegExp}} */
        const newPermalinkParameters = {
            'o': 'g',
            'repository': 'testsrepository',
            'project': 'single_wms_image',
            'id': '_oWA_g8p0fWw',
        }
        requestExpect(permalinkGetRequest).toContainParametersInUrl(newPermalinkParameters);
        permalinkResponse = await permalinkGetRequest.response();
        responseExpect(permalinkResponse).toBeJson();

        await page.waitForTimeout(500);

        expectedPermalinkParameters = {
            repository:'testsrepository',
            project:'single_wms_image',
            bbox: /3.5969\d+,43.4696\d+,4.1943\d+,43.7555\d+/,
            layers: 'GroupAsLayer,Group_1,single_wms_points_group,single_wms_points,single_wms_lines,single_wms_polygons',
            styles:',,default,white_dots,default,default',
            opacities:'1,1,1,1,1,0.6',
            symbology:['','','','',{LEGEND_ON: 'single_wms_lines:2,3,4',LEGEND_OFF: 'single_wms_lines:0,1'},'']
        }
        await project.checkShortLinkPermalink(expectedPermalinkParameters);

        // Visibility
        await expect(page.getByTestId('GroupAsLayer').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('Group_1').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines_group').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_points_group').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_points').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_polygons').locator('> div input')).toBeChecked();

        // Style
        await project.openLayerInfo('single_wms_points');
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('white_dots');
        await project.closeLayerInfo();

        // Opacity
        await project.openLayerInfo('single_wms_polygons');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');
        await project.closeLayerInfo();

        // Symbology
        await page.getByTestId('single_wms_lines').locator('div.expandable').click();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(0).locator('input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(1).locator('input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(2).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(3).locator('input')).toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('ul li').nth(4).locator('input')).toBeChecked();

        // load a fresh page with permalink for initialization
        const context = await browser.newContext();
        const pageP = await context.newPage();
        await pageP.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['short_link_permalink'] = true;
            await route.fulfill({ response, json });
        });
        const projectP = new ProjectPage(pageP, 'single_wms_image');
        await projectP.open(false,"#permalink=_oWA_g8p0fWw");
        let permalinkRequest = await permalinkRequestPromise;

        /** @type {{[key: string]: string|RegExp}} */
        const permalinkParameters = {
            'o': 'g',
            'repository': 'testsrepository',
            'project': 'single_wms_image',
            'id': '_oWA_g8p0fWw',
        }
        requestExpect(permalinkRequest).toContainParametersInUrl(permalinkParameters);
        permalinkResponse = await permalinkRequest.response();
        responseExpect(permalinkResponse).toBeJson();

        await pageP.waitForTimeout(500);
        await projectP.checkShortLinkPermalink(expectedPermalinkParameters);
        // Visibility
        await expect(pageP.getByTestId('GroupAsLayer').locator('> div input')).toBeChecked();
        await expect(pageP.getByTestId('Group_1').locator('> div input')).toBeChecked();
        await expect(pageP.getByTestId('single_wms_lines_group').locator('> div input')).not.toBeChecked();
        await expect(pageP.getByTestId('single_wms_points_group').locator('> div input')).toBeChecked();
        await expect(pageP.getByTestId('single_wms_points').locator('> div input')).toBeChecked();
        await expect(pageP.getByTestId('single_wms_lines').locator('> div input')).toBeChecked();
        await expect(pageP.getByTestId('single_wms_polygons').locator('> div input')).toBeChecked();

        // Style
        await projectP.openLayerInfo('single_wms_points');
        await expect(pageP.locator('#sub-dock select.styleLayer')).toHaveValue('white_dots');
        await projectP.closeLayerInfo();

        // Opacity
        await projectP.openLayerInfo('single_wms_polygons');
        await expect(pageP.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');
        await projectP.closeLayerInfo();

        // Symbology
        await pageP.getByTestId('single_wms_lines').locator('div.expandable').click();
        await expect(pageP.getByTestId('single_wms_lines').locator('ul li').nth(0).locator('input')).not.toBeChecked();
        await expect(pageP.getByTestId('single_wms_lines').locator('ul li').nth(1).locator('input')).not.toBeChecked();
        await expect(pageP.getByTestId('single_wms_lines').locator('ul li').nth(2).locator('input')).toBeChecked();
        await expect(pageP.getByTestId('single_wms_lines').locator('ul li').nth(3).locator('input')).toBeChecked();
        await expect(pageP.getByTestId('single_wms_lines').locator('ul li').nth(4).locator('input')).toBeChecked();
        // hash should be equal to map_status
        url_to_check = new URL(pageP.url());
        expect(url_to_check.hash).toBe("#map_status");

        await page.unroute('**/service/getProjectConfig*');
        await pageP.unroute('**/service/getProjectConfig*');
    })
})

test.describe('Short link permalink, no automatic permalink', () => {
    test.beforeEach(async ({ page }) => {
        // disable automaitc permalink and force single_wms_request
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['automatic_permalink'] = false;
            json.options['wms_single_request_for_all_layers'] = true;
            await route.fulfill({ response, json });
        });
    });

    test.afterEach(async ({ page }) => {
        // Remove catching GetProjectConfig
        await page.unroute('**/service/getProjectConfig*');
    });

    test('Read short link permalink @readonly', async ({ page }) => {
        const project = new ProjectPage(page, 'short_link_permalink');
        let permalinkRequestPromise = project.waitForPermalinkGetRequest();
        let getMapRequestPromise = project.waitForGetMapRequest();

        await project.open(false,"#permalink=18cpdxABubeZ");

        let permalinkRequest = await permalinkRequestPromise;
        let getMapRequest = await getMapRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const permalinkParameters = {
            'o': 'g',
            'repository': 'testsrepository',
            'project': 'short_link_permalink',
            'id': '18cpdxABubeZ',
        }
        requestExpect(permalinkRequest).toContainParametersInUrl(permalinkParameters);
        let permalinkResponse = await permalinkRequest.response();
        responseExpect(permalinkResponse).toBeJson();

        /** @type {{[key: string]: string|RegExp}} */
        let getMapExpectedParameters = {
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',
            'REQUEST': 'GetMap',
            'FORMAT': /^image\/png/,
            'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
            'LAYERS': 'single_wms_baselayer,single_wms_lines',
            'CRS': 'EPSG:4326',
            'WIDTH': '958',
            'HEIGHT': '633',
            'BBOX': /43.5249\d+,3.7705\d+,43.6757\d+,3.9986\d+/,
        }
        requestExpect(getMapRequest).toContainParametersInUrl(getMapExpectedParameters);

        await expect(page.getByTestId('single_wms_points').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('single_wms_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('single_wms_baselayer').locator('> div input')).toBeChecked();

        // no url hash
        let url_to_check = new URL(page.url());
        expect(url_to_check.hash).toBe('');

        // change map
        await page.getByTestId('single_wms_baselayer').locator('> div input').click();

        // no url hash
        url_to_check = new URL(page.url());
        expect(url_to_check.hash).toBe('');
    })
})

test.describe('Permalink with edition @readonly', () => {
    test('Start edition with automatic permalink enabled',async ({page})=>{
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['automatic_permalink'] = true;
            await route.fulfill({ response, json });
        });
        const project = new ProjectPage(page, 'form_edition');
        await project.open();

        await project.zoomIn();
        await page.waitForTimeout(500);
        let url = new URL(page.url());
        expect(url.hash).not.toHaveLength(0);
        expect(url.hash).toContain('|end2end_form_edition_geom|d%C3%A9faut|1')
        expect(url.hash).toMatch(/#3.5662\d+,43.4061\d+,4.2839\d+,43.7543\d+\|/)

        await project.openEditingFormWithLayer('end2end_form_edition');

        url = new URL(page.url());
        expect(url.hash).not.toHaveLength(0);
        expect(url.hash).toContain('|end2end_form_edition_geom|d%C3%A9faut|1')
        expect(url.hash).toMatch(/#3.5662\d+,43.4061\d+,4.2839\d+,43.7543\d+\|/)

        await page.unroute('**/service/getProjectConfig*');
    })

    test('Start edition with automatic permalink enabled and shorrt link permalink enabled',async ({page})=>{
        await page.route('**/service/getProjectConfig*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.options['automatic_permalink'] = true;
            json.options['short_link_permalink'] = true;
            await route.fulfill({ response, json });
        });
        const project = new ProjectPage(page, 'form_edition');
        await project.open();

        await project.zoomIn();
        await page.waitForTimeout(500);
        let url = new URL(page.url());
        expect(url.hash).not.toHaveLength(0);
        expect(url.hash).toBe("#map_status")

        await project.openEditingFormWithLayer('end2end_form_edition');

        url = new URL(page.url());
        expect(url.hash).not.toHaveLength(0);
        expect(url.hash).toBe("#map_status")

        await page.unroute('**/service/getProjectConfig*');
    })
})
