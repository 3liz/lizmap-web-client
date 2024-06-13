describe('Request service', function () {
    it('Lizmap GetProjectConfig', function () {
        cy.request('/index.php/lizmap/service/getProjectConfig?repository=testsrepository&project=selection')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('application/json')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const etag = resp.headers['etag']
                cy.request({
                    url: '/index.php/lizmap/service/getProjectConfig?repository=testsrepository&project=selection',
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
            expect(resp.headers['cache-control']).to.eq('no-cache')
            expect(resp.headers['etag']).to.not.eq(undefined)

            const projParams = resp.body.split(' ')
            expect(projParams).to.have.lengthOf(11)
            expect(projParams).to.include.members([
                '+proj=lcc',
                '+lat_1=49',
                '+lat_2=44',
                '+lat_0=46.5',
                '+lon_0=3',
                '+x_0=700000',
                '+y_0=6600000',
                '+ellps=GRS80',
                '+towgs84=0,0,0,0,0,0,0',
                '+units=m',
                '+no_defs',
            ])

            const etag = resp.headers['etag']
            cy.request({
                url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
                qs: {
                    'SERVICE': 'WMS',
                    'VERSION': '1.3.0',
                    'REQUEST': 'GetProj4',
                    'AUTHID': 'EPSG:2154',
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
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                expect(resp.body).to.contain('WMS_Capabilities')
                expect(resp.body).to.contain('version="1.3.0"')
                expect(resp.body).to.contain('index.php/lizmap/service?repository=testsrepository')

                const etag = resp.headers['etag']
                cy.request({
                    url: '/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities',
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
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=hide_project&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities')
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
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                expect(resp.body).to.contain('version="1.0.0"')
                expect(resp.body).to.contain('<ows:Identifier>Quartiers</ows:Identifier>')
                expect(resp.body).to.contain('<TileMatrixSet>EPSG:3857</TileMatrixSet>')

                const etag = resp.headers['etag']
                cy.request({
                    url: '/index.php/lizmap/service/?repository=testsrepository&project=cache&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
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
            expect(parseInt(resp.headers['content-length'])).to.be.within(11020, 11030 ) // Monochrome
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
})
