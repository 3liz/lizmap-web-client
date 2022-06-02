describe('Request Lizmap GetProjectConfig', function () {
    it('As anonymous', function () {
        cy.logout();

        cy.request({
            url: '/index.php/lizmap/service/getProjectConfig?repository=testsrepository&project=selection',
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.eq('application/json')

            expect(resp.body).to.have.property('options')
            expect(resp.body).to.have.property('layers')

            expect(resp.body).to.have.property('datavizLayers')
            expect(resp.body.datavizLayers).to.have.property('locale')
            expect(resp.body.datavizLayers.locale).to.be.not.empty
            expect(resp.body.datavizLayers).to.have.property('layers')
            expect(resp.body.datavizLayers.layers).to.be.empty
            expect(resp.body.datavizLayers).to.have.property('dataviz')
            expect(resp.body.datavizLayers.dataviz).to.be.empty
        })
    })

    it('As anonymous with dataviz', function () {
        cy.logout();

        cy.request({
            url: '/index.php/lizmap/service/getProjectConfig?repository=testsrepository&project=dataviz_filtered_in_popup',
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.eq('application/json')

            expect(resp.body).to.have.property('options')
            expect(resp.body).to.have.property('layers')

            expect(resp.body).to.have.property('datavizLayers')
            expect(resp.body.datavizLayers).to.have.property('locale')
            expect(resp.body.datavizLayers.locale).to.be.not.empty
            expect(resp.body.datavizLayers).to.have.property('layers')
            expect(resp.body.datavizLayers.layers).to.be.not.empty
            // Check dataviz config
            expect(resp.body.datavizLayers).to.have.property('dataviz')
            expect(resp.body.datavizLayers.dataviz).to.be.not.empty
            expect(resp.body.datavizLayers.dataviz).to.have.property('location', 'only-popup')
            expect(resp.body.datavizLayers.dataviz).to.have.property('theme', 'light')
        })
    })
})
