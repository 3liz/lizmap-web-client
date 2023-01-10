describe('Editing relational data', function() {
    beforeEach(function(){
        // Runs before each tests in the block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=form_edit_related_child_data')

        // Intercept
        cy.intercept('*REQUEST=GetFeatureInfo*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getFeatureInfo')
    })

    it('Check the child table has been moved in the expected div', function () {

        // Click on the map to get the popup of District (parent) layer
        cy.mapClick(708, 505)

        // Wait for popup to appear
        cy.wait('@getFeatureInfo')
        cy.wait(200)

        // Intercept editFeature query to wait for its end
        cy.intercept('/index.php/lizmap/edition/editFeature*').as('editFeature')

        // Click on the editing button
        cy.get('#popupcontent lizmap-feature-toolbar[value^="quartiers_532ca573_f719_49a6_b37c_8f590b575fbe"] .feature-edit').click()

        // Wait editFeature query ends + slight delay for UI to be ready
        cy.wait('@editFeature')
        cy.wait(200)

        // Check if the child table has been moved in the correct div
        cy.get('#jforms_view_edition #jforms_view_edition-tab0-group1-relation0 div.attribute-layer-child-content')
            .should('have.length', 1)
    })

})
