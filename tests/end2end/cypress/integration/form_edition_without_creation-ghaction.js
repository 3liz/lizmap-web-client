describe('Form edition without creation', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=form_edition_without_creation')
        // Display edition
        cy.get('li.edition #button-edition').click()
    })

    it('must allow modification without creation', function () {
        cy.get('#edition-modification-msg').should('be.visible')
        cy.get('#edition-creation').should('not.be.visible')

        // Click on a feature then launch its edition form
        cy.mapClick(630, 325)
        cy.get('.feature-edit').click()

        // Only edition form should be visible...
        cy.get('#edition-modification-msg').should('not.be.visible')
        cy.get('#edition-creation').should('not.be.visible')
        cy.get('.edition-tabs').should('be.visible')

        // ... even after toggling dock visibility
        cy.get('#dock-close').click({force: true})
        cy.get('li.edition #button-edition').click()

        cy.get('#edition-modification-msg').should('not.be.visible')
        cy.get('#edition-creation').should('not.be.visible')
        cy.get('.edition-tabs').should('be.visible')

        // Cancel form edition...
        cy.on('window:confirm', () => true);
        cy.get('#jforms_view_edition__submit_cancel').click()

        // ...returns back to initial state
        cy.get('#edition-modification-msg').should('be.visible')
        cy.get('#edition-creation').should('not.be.visible')
    })
})
