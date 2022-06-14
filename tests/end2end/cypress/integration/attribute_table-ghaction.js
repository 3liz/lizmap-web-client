describe('Attribute table', () => {
    beforeEach(() => {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=attribute_table')

        cy.get('#button-attributeLayers').click()
    })

    it('should have correct column order', () => {

        const correct_column_order = ['', '', '', 'quartier', 'quartmno', 'libquart', 'photo', 'url'];

        // postgreSQL layer
        cy.get('button[value="quartiers"].btn-open-attribute-layer').click({ force: true })

        cy.get('#attribute-layer-table-quartiers_wrapper div.dataTables_scrollHead th').then(theaders => {
            const headers = [...theaders].map(t => t.innerText)

            // Test arrays are deeply equal (eql) to test column order
            expect(headers).to.eql(correct_column_order)
        })

        // shapefile layer
        cy.get('button[value="quartiers_shp"].btn-open-attribute-layer').click({ force: true })

        cy.get('#attribute-layer-table-quartiers_shp_wrapper div.dataTables_scrollHead th').then(theaders => {
            const headers = [...theaders].map(t => t.innerText)

            // Test arrays are deeply equal (eql) to test column order
            expect(headers).to.eql(correct_column_order)
        })
    })
})
