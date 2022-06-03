describe('Dataviz tests', function () {
    it('Test filtered dataviz in a popup', function () {
        const path = require("path")
        const PNG = require('pngjs').PNG;
        const pixelmatch = require('pixelmatch');
        const downloadsFolder = Cypress.config("downloadsFolder")

        cy.visit('/index.php/view/map/?repository=testsrepository&project=dataviz_filtered_in_popup')

        // Dataviz button does not exist because every dataviz has to be displayed in popup
        cy.get('#button-dataviz').should('not.exist')

        // Popup
        cy.mapClick(550, 400)
        cy.get('#popupcontent').should('be.visible')

        cy.get('#popupcontent .lizmapPopupChildren.lizdataviz > h4').should('have.text', 'Number of bakeries by polygon')

        cy.get('#popupcontent .lizmapPopupChildren.lizdataviz .dataviz-waiter').should('not.be.visible')
        cy.get('#popupcontent .lizmapPopupChildren.lizdataviz .plot-container')
            .should('be.visible').should('have.class', 'plotly')
            .children().first() // <div class="svg-container" style="position:relative; width: 100%; height: 400px;">
            .should('have.class', 'svg-container')
            .should('have.css', 'height', '400px')

        cy.get('[data-title="Download plot as a png"]').click()

        let expected_diff = 0
        let fixture_path = 'images/plotly/plot_montpellier_bakeries.png'
        if (Cypress.isBrowser('firefox')) {
            fixture_path = 'images/plotly/plot_montpellier_bakeries_firefox.png'
            expected_diff = 235
        }
        cy.fixture(fixture_path).then((expected) => {
            // newplot.png is maybe not the last one if the download folder is not empty ...
            cy.readFile(path.join(downloadsFolder, "newplot.png"), 'base64').then((image) => {

                // We can make a easier function to compare two images
                const img1 = PNG.sync.read(Buffer.from(image, 'base64'));
                const { width, height } = img1;
                const img2 = PNG.sync.read(Buffer.from(expected, 'base64'));

                expect(pixelmatch(img1.data, img2.data, null, width, height, { threshold: 0.1 }),'expect plot').to.lessThan(expected_diff+1)
            })
        })
    })
})
