// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { getAuthStorageStatePath } from './globals';
import { XmlDocument } from "xmldoc";

test.describe('GetCapabilities Requests - anonymous - @requests @readonly', () => {

    test('WMS 1.3.0 GetCapabilities', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        let xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WMS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.3.0');
        expect(xmlBody.attr).toHaveProperty('xsi:schemaLocation');
        expect(xmlBody.attr['xsi:schemaLocation']).toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension'
        );

        expect(xmlBody.childNamed('Service')?.childNamed('Name')?.val).toBe('WMS');
        expect(xmlBody.childNamed('Service')?.childNamed('OnlineResource')?.attr).toHaveProperty('xlink:href');
        expect(xmlBody.childNamed('Service')?.childNamed('OnlineResource')?.attr['xlink:href']).toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection'
        );
        expect(xmlBody.childNamed('Capability')).not.toBeUndefined();
        const capabilityElem = xmlBody.childNamed('Capability');
        if (capabilityElem !== undefined) {
            expect(capabilityElem.childNamed('Request')).not.toBeUndefined();
            const requestElem = capabilityElem.childNamed('Request');
            if (requestElem !== undefined) {
                expect(requestElem.descendantsNamed('OnlineResource')).toHaveLength(6);
                for(const onlineResource of requestElem.descendantsNamed('OnlineResource')) {
                    expect.soft(onlineResource.attr).toHaveProperty('xlink:href');
                    expect.soft(onlineResource.attr['xlink:href']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection&'
                    );
                }
            }
        }

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Project with config.options.hideProject: "True"
        params.set('project', 'hide_project');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WMS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.3.0');
    });

    test('WMS 1.1.1 GetCapabilities', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WMS',
            VERSION: '1.1.1',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        let xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WMT_MS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.1.1');
        expect(xmlBody.attr).not.toHaveProperty('xsi:schemaLocation');

        expect(xmlBody.childNamed('Service')?.childNamed('Name')?.val).toBe('WMS');
        expect(xmlBody.childNamed('Service')?.childNamed('OnlineResource')?.attr).toHaveProperty('xlink:href');
        expect(xmlBody.childNamed('Service')?.childNamed('OnlineResource')?.attr['xlink:href']).toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection'
        );
        expect(xmlBody.childNamed('Capability')).not.toBeUndefined();
        const capabilityElem = xmlBody.childNamed('Capability');
        if (capabilityElem !== undefined) {
            expect(capabilityElem.childNamed('Request')).not.toBeUndefined();
            const requestElem = capabilityElem.childNamed('Request');
            if (requestElem !== undefined) {
                expect(requestElem.descendantsNamed('OnlineResource')).toHaveLength(6);
                for(const onlineResource of requestElem.descendantsNamed('OnlineResource')) {
                    expect.soft(onlineResource.attr).toHaveProperty('xlink:href');
                    expect.soft(onlineResource.attr['xlink:href']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection&'
                    );
                }
            }
        }

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Project with config.options.hideProject: "True"
        params.set('project', 'hide_project');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WMT_MS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.1.1');
    });

    test('WMS Default GetCapabilities (version 1.3.0)', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WMS',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        let xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WMS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.3.0');
        expect(xmlBody.attr).toHaveProperty('xsi:schemaLocation');
        expect(xmlBody.attr['xsi:schemaLocation']).toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension'
        );

        expect(xmlBody.childNamed('Service')?.childNamed('Name')?.val).toBe('WMS');
        expect(xmlBody.childNamed('Service')?.childNamed('OnlineResource')?.attr).toHaveProperty('xlink:href');
        expect(xmlBody.childNamed('Service')?.childNamed('OnlineResource')?.attr['xlink:href']).toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection'
        );
        expect(xmlBody.childNamed('Capability')).not.toBeUndefined();
        const capabilityElem = xmlBody.childNamed('Capability');
        if (capabilityElem !== undefined) {
            expect(capabilityElem.childNamed('Request')).not.toBeUndefined();
            const requestElem = capabilityElem.childNamed('Request');
            if (requestElem !== undefined) {
                expect(requestElem.descendantsNamed('OnlineResource')).toHaveLength(6);
                for(const onlineResource of requestElem.descendantsNamed('OnlineResource')) {
                    expect.soft(onlineResource.attr).toHaveProperty('xlink:href');
                    expect.soft(onlineResource.attr['xlink:href']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection&'
                    );
                }
            }
        }

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Project with config.options.hideProject: "True"
        params.set('project', 'hide_project');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WMS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.3.0');
    });

    test('WMTS 1.0.0 GetCapabilities', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'cache',
            SERVICE: 'WMTS',
            VERSION: '1.0.0',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        let xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
        expect(xmlBody.attr).toHaveProperty('xsi:schemaLocation');
        expect(xmlBody.attr['xsi:schemaLocation']).not.toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension'
        );

        expect(xmlBody.childNamed('ows:ServiceIdentification')?.childNamed('ows:ServiceType')?.val).toBe('OGC WMTS');
        expect(xmlBody.childNamed('ows:ServiceIdentification')?.childNamed('ows:ServiceTypeVersion')?.val).toBe('1.0.0');

        expect(xmlBody.childNamed('ows:OperationsMetadata')).not.toBeUndefined();
        const operationsMetadataElem = xmlBody.childNamed('ows:OperationsMetadata');
        if (operationsMetadataElem !== undefined) {
            expect(operationsMetadataElem.childrenNamed('ows:Operation')).toHaveLength(2);
            for(const operationElem of operationsMetadataElem.childrenNamed('ows:Operation')) {
                expect(operationElem.descendantsNamed('ows:Get')).toHaveLength(1);
                const getElem = operationElem.descendantsNamed('ows:Get')[0];
                expect(getElem.attr).toHaveProperty('xlink:href');
                expect(getElem.attr['xlink:href']).toContain(
                    '/index.php/lizmap/service?repository=testsrepository&project=cache&'
                );
            }
        }

        expect(xmlBody.childNamed('Contents')).not.toBeUndefined();
        const contentsElem = xmlBody.childNamed('Contents');
        if (contentsElem !== undefined) {
            expect(contentsElem.childrenNamed('Layer')).toHaveLength(1);
            const layerElem = contentsElem.childrenNamed('Layer')[0];
            expect(layerElem.childNamed('ows:Identifier')).not.toBeUndefined();
            expect(layerElem.childNamed('ows:Identifier')?.val).toBe('Quartiers');

            expect(contentsElem.childrenNamed('TileMatrixSet')).toHaveLength(1);
            const tileMatrixSetElem = contentsElem.childrenNamed('TileMatrixSet')[0];
            expect(tileMatrixSetElem.childNamed('ows:Identifier')).not.toBeUndefined();
            expect(tileMatrixSetElem.childNamed('ows:Identifier')?.val).toBe('EPSG:3857');
            expect(tileMatrixSetElem.childrenNamed('TileMatrix')).toHaveLength(17);

            expect(layerElem.childNamed('TileMatrixSetLink')).not.toBeUndefined();
            const tileMatrixSetLinkElem = layerElem.childNamed('TileMatrixSetLink');
            if (tileMatrixSetLinkElem !== undefined) {
                expect(tileMatrixSetLinkElem.childNamed('TileMatrixSet')).not.toBeUndefined();
                expect(tileMatrixSetLinkElem.childNamed('TileMatrixSet')?.val).toBe('EPSG:3857');
                expect(tileMatrixSetLinkElem.descendantsNamed('TileMatrixLimits')).toHaveLength(17);
            }
        }

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Project with config.options.hideProject: "True"
        params.set('project', 'hide_project');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
    });

    test('WMTS Default GetCapabilities (version 1.0.0)', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'cache',
            SERVICE: 'WMTS',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        let xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
        expect(xmlBody.attr).toHaveProperty('xsi:schemaLocation');
        expect(xmlBody.attr['xsi:schemaLocation']).not.toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension'
        );

        expect(xmlBody.childNamed('ows:ServiceIdentification')?.childNamed('ows:ServiceType')?.val).toBe('OGC WMTS');
        expect(xmlBody.childNamed('ows:ServiceIdentification')?.childNamed('ows:ServiceTypeVersion')?.val).toBe('1.0.0');

        expect(xmlBody.childNamed('ows:OperationsMetadata')).not.toBeUndefined();
        const operationsMetadataElem = xmlBody.childNamed('ows:OperationsMetadata');
        if (operationsMetadataElem !== undefined) {
            expect(operationsMetadataElem.childrenNamed('ows:Operation')).toHaveLength(2);
            for(const operationElem of operationsMetadataElem.childrenNamed('ows:Operation')) {
                expect(operationElem.descendantsNamed('ows:Get')).toHaveLength(1);
                const getElem = operationElem.descendantsNamed('ows:Get')[0];
                expect(getElem.attr).toHaveProperty('xlink:href');
                expect(getElem.attr['xlink:href']).toContain(
                    '/index.php/lizmap/service?repository=testsrepository&project=cache&'
                );
            }
        }

        expect(xmlBody.childNamed('Contents')).not.toBeUndefined();
        const contentsElem = xmlBody.childNamed('Contents');
        if (contentsElem !== undefined) {
            expect(contentsElem.childrenNamed('Layer')).toHaveLength(1);
            const layerElem = contentsElem.childrenNamed('Layer')[0];
            expect(layerElem.childNamed('ows:Identifier')).not.toBeUndefined();
            expect(layerElem.childNamed('ows:Identifier')?.val).toBe('Quartiers');

            expect(contentsElem.childrenNamed('TileMatrixSet')).toHaveLength(1);
            const tileMatrixSetElem = contentsElem.childrenNamed('TileMatrixSet')[0];
            expect(tileMatrixSetElem.childNamed('ows:Identifier')).not.toBeUndefined();
            expect(tileMatrixSetElem.childNamed('ows:Identifier')?.val).toBe('EPSG:3857');
            expect(tileMatrixSetElem.childrenNamed('TileMatrix')).toHaveLength(17);

            expect(layerElem.childNamed('TileMatrixSetLink')).not.toBeUndefined();
            const tileMatrixSetLinkElem = layerElem.childNamed('TileMatrixSetLink');
            if (tileMatrixSetLinkElem !== undefined) {
                expect(tileMatrixSetLinkElem.childNamed('TileMatrixSet')).not.toBeUndefined();
                expect(tileMatrixSetLinkElem.childNamed('TileMatrixSet')?.val).toBe('EPSG:3857');
                expect(tileMatrixSetLinkElem.descendantsNamed('TileMatrixLimits')).toHaveLength(17);
            }
        }

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Project with config.options.hideProject: "True"
        params.set('project', 'hide_project');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
    });

    test('WFS 1.0.0 GetCapabilities', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        let xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WFS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
        expect(xmlBody.attr).toHaveProperty('xsi:schemaLocation');
        expect(xmlBody.attr['xsi:schemaLocation']).not.toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension'
        );

        expect(xmlBody.childNamed('Service')?.childNamed('Name')?.val).toBe('WFS');
        expect(xmlBody.childNamed('Capability')).not.toBeUndefined();
        const capabilityElem = xmlBody.childNamed('Capability');
        if (capabilityElem !== undefined) {
            expect(capabilityElem.childNamed('Request')).not.toBeUndefined();
            const requestElem = capabilityElem.childNamed('Request');
            if (requestElem !== undefined) {
                expect(requestElem.descendantsNamed('Get')).toHaveLength(3);
                for(const getElem of requestElem.descendantsNamed('Get')) {
                    expect.soft(getElem.attr).toHaveProperty('onlineResource');
                    expect.soft(getElem.attr['onlineResource']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection'
                    );
                }
                expect(requestElem.descendantsNamed('Post')).toHaveLength(4);
                for(const postElem of requestElem.descendantsNamed('Post')) {
                    expect.soft(postElem.attr).toHaveProperty('onlineResource');
                    expect.soft(postElem.attr['onlineResource']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection'
                    );
                }
            }
        }

        expect(xmlBody.childNamed('FeatureTypeList')).not.toBeUndefined();
        const featureTypeListElem = xmlBody.childNamed('FeatureTypeList');
        if (featureTypeListElem !== undefined) {
            expect(featureTypeListElem.childrenNamed('FeatureType')).toHaveLength(2);
        }

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Project with config.options.hideProject: "True"
        params.set('project', 'hide_project');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WFS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
    });

    test('WFS 1.1.0 GetCapabilities', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WFS',
            VERSION: '1.1.0',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        let xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WFS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.1.0');
        expect(xmlBody.attr).toHaveProperty('xsi:schemaLocation');
        expect(xmlBody.attr['xsi:schemaLocation']).not.toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension'
        );

        expect(xmlBody.childNamed('ows:ServiceIdentification')?.childNamed('ows:ServiceType')?.val).toBe('WFS');
        expect(xmlBody.childNamed('ows:ServiceIdentification')?.childNamed('ows:ServiceTypeVersion')?.val).toBe('1.1.0');

        expect(xmlBody.childNamed('ows:OperationsMetadata')).not.toBeUndefined();
        const operationsMetadataElem = xmlBody.childNamed('ows:OperationsMetadata');
        if (operationsMetadataElem !== undefined) {
            expect(operationsMetadataElem.childrenNamed('ows:Operation')).toHaveLength(4);
            for(const operationElem of operationsMetadataElem.childrenNamed('ows:Operation')) {
                expect(operationElem.descendantsNamed('ows:Get')).toHaveLength(1);
                const getElem = operationElem.descendantsNamed('ows:Get')[0];
                expect(getElem.attr).toHaveProperty('xlink:href');
                expect(getElem.attr['xlink:href']).toContain(
                    '/index.php/lizmap/service?repository=testsrepository&project=selection'
                );
                expect(operationElem.descendantsNamed('ows:Post')).toHaveLength(1);
                const postElem = operationElem.descendantsNamed('ows:Get')[0];
                expect(postElem.attr).toHaveProperty('xlink:href');
                expect(postElem.attr['xlink:href']).toContain(
                    '/index.php/lizmap/service?repository=testsrepository&project=selection'
                );
            }
        }

        expect(xmlBody.childNamed('FeatureTypeList')).not.toBeUndefined();
        const featureTypeListElem = xmlBody.childNamed('FeatureTypeList');
        if (featureTypeListElem !== undefined) {
            expect(featureTypeListElem.childrenNamed('FeatureType')).toHaveLength(2);
        }

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Project with config.options.hideProject: "True"
        params.set('project', 'hide_project');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WFS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.1.0');
    });

    test('WFS Default GetCapabilities (version 1.0.0)', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WFS',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        let xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WFS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
        expect(xmlBody.attr).toHaveProperty('xsi:schemaLocation');
        expect(xmlBody.attr['xsi:schemaLocation']).not.toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension'
        );

        expect(xmlBody.childNamed('Service')?.childNamed('Name')?.val).toBe('WFS');
        expect(xmlBody.childNamed('Capability')).not.toBeUndefined();
        const capabilityElem = xmlBody.childNamed('Capability');
        if (capabilityElem !== undefined) {
            expect(capabilityElem.childNamed('Request')).not.toBeUndefined();
            const requestElem = capabilityElem.childNamed('Request');
            if (requestElem !== undefined) {
                expect(requestElem.descendantsNamed('Get')).toHaveLength(3);
                for(const getElem of requestElem.descendantsNamed('Get')) {
                    expect.soft(getElem.attr).toHaveProperty('onlineResource');
                    expect.soft(getElem.attr['onlineResource']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection'
                    );
                }
                expect(requestElem.descendantsNamed('Post')).toHaveLength(4);
                for(const postElem of requestElem.descendantsNamed('Post')) {
                    expect.soft(postElem.attr).toHaveProperty('onlineResource');
                    expect.soft(postElem.attr['onlineResource']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection'
                    );
                }
            }
        }

        expect(xmlBody.childNamed('FeatureTypeList')).not.toBeUndefined();
        const featureTypeListElem = xmlBody.childNamed('FeatureTypeList');
        if (featureTypeListElem !== undefined) {
            expect(featureTypeListElem.childrenNamed('FeatureType')).toHaveLength(2);
        }

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Project with config.options.hideProject: "True"
        params.set('project', 'hide_project');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WFS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
    });

    test('WFS 1.0.0 Getcapabilities XML', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let data = '<?xml version="1.0" encoding="UTF-8"?>'
        data += '<wfs:GetCapabilities'
        data += '    service="WFS"'
        data += '    version="1.0.0"'
        data += '    xmlns:wfs="http://www.opengis.net/wfs"'
        data += '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
        data += '    xsi:schemaLocation="http://www.opengis.net/wfs/1.0.0 http://schemas.opengis.net/wfs/1.0.0/wfs.xsd">'
        data += '</wfs:GetCapabilities>'
        data += '';
        let response = await request.post(url, {
            headers : {
                'Content-Type':'text/xml; charset=utf-8',
            },
            data: data,
        });
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-store, no-cache, must-revalidate');
        expect(response.headers()).not.toHaveProperty('etag');

        const xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WFS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
        expect(xmlBody.childNamed('Service')?.childNamed('Name')?.val).toBe('WFS');

        expect(xmlBody.childNamed('Capability')).not.toBeUndefined();
        const capabilityElem = xmlBody.childNamed('Capability');
        if (capabilityElem !== undefined) {
            expect(capabilityElem.childNamed('Request')).not.toBeUndefined();
            const requestElem = capabilityElem.childNamed('Request');
            if (requestElem !== undefined) {
                expect(requestElem.descendantsNamed('Get')).toHaveLength(3);
                expect(requestElem.descendantsNamed('Post')).toHaveLength(4);
            }
        }

        expect(xmlBody.childNamed('FeatureTypeList')).not.toBeUndefined();
        const featureTypeListElem = xmlBody.childNamed('FeatureTypeList');
        if (featureTypeListElem !== undefined) {
            expect(featureTypeListElem.childrenNamed('FeatureType')).toHaveLength(2);
        }
    });

    test('WFS 1.1.0 Getcapabilities XML', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let data = '<?xml version="1.0" encoding="UTF-8"?>'
        data += '<wfs:GetCapabilities'
        data += '    service="WFS"'
        data += '    version="1.1.0"'
        data += '    xmlns:wfs="http://www.opengis.net/wfs"'
        data += '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
        data += '    xsi:schemaLocation="http://www.opengis.net/wfs/1.0.0 http://schemas.opengis.net/wfs/1.0.0/wfs.xsd">'
        data += '</wfs:GetCapabilities>'
        data += '';
        let response = await request.post(url, {
            headers : {
                'Content-Type':'text/xml; charset=utf-8',
            },
            data: data,
        });
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-store, no-cache, must-revalidate');
        expect(response.headers()).not.toHaveProperty('etag');

        const xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WFS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.1.0');

        expect(xmlBody.childNamed('ows:ServiceIdentification')?.childNamed('ows:ServiceType')?.val).toBe('WFS');
        expect(xmlBody.childNamed('ows:ServiceIdentification')?.childNamed('ows:ServiceTypeVersion')?.val).toBe('1.1.0');

        expect(xmlBody.childNamed('ows:OperationsMetadata')).not.toBeUndefined();
        const operationsMetadataElem = xmlBody.childNamed('ows:OperationsMetadata');
        if (operationsMetadataElem !== undefined) {
            expect(operationsMetadataElem.childrenNamed('ows:Operation')).toHaveLength(4);
        }

        expect(xmlBody.childNamed('FeatureTypeList')).not.toBeUndefined();
        const featureTypeListElem = xmlBody.childNamed('FeatureTypeList');
        if (featureTypeListElem !== undefined) {
            expect(featureTypeListElem.childrenNamed('FeatureType')).toHaveLength(2);
        }
    });
});

