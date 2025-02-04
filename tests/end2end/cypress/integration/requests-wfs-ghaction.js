import { clearErrorsLog, clearLizmapAdminLog } from './../support/function.js'
describe('Request service', function () {
    it('WFS GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                expect(resp.body).to.contain('WFS_Capabilities')
                expect(resp.body).to.contain('version="1.0.0"')

                const etag = resp.headers['etag']
                cy.request({
                    url: '/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities',
                    headers: {
                        'If-None-Match': etag,
                    },
                    failOnStatusCode: false,
                }).then((resp) => {
                    expect(resp.status).to.eq(304)
                    expect(resp.body).to.have.length(0)
                })
            })

        // Project with config.options.hideProject: "True"
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=hide_project&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities')
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
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                expect(resp.body).to.contain('WFS_Capabilities')
                expect(resp.body).to.contain('version="1.1.0"')

                const etag = resp.headers['etag']
                cy.request({
                    url: '/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities',
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
            expect(resp.body).to.have.property('columns')
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

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'GML2',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('text/xml').to.contain('subtype=gml/2.1.2')
            expect(resp.body).to.contain('wfs:FeatureCollection')
            expect(resp.body).to.contain('gml:featureMember')
            expect(resp.body).to.contain('qgs:selection_polygon')
            expect(resp.body).to.contain('<qgs:id>1</qgs:id>')
        })

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'GML3',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('text/xml').to.contain('subtype=gml/3.1.1')
            expect(resp.body).to.contain('wfs:FeatureCollection')
            expect(resp.body).to.contain('gml:featureMember')
            expect(resp.body).to.contain('qgs:selection_polygon')
            expect(resp.body).to.contain('<qgs:id>1</qgs:id>')
        })
    })

    it('WFS GetFeature TYPENAME && MAXFEATURES', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'GeoJSON',
                'MAXFEATURES': '1',
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

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'GeoJSON',
                'MAXFEATURES': '1',
                'STARTINDEX': '1',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.2')
            expect(feature).to.have.property('bbox')
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature.bbox).to.have.length(4)
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 2)
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

    it('WFS GetFeature TYPENAME && GEOMETRYNAME', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'GeoJSON',
                'GEOMETRYNAME': 'NONE',
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
            expect(feature).to.not.have.property('bbox')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.be.null
        })

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'GeoJSON',
                'GEOMETRYNAME': 'CENTROID',
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
            expect(feature.geometry).to.have.property('type', 'Point')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(2)
        })

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'GeoJSON',
                'GEOMETRYNAME': 'EXTENT',
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

    it('WFS GetFeature TYPENAME && GEOMETRYNAME && FORCE_QGIS', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'GeoJSON',
                'GEOMETRYNAME': 'NONE',
                'FORCE_QGIS': '1',
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
            expect(feature).to.not.have.property('bbox')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.be.null
        })

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'GeoJSON',
                'GEOMETRYNAME': 'CENTROID',
                'FORCE_QGIS': '1',
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
            expect(feature).to.not.have.property('bbox')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Point')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(2)
        })

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'GeoJSON',
                'GEOMETRYNAME': 'EXTENT',
                'FORCE_QGIS': '1',
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

    it('WFS GetFeature TYPENAME && BBOX && SRSNAME', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'BBOX': '160786,900949,186133,925344',
                'SRSNAME': 'EPSG:2154',
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

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'BBOX': '-72399,-13474,-46812,14094',
                'SRSNAME': 'EPSG:3857',
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


    it('WFS GetFeature TYPENAME && BBOX && SRSNAME && FORCE_QGIS', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'BBOX': '160786,900949,186133,925344',
                'SRSNAME': 'EPSG:2154',
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

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'BBOX': '-72399,-13474,-46812,14094',
                'SRSNAME': 'EPSG:3857',
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

    it('WFS GetFeature TYPENAME && EXP_FILTER && BBOX && SRSNAME', function () {
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
                'SRSNAME': 'EPSG:2154',
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

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'EXP_FILTER': '$id IN (1)',
                'BBOX': '-72399,-13474,-46812,14094',
                'SRSNAME': 'EPSG:3857',
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

    it('WFS GetFeature FEATUREID && BBOX && SRSNAME', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'FEATUREID': 'selection_polygon.1',
                'BBOX': '160786,900949,186133,925344',
                'SRSNAME': 'EPSG:2154',
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

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'FEATUREID': 'selection_polygon.1',
                'BBOX': '-72399,-13474,-46812,14094',
                'SRSNAME': 'EPSG:3857',
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

    it('WFS GetFeature with wfsOutputExtension', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'CSV',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('text/csv')
            expect(resp.body).to.contain('gml_id')
            expect(resp.body).to.contain('selection_polygon.1')
            expect(resp.body).to.contain('selection_polygon.2')
        })

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'KML',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.google-earth.kml+xml')
            expect(resp.body).to.contain('Folder')
            expect(resp.body).to.contain('Placemark')
            expect(resp.body).to.contain('<SimpleData name="gml_id">selection_polygon.1</SimpleData>')
            expect(resp.body).to.contain('<SimpleData name="gml_id">selection_polygon.2</SimpleData>')
        })
    })

    it('WFS GetFeature FAILED && FORCE_QGIS', function () {
        clearLizmapAdminLog()
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'EXP_FILTER': '\'tref\'+pipe(2)',
                'FORCE_QGIS': '1'
            },
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(400)
            expect(resp.headers['content-type']).to.contain('text/xml')
            expect(resp.body).to.contain('ServiceException')
            expect(resp.body).to.contain('code="RequestNotWellFormed"')

            // Check errors
            cy.exec('./../lizmap-ctl docker-exec cat /srv/lzm/lizmap/var/log/lizmap-admin.log', {failOnNonZeroExit: false})
                .then((result) => {
                    expect(result.code).to.eq(0)
                    expect(result.stdout).to.contain('An HTTP request ended with an error, please check the main error log.')
                    expect(result.stdout).to.contain('HTTP code 400.')
                    expect(result.stdout).to.contain('The HTTP OGC request to QGIS Server ended with an error.')
                    expect(result.stdout).to.contain(
                        'HTTP code 400 on "REPOSITORY" = \'testsrepository\' & "PROJECT" = \'selection\' & "SERVICE" = \'WFS\' & "REQUEST" = \'getfeature\''
                    )
                    clearLizmapAdminLog()
                })
            clearErrorsLog()
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
