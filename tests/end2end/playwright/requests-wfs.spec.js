// @ts-check
import { test, expect } from '@playwright/test';

test.describe('WFS Requests @requests @readonly', () => {
    test('WFS Getcapabilities', async({ request }) => {
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
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('text/xml; charset=utf-8');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        // check body
        let body = await response.text();
        expect(body).toContain('WFS_Capabilities');
        expect(body).toContain('version="1.0.0"');

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
        url = `/index.php/lizmap/service?${params}`;response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('text/xml; charset=utf-8');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        expect(response.headers()['etag']).not.toBe(etag);

        // check body
        body = await response.text();
        expect(body).toContain('WFS_Capabilities');
        expect(body).toContain('version="1.0.0"');
    });

    test('WFS Getcapabilities 1.1.0', async({ request }) => {
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
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('text/xml; charset=utf-8');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        // check body
        let body = await response.text();
        expect(body).toContain('WFS_Capabilities');
        expect(body).toContain('version="1.1.0"');

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
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('text/xml; charset=utf-8');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        expect(response.headers()['etag']).not.toBe(etag);

        // check body
        body = await response.text();
        expect(body).toContain('WFS_Capabilities');
        expect(body).toContain('version="1.1.0"');
    });

    test('WFS Getcapabilities XML', async({ request }) => {
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
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('text/xml; charset=utf-8');

        // check body
        let body = await response.text();
        expect(body).toContain('WFS_Capabilities');
        expect(body).toContain('version="1.0.0"');
    });

    test('WFS Getcapabilities no version parameter authorized', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WFS',
            REQUEST: 'GetCapabilities',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('text/xml; charset=utf-8');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        const etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(43);

        // check body
        let body = await response.text();
        expect(body).toContain('WFS_Capabilities');
        expect(body).toContain('version="1.0.0"');

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
        url = `/index.php/lizmap/service?${params}`;response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('text/xml; charset=utf-8');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('etag');
        expect(response.headers()['etag']).not.toBe(etag);

        // check body
        body = await response.text();
        expect(body).toContain('WFS_Capabilities');
        expect(body).toContain('version="1.0.0"');
    });

    test('WFS DescribeFeatureType', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'DescribeFeatureType',
            TYPENAME: 'selection_polygon',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('text/xml; charset=utf-8');

        // check body
        let body = await response.text();
        expect(body).toContain('schema');
        expect(body).toContain('complexType');
        expect(body).toContain('selection_polygonType');

        // Doing a POST request with the same parameters should return the same body
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        url = `/index.php/lizmap/service?${params}`;
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'DescribeFeatureType',
                TYPENAME: 'selection_polygon',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('text/xml; charset=utf-8');

        // check body
        body = await response.text();
        expect(body).toContain('schema');
        expect(body).toContain('complexType');
        expect(body).toContain('selection_polygonType');
    });

    test('WFS DescribeFeatureType JSON', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'DescribeFeatureType',
            TYPENAME: 'selection_polygon',
            OUTPUTFORMAT: 'JSON',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('name', 'selection_polygon');
        expect(body).toHaveProperty('aliases');
        expect(body).toHaveProperty('defaults');
        expect(body).toHaveProperty('types');
        expect(body).toHaveProperty('columns');
        expect(body.types).toHaveProperty('id', 'int');
        expect(body.types).toHaveProperty('geometry', 'gml:PolygonPropertyType');
    });

    test('WFS GetFeature TYPENAME', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        // check bbox
        expect(feature).toHaveProperty('bbox');
        expect(feature.bbox).toHaveLength(4); // xmin, ymin, xmax, ymax
        expect(feature.bbox[0]).not.toBeNaN();
        expect(feature.bbox[1]).not.toBeNaN();
        expect(feature.bbox[2]).not.toBeNaN();
        expect(feature.bbox[3]).not.toBeNaN();
        expect(feature.bbox[0]).toBeLessThan(feature.bbox[2]);
        expect(feature.bbox[1]).toBeLessThan(feature.bbox[3]);
        // check properties and geometry
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
        expect(feature).toHaveProperty('geometry');
        expect(feature.geometry).toHaveProperty('type', 'Polygon');
        expect(feature.geometry).toHaveProperty('coordinates');
        let coordinates = feature.geometry.coordinates;
        expect(coordinates).toHaveLength(1);
        expect(coordinates[0]).toHaveLength(5);
        expect(coordinates[0][0]).toHaveLength(2);
        expect(coordinates[0][1]).toHaveLength(2);
        expect(coordinates[0][2]).toHaveLength(2);
        expect(coordinates[0][3]).toHaveLength(2);
        expect(coordinates[0][4]).toHaveLength(2);

        // Request GML2
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GML2',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('text/xml');
        expect(response.headers()['content-type']).toContain('subtype=gml/2.1.2');

        // check body
        body = await response.text();
        expect(body).toContain('wfs:FeatureCollection');
        expect(body).toContain('gml:featureMember');
        expect(body).toContain('qgs:selection_polygon');
        expect(body).toContain('<qgs:id>1</qgs:id>');
        expect(body).toContain('gml:boundedBy');
        expect(body).toContain('gml:Box');
        expect(body).toContain('gml:coordinates');
        expect(body).toContain('qgs:geometry');
        expect(body).toContain('Polygon');
        expect(body).toContain('outerBoundaryIs');
        expect(body).toContain('LinearRing');
        expect(body).toContain('coordinates');

        // Request GML3
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GML3',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('text/xml');
        expect(response.headers()['content-type']).toContain('subtype=gml/3.1.1');

        // check body
        body = await response.text();
        expect(body).toContain('wfs:FeatureCollection');
        expect(body).toContain('gml:featureMember');
        expect(body).toContain('qgs:selection_polygon');
        expect(body).toContain('<qgs:id>1</qgs:id>');
        expect(body).toContain('gml:boundedBy');
        expect(body).toContain('gml:Envelope');
        expect(body).toContain('gml:lowerCorner');
        expect(body).toContain('gml:upperCorner');
        expect(body).toContain('qgs:geometry');
        expect(body).toContain('Polygon');
        expect(body).toContain('exterior');
        expect(body).toContain('LinearRing');
        expect(body).toContain('posList');
    });

    test('WFS GetFeature TYPENAME && MAXFEATURES', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
                MAXFEATURES: 1,
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('bbox');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
        expect(feature).toHaveProperty('geometry');
        expect(feature.geometry).toHaveProperty('type', 'Polygon');
        expect(feature.geometry).toHaveProperty('coordinates');
        let coordinates = feature.geometry.coordinates;
        expect(coordinates).toHaveLength(1);
        expect(coordinates[0]).toHaveLength(5);

        // With STARTINDEX
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
                MAXFEATURES: 1,
                STARTINDEX: 1,

            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.2');
        expect(feature).toHaveProperty('bbox');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 2);
        expect(feature).toHaveProperty('geometry');
        expect(feature.geometry).toHaveProperty('type', 'Polygon');
        expect(feature.geometry).toHaveProperty('coordinates');
        coordinates = feature.geometry.coordinates;
        expect(coordinates).toHaveLength(1);
        expect(coordinates[0]).toHaveLength(5);
    });

    test('WFS GetFeature TYPENAME && GEOMETRYNAME', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        // check bbox
        expect(feature).toHaveProperty('bbox');
        expect(feature.bbox).toHaveLength(4); // xmin, ymin, xmax, ymax
        // check properties and geometry
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
        expect(feature).toHaveProperty('geometry');
        expect(feature.geometry).toHaveProperty('type', 'Polygon');
        expect(feature.geometry).toHaveProperty('coordinates');
        let coordinates = feature.geometry.coordinates;
        expect(coordinates).toHaveLength(1);
        expect(coordinates[0]).toHaveLength(5);
        const ref_coordinates = [...coordinates];

        // With NONE
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
                GEOMETRYNAME: 'NONE',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).not.toHaveProperty('bbox');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
        expect(feature).toHaveProperty('geometry');
        expect(feature.geometry).toBeNull();

        // With CENTROID
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
                GEOMETRYNAME: 'CENTROID',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('bbox');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
        expect(feature).toHaveProperty('geometry');
        expect(feature.geometry).toHaveProperty('type', 'Point');
        expect(feature.geometry).toHaveProperty('coordinates');
        coordinates = feature.geometry.coordinates;
        expect(coordinates).toHaveLength(2);

        // With EXTENT
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
                GEOMETRYNAME: 'EXTENT',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('bbox');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
        expect(feature).toHaveProperty('geometry');
        expect(feature.geometry).toHaveProperty('type', 'Polygon');
        expect(feature.geometry).toHaveProperty('coordinates');
        coordinates = feature.geometry.coordinates;
        expect(coordinates).toHaveLength(1);
        expect(coordinates[0]).toHaveLength(5);
        expect(coordinates[0][0]).toHaveLength(2);
        expect(coordinates[0][0][0]).not.toBe(ref_coordinates[0][0][0]);
        expect(coordinates[0][0][1]).not.toBe(ref_coordinates[0][0][1]);
        expect(coordinates[0][1]).toHaveLength(2);
        expect(coordinates[0][1][0]).not.toBe(ref_coordinates[0][1][0]);
        expect(coordinates[0][1][1]).not.toBe(ref_coordinates[0][1][1]);
        expect(coordinates[0][2]).toHaveLength(2);
        expect(coordinates[0][2][0]).not.toBe(ref_coordinates[0][2][0]);
        expect(coordinates[0][2][1]).not.toBe(ref_coordinates[0][2][1]);
        expect(coordinates[0][3]).toHaveLength(2);
        expect(coordinates[0][3][0]).not.toBe(ref_coordinates[0][3][0]);
        expect(coordinates[0][3][1]).not.toBe(ref_coordinates[0][3][1]);
        expect(coordinates[0][4]).toHaveLength(2);
        expect(coordinates[0][4][0]).not.toBe(ref_coordinates[0][4][0]);
        expect(coordinates[0][4][1]).not.toBe(ref_coordinates[0][4][1]);
    });

    test('WFS GetFeature TYPENAME && GEOMETRYNAME && FORCE_QGIS', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        // check bbox
        expect(feature).toHaveProperty('bbox');
        expect(feature.bbox).toHaveLength(4); // xmin, ymin, xmax, ymax
        // check properties and geometry
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
        expect(feature).toHaveProperty('geometry');
        expect(feature.geometry).toHaveProperty('type', 'Polygon');
        expect(feature.geometry).toHaveProperty('coordinates');
        let coordinates = feature.geometry.coordinates;
        expect(coordinates).toHaveLength(1);
        expect(coordinates[0]).toHaveLength(5);
        const ref_coordinates = [...coordinates];

        // With FORCE_QGIS
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
                FORCE_QGIS: 1,
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('bbox');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
        expect(feature).toHaveProperty('geometry');
        expect(feature.geometry).toHaveProperty('type', 'Polygon');
        expect(feature.geometry).toHaveProperty('coordinates');
        coordinates = feature.geometry.coordinates;
        expect(coordinates).toHaveLength(1);
        expect(coordinates[0]).toHaveLength(5);
        expect(coordinates[0][0]).toHaveLength(2);
        expect(coordinates[0][0][0]).toBeCloseTo(ref_coordinates[0][0][0]);
        expect(coordinates[0][0][1]).toBeCloseTo(ref_coordinates[0][0][1]);
        expect(coordinates[0][1]).toHaveLength(2);
        expect(coordinates[0][1][0]).toBeCloseTo(ref_coordinates[0][1][0]);
        expect(coordinates[0][1][1]).toBeCloseTo(ref_coordinates[0][1][1]);
        expect(coordinates[0][2]).toHaveLength(2);
        expect(coordinates[0][2][0]).toBeCloseTo(ref_coordinates[0][2][0]);
        expect(coordinates[0][2][1]).toBeCloseTo(ref_coordinates[0][2][1]);
        expect(coordinates[0][3]).toHaveLength(2);
        expect(coordinates[0][3][0]).toBeCloseTo(ref_coordinates[0][3][0]);
        expect(coordinates[0][3][1]).toBeCloseTo(ref_coordinates[0][3][1]);
        expect(coordinates[0][4]).toHaveLength(2);
        expect(coordinates[0][4][0]).toBeCloseTo(ref_coordinates[0][4][0]);
        expect(coordinates[0][4][1]).toBeCloseTo(ref_coordinates[0][4][1]);

        // With NONE && FORCE_QGIS
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
                GEOMETRYNAME: 'NONE',
                FORCE_QGIS: 1,
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).not.toHaveProperty('bbox');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
        expect(feature).toHaveProperty('geometry');
        expect(feature.geometry).toBeNull();

        // With CENTROID
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
                GEOMETRYNAME: 'CENTROID',
                FORCE_QGIS: 1,
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).not.toHaveProperty('bbox'); // QGIS Server does not provide bbox for point
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
        expect(feature).toHaveProperty('geometry');
        expect(feature.geometry).toHaveProperty('type', 'Point');
        expect(feature.geometry).toHaveProperty('coordinates');
        coordinates = feature.geometry.coordinates;
        expect(coordinates).toHaveLength(2);

        // With EXTENT
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
                GEOMETRYNAME: 'EXTENT',
                FORCE_QGIS: 1,
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('bbox');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
        expect(feature).toHaveProperty('geometry');
        expect(feature.geometry).toHaveProperty('type', 'Polygon');
        expect(feature.geometry).toHaveProperty('coordinates');
        coordinates = feature.geometry.coordinates;
        expect(coordinates).toHaveLength(1);
        expect(coordinates[0]).toHaveLength(5);
        expect(coordinates[0][0]).toHaveLength(2);
        expect(coordinates[0][0][0]).not.toBe(ref_coordinates[0][0][0]);
        expect(coordinates[0][0][1]).not.toBe(ref_coordinates[0][0][1]);
        expect(coordinates[0][1]).toHaveLength(2);
        expect(coordinates[0][1][0]).not.toBe(ref_coordinates[0][1][0]);
        expect(coordinates[0][1][1]).not.toBe(ref_coordinates[0][1][1]);
        expect(coordinates[0][2]).toHaveLength(2);
        expect(coordinates[0][2][0]).not.toBe(ref_coordinates[0][2][0]);
        expect(coordinates[0][2][1]).not.toBe(ref_coordinates[0][2][1]);
        expect(coordinates[0][3]).toHaveLength(2);
        expect(coordinates[0][3][0]).not.toBe(ref_coordinates[0][3][0]);
        expect(coordinates[0][3][1]).not.toBe(ref_coordinates[0][3][1]);
        expect(coordinates[0][4]).toHaveLength(2);
        expect(coordinates[0][4][0]).not.toBe(ref_coordinates[0][4][0]);
        expect(coordinates[0][4][1]).not.toBe(ref_coordinates[0][4][1]);
    });

    test('WFS GetFeature TYPENAME && BBOX', async({ request }) => {
        // if no SRSNAME is provided, the BBOX is assumed to be in the layer SRS
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                BBOX: '160786,900949,186133,925344',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
    });

    test('WFS GetFeature TYPENAME && BBOX && SRSNAME', async({ request }) => {
        // layer SRS
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                BBOX: '160786,900949,186133,925344',
                SRSNAME: 'EPSG:2154',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);

        // Web Mercator
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                BBOX: '-72399,-13474,-46812,14094',
                SRSNAME: 'EPSG:3857',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
    });

    test('WFS GetFeature TYPENAME && BBOX && SRSNAME && FORCE_QGIS', async({ request }) => {
        // layer SRS
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                BBOX: '160786,900949,186133,925344',
                SRSNAME: 'EPSG:2154',
                OUTPUTFORMAT: 'GeoJSON',
                FORCE_QGIS: 1,
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);

        // Web Mercator
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                BBOX: '-72399,-13474,-46812,14094',
                SRSNAME: 'EPSG:3857',
                OUTPUTFORMAT: 'GeoJSON',
                FORCE_QGIS: 1,
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
    });

    test('WFS GetFeature TYPENAME && EXP_FILTER', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                EXP_FILTER: '$id IN (1)',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);

        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                EXP_FILTER: '"id" IN (2)',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.2');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 2);
    });

    test('WFS GetFeature TYPENAME && EXP_FILTER && BBOX', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                EXP_FILTER: '$id IN (1)',
                BBOX: '160786,900949,186133,925344',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);

        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                EXP_FILTER: '"id" IN (2)',
                BBOX: '160786,900949,186133,925344',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });

    test('WFS GetFeature TYPENAME && EXP_FILTER && BBOX && FORCE_QGIS', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                EXP_FILTER: '$id IN (1)',
                BBOX: '160786,900949,186133,925344',
                OUTPUTFORMAT: 'GeoJSON',
                FORCE_QGIS: 1,
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);

        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                EXP_FILTER: '"id" IN (2)',
                BBOX: '160786,900949,186133,925344',
                OUTPUTFORMAT: 'GeoJSON',
                FORCE_QGIS: 1,
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });

    test('WFS GetFeature TYPENAME && EXP_FILTER && BBOX && SRSNAME', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                EXP_FILTER: '$id IN (1)',
                BBOX: '160786,900949,186133,925344',
                SRSNAME: 'EPSG:2154',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);

        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                EXP_FILTER: '"id" IN (2)',
                BBOX: '160786,900949,186133,925344',
                SRSNAME: 'EPSG:2154',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);

        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                EXP_FILTER: '$id IN (1)',
                BBOX: '-72399,-13474,-46812,14094',
                SRSNAME: 'EPSG:3857',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);

        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                EXP_FILTER: '"id" IN (2)',
                BBOX: '-72399,-13474,-46812,14094',
                SRSNAME: 'EPSG:3857',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });

    test('WFS GetFeature FEATUREID', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                FEATUREID: 'selection_polygon.1',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
    });

    test('WFS GetFeature FEATUREID && BBOX', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                FEATUREID: 'selection_polygon.1',
                BBOX: '160786,900949,186133,925344',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);

        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                FEATUREID: 'selection_polygon.2',
                BBOX: '160786,900949,186133,925344',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });

    test('WFS GetFeature FEATUREID && BBOX && FORCE_QGIS', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                FEATUREID: 'selection_polygon.1',
                BBOX: '160786,900949,186133,925344',
                OUTPUTFORMAT: 'GeoJSON',
                FORCE_QGIS: 1,
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);

        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                FEATUREID: 'selection_polygon.2',
                BBOX: '160786,900949,186133,925344',
                OUTPUTFORMAT: 'GeoJSON',
                FORCE_QGIS: 1,
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });

    test('WFS GetFeature FEATUREID && BBOX && SRSNAME', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                FEATUREID: 'selection_polygon.1',
                BBOX: '160786,900949,186133,925344',
                SRSNAME: 'EPSG:2154',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);

        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                FEATUREID: 'selection_polygon.2',
                BBOX: '160786,900949,186133,925344',
                SRSNAME: 'EPSG:2154',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);

        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                FEATUREID: 'selection_polygon.1',
                BBOX: '-72399,-13474,-46812,14094',
                SRSNAME: 'EPSG:3857',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);

        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                FEATUREID: 'selection_polygon.2',
                BBOX: '-72399,-13474,-46812,14094',
                SRSNAME: 'EPSG:3857',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });

    test('WFS GetFeature XML', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let data = '<?xml version="1.0" encoding="UTF-8"?>'
        data += '<wfs:GetFeature'
        data += '    service="WFS"'
        data += '    version="1.0.0"'
        data += '    outputFormat="GeoJSON"'
        data += '    xmlns:wfs="http://www.opengis.net/wfs"'
        data += '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
        data += '    xsi:schemaLocation="http://www.opengis.net/wfs/1.0.0 http://schemas.opengis.net/wfs/1.0.0/wfs.xsd">'
        data += '    <wfs:Query typeName="selection_polygon"/>'
        data += '</wfs:GetFeature>'
        data += '';
        let response = await request.post(url, {
            headers : {
                'Content-Type':'text/xml; charset=utf-8',
            },
            data: data,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(2);
        let feature = body.features[0];
        expect(feature).toHaveProperty('type', 'Feature');
        expect(feature).toHaveProperty('id', 'selection_polygon.1');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('id', 1);
    });
});