test.describe('GetCapabilities Requests - user_in_group_a - @requests @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('user_in_group_a') });

    test('WMS 1.3.0 GetCapabilities', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        let xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WMS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.3.0');
        expect(xmlBody.attr).toHaveProperty('xsi:schemaLocation');
        expect(xmlBody.attr['xsi:schemaLocation']).toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension'
        );

        expect(xmlBody.childNamed('Service')?.childNamed('Name')?.val).toBe('WMS');
        expect(xmlBody.childNamed('Service')?.childNamed('OnlineResource')?.attr).toHaveProperty('xlink:href');
        expect(xmlBody.childNamed('Service')?.childNamed('OnlineResource')?.attr['xlink:href']).toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection'
        );
        expect(xmlBody.childNamed('Capability')).not.toBeUndefined();
        const capabilityElem = xmlBody.childNamed('Capability');
        if (capabilityElem !== undefined) {
            expect(capabilityElem.childNamed('Request')).not.toBeUndefined();
            const requestElem = capabilityElem.childNamed('Request');
            if (requestElem !== undefined) {
                expect(requestElem.descendantsNamed('OnlineResource')).toHaveLength(6);
                for(const onlineResource of requestElem.descendantsNamed('OnlineResource')) {
                    expect.soft(onlineResource.attr).toHaveProperty('xlink:href');
                    expect.soft(onlineResource.attr['xlink:href']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection&'
                    );
                }
            }
        }

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Project with config.options.hideProject: "True"
        params.set('project', 'hide_project');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WMS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.3.0');
    });
    test('WFS 1.0.0 GetCapabilities', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        let xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WFS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
        expect(xmlBody.attr).toHaveProperty('xsi:schemaLocation');
        expect(xmlBody.attr['xsi:schemaLocation']).not.toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension'
        );

        expect(xmlBody.childNamed('Service')?.childNamed('Name')?.val).toBe('WFS');
        expect(xmlBody.childNamed('Capability')).not.toBeUndefined();
        const capabilityElem = xmlBody.childNamed('Capability');
        if (capabilityElem !== undefined) {
            expect(capabilityElem.childNamed('Request')).not.toBeUndefined();
            const requestElem = capabilityElem.childNamed('Request');
            if (requestElem !== undefined) {
                expect(requestElem.descendantsNamed('Get')).toHaveLength(3);
                for(const getElem of requestElem.descendantsNamed('Get')) {
                    expect.soft(getElem.attr).toHaveProperty('onlineResource');
                    expect.soft(getElem.attr['onlineResource']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection'
                    );
                }
                expect(requestElem.descendantsNamed('Post')).toHaveLength(4);
                for(const postElem of requestElem.descendantsNamed('Post')) {
                    expect.soft(postElem.attr).toHaveProperty('onlineResource');
                    expect.soft(postElem.attr['onlineResource']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection'
                    );
                }
            }
        }

        expect(xmlBody.childNamed('FeatureTypeList')).not.toBeUndefined();
        const featureTypeListElem = xmlBody.childNamed('FeatureTypeList');
        if (featureTypeListElem !== undefined) {
            expect(featureTypeListElem.childrenNamed('FeatureType')).toHaveLength(2);
        }

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Project with config.options.hideProject: "True"
        params.set('project', 'hide_project');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WFS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
    });

});

