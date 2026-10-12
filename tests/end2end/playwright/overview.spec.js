// @ts-check
import { test } from '@playwright/test';
import { expect as requestExpect } from './fixtures/expect-request.js';
import {ProjectPage} from "./pages/project";

test.describe('Overview',
    {
        tag: ['@readonly'],
    }, () => {

        test('EPSG:2154', async ({ page }) => {
            const project = new ProjectPage(page, 'overview-2154');
            const requestPromise = project.waitForGetMapRequest();
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
                'WIDTH': '242',
                'HEIGHT': '110',
                'BBOX': /757919.66\d*,6273694.3\d*,782734.34\d*,6284973.7\d*/,
            }
            requestExpect(request).toContainParametersInUrl(expectedParameters);
            await request.response();
        });

        test('EPSG:4326', async ({ page }) => {

            const project = new ProjectPage(page, 'overview-4326');
            const requestPromise = project.waitForGetMapRequest();
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
                'WIDTH': '242',
                'HEIGHT': '110',
                'BBOX': /43.559491\d*,3.760709\d*,43.659592\d*,3.980930\d*/,
            }
            requestExpect(request).toContainParametersInUrl(expectedParameters);
            await request.response();
        });

        test('EPSG:3857', async ({ page }) => {
            const project = new ProjectPage(page, 'overview-3857');
            const requestPromise = project.waitForGetMapRequest();
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
                'WIDTH': '242',
                'HEIGHT': '110',
                'BBOX': /410855.58\d*,5396012.89\d*,451692.46\d*,5414575.11\d*/,
            }
            requestExpect(request).toContainParametersInUrl(expectedParameters);
            await request.response();
        });
    });
