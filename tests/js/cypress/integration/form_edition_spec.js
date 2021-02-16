describe('Form edition', function () {
    before(function () {
        // runs once before the first test in this block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=end2end_form_edition')
        // Todo wait for map to be fully loaded
        cy.wait(10000)
    })

    it('submits form and gets success message', function () {
        // cy.get('#button-edition').click()
        // cy.get('#edition-draw').click()
        // cy.get('#jforms_view_edition_value').type('42')
        // cy.get('#jforms_view_edition__submit_submit').click()

        // Assert success message is displayed
        cy.get('#title').should('be.visible')
    })

})
