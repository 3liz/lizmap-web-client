describe('Form edition all field type', function() {
    beforeEach(function(){
        // Runs before each tests in the block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=form_edition_value_relation_field')
        // Start by launching feature form
        cy.get('#button-edition').click()
        cy.get('#edition-draw').click()
    })

    it('Check initial states', function() {
        cy.log('No expression menulist 4 values + 1 empty value')
        cy.get('#jforms_view_edition_code_without_exp option').should('have.length', 5)
        cy.get('#jforms_view_edition_code_without_exp option').first().should('have.text', '')
            .nextAll().each(($opt, index, $options) => {
                cy.wrap($opt).should('not.have.text', '')
            })

        cy.log('Simple expression menulist 2 values + 1 empty value')
        cy.get('#jforms_view_edition_code_with_simple_exp option').should('have.length', 3)
        cy.get('#jforms_view_edition_code_with_simple_exp option').first().should('have.text', '')
            .nextAll().each(($opt, index, $options) => {
                cy.wrap($opt).should('not.have.text', '')
            })

        cy.log('Parent field menulist 3 values + 1 empty value')
        cy.get('#jforms_view_edition_code_for_drill_down_exp option').should('have.length', 4)
        cy.get('#jforms_view_edition_code_for_drill_down_exp option').first().should('have.text', '')
            .nextAll().each(($opt, index, $options) => {
                cy.wrap($opt).should('not.have.text', '')
            })

        cy.log('Child field menulist 0 value + 1 empty value')
        cy.get('#jforms_view_edition_code_with_drill_down_exp option').should('have.length', 1)
        cy.get('#jforms_view_edition_code_with_drill_down_exp option').first().should('have.text', '')

        cy.log('Geom expression menulist 0 value + 1 empty value')
        cy.get('#jforms_view_edition_code_with_geom_exp option').should('have.length', 1)
        cy.get('#jforms_view_edition_code_with_geom_exp option').first().should('have.text', '')
    })

    it('Child field menulist after parent select', function () {
        // Intercept getListData query to wait for its end
        cy.intercept('/index.php/jelix/jforms/getListData*').as('getListData')

        // Select A in parent field
        cy.get('#jforms_view_edition_code_for_drill_down_exp').select('A').should('have.value', 'A')
        // Wait getListData query ends + slight delay for UI to be ready
        cy.wait('@getListData')
        // Child field menulist 2 values + 1 empty value
        cy.get('#jforms_view_edition_code_with_drill_down_exp option').should('have.length', 3)
        cy.get('#jforms_view_edition_code_with_drill_down_exp option').first().should('have.text', '')
            .nextAll().then(options => {
                const actual = [...options].map(o => o.text)
                expect(actual).to.match(/^Zone A/)
            })

        // Select B in parent field
        cy.get('#jforms_view_edition_code_for_drill_down_exp').select('B').should('have.value', 'B')
        // Wait getListData query ends + slight delay for UI to be ready
        cy.wait('@getListData')
        // Child field menulist 2 values + 1 empty value
        cy.get('#jforms_view_edition_code_with_drill_down_exp option').should('have.length', 3)
        cy.get('#jforms_view_edition_code_with_drill_down_exp option').first().should('have.text', '')
            .nextAll().then(options => {
                const actual = [...options].map(o => o.text)
                expect(actual).to.match(/^Zone B/)
            })

        // Select No Zone in parent field
        cy.get('#jforms_view_edition_code_for_drill_down_exp').select('No Zone').should('have.value', '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}')
        // Wait getListData query ends + slight delay for UI to be ready
        cy.wait('@getListData')
        // Child field menulist 0 value + 1 empty value
        cy.get('#jforms_view_edition_code_with_drill_down_exp option').should('have.length', 1)
    })

    it('Child field menulist after geometry creation', function () {
        // Wait before clicking on the map
        cy.wait(800)

        // Intercept getListData query to wait for its end
        cy.intercept('/index.php/jelix/jforms/getListData*').as('getListData')

        // Click on map as form needs a geometry
        cy.log('Create a geometry over Zone A1')
        cy.get('#map').click(500, 300)
        // Wait getListData query ends + slight delay for UI to be ready
        cy.wait('@getListData')

        cy.get('#jforms_view_edition_code_with_geom_exp option').should('have.length', 2)
        cy.get('#jforms_view_edition_code_with_geom_exp option').first().should('have.text', '')
        cy.get('#jforms_view_edition_code_with_geom_exp option').last().should('have.text', 'Zone A1')

        // Did not achieve to move the geometry so
        // Cancel and open form
        cy.on('window:confirm', () => true);
        cy.get('#jforms_view_edition__submit_cancel').click()
        cy.get('#edition-draw').click()
        cy.wait(800)

        // Click on map as form needs a geometry
        cy.log('Create a geometry over Zone A2')
        cy.get('#map').click(700, 300)
        // Wait getListData query ends + slight delay for UI to be ready
        cy.wait('@getListData')

        cy.get('#jforms_view_edition_code_with_geom_exp option').should('have.length', 2)
        cy.get('#jforms_view_edition_code_with_geom_exp option').first().should('have.text', '')
        cy.get('#jforms_view_edition_code_with_geom_exp option').last().should('have.text', 'Zone A2')

        // Cancel and open form
        cy.on('window:confirm', () => true);
        cy.get('#jforms_view_edition__submit_cancel').click()
        cy.get('#edition-draw').click()
        cy.wait(800)

        // Click on map as form needs a geometry
        cy.log('Create a geometry over Zone B1')
        cy.get('#map').click(500, 500)
        // Wait getListData query ends + slight delay for UI to be ready
        cy.wait('@getListData')

        cy.get('#jforms_view_edition_code_with_geom_exp option').should('have.length', 2)
        cy.get('#jforms_view_edition_code_with_geom_exp option').first().should('have.text', '')
        cy.get('#jforms_view_edition_code_with_geom_exp option').last().should('have.text', 'Zone B1')

        // Cancel and open form
        cy.on('window:confirm', () => true);
        cy.get('#jforms_view_edition__submit_cancel').click()
        cy.get('#edition-draw').click()
        cy.wait(800)

        // Click on map as form needs a geometry
        cy.log('Create a geometry over Zone B2')
        cy.get('#map').click(700, 500)
        // Wait getListData query ends + slight delay for UI to be ready
        cy.wait('@getListData')

        cy.get('#jforms_view_edition_code_with_geom_exp option').should('have.length', 2)
        cy.get('#jforms_view_edition_code_with_geom_exp option').first().should('have.text', '')
        cy.get('#jforms_view_edition_code_with_geom_exp option').last().should('have.text', 'Zone B2')

        // Cancel and open form
        cy.on('window:confirm', () => true);
        cy.get('#jforms_view_edition__submit_cancel').click()
        cy.get('#edition-draw').click()
        cy.wait(800)

        // Click on map as form needs a geometry
        cy.log('Create a geometry outside zones')
        cy.get('#map').click(700, 700)
        // Wait getListData query ends + slight delay for UI to be ready
        cy.wait('@getListData')

        cy.get('#jforms_view_edition_code_with_geom_exp option').should('have.length', 1)
        cy.get('#jforms_view_edition_code_with_geom_exp option').first().should('have.text', '')
    })

})
