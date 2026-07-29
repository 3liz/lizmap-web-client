// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
//import { getAuthStorageStatePath } from './globals';
import { parse as parseHtml } from 'node-html-parser';

test.describe('HTML map page Requests - anonymous - @requests @readonly', () => {

    test('Project selection', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `index.php/view/map?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeHtml();

        // check headers

        let htmlBody = parseHtml(await response.text());
        let head = htmlBody.querySelector('head');
        expect(head).not.toBeNull()
        expect(head?.querySelector('title')?.text).toBe('selection - Tests repository - Lizmap')
        let metas = head?.querySelectorAll('meta') ?? [];
        expect(metas.length).toBeGreaterThan(0);
        expect(metas.length).toBe(12);
        /** @type {{[key: string]: string|undefined}} */
        let metaValues = {}
        for (const meta of metas) {
            let key;
            if (meta.hasAttribute('http-equiv')) {
                key = meta.getAttribute('http-equiv');
            }
            else if (meta.hasAttribute('property')) {
                key = meta.getAttribute('property');
            }
            else if (meta.hasAttribute('name')) {
                key = meta.getAttribute('name');
            }

            if (key)
                metaValues[key] = meta.getAttribute('content');
        }
        expect(metaValues).toEqual({
            "Revisit-After": "10 days",
            "content-type": "text/html; charset=UTF-8",
            "description": "",
            "keywords": "",
            "msapplication-TileColor": "#ffffff",
            "msapplication-TileImage": "/assets/favicon/ms-icon-144x144.png",
            "og:image": "http://localhost:8130/index.php/view/media/illustration?repository=testsrepository&project=selection",
            "og:image:height": "250",
            "og:image:width": "250",
            "og:title": "selection",
            "theme-color": "#ffffff",
            "viewport": "width=device-width, initial-scale=1, maximum-scale=1",
        });

        let preloadJSONs = head?.querySelectorAll('link[rel="preload"][type="application/json"]') ?? [];
        expect(preloadJSONs.length).toBeGreaterThan(0);
        expect(preloadJSONs.length).toBe(2);
        for (const preloadJSON of preloadJSONs) {
            expect(preloadJSON.hasAttribute('crossorigin')).toBe(true);
            expect(preloadJSON.getAttribute('as')).toBe('fetch');
            const href = preloadJSON.getAttribute('href') ?? '';
            expect(href).toMatch(/^\/index\.php\/lizmap\/service\/get.*\?.*/);
            expect(href).toMatch(/repository=testsrepository/);
            expect(href).toMatch(/project=selection/);
        }

        let preloadXMLs = head?.querySelectorAll('link[rel="preload"][type="application/xml"]') ?? [];
        expect(preloadXMLs.length).toBeGreaterThan(0);
        expect(preloadXMLs.length).toBe(3);
        for (const preloadXML of preloadXMLs) {
            expect(preloadXML.hasAttribute('crossorigin')).toBe(true);
            expect(preloadXML.getAttribute('as')).toBe('fetch');
            const href = preloadXML.getAttribute('href') ?? '';
            expect(href).toMatch(/^\/index\.php\/lizmap\/service\?.*/);
            expect(href).toMatch(/SERVICE=/);
            expect(href).toMatch(/VERSION=/);
            expect(href).toMatch(/REQUEST=/);
            expect(href).toMatch(/repository=testsrepository/);
            expect(href).toMatch(/project=selection/);
        }

        let lizmapVars = head?.querySelector('#lizmap-vars');
        expect(lizmapVars).not.toBeNull();
        expect(lizmapVars?.tagName).toBe('SCRIPT');
        expect(lizmapVars?.getAttribute('type')).toBe('application/json');
        const lizmapVariablesJSON = lizmapVars?.innerText
        expect(lizmapVariablesJSON).toBeDefined();
        const lizmapVariables = JSON.parse(lizmapVariablesJSON ?? '');
        expect(lizmapVariables).toHaveProperty('lizUrls');
        expect(lizmapVariables?.lizUrls).toHaveProperty('params');
        expect(lizmapVariables?.lizUrls).toHaveProperty('config');
        expect(lizmapVariables?.lizUrls).toHaveProperty('remoteStorageConfig');
        expect(lizmapVariables?.lizUrls).toHaveProperty('keyValueConfig');
        expect(lizmapVariables?.lizUrls).toHaveProperty('wms');
        expect(lizmapVariables?.lizUrls).toHaveProperty('media');
        expect(lizmapVariables?.lizUrls).toHaveProperty('nominatim');
        expect(lizmapVariables?.lizUrls).toHaveProperty('ign');
        expect(lizmapVariables?.lizUrls).toHaveProperty('edition');
        expect(lizmapVariables?.lizUrls).toHaveProperty('editableFeatures');
        expect(lizmapVariables?.lizUrls).toHaveProperty('unlinkChild');
        expect(lizmapVariables?.lizUrls).toHaveProperty('permalink');
        expect(lizmapVariables?.lizUrls).toHaveProperty('dataTables');
        expect(lizmapVariables?.lizUrls).toHaveProperty('dataTableLanguage');
        expect(lizmapVariables?.lizUrls).toHaveProperty('dataTablesFilteredFeaturesExtent');
        expect(lizmapVariables?.lizUrls).toHaveProperty('dataTablesSelectFilteredFeatures');
        expect(lizmapVariables?.lizUrls).toHaveProperty('svgSprite');
        expect(lizmapVariables?.lizUrls).toHaveProperty('basepath');
        expect(lizmapVariables?.lizUrls).toHaveProperty('geobookmark');
        expect(lizmapVariables?.lizUrls).toHaveProperty('short_link_permalink');
        expect(lizmapVariables?.lizUrls).toHaveProperty('service');
        expect(lizmapVariables?.lizUrls).toHaveProperty('featuresDisplayExpression');
        expect(lizmapVariables?.lizUrls).toHaveProperty('featuresTooltips');
        expect(lizmapVariables?.lizUrls).toHaveProperty('resourceUrlReplacement');
        expect(lizmapVariables?.lizUrls).toHaveProperty('webDavUrl');
        expect(lizmapVariables).toHaveProperty('lizProj4');
    });

});
