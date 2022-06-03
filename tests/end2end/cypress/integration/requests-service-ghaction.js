describe('Request service', function () {
    it('Lizmap GetProjectConfig', function () {
        cy.request('/index.php/lizmap/service/getProjectConfig?repository=testsrepository&project=selection')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('application/json')
            })
    })

    it('Lizmap GetProj4', function () {
        cy.request({
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetProj4',
                'AUTHID': 'EPSG:2154',
            },
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('text/plain')
            expect(resp.body).to.contain('+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
        })
    })

    it('Lizmap GetSelectionToken', function () {
        cy.request({
            method: 'GET',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WMS',
                'REQUEST': 'GetSelectionToken',
                'TYPENAME': 'selection_polygon',
                'IDS': '1,2',
            },
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.eq('application/json')
            expect(resp.headers['cache-control']).to.eq('no-cache')
            expect(resp.headers['etag']).to.not.eq(undefined)

            const etag = resp.headers['etag']
            expect(resp.body).to.have.property('token', etag)

            cy.request({
                method: 'GET',
                url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
                qs: {
                    'SERVICE': 'WMS',
                    'REQUEST': 'GetSelectionToken',
                    'TYPENAME': 'selection_polygon',
                    'IDS': '2, 1',
                },
                failOnStatusCode: false,
            }).then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('application/json')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)
                expect(resp.headers['etag']).to.eq(etag)

                expect(resp.body).to.have.property('token', etag)
            })

            cy.request({
                method: 'GET',
                url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
                qs: {
                    'SERVICE': 'WMS',
                    'REQUEST': 'GetSelectionToken',
                    'TYPENAME': 'selection_polygon',
                    'IDS': '2,1',
                },
                headers: {
                    'If-None-Match': etag,
                },
                failOnStatusCode: false,
            }).then((resp) => {
                expect(resp.status).to.eq(304)
                expect(resp.body).to.have.length(0)
            })
        })
    })

    it('Lizmap GetFilterToken', function () {
        cy.request({
            method: 'GET',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WMS',
                'REQUEST': 'GetFilterToken',
                'TYPENAME': 'selection_polygon',
                'FILTER': '"id" IN (1, 2)',
            },
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.eq('application/json')
            expect(resp.headers['cache-control']).to.eq('no-cache')
            expect(resp.headers['etag']).to.not.eq(undefined)

            const etag = resp.headers['etag']
            expect(resp.body).to.have.property('token', etag)

            cy.request({
                method: 'GET',
                url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
                qs: {
                    'SERVICE': 'WMS',
                    'REQUEST': 'GetFilterToken',
                    'TYPENAME': 'selection_polygon',
                    'FILTER': '"id" IN (1, 2)',
                },
                headers: {
                    'If-None-Match': etag,
                },
                failOnStatusCode: false,
            }).then((resp) => {
                expect(resp.status).to.eq(304)
                expect(resp.body).to.have.length(0)
            })

            cy.request({
                method: 'GET',
                url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
                qs: {
                    'SERVICE': 'WMS',
                    'REQUEST': 'GetFilterToken',
                    'TYPENAME': 'selection_polygon',
                    'FILTER': '"id" IN (2, 1)',
                },
                headers: {
                    'If-None-Match': etag,
                },
                failOnStatusCode: false,
            }).then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('application/json')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(etag)

                expect(resp.body).to.have.property('token')
                expect(resp.body.token).to.not.eq(etag)
            })
        })
    })

    it('WMS GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.body).to.contain('WMS_Capabilities')
                expect(resp.body).to.contain('version="1.3.0"')
            })
    })

    it('WMTS GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=cache&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.body).to.contain('version="1.0.0"')
                expect(resp.body).to.contain('<ows:Identifier>Quartiers</ows:Identifier>')
                expect(resp.body).to.contain('<TileMatrixSet>EPSG:3857</TileMatrixSet>')
            })
    })

    it('WFS GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.body).to.contain('WFS_Capabilities')
                expect(resp.body).to.contain('version="1.0.0"')
            })
    })

    it('WFS GetCapabilities 1.1.0', function () {

        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.body).to.contain('WFS_Capabilities')
                expect(resp.body).to.contain('version="1.1.0"')
            })
    })


    it('WFS GetCapabilities XML', function () {
        let body = '<?xml version="1.0" encoding="UTF-8"?>'
        body += '<wfs:GetCapabilities'
        body += '    service="WFS"'
        body += '    version="1.0.0"'
        body += '    xmlns:wfs="http://www.opengis.net/wfs"'
        body += '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
        body += '    xsi:schemaLocation="http://www.opengis.net/wfs/1.0.0 http://schemas.opengis.net/wfs/1.0.0/wfs.xsd">'
        body += '</wfs:GetCapabilities>'
        body += ''
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            headers: {
                'Content-Type':'text/xml; charset=utf-8'
            },
            body: body,
        }).then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.body).to.contain('WFS_Capabilities')
                expect(resp.body).to.contain('version="1.0.0"')
            })
    })

    it('WFS DescribeFeatureType', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'DescribeFeatureType',
                'TYPENAME': 'selection_polygon'
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('text/xml; charset=utf-8')
            expect(resp.body).to.contain('schema')
            expect(resp.body).to.contain('complexType')
            expect(resp.body).to.contain('selection_polygonType')
        })
    })

    it('WFS DescribeFeatureType JSON', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'DescribeFeatureType',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'JSON'
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/json; charset=utf-8')
            expect(resp.body).to.have.property('name', 'selection_polygon')
            expect(resp.body).to.have.property('aliases')
            expect(resp.body).to.have.property('defaults')
            expect(resp.body).to.have.property('types')
            expect(resp.body.types).to.have.property('id', 'int')
            expect(resp.body.types).to.have.property('geometry', 'gml:PolygonPropertyType')
        })
    })

    it('WFS GetFeature TYPENAME', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(2)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature.bbox).to.have.length(4)
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature TYPENAME && BBOX', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'BBOX': '160786,900949,186133,925344',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature TYPENAME && EXP_FILTER', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'EXP_FILTER': '$id IN (1)',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature TYPENAME && EXP_FILTER && BBOX', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'EXP_FILTER': '$id IN (1)',
                'BBOX': '160786,900949,186133,925344',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature TYPENAME && EXP_FILTER && BBOX && FORCE_QGIS', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'EXP_FILTER': '$id IN (1)',
                'BBOX': '160786,900949,186133,925344',
                'OUTPUTFORMAT': 'GeoJSON',
                'FORCE_QGIS': '1',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature FEATUREID', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'FEATUREID': 'selection_polygon.1',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature FEATUREID && BBOX', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'FEATUREID': 'selection_polygon.1',
                'BBOX': '160786,900949,186133,925344',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature FEATUREID && BBOX && FORCE_QGIS', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'FEATUREID': 'selection_polygon.1',
                'BBOX': '160786,900949,186133,925344',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature XML', function () {
        let body = '<?xml version="1.0" encoding="UTF-8"?>'
        body += '<wfs:GetFeature'
        body += '    service="WFS"'
        body += '    version="1.0.0"'
        body += '    outputFormat="GeoJSON"'
        body += '    xmlns:wfs="http://www.opengis.net/wfs"'
        body += '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
        body += '    xsi:schemaLocation="http://www.opengis.net/wfs/1.0.0 http://schemas.opengis.net/wfs/1.0.0/wfs.xsd">'
        body += '    <wfs:Query typeName="selection_polygon"/>'
        body += '</wfs:GetFeature>'
        body += ''
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            headers: {
                'Content-Type':'text/xml; charset=utf-8'
            },
            body: body,
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(2)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature.bbox).to.have.length(4)
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WMTS GetTile', function () {
        // Get full transparent tile TILEMATRIX=13&TILEROW=2989&TILECOL=4185
        cy.request({
            method: 'GET',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=cache',
            qs: {
                'SERVICE': 'WMTS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetTile',
                'LAYER': 'Quartiers',
                'STYLE': 'default',
                'TILEMATRIXSET': 'EPSG:3857',
                'TILEMATRIX': '13',
                'TILEROW': '2989',
                'TILECOL': '4185',
                'FORMAT': 'image/png',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('image/png')
            expect(resp.headers).to.have.property('content-length', '355') // Transparent
            expect(resp.headers).to.have.property('date')
            const tileDate = new Date(resp.headers['date'])
            expect(resp.headers).to.have.property('expires')
            const tileExpires = new Date(resp.headers['expires'])
            expect(tileExpires).to.be.greaterThan(tileDate)
            /*expect(resp.body).to.contain('version="1.0.0"')*/
        })

        // Get not full transparent tile TILEMATRIX=13&TILEROW=2991&TILECOL=4184
        cy.request({
            method: 'GET',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=cache',
            qs: {
                'SERVICE': 'WMTS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetTile',
                'LAYER': 'Quartiers',
                'STYLE': 'default',
                'TILEMATRIXSET': 'EPSG:3857',
                'TILEMATRIX': '13',
                'TILEROW': '2991',
                'TILECOL': '4184',
                'FORMAT': 'image/png',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('image/png')
            expect(resp.headers).to.have.property('content-length')
            expect(parseInt(resp.headers['content-length'])).to.be.greaterThan(355) // Not transparent
            expect(parseInt(resp.headers['content-length'])).to.be.eq(10825) // Monochrome
            expect(resp.headers).to.have.property('date')
            const tileDate = new Date(resp.headers['date'])
            expect(resp.headers).to.have.property('expires')
            const tileExpires = new Date(resp.headers['expires'])
            expect(tileExpires).to.be.greaterThan(tileDate)
            /*expect(resp.body).to.contain('version="1.0.0"')*/
        })

        // Get monochrome tile TILEMATRIX=15&TILEROW=11964&TILECOL=16736
        cy.request({
            method: 'GET',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=cache',
            qs: {
                'SERVICE': 'WMTS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetTile',
                'LAYER': 'Quartiers',
                'STYLE': 'default',
                'TILEMATRIXSET': 'EPSG:3857',
                'TILEMATRIX': '15',
                'TILEROW': '11964',
                'TILECOL': '16736',
                'FORMAT': 'image/png',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('image/png')
            expect(resp.headers).to.have.property('content-length')
            expect(parseInt(resp.headers['content-length'])).to.be.greaterThan(355) // Not transparent
            expect(resp.headers).to.have.property('date')
            const tileDate = new Date(resp.headers['date'])
            expect(resp.headers).to.have.property('expires')
            const tileExpires = new Date(resp.headers['expires'])
            expect(tileExpires).to.be.greaterThan(tileDate)
            /*expect(resp.body).to.contain('version="1.0.0"')*/
        })
    })

    it('Project parameter is mandatory', function () {
        cy.request({
            url: '/index.php/lizmap/service/?repository=testsrepository&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities',
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(404)
            expect(resp.headers['content-type']).to.contain('text/xml')
            expect(resp.body).to.contain('ServiceException')
        })
    })

    it('Repository parameter is mandatory', function () {
        cy.request({
            url: '/index.php/lizmap/service/?project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities',
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(404)
            expect(resp.headers['content-type']).to.contain('text/xml')
            expect(resp.body).to.contain('ServiceException')
        })
    })

    it('Service unknown or unsupported', function () {
        cy.request({
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=OWS&VERSION=1.3.0&REQUEST=GetCapabilities',
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(501)
            expect(resp.headers['content-type']).to.contain('text/xml')
            expect(resp.body).to.contain('ServiceException')
        })
    })

    it('Request unsupported', function () {
        cy.request({
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetUnsupported',
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(501)
            expect(resp.headers['content-type']).to.contain('text/xml')
            expect(resp.body).to.contain('ServiceException')
        })
    })

    it('Request undefined', function () {
        cy.request({
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0',
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(501)
            expect(resp.headers['content-type']).to.contain('text/xml')
            expect(resp.body).to.contain('ServiceException')
        })
    })

    it('Version parameter is mandatory except for GetCapabilities request', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection',
                'OUTPUTFORMAT': 'GeoJSON',
            },
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(501)
            expect(resp.headers['content-type']).to.contain('text/xml')
            expect(resp.body).to.contain('ServiceException')
        })

        cy.request({
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'REQUEST': 'GetCapabilities',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
            expect(resp.body).to.contain('WFS_Capabilities')
            expect(resp.body).to.contain('version="1.0.0"')
        })
    })

    it('TYPENAME or FEATUREID is mandatory for WFS GetFeature request', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'OUTPUTFORMAT': 'GeoJSON',
            },
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(400)
            expect(resp.headers['content-type']).to.contain('text/xml')
            expect(resp.body).to.contain('ServiceException')
        })
    })
})
