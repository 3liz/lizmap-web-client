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

        const correct_column_order = ['', 'quartier', 'quartmno', 'libquart', 'photo', 'url'];

        // postgreSQL layer
        cy.get('button[value="quartiers"].btn-open-attribute-layer').click({ force: true })

        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers')
                .to.contain('OUTPUTFORMAT=GeoJSON')
        })

        cy.get('#attribute-layer-table-quartiers_wrapper div.dataTables_scrollHead th').then(theaders => {
            const headers = [...theaders].map(t => t.innerText)

            // Test arrays are deeply equal (eql) to test column order
            expect(headers).to.eql(correct_column_order)
        })

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

            // Test arrays are deeply equal (eql) to test column order
            expect(headers).to.eql(correct_column_order)
        })
    })

    it('should select / filter / refresh', () => {

        cy.get('#bottom-dock-window-buttons .btn-bottomdock-size').click()

        // PostgreSQL layer
        cy.get('button[value="quartiers"].btn-open-attribute-layer').click({ force: true })

        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers')
                .to.contain('OUTPUTFORMAT=GeoJSON')
        })

        // Check table lines
        cy.get('#attribute-layer-table-quartiers tbody tr').should('have.length', 7)

        // select feature 2
        cy.get('#attribute-layer-table-quartiers tr[id="2"] lizmap-feature-toolbar .feature-select').click({ force: true })
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
        cy.get('#attribute-layer-main-quartiers .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })

        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers')
                .to.contain('OUTPUTFORMAT=GeoJSON')
                .to.contain('EXP_FILTER=%24id+IN+(+2+)')
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
        cy.get('#node-quartiers ~ div.node').should('have.class', 'filtered')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers tbody tr').should('have.length', 1)

        // refresh
        cy.get('#attribute-layer-main-quartiers .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })

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
        cy.get('#node-quartiers ~ div.node').should('not.have.class', 'filtered')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers tbody tr').should('have.length', 7)

        // select feature 2,4,6
        // click to select 2
        cy.get('#attribute-layer-table-quartiers tr[id="2"] lizmap-feature-toolbar .feature-select').click({ force: true })// Check WMS GetSelectionToken request
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
        cy.get('#attribute-layer-table-quartiers tr[id="4"] lizmap-feature-toolbar .feature-select').click({ force: true })
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
        cy.get('#attribute-layer-table-quartiers tr[id="6"] lizmap-feature-toolbar .feature-select').click({ force: true })
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
        cy.get('#attribute-layer-main-quartiers .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })

        // Wait for features
        cy.wait('@postGetFeature').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=quartiers')
                .to.contain('OUTPUTFORMAT=GeoJSON')
                .to.contain('EXP_FILTER=%24id+IN+(+2+%2C+4+%2C+6+)')
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
        cy.get('#node-quartiers ~ div.node').should('have.class', 'filtered')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers tbody tr').should('have.length', 3)

        // close the tab
        cy.get('#nav-tab-attribute-layer-quartiers .btn-close-attribute-tab').click({ force: true })

        // reopen the tab
        cy.get('button[value="quartiers"].btn-open-attribute-layer').click({ force: true })
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
        cy.get('#attribute-layer-table-quartiers tbody tr').should('have.length', 3)

        // refresh
        cy.get('#attribute-layer-main-quartiers .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })

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
        cy.get('#node-quartiers ~ div.node').should('not.have.class', 'filtered')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers tbody tr').should('have.length', 7)

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
                .to.contain('EXP_FILTER=%24id+IN+(+2+)')
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
                .to.contain('EXP_FILTER=%24id+IN+(+2+%2C+4+%2C+6+)')
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
        cy.get('#nav-tab-attribute-layer-quartiers').click({ force: true })
    })
})
