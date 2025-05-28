// # Test the respect of WMS external layer image format

// The QGIS project contains 3 layers:

// World layer, included in the project
// 2 polygons layers hosted on
// https://liz.lizmap.com/tests/index.php/view/map?repository=testse2elwc&project=base_external_layers
// one in `image/jpeg`
// and one in `image/png`.

describe('External WMS layers', function () {

    it('should get correct mime type in response and not localhost', function () {
        // Increasing the timeout because the external server seems too slow to respond on time
        defaultCommandTimeout: 10000

        cy.intercept('*REQUEST=GetMap*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMap')

        cy.gotoMap('/index.php/view/map/?repository=testsrepository&project=external_wms_layer')
        // Wait for OpenStreetMap layer
        cy.wait(1000)

        // WMS https://liz.lizmap.com/tests/index.php/lizmap/service?repository=testse2elwc&project=base_external_layers&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
        // URL liz.lizmap.com
        // Repository testse2elwc
        // Project base_external_layers

        // As PNG for a remote WMS
        cy.get('#node-png').click()
        cy.wait('@getMap').then((interception) => {
            expect(interception.response.headers['content-type'], 'expect mime type to be image/png').to.equal('image/png')
            expect(interception.request.headers['host'], 'expect not localhost').to.not.equal(undefined)
            expect(interception.request.headers['host'], 'expect not localhost').to.not.contain('localhost')
        })
        cy.get('#node-png').click()

        // As JPEG for a remote WMS
        cy.get('#node-jpeg').click()
        cy.wait('@getMap').then((interception) => {
            expect(interception.response.headers['content-type'], 'expect mime type to be image/jpeg').to.equal('image/jpeg')
            expect(interception.request.headers['host'], 'expect not localhost').to.not.equal(undefined)
            expect(interception.request.headers['host'], 'expect not localhost').to.not.contain('localhost')
        })
        cy.get('#node-jpeg').click()


        // Local layer
        cy.get('#node-world').click()
        cy.wait('@getMap').then((interception) => {
            expect(interception.response.headers['content-type'], 'expect mime type to be image/webp').to.equal('image/webp')
            expect(interception.request.headers['host'], 'expect to be localhost').to.contain('localhost')
        })
        cy.get('#node-world').click()

    })
})
