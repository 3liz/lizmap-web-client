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
        cy.wait(100)

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
        cy.wait('@postGetFeatureInfo')

        // Check WMS GetFeatureInfo request for children
        cy.wait('@postGetFeatureInfo').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WMS')
                .to.contain('REQUEST=GetFeatureInfo')
                .to.contain('QUERY_LAYERS=children_layer')
                .to.contain('FILTER=children_layer%3A%22parent_id%22+%3D+%271%27')
        })

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

    it('should start child edition linked to a parent feature from the child feature toolbar', function () {
        // Click feature with id=2 on the map
        cy.mapClick(1055, 437)
        cy.wait('@postGetFeatureInfo')

        // Check WMS GetFeatureInfo request for children
        cy.wait('@postGetFeatureInfo').then((interception) => {
            expect(interception.request.body)
                .to.contain('SERVICE=WMS')
                .to.contain('REQUEST=GetFeatureInfo')
                .to.contain('QUERY_LAYERS=children_layer')
                .to.contain('FILTER=children_layer%3A%22parent_id%22+%3D+%272%27')
        })

        // Start parent edition
        cy.get('#popupcontent lizmap-feature-toolbar[value="parent_layer_d3dc849b_9622_4ad0_8401_ef7d75950111.2"] .feature-edit').click()

        // Start child edition
        cy.get('#edition-children-container lizmap-feature-toolbar[value="children_layer_358cb5a3_0c83_4a6c_8f2f_950e7459d9d0.1"] .feature-edit').click()

        cy.wait(300)

        // Parent_id is hidden in form when edition is started from parent form
        cy.get('#jforms_view_edition_parent_id').should('have.class', 'hide');

        // Parent_id input should have the value 2 selected
        cy.get('#jforms_view_edition_parent_id').find('option:selected').should('have.value', '2');
    })
})
