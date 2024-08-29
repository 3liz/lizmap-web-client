describe('Attribute table', () => {
    beforeEach(() => {
        cy.intercept('POST', '*service*', (req) => {
            if (typeof req.body == 'string') {
                const req_body = req.body.toLowerCase()
                if (req_body.includes('service=wms')) {
                    if (req_body.includes('request=getfeatureinfo'))
                        req.alias = 'postGetFeatureInfo'
                    else if (req_body.includes('request=getselectiontoken'))
                        req.alias = 'postGetSelectionToken'
                    else if (req_body.includes('request=getfiltertoken'))
                        req.alias = 'postGetFilterToken'
                    else
                        req.alias = 'postToService'
                } else if (req_body.includes('service=wfs')) {
                    if (req_body.includes('request=getfeature'))
                        req.alias = 'postGetFeature'
                    else if (req_body.includes('request=describefeaturetype'))
                        req.alias = 'postDescribeFeatureType'
                    else
                        req.alias = 'postToService'
                } else
                    req.alias = 'postToService'
            } else
                req.alias = 'postToService'
        })

        cy.intercept('*REQUEST=GetMap*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMap')

        cy.visit('/index.php/view/map/?repository=testsrepository&project=attribute_table')

        // Wait for map displayed
        cy.wait('@getMap')

        cy.get('#button-attributeLayers').click()
    })

    it('should have correct column order', () => {

        // shapefile layer
        cy.get('button[value="quartiers_shp"].btn-open-attribute-layer').click({ force: true })

        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers_shp')
                .to.contain('OUTPUTFORMAT=GeoJSON')
        })

        cy.get('#attribute-layer-table-quartiers_shp_wrapper div.dataTables_scrollHead th').then(theaders => {
            const headers = [...theaders].map(t => t.innerText)
            const correct_column_order = ['', 'quartmno', 'libquart', 'photo', 'url', 'thumbnail'];

            // Test arrays are deeply equal (eql) to test column order
            expect(headers).to.eql(correct_column_order)
        })

        // attribute table config
        // postgreSQL layer
        cy.get('button[value="Les_quartiers_a_Montpellier"].btn-open-attribute-layer').click({ force: true })

        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers')
                .to.contain('OUTPUTFORMAT=GeoJSON')
        })

        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier_wrapper div.dataTables_scrollHead th').then(theaders => {
            const headers = [...theaders].map(t => t.innerText)
            const correct_column_order = ['', 'quartier', 'quartmno', 'libquart', 'thumbnail', 'url', 'photo'];

            // Test arrays are deeply equal (eql) to test column order
            expect(headers).to.eql(correct_column_order)
        })
    })

    it('should select / filter / refresh', () => {

        cy.get('#bottom-dock-window-buttons .btn-bottomdock-size').click()

        // PostgreSQL layer
        cy.get('button[value="Les_quartiers_a_Montpellier"].btn-open-attribute-layer').click({ force: true })

        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers')
                .to.contain('OUTPUTFORMAT=GeoJSON')
        })

        // Check table lines
        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr').should('have.length', 7)

        // select feature 2
        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier tr[id="2"] lizmap-feature-toolbar .feature-select').click({ force: true })
        // Check WMS GetSelectionToken request
        // and store the selection token
        let selectiontoken = ''
        cy.wait('@postGetSelectionToken').then((interception) => {
            expect(interception.request.body)
                .to.contain('service=WMS')
                .to.contain('request=GETSELECTIONTOKEN')
                .to.contain('typename=quartiers')
                .to.contain('ids=2')
            expect(interception.response.body)
                .to.have.property('token')
            expect(interception.response.body.token).to.be.not.null
            selectiontoken = interception.response.body.token
        })
        // Check that GetMap is requested with the selection token
        cy.wait('@getMap').then((interception) => {
            const req_url = new URL(interception.request.url)
            expect(req_url.searchParams.get('SELECTIONTOKEN')).to.be.eq(selectiontoken)
        })

        // filter
        cy.get('#attribute-layer-main-Les_quartiers_a_Montpellier .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })

        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers')
                .to.contain('OUTPUTFORMAT=GeoJSON')
                .to.contain('EXP_FILTER=%24id+IN+%28+2+%29')
            expect(interception.response.body)
                .to.have.property('type')
            expect(interception.response.body.type).to.be.eq('FeatureCollection')
            expect(interception.response.body)
                .to.have.property('features')
            expect(interception.response.body.features).to.have.length(1)
        })
        // Check WMS GetFilterToken request
        // and store the filter token
        let filtertoken = ''
        cy.wait('@postGetFilterToken').then((interception) => {
            expect(interception.request.body)
                .to.contain('service=WMS')
                .to.contain('request=GETFILTERTOKEN')
                .to.contain('typename=quartiers')
                .to.contain('filter=quartiers%3A%22quartier%22+IN+%28+2+%29')
            expect(interception.response.body)
                .to.have.property('token')
            expect(interception.response.body.token).to.be.not.null
            filtertoken = interception.response.body.token
        })
        // Check that GetMap is requested without the selection token
        cy.wait('@getMap').then((interception) => {
            const req_url = new URL(interception.request.url)
            expect(req_url.searchParams.get('SELECTIONTOKEN')).to.be.null
            expect(req_url.searchParams.get('FILTERTOKEN')).to.be.null
        })
        // Check that GetMap is requested with the filter token
        cy.wait('@getMap').then((interception) => {
            const req_url = new URL(interception.request.url)
            expect(req_url.searchParams.get('FILTERTOKEN')).to.be.eq(filtertoken)
        })

        // check background
        cy.get('[data-testid="Les quartiers à Montpellier"] div.node').should('have.class', 'filtered')

        // Check table lines
        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr').should('have.length', 1)

        // refresh
        cy.get('#attribute-layer-main-Les_quartiers_a_Montpellier .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })

        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers')
                .to.contain('OUTPUTFORMAT=GeoJSON')
                .to.not.contain('EXP_FILTER')
            expect(interception.response.body)
                .to.have.property('type')
            expect(interception.response.body.type).to.be.eq('FeatureCollection')
            expect(interception.response.body)
                .to.have.property('features')
            expect(interception.response.body.features).to.have.length(7)
            // the virtual field exists
            expect(interception.response.body.features[1].properties).to.have.property('thumbnail')
            // the content of the field is ok
            expect(interception.response.body.features[1].properties.thumbnail).to.contain('img class="data-attr-thumbnail"');
            // the 'onload' value is here (ie whole content is here)
            expect(interception.response.body.features[1].properties.thumbnail).to.contain("BAD_CODE");
        })
        // Check that GetMap is requested without the filter token
        cy.wait('@getMap').then((interception) => {
            const req_url = new URL(interception.request.url)
            expect(req_url.searchParams.get('SELECTIONTOKEN')).to.be.null
            expect(req_url.searchParams.get('FILTERTOKEN')).to.be.null
        })

        // check background
        cy.get('[data-testid="Les quartiers à Montpellier"] div.node').should('not.have.class', 'filtered')

        // Check table lines
        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr').should('have.length', 7)
        // Attribute table config changes virtual field position form last one to 5th
        // the virtual field is here with good attribute (data-src)
        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr:nth-child(1) td:nth-child(5) img[data-src]').should('exist')
        // the onload attribute have disappeared
        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr:nth-child(1) td:nth-child(5) img[onload]').should('not.exist')

        // select feature 2,4,6
        // click to select 2
        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier tr[id="2"] lizmap-feature-toolbar .feature-select').click({ force: true })// Check WMS GetSelectionToken request
        // Check WMS GetSelectionToken request
        // and store the selection token
        selectiontoken = ''
        cy.wait('@postGetSelectionToken').then((interception) => {
            expect(interception.request.body)
                .to.contain('service=WMS')
                .to.contain('request=GETSELECTIONTOKEN')
                .to.contain('typename=quartiers')
                .to.contain('ids=2')
            expect(interception.response.body)
                .to.have.property('token')
            expect(interception.response.body.token).to.be.not.null
            selectiontoken = interception.response.body.token
        })
        // Check that GetMap is requested with the selection token
        cy.wait('@getMap').then((interception) => {
            const req_url = new URL(interception.request.url)
            expect(req_url.searchParams.get('SELECTIONTOKEN')).to.be.eq(selectiontoken)
        })
        // click to select 4
        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier tr[id="4"] lizmap-feature-toolbar .feature-select').click({ force: true })
        // Check WMS GetSelectionToken request
        // and store the selection token
        cy.wait('@postGetSelectionToken').then((interception) => {
            expect(interception.request.body)
                .to.contain('service=WMS')
                .to.contain('request=GETSELECTIONTOKEN')
                .to.contain('typename=quartiers')
                .to.contain('ids=2%2C4')
            expect(interception.response.body)
                .to.have.property('token')
            expect(interception.response.body.token).to.be.not.null
            selectiontoken = interception.response.body.token
        })
        // Check that GetMap is requested with the selection token
        cy.wait('@getMap').then((interception) => {
            const req_url = new URL(interception.request.url)
            expect(req_url.searchParams.get('SELECTIONTOKEN')).to.be.eq(selectiontoken)
        })
        // click to select 6
        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier tr[id="6"] lizmap-feature-toolbar .feature-select').click({ force: true })
        // Check WMS GetSelectionToken request
        // and store the selection token
        cy.wait('@postGetSelectionToken').then((interception) => {
            expect(interception.request.body)
                .to.contain('service=WMS')
                .to.contain('request=GETSELECTIONTOKEN')
                .to.contain('typename=quartiers')
                .to.contain('ids=2%2C4%2C6')
            expect(interception.response.body)
                .to.have.property('token')
            expect(interception.response.body.token).to.be.not.null
            selectiontoken = interception.response.body.token
        })
        // Check that GetMap is requested with the selection token
        cy.wait('@getMap').then((interception) => {
            const req_url = new URL(interception.request.url)
            expect(req_url.searchParams.get('SELECTIONTOKEN')).to.be.eq(selectiontoken)
        })

        // filter
        cy.get('#attribute-layer-main-Les_quartiers_a_Montpellier .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })

        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers')
                .to.contain('OUTPUTFORMAT=GeoJSON')
                .to.contain('EXP_FILTER=%24id+IN+%28+2+%2C+4+%2C+6+%29')
            expect(interception.response.body)
                .to.have.property('type')
            expect(interception.response.body.type).to.be.eq('FeatureCollection')
            expect(interception.response.body)
                .to.have.property('features')
            expect(interception.response.body.features).to.have.length(3)
        })
        // Check WMS GetFilterToken request
        // and store the filter token
        filtertoken = ''
        cy.wait('@postGetFilterToken').then((interception) => {
            expect(interception.request.body)
                .to.contain('service=WMS')
                .to.contain('request=GETFILTERTOKEN')
                .to.contain('typename=quartiers')
                .to.contain('filter=quartiers%3A%22quartier%22+IN+%28+2+%2C+6+%2C+4+%29')
            expect(interception.response.body)
                .to.have.property('token')
            expect(interception.response.body.token).to.be.not.null
            filtertoken = interception.response.body.token
        })
        // Check that GetMap is requested without the selection token
        cy.wait('@getMap').then((interception) => {
            const req_url = new URL(interception.request.url)
            expect(req_url.searchParams.get('SELECTIONTOKEN')).to.be.null
            expect(req_url.searchParams.get('FILTERTOKEN')).to.be.null
        })
        // Check that GetMap is requested with the filter token
        cy.wait('@getMap').then((interception) => {
            const req_url = new URL(interception.request.url)
            expect(req_url.searchParams.get('FILTERTOKEN')).to.be.eq(filtertoken)
        })

        // check background
        cy.get('[data-testid="Les quartiers à Montpellier"] div.node').should('have.class', 'filtered')

        // Check table lines
        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr').should('have.length', 3)

        // close the tab
        cy.get('#nav-tab-attribute-layer-Les_quartiers_a_Montpellier .btn-close-attribute-tab').click({ force: true })

        // reopen the tab
        cy.get('button[value="Les_quartiers_a_Montpellier"].btn-open-attribute-layer').click({ force: true })
        // The content of the table has to be fetched again
        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers')
                .to.contain('OUTPUTFORMAT=GeoJSON')
                .to.contain('EXP_FILTER=%24id+IN+%28+2+%2C+4+%2C+6+%29+')
            expect(interception.response.body)
                .to.have.property('type')
            expect(interception.response.body.type).to.be.eq('FeatureCollection')
            expect(interception.response.body)
                .to.have.property('features')
            expect(interception.response.body.features).to.have.length(3)
        })

        // check that the layer is filtered
        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr').should('have.length', 3)

        // refresh
        cy.get('#attribute-layer-main-Les_quartiers_a_Montpellier .attribute-layer-action-bar .btn-filter-attributeTable').first().click({ force: true })

        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers')
                .to.contain('OUTPUTFORMAT=GeoJSON')
                .to.not.contain('EXP_FILTER')
            expect(interception.response.body)
                .to.have.property('type')
            expect(interception.response.body.type).to.be.eq('FeatureCollection')
            expect(interception.response.body)
                .to.have.property('features')
            expect(interception.response.body.features).to.have.length(7)
        })
        // Check that GetMap is requested without the filter token
        cy.wait('@getMap').then((interception) => {
            const req_url = new URL(interception.request.url)
            expect(req_url.searchParams.get('SELECTIONTOKEN')).to.be.null
            expect(req_url.searchParams.get('FILTERTOKEN')).to.be.null
        })

        // check background
        cy.get('[data-testid="Les quartiers à Montpellier"] div.node').should('not.have.class', 'filtered')

        // Check table lines
        cy.get('#attribute-layer-table-Les_quartiers_a_Montpellier tbody tr').should('have.length', 7)

        // Go to tables tab to open an other table
        cy.get('#nav-tab-attribute-summary').click({ force: true })

        // Shapefile layer
        cy.get('button[value="quartiers_shp"].btn-open-attribute-layer').click({ force: true })

        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers_shp')
                .to.contain('OUTPUTFORMAT=GeoJSON')
                .to.not.contain('EXP_FILTER')
            expect(interception.response.body)
                .to.have.property('type')
            expect(interception.response.body.type).to.be.eq('FeatureCollection')
            expect(interception.response.body)
                .to.have.property('features')
            expect(interception.response.body.features).to.have.length(7)
        })

        // Check table lines
        cy.get('#attribute-layer-table-quartiers_shp tbody tr').should('have.length', 7)

        // select feature 2
        cy.get('#attribute-layer-table-quartiers_shp tr[id="2"] lizmap-feature-toolbar .feature-select').click({ force: true })
        // Check WMS GetSelectionToken request
        cy.wait('@postGetSelectionToken').then((interception) => {
            expect(interception.request.body)
                .to.contain('service=WMS')
                .to.contain('request=GETSELECTIONTOKEN')
                .to.contain('typename=quartiers_shp')
                .to.contain('ids=2')
            expect(interception.response.body)
                .to.have.property('token')
            expect(interception.response.body.token).to.be.not.null
        })

        // filter
        cy.get('#attribute-layer-main-quartiers_shp .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })
        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers_shp')
                .to.contain('OUTPUTFORMAT=GeoJSON')
                .to.contain('EXP_FILTER=%24id+IN+%28+2+%29')
            expect(interception.response.body)
                .to.have.property('type')
            expect(interception.response.body.type).to.be.eq('FeatureCollection')
            expect(interception.response.body)
                .to.have.property('features')
            expect(interception.response.body.features).to.have.length(1)
        })
        // Check WMS GetFilterToken request
        cy.wait('@postGetFilterToken').then((interception) => {
            expect(interception.request.body)
                .to.contain('service=WMS')
                .to.contain('request=GETFILTERTOKEN')
                .to.contain('typename=quartiers')
                .to.contain('filter=quartiers_shp%3A%22quartier%22+IN+%28+3+%29')
            expect(interception.response.body)
                .to.have.property('token')
            expect(interception.response.body.token).to.be.not.null
        })

        // check background
        cy.get('#node-quartiers_shp ~ div.node').should('have.class', 'filtered')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers_shp tbody tr').should('have.length', 1)

        // refresh
        cy.get('#attribute-layer-main-quartiers_shp .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })
        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers_shp')
                .to.contain('OUTPUTFORMAT=GeoJSON')
                .to.not.contain('EXP_FILTER')
            expect(interception.response.body)
                .to.have.property('type')
            expect(interception.response.body.type).to.be.eq('FeatureCollection')
            expect(interception.response.body)
                .to.have.property('features')
            expect(interception.response.body.features).to.have.length(7)
        })

        // check background
        cy.get('#node-quartiers_shp ~ div.node').should('not.have.class', 'filtered')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers_shp tbody tr').should('have.length', 7)

        // select feature 2,4,6
        // Click to select 2
        cy.get('#attribute-layer-table-quartiers_shp tr[id="2"] lizmap-feature-toolbar .feature-select').click({ force: true })
        // Check WMS GetSelectionToken request
        cy.wait('@postGetSelectionToken').then((interception) => {
            expect(interception.request.body)
                .to.contain('service=WMS')
                .to.contain('request=GETSELECTIONTOKEN')
                .to.contain('typename=quartiers_shp')
                .to.contain('ids=2')
            expect(interception.response.body)
                .to.have.property('token')
            expect(interception.response.body.token).to.be.not.null
        })
        // Click to select 4
        cy.get('#attribute-layer-table-quartiers_shp tr[id="4"] lizmap-feature-toolbar .feature-select').click({ force: true })
        // Check WMS GetSelectionToken request
        cy.wait('@postGetSelectionToken').then((interception) => {
            expect(interception.request.body)
                .to.contain('service=WMS')
                .to.contain('request=GETSELECTIONTOKEN')
                .to.contain('typename=quartiers_shp')
                .to.contain('ids=2%2C4')
            expect(interception.response.body)
                .to.have.property('token')
            expect(interception.response.body.token).to.be.not.null
        })
        // Click to select 6
        cy.get('#attribute-layer-table-quartiers_shp tr[id="6"] lizmap-feature-toolbar .feature-select').click({ force: true })
        // Check WMS GetSelectionToken request
        cy.wait('@postGetSelectionToken').then((interception) => {
            expect(interception.request.body)
                .to.contain('service=WMS')
                .to.contain('request=GETSELECTIONTOKEN')
                .to.contain('typename=quartiers_shp')
                .to.contain('ids=2%2C4%2C6')
            expect(interception.response.body)
                .to.have.property('token')
            expect(interception.response.body.token).to.be.not.null
        })

        // filter
        cy.get('#attribute-layer-main-quartiers_shp .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })
        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers')
                .to.contain('OUTPUTFORMAT=GeoJSON')
                .to.contain('EXP_FILTER=%24id+IN+%28+2+%2C+4+%2C+6+%29')
            expect(interception.response.body)
                .to.have.property('type')
            expect(interception.response.body.type).to.be.eq('FeatureCollection')
            expect(interception.response.body)
                .to.have.property('features')
            expect(interception.response.body.features).to.have.length(3)
        })
        // Check WMS GetFilterToken request
        cy.wait('@postGetFilterToken').then((interception) => {
            expect(interception.request.body)
                .to.contain('service=WMS')
                .to.contain('request=GETFILTERTOKEN')
                .to.contain('typename=quartiers')
                .to.contain('filter=quartiers_shp%3A%22quartier%22+IN+%28+3+%2C+7+%2C+4+%29')
            expect(interception.response.body)
                .to.have.property('token')
            expect(interception.response.body.token).to.be.not.null
        })

        // check background
        cy.get('#node-quartiers_shp ~ div.node').should('have.class', 'filtered')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers_shp tbody tr').should('have.length', 3)

        // refresh
        cy.get('#attribute-layer-main-quartiers_shp .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })
        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers_shp')
                .to.contain('OUTPUTFORMAT=GeoJSON')
                .to.not.contain('EXP_FILTER')
            expect(interception.response.body)
                .to.have.property('type')
            expect(interception.response.body.type).to.be.eq('FeatureCollection')
            expect(interception.response.body)
                .to.have.property('features')
            expect(interception.response.body.features).to.have.length(7)
        })

        // check background
        cy.get('#node-quartiers_shp ~ div.node').should('not.have.class', 'filtered')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers_shp tbody tr').should('have.length', 7)

        // Go to quartiers tab
        cy.get('#nav-tab-attribute-layer-Les_quartiers_a_Montpellier').click({ force: true })
    })
})
