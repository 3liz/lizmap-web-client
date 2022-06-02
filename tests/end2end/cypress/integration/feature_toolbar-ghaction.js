import {arrayBufferToBase64} from '../support/function.js'

describe('Feature Toolbar', function () {

    beforeEach(function () {
        // Runs before each tests in the block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=feature_toolbar&lang=en_en')

        cy.wait(300)
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

        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"] .feature-select').click()

        cy.wait('@getMap')

        // Test feature is selected on map
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
        cy.get('#map').click(625, 362)

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
        cy.get('#map').click(625, 362)

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

    it('should display working custom action', function () {
        // Click feature with id=1 on the map
        cy.get('#map').click(625, 362)

        cy.get('.popupButtonBar .popup-action').click()

        // Test feature is selected on popup
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.1"] .feature-select').should('have.class', 'btn-primary')

        cy.on('window:confirm', () => true);

        // Confirmation message should be displayed
        cy.get('#message #lizmap-action-message p').should('have.text', 'The buffer 500m has been displayed in the map')

        // End action
        cy.get('.popupButtonBar .popup-action').click()
        cy.get('#message').should('be.empty')
    })

    it('should start child edition linked to a parent feature', function () {
        // Click feature with id=2 on the map
        cy.get('#map').click(1025, 362)

        // Start parent edition
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.2"] .feature-edit').click()

        // Start child edition
        cy.get('#edition-children-container lizmap-feature-toolbar[value="children_layer_358cb5a3_0c83_4a6c_8f2f_950e7459d9d0.1"] .feature-edit').click()

        // Parent_id is disabled in form when edition is started from parent form
        cy.get('#jforms_view_edition_parent_id').should('be.disabled')
    })
})

describe('Export data', function () {

    beforeEach(function () {
        // Runs before each tests in the block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=feature_toolbar&lang=en_en')

        cy.wait(300)
    })

    it('should export the features of a spatial layer depending on the selection or filter', function () {
        // Open parent_layer in attribute table
        cy.get('#button-attributeLayers').click()
        cy.get('button[value="parent_layer"].btn-open-attribute-layer').click({ force: true })

        // Intercept only the GetFeature requests for the parent layer
        cy.intercept(
            'index.php/lizmap/service/?repository=testsrepository&project=feature_toolbar',
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
            'index.php/lizmap/service/?repository=testsrepository&project=feature_toolbar',
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
