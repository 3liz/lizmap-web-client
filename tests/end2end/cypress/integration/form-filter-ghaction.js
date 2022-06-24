describe('Form filter', () => {
    it('Test the form filter with checkboxes', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=form_filter')
        cy.get('#button-filter').click()

        const combo = '#liz-filter-field-test_filter'
        const countFeature = '#liz-filter-item-layer-total-count'

        // Default
        cy.get('#liz-filter-item-layer-total-count').should('have.text', '2')
        cy.get(combo + ' > option:nth-child(1)').should('have.text', ' --- ')

        // Select the first one
        cy.get(combo).select('_uvres_d_art_et_monuments_de_l_espace_urbain')
        cy.get(countFeature).should('have.text', '1')

        // Reset
        cy.get('#liz-filter-unfilter').click()
        cy.get(countFeature).should('have.text', '2')

        // Select the second one
        cy.get(combo).select('simple_label')
        cy.get(countFeature).should('have.text', '1')

        // Disable combobox
        cy.get('div#liz-filter-box-test_filter button.btn-primary:nth-child(2)').click()
        cy.get(countFeature).should('have.text', '2')
    })
})
