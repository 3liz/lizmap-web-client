// # Test the respect of WMS external layer image format

// The QGIS project contains 3 layers:

// * **bakeries**: a SHP point layer in EPSG:4326
// * **IGN plan**
//   * **Plan IGN v2 2154 jpeg**: a WMS layer from the French IGN organization, requested in `image/jpeg`
//   * **Plan IGN v2 2154 png**: the same layer but requested in `image/png`.


// ## Procedure

// Load the map `external_wms_layer`,

// * [ ] open your browser developer panel with `CTRL+MAJ+i`,
// * [ ] activate the `Network` tab with the `Images` filter (to see the requested images in the log),
// * [ ] empty the log (search for a `bin` icon in the `Network` panel),
// * [ ] move the map to trigger a map refresh,
// * [ ] check the image requested for the active layer `bakeries` is in **PNG** format
// * [ ] check the image requested for the active layer `Plan IGN v2 2154 jpeg` is in **JPEG** format
// * [ ] activate the layer `Plan IGN v2 2154 png` in the legend
// * [ ] check the image requested for the active layer `Plan IGN v2 2154 png` is in **PNG** format

describe('External WMS layers', function () {

    it('should get correct mime type in response', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=external_wms_layer')

        cy.intercept('*REQUEST=GetMap*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMap')

        // Test bakeries layer
        cy.get('#layer-bakeries button').click()

        cy.wait('@getMap').then((interception) => {
            expect(interception.response.headers['content-type'], 'expect mime type to be image/png').to.equal('image/png')
        })
        
        // Test Plan IGN v2 2154 jpeg
        cy.get('#layer-Plan_IGN_v2_2154_jpeg button').click()

        cy.wait('@getMap').then((interception) => {
            expect(interception.response.headers['content-type'], 'expect mime type to be image/jpeg').to.equal('image/jpeg')
        })

        // Test Plan IGN v2 2154 png
        cy.get('#layer-Plan_IGN_v2_2154_png button').click()

        cy.wait('@getMap').then((interception) => {
            expect(interception.response.headers['content-type'], 'expect mime type to be image/png').to.equal('image/png')
        })

    })
})
