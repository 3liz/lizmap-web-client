describe('Advanced form', function () {
    beforeEach(function () {
        // Runs before each tests in the block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=form_advanced')

        cy.get('#button-edition').click()
        cy.get('#edition-draw').click()
    })

    it('should toggle tab visibility when toggling checkbox', function () {
        cy.get("#jforms_view_edition-tabs li:contains('photo')").should('not.be.visible')
        cy.get("#jforms_view_edition_has_photo").should('not.be.checked')

        // 't' is a legacy value meaning true. This might change in future
        cy.get("#jforms_view_edition_has_photo").should('have.value', 't')

        cy.get("#jforms_view_edition_has_photo").click()

        cy.get("#jforms_view_edition-tabs li:contains('photo')").should('be.visible')
        cy.get("#jforms_view_edition_has_photo").should('be.checked')

        cy.get("#jforms_view_edition_has_photo").click()

        cy.get("#jforms_view_edition-tabs li:contains('photo')").should('not.be.visible')
        cy.get("#jforms_view_edition_has_photo").should('not.be.checked')
    })
})
