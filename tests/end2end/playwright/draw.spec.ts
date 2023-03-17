import { test, expect } from '@playwright/test';

test.describe('Draw', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=draw';
        await page.goto(url, { waitUntil: 'networkidle' });

        await page.locator('#button-draw').click();
    });

    test('All draw tools', async ({ page }) => {
        // Point
        await page.locator('#draw').getByRole('link').nth(1).click();
        await page.locator('.digitizing-point > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 200,
                y: 50
            }
        });

        // Linestring
        await page.locator('#draw').getByRole('link').nth(1).click();
        await page.locator('.digitizing-line > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 230,
                y: 50
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 280,
                y: 50
            }
        });

        await page.locator('#newOlMap').dblclick({
            position: {
                x: 280,
                y: 115
            }
        });

        // Polygon
        await page.locator('#draw').getByRole('link').nth(1).click();
        await page.locator('.digitizing-polygon > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 290,
                y: 50
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 330,
                y: 50
            }
        });

        await page.locator('#newOlMap').dblclick({
            position: {
                x: 330,
                y: 115
            }
        });

        // Box
        await page.locator('#draw').getByRole('link').nth(1).click();
        await page.locator('.digitizing-box > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 340,
                y: 50
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 390,
                y: 115
            }
        });

        // Circle
        await page.locator('#draw').getByRole('link').nth(1).click();
        await page.locator('.digitizing-circle > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 450,
                y: 75
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 480,
                y: 115
            }
        });

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#map, #map *", el => el.style.visibility = 'visible');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        expect(await page.locator('#map').screenshot()).toMatchSnapshot('draw-all-tools.png');
    });

    test('Edition', async ({ page }) => {
        // Polygon
        await page.locator('#draw').getByRole('link').nth(1).click();
        await page.locator('.digitizing-polygon > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 290,
                y: 50
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 330,
                y: 50
            }
        });

        await page.locator('#newOlMap').dblclick({
            position: {
                x: 330,
                y: 115
            }
        });

        // Box
        await page.locator('#draw').getByRole('link').nth(1).click();
        await page.locator('.digitizing-box > svg').click();
        await page.locator('#newOlMap').click({
            position: {
                x: 340,
                y: 50
            }
        });
        await page.locator('#newOlMap').click({
            position: {
                x: 390,
                y: 115
            }
        });

        // Edition
        await page.locator('.digitizing-edit').click();

        await page.locator('#newOlMap').click({
            position: {
                x: 370,
                y: 100
            }
        });

        await page.waitForTimeout(300);

        // Change color
        await page.locator('input[type="color"]').evaluate(input => {
            (<HTMLInputElement> input).value = '#000'; // Cast input to HTMLInputElement for TypeScript
            var event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
              
            input.dispatchEvent(event);
        });

        // Delete polygon
        await page.locator('.digitizing-erase').click();

        page.on('dialog', dialog => dialog.accept());

        await page.locator('#newOlMap').click({
            position: {
                x: 315,
                y: 60
            }
        });

        await page.waitForTimeout(300);

        // Hide all elements but #map, #newOlMap and their children
        await page.$eval("*", el => el.style.visibility = 'hidden');
        await page.$eval("#map, #map *", el => el.style.visibility = 'visible');
        await page.$eval("#newOlMap, #newOlMap *", el => el.style.visibility = 'visible');

        expect(await page.locator('#map').screenshot()).toMatchSnapshot('draw-edition.png');
    });
});
