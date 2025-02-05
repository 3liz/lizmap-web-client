// @ts-check
import { test } from '@playwright/test';
import { expectParametersToContain } from './globals';
import {ProjectPage} from "./pages/project";

test.describe('Overview',
    {
        tag: ['@readonly'],
    }, () => {

        test('EPSG:2154', async ({ page }) => {
            const requestPromise = page.waitForRequest(/GetMap/);

            const project = new ProjectPage(page, 'overview-2154');
            await project.open();

            const request = await requestPromise;
            const expectedParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
                'LAYERS': 'Overview',
                'CRS': 'EPSG:2154',
                'STYLES': '',
                'WIDTH': '232',
                'HEIGHT': '110',
                'BBOX': /758432.36\d*,6273694.3\d*,782221.64\d*,6284973.7\d*/,
            }
            await expectParametersToContain('GetMap', request.url(), expectedParameters);
        });

        test('EPSG:4326', async ({ page }) => {
            const requestPromise = page.waitForRequest(/GetMap/);

            const project = new ProjectPage(page, 'overview-4326');
            await project.open();

            const request = await requestPromise;
            const expectedParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
                'LAYERS': 'overview',
                'CRS': 'EPSG:4326',
                'STYLES': '',
                'WIDTH': '232',
                'HEIGHT': '110',
                'BBOX': /43.559491\d*,3.765259\d*,43.659592\d*,3.976380\d*/,
            }
            await expectParametersToContain('GetMap', request.url(), expectedParameters);
        });

        test('EPSG:3857', async ({ page }) => {
            const requestPromise = page.waitForRequest(/GetMap/);

            const project = new ProjectPage(page, 'overview-3857');
            await project.open();

            const request = await requestPromise;
            const expectedParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': 'image/png',
                'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
                'LAYERS': 'Overview_1',
                'CRS': 'EPSG:3857',
                'STYLES': '',
                'WIDTH': '232',
                'HEIGHT': '110',
                'BBOX': /411699.32\d*,5396012.89\d*,450848.73\d*,5414575.11\d*/,
            }
            await expectParametersToContain('GetMap', request.url(), expectedParameters);
        });
    });
