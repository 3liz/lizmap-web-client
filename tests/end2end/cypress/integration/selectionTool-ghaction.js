import {arrayBufferToBase64} from '../support/function.js'

describe('Selection tool', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=selection')
    })

    it('should toggle selection tool', function () {
        cy.get('#button-selectiontool').click()
        cy.get('#selectiontool').should('be.visible')

        cy.get('.selectiontool-unselect').should('have.attr', 'disabled')
        cy.get('.selectiontool-filter').should('have.attr', 'disabled')

        cy.get('#button-selectiontool').click()
        cy.get('#selectiontool').should('not.be.visible')
    })

    it('selects features intersecting a polygon', function () {
        cy.get('#button-selectiontool').click()

        // Activate polygon tool
        cy.get('#selectiontool .digitizing-buttons .dropdown-toggle').first().click()
        cy.get('#selectiontool .digitizing-polygon').click()

        // Select single layer and intersects geom operator
        cy.get('lizmap-selection-tool .selectiontool-layer-list').select('selection_polygon')
        cy.get('lizmap-selection-tool .selection-geom-operator').select('intersects')


        // It should select two features
        cy.get('#map')
            .click(200, 350)
            .click(850, 350)
            .dblclick(550, 650)

        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^2/)
        })

        // It should not select any features
        cy.get('#map')
            .click(750, 350)
            .click(700, 400)
            .dblclick(700, 350)

        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).not.to.match(/^[0-9]/)
        })
    })

    // TODO : tests other geom operators, unselection...
})

describe('Selection tool connected as admin', function () {
    beforeEach(function () {
        cy.loginAsAdmin()
        cy.visit('index.php/view/map/?repository=testsrepository&project=selection')
    })

    it('should select the single point on map which turns yellow', function () {
        cy.get('#button-selectiontool').click()

        // Activate polygon tool
        cy.get('#selectiontool .digitizing-buttons .dropdown-toggle').first().click()
        cy.get('#selectiontool .digitizing-polygon').click()

        // Select single layer and intersects geom operator
        cy.get('lizmap-selection-tool .selectiontool-layer-list').select('selection')
        cy.get('lizmap-selection-tool .selection-geom-operator').select('intersects')

        cy.intercept('*REQUEST=GetMap*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('new-selection')

        cy.get('#map')
            .click(380, 280)
            .click(400, 380)
            .dblclick(500, 380)

        cy.wait('@new-selection')

        cy.get('@new-selection').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/selection_yellow.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect selection in yellow').to.equal(responseBodyAsBase64)
            })
        })
    })
})
