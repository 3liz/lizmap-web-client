describe('Form filter', () => {
    it('Test the form filter with checkboxes', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=form_filter')
        cy.get('#button-filter').click()

        cy.intercept('*REQUEST=GetMap*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMap')

        const combo = '#liz-filter-field-test_filter'
        const countFeature = '#liz-filter-item-layer-total-count'

        // Default
        cy.get('#liz-filter-item-layer-total-count').should('have.text', '2')
        cy.get(combo + ' > option:nth-child(1)').should('have.text', ' --- ')

        // Open the attribute tables for the 2 layers
        cy.get('button[value="form_filter"].btn-open-attribute-layer').click({ force: true })
        cy.get('button[value="form_filter_child_bus_stops"].btn-open-attribute-layer').click({ force: true })

        // Select the first one
        cy.get(combo).select('_uvres_d_art_et_monuments_de_l_espace_urbain')
        cy.get(countFeature).should('have.text', '1')

        // Wait for the cascading filter to happen
        cy.wait(300)
        cy.wait('@getMap')

        // Check the attribute table shows only one line
        cy.get('#attribute-layer-table-form_filter tbody tr').should('have.length', 1)

        // Check the child features are filtered too (3 children)
        cy.get('#attribute-layer-table-form_filter_child_bus_stops tbody tr').should('have.length', 3)

        // Reset
        cy.get('#liz-filter-unfilter').click()
        cy.get(countFeature).should('have.text', '2')

        cy.wait('@getMap')

        // Select the second one
        cy.get(combo).select('simple_label')
        cy.get(countFeature).should('have.text', '1')

        // Check the attribute table shows only one line
        cy.wait('@getMap')
        cy.get('#attribute-layer-table-form_filter tbody tr').should('have.length', 1)

        // Check the child features are filtered too (2 children)
        cy.get('#attribute-layer-table-form_filter_child_bus_stops tbody tr').should('have.length', 2)

        // Disable combobox
        cy.get('div#liz-filter-box-test_filter button.btn-primary:nth-child(2)').click()
        cy.get(countFeature).should('have.text', '2')


    })
})
