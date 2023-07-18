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
        // Increasing the timeout because the external server seems too slow to respond on time
        defaultCommandTimeout: 10000

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

        // WMS https://demo.lizmap.com/lizmap/index.php/lizmap/service/?repository=cypress&project=base_external_layers&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
        // URL demo.lizmap.com
        // Repository cypress
        // Project base_external_layers

        // As PNG
        cy.get('#node-png').click()
        cy.wait('@getMap').then((interception) => {
            expect(interception.response.headers['content-type'], 'expect mime type to be image/png').to.equal('image/png')
            console.log(interception.response)
        })
        cy.get('#node-png').click()

        // Wait for all GetMap requests
        cy.wait(4000)

        // As JPEG
        cy.get('#node-jpeg').click()
        cy.wait('@getMap').then((interception) => {
            expect(interception.response.headers['content-type'], 'expect mime type to be image/jpeg').to.equal('image/jpeg')
        })
        cy.get('#node-jpeg').click()

    })
})
