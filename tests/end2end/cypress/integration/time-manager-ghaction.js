// TODO in this test to improve it
// Test not intercepting specific request
// Find a way to test the correct request sent to QGIS server, we don't want to test the GetMap response
// Test the FILTERTOKEN ?

describe('Time manager', () => {
    it('test button visible and requests sent to QGIS server', function () {

        cy.intercept('*REQUEST=GetMap*',
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMap')

        cy.visit('/index.php/view/map/?repository=testsrepository&project=time_manager')

        cy.wait('@getMap').then(interception => {
            cy.log(interception.request.url)
            expect(interception.request.url).to.not.contains('FILTERTOKEN')
        })

        cy.get('#button-timemanager').click()

        cy.wait('@getMap').then(interception => {
            expect(interception.request.url).to.contains('FILTERTOKEN')
        })

        cy.get('#tmCurrentValue').should('have.text', '2007')
        cy.get('#tmNextValue').should('have.text', '2011')
        cy.get('#tmSlider > span:nth-child(1)').invoke('attr', 'style').should('eq', 'left: 0%;')

        cy.get('#tmPrev').click()

        // Nothing is happening because it is already the first value
        // TODO We should test @GetMap is not sent
        cy.get('#tmCurrentValue').should('have.text', '2007')
        cy.get('#tmNextValue').should('have.text', '2011')
        cy.get('#tmSlider > span:nth-child(1)').invoke('attr', 'style').should('eq', 'left: 0%;')

        cy.get('#tmNext').click()

        cy.wait('@getMap').then(interception => {
            expect(interception.request.url).to.contains('FILTERTOKEN')
        })

        cy.get('#tmCurrentValue').should('have.text', '2012')
        cy.get('#tmNextValue').should('have.text', '2016')
        cy.get('#tmSlider > span:nth-child(1)').invoke('attr', 'style').should('contains', '49')

        cy.get('#tmNext').click()

        cy.wait('@getMap').then(interception => {
            expect(interception.request.url).to.contains('FILTERTOKEN')
        })

        cy.get('#tmCurrentValue').should('have.text', '2017')
        cy.get('#tmNextValue').should('have.text', '2021')
        cy.get('#tmSlider > span:nth-child(1)').invoke('attr', 'style').should('eq', 'left: 100%;')

        cy.get('#tmNext').click()

        // Back to the beginning ...
        // No more @GetMap requests are done, TODO, this should be tested
        cy.get('#tmCurrentValue').should('have.text', '2007')
        cy.get('#tmNextValue').should('have.text', '2011')
        cy.get('#tmSlider > span:nth-child(1)').invoke('attr', 'style').should('eq', 'left: 0%;')

        // Let's move again to the test the previous button
        cy.get('#tmNext').click()

        cy.get('#tmCurrentValue').should('have.text', '2012')
        cy.get('#tmNextValue').should('have.text', '2016')

        cy.get('#tmPrev').click()

        cy.get('#tmCurrentValue').should('have.text', '2007')
        cy.get('#tmNextValue').should('have.text', '2011')
        cy.get('#tmSlider > span:nth-child(1)').invoke('attr', 'style').should('eq', 'left: 0%;')

        // Let's autoplay, one timeframe is one second
        cy.get('#tmTogglePlay').should('have.text', 'Play')
        cy.get('#tmTogglePlay').click()
        cy.get('#tmTogglePlay').should('have.text', 'Pause')
        cy.wait(3 * 1000)
        cy.get('#tmTogglePlay').should('have.text', 'Play')
    })
})
