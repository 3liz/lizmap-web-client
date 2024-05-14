describe('Theme', () => {

    beforeEach(() => {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=theme')
    })

    it('must display theme1 at startup', () => {
        cy.get('#theme-selector > ul > li.theme').first()
            .should('have.class', 'selected')
            .and('have.text', 'theme1')

        // Assert layer and group are correctly displayed
        cy.get('#group-group1 > td:nth-child(1) > button').should('not.have.class', 'checked')
        cy.get('#layer-sousquartiers > td:nth-child(1) > button').should('not.have.class', 'checked')

        cy.get('#layer-Les_quartiers > td:nth-child(1) > button').should('have.class', 'checked')

        // Assert layer style is correctly selected
        cy.get('#layer-Les_quartiers').click()

        cy.get('#sub-dock select.styleLayer option[value="style1"]').should('have.attr', 'selected')
    })

    it('must display theme2 when selected', () => {
        cy.get('#theme-selector button').click()

        cy.get('#theme-selector > ul > li:nth-child(2)').click()

        cy.get('#theme-selector > ul > li:nth-child(2)')
            .should('have.class', 'selected')
            .and('have.text', 'theme2')

        // Assert layer and group are correctly displayed
        cy.get('#group-group1 > td:nth-child(1) > button').should('have.class', 'checked')
        cy.get('#layer-sousquartiers > td:nth-child(1) > button').should('have.class', 'checked')

        cy.get('#layer-Les_quartiers > td:nth-child(1) > button').should('have.class', 'checked')

        // Assert layer style is correctly selected
        cy.get('#layer-Les_quartiers').click()

        cy.get('#sub-dock select.styleLayer option[value="style2"]').should('have.attr', 'selected')
    })
})