test.describe('GetCapabilities Requests - admin - @requests @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('admin') });

    test('WMS 1.3.0 GetCapabilities', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        let xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WMS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.3.0');
        expect(xmlBody.attr).toHaveProperty('xsi:schemaLocation');
        expect(xmlBody.attr['xsi:schemaLocation']).toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension'
        );

        expect(xmlBody.childNamed('Service')?.childNamed('Name')?.val).toBe('WMS');
        expect(xmlBody.childNamed('Service')?.childNamed('OnlineResource')?.attr).toHaveProperty('xlink:href');
        expect(xmlBody.childNamed('Service')?.childNamed('OnlineResource')?.attr['xlink:href']).toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection'
        );
        expect(xmlBody.childNamed('Capability')).not.toBeUndefined();
        const capabilityElem = xmlBody.childNamed('Capability');
        if (capabilityElem !== undefined) {
            expect(capabilityElem.childNamed('Request')).not.toBeUndefined();
            const requestElem = capabilityElem.childNamed('Request');
            if (requestElem !== undefined) {
                expect(requestElem.descendantsNamed('OnlineResource')).toHaveLength(6);
                for(const onlineResource of requestElem.descendantsNamed('OnlineResource')) {
                    expect.soft(onlineResource.attr).toHaveProperty('xlink:href');
                    expect.soft(onlineResource.attr['xlink:href']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection&'
                    );
                }
            }
        }

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Project with config.options.hideProject: "True"
        params.set('project', 'hide_project');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WMS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.3.0');
    });
    test('WFS 1.0.0 GetCapabilities', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        let xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WFS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
        expect(xmlBody.attr).toHaveProperty('xsi:schemaLocation');
        expect(xmlBody.attr['xsi:schemaLocation']).not.toContain(
            '/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension'
        );

        expect(xmlBody.childNamed('Service')?.childNamed('Name')?.val).toBe('WFS');
        expect(xmlBody.childNamed('Capability')).not.toBeUndefined();
        const capabilityElem = xmlBody.childNamed('Capability');
        if (capabilityElem !== undefined) {
            expect(capabilityElem.childNamed('Request')).not.toBeUndefined();
            const requestElem = capabilityElem.childNamed('Request');
            if (requestElem !== undefined) {
                expect(requestElem.descendantsNamed('Get')).toHaveLength(3);
                for(const getElem of requestElem.descendantsNamed('Get')) {
                    expect.soft(getElem.attr).toHaveProperty('onlineResource');
                    expect.soft(getElem.attr['onlineResource']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection'
                    );
                }
                expect(requestElem.descendantsNamed('Post')).toHaveLength(4);
                for(const postElem of requestElem.descendantsNamed('Post')) {
                    expect.soft(postElem.attr).toHaveProperty('onlineResource');
                    expect.soft(postElem.attr['onlineResource']).toContain(
                        '/index.php/lizmap/service?repository=testsrepository&project=selection'
                    );
                }
            }
        }

        expect(xmlBody.childNamed('FeatureTypeList')).not.toBeUndefined();
        const featureTypeListElem = xmlBody.childNamed('FeatureTypeList');
        if (featureTypeListElem !== undefined) {
            expect(featureTypeListElem.childrenNamed('FeatureType')).toHaveLength(2);
        }

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Project with config.options.hideProject: "True"
        params.set('project', 'hide_project');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml();
        xmlBody = new XmlDocument(await response.text());
        expect(xmlBody.name).toBe('WFS_Capabilities');
        expect(xmlBody.attr).toHaveProperty('version', '1.0.0');
    });

});
