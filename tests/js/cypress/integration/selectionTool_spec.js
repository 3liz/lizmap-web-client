describe('Selection tool', function () {
    before(function () {
        // runs once before the first test in this block
        cy.visit('/index.php/view/map/?repository=montpellier&project=montpellier')
        // Todo wait for map to be fully loaded
        cy.wait(3000)

        cy.get('#button-selectiontool').click()
    })

    // Refresh before
    beforeEach(function () {
        cy.get('.selectiontool-type-refresh').click()
    })

    it('opens selection tool', function () {
        cy.get('#selectiontool').should('be.visible')

        cy.get('.selectiontool-unselect').should('have.attr', 'disabled')
        cy.get('.selectiontool-filter').should('have.attr', 'disabled')
    })

    // TODO: handle drag with cypress
    // it('selects with rectangle', function () {
    //     cy.get('#selectiontool-query-box').click()
    //     cy.get('#map')
    //     .trigger('mousedown', 750, 150, { button: 0})
    //     .trigger('mousemove', 700, 200, { button: 0})
    //     .trigger('mouseup')
    // })

    it('selects one feature then two more features then unselects one with polygon', function () {
        // Select one feature...
        cy.get('lizmap-selection-tool .selectiontool-layer-list').select('tramstop')

        cy.get('.selectiontool-query-polygon').click()

        cy.get('#map')
            .click(750, 150)
            .click(700, 200)
            .dblclick(700, 150)

        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^1/)
        })

        cy.get('.selectiontool-unselect').should('not.have.attr', 'disabled')
        cy.get('.selectiontool-filter').should('not.have.attr', 'disabled')

        // ...then two more features...
        cy.get('.selectiontool-query-polygon').click()
        cy.get('.selectiontool-type-plus').click()

        cy.get('#map')
            .click(750, 180)
            .click(700, 210)
            .dblclick(750, 220)

        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^3/)
        })

        // ...then unselects one feature
        cy.get('.selectiontool-query-polygon').click()
        cy.get('.selectiontool-type-minus').click()

        cy.get('#map')
            .click(750, 150)
            .click(700, 200)
            .dblclick(700, 150)

        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^2/)
        })
    })

    it('selects two features then unselects all feature', function () {
        // Select two feature...
        cy.get('lizmap-selection-tool .selectiontool-layer-list').select('tramstop')

        cy.get('.selectiontool-query-polygon').click()

        cy.get('#map')
            .click(750, 180)
            .click(700, 210)
            .dblclick(750, 220)

        // ..then unselects all
        cy.get('.selectiontool-unselect').click()

        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).not.to.match(/^[0-9]/)
        })
    })

    it('selects one feature then revert selection', function () {
        // Select one feature...
        cy.get('lizmap-selection-tool .selectiontool-layer-list').select('points of interest')

        cy.get('.selectiontool-query-polygon').click()

        cy.get('#map')
            .click(650, 200)
            .click(600, 230)
            .dblclick(650, 240)

        // ...then invert selection
        cy.get('.selectiontool-invert').click()

        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^5/)
        })

    })

    it('selects multiple selectable layers', function () {
        cy.get('lizmap-selection-tool .selectiontool-layer-list').select('selectable-layers')

        cy.get('.selectiontool-query-polygon').click()

        cy.get('#map')
            .click(750, 150)
            .click(700, 200)
            .dblclick(800, 300)

        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^10/)
        })

    })

    it('filters one feature from attribute table', function () {
        cy.get('#button-attributeLayers').click()
        cy.get('#attribute-layer-list-table button[value="tramstop"]').click({ force: true })

        // this event will automatically be unbound when this
        // test ends because it's attached to 'cy'
        // TODO : fix the error in datatables "Uncaught TypeError: Cannot read property 'style' of undefined"
        cy.on('uncaught:exception', (err, runnable) => {
            // using mocha's async done callback to finish
            // this test so we prove that an uncaught exception
            // was thrown
            done()

            // return false to prevent the error from
            // failing this test
            return false
        })

        cy.get('#attribute-layer-table-tramstop .attribute-layer-feature-select').first().click({ force: true })
        cy.get('.btn-filter-attributeTable').click({ force: true })

        cy.wait(1000)

        cy.get('.selectiontool-filter').should('not.have.attr', 'disabled')
        cy.get('.selectiontool-filter').should('have.class', 'active')

    })

    it('selects multiple selectable and visible layers', function () {
        // Stub getProjectConfig request to have a new Lizmap configuration with less visible layers
        cy.server()
        cy.route('GET', 'index.php/lizmap/service/getProjectConfig?repository=montpellier&project=montpellier', 'fixture:getProjectConfig.json')
        // runs once before the first test in this block
        cy.visit('/index.php/view/map/?repository=montpellier&project=montpellier')
        // Todo wait for map to be fully loaded
        cy.wait(3000)

        cy.get('#button-selectiontool').click()

        cy.get('lizmap-selection-tool .selectiontool-layer-list').select('selectable-visible-layers')

        cy.get('.selectiontool-query-polygon').click()

        cy.get('#map')
            .click(750, 150)
            .click(700, 200)
            .dblclick(800, 300)

        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^8/)
        })

    })
})
