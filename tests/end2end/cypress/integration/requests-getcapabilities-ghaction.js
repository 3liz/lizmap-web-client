const parser = new DOMParser();

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

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.3.0')
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

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMT_MS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.1.1')
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

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WMS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.3.0')
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

    it('WMTS 1.0.0 GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=cache&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.contain('text/xml')

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')

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
            })
    })

    it('WMTS Default GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=cache&SERVICE=WMTS&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.contain('text/xml')

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')

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
            })
    })

    it('WFS 1.0.0 GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')
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

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.1.0')
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

                const xmlBody = parser.parseFromString(resp.body, 'text/xml')
                expect(xmlBody.documentElement.tagName).to.eq('WFS_Capabilities')
                expect(xmlBody.documentElement.getAttribute('version')).to.contain('1.0.0')
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
                expect(resp.body).to.contain('WFS_Capabilities')
                expect(resp.body).to.contain('version="1.0.0"')
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
                expect(resp.body).to.contain('WFS_Capabilities')
                expect(resp.body).to.contain('version="1.1.0"')
            })
    })
})
