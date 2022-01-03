const arrayBufferToBase64 = (buffer) => {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}


describe('Feature Toolbar', function () {

    it('should display working tools', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=feature_toolbar')

        cy.wait(500)

        // Open parent_layer in attribute table
        cy.get('#button-attributeLayers').click()
        cy.get('button[value="parent_layer"].btn-open-attribute-layer').click({ force: true })

        // Click one feature on the map
        cy.get('#map').click(625, 362)

        cy.intercept('*REQUEST=GetMap*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMap')

        // 1/ Selection
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_c927e913_2bf7_4e59_934f_2aeff0a2dacd.1"] .feature-select').click()

        cy.wait('@getMap')

        // Test feature is selected on map
        cy.get('@getMap').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/feature_toolbar/selection.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect point to be displayed in yellow').to.equal(responseBodyAsBase64)
            })
        })

        // Test feature is selected on popup
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_c927e913_2bf7_4e59_934f_2aeff0a2dacd.1"] .feature-select').should('have.class', 'btn-primary')

        // Test feature is selected on attribute table
        cy.get('#attribute-layer-table-parent_layer tbody tr:first').should('have.class', 'selected')
        cy.get('#attribute-layer-table-parent_layer lizmap-feature-toolbar[value="parent_layer_c927e913_2bf7_4e59_934f_2aeff0a2dacd.1"] .feature-select').should('have.class', 'btn-primary')

        // 2/ Filter
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_c927e913_2bf7_4e59_934f_2aeff0a2dacd.1"] .feature-filter').click()

        cy.wait('@getMap')

        // Test feature is filtered on map
        cy.get('@getMap').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/feature_toolbar/filter.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect only one filtered point').to.equal(responseBodyAsBase64)
            })
        })

        // Test feature is filtered on popup
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_c927e913_2bf7_4e59_934f_2aeff0a2dacd.1"] .feature-filter').should('have.class', 'btn-primary')

        // Test feature is selected on attribute table
        cy.get('#attribute-layer-main-parent_layer .btn-filter-attributeTable').should('have.class', 'btn-primary')
    })
})
