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

    it('should have expression constraint on field', function () {
        cy.wait(200)
        // Click on map as form needs a geometry
        cy.get('#map').click(650, 400)

        // Type string not valid for expression constraint
        cy.get('#jforms_view_edition_website').type('a')
        cy.get('#jforms_view_edition__submit_submit').click()

        // Assert an error is returned
        cy.get('#jforms_view_edition_website_label').should('have.class', 'jforms-error')
        cy.get('#jforms_view_edition_website').should('have.class', 'jforms-error')
        cy.get('#jforms_view_edition_errors').should('have.class', 'jforms-error-list')
        cy.get('#jforms_view_edition_errors p').should('have.text', "Web site URL must start with 'http'")

        // Type string valid for expression constraint
        cy.get('#jforms_view_edition_website').type('{selectall}{backspace}')
        cy.get('#jforms_view_edition_website').type('https://www.3liz.com')
        cy.get('#jforms_view_edition__submit_submit').click()

        // A message should confirm form had been saved and form selector should be displayed back
        cy.get('#lizmap-edition-message').should('be.visible')
        cy.get('#edition-layer').should('be.visible')

    })
})
