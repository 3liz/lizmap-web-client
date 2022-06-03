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
})
