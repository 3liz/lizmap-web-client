// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
//import { getAuthStorageStatePath } from './globals';
import { parse as parseHtml } from 'node-html-parser';

test.describe('HTML map page Requests - anonymous - @requests @readonly', () => {

    [
        { name: 'selection', title: 'selection' },
        { name: 'atlas_2154', title: 'Atlas 2154' },
    ].forEach(({ name, title }) => {

        test(`Project ${name}`, async({ request }) => {
            let params = new URLSearchParams({
                repository: 'testsrepository',
                project: name,
            });
            let url = `index.php/view/map?${params}`;
            let response = await request.get(url, {});
            // check response
            responseExpect(response).toBeHtml();

            // check headers

            let htmlRoot = parseHtml(await response.text());

            // check head
            let head = htmlRoot.querySelector('head');
            expect(head).not.toBeNull()
            expect(head?.querySelector('title')?.text).toBe(`${title} - Tests repository - Lizmap`)

            // Check meta elements
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
                "og:image": `http://localhost:8130/index.php/view/media/illustration?repository=testsrepository&project=${name}`,
                "og:image:height": "250",
                "og:image:width": "250",
                "og:title": title,
                "theme-color": "#ffffff",
                "viewport": "width=device-width, initial-scale=1, maximum-scale=1",
            });

            // link elements to preload JSON Files
            let preloadJSONs = head?.querySelectorAll('link[rel="preload"][type="application/json"]') ?? [];
            expect(preloadJSONs.length).toBeGreaterThan(0);
            expect(preloadJSONs.length).toBe(2);
            for (const preloadJSON of preloadJSONs) {
                expect(preloadJSON.hasAttribute('crossorigin')).toBe(true);
                expect(preloadJSON.getAttribute('as')).toBe('fetch');
                const href = preloadJSON.getAttribute('href') ?? '';
                expect(href).toMatch(/^\/index\.php\/lizmap\/service\/get.*\?.*/);
                expect(href).toMatch(/repository=testsrepository/);
                expect(href).toMatch(new RegExp(`project=${name}`));
            }

            // link elements to preload XML Files
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
                expect(href).toMatch(new RegExp(`project=${name}`));
            }

            let lizmapVars = head?.querySelector('#lizmap-vars');
            expect(lizmapVars).not.toBeNull();
            expect(lizmapVars?.tagName).toBe('SCRIPT');
            expect(lizmapVars?.getAttribute('type')).toBe('application/json');
            const lizmapVariablesJSON = lizmapVars?.innerText
            expect(lizmapVariablesJSON).toBeDefined();
            const lizmapVariables = JSON.parse(lizmapVariablesJSON ?? '');
            expect(lizmapVariables).toHaveProperty('lizUrls');
            expect(Object.keys(lizmapVariables?.lizUrls ?? {})).toHaveLength(25);
            expect(Object.keys(lizmapVariables?.lizUrls ?? {})).toEqual(expect.arrayContaining([
                'params',
                'config',
                'remoteStorageConfig',
                'keyValueConfig',
                'wms',
                'media',
                'nominatim',
                'ign',
                'edition',
                'editableFeatures',
                'unlinkChild',
                'permalink',
                'dataTables',
                'dataTableLanguage',
                'dataTablesFilteredFeaturesExtent',
                'dataTablesSelectFilteredFeatures',
                'svgSprite',
                'basepath',
                'geobookmark',
                'short_link_permalink',
                'service',
                'featuresDisplayExpression',
                'featuresTooltips',
                'resourceUrlReplacement',
                'webDavUrl',
            ]));
            expect(lizmapVariables).toHaveProperty('lizProj4');

            // check body
            let body = htmlRoot.querySelector('body');
            expect(body).not.toBeNull();
            expect(body?.getAttribute('data-proj4js-lib-path')).toBe('/assets/js/Proj4js/');
            expect(body?.getAttribute('data-lizmap-user-defined-js-count')).toBe('0');

            expect(body?.querySelector('#header')).not.toBeNull();
            expect(body?.querySelector('#header #logo')).not.toBeNull();
            expect(body?.querySelector('#header #title')).not.toBeNull();
            expect(body?.querySelector('#title h1')?.text?.trim()).toBe(title);
            expect(body?.querySelector('#title h2')?.text?.trim()).toBe('Tests repository');
        });

    });

});
