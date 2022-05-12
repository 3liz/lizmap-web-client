import {arrayBufferToBase64} from '../support/function.js'

describe('Legend tests', function () {

    it('Test the legend display option expand/hide/disabled', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=layer_legends')

        // Image is already expanded, so the button is to make collapsed
        cy.get("tr#layer-expand_at_startup td a.expander").invoke('attr', 'title').should('eq', 'Collapse')

        // Image is already collapsed, so the button is to make expanded
        cy.get("tr#layer-hide_at_startup td a.expander").invoke('attr', 'title').should('eq', 'Expand')

        // Image is disabled
        cy.get("tr#layer-disabled td").should('exist')
        cy.get("tr#layer-disabled td a.expander").should('not.exist')
    })

    it('Test GetLegendGraphics', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=layer_legends')
        cy.wait(1000) // Let's wait for all GetLegendGraphics first
        // We do not want to test straight the GetLegendGraphic, because we want to check how the URL is built

        const checks = ['layer_legend_single_symbol', 'layer_legend_categorized']

        for (const check of checks) {
            cy.intercept('*GetLegendGraphic*').as('legend')
            cy.get('tr#layer-' + check +' td a.expander').click()

            cy.wait('@legend').then((interception) => {
                expect(interception.response.headers['content-type'], 'expect mime type to be image/png').to.equal('image/png')

                const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)
                cy.fixture('images/treeview/' + check +'.png').then((image) => {
                    expect(image, 'expect legend to be displayed').to.equal(responseBodyAsBase64)
                })
            })
        }
    })
})
