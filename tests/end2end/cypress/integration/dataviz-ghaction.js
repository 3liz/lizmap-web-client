describe('Dataviz tests', function () {
    it('Test filtered dataviz in a popup', function () {
        const path = require("path")
        const PNG = require('pngjs').PNG;
        const pixelmatch = require('pixelmatch');
        const downloadsFolder = Cypress.config("downloadsFolder")

        cy.visit('/index.php/view/map/?repository=testsrepository&project=dataviz_filtered_in_popup')

        // In a perfect world, this button must be hidden, there isn't any plot to display ...
        cy.get('#button-dataviz').click()

        cy.get('#right-dock').should('be.visible')

        cy.get('#dataviz-content').invoke('text').invoke('trim').should('equal', '')

        // Popup
        cy.mapClick(550, 400)
        cy.get('#popupcontent').should('be.visible')

        cy.get('.lizmapPopupChildren > h4').should('have.text', 'Number of bakeries by polygon')

        cy.get('[data-title="Download plot as a png"]').click()

        cy.fixture('images/plotly/plot_montpellier_bakeries.png').then((expected) => {
            // newplot.png is maybe not the last one if the download folder is not empty ...
            cy.readFile(path.join(downloadsFolder, "newplot.png"), 'base64').then((image) => {

                // We can make a easier function to compare two images
                const img1 = PNG.sync.read(Buffer.from(image, 'base64'));
                const { width, height } = img1;
                const img2 = PNG.sync.read(Buffer.from(expected, 'base64'));

                let expected_diff = 1
                // On GH Action, the value is way different ...
                if (Cypress.env('CI') == 'TRUE') {
                    expected_diff = 235
                }
                expect(pixelmatch(img1.data, img2.data, null, width, height, { threshold: 0.1 }),'expect plot').to.lessThan(expected_diff)
            })
        })
    })
})
