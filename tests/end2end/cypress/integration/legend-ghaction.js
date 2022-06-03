import {arrayBufferToBase64} from '../support/function.js'

describe('Legend tests', function () {
    it('Test GetLegendGraphics', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=layer_legends')

        // We do not want to test straight the GetLegendGraphic, because we want to check how the URL is built

        const checks = ['layer_legend_single_symbol', 'layer_legend_categorized']

        for (const check of checks) {
            cy.intercept('*GetLegendGraphic*').as('legend')
            cy.get('tr#layer-' + check +'.liz-layer.initialized.parent.collapsed td a.expander').click()

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
