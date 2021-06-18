describe('Form edition', function() {
    beforeEach(function(){
        // Runs before each tests in the block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=form_edition_all_field_type')
        // Start by creating a new feature
        cy.get('#button-edition').click() 
        cy.get('#edition-draw').click()
    })

    /*it('expected error, string', function(){
        // Typing text `foo` in `integer_field` and submit
        cy.get('#jforms_view_edition_integer_field').type('foo')
        cy.get('#jforms_view_edition__submit_submit').click()
        // An error message should warn about invalidity
        cy.get('#jforms_view_edition_errors > p').should('be.visible')
    })

    it('expected error, value too big', function(){
        // Typing `2147483648` value (too big) in `integer_field` and submit
        cy.get('#jforms_view_edition_integer_field').type('2147483648')
        cy.get('#jforms_view_edition__submit_submit').click()
        // An error message should warn about invalidity
        cy.get('#jforms_view_edition_errors > p').should('be.visible')
    })

    it('expected error, negative value too big', function(){
        // Typing `-2147483649` value (negative too big) in `integer_field` and submit
        cy.get('#jforms_view_edition_integer_field').type('-2147483649')
        cy.get('#jforms_view_edition__submit_submit').click()
        // An error message should warn about invalidity
        cy.get('#jforms_view_edition_errors > p').should('be.visible')
    })

    it('success, negative value', function(){
        // Typing negative value `-1` in `integer_field` and submit
        cy.get('#jforms_view_edition_integer_field').type('-1')
        cy.get('#jforms_view_edition__submit_submit').click()
        // A  message should confirm form had been saved
        cy.get('#lizmap-edition-message').should('be.visible')
    })

    it('success,zero value', function(){
        // Typing zero value in `integer_field` and submit
        cy.get('#jforms_view_edition_integer_field').type('0')
        cy.get('#jforms_view_edition__submit_submit').click()
        // A message should confirm form had been saved
        cy.get('#lizmap-edition-message').should('be.visible')
    })

    it('success, positive value', function(){
        // Typing positive value (e.g. '1') in `integer_field` and submit
        cy.get('#jforms_view_edition_integer_field').type('1')
        cy.get('#jforms_view_edition__submit_submit').click()
        // A message should confirm form had been saved
        cy.get('#lizmap-edition-message').should('be.visible')
    })*/

    it('boolean, boolean_notnull_for_checkbox check', function(){
        // `boolean_notnull_for_checkbox` field should be submitted with being checked
        cy.get('#jforms_view_edition_boolean_notnull_for_checkbox').click()
        cy.get('#jforms_view_edition__submit_submit').click()
        cy.get('#lizmap-edition-message').should('be.visible')
    })

   /* it('boolean, boolean_notnull_for_checkbox uncheck', function(){
        // `boolean_notnull_for_checkbox` field should be submitted without being checked
        cy.get('#jforms_view_edition__submit_submit').click()
        cy.get('#lizmap-edition-message').should('be.visible')
    })*/

    it('boolean, dropdown menu', function(){
        // `boolean_nullable` should show a dropdown menu with :
        // * an NULL/empty
        cy.get('#jforms_view_edition_boolean_nullable').select('<NULL>')
        cy.get('#jforms_view_edition_boolean_nullable').should('have.value','{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}')
        // * a true value
        cy.get('#jforms_view_edition_boolean_nullable').select('True')
        cy.get('#jforms_view_edition_boolean_nullable').should('have.value', 'true')
        // * a false value
        cy.get('#jforms_view_edition_boolean_nullable').select('False')
        cy.get('#jforms_view_edition_boolean_nullable').should('have.value', 'false')
    })

})
