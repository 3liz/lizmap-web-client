// @ts-check
import { test } from '@playwright/test';
import { AtlasPage } from './pages/atlaspage';
import { expectParametersToContain } from './globals';

test.describe('Atlas',
    {
        tag: ['@readonly'],
    }, () => {

        test('Center 4326', async ({ page }) => {
            // atlas project
            const atlasPage = new AtlasPage(page, 'atlas');
            await atlasPage.open();
            await atlasPage.openAtlasPanel();

            // Select a feature
            let getFeatureInfoRequestPromise = atlasPage.waitForGetFeatureInfoRequest();
            let getMapPromise = atlasPage.waitForGetMapRequest();

            await atlasPage.selectAtlasFeature('2');

            let getFeatureInfoRequest = await getFeatureInfoRequestPromise;

            let getMapRequest = await getMapPromise;

            const getFeatureInfoExpectedParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetFeatureInfo',
                'INFO_FORMAT': /^text\/html/,
                'LAYERS': 'Quartiers_a_Montpellier',
                'QUERY_LAYERS': 'Quartiers_a_Montpellier',
                'STYLES': '',
                'FEATURE_COUNT': '1',
                'FILTER': `Quartiers_a_Montpellier:"quartier" = '2'`,
            }
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);

            const getMapExpectedParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': /^image\/png/,
                'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
                'LAYERS': 'Quartiers_a_Montpellier',
                'CRS': 'EPSG:4326',
                'STYLES': 'default',
                'WIDTH': '711',
                'HEIGHT': '633',
                'BBOX': /43.5504\d+,3.7379\d+,43.7012\d+,3.9072\d+/,
            }
            await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);

            // Click on next button
            getFeatureInfoRequestPromise = atlasPage.waitForGetFeatureInfoRequest();
            getMapPromise = atlasPage.waitForGetMapRequest();

            await atlasPage.atlasNextButton.click();
            getFeatureInfoRequest = await getFeatureInfoRequestPromise;
            getMapRequest = await getMapPromise;

            getFeatureInfoExpectedParameters['FILTER'] = `Quartiers_a_Montpellier:"quartier" = '3'`;
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);

            getMapExpectedParameters['BBOX'] = /43.5356\d+,3.7540\d+,43.6863\d+,3.9233\d+/;
            await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);

            // Select feature 5
            getFeatureInfoRequestPromise = atlasPage.waitForGetFeatureInfoRequest();
            getMapPromise = atlasPage.waitForGetMapRequest();

            await atlasPage.selectAtlasFeature('5');
            getFeatureInfoRequest = await getFeatureInfoRequestPromise;
            getMapRequest = await getMapPromise;

            getFeatureInfoExpectedParameters['FILTER'] = `Quartiers_a_Montpellier:"quartier" = '5'`;
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);

            getMapExpectedParameters['BBOX'] = /43.5143\d+,3.8037\d+,43.6651\d+,3.9729\d+/;
            await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);

            // Click on previous button
            getFeatureInfoRequestPromise = atlasPage.waitForGetFeatureInfoRequest();
            getMapPromise = atlasPage.waitForGetMapRequest();

            await atlasPage.atlasPreviousButton.click();
            getFeatureInfoRequest = await getFeatureInfoRequestPromise;
            getMapRequest = await getMapPromise;

            getFeatureInfoExpectedParameters['FILTER'] = `Quartiers_a_Montpellier:"quartier" = '4'`;
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);

            getMapExpectedParameters['BBOX'] = /43.5100\d+,3.7720\d+,43.6607\d+,3.9413\d+/;
            await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);

        });

        test('Zoom 2154', async ({ page }) => {
            // atlas project
            const atlasPage = new AtlasPage(page, 'atlas_2154');
            await atlasPage.open();
            await atlasPage.openAtlasPanel();

            // Select a feature
            let getFeatureInfoRequestPromise = atlasPage.waitForGetFeatureInfoRequest();
            let getMapPromise = atlasPage.waitForGetMapRequest();

            await atlasPage.selectAtlasFeature('2');

            let getFeatureInfoRequest = await getFeatureInfoRequestPromise;

            let getMapRequest = await getMapPromise;

            const getFeatureInfoExpectedParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetFeatureInfo',
                'INFO_FORMAT': /^text\/html/,
                'LAYERS': 'Quartiers_a_Montpellier',
                'QUERY_LAYERS': 'Quartiers_a_Montpellier',
                'STYLES': '',
                'FEATURE_COUNT': '1',
                'FILTER': `Quartiers_a_Montpellier:"quartier" = '2'`,
            }
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);

            const getMapExpectedParameters = {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'FORMAT': /^image\/png/,
                'TRANSPARENT': /\b(\w*^true$\w*)\b/gmi,
                'LAYERS': 'Quartiers_a_Montpellier',
                'CRS': 'EPSG:2154',
                'STYLES': 'default',
                'WIDTH': '711',
                'HEIGHT': '633',
                'BBOX': /761703.56\d+,6276912.17\d+,771109.52\d+,6285286.25\d+/,
            }
            await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);

            // Click on next button
            getFeatureInfoRequestPromise = atlasPage.waitForGetFeatureInfoRequest();
            getMapPromise = atlasPage.waitForGetMapRequest();

            await atlasPage.atlasNextButton.click();
            getFeatureInfoRequest = await getFeatureInfoRequestPromise;
            getMapRequest = await getMapPromise;

            getFeatureInfoExpectedParameters['FILTER'] = `Quartiers_a_Montpellier:"quartier" = '3'`;
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);

            getMapExpectedParameters['BBOX'] = /763029.00\d+,6275270.57\d+,772434.95\d+,6283644.64\d+/;
            await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);

            // Select feature 5
            getFeatureInfoRequestPromise = atlasPage.waitForGetFeatureInfoRequest();
            getMapPromise = atlasPage.waitForGetMapRequest();

            await atlasPage.selectAtlasFeature('5');
            getFeatureInfoRequest = await getFeatureInfoRequestPromise;
            getMapRequest = await getMapPromise;

            getFeatureInfoExpectedParameters['FILTER'] = `Quartiers_a_Montpellier:"quartier" = '5'`;
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);

            getMapExpectedParameters['BBOX'] = /769418.61\d+,6275047.74\d+,774121.59\d+,6279234.78\d+/;
            await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);

            // Click on previous button
            getFeatureInfoRequestPromise = atlasPage.waitForGetFeatureInfoRequest();
            getMapPromise = atlasPage.waitForGetMapRequest();

            await atlasPage.atlasPreviousButton.click();
            getFeatureInfoRequest = await getFeatureInfoRequestPromise;
            getMapRequest = await getMapPromise;

            getFeatureInfoExpectedParameters['FILTER'] = `Quartiers_a_Montpellier:"quartier" = '4'`;
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', getFeatureInfoExpectedParameters);

            getMapExpectedParameters['BBOX'] = /764495.97\d+,6272453.77\d+,773901.92\d+,6280827.84\d+/;
            await expectParametersToContain('GetMap', getMapRequest.url(), getMapExpectedParameters);

        });
    });
