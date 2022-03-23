describe('Form relational values', function() {
    beforeEach(function(){
        // Runs before each tests in the block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=form_type_relational_value')
        // Start by launching feature form
        cy.get('#button-edition').click()
        cy.get('#edition-draw').click()
    })

    it('Checkboxes relational values', function () {
        cy.get('#jforms_view_edition_test_label').should('not.have.class', 'jforms-required')
        cy.get('#jforms_view_edition input[name="test[]"]').should('have.length', 3)
        cy.get('#jforms_view_edition label.checkbox.jforms-chkbox.jforms-ctl-test input')
            .should('have.length', 3)
            .should('not.have.class', 'jforms-required')

        cy.get('#jforms_view_edition_test_not_null_only_label').should('have.class', 'jforms-required')
        cy.get('#jforms_view_edition input[name="test_not_null_only[]"]').should('have.length', 3)
        cy.get('#jforms_view_edition label.checkbox.jforms-chkbox.jforms-ctl-test_not_null_only input')
            .should('have.length', 3)
            .should('have.class', 'jforms-required')

        cy.get('#jforms_view_edition_test_empty_value_only_label').should('not.have.class', 'jforms-required')
        cy.get('#jforms_view_edition input[name="test_empty_value_only[]"]').should('have.length', 4)
        cy.get('#jforms_view_edition label.checkbox.jforms-chkbox.jforms-ctl-test_empty_value_only input')
            .should('have.length', 4)
            .should('not.have.class', 'jforms-required')
    })
})
