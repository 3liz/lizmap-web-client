// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Permalink', () => {
    test('UI according to permalink parameters', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=permalink'
        const bbox = '3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254'
        const layers = 'sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier'
        const styles = 'red,d%C3%A9faut'
        const opacities = '0.6,0.8'
        const url = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        await page.goto(url, { waitUntil: 'networkidle' });

        // Visibility
        await expect(page.getByTestId('sousquartiers').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('Les quartiers à Montpellier').locator('> div input')).toBeChecked();

        // Style and opacity
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click({force:true});
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('red');
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('60');

        await page.getByTestId('Les quartiers à Montpellier').locator('.icon-info-sign').click({force:true});
        await expect(page.locator('#sub-dock .btn-opacity-layer.active')).toHaveText('80');

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
    });

    test('Group as layer : UI according to permalink parameters', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=layer_legends'
        const bbox = '3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636'
        const layers = 'layer_legend_single_symbol,tramway_lines,Group as layer'
        const styles = 'défaut,categorized,'
        const opacities = '1,1,1,1'
        const url = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        await page.goto(url, { waitUntil: 'networkidle' });

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
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({force:true});
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
        await page.goto(url, { waitUntil: 'networkidle' });

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
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({force:true});
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('a_single');

        // Close subdock
        await page.getByRole('button', { name: 'Close' }).click();
    });

    test('Build permalink, reload and apply one', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=layer_legends'
        await page.goto(baseUrl, { waitUntil: 'networkidle' });

        // Initial url has no hash
        let url = new URL(page.url());
        await expect(url.hash).toHaveLength(0);

        // Default Visibility
        await expect(page.getByTestId('layer_legend_single_symbol').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('layer_legend_categorized').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('tramway_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('legend_option_test').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('expand_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('disabled').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('hide_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('Group as layer').locator('> div input')).not.toBeChecked();

        // Style
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({force:true});
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
        await expect(hashLayers).toHaveLength(5)
        let hashStyles = hashContent[2].split(',')
        await expect(hashStyles).toHaveLength(5)
        let hashOpacities = hashContent[3].split(',')
        await expect(hashOpacities).toHaveLength(5)

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

        // Group as layer has an empty string style ''
        await expect(hashLayers[4]).toBe(encodeURI('Group as layer'))
        await expect(hashStyles[4]).toBe('')
        await expect(hashOpacities[4]).toBe('1')

        // Change the tramway_lines style to categorized
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({force:true});
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
        await expect(hashLayers).toHaveLength(5)
        hashStyles = hashContent[2].split(',')
        await expect(hashStyles).toHaveLength(5)
        hashOpacities = hashContent[3].split(',')
        await expect(hashOpacities).toHaveLength(5)

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

        // Group as layer has an empty string style ''
        await expect(hashLayers[4]).toBe(encodeURI('Group as layer'))
        await expect(hashStyles[4]).toBe('')
        await expect(hashOpacities[4]).toBe('1')

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
        await expect(hashLayers).toHaveLength(3)
        hashStyles = hashContent[2].split(',')
        await expect(hashStyles).toHaveLength(3)
        hashOpacities = hashContent[3].split(',')
        await expect(hashOpacities).toHaveLength(3)

        // layer_legend_single_symbol has défaut style
        await expect(hashLayers[0]).toBe(encodeURI('layer_legend_single_symbol'))
        await expect(hashStyles[0]).toBe(encodeURI('défaut'))
        await expect(hashOpacities[0]).toBe('1')

        // tramway_lines has a_single style
        await expect(hashLayers[1]).toBe(encodeURI('tramway_lines'))
        await expect(hashStyles[1]).toBe(encodeURI('categorized'))
        await expect(hashOpacities[1]).toBe('1')

        // Group as layer has an empty string style ''
        await expect(hashLayers[2]).toBe(encodeURI('Group as layer'))
        await expect(hashStyles[2]).toBe('')
        await expect(hashOpacities[2]).toBe('1')

        // Change the layer_legend_single_symbol opacity
        await page.getByTestId('layer_legend_single_symbol').locator('.icon-info-sign').click({force:true});
        await page.locator('#sub-dock .btn-opacity-layer', {hasText:'60'}).click();
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
        await expect(hashLayers).toHaveLength(3)
        hashStyles = hashContent[2].split(',')
        await expect(hashStyles).toHaveLength(3)
        hashOpacities = hashContent[3].split(',')
        await expect(hashOpacities).toHaveLength(3)

        // layer_legend_single_symbol has défaut style
        await expect(hashLayers[0]).toBe(encodeURI('layer_legend_single_symbol'))
        await expect(hashStyles[0]).toBe(encodeURI('défaut'))
        await expect(hashOpacities[0]).toBe('0.6')

        // tramway_lines has a_single style
        await expect(hashLayers[1]).toBe(encodeURI('tramway_lines'))
        await expect(hashStyles[1]).toBe(encodeURI('categorized'))
        await expect(hashOpacities[1]).toBe('1')

        // Group as layer has an empty string style ''
        await expect(hashLayers[2]).toBe(encodeURI('Group as layer'))
        await expect(hashStyles[2]).toBe('')
        await expect(hashOpacities[2]).toBe('1')

        // Reload
        await page.reload({ waitUntil: 'networkidle' });

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
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({force:true});
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('categorized');

        // Opacity
        await page.getByTestId('layer_legend_single_symbol').locator('.icon-info-sign').click({force:true});
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
        await expect(old_url.hash).toContain('|layer_legend_single_symbol,tramway_lines,Group%20as%20layer|')
        await expect(old_url.hash).toContain('|d%C3%A9faut,categorized,|')
        await expect(old_url.hash).toContain('|0.6,1,1')

        // Test permalink with empty string styles
        const bbox = '3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636'
        const layers = 'layer_legend_single_symbol,layer_legend_categorized,tramway_lines,Group as layer'
        const styles = ',,,'
        const opacities = '1,1,1,1'
        const newUrl = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        //const newUrl = baseUrl + '#3.0635044037670305,43.401957103265374,4.567657653648659,43.92018105321636|layer_legend_single_symbol,layer_legend_categorized,tramway_lines,Group as layer|,,,|1,1,1,1';
        await page.goto(newUrl, { waitUntil: 'networkidle' });
        // Reload to force applying hash with empty string styles
        await page.reload({ waitUntil: 'networkidle' });

        // No error
        await expect(page.locator('p.error-msg')).toHaveCount(0);
        await expect(page.locator('#switcher lizmap-treeview ul li')).not.toHaveCount(0);

        // Visibility
        await expect(page.getByTestId('layer_legend_single_symbol').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('layer_legend_categorized').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('tramway_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('legend_option_test').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('expand_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('disabled').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('hide_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('Group as layer').locator('> div input')).toBeChecked();

        // Style
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({force:true});
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('a_single');

        // Opacity
        await page.getByTestId('layer_legend_single_symbol').locator('.icon-info-sign').click({force:true});
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
        await expect(checked_url.hash).toContain('|d%C3%A9faut,d%C3%A9faut,a_single,|')
        await expect(checked_url.hash).toContain('|1,1,1,1')
    });

    test('Build permalink and change hash', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=layer_legends'
        await page.goto(baseUrl, { waitUntil: 'networkidle' });

        // Initial url has no hash
        let url = new URL(page.url());
        await expect(url.hash).toHaveLength(0);

        // Visibility
        await expect(page.getByTestId('layer_legend_single_symbol').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('layer_legend_categorized').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('tramway_lines').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('legend_option_test').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('expand_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('disabled').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('hide_at_startup').locator('> div input')).not.toBeChecked();
        await expect(page.getByTestId('Group as layer').locator('> div input')).not.toBeChecked();

        // Style
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({force:true});
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('a_single');

        // Opacity
        await page.getByTestId('layer_legend_single_symbol').locator('.icon-info-sign').click({force:true});
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
        await page.getByTestId('tramway_lines').locator('.icon-info-sign').click({force:true});
        await expect(page.locator('#sub-dock select.styleLayer')).toHaveValue('categorized');

        // Opacity
        await page.getByTestId('layer_legend_single_symbol').locator('.icon-info-sign').click({force:true});
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
        await page.goto(url, { waitUntil: 'networkidle' });

        // No error
        await expect(page.locator('p.error-msg')).toHaveCount(0);
        await expect(page.locator('#switcher lizmap-treeview ul li')).not.toHaveCount(0);

        // Visibility
        await expect(page.getByTestId('sousquartiers').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('Les quartiers à Montpellier').locator('> div input')).not.toBeChecked();

        // Style and opacity
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click({force:true});
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
        await page.goto(url, { waitUntil: 'networkidle' });

        // No error
        await expect(page.locator('p.error-msg')).toHaveCount(0);
        await expect(page.locator('#switcher lizmap-treeview ul li')).not.toHaveCount(0);

        // Visibility
        await expect(page.getByTestId('sousquartiers').locator('> div input')).toBeChecked();
        await expect(page.getByTestId('Les quartiers à Montpellier').locator('> div input')).not.toBeChecked();

        // Style and opacity
        await page.getByTestId('sousquartiers').locator('.icon-info-sign').click({force:true});
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
        await page.goto(url, { waitUntil: 'networkidle' });

        // Errors
        await expect(page.locator('p.error-msg')).toHaveCount(0);
        await expect(page.locator('#switcher lizmap-treeview ul li')).not.toHaveCount(0);
    });

    test('Permalink parameters error: not enough opacities -> No errors', async ({ page }) => {
        const baseUrl = '/index.php/view/map?repository=testsrepository&project=permalink'
        const bbox = '3.7980645260916805,43.59756940064654,3.904383263124536,43.672963842067254'
        const layers = 'sousquartiers,Les%20quartiers%20%C3%A0%20Montpellier'
        const styles = 'red,d%C3%A9faut'
        const opacities = '0.6'
        const url = baseUrl + '#' + bbox + '|' + layers + '|' + styles + '|' + opacities;
        await page.goto(url, { waitUntil: 'networkidle' });

        // Errors
        await expect(page.locator('p.error-msg')).toHaveCount(0);
        await expect(page.locator('#switcher lizmap-treeview ul li')).not.toHaveCount(0);
    });
});