test.describe('WFS Requests filter_layer_by_user @requests @readonly ', () => {
    test('WFS GetFeature blue_filter_layer_by_user for anonymous', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_by_user',
        });
        let url = `/index.php/lizmap/service?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {};
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'blue_filter_layer_by_user',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });

    test('WFS GetFeature blue_filter_layer_by_user for user_in_group_a', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_by_user',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let headers = {
            authorization: "Basic " + btoa("user_in_group_a:admin")
        };
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'blue_filter_layer_by_user',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        expect(body.features[0]).toHaveProperty('properties');
        expect(body.features[0].properties).toHaveProperty('gid', 2);

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        expect(body.features[0]).toHaveProperty('properties');
        expect(body.features[0].properties).toHaveProperty('gid', 2);
    });

    test('WFS GetFeature blue_filter_layer_by_user for user_in_group_b', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_by_user',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let headers = {
            authorization: "Basic " + btoa("user_in_group_b:admin")
        };
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'blue_filter_layer_by_user',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        expect(body.features[0]).toHaveProperty('properties');
        expect(body.features[0].properties).toHaveProperty('gid', 2);

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(1);
        expect(body.features[0]).toHaveProperty('properties');
        expect(body.features[0].properties).toHaveProperty('gid', 2);
    });

    test('WFS GetFeature blue_filter_layer_by_user for admin', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_by_user',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let headers = {
            authorization: "Basic " + btoa("admin:admin")
        };
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'blue_filter_layer_by_user',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(3);

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(3);
    });
});

test.describe('WFS Requests filter_layer_data_by_polygon_for_groups @requests @readonly ', () => {

    test('WFS GetFeature shop_bakery_pg for anonymous', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_data_by_polygon_for_groups',
        });
        let url = `/index.php/lizmap/service?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {};
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'shop_bakery_pg',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });

    test('WFS GetFeature shop_bakery_pg for user_in_group_a', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_data_by_polygon_for_groups',
        });
        let url = `/index.php/lizmap/service?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {
            authorization: "Basic " + btoa("user_in_group_a:admin")
        };
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'shop_bakery_pg',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(4);
        /** @type {[{properties:{id: number}}]} */
        let features = body.features;
        expect(features.map(feat => feat.properties.id)).toEqual(
            expect.arrayContaining([2,9,18,25])
        );

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(4);
        /** @type {[{properties:{id: number}}]} */
        features = body.features;
        expect(features.map(feat => feat.properties.id)).toEqual(
            expect.arrayContaining([2,9,18,25])
        );
    });

    test('WFS GetFeature shop_bakery_pg for admin', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_data_by_polygon_for_groups',
        });
        let url = `/index.php/lizmap/service?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {
            authorization: "Basic " + btoa("admin:admin")
        };
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'shop_bakery_pg',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(17);
        /** @type {[{properties:{id: number}}]} */
        let features = body.features;
        expect(features.map(feat => feat.properties.id)).toEqual(
            expect.arrayContaining(
                [2,3,4,5,8,9,11,12,13,14,16,18,19,21,23,24,25]
            )
        );

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(17);
        /** @type {[{properties:{id: number}}]} */
        features = body.features;
        expect(features.map(feat => feat.properties.id)).toEqual(
            expect.arrayContaining(
                [2,3,4,5,8,9,11,12,13,14,16,18,19,21,23,24,25]
            )
        );
    });

    test('WFS GetFeature shop_bakery for anonymous', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_data_by_polygon_for_groups',
        });
        let url = `/index.php/lizmap/service?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {};
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'shop_bakery',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });

    test('WFS GetFeature shop_bakery for user_in_group_a', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_data_by_polygon_for_groups',
        });
        let url = `/index.php/lizmap/service?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {
            authorization: "Basic " + btoa("user_in_group_a:admin")
        };
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'shop_bakery',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(5);
        /** @type {[{properties:{id: number}}]} */
        let features = body.features;
        expect(features.map(feat => feat.properties.id)).toEqual(
            expect.arrayContaining([16,103,119,163,168])
        );

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(5);
        /** @type {[{properties:{id: number}}]} */
        features = body.features;
        expect(features.map(feat => feat.properties.id)).toEqual(
            expect.arrayContaining([16,103,119,163,168])
        );
    });

    test('WFS GetFeature shop_bakery for admin', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_data_by_polygon_for_groups',
        });
        let url = `/index.php/lizmap/service?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {
            authorization: "Basic " + btoa("admin:admin")
        };
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'shop_bakery',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(25);
        /** @type {[{properties:{id: number}}]} */
        let features = body.features;
        expect(features.map(feat => feat.properties.id)).toEqual(
            expect.arrayContaining([
                1,16,68,69,73,79,99,102,103,119,126,140,143,151,
                155,157,158,163,168,173,174,181,195,197,199,
            ])
        );

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(25);
        /** @type {[{properties:{id: number}}]} */
        features = body.features;
        expect(features.map(feat => feat.properties.id)).toEqual(
            expect.arrayContaining([
                1,16,68,69,73,79,99,102,103,119,126,140,143,151,
                155,157,158,163,168,173,174,181,195,197,199,
            ])
        );
    });

    test('WFS GetFeature townhalls_EPSG2154 for anonymous', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_data_by_polygon_for_groups',
        });
        let url = `/index.php/lizmap/service?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {};
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'townhalls_EPSG2154',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(0);
    });

    test('WFS GetFeature townhalls_EPSG2154 for user_in_group_a', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_data_by_polygon_for_groups',
        });
        let url = `/index.php/lizmap/service?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {
            authorization: "Basic " + btoa("user_in_group_a:admin")
        };
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'townhalls_EPSG2154',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(4);
        /** @type {[{properties:{fid: number}}]} */
        let features = body.features;
        expect(features.map(feat => feat.properties.fid)).toEqual(
            expect.arrayContaining([2,11,15,25])
        );

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(4);
        /** @type {[{properties:{fid: number}}]} */
        features = body.features;
        expect(features.map(feat => feat.properties.fid)).toEqual(
            expect.arrayContaining([2,11,15,25])
        );
    });

    test('WFS GetFeature townhalls_EPSG2154 for admin', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_data_by_polygon_for_groups',
        });
        let url = `/index.php/lizmap/service?${params}`;
        /** @type {{[key: string]: string}} */
        let headers = {
            authorization: "Basic " + btoa("admin:admin")
        };
        /** @type {{[key: string]: string | number | boolean}} */
        let form = {
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'GetFeature',
            TYPENAME: 'townhalls_EPSG2154',
            OUTPUTFORMAT: 'GeoJSON',
        };
        let response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        let body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(17);
        /** @type {[{properties:{fid: number}}]} */
        let features = body.features;
        expect(features.map(feat => feat.properties.fid)).toEqual(
            expect.arrayContaining([0,2,3,5,8,10,11,14,15,16,18,19,20,21,22,25,26])
        );

        form['FORCE_QGIS'] = 1;
        response = await request.post(url, {
            headers: headers,
            form: form,
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.geo+json');

        // check body
        body = await response.json();
        expect(body).toHaveProperty('type', 'FeatureCollection');
        expect(body).toHaveProperty('features');
        expect(body.features).toHaveLength(17);
        /** @type {[{properties:{fid: number}}]} */
        features = body.features;
        expect(features.map(feat => feat.properties.fid)).toEqual(
            expect.arrayContaining([0,2,3,5,8,10,11,14,15,16,18,19,20,21,22,25,26])
        );
    });
});

test.describe('WFS Requests @wfsOutputExtension @readonly ', () => {
    test('WFS GetFeature CSV', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'CSV',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('text/csv');
        // check body
        let body = await response.text();
        expect(body).toContain('gml_id,id');
        expect(body).toContain('selection_polygon.1,1');
        expect(body).toContain('selection_polygon.2,2');
    });

    test('WFS GetFeature KML', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                VERSION: '1.0.0',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'KML',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toContain('application/vnd.google-earth.kml+xml');
        // check body
        let body = await response.text();
        expect(body).toContain('Folder');
        expect(body).toContain('Placemark');
        expect(body).toContain('<SimpleData name="gml_id">selection_polygon.1</SimpleData>');
        expect(body).toContain('<SimpleData name="gml_id">selection_polygon.2</SimpleData>');
    });
});

test.describe('WFS Requests Handle Errors  @readonly ', () => {

    test('WFS DescribeFeatureType Errors', async({ request }) => {
        // VERSION is mandatory
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WFS',
            REQUEST: 'DescribeFeatureType',
            TYPENAME: 'selection_polygon',
        });
        let url = `/index.php/lizmap/service?${params}`;
        let response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(501);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml;charset=utf-8');

        // check body
        let body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('OperationNotSupported');
        expect(body).toContain('Please add the value of the VERSION parameter');

        // TYPENAME is mandatory
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
            SERVICE: 'WFS',
            VERSION: '1.0.0',
            REQUEST: 'DescribeFeatureType',
        });
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml;charset=utf-8');

        // check body
        body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('RequestNotWellFormed');
        expect(body).toContain('TYPENAME is mandatory');

        // Unknown TYPENAME
        params.set('TYPENAME', 'unknown');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml;charset=utf-8');

        // check body
        body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('RequestNotWellFormed');
        expect(body).toContain('TYPENAME \'unknown\' is not available');

        // Empty TYPENAME
        params.set('TYPENAME', '');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml;charset=utf-8');

        // check body
        body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('RequestNotWellFormed');
        expect(body).toContain('TYPENAME is mandatory');

        // Project without layers published in WFS
        params.set('project', 'rasters');
        params.set('TYPENAME', 'vector_layer');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml;charset=utf-8');

        // check body
        body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('OperationNotSupported');
        expect(body).toContain('No TYPENAME available');

        // Project with one layer published in WFS (sousquartiers) and not the second one (quartiers)
        params.set('project', 'lizmap_features_table');
        params.set('TYPENAME', 'quartiers');
        url = `/index.php/lizmap/service?${params}`;
        response = await request.get(url, {});
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml;charset=utf-8');

        // check body
        body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('RequestNotWellFormed');
        expect(body).toContain('TYPENAME \'quartiers\' is not available');
    });

    test('WFS GetFeature Errors', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service?${params}`;

        // VERSION is mandatory
        let response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                REQUEST: 'GetFeature',
                TYPENAME: 'selection_polygon',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(501);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml;charset=utf-8');

        // check body
        let body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('OperationNotSupported');
        expect(body).toContain('Please add the value of the VERSION parameter');

        //TYPENAME or FEATUREID is mandatory
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                REQUEST: 'GetFeature',
                VERSION: '1.0.0',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml;charset=utf-8');

        // check body
        body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('RequestNotWellFormed');
        expect(body).toContain('TYPENAME or FEATUREID is mandatory');

        //Empty TYPENAME
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                REQUEST: 'GetFeature',
                VERSION: '1.0.0',
                TYPENAME: '',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml;charset=utf-8');

        // check body
        body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('RequestNotWellFormed');
        expect(body).toContain('TYPENAME or FEATUREID is mandatory');

        //Empty FEATUREID
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                REQUEST: 'GetFeature',
                VERSION: '1.0.0',
                FEATUREID: '',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml;charset=utf-8');

        // check body
        body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('RequestNotWellFormed');
        expect(body).toContain('TYPENAME or FEATUREID is mandatory');

        // Project without layers published in WFS
        params.set('project', 'rasters');
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                REQUEST: 'GetFeature',
                VERSION: '1.0.0',
                TYPENAME: 'vector_layer',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml;charset=utf-8');

        // check body
        body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('RequestNotWellFormed');
        expect(body).toContain('TYPENAME \'vector_layer\' is not available');

        // Project with one layer published in WFS (sousquartiers) and not the second one (quartiers)
        params.set('project', 'lizmap_features_table');
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                REQUEST: 'GetFeature',
                VERSION: '1.0.0',
                TYPENAME: 'quartiers',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml;charset=utf-8');

        // check body
        body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('RequestNotWellFormed');
        expect(body).toContain('TYPENAME \'quartiers\' is not available');

        //EXP_FILTER not well formed
        response = await request.post(url, {
            form: {
                SERVICE: 'WFS',
                REQUEST: 'GetFeature',
                VERSION: '1.0.0',
                TYPENAME: 'selection_polygon',
                EXP_FILTER: '\'tref\'+pipe(2)',
                OUTPUTFORMAT: 'GeoJSON',
            }
        });
        // check response
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        // check content-type header
        expect(response.headers()['content-type'].toLowerCase()).toBe('text/xml; charset=utf-8');

        // check body
        body = await response.text();
        expect(body).toContain('ServiceExceptionReport');
        expect(body).toContain('version="1.2.0"');
        expect(body).toContain('ServiceException');
        expect(body).toContain('RequestNotWellFormed');
        expect(body).toContain('The EXP_FILTER expression has errors');
    });
});
