describe('Request Lizmap GetProjectConfig', function () {
    it('Empty config form hide_project', function () {
        cy.logout();

        cy.request({
            url: '/index.php/lizmap/service/getProjectConfig?repository=testsrepository&project=hide_project',
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.eq('application/json')

            expect(resp.body).to.have.property('metadata')
            expect(resp.body.metadata).to.have.property('lizmap_plugin_version')
            expect(resp.body.metadata).to.have.property('lizmap_plugin_version_str')
            expect(resp.body.metadata).to.have.property('lizmap_web_client_target_version')
            expect(resp.body.metadata).to.have.property('project_valid')
            expect(resp.body.metadata).to.have.property('qgis_desktop_version')

            expect(resp.body).to.have.property('options')
            expect(resp.body.options).to.have.property('hideProject', 'True')
            expect(resp.body.options).to.have.property('bbox')
            expect(resp.body.options).to.have.property('initialExtent')
            expect(resp.body.options).to.have.property('mapScales')
            expect(resp.body.options).to.have.property('minScale')
            expect(resp.body.options).to.have.property('maxScale')
            expect(resp.body.options).to.have.property('projection')
            expect(resp.body.options).to.have.property('pointTolerance')
            expect(resp.body.options).to.have.property('lineTolerance')
            expect(resp.body.options).to.have.property('polygonTolerance')
            expect(resp.body.options).to.have.property('popupLocation')
            expect(resp.body.options).to.have.property('datavizLocation')
            expect(resp.body.options).to.have.property('wmsMaxHeight')
            expect(resp.body.options).to.have.property('wmsMaxWidth')

            expect(resp.body).to.have.property('layers')
            expect(resp.body.layers).to.be.empty

            expect(resp.body).to.have.property('locateByLayer')
            expect(resp.body.locateByLayer).to.be.empty

            expect(resp.body).to.have.property('attributeLayers')
            expect(resp.body.attributeLayers).to.be.empty

            expect(resp.body).to.have.property('timemanagerLayers')
            expect(resp.body.timemanagerLayers).to.be.empty

            expect(resp.body).to.have.property('relations')
            expect(resp.body.relations).to.have.property('pivot')
            expect(resp.body.relations.pivot).to.be.empty

            expect(resp.body).to.have.property('printTemplates')
            expect(resp.body.printTemplates).to.be.empty

            expect(resp.body).to.have.property('tooltipLayers')
            expect(resp.body.timemanagerLayers).to.be.empty

            expect(resp.body).to.have.property('formFilterLayers')
            expect(resp.body.formFilterLayers).to.be.empty

            expect(resp.body).to.have.property('datavizLayers')
            expect(resp.body.datavizLayers).to.have.property('locale')
            expect(resp.body.datavizLayers.locale).to.be.not.empty
            expect(resp.body.datavizLayers).to.have.property('layers')
            expect(resp.body.datavizLayers.layers).to.be.empty
            expect(resp.body.datavizLayers).to.have.property('dataviz')
            expect(resp.body.datavizLayers.dataviz).to.be.empty

            expect(resp.body).to.have.property('loginFilteredLayers')
            expect(resp.body.loginFilteredLayers).to.be.empty
        })
    })

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
