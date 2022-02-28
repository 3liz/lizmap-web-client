describe('Request service', function () {
    it('Lizmap GetProjectConfig', function () {
        cy.request('/index.php/lizmap/service/getProjectConfig?repository=testsrepository&project=selection')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('application/json')
            })
    })

    it('WMS GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
            })
    })

    it('WMTS GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
            })
    })

    it('WFS GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
            })
    })
})
