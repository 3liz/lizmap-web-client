// @ts-check
import { test, expect } from '@playwright/test';
import {ProjectPage} from "./pages/project";
import {expectParametersToContain} from "./globals";

test.describe('Axis Orientation',
    {
        tag: ['@readonly'],
    },() => {

        test('Axis Orientation NEU for EPSG:3044', async ({ page }) => {
            const project = new ProjectPage(page, 'axis_orientation_neu_3044');
            await project.open();

            // Get blank buffer
            let buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
            const blankByteLength = buffer.byteLength;
            await expect(blankByteLength).toBeGreaterThan(1000); // 1286
            await expect(blankByteLength).toBeLessThan(1500) // 1286

            const getMapPromise = page.waitForRequest(/GetMap/);
            await page.getByLabel('Bundesländer').check();
            const getMapRequest = await getMapPromise;
            const expectedParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
                'LAYERS': 'Bundeslander',
                'CRS': 'EPSG:3044',
                'STYLES': 'default',
                'WIDTH': '958',
                'HEIGHT': '633',
                'BBOX': /5276843.28\d+,-14455.54\d+,6114251.21\d+,1252901.15\d+/,
            }
            await expectParametersToContain('GetMap', getMapRequest.url(), expectedParameters)

            const getMapResponse = await getMapRequest.response();
            expect(getMapResponse).not.toBeNull();
            expect(getMapResponse?.ok()).toBe(true);
            expect(await getMapResponse?.headerValue('Content-Type')).toBe('image/png');
            // image size greater than transparent
            const contentLength = await getMapResponse?.headerValue('Content-Length');
            expect(parseInt(contentLength ? contentLength : '0')).toBeGreaterThan(5552);

            buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
            const bundeslanderByteLength = buffer.byteLength;
            await expect(bundeslanderByteLength).toBeGreaterThan(blankByteLength);

            // Catch GetTile request
            let GetTiles = [];
            await page.route('https://tile.openstreetmap.org/*/*/*.png', (route) => {
                const request = route.request();
                GetTiles.push(request.url());
            }, { times: 6 });
            await project.baseLayerSelect.selectOption('OpenStreetMap');
            while (GetTiles.length < 6) {
                await page.waitForTimeout(100);
            }

            expect(GetTiles).toHaveLength(6);
            expect(GetTiles[0]).toContain('6/33/20.png')
            expect(GetTiles[1]).toContain('6/33/21.png')
            expect(GetTiles[2]).toContain('6/34/20.png')
            expect(GetTiles[3]).toContain('6/34/21.png')
            expect(GetTiles[4]).toContain('6/33/22.png')
            expect(GetTiles[5]).toContain('6/34/22.png')
            await page.unroute('https://tile.openstreetmap.org/*/*/*.png')

            // Wait for transition
            await page.waitForTimeout(1000);

            buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
            const osmByteLength = buffer.byteLength;
            await expect(osmByteLength).toBeGreaterThan(blankByteLength);
            await expect(osmByteLength).toBeGreaterThan(bundeslanderByteLength);
        });

        test('Axis Orientation NEU for EPSG:3844', async ({ page }) => {
            const project = new ProjectPage(page, 'axis_orientation_neu_3844');
            await project.open();

            // Get blank buffer
            let buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
            const blankByteLength = buffer.byteLength;
            await expect(blankByteLength).toBeGreaterThan(1000); // 1286
            await expect(blankByteLength).toBeLessThan(1500) // 1286

            const getMapPromise = page.waitForRequest(/GetMap/);
            await page.getByLabel('județ').check();
            const getMapRequest = await getMapPromise;
            const expectedParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
                'LAYERS': 'judet',
                'CRS': 'EPSG:3844',
                'STYLES': 'default',
                'WIDTH': '958',
                'HEIGHT': '633',
                'BBOX': /72126.00\d+,-122200.57\d+,909533.92\d+,1145156.12\d+/,
            }
            await expectParametersToContain('GetMap', getMapRequest.url(), expectedParameters);

            const getMapResponse = await getMapRequest.response();
            expect(getMapResponse).not.toBeNull();
            expect(getMapResponse?.ok()).toBe(true);
            expect(await getMapResponse?.headerValue('Content-Type')).toBe('image/png');
            // image size greater than transparent
            const contentLength = await getMapResponse?.headerValue('Content-Length');
            expect(parseInt(contentLength ? contentLength : '0')).toBeGreaterThan(5552);
            // image size lesser than disorder axis
            expect(parseInt(contentLength ? contentLength : '0')).toBeLessThan(240115);

            buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
            const judetByteLength = buffer.byteLength;
            await expect(judetByteLength).toBeGreaterThan(blankByteLength);

            // Catch GetTile request
            let GetTiles = [];
            await page.route('https://tile.openstreetmap.org/*/*/*.png', (route) => {
                const request = route.request();
                GetTiles.push(request.url());
            }, { times: 6 });
            await project.baseLayerSelect.selectOption('OpenStreetMap');
            while (GetTiles.length < 6) {
                await page.waitForTimeout(100);
            }

            expect(GetTiles).toHaveLength(6);
            expect(GetTiles[0]).toContain('6/35/22.png')
            expect(GetTiles[1]).toContain('6/35/23.png')
            expect(GetTiles[2]).toContain('6/36/22.png')
            expect(GetTiles[3]).toContain('6/36/23.png')
            expect(GetTiles[4]).toContain('6/37/22.png')
            expect(GetTiles[5]).toContain('6/37/23.png')
            await page.unroute('https://tile.openstreetmap.org/*/*/*.png')

            // Wait for transition
            await page.waitForTimeout(1000);

            buffer = await page.screenshot({clip:{x:950/2-380/2, y:600/2-380/2, width:380, height:380}});
            const osmByteLength = buffer.byteLength;
            await expect(osmByteLength).toBeGreaterThan(blankByteLength);
            await expect(osmByteLength).toBeGreaterThan(judetByteLength);
        });
    });
