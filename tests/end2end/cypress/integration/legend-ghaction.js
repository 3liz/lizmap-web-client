import {arrayBufferToBase64, serverMetadata} from '../support/function.js'

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

})
