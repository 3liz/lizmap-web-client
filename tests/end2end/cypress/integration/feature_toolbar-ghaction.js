import {arrayBufferToBase64} from '../support/function.js'

describe('Feature Toolbar in popup', function () {

    beforeEach(function () {
        // Runs before each tests in the block
        cy.intercept('*REQUEST=GetFeatureInfo*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getFeatureInfo')

        cy.intercept('POST','*service*').as('postToService')

        cy.intercept('*REQUEST=GetMap*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMap')

        // Go to the web map
        cy.visit('/index.php/view/map/?repository=testsrepository&project=feature_toolbar&lang=en_US')

        // Wait for map displayed
        cy.wait('@getMap')

    })

    it('should zoom', function () {
        // Check the started map
        cy.get('@getMap').then((interception) => {
            expect(interception.request.url).to.contain('BBOX=')
            const req_url = new URL(interception.request.url)
            const bbox = req_url.searchParams.get('BBOX')
            const bbox_array = bbox.split(',')
            expect(bbox_array).to.have.length(4)
            expect(bbox_array[0]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmin is number')
            expect(parseFloat(bbox_array[0])).to.be.within(755258.0,755259.0)
            expect(bbox_array[1]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymin is number')
            expect(parseFloat(bbox_array[1])).to.be.within(6269589.0,6269590.0)
            expect(bbox_array[2]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmax is number')
            expect(parseFloat(bbox_array[2])).to.be.within(788595.0,788596.0)
            expect(bbox_array[3]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymax is number')
            expect(parseFloat(bbox_array[3])).to.be.within(6289036.0,6289037.0)
        })

        // Click feature with id=1 on the map
        cy.mapClick(655, 437)
        cy.wait('@getFeatureInfo')

        // Click to zoom to feature
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"] .feature-zoom').click()

        // The map is reloaded
        cy.wait('@getMap').then((interception) => {
            expect(interception.request.url).to.contain('BBOX=')
            const req_url = new URL(interception.request.url)
            const bbox = req_url.searchParams.get('BBOX')
            const bbox_array = bbox.split(',')
            expect(bbox_array).to.have.length(4)
            expect(bbox_array[0]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmin is number')
            expect(parseFloat(bbox_array[0])).to.be.within(755258.0,755259.0)
            expect(bbox_array[1]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymin is number')
            expect(parseFloat(bbox_array[1])).to.be.within(6269589.0,6269590.0)
            expect(bbox_array[2]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmax is number')
            expect(parseFloat(bbox_array[2])).to.be.within(788595.0,788596.0)
            expect(bbox_array[3]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymax is number')
            expect(parseFloat(bbox_array[3])).to.be.within(6289036.0,6289037.0)
        })

        // The map is zoomed to feature
        cy.wait('@getMap').then((interception) => {
            expect(interception.request.url).to.contain('BBOX=')
            const req_url = new URL(interception.request.url)
            const bbox = req_url.searchParams.get('BBOX')
            const bbox_array = bbox.split(',')
            expect(bbox_array).to.have.length(4)
            expect(bbox_array[0]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmin is number')
            expect(parseFloat(bbox_array[0])).to.be.within(771093.0,771094.0)
            expect(bbox_array[1]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymin is number')
            expect(parseFloat(bbox_array[1])).to.be.within(6278826.0,6278827.0)
            expect(bbox_array[2]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmax is number')
            expect(parseFloat(bbox_array[2])).to.be.within(772760.0,772761.0)
            expect(bbox_array[3]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymax is number')
            expect(parseFloat(bbox_array[3])).to.be.within(6279798.0,6279799.0)
        })

    })

    it('should center', function () {
        // Check the started map
        cy.get('@getMap').then((interception) => {
            expect(interception.request.url).to.contain('BBOX=')
            const req_url = new URL(interception.request.url)
            const bbox = req_url.searchParams.get('BBOX')
            const bbox_array = bbox.split(',')
            expect(bbox_array).to.have.length(4)
            expect(bbox_array[0]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmin is number')
            expect(parseFloat(bbox_array[0])).to.be.within(755258.0,755259.0)
            expect(bbox_array[1]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymin is number')
            expect(parseFloat(bbox_array[1])).to.be.within(6269589.0,6269590.0)
            expect(bbox_array[2]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmax is number')
            expect(parseFloat(bbox_array[2])).to.be.within(788595.0,788596.0)
            expect(bbox_array[3]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymax is number')
            expect(parseFloat(bbox_array[3])).to.be.within(6289036.0,6289037.0)
        })

        // Click feature with id=1 on the map
        cy.mapClick(655, 437)
        cy.wait('@getFeatureInfo')

        cy.get('#navbar button.btn.zoom-in').click()
        cy.wait('@getMap')
        cy.get('#navbar button.btn.zoom-in').click()
        cy.wait('@getMap')
        cy.get('#navbar button.btn.zoom-in').click()
        cy.wait('@getMap')
        cy.get('#navbar button.btn.zoom-in').click()
        cy.wait('@getMap')

        // Click to zoom to feature
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"] .feature-center').click()

        // The map is centered to feature
        cy.wait('@getMap').then((interception) => {
            expect(interception.request.url).to.contain('BBOX=')
            const req_url = new URL(interception.request.url)
            const bbox = req_url.searchParams.get('BBOX')
            const bbox_array = bbox.split(',')
            expect(bbox_array).to.have.length(4)
            expect(bbox_array[0]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmin is number')
            expect(parseFloat(bbox_array[0])).to.be.within(771093.0,771094.0)
            expect(bbox_array[1]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymin is number')
            expect(parseFloat(bbox_array[1])).to.be.within(6278826.0,6278827.0)
            expect(bbox_array[2]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmax is number')
            expect(parseFloat(bbox_array[2])).to.be.within(772760.0,772761.0)
            expect(bbox_array[3]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymax is number')
            expect(parseFloat(bbox_array[3])).to.be.within(6279798.0,6279799.0)
        })
    })

    it('should select', function () {
        // There is randomly an error in the console when attribute table is resized
        // This avoid test to fail
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        })

        const PNG = require('pngjs').PNG;
        const pixelmatch = require('pixelmatch');

        // Click feature with id=1 on the map
        cy.mapClick(655, 437)
        cy.wait('@getFeatureInfo')

        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"] .feature-select').click()

        // WFS GetFeature request
        cy.wait('@postToService').as('postToService1')

        // WFS DescribeFeatureType request
        cy.wait('@postToService').as('postToService2')

        // WMS GetSelectionToken request
        cy.wait('@postToService').as('postToService3')

        // Check WFS GetFeature request
        cy.get('@postToService1').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WFS')
                .to.contain('REQUEST=GetFeature')
                .to.contain('TYPENAME=parent_layer')
                .to.contain('FEATUREID=parent_layer.1')
        })

        // Check WFS DescribeFeatureType request
        // Check WMS GetSelectionToken request
        // and store the selection token
        let selectiontoken = ''
        cy.get('@postToService2').then((interception) => {
            if ( interception.request.body.includes('SERVICE=WFS') ) {
                expect(interception.request.body)
                    .to.contain('SERVICE=WFS')
                    .to.contain('REQUEST=DescribeFeatureType')
                    .to.contain('TYPENAME=parent_layer')
            } else {
                expect(interception.request.body)
                    .to.contain('service=WMS')
                    .to.contain('request=GETSELECTIONTOKEN')
                    .to.contain('typename=parent_layer')
                    .to.contain('ids=1')
                expect(interception.response.body)
                    .to.have.property('token')
                selectiontoken = interception.response.body.token
            }
        })

        cy.get('@postToService3').then((interception) => {
            if ( interception.request.body.includes('service=WMS') ) {
                expect(interception.request.body)
                    .to.contain('service=WMS')
                    .to.contain('request=GETSELECTIONTOKEN')
                    .to.contain('typename=parent_layer')
                    .to.contain('ids=1')
                expect(interception.response.body)
                    .to.have.property('token')
                selectiontoken = interception.response.body.token
            } else {
                expect(interception.request.body)
                    .to.contain('SERVICE=WFS')
                    .to.contain('REQUEST=DescribeFeatureType')
                    .to.contain('TYPENAME=parent_layer')
            }
        })

        // Check that GetMap is requested with the selection token
        // The events could reload the map before updated the request
        cy.wait('@getMap').then((first_interception) => {
            // Check that the selection token has been set
            expect(selectiontoken).to.not.be.eq('')
            // Verify if we need to wait for a second getMap
            const first_req_url = new URL(first_interception.request.url)
            if ( !first_req_url.searchParams.has('SELECTIONTOKEN') ) {
                cy.wait('@getMap').then((second_interception) => {
                    const second_req_url = new URL(second_interception.request.url)
                    expect(second_req_url.searchParams.has('SELECTIONTOKEN')).to.be.true
                    expect(second_req_url.searchParams.get('SELECTIONTOKEN')).to.be.eq(selectiontoken)
                })
            } else {
                expect(second_req_url.searchParams.get('SELECTIONTOKEN')).to.be.eq(selectiontoken)
            }
        })

        // Test feature is selected on last map
        cy.get('@getMap').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/feature_toolbar/selection.png').then((image) => {
                // image encoded as base64
                const img1 = PNG.sync.read(Buffer.from(responseBodyAsBase64, 'base64'));
                const img2 = PNG.sync.read(Buffer.from(image, 'base64'));
                const { width, height } = img1;

                expect(pixelmatch(img1.data, img2.data, null, width, height, { threshold: 0 }), 'expect point to be displayed in yellow').to.equal(0)
            })
        })

        // Test feature is selected on popup
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"] .feature-select').should('have.class', 'btn-primary')

        // Open parent_layer in attribute table
        cy.get('#button-attributeLayers').click()
        cy.get('button[value="parent_layer"].btn-open-attribute-layer').click({ force: true })

        // Test feature is selected on attribute table
        cy.get('#attribute-layer-table-parent_layer tbody tr:first').should('have.class', 'selected')
        cy.get('#attribute-layer-table-parent_layer lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"] .feature-select').should('have.class', 'btn-primary')
    })

    it('should filter', function () {

        // There is randomly an error in the console when attribute table is resized
        // This avoid test to fail
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        })

        // Click feature with id=1 on the map
        cy.mapClick(655, 437)
        cy.wait('@getFeatureInfo')

        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"] .feature-filter').click()

        // Test feature is filtered on popup
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"] .feature-filter').should('have.class', 'btn-primary')

        // Open parent_layer in attribute table
        cy.get('#button-attributeLayers').click()
        cy.get('button[value="parent_layer"].btn-open-attribute-layer').click({ force: true })
        cy.wait(300)

        // Test feature is filtered on attribute table
        cy.get('#attribute-layer-main-parent_layer .btn-filter-attributeTable').should('have.class', 'btn-primary')

        // Disable filter
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"] .feature-filter').click()

        // Test feature is not filtered on popup
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"] .feature-filter').should('not.have.class', 'btn-primary')

        // Test feature is not filtered on attribute table
        cy.get('#attribute-layer-main-parent_layer .btn-filter-attributeTable').should('not.have.class', 'btn-primary')
    })

    it('should unlink/link', function () {

        // There is randomly an error in the console when attribute table is resized
        // This avoid test to fail
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        })

        // Click feature with id=1 on the map
        cy.mapClick(655, 437)
        cy.wait('@getFeatureInfo')

        // Open parent_layer in attribute table
        cy.get('#button-attributeLayers').click()
        cy.get('button[value="parent_layer"].btn-open-attribute-layer').click({ force: true })

        // 1/ Unlink children feature from parent with id 2
        cy.get('#bottom-dock-window-buttons .btn-bottomdock-size').click()

        cy.get('#attribute-layer-table-parent_layer-children_layer tbody tr').should('have.length', 0)

        cy.get('#attribute-layer-table-parent_layer lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.2"]').click({force: true})

        cy.get('#attribute-layer-table-parent_layer-children_layer tbody tr').should('have.length', 1)

        // Click unlink button
        cy.get('#attribute-layer-table-parent_layer-children_layer tbody tr .feature-unlink').click({ force: true })

        // Confirmation message should be displayed
        cy.get('#message .jelix-msg-item-success').should('have.text', 'The child feature has correctly been unlinked.')

        // 2/ Link children feature to parent with id 2
        // Select parent feature with id 2
        cy.get('#attribute-layer-table-parent_layer lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.2"] .feature-select').click({ force: true })

        // Select children feature with id 1
        cy.get('#nav-tab-attribute-summary').click({ force: true })
        cy.get('button[value="children_layer"].btn-open-attribute-layer').click({ force: true })
        cy.get('#attribute-layer-table-children_layer lizmap-feature-toolbar[value="children_layer_358cb5a3_0c83_4a6c_8f2f_950e7459d9d0.1"] .feature-select').click({ force: true })

        // Link parent and children
        cy.get('#nav-tab-attribute-layer-parent_layer').click({ force: true })
        cy.get('.btn-linkFeatures-attributeTable').click({ force: true })

        // Confirmation message should be displayed
        cy.get('#message .jelix-msg-item-success').should('have.text', 'Selected features have been correctly linked.')
    })

    it('should display working custom action for the popup feature', function () {

        // Click feature with id=1 on the map
        cy.mapClick(655, 437)
        cy.wait('@getFeatureInfo')

        cy.get('#popupcontent lizmap-feature-toolbar button.popup-action[value="buffer_500.parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"]').click()

        // Test feature is selected on popup
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"] .feature-select').should('have.class', 'btn-primary')

        cy.on('window:confirm', () => true);

        // Confirmation message should be displayed
        cy.get('#message #lizmap-action-message p').should('have.text', 'The buffer 500 m has been displayed in the map')

        // End action
        cy.get('#popupcontent lizmap-feature-toolbar button.popup-action[value="buffer_500.parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"]').click()
        cy.get('#message').should('be.empty')

    })

    it('should display working project action selector', function () {

        // Get the project action
        // Check the dock is visible
        cy.get('a#button-action').should('have.length', 1)

        // Open the project action dock
        cy.get('a#button-action').click()

        // Select an action
        cy.get('#lizmap-project-actions select.action-select').select('project_map_center_buffer')

        // Run the project action
        cy.get('#lizmap-project-actions button.action-run-button').click()

        // Check result
        cy.get('#message #lizmap-action-message p').should('have.text', 'The displayed geometry represents the buffer 2000 m of the current map center')

        // Deactivate
        cy.get('#lizmap-project-actions button.action-run-button').click()

        // Check
        cy.get('#message').should('be.empty')

    })

    it('should display working layer action selector', function () {
        // Select the layer in the legend tree
        cy.get('tr#layer-parent_layer td span.label').click()

        // Check the action selector is present
        cy.get('#sub-dock div.layer-action-selector-container').should('have.length', 1);

        // Select an action
        cy.get('#sub-dock div.layer-action-selector-container select.action-select').select('layer_spatial_extent')

        // Run the project action
        cy.get('#sub-dock div.layer-action-selector-container button.action-run-button').click()

        // Check result
        cy.get('#message #lizmap-action-message p').should('have.text', 'The displayed geometry represents the contour of all the layer features')

        // Deactivate
        cy.get('#sub-dock div.layer-action-selector-container button.action-run-button').click()

        // Check
        cy.get('#message').should('be.empty')

    })

    it('should start child edition linked to a parent feature', function () {
        // Click feature with id=2 on the map
        cy.mapClick(1055, 437)
        cy.wait('@getFeatureInfo')

        // Start parent edition
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.2"] .feature-edit').click()

        // Start child edition
        cy.get('#edition-children-container lizmap-feature-toolbar[value="children_layer_358cb5a3_0c83_4a6c_8f2f_950e7459d9d0.1"] .feature-edit').click()

        // Parent_id is disabled in form when edition is started from parent form
        cy.get('#jforms_view_edition_parent_id').should('be.disabled')
    })
})

describe('Feature Toolbar in attribute table', function () {

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

            cy.visit('/index.php/view/map/?repository=testsrepository&project=feature_toolbar&lang=en_US')

        cy.wait('@getMap')

    })

    it('Zoom and center', function () {
        // Open parent_layer in attribute table
        cy.get('#button-attributeLayers').click()
        cy.get('button[value="parent_layer"].btn-open-attribute-layer').click({ force: true })

        // Check table lines
        cy.get('#attribute-layer-table-parent_layer tbody tr').should('have.length', 2)

        // Zoom to feature 1
        cy.get('#attribute-layer-table-parent_layer tr[id="1"] lizmap-feature-toolbar .feature-zoom').click({ force: true })
        cy.wait('@getMap').then((interception) => {
            expect(interception.request.url).to.contain('BBOX=')
            const req_url = new URL(interception.request.url)
            const bbox = req_url.searchParams.get('BBOX')
            const bbox_array = bbox.split(',')
            expect(bbox_array).to.have.length(4)
            expect(bbox_array[0]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmin is number')
            expect(parseFloat(bbox_array[0])).to.be.within(771093.0,771094.0)
            expect(bbox_array[1]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymin is number')
            expect(parseFloat(bbox_array[1])).to.be.within(6278826.0,6278827.0)
            expect(bbox_array[2]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmax is number')
            expect(parseFloat(bbox_array[2])).to.be.within(772760.0,772761.0)
            expect(bbox_array[3]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymax is number')
            expect(parseFloat(bbox_array[3])).to.be.within(6279798.0,6279799.0)
        })

        // Move to feature 2
        cy.get('#attribute-layer-table-parent_layer tr[id="2"] lizmap-feature-toolbar .feature-center').click({ force: true })
        cy.wait('@getMap').then((interception) => {
            expect(interception.request.url).to.contain('BBOX=')
            const req_url = new URL(interception.request.url)
            const bbox = req_url.searchParams.get('BBOX')
            const bbox_array = bbox.split(',')
            expect(bbox_array).to.have.length(4)
            expect(bbox_array[0]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmin is number')
            expect(parseFloat(bbox_array[0])).to.be.within(781610.0,781611.0)
            expect(bbox_array[1]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymin is number')
            expect(parseFloat(bbox_array[1])).to.be.within(6278991.0,6278992.0)
            expect(bbox_array[2]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox xmax is number')
            expect(parseFloat(bbox_array[2])).to.be.within(783277.0,783278.0)
            expect(bbox_array[3]).to.match(/^-?\d+(?:\.\d+)?$/, 'BBox ymax is number')
            expect(parseFloat(bbox_array[3])).to.be.within(6279964.0,6279965.0)
        })
    })
})

describe('Export data', function () {

    beforeEach(function () {
        // Runs before each tests in the block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=feature_toolbar&lang=en_US')

        cy.wait(300)
    })

    it('should export the features of a spatial layer depending on the selection or filter', function () {
        // Open parent_layer in attribute table
        cy.get('#button-attributeLayers').click()
        cy.get('button[value="parent_layer"].btn-open-attribute-layer').click({ force: true })

        // Intercept only the GetFeature requests for the parent layer
        cy.intercept(
            'index.php/lizmap/service?repository=testsrepository&project=feature_toolbar',
            { method: 'POST', middleware: true },
            (req) => {
                // no cache
                req.on('before:response', (res) => {
                    res.headers['cache-control'] = 'no-store'
                })

                if (req.body.includes('REQUEST=GetFeature')
                && req.body.includes('TYPENAME=parent_layer')
                && req.body.includes('dl=1')
                ) {
                    // send the modified request and skip any other
                    // matching request handlers
                    req.alias = 'GetExport'
                }
            }
        )

        // Click on the export button
        cy.get('#attribute-layer-main-parent_layer .export-formats > button:nth-child(1)').click({ force: true })
        cy.get('#attribute-layer-main-parent_layer .export-formats > ul:nth-child(2) > li:nth-child(1) > a:nth-child(1)').click({ force: true })

        cy.wait('@GetExport')
        .then(({response}) => {
            expect(response.statusCode).to.eq(200)
            expect(response.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(response.body).to.have.property('type', 'FeatureCollection')
            expect(response.body).to.have.property('features')
            expect(response.body.features).to.have.length(2)
            const feature = response.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('parent_layer.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Point')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(2)
            /*cy.fixture('export/export_parent_layer.geojson').then((fixtureGeoJSON) => {
                expect(response.statusCode).to.eq(200)
                expect(response.body).to.deep.eq(JSON.parse(fixtureGeoJSON))
            })*/
        })

        // Select the second feature
        cy.get('#attribute-layer-table-parent_layer lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.2"] .feature-select').click({ force: true })
        cy.wait(300)

        // Click on the export button
        cy.get('#attribute-layer-main-parent_layer .export-formats > button:nth-child(1)').click({ force: true })
        cy.get('#attribute-layer-main-parent_layer .export-formats > ul:nth-child(2) > li:nth-child(1) > a:nth-child(1)').click({ force: true })

        cy.wait('@GetExport')
        .then(({response}) => {
            expect(response.statusCode).to.eq(200)
            expect(response.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(response.body).to.have.property('type', 'FeatureCollection')
            expect(response.body).to.have.property('features')
            expect(response.body.features).to.have.length(1)
            const feature = response.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('parent_layer.2')
            expect(feature).to.have.property('bbox')
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature.bbox).to.have.length(4)
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 2)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Point')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(2)
            /*cy.fixture('export/export_parent_layer_feature_2.geojson').then((fixtureGeoJSON) => {
                expect(response.statusCode).to.eq(200)
                expect(response.body).to.deep.eq(JSON.parse(fixtureGeoJSON))
            })*/
        })

        // Filter the selected feature and export
        cy.get('#attribute-layer-main-parent_layer .btn-filter-attributeTable').click({ force: true })
        cy.wait(300)

        // Export
        cy.get('#attribute-layer-main-parent_layer .export-formats > button:nth-child(1)').click({ force: true })
        cy.get('#attribute-layer-main-parent_layer .export-formats > ul:nth-child(2) > li:nth-child(1) > a:nth-child(1)').click({ force: true })

        cy.wait('@GetExport')
        .then(({response}) => {
            expect(response.statusCode).to.eq(200)
            expect(response.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(response.body).to.have.property('type', 'FeatureCollection')
            expect(response.body).to.have.property('features')
            expect(response.body.features).to.have.length(1)
            const feature = response.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('parent_layer.2')
            expect(feature).to.have.property('bbox')
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature.bbox).to.have.length(4)
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 2)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Point')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(2)
            /*cy.fixture('export/export_parent_layer_feature_2.geojson').then((fixtureGeoJSON) => {
                expect(response.statusCode).to.eq(200)
                expect(response.body).to.deep.eq(JSON.parse(fixtureGeoJSON))
            })*/
        })
    })

    it('should export the features of a non spatial layer depending on the selection or filter', function () {
        // Open data_uids in attribute table
        cy.get('#button-attributeLayers').click()
        cy.get('button[value="data_uids"].btn-open-attribute-layer').click({ force: true })

        cy.wait(300)

        // Intercept only the GetFeature requests for the test layer
        cy.intercept(
            'index.php/lizmap/service?repository=testsrepository&project=feature_toolbar',
            { method: 'POST', middleware: true },
            (req) => {
                // no cache
                req.on('before:response', (res) => {
                    res.headers['cache-control'] = 'no-store'
                })

                if (req.body.includes('REQUEST=GetFeature')
                && req.body.includes('TYPENAME=data_uids')
                && req.body.includes('dl=1')
                ) {
                    req.alias = 'GetExport'
                }
            }
        )

        // Click on the export button
        cy.get('#attribute-layer-main-data_uids  .export-formats > button:nth-child(1)').click({ force: true })
        cy.get('#attribute-layer-main-data_uids  .export-formats > ul:nth-child(2) > li:nth-child(1) > a:nth-child(1)').click({ force: true })

        cy.wait('@GetExport')
        .then(({response}) => {
            expect(response.statusCode).to.eq(200)
            expect(response.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(response.body).to.have.property('type', 'FeatureCollection')
            expect(response.body).to.have.property('features')
            expect(response.body.features).to.have.length(5)
            expect(response.body.features[0].id).to.equal('data_uids.1')
            cy.fixture('export/export_data_uids.geojson').then((fixtureGeoJSON) => {
                expect(response.statusCode).to.eq(200)
                expect(response.body).to.deep.eq(JSON.parse(fixtureGeoJSON))
            })
        })

        // Select the second feature
        cy.get('#attribute-layer-main-data_uids lizmap-feature-toolbar[value="data_uids_481aebcb_1b4e_495a_9664_ca64ee1becc4.2"] .feature-select').click({ force: true })
        cy.get('#attribute-layer-main-data_uids lizmap-feature-toolbar[value="data_uids_481aebcb_1b4e_495a_9664_ca64ee1becc4.4"] .feature-select').click({ force: true })
        cy.wait(300)

        // Click on the export button
        cy.get('#attribute-layer-main-data_uids  .export-formats > button:nth-child(1)').click({ force: true })
        cy.get('#attribute-layer-main-data_uids  .export-formats > ul:nth-child(2) > li:nth-child(1) > a:nth-child(1)').click({ force: true })

        cy.wait('@GetExport')
        .then(({response}) => {
            expect(response.statusCode).to.eq(200)
            expect(response.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(response.body).to.have.property('type', 'FeatureCollection')
            expect(response.body).to.have.property('features')
            expect(response.body.features).to.have.length(2)
            expect(response.body.features[0].id).to.equal('data_uids.2')
            expect(response.body.features[1].id).to.equal('data_uids.4')
            cy.fixture('export/export_data_uids_features_2_and_4.geojson').then((fixtureGeoJSON) => {
                expect(response.statusCode).to.eq(200)
                expect(response.body).to.deep.eq(JSON.parse(fixtureGeoJSON))
            })
        })

        // Filter the selected feature and export
        cy.get('#attribute-layer-main-data_uids .btn-filter-attributeTable').click({ force: true })
        cy.wait(300)

        // Export
        cy.get('#attribute-layer-main-data_uids  .export-formats > button:nth-child(1)').click({ force: true })
        cy.get('#attribute-layer-main-data_uids  .export-formats > ul:nth-child(2) > li:nth-child(1) > a:nth-child(1)').click({ force: true })
        cy.wait('@GetExport')
        .then(({response}) => {
            expect(response.statusCode).to.eq(200)
            expect(response.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(response.body).to.have.property('type', 'FeatureCollection')
            expect(response.body).to.have.property('features')
            expect(response.body.features).to.have.length(2)
            expect(response.body.features[0].id).to.equal('data_uids.2')
            expect(response.body.features[1].id).to.equal('data_uids.4')
            cy.fixture('export/export_data_uids_features_2_and_4.geojson').then((fixtureGeoJSON) => {
                expect(response.statusCode).to.eq(200)
                expect(response.body).to.deep.eq(JSON.parse(fixtureGeoJSON))
            })
        })
    })

})
