describe('Form edition', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=end2end_form_edition')
        // Todo wait for map to be fully loaded
        cy.wait(1000)
        // Display edition if not active
        cy.get('li.edition #button-edition').click()
    })

    it('must not show digitization tab for non geom layers', function () {
        // Intercept editFeature query to wait for its end
        cy.intercept('/index.php/lizmap/edition/editFeature*').as('editFeature')

        cy.get('#edition-draw').click()

        // Wait editFeature query ends + slight delay for UI to be ready
        cy.wait('@editFeature')
        cy.wait(200)

        cy.get('.edition-tabs a[href="#tabdigitization"]').should('not.be.visible')
    })


    it('submits form and gets success message', function () {
        cy.get('#edition-draw').click()
        cy.get('#jforms_view_edition_value').type('42')
        cy.get('#jforms_view_edition__submit_submit').click()

        // Assert success message is displayed
        cy.get('#message .jelix-msg-item-success').should('be.visible')
    })
})
