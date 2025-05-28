describe('Dataviz tests', function () {
    beforeEach(() => {
        cy.intercept('*REQUEST=GetMap*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMap')

        cy.intercept('*/dataviz/service*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getPlot')
    })

    it('Test dataviz plots are rendered', function () {

        cy.visit('/index.php/view/map/?repository=testsrepository&project=dataviz')

        // Wait for map displayed 2 layers are displayed
        cy.wait(['@getMap', '@getMap'])

        // Click on the dataviz menu
        cy.get('#button-dataviz').click()

        // Check the plots are organized as configured in plugin (HTML Drag & drop layout)
        cy.get('#dataviz > #dataviz-container > #dataviz-content > div.tab-content > ul > li:nth-child(1) > button')
            .should('have.text', 'First tab')
        cy.get('#dataviz > #dataviz-container > #dataviz-content > div.tab-content > ul > li:nth-child(2) > button')
            .should('have.text', 'Second tab')
        cy.get('div#dataviz-dnd-0-39cdf0321d593be51760b8c205de3f3e > fieldset:nth-child(1) > legend')
            .should('have.text', 'Group A')
        cy.get('div#dataviz-dnd-0-39cdf0321d593be51760b8c205de3f3e > fieldset:nth-child(2) > legend')
            .should('have.text', 'Group B')
        cy.get('div#dataviz-dnd-0-39cdf0321d593be51760b8c205de3f3e > fieldset:nth-child(2) > div:nth-child(2) > ul:nth-child(1) > li:nth-child(1) > button:nth-child(1)')
            .should('have.text', 'Sub-Tab X')
        cy.get('div#dataviz-dnd-0-39cdf0321d593be51760b8c205de3f3e > fieldset:nth-child(2) > div:nth-child(2) > ul:nth-child(1) > li:nth-child(2) > button:nth-child(1)')
            .should('have.text', 'Sub-tab Y')

        // Click on the other tabs to make the other plots visible
        // Sub tab Y
        cy.get('#dataviz > #dataviz-container > #dataviz-content > div.tab-content > ul > li:nth-child(1) > button')
            .click()
        cy.get('div#dataviz-dnd-0-39cdf0321d593be51760b8c205de3f3e > fieldset:nth-child(2) > div:nth-child(2) > ul:nth-child(1) > li:nth-child(2) > button:nth-child(1)')
            .click()
        // Second tab
        cy.get('#dataviz > #dataviz-container > #dataviz-content > div.tab-content > ul > li:nth-child(2) > button')
            .click()

        // Wait for graphics displayed 5 plots are displayed
        cy.wait(['@getPlot', '@getPlot', '@getPlot', '@getPlot', '@getPlot'])

        // Test first plot - Municipalities
        cy.get('#dataviz_plot_0_container > h3:nth-child(1) > span:nth-child(1) > span:nth-child(2)')
            .should('have.text', 'Municipalities')

        cy.get('#dataviz_plot_0 div.svg-container svg.main-svg g.cartesianlayer')
            .should('have.length', 1)
        cy.get('#dataviz_plot_0 div.svg-container svg.main-svg g.cartesianlayer g.overplot')
            .should('have.length', 1)
        cy.get('#dataviz_plot_0 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars')
            .should('have.length', 1)
        cy.get('#dataviz_plot_0 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points')
            .should('have.length', 1)
        cy.get('#dataviz_plot_0 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 10)

        // Test - Bar bakeries by municipalities
        cy.get('#dataviz_plot_1_container > h3:nth-child(1) > span:nth-child(1) > span:nth-child(2)')
            .should('have.text', 'Bar Bakeries by municipalities')

        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.overplot')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
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
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.overplot')
            .should('have.length', 1)
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars')
            .should('have.length', 1)
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points')
            .should('have.length', 1)
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 10)

        // Never filtered plot
        cy.get('#dataviz_plot_4 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 10)

        // Click back to the first tab
        cy.get('#dataviz > #dataviz-container > #dataviz-content > div.tab-content > ul > li:nth-child(1) > button')
            .click()
        // Click back to the first sub tab X
        cy.get('div#dataviz-dnd-0-39cdf0321d593be51760b8c205de3f3e > fieldset:nth-child(2) > div:nth-child(2) > ul:nth-child(1) > li:nth-child(1) > button:nth-child(1)')
            .click()

        // Using locate by layer to filter layers and plots
        cy.get('#locate-layer-polygons ~ span.custom-combobox > a.custom-combobox-toggle').click()
        cy.get('ul.ui-menu.ui-autocomplete:visible > li.ui-menu-item:nth-child(3)').click()

        // Wait for visible graphics updated 2 plots are visible
        cy.wait(['@getPlot', '@getPlot'])

        cy.get('#dataviz_plot_0 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 1)

        // Activate the Second tab dock to update one graphic only (the other one has the trigger_filter: false
        cy.get('#dataviz > #dataviz-container > #dataviz-content > div.tab-content > ul > li:nth-child(2) > button')
            .click()

        cy.wait(['@getPlot'])
        // This plot is filtered
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 1)
        // This plot must not have been refreshed
        cy.get('#dataviz_plot_4 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 10)

        // Go back to the first tab
        cy.get('#dataviz > #dataviz-container > #dataviz-content > div.tab-content > ul > li:nth-child(1) > button')
            .click()
        // Click back to the first sub tab X
        cy.get('div#dataviz-dnd-0-39cdf0321d593be51760b8c205de3f3e > fieldset:nth-child(2) > div:nth-child(2) > ul:nth-child(1) > li:nth-child(1) > button:nth-child(1)')
            .click()

        // Zoom and filter to an other feature
        cy.get('#locate-layer-polygons ~ span.custom-combobox > a.custom-combobox-toggle').click()
        cy.get('ul.ui-menu.ui-autocomplete:visible > li.ui-menu-item:nth-child(5)').click()

        // Wait for visible graphics updated 2 plots are visible
        cy.wait(['@getPlot', '@getPlot'])

        cy.get('#dataviz_plot_0 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 1)

        // Activate the Second tab dock to update one graphic
        cy.get('#dataviz > #dataviz-container > #dataviz-content > div.tab-content > ul > li:nth-child(2) > button')
            .click()

        cy.wait(['@getPlot'])

        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 1)

        // Go back to the first tab
        cy.get('#dataviz > #dataviz-container > #dataviz-content > div.tab-content > ul > li:nth-child(1) > button')
            .click()
        // Click back to the first sub tab X
        cy.get('div#dataviz-dnd-0-39cdf0321d593be51760b8c205de3f3e > fieldset:nth-child(2) > div:nth-child(2) > ul:nth-child(1) > li:nth-child(1) > button:nth-child(1)')
            .click()

        // Deactivate filter provided by locate by layer
        cy.get('#locate-clear').click()
        // Wait for map updated, because plots are in cache
        cy.wait(['@getMap', '@getMap'])

        cy.get('#dataviz_plot_0 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 10)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 10)

        // Activate the Second tab dock to update one graphic
        cy.get('#dataviz > #dataviz-container > #dataviz-content > div.tab-content > ul > li:nth-child(2) > button')
            .click()
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.overplot g.trace.bars g.points g.point')
            .should('have.length', 10)

        // This test is not really covering the dataviz capabilities for now.
    })

    it('Test filtered dataviz plots are rendered in a popup', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=dataviz_filtered_in_popup')

        // Dataviz button does not exist because every dataviz has to be displayed in popup
        cy.get('#button-dataviz').should('not.exist')

        // Popup
        cy.mapClick(550, 400)
        cy.get('#popupcontent').should('be.visible')

        // We also test that the title in the popup is specific
        // and not the one configured for the plot
        cy.get('#popupcontent .lizmapPopupChildren.lizdataviz > h4').first().should('have.text', 'Number of bakeries for this polygon')

        cy.get('#popupcontent .lizmapPopupChildren.lizdataviz .dataviz-waiter').should('not.be.visible')
        cy.get('#popupcontent .lizmapPopupChildren.lizdataviz .plot-container')
            .should('be.visible').should('have.class', 'plotly')
            .children().first() // <div class="svg-container" style="position:relative; width: 100%; height: 400px;">
            .should('have.class', 'svg-container')
            .should('have.css', 'height', '400px')
    })
})
