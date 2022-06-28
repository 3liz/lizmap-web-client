describe('Attribute table', () => {
    beforeEach(() => {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=attribute_table')

        cy.get('#button-attributeLayers').click()
    })

    it('should have correct column order', () => {

        const correct_column_order = ['', 'quartier', 'quartmno', 'libquart', 'photo', 'url'];

        // postgreSQL layer
        cy.get('button[value="quartiers"].btn-open-attribute-layer').click({ force: true })

        cy.get('#attribute-layer-table-quartiers_wrapper div.dataTables_scrollHead th').then(theaders => {
            const headers = [...theaders].map(t => t.innerText)

            // Test arrays are deeply equal (eql) to test column order
            expect(headers).to.eql(correct_column_order)
        })

        // shapefile layer
        cy.get('button[value="quartiers_shp"].btn-open-attribute-layer').click({ force: true })

        cy.get('#attribute-layer-table-quartiers_shp_wrapper div.dataTables_scrollHead th').then(theaders => {
            const headers = [...theaders].map(t => t.innerText)

            // Test arrays are deeply equal (eql) to test column order
            expect(headers).to.eql(correct_column_order)
        })
    })

    it('should select / filter / refresh', () => {

        cy.intercept('*REQUEST=GetMap*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMap')

        cy.get('#bottom-dock-window-buttons .btn-bottomdock-size').click()

        // postgreSQL layer
        cy.get('button[value="quartiers"].btn-open-attribute-layer').click({ force: true })

        // Check table lines
        cy.get('#attribute-layer-table-quartiers tbody tr').should('have.length', 7)

        // select feature 2
        cy.get('#attribute-layer-table-quartiers tr[id="2"] lizmap-feature-toolbar .feature-select').click({ force: true })
        cy.wait('@getMap')

        // filter
        cy.get('#attribute-layer-main-quartiers .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })
        cy.wait('@getMap')

        // check background
        cy.get('#layer-quartiers').should('have.css', 'background-color', 'rgba(255, 171, 0, 0.4)')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers tbody tr').should('have.length', 1)

        // refresh
        cy.get('#attribute-layer-main-quartiers .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })
        cy.wait('@getMap')

        // check background
        cy.get('#layer-quartiers').should('not.have.css', 'background-color', 'rgba(255, 171, 0, 0.4)')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers tbody tr').should('have.length', 7)

        // select feature 2,4,6
        cy.get('#attribute-layer-table-quartiers tr[id="2"] lizmap-feature-toolbar .feature-select').click({ force: true })
        cy.get('#attribute-layer-table-quartiers tr[id="4"] lizmap-feature-toolbar .feature-select').click({ force: true })
        cy.get('#attribute-layer-table-quartiers tr[id="6"] lizmap-feature-toolbar .feature-select').click({ force: true })
        cy.wait('@getMap')

        // filter
        cy.get('#attribute-layer-main-quartiers .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })
        cy.wait('@getMap')

        // check background
        cy.get('#layer-quartiers').should('have.css', 'background-color', 'rgba(255, 171, 0, 0.4)')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers tbody tr').should('have.length', 3)

        // refresh
        cy.get('#attribute-layer-main-quartiers .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })
        cy.wait('@getMap')

        // check background
        cy.get('#layer-quartiers').should('not.have.css', 'background-color', 'rgba(255, 171, 0, 0.4)')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers tbody tr').should('have.length', 7)

        // Go to tables tab to open an other table
        cy.get('#nav-tab-attribute-summary').click({ force: true })

        // Shapefile layer
        cy.get('button[value="quartiers_shp"].btn-open-attribute-layer').click({ force: true })

        // Check table lines
        cy.get('#attribute-layer-table-quartiers_shp tbody tr').should('have.length', 7)

        // select feature 2
        cy.get('#attribute-layer-table-quartiers_shp tr[id="2"] lizmap-feature-toolbar .feature-select').click({ force: true })

        // filter
        cy.get('#attribute-layer-main-quartiers_shp .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })

        // check background
        cy.get('#layer-quartiers_shp').should('have.css', 'background-color', 'rgba(255, 171, 0, 0.4)')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers_shp tbody tr').should('have.length', 1)

        // refresh
        cy.get('#attribute-layer-main-quartiers_shp .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })

        // check background
        cy.get('#layer-quartiers_shp').should('not.have.css', 'background-color', 'rgba(255, 171, 0, 0.4)')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers_shp tbody tr').should('have.length', 7)

        // select feature 2,4,6
        cy.get('#attribute-layer-table-quartiers_shp tr[id="2"] lizmap-feature-toolbar .feature-select').click({ force: true })
        cy.get('#attribute-layer-table-quartiers_shp tr[id="4"] lizmap-feature-toolbar .feature-select').click({ force: true })
        cy.get('#attribute-layer-table-quartiers_shp tr[id="6"] lizmap-feature-toolbar .feature-select').click({ force: true })

        // filter
        cy.get('#attribute-layer-main-quartiers_shp .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })

        // check background
        cy.get('#layer-quartiers_shp').should('have.css', 'background-color', 'rgba(255, 171, 0, 0.4)')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers_shp tbody tr').should('have.length', 3)

        // refresh
        cy.get('#attribute-layer-main-quartiers_shp .attribute-layer-action-bar .btn-filter-attributeTable').click({ force: true })

        // check background
        cy.get('#layer-quartiers_shp').should('not.have.css', 'background-color', 'rgba(255, 171, 0, 0.4)')

        // Check table lines
        cy.get('#attribute-layer-table-quartiers_shp tbody tr').should('have.length', 7)

        // Go to quartiers tab
        cy.get('#nav-tab-attribute-layer-quartiers').click({ force: true })
    })
})
