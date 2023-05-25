describe('Dataviz tests', function () {
    it('Test dataviz plots are rendered', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=dataviz')
        cy.get('#button-dataviz').click()

        // Test first plot - Municipalities
        cy.get('#dataviz_plot_0_container > h3:nth-child(1) > span:nth-child(1) > span:nth-child(2)')
            .should('have.text', 'Municipalities')

        // Test - Bar bakeries by municipalities
        cy.get('#dataviz_plot_1_container > h3:nth-child(1) > span:nth-child(1) > span:nth-child(2)')
            .should('have.text', 'Bar Bakeries by municipalities')

        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.plot')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.plot g.trace.bars')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.plot g.trace.bars g.points')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.plot g.trace.bars g.points g.point')
            .should('have.length', 10)

        // Test - Pie bakeries by municipalities
        cy.get('#dataviz_plot_2_container > h3:nth-child(1) > span:nth-child(1) > span:nth-child(2)')
            .should('have.text', 'Pie Bakeries by municipalities')

        cy.get('#dataviz_plot_2 div.svg-container svg.main-svg g.pielayer')
            .should('have.length', 1)
        cy.get('#dataviz_plot_2 div.svg-container svg.main-svg g.pielayer g.trace')
            .should('have.length', 1)
        cy.get('#dataviz_plot_2 div.svg-container svg.main-svg g.pielayer g.trace g.slice')
            .should('have.length', 10)

        // Test - Horizontal bar bakeries in municipalities
        cy.get('#dataviz_plot_3_container > h3:nth-child(1) > span:nth-child(1) > span:nth-child(2)')
            .should('have.text', 'Horizontal bar bakeries in municipalities')

        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer')
            .should('have.length', 1)
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.plot')
            .should('have.length', 1)
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.plot g.trace.bars')
            .should('have.length', 1)
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.plot g.trace.bars g.points')
            .should('have.length', 1)
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.plot g.trace.bars g.points g.point')
            .should('have.length', 10)

        // This test is not really covering the dataviz capabilities for now.
    })

    it('Test filtered dataviz plots are rendered in a popup', function () {
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

                expect(pixelmatch(img1.data, img2.data, null, width, height, { threshold: 0.1 }), 'expect plot').to.lessThan(expected_diff + 1)
            })
        })
    })
})
