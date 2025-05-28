const parser = new DOMParser();
const baseUrl = Cypress.config('baseUrl')

/**
 *
 * @param elem The element
 * @param tagName The tag name
 */
function* getChildrenByTagName(elem, tagName) {
    for (let i = 0; i < elem.children.length; i++) {
        const elemChild = elem.children[i]
        if (elemChild.tagName == tagName) {
            yield elemChild
        }
    }
}

describe('Request GetCapabilities', function () {

    it('WMS 1.3.0 GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.3.0')
                expect(xmlBody.documentElement.getAttribute('xsi:schemaLocation'))
                    .to.contain(baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension')

                let serviceName = null
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const nameElem of getChildrenByTagName(serviceElem, 'Name')) {
                        serviceName = nameElem.childNodes[0].nodeValue
                    }
                }
                expect(serviceName).to.eq('WMS')

                // OnlineResource for Service
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const onlineResourceElem of serviceElem.getElementsByTagName('OnlineResource')) {
                        expect(onlineResourceElem.getAttribute('xlink:href'))
                            .to.oneOf([
                                baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                            ],'OnlineResource error for Service')
                    }
                }
                // OnlineResource for Request
                for (const capabilityElem of getChildrenByTagName(xmlBody.documentElement, 'Capability')) {
                    for (const requestElem of getChildrenByTagName(capabilityElem, 'Request')) {
                        for (const onlineResourceElem of requestElem.getElementsByTagName('OnlineResource')) {
                            expect(onlineResourceElem.getAttribute('xlink:href'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for request: '+onlineResourceElem.parentElement.parentElement.parentElement.parentElement.tagName)
                        }
                    }
                }

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

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.3.0')
            })
    })

    it('WMS 1.1.1 GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMT_MS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.1.1')

                let serviceName = null
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const nameElem of getChildrenByTagName(serviceElem, 'Name')) {
                        serviceName = nameElem.childNodes[0].nodeValue
                    }
                }
                expect(serviceName).to.eq('WMS')

                // OnlineResource for Service
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const onlineResourceElem of serviceElem.getElementsByTagName('OnlineResource')) {
                        expect(onlineResourceElem.getAttribute('xlink:href'))
                            .to.oneOf([
                                baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                            ], 'OnlineResource error for Service')
                    }
                }
                // OnlineResource for Request
                for (const capabilityElem of getChildrenByTagName(xmlBody.documentElement, 'Capability')) {
                    for (const requestElem of getChildrenByTagName(capabilityElem, 'Request')) {
                        for (const onlineResourceElem of requestElem.getElementsByTagName('OnlineResource')) {
                            expect(onlineResourceElem.getAttribute('xlink:href'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ],'OnlineResource error for request: '+onlineResourceElem.parentElement.parentElement.parentElement.parentElement.tagName
                                )
                        }
                    }
                }

                const etag = resp.headers['etag']
                cy.request({
                    url: '/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities',
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
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=hide_project&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMT_MS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.1.1')
            })
    })

    it('WMS Default GetCapabilities (version 1.3.0)', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMS&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.3.0')
                expect(xmlBody.documentElement.getAttribute('xsi:schemaLocation'))
                    .to.contain(baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension')

                let serviceName = null
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const nameElem of getChildrenByTagName(serviceElem, 'Name')) {
                        serviceName = nameElem.childNodes[0].nodeValue
                    }
                }
                expect(serviceName).to.eq('WMS')

                // OnlineResource for Service
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const onlineResourceElem of serviceElem.getElementsByTagName('OnlineResource')) {
                        expect(onlineResourceElem.getAttribute('xlink:href'))
                            .to.oneOf([
                                baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                            ], 'OnlineResource error for Service')
                    }
                }
                // OnlineResource for Request
                for (const capabilityElem of getChildrenByTagName(xmlBody.documentElement, 'Capability')) {
                    for (const requestElem of getChildrenByTagName(capabilityElem, 'Request')) {
                        for (const onlineResourceElem of requestElem.getElementsByTagName('OnlineResource')) {
                            expect(onlineResourceElem.getAttribute('xlink:href'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for request: '+onlineResourceElem.parentElement.parentElement.parentElement.parentElement.tagName)
                        }
                    }
                }

                const etag = resp.headers['etag']
                cy.request({
                    url: '/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMS&REQUEST=GetCapabilities',
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
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=hide_project&SERVICE=WMS&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.3.0')
            })
    })

    it('WMS 1.3.0 GetCapabilities As User A', function () {
        cy.loginAsUserA()

        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.3.0')
                expect(xmlBody.documentElement.getAttribute('xsi:schemaLocation'))
                    .to.contain(baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension')

                let serviceName = null
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const nameElem of getChildrenByTagName(serviceElem, 'Name')) {
                        serviceName = nameElem.childNodes[0].nodeValue
                    }
                }
                expect(serviceName).to.eq('WMS')

                // OnlineResource for Service
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const onlineResourceElem of serviceElem.getElementsByTagName('OnlineResource')) {
                        expect(onlineResourceElem.getAttribute('xlink:href'))
                            .to.oneOf([
                                baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                            ], 'OnlineResource error for Service')
                    }
                }
                // OnlineResource for Request
                for (const capabilityElem of getChildrenByTagName(xmlBody.documentElement, 'Capability')) {
                    for (const requestElem of getChildrenByTagName(capabilityElem, 'Request')) {
                        for (const onlineResourceElem of requestElem.getElementsByTagName('OnlineResource')) {
                            expect(onlineResourceElem.getAttribute('xlink:href'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for request: '+onlineResourceElem.parentElement.parentElement.parentElement.parentElement.tagName)
                        }
                    }
                }

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

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.3.0')
            })

        cy.logout()
    })

    it('WMS 1.3.0 GetCapabilities As Admin', function () {
        cy.loginAsAdmin()

        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.3.0')
                expect(xmlBody.documentElement.getAttribute('xsi:schemaLocation'))
                    .to.contain(baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetSchemaExtension')

                let serviceName = null
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const nameElem of getChildrenByTagName(serviceElem, 'Name')) {
                        serviceName = nameElem.childNodes[0].nodeValue
                    }
                }
                expect(serviceName).to.eq('WMS')

                // OnlineResource for Service
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const onlineResourceElem of serviceElem.getElementsByTagName('OnlineResource')) {
                        expect(onlineResourceElem.getAttribute('xlink:href'))
                            .to.oneOf([
                                baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                            ], 'OnlineResource error for Service')
                    }
                }
                // OnlineResource for Request
                for (const capabilityElem of getChildrenByTagName(xmlBody.documentElement, 'Capability')) {
                    for (const requestElem of getChildrenByTagName(capabilityElem, 'Request')) {
                        for (const onlineResourceElem of requestElem.getElementsByTagName('OnlineResource')) {
                            expect(onlineResourceElem.getAttribute('xlink:href'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for request: '+onlineResourceElem.parentElement.parentElement.parentElement.parentElement.tagName)
                        }
                    }
                }

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

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.3.0')
            })

        cy.logout()
    })


    it('WMTS 1.0.0 GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=cache&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')

                let serviceType = null
                let serviceTypeVersion = null
                for (const serviceIdentificationElem of getChildrenByTagName(xmlBody.documentElement, 'ows:ServiceIdentification')) {
                    for (const serviceTypeElem of getChildrenByTagName(serviceIdentificationElem, 'ows:ServiceType')) {
                        serviceType = serviceTypeElem.childNodes[0].nodeValue
                    }
                    for (const serviceTypeVersionElem of getChildrenByTagName(serviceIdentificationElem, 'ows:ServiceTypeVersion')) {
                        serviceTypeVersion = serviceTypeVersionElem.childNodes[0].nodeValue
                    }
                }
                expect(serviceType).to.eq('OGC WMTS')
                expect(serviceTypeVersion).to.eq('1.0.0')

                // Operations get link
                for (const operationsMetadataElem of getChildrenByTagName(xmlBody.documentElement, 'ows:OperationsMetadata')) {
                    for (const operationElem of getChildrenByTagName(operationsMetadataElem, 'ows:Operation')) {
                        for (const getElem of operationElem.getElementsByTagName('ows:Get')) {
                            expect(getElem.getAttribute('xlink:href'))
                                .to.eq(
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=cache&',
                                    'OnlineResource error for '+operationElem.getAttribute('name')
                                )
                        }
                    }
                }

                let layers = []
                let tileMatrixSets = []
                for (const contentsElem of getChildrenByTagName(xmlBody.documentElement, 'Contents')) {
                    for (const layerElem of getChildrenByTagName(contentsElem, 'Layer')) {
                        for (const identifierElem of getChildrenByTagName(layerElem, 'ows:Identifier')) {
                            layers.push(identifierElem.childNodes[0].nodeValue)
                        }
                    }
                    for (const tileMatrixSetElem of getChildrenByTagName(contentsElem, 'TileMatrixSet')) {
                        for (const identifierElem of getChildrenByTagName(tileMatrixSetElem, 'ows:Identifier')) {
                            tileMatrixSets.push(identifierElem.childNodes[0].nodeValue)
                        }
                    }
                }
                expect(layers).to.contain('Quartiers')
                expect(tileMatrixSets).to.contain('EPSG:3857')

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

    it('WMTS Default GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=cache&SERVICE=WMTS&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')

                let serviceType = null
                let serviceTypeVersion = null
                for (const serviceIdentificationElem of getChildrenByTagName(xmlBody.documentElement, 'ows:ServiceIdentification')) {
                    for (const serviceTypeElem of getChildrenByTagName(serviceIdentificationElem, 'ows:ServiceType')) {
                        serviceType = serviceTypeElem.childNodes[0].nodeValue
                    }
                    for (const serviceTypeVersionElem of getChildrenByTagName(serviceIdentificationElem, 'ows:ServiceTypeVersion')) {
                        serviceTypeVersion = serviceTypeVersionElem.childNodes[0].nodeValue
                    }
                }
                expect(serviceType).to.eq('OGC WMTS')
                expect(serviceTypeVersion).to.eq('1.0.0')

                // Operations get link
                for (const operationsMetadataElem of getChildrenByTagName(xmlBody.documentElement, 'ows:OperationsMetadata')) {
                    for (const operationElem of getChildrenByTagName(operationsMetadataElem, 'ows:Operation')) {
                        for (const getElem of operationElem.getElementsByTagName('ows:Get')) {
                            expect(getElem.getAttribute('xlink:href'))
                                .to.eq(
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=cache&',
                                    'OnlineResource error for '+operationElem.getAttribute('name')
                                )
                        }
                    }
                }

                let layers = []
                let tileMatrixSets = []
                for (const contentsElem of getChildrenByTagName(xmlBody.documentElement, 'Contents')) {
                    for (const layerElem of getChildrenByTagName(contentsElem, 'Layer')) {
                        for (const identifierElem of getChildrenByTagName(layerElem, 'ows:Identifier')) {
                            layers.push(identifierElem.childNodes[0].nodeValue)
                        }
                    }
                    for (const tileMatrixSetElem of getChildrenByTagName(contentsElem, 'TileMatrixSet')) {
                        for (const identifierElem of getChildrenByTagName(tileMatrixSetElem, 'ows:Identifier')) {
                            tileMatrixSets.push(identifierElem.childNodes[0].nodeValue)
                        }
                    }
                }
                expect(layers).to.contain('Quartiers')
                expect(tileMatrixSets).to.contain('EPSG:3857')

                const etag = resp.headers['etag']
                cy.request({
                    url: '/index.php/lizmap/service/?repository=testsrepository&project=cache&SERVICE=WMTS&REQUEST=GetCapabilities',
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

    it('WFS 1.0.0 GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')

                let serviceName = null
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const nameElem of getChildrenByTagName(serviceElem, 'Name')) {
                        serviceName = nameElem.childNodes[0].nodeValue
                    }
                }
                expect(serviceName).to.eq('WFS')

                // Requests links
                for (const capabilityElem of getChildrenByTagName(xmlBody.documentElement, 'Capability')) {
                    for (const requestElem of getChildrenByTagName(capabilityElem, 'Request')) {
                        for (const getElem of requestElem.getElementsByTagName('Get')) {
                            expect(getElem.getAttribute('onlineResource'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for '+getElem.parentElement.parentElement.parentElement.tagName)
                        }
                        for (const postElem of requestElem.getElementsByTagName('Post')) {
                            expect(postElem.getAttribute('onlineResource'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for '+postElem.parentElement.parentElement.parentElement.tagName)
                        }
                    }
                }

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

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')
            })
    })

    it('WFS 1.1.0 GetCapabilities', function () {

        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.1.0')

                let serviceType = null
                let serviceTypeVersion = null
                for (const serviceIdentificationElem of getChildrenByTagName(xmlBody.documentElement, 'ows:ServiceIdentification')) {
                    for (const serviceTypeElem of getChildrenByTagName(serviceIdentificationElem, 'ows:ServiceType')) {
                        serviceType = serviceTypeElem.childNodes[0].nodeValue
                    }
                    for (const serviceTypeVersionElem of getChildrenByTagName(serviceIdentificationElem, 'ows:ServiceTypeVersion')) {
                        serviceTypeVersion = serviceTypeVersionElem.childNodes[0].nodeValue
                    }
                }
                expect(serviceType).to.eq('WFS')
                expect(serviceTypeVersion).to.eq('1.1.0')

                // Operations links
                for (const operationsMetadataElem of getChildrenByTagName(xmlBody.documentElement, 'ows:OperationsMetadata')) {
                    for (const operationElem of getChildrenByTagName(operationsMetadataElem, 'ows:Operation')) {
                        for (const getElem of operationElem.getElementsByTagName('ows:Get')) {
                            expect(getElem.getAttribute('xlink:href'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for '+operationElem.getAttribute('name'))
                        }
                        for (const postElem of operationElem.getElementsByTagName('ows:Post')) {
                            expect(postElem.getAttribute('xlink:href'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for '+operationElem.getAttribute('name'))
                        }
                    }
                }

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

        // Project with config.options.hideProject: "True"
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=hide_project&SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.1.0')
            })
    })


    it('WFS Default GetCapabilities (version 1.0.0)', function () {

        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')

                let serviceName = null
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const nameElem of getChildrenByTagName(serviceElem, 'Name')) {
                        serviceName = nameElem.childNodes[0].nodeValue
                    }
                }
                expect(serviceName).to.eq('WFS')

                // Requests links
                for (const capabilityElem of getChildrenByTagName(xmlBody.documentElement, 'Capability')) {
                    for (const requestElem of getChildrenByTagName(capabilityElem, 'Request')) {
                        for (const getElem of requestElem.getElementsByTagName('Get')) {
                            expect(getElem.getAttribute('onlineResource'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for '+getElem.parentElement.parentElement.parentElement.tagName)
                        }
                        for (const postElem of requestElem.getElementsByTagName('Post')) {
                            expect(postElem.getAttribute('onlineResource'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for '+postElem.parentElement.parentElement.parentElement.tagName)
                        }
                    }
                }

                const etag = resp.headers['etag']
                cy.request({
                    url: '/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&REQUEST=GetCapabilities',
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
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=hide_project&SERVICE=WFS&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')
            })
    })

    it('WFS 1.0.0 GetCapabilities As User A', function () {
        cy.loginAsUserA()

        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')

                let serviceName = null
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const nameElem of getChildrenByTagName(serviceElem, 'Name')) {
                        serviceName = nameElem.childNodes[0].nodeValue
                    }
                }
                expect(serviceName).to.eq('WFS')

                // Requests links
                for (const capabilityElem of getChildrenByTagName(xmlBody.documentElement, 'Capability')) {
                    for (const requestElem of getChildrenByTagName(capabilityElem, 'Request')) {
                        for (const getElem of requestElem.getElementsByTagName('Get')) {
                            expect(getElem.getAttribute('onlineResource'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for '+getElem.parentElement.parentElement.parentElement.tagName)
                        }
                        for (const postElem of requestElem.getElementsByTagName('Post')) {
                            expect(postElem.getAttribute('onlineResource'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for '+postElem.parentElement.parentElement.parentElement.tagName)
                        }
                    }
                }

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

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')
            })

        cy.logout()
    })


    it('WFS 1.0.0 GetCapabilities As Admin', function () {
        cy.loginAsAdmin()

        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.headers['cache-control']).to.eq('no-cache')
                expect(resp.headers['etag']).to.not.eq(undefined)

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')

                let serviceName = null
                for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                    for (const nameElem of getChildrenByTagName(serviceElem, 'Name')) {
                        serviceName = nameElem.childNodes[0].nodeValue
                    }
                }
                expect(serviceName).to.eq('WFS')

                // Requests links
                for (const capabilityElem of getChildrenByTagName(xmlBody.documentElement, 'Capability')) {
                    for (const requestElem of getChildrenByTagName(capabilityElem, 'Request')) {
                        for (const getElem of requestElem.getElementsByTagName('Get')) {
                            expect(getElem.getAttribute('onlineResource'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for '+getElem.parentElement.parentElement.parentElement.tagName)
                        }
                        for (const postElem of requestElem.getElementsByTagName('Post')) {
                            expect(postElem.getAttribute('onlineResource'))
                                .to.oneOf([
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection',
                                    baseUrl+'/index.php/lizmap/service?repository=testsrepository&project=selection&',
                                ], 'OnlineResource error for '+postElem.parentElement.parentElement.parentElement.tagName)
                        }
                    }
                }

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

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')
            })

        cy.logout()
    })

    it('WFS 1.0.0 GetCapabilities XML', function () {
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

            const xmlBody = parser.parseFromString(resp.body, 'text/xml')
            expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
            expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')

            let serviceName = null
            for (const serviceElem of getChildrenByTagName(xmlBody.documentElement, 'Service')) {
                for (const nameElem of getChildrenByTagName(serviceElem, 'Name')) {
                    serviceName = nameElem.childNodes[0].nodeValue
                }
            }
            expect(serviceName).to.eq('WFS')
        })
    })

    it('WFS 1.1.0 GetCapabilities XML', function () {
        let body = '<?xml version="1.0" encoding="UTF-8"?>'
        body += '<wfs:GetCapabilities'
        body += '    service="WFS"'
        body += '    version="1.1.0"'
        body += '    xmlns:wfs="http://www.opengis.net/wfs"'
        body += '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
        body += '    xsi:schemaLocation="http://www.opengis.net/wfs/1.1.0 http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">'
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

            const xmlBody = parser.parseFromString(resp.body, 'text/xml')
            expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
            expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.1.0')

            let serviceType = null
            let serviceTypeVersion = null
            for (const serviceIdentificationElem of getChildrenByTagName(xmlBody.documentElement, 'ows:ServiceIdentification')) {
                for (const serviceTypeElem of getChildrenByTagName(serviceIdentificationElem, 'ows:ServiceType')) {
                    serviceType = serviceTypeElem.childNodes[0].nodeValue
                }
                for (const serviceTypeVersionElem of getChildrenByTagName(serviceIdentificationElem, 'ows:ServiceTypeVersion')) {
                    serviceTypeVersion = serviceTypeVersionElem.childNodes[0].nodeValue
                }
            }
            expect(serviceType).to.eq('WFS')
            expect(serviceTypeVersion).to.eq('1.1.0')
        })
    })
})
