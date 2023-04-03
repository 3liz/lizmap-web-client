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
        cy.get('#newOlMap')
            .click(200, 350)
            .click(850, 350)
            .dblclick(550, 650)

        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^2/)
        })

        // It should not select any features
        cy.get('#newOlMap')
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

describe('Selection tool connected as user a', function () {
    beforeEach(function () {
        cy.loginAsUserA()
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

        cy.get('#newOlMap')
            .click(380, 280)
            .click(400, 380)
            .dblclick(500, 380)

        cy.wait('@new-selection').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/selection_yellow.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect selection in yellow').to.equal(responseBodyAsBase64)
            })
        })

        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^1/)
        })
    })
})

describe('Selection tool connected as admin', function () {
    beforeEach(function () {
        cy.loginAsAdmin()
        cy.visit('index.php/view/map/?repository=testsrepository&project=selection')
    })

    it('selects features intersecting a polygon', function () {
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

        cy.get('#newOlMap')
            .click(380, 280)
            .click(400, 380)
            .dblclick(500, 380)

        cy.wait('@new-selection').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/selection-admin-0.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect selection in yellow').to.not.equal(responseBodyAsBase64)
            })

            cy.fixture('images/selection-admin-1.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect selection in yellow').to.equal(responseBodyAsBase64)
            })
        })

        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^1/)
        })

        // Unselect
        cy.get('#selectiontool .selectiontool-unselect').click(true)
        cy.wait('@new-selection').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/selection-admin-1.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect selection in yellow').to.not.equal(responseBodyAsBase64)
            })

            cy.fixture('images/selection-admin-0.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect selection in yellow').to.equal(responseBodyAsBase64)
            })
        })

        // It should select two features
        cy.get('#newOlMap')
            .click(200, 250)
            .click(800, 250)
            .dblclick(550, 650)

        // First wait get the old selection
        cy.wait('@new-selection').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/selection-admin-0.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect no selection in yellow').to.not.equal(responseBodyAsBase64)
            })

            cy.fixture('images/selection-admin-2.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect selection in yellow').to.equal(responseBodyAsBase64)
            })

            cy.fixture('images/selection-admin-1.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect selection in yellow').to.not.equal(responseBodyAsBase64)
            })
        })

        // UI provides selection results
        cy.get('.selectiontool-results').should(($div) => {
            const text = $div.text()

            expect(text).to.match(/^2/)
        })
    })
})
