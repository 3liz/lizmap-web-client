// TODO: those tests are fragile to UI modification as they compare text from HTML

describe('Key/value in attribute table', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=key_value_mapping')

        cy.get('#button-attributeLayers').click()
    })

    it('must display values instead of key in parent attribute table', function () {

        cy.get('button[value="attribute_table"].btn-open-attribute-layer').click({ force: true })

        cy.get('#attribute-layer-table-attribute_table').should('have.text', 'idlabel_from_array_int_multiple_value_relationlabel_from_array_text_multiple_value_relationlabel from int (relation reference)label from int (value map)label from int (value relation)label_from_text_multiple_value_relationlabel from text (relation reference)label from text (value map)label from text (value relation)\n        \n            \n            \n            \n            \n            \n            \n            \n        1firstpremierfirstonefirstpremierpremieronepremier\n        \n            \n            \n            \n            \n            \n            \n            \n        2seconddeuxièmesecondtwoseconddeuxièmedeuxièmetwodeuxième\n        \n            \n            \n            \n            \n            \n            \n            \n        3thirdtroisièmethirdthreethirdtroisièmetroisièmethreetroisième\n        \n            \n            \n            \n            \n            \n            \n            \n        4first, second, third, fourthpremier, deuxième, troisième, quatrièmefourthfourfourthpremier, deuxième, troisième, quatrièmequatrièmefourquatrième')
    })

    it('must display values instead of key in children attribute table', function () {

        cy.get('button[value="data_integers"].btn-open-attribute-layer').click({ force: true })

        // Main attribute table
        cy.get('#attribute-layer-table-data_integers tbody tr').first().click({ force: true })

        cy.get('#attribute-layer-table-data_integers-attribute_table').should('have.text', 'idlabel_from_array_int_multiple_value_relationlabel_from_array_text_multiple_value_relationlabel from int (relation reference)label from int (value map)label from int (value relation)label_from_text_multiple_value_relationlabel from text (relation reference)label from text (value map)label from text (value relation)\n        \n            \n            \n            \n            \n            \n            \n            \n        1firstpremierfirstonefirstpremierpremieronepremier')

        // Attribute table in edition mode
        cy.get('#attribute-layer-table-data_integers tbody tr lizmap-feature-toolbar[value="data_integers_ae40b1b1_9f4f_411b_8815_6b29fa580f00.1"] .feature-edit').click({ force: true })

        cy.get('#edition-table-data_integers-attribute_table').should('have.text', '\n                                            \n                                        idlabel_from_array_int_multiple_value_relationlabel_from_array_text_multiple_value_relationlabel from int (relation reference)label from int (value map)label from int (value relation)label_from_text_multiple_value_relationlabel from text (relation reference)label from text (value map)label from text (value relation)\n        \n            \n            \n            \n            \n            \n            \n            \n        1firstpremierfirstonefirstpremierpremieronepremier')
    })
})

describe('Key/value in form filter', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=key_value_mapping')

        cy.get('#button-filter').click()
    })

    it('must display form filter with values instead of keys', function () {

        cy.get('#filter-content .tree').should('have.text', 'label from int (value relation)x first second third fourthlabel from text (value relation)x premier quatrième deuxième troisièmelabel from int (value map)x one two three fourlabel from text (value map)x two four three onelabel from int (relation reference)x first second third fourthlabel from text (relation reference)x premier quatrième deuxième troisième')
    })
})
