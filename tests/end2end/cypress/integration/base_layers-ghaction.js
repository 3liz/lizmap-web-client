describe('Base layers', () => {
    beforeEach(() => {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=base_layers')
    })

    it('Base layers list', function () {
        cy.get('#switcher-baselayer-select option').should('have.length', 7)
        cy.get('#switcher-baselayer-select').should('have.value', 'ignplan')
        cy.get('#switcher-baselayer-select').select('emptyBaselayer').should('have.value', 'emptyBaselayer')
    })

    it('Scales', function () {
        cy.get('#overview-bar .ol-scale-text').should('have.text', '1 : ' + (144448).toLocaleString())

        cy.intercept('*REQUEST=GetMap*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMap')

        cy.get('#layer-quartiers button.btn.checkbox').click()
        cy.wait('@getMap')

        cy.get('#navbar button.btn.zoom-in').click()
        cy.wait('@getMap')
        cy.get('#overview-bar .ol-scale-text').should('have.text', '1 : ' + (72224).toLocaleString())

        cy.get('#navbar button.btn.zoom-in').click()
        cy.wait('@getMap')
        cy.get('#overview-bar .ol-scale-text').should('have.text', '1 : ' + (36112).toLocaleString())

        cy.get('#navbar button.btn.zoom-in').click()
        cy.wait('@getMap')
        cy.get('#overview-bar .ol-scale-text').should('have.text', '1 : ' + (18056).toLocaleString())

        cy.get('#navbar button.btn.zoom-in').click()
        cy.wait('@getMap')
        cy.get('#overview-bar .ol-scale-text').should('have.text', '1 : ' + (9028).toLocaleString())

        cy.get('#navbar button.btn.zoom-in').click()
        cy.wait('@getMap')
        cy.get('#overview-bar .ol-scale-text').should('have.text', '1 : ' + (4514).toLocaleString())

        // blocked by base layer
        cy.get('#navbar button.btn.zoom-in').click()
        cy.get('#overview-bar .ol-scale-text').should('have.text', '1 : ' + (4514).toLocaleString())

        // changes base layer to unlock scale
        cy.get('#switcher-baselayer-select').select('emptyBaselayer')
        cy.get('#navbar button.btn.zoom-in').click()
        cy.wait('@getMap')
        cy.get('#overview-bar .ol-scale-text').should('have.text', '1 : ' + (2257).toLocaleString())

        // back to base layer min resolution
        cy.get('#switcher-baselayer-select').select('ignplan')
        cy.wait('@getMap')
        cy.get('#overview-bar .ol-scale-text').should('have.text', '1 : ' + (4514).toLocaleString())
    })
})
