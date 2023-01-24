describe('Drag and drop from', function () {

    beforeEach(function () {
        // Runs before each tests in the block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=dnd_form')

        cy.get('#button-attributeLayers').click()
    })

    it('should not remove data', function () {

        // There is an error with OpenLayers when typing characters in input
        // This avoid test to fail
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        })

        cy.get('button[value="dnd_form_geom"].btn-open-attribute-layer').click({ force: true })

        cy.get('.btn-detail-attributeTable').click({ force: true })
        cy.get('#attribute-layer-table-dnd_form_geom tbody tr').first().click({ force: true })

        cy.get('#attribute-table-panel-dnd_form_geom > div.lizmapPopupSingleFeature > div > table > tbody > tr:nth-child(2) > td').should('not.be.empty')
        cy.get('#attribute-table-panel-dnd_form_geom > div.lizmapPopupSingleFeature > div > table > tbody > tr:nth-child(3) > td').should('not.be.empty')

        // Assert data has not been removed after form submission w/o modification
        cy.get('#attribute-layer-table-dnd_form_geom .feature-edit').click({ force: true })
        cy.get('#jforms_view_edition__submit_submit').click()

        cy.wait(300)

        cy.get('#attribute-table-panel-dnd_form_geom > div.lizmapPopupSingleFeature > div > table > tbody > tr:nth-child(2) > td').should('not.be.empty')
        cy.get('#attribute-table-panel-dnd_form_geom > div.lizmapPopupSingleFeature > div > table > tbody > tr:nth-child(3) > td').should('not.be.empty')

        // Assert data has changed after form submission w modification
        cy.get('#attribute-layer-table-dnd_form_geom .feature-edit').click({ force: true })
        cy.get('#jforms_view_edition-tabs > li:nth-child(2)').click()

        cy.get('#jforms_view_edition_field_in_dnd_form').clear().type('modified')
        cy.get('#jforms_view_edition__submit_submit').click()

        // Click on line to refresh popup info
        cy.get('#attribute-layer-table-dnd_form_geom tbody tr').first().click({ force: true })

        cy.get('#attribute-table-panel-dnd_form_geom > div.lizmapPopupSingleFeature > div > table > tbody > tr:nth-child(2) > td').should('have.text', 'modified')
        cy.get('#attribute-table-panel-dnd_form_geom > div.lizmapPopupSingleFeature > div > table > tbody > tr:nth-child(3) > td').should('have.text', 'test_geom')

        // Write back original data (TODO: refresh database data?)
        cy.wait(300)

        cy.get('#attribute-layer-table-dnd_form_geom .feature-edit').click({ force: true })
        cy.get('#jforms_view_edition-tabs > li:nth-child(2)').click()

        cy.get('#jforms_view_edition_field_in_dnd_form').clear().type('test_geom')
        cy.get('#jforms_view_edition__submit_submit').click()

    })

    it('Try to create a new geom feature from the dock', function () {
        // This will get "wrong" if the test is run many times, we are adding feature
        // New features will be added at the same point

        // Add a new feature from the dock panel
        cy.get('#button-edition').click()
        cy.get('#edition-layer').select('dnd_form_geom')
        cy.get('#edition-draw').click()
        cy.get('#jforms_view_edition-tabs > li:nth-child(2) > a:nth-child(1)').click()
        cy.get('#jforms_view_edition_field_in_dnd_form').type('new value')
        cy.mapClick(900, 300)
        cy.get('#jforms_view_edition__submit_submit').click()

        cy.wait(300)

        // Click on the map, we should have a popup
        cy.mapClick(900, 300)
        cy.get('#popupcontent').should('be.visible')

        // This will get wrong if the test is run many times, we are adding feature
        cy.get('div.lizmapPopupSingleFeature:nth-child(2) > div:nth-child(2)')

        cy.get("div.lizmapPopupSingleFeature:nth-child(2) > div:nth-child(2) > table:nth-child(9)")
            .find("tr")
            .then((row) => {
                // 1 : table header
                // 2 : id
                // 3 : field_in_dnd_form
                // 4 : hidden field field_not_in_dnd_form
                expect(row.length).to.equal(4)
        });

        // Second row
        cy.get('table.table:nth-child(9) > tbody:nth-child(2) > tr:nth-child(2) > th:nth-child(1)').should('be.visible')
        cy.get('table.table:nth-child(9) > tbody:nth-child(2) > tr:nth-child(2) > th:nth-child(1)').contains('field_in_dnd_form')
        cy.get('table.table:nth-child(9) > tbody:nth-child(2) > tr:nth-child(2) > td:nth-child(2)').contains('new value')

        // Third row
        cy.get('table.table:nth-child(9) > tbody:nth-child(2) > tr:nth-child(3) > th:nth-child(1)').should('not.be.visible')
        cy.get('table.table:nth-child(9) > tbody:nth-child(2) > tr:nth-child(2) > th:nth-child(1)').contains('field_not_in_dnd_form')
        cy.get('table.table:nth-child(9) > tbody:nth-child(2) > tr:nth-child(3) > td:nth-child(2)').contains('')
    })

    it('Try to create a new feature with geom from the attribute table panel', function () {
        // This will get "wrong" if the test is run many times, we are adding feature
        // New features will be added at the same point

        cy.get('#attribute-layer-list-table > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > button:nth-child(1)').click({ force: true })

        // Field in
        cy.get('#attribute-layer-table-dnd_form tr[id="1"] td:nth-child(3)').contains('test')

        // Field not in
        cy.get('#attribute-layer-table-dnd_form tr[id="1"] td:nth-child(4)').contains('test')

        // Bug in LWC, to add a new row from scratch, a line must be activated
        cy.get('#attribute-layer-table-dnd_form tr[id="1"]').click({ force: true })

        // Add a new feature
        cy.get('.btn-createFeature-attributeTable').click({ force: true })
        cy.get('#jforms_view_edition-tabs > li:nth-child(2) > a:nth-child(1)').click()
        cy.get('#jforms_view_edition_field_in_dnd_form').type('new value')
        cy.get('#jforms_view_edition__submit_submit').click()
        cy.wait(300)

        // Field in
        cy.get('#attribute-layer-table-dnd_form tr[id="2"] td:nth-child(3)').contains('new value')

        // Field not in
        cy.get('#attribute-layer-table-dnd_form tr[id="2"] td:nth-child(4)').should('be.empty')
    })
})
