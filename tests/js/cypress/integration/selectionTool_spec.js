describe('Selection tool', function () {
    before(function () {
        // runs once before the first test in this block
        cy.visit('/')
        // Todo wait for map to be fully loaded
        cy.wait(3000)
    })

    it('open selection tool', function () {
        cy.get('#button-selectiontool').click()
        cy.get('#selectiontool').should('be.visible')

        cy.get('#selectiontool-unselect').should('have.class', 'disabled')
        cy.get('#selectiontool-filter').should('have.class', 'disabled')
    })

    // TODO: handle drag with cypress
    // it('selects with rectangle', function () {
    //     cy.get('#selectiontool-query-box').click()
    //     cy.get('#map')
    //     .trigger('mousedown', 750, 150, { button: 0})
    //     .trigger('mousemove', 700, 200, { button: 0})
    //     .trigger('mouseup')
    // })

    it('selects one feature with polygon', function () {
        cy.get('#selectiontool-query-polygon').click()

        cy.get('#map')
            .click(750,150)
            .click(700,200)
            .dblclick(700,150)

        cy.get('#selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^1/)
        })

        cy.get('#selectiontool-unselect').should('not.have.class','disabled')
        cy.get('#selectiontool-filter').should('not.have.class','disabled')
    })

    it('selects two more features with polygon', function () {
        cy.get('#selectiontool-query-polygon').click()
        cy.get('#selectiontool-type-plus').click()

        cy.get('#map')
            .click(750, 180)
            .click(700, 210)
            .dblclick(750, 220)

        cy.get('#selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^3/)
        })
    })

    it('unselects one features with polygon', function () {
        cy.get('#selectiontool-query-polygon').click()
        cy.get('#selectiontool-type-minus').click()

        cy.get('#map')
            .click(750, 150)
            .click(700, 200)
            .dblclick(700, 150)

        cy.get('#selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^2/)
        })
    })

    it('unselects all feature', function () {
        cy.get('#selectiontool-unselect').click()

        cy.get('#selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).not.to.match(/^[0-9]/)
        })
    })
})
