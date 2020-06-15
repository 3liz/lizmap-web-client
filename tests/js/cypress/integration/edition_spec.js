describe('Edition', function () {
    before(function () {
        // runs once before the first test in this block
        cy.visit('/index.php/view/map/?repository=montpellier&project=montpellier')
        // Todo wait for map to be fully loaded
        cy.wait(3000)

        cy.get('#button-edition').click()
    })

    it('should display message when no geometry on form submition', function () {
        cy.get('#edition-draw').click()

        // Close message if any
        cy.get('#message .close').click()

        cy.get('#jforms_view_edition__submit_submit').click()

        // A message alerting that there is no geometry should be displayed
        cy.get('#lizmap-edition-message').should('be.visible')
    })
})
