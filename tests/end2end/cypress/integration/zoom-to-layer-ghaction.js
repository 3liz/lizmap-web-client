describe('Zoom to layer', function() {
    beforeEach(function () {
        // Runs before each tests in the block
        cy.intercept('*REQUEST=GetMap*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                // force all API responses to not be cached
                // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMap')

        cy.intercept('POST','*service*', (req) => {
            if (typeof req.body == 'string') {
                const req_body = req.body.toLowerCase()
                if (req_body.includes('service=wms') ) {
                    if (req_body.includes('request=getfeatureinfo'))
                        req.alias = 'postGetFeatureInfo'
                    else if (req_body.includes('request=getselectiontoken'))
                        req.alias = 'postGetSelectionToken'
                    else
                        req.alias = 'postToService'
                } else if (req_body.includes('service=wfs') ) {
                    if (req_body.includes('request=getfeature'))
                        req.alias = 'postGetFeature'
                    else if (req_body.includes('request=describefeaturetype'))
                        req.alias = 'postDescribeFeatureType'
                    else
                        req.alias = 'postToService'
                } else
                    req.alias = 'postToService'
            } else
                req.alias = 'postToService'
        })

        cy.intercept({
            method: 'POST',
            url: '**/lizmap/service',
            middleware: true
        },
        (req) => {
            req.on('before:response', (res) => {
                // force all API responses to not be cached
                // It is needed when launching tests multiple time in headed mode
                res.headers['cache-control'] = 'no-store'
            })
        }).as('getFeature')
    })

    it('Projection EPSG:4326', function(){
        // Go to world 4326
        cy.visit('/index.php/view/map/?repository=testsrepository&project=world-4326')

        // Zoom to 'rectangle' layer
        cy.get('#node-rectangle ~ .node .layer-actions .icon-info-sign').click({force: true})
        cy.get('#sub-dock button.layerActionZoom').click()

        // Click on the map to get a popup
        cy.mapClick(480,340)
        cy.wait('@postGetFeatureInfo')

        // Check popup displayed
        cy.get('#mapmenu li.nav-dock.popupcontent').should('have.class', 'active')
        cy.get('#popupcontent div.lizmapPopupContent h4.lizmapPopupTitle').should('length', 1)

        // Zoom to 'world' layer
        cy.get('#button-switcher').click()
        cy.get('#node-world ~ .node .layer-actions .icon-info-sign').click({force: true})
        cy.get('#sub-dock button.layerActionZoom').click()

        // Click on the map to get no popup
        cy.mapClick(480,340)
        cy.wait('@postGetFeatureInfo')

        // Check no popup displayed
        cy.get('#mapmenu li.nav-dock.popupcontent').should('have.class', 'active')
        cy.get('#popupcontent div.lizmapPopupContent h4.lizmapPopupTitle').should('not.exist')

        // The dock with content will be closed
        //cy.wait(5000)
        //cy.get('#mapmenu li.nav-dock.popupcontent').should('not.have.class', 'active')
    })
    it('Projection EPSG:3857', function(){
        // Go to world 3857
        cy.visit('/index.php/view/map/?repository=testsrepository&project=world-3857')

        // Zoom to layer rectangle
        cy.get('#node-rectangle ~ .node .layer-actions .icon-info-sign').click({force: true})
        cy.get('#sub-dock button.layerActionZoom').click()

        // Click on the map to get a popup
        cy.mapClick(480,340)
        cy.wait('@postGetFeatureInfo')

        // Check popup displayed
        cy.get('#mapmenu li.nav-dock.popupcontent').should('have.class', 'active')
        cy.get('#popupcontent div.lizmapPopupContent h4.lizmapPopupTitle').should('length', 1)

        // Zoom to world layer
        cy.get('#button-switcher').click()
        cy.get('#node-world ~ .node .layer-actions .icon-info-sign').click({force: true})
        cy.get('#sub-dock button.layerActionZoom').click()

        // Click on the map to get no popup
        cy.mapClick(480,340)
        cy.wait('@postGetFeatureInfo')

        // Check no popup displayed
        cy.get('#mapmenu li.nav-dock.popupcontent').should('have.class', 'active')
        cy.get('#popupcontent div.lizmapPopupContent h4.lizmapPopupTitle').should('not.exist')
    })
})
