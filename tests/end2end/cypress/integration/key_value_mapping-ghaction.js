// TODO: those tests are fragile to UI modification as they compare text from HTML

describe('Key/value in attribute table', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=key_value_mapping')

        cy.get('#button-attributeLayers').click()

        cy.get('#bottom-dock-window-buttons .btn-bottomdock-size').click()
    })

    it('must display values instead of key in parent attribute table', function () {

        cy.get('button[value="attribute_table"].btn-open-attribute-layer').click({ force: true })

        cy.get('#attribute-layer-table-attribute_table_wrapper div.dataTables_scrollHead th').then(theaders => {
            expect(theaders).to.have.length(11)
            const headers = [...theaders].map(t => t.innerText)
            expect(headers).to.have.length(11)
            expect(headers).to.include.members([
                'id',
                'label_from_array_int_multiple_value_relation',
                'label_from_array_text_multiple_value_relation',
                'label from int (relation reference)',
                'label from int (value map)',
                'label from int (value relation)',
                'label_from_text_multiple_value_relation',
                'label from text (relation reference)',
                'label from text (value map)',
                'label from text (value relation)'
            ])
            cy.get('#attribute-layer-table-attribute_table_wrapper div.dataTables_scrollBody tr[id="1"] td').then(tdata => {
                expect(tdata).to.have.length(11)
                const data = [...tdata].map(t => t.innerText)
                expect(data).to.have.length(11)
                expect(data).to.include.members([
                    '1',
                    'first',
                    'premier',
                    'one',
                    'one',
                    'first',
                    'premier',
                    'first',
                    'premier',
                    'premier'
                ])
            })
            cy.get('#attribute-layer-table-attribute_table_wrapper div.dataTables_scrollBody tr[id="2"] td').then(tdata => {
                expect(tdata).to.have.length(11)
                const data = [...tdata].map(t => t.innerText)
                expect(data).to.have.length(11)
                expect(data).to.include.members([
                    '2',
                    'second',
                    'deuxième',
                    'two',
                    'two',
                    'second',
                    'deuxième',
                    'second',
                    'deuxième',
                    'deuxième'
                ])
            })
            cy.get('#attribute-layer-table-attribute_table_wrapper div.dataTables_scrollBody tr[id="3"] td').then(tdata => {
                expect(tdata).to.have.length(11)
                const data = [...tdata].map(t => t.innerText)
                expect(data).to.have.length(11)
                expect(data).to.include.members([
                    '3',
                    'third',
                    'troisième',
                    'three',
                    'three',
                    'third',
                    'troisième',
                    'third',
                    'troisième',
                    'troisième'
                ])
            })
            cy.get('#attribute-layer-table-attribute_table_wrapper div.dataTables_scrollBody tr[id="4"] td').then(tdata => {
                expect(tdata).to.have.length(11)
                const data = [...tdata].map(t => t.innerText)
                expect(data).to.have.length(11)
                expect(data).to.include.members([
                    '4',
                    'fourth',
                    'quatrième',
                    'four',
                    'four',
                    'fourth',
                    'quatrième',
                    'first, second, third, fourth',
                    'premier, deuxième, troisième, quatrième',
                    'premier, deuxième, troisième, quatrième'
                ])
            })
        })
    })

    it('must display values instead of key in children attribute table', function () {

        cy.get('button[value="data_integers"].btn-open-attribute-layer').click({ force: true })

        // Main attribute table
        cy.get('#attribute-layer-table-data_integers tbody tr').first().click({ force: true })
        cy.wait(300)

        cy.get('#attribute-layer-table-data_integers-attribute_table_wrapper div.dataTables_scrollBody tbody tr')
            .should('have.length', 1)
            .should('have.attr', 'id').and('equal', '1')
        cy.get('#attribute-layer-table-data_integers-attribute_table_wrapper div.dataTables_scrollHead th').then(theaders => {
            expect(theaders).to.have.length(11)
            const headers = [...theaders].map(t => t.innerText)
            expect(headers).to.have.length(11)
            expect(headers).to.include.members([
                'id',
                'label_from_array_int_multiple_value_relation',
                'label_from_array_text_multiple_value_relation',
                'label from int (relation reference)',
                'label from int (value map)',
                'label from int (value relation)',
                'label_from_text_multiple_value_relation',
                'label from text (relation reference)',
                'label from text (value map)',
                'label from text (value relation)'
            ])
            return cy.get('#attribute-layer-table-data_integers-attribute_table_wrapper div.dataTables_scrollBody tbody tr td')
        }).then(tdata => {
            expect(tdata).to.have.length(11)
            const data = [...tdata].map(t => t.innerText)
            expect(data).to.have.length(11)
            expect(data).to.include.members([
                '1',
                'first',
                'premier',
                'one',
                'one',
                'first',
                'premier',
                'first',
                'premier',
                'premier'
            ])
        })

        // click on a second line
        cy.get('#attribute-layer-table-data_integers tbody tr').first().next().click({ force: true })
        cy.wait(300)
        cy.get('#attribute-layer-table-data_integers-attribute_table_wrapper div.dataTables_scrollBody tbody tr')
            .should('have.length', 1)
            .should('have.attr', 'id').and('equal', '2')
        cy.get('#attribute-layer-table-data_integers-attribute_table_wrapper div.dataTables_scrollBody tbody tr td').then(tdata => {
            expect(tdata).to.have.length(11)
            const data = [...tdata].map(t => t.innerText)
            expect(data).to.have.length(11)
            expect(data).to.include.members([
                '2', 'second', 'deuxième', 'two', 'two', 'second', 'deuxième', 'second', 'deuxième', 'deuxième'
            ])
        })

        // Attribute table in edition mode
        cy.get('#attribute-layer-table-data_integers tbody tr lizmap-feature-toolbar[value="data_integers_ae40b1b1_9f4f_411b_8815_6b29fa580f00.1"] .feature-edit').click({ force: true })

        cy.get('#edition-table-data_integers-attribute_table_wrapper div.dataTables_scrollHead th').then(theaders => {
            expect(theaders).to.have.length(11)
            const headers = [...theaders].map(t => t.innerText)
            expect(headers).to.have.length(11)
            expect(headers).to.include.members([
                'id',
                'label_from_array_int_multiple_value_relation',
                'label_from_array_text_multiple_value_relation',
                'label from int (relation reference)',
                'label from int (value map)',
                'label from int (value relation)',
                'label_from_text_multiple_value_relation',
                'label from text (relation reference)',
                'label from text (value map)',
                'label from text (value relation)'
            ])
            cy.get('#edition-table-data_integers-attribute_table_wrapper div.dataTables_scrollBody tr[id="1"] td').then(tdata => {
                expect(tdata).to.have.length(11)
                const data = [...tdata].map(t => t.innerText)
                expect(data).to.have.length(11)
                expect(data).to.include.members([
                    '1',
                    'first',
                    'premier',
                    'one',
                    'one',
                    'first',
                    'premier',
                    'first',
                    'premier',
                    'premier'
                ])
            })
        })
    })

    it('As children layers are not published in WFS, it must display keys and not values in attribute table shortname', function () {

        cy.get('button[value="attribute_table_shortname"].btn-open-attribute-layer').click({ force: true })

        cy.get('#attribute-layer-table-attribute_table_shortname_wrapper div.dataTables_scrollHead th').then(theaders => {
            expect(theaders).to.have.length(11)
            const headers = [...theaders].map(t => t.innerText)
            expect(headers).to.have.length(11)
            expect(headers).to.include.members([
                'id',
                'label_from_array_int_multiple_value_relation',
                'label_from_array_text_multiple_value_relation',
                'label from int (relation reference)',
                'label from int (value map)',
                'label from int (value relation)',
                'label_from_text_multiple_value_relation',
                'label from text (relation reference)',
                'label from text (value map)',
                'label from text (value relation)'
            ])
            cy.get('#attribute-layer-table-attribute_table_shortname_wrapper div.dataTables_scrollBody tr[id="1"] td').then(tdata => {
                expect(tdata).to.have.length(11)
                const data = [...tdata].map(t => t.innerText)
                expect(data).to.have.length(11)
                expect(data).to.include.members([
                    '1',
                    '1',
                    'first',
                    'one',
                    'one',
                    '1',
                    'first',
                    '{"first"}',
                    '1',
                    'first'
                ])
            })
            cy.get('#attribute-layer-table-attribute_table_shortname_wrapper div.dataTables_scrollBody tr[id="2"] td').then(tdata => {
                expect(tdata).to.have.length(11)
                const data = [...tdata].map(t => t.innerText)
                expect(data).to.have.length(11)
                expect(data).to.include.members([
                    '2',
                    '2',
                    'second',
                    'two',
                    'two',
                    '2',
                    'second',
                    '{"second"}',
                    '2',
                    'second'
                ])
            })
            cy.get('#attribute-layer-table-attribute_table_shortname_wrapper div.dataTables_scrollBody tr[id="3"] td').then(tdata => {
                expect(tdata).to.have.length(11)
                const data = [...tdata].map(t => t.innerText)
                expect(data).to.have.length(11)
                expect(data).to.include.members([
                    '3',
                    '3',
                    'third',
                    'three',
                    'three',
                    '3',
                    'third',
                    '{"third"}',
                    '3',
                    'third'
                ])
            })
            cy.get('#attribute-layer-table-attribute_table_shortname_wrapper div.dataTables_scrollBody tr[id="4"] td').then(tdata => {
                expect(tdata).to.have.length(11)
                const data = [...tdata].map(t => t.innerText)
                expect(data).to.have.length(11)
                expect(data).to.include.members([
                    '4',
                    '4',
                    'fourth',
                    'four',
                    'four',
                    '4',
                    'fourth',
                    '{"first","second","third","fourth"}',
                    '1,2,3,4',
                    'first,second,third,fourth'
                ])
            })
        })
    })
})

describe('Key/value in form filter', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=key_value_mapping')

        cy.get('#button-filter').click()
    })

    it('must display form filter with values instead of keys', function () {

        cy.get('#filter-content .tree').should('have.text', 'label from int (value relation)xfirstsecondthirdfourthlabel from text (value relation)xpremierquatrièmedeuxièmetroisièmelabel from int (value map)xonetwothreefourlabel from text (value map)xtwofourthreeonelabel from int (relation reference)xfirstsecondthirdfourthlabel from text (relation reference)xpremierquatrièmedeuxièmetroisième')
    })
})
