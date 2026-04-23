// @ts-check
import { test, expect } from '@playwright/test';
import { checkJson } from './globals';

test.describe('Read short link permalink @requests @read', () => {
    test('Read short link permalink', async({ request }) => {
        let params = new URLSearchParams({
            o:'g',
            id:'h47yokjwuJ4o',
            repository: 'testsrepository',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url);
        const body = await checkJson(response);
        expect(body).toHaveProperty('repository', 'testsrepository');
        expect(body).toHaveProperty('project', 'short_link_permalink');
        expect(body).toHaveProperty('plink');
        expect(body.plink).toHaveProperty('bbox', ["3.772082","43.547726","3.997095","43.652970"]);
        expect(body.plink).toHaveProperty('layers', ["single_wms_lines","single_wms_baselayer"]);
        expect(body.plink).toHaveProperty('opacities', [1, 1]);
        expect(body.plink).toHaveProperty('styles', ["default", "default"]);
    })

    test('Error: missing operation parameter', async({ request }) => {
        let params = new URLSearchParams({
            id:'h47yokjwuJ4o',
            repository: 'testsrepository',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url);
        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Wrong parameters given']);
    })

    test('Error: missing repository parameter', async({ request }) => {
        let params = new URLSearchParams({
            o:'g',
            id:'h47yokjwuJ4o',
            project: 'short_link_permalink'
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url);
        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Wrong parameters given']);
    })

    test('Error: missing project parameter', async({ request }) => {
        let params = new URLSearchParams({
            o:'g',
            id:'h47yokjwuJ4o',
            repository: 'testsrepository'
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url);

        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Wrong parameters given']);
    })

    test('Error: missing id parameter', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url);
        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Wrong parameters given']);
    })

    test('Error: invalid repository parameter', async({ request }) => {
        let params = new URLSearchParams({
            o:'g',
            id:'h47yokjwuJ4o',
            repository: 'testsrepositoryXXX',
            project: 'short_link_permalink'
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url);

        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Wrong parameters given']);
    })


    test('Error: invalid project parameter', async({ request }) => {
        let params = new URLSearchParams({
            o:'g',
            id:'h47yokjwuJ4o',
            repository: 'testsrepository',
            project: 'short_link_permalinkXXX'
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url);

        expect(response.status()).toBe(500);
        expect(response.statusText()).toBe('Internal jelix error');
    })

    test('Error: permalink not found', async({ request }) => {
        let params = new URLSearchParams({
            o:'g',
            id:'XXXXXXXXXX',
            repository: 'testsrepository',
            project: 'short_link_permalink'
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url);

        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['The permalink does not exists']);
    })
})

test.describe('Add short link permalink @requests @write', () => {

    test('Add short link permalink', async({ request }) => {
        // Add a short link permalink
        let params = new URLSearchParams({
            o:'add',
            repository: 'testsrepository',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url, {
            data: {
                permalink: {
                    bbox:["3.764613","43.570735","3.989626","43.675979"],
                    layers:["single_wms_points","single_wms_lines","single_wms_baselayer"],
                    styles:["classified","default","default"],
                    opacities:[1,1,1]
                }
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('permalink', 'L3xLkXFxD3ZB');
    });

    test('Add short link permalink, only bbox', async({ request }) => {
        // Add a short link permalink
        let params = new URLSearchParams({
            o:'add',
            repository: 'testsrepository',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url, {
            data: {
                permalink: {
                    bbox:["3.764613","43.570735","3.989626","43.675979"],
                    layers:[],
                    styles:[],
                    opacities:[]
                }
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('permalink', 'jj9JZG3rqVlY');
    });

    test('Error: missing operation parameter', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url, {
            data: {
                permalink: {
                    bbox:["3.764613","43.570735","3.989626","43.675979"],
                    layers:["single_wms_points","single_wms_lines","single_wms_baselayer"],
                    styles:["classified","default","default"],
                    opacities:[1,1,1]
                }
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Wrong parameters given']);
    });

    test('Error: missing repository parameter', async({ request }) => {
        let params = new URLSearchParams({
            o: 'add',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url, {
            data: {
                permalink: {
                    bbox:["3.764613","43.570735","3.989626","43.675979"],
                    layers:["single_wms_points","single_wms_lines","single_wms_baselayer"],
                    styles:["classified","default","default"],
                    opacities:[1,1,1]
                }
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Wrong parameters given']);
    });

    test('Error: missing project parameter', async({ request }) => {
        let params = new URLSearchParams({
            o: 'add',
            repository: 'testsrepository',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url, {
            data: {
                permalink: {
                    bbox:["3.764613","43.570735","3.989626","43.675979"],
                    layers:["single_wms_points","single_wms_lines","single_wms_baselayer"],
                    styles:["classified","default","default"],
                    opacities:[1,1,1]
                }
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Wrong parameters given']);
    });

    test('Error: invalid repository', async({ request }) => {
        let params = new URLSearchParams({
            o: 'add',
            repository: 'testsrepositoryXXX',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url, {
            data: {
                permalink: {
                    bbox:["3.764613","43.570735","3.989626","43.675979"],
                    layers:["single_wms_points","single_wms_lines","single_wms_baselayer"],
                    styles:["classified","default","default"],
                    opacities:[1,1,1]
                }
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Wrong parameters given']);
    });

    test('Error: invalid project', async({ request }) => {
        let params = new URLSearchParams({
            o: 'add',
            repository: 'testsrepository',
            project: 'short_link_permalinkXXX',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url, {
            data: {
                permalink: {
                    bbox:["3.764613","43.570735","3.989626","43.675979"],
                    layers:["single_wms_points","single_wms_lines","single_wms_baselayer"],
                    styles:["classified","default","default"],
                    opacities:[1,1,1]
                }
            }
        });

        expect(response.status()).toBe(500);
        expect(response.statusText()).toBe('Internal jelix error');
    });

    test('Error: missing bounding box parameter', async({ request }) => {
        let params = new URLSearchParams({
            o: 'add',
            repository: 'testsrepository',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url, {
            data: {
                permalink: {
                    layers:["single_wms_points","single_wms_lines","single_wms_baselayer"],
                    styles:["classified","default","default"],
                    opacities:[1,1,1]
                }
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Invalid bounding box']);
    });

    test('Error: invalid bounding box parameter', async({ request }) => {
        let params = new URLSearchParams({
            o: 'add',
            repository: 'testsrepository',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url, {
            data: {
                permalink: {
                    bbox:["3.764613","43.570735","3.989626"],
                    layers:["single_wms_points","single_wms_lines","single_wms_baselayer"],
                    styles:["classified","default","default"],
                    opacities:[1,1,1]
                }
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Invalid bounding box']);
    });

    test('Error: missing style/opacities parameter when layers parameter is passed', async({ request }) => {
        let params = new URLSearchParams({
            o: 'add',
            repository: 'testsrepository',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url, {
            data: {
                permalink: {
                    bbox:["3.764613","43.570735","3.989626","43.675979"],
                    layers:["single_wms_points","single_wms_lines","single_wms_baselayer"],
                    opacities:[1,1,1]
                }
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Wrong parameters given']);
    });

    test('Error: opacities/styles parameter leght not equal to layers parameter length', async({ request }) => {
        let params = new URLSearchParams({
            o: 'add',
            repository: 'testsrepository',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url, {
            data: {
                permalink: {
                    bbox:["3.764613","43.570735","3.989626","43.675979"],
                    layers:["single_wms_points","single_wms_lines","single_wms_baselayer"],
                    styles:[''],
                    opacities:[1,1,1]
                }
            }
        });

        const body = await checkJson(response);
        expect(body).toHaveProperty('error', ['Wrong parameters given']);
    });
});
