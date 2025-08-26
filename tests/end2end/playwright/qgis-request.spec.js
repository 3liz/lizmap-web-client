// @ts-check
import { test, expect } from '@playwright/test';

test.describe('QGIS Requests @requests @readonly', () => {
    test('WMS Get Legend Graphic JSON', async ({ request }) => {
        // GetLegendGraphic request for a layer with a single symbol
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'layer_legends',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetLegendGraphic',
            LAYER: 'layer_legend_single_symbol',
            STYLE: '',
            EXCEPTIONS: 'application/vnd.ogc.se_inimage',
            FORMAT: 'application/json',
            TRANSPARENT: 'TRUE',
            DPI: '96',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/json');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);
        // check body
        const single = await response.json()
        // check root
        expect(single.nodes).toHaveLength(1)
        expect(single.title).toBe('')
        // check node
        const singleNode = single.nodes[0]
        expect(singleNode.type).toBe('layer')
        expect(singleNode.name).toBe('layer_legend_single_symbol')
        expect(singleNode.title).toBe('layer_legend_single_symbol')
        expect(singleNode.icon).not.toBeUndefined()
        expect(singleNode.symbols).toBeUndefined()

        // GetLegendGraphic request for a layer with categorized symbols
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'layer_legends',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetLegendGraphic',
            LAYER: 'layer_legend_categorized',
            STYLE: '',
            EXCEPTIONS: 'application/vnd.ogc.se_inimage',
            FORMAT: 'application/json',
            TRANSPARENT: 'TRUE',
            DPI: '96',
        });
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/json');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        expect(response.headers()['etag']).not.toBe('');
        expect(response.headers()['etag']).toHaveLength(43);
        expect(response.headers()['etag']).not.toBe(etag);
        // check body
        const categorized = await response.json();
        // check root
        expect(categorized.nodes).toHaveLength(1)
        expect(categorized.title).toBe('')
        // check node
        const categorizedNode = categorized.nodes[0]
        expect(categorizedNode.type).toBe('layer')
        expect(categorizedNode.name).toBe('layer_legend_categorized')
        expect(categorizedNode.title).toBe('layer_legend_categorized')
        expect(categorizedNode.icon).toBeUndefined()
        expect(categorizedNode.symbols).not.toBeUndefined()
        expect(categorizedNode.symbols).toHaveLength(2)

        // GetLegendGraphic request for a group
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'layer_legends',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetLegendGraphic',
            LAYER: 'legend_option_test',
            STYLE: '',
            EXCEPTIONS: 'application/vnd.ogc.se_inimage',
            FORMAT: 'application/json',
            TRANSPARENT: 'TRUE',
            DPI: '96',
        });
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/json');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        expect(response.headers()['etag']).not.toBe('');
        expect(response.headers()['etag']).toHaveLength(43);
        expect(response.headers()['etag']).not.toBe(etag);
        // check body
        const group = await response.json();
        // check root
        expect(group.nodes).toHaveLength(1)
        expect(group.title).toBe('')
        // check node
        const groupNode = group.nodes[0]
        expect(groupNode.type).toBe('group')
        expect(groupNode.name).toBe('legend_option_test')
        expect(groupNode.title).toBe('legend_option_test')
        expect(groupNode.icon).toBeUndefined()
        expect(groupNode.symbols).toBeUndefined()
        expect(groupNode.nodes).not.toBeUndefined()
        expect(groupNode.nodes).toHaveLength(3)

        // GetLegendGraphic request for multiple layers
        // To get layer_legend_single_symbol first, layer_legend_categorized second and legend_option_test third
        // LAYER parameter has to be the inverse: legend_option_test,layer_legend_categorized,layer_legend_single_symbol
        // GetLegendGraphic request for a group
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'layer_legends',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetLegendGraphic',
            LAYER: 'legend_option_test,layer_legend_categorized,layer_legend_single_symbol',
            STYLE: '',
            EXCEPTIONS: 'application/vnd.ogc.se_inimage',
            FORMAT: 'application/json',
            TRANSPARENT: 'TRUE',
            DPI: '96',
        });
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/json');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        expect(response.headers()['etag']).not.toBe('');
        expect(response.headers()['etag']).toHaveLength(43);
        expect(response.headers()['etag']).not.toBe(etag);
        // check body
        const combined = await response.json();
        // check root
        expect(combined.nodes).toHaveLength(3)
        expect(combined.title).toBe('')
        // check first node as single node
        const firstNode = combined.nodes[0]
        expect(firstNode.type).toBe(singleNode.type)
        expect(firstNode.name).toBe(singleNode.name)
        expect(firstNode.title).toBe(singleNode.title)
        expect(firstNode.icon).toBe(singleNode.icon)
        expect(firstNode.symbols).toBe(singleNode.symbols)
        // check second node as categorized node
        const secondNode = combined.nodes[1]
        expect(secondNode.type).toBe(categorizedNode.type)
        expect(secondNode.name).toBe(categorizedNode.name)
        expect(secondNode.title).toBe(categorizedNode.title)
        expect(secondNode.icon).toBe(categorizedNode.icon)
        expect(secondNode.symbols).not.toBeUndefined()
        expect(secondNode.symbols).toMatchObject(categorizedNode.symbols)
        // check third node as group node
        const thirdNode = combined.nodes[2]
        expect(thirdNode.type).toBe(groupNode.type)
        expect(thirdNode.name).toBe(groupNode.name)
        expect(thirdNode.title).toBe(groupNode.title)
        expect(thirdNode.icon).toBe(groupNode.icon)
        expect(thirdNode.symbols).toBe(groupNode.symbols)
        expect(thirdNode.nodes).not.toBeUndefined()
        expect(thirdNode.nodes).toHaveLength(3)
        expect(thirdNode.nodes).toMatchObject(groupNode.nodes)

        // GetLegendGraphic request for multiple layers as POST
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'layer_legends',
        });

        let formData = {
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetLegendGraphic',
            LAYER: 'legend_option_test,layer_legend_categorized,layer_legend_single_symbol',
            STYLE: '',
            EXCEPTIONS: 'application/vnd.ogc.se_inimage',
            FORMAT: 'application/json',
            TRANSPARENT: 'TRUE',
            DPI: '96',
        };
        url = `/index.php/lizmap/service?${params}`;
        response = await request.post(url, {form:formData});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/json');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-store, no-cache, must-revalidate');
        expect(response.headers()).not.toHaveProperty('etag');
        // check body
        const combinedPost = await response.json();
        // check root
        expect(combinedPost.nodes).toHaveLength(3)
    });
});
