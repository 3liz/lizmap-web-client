// # Test the filter by polygon

// The QGIS project contains 5 layers

//     * PostgreSQL
//     * ** townhalls_pg ** is a PostgreSQL point layer configured with editing and attribute table.The filter is set with the context`Editing only`.
//   * ** shop_bakery_pg ** is another PostgreSQL point layer configured with editing and attribute table.The filter is set with the context`Display and editing`.
// * Shapefiles
//     * ** townhalls ** The same layer in SHP, configured only with attribute table.The filter is set with the context`Display and editing`.
//   * ** shop_bakery ** The bakey layer in SHP, configured only with attribute table.The filter is set with the context`Display and editing`.

// * ** polygons ** is the layer containing the polygons to filter by.The field `groups` contains the list of group(s) for each feature.The polygons containings the group `group_a` are drawn with a red border.The label helps to see the content of the `groups` field.

// ## Procedure

// In LWC admin panel,

// * [] Create a group `group_a` and a user`user_in_group_a`,
// * [] Add `user_in_group_a` to the group`group_a`,
// * [] Give the group `group_a` the right to view the projects and to edit the data in the Lizmap `tests` repository.

// * When not connected:
//     * [] The user can see the data in the map, popup and attribute table only for the layer`townhalls_pg`.
//     * [] The user cannot edit the data, even for the layer`townhalls_pg`.

// * When connected as `admin` :
//     * [] All the data of all the layers can be seen in the map and edited.
//     * [] When clicking on the map on any point in the 2 PostgreSQL layers, the popup should show edition and deletion capabilities.

// * When connected as `user_in_group_a`
//     * [] The user can see all the data in the map, popup and attribute table for the layer `townhalls_pg`.
//     * [] The user can see all the data in the map and attribute table for the layer `townhalls_EPSG2154`.
//     * [] The user can see the data in the map, popup and attribute table for the layers`shop_bakery_pg` and`shop_bakery` ** only inside the 3 red polygons **.
//     * [] The user can only edit data for the layers`townhalls_pg` and`shop_bakery_pg` ** inside the 3 red polygons **
//     * [] For these layers, if the user creates a point or move a point outside the red polygons, an error must be raised: "The given geometry is outside the authorized polygon".

import { arrayBufferToBase64 } from '../support/function.js'

describe('Filter layer data by polygon for groups', function () {

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

    afterEach(function () {
        cy.logout()
    })

    it('not connected', function () {
        // Runs before each tests in the block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=filter_layer_data_by_polygon_for_groups')
        // cy.wait('@getMap')
        // cy.wait(1000)
        // The user can see the data in the map, popup and attribute table only for the layer`townhalls_pg`

        // 1/ map
        cy.get('#node-townhalls_pg').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            // cy.fixture('images/filter_layer_data_by_polygon_for_groups/townhalls_pg_getmap.png').then((image) => {
            //     expect(image, 'expect townhalls_pg map being displayed').to.equal(responseBodyAsBase64)
            // })
        })

        cy.get('#node-shop_bakery_pg').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            // cy.fixture('images/blank_getmap.png').then((image) => {
            //     expect(image, 'expect shop_bakery_pg map being displayed as blank').to.equal(responseBodyAsBase64)
            // })
        })

        cy.get('#node-townhalls_EPSG2154').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            // cy.fixture('images/blank_getmap.png').then((image) => {
            //     expect(image, 'expect townhalls_EPSG2154 map being displayed as blank').to.equal(responseBodyAsBase64)
            // })
        })

        cy.get('#node-shop_bakery').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            // cy.fixture('images/blank_getmap.png').then((image) => {
            //     expect(image, 'expect shop_bakery map being displayed as blank').to.equal(responseBodyAsBase64)
            // })
        })

        // 2/ popup
        cy.mapClick(630, 415)
        cy.wait('@postGetFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'townhalls_pg')

        // 3/ attribute table
        // only townhalls_pg should return data
        cy.get('#button-attributeLayers').click()

        cy.get('button[value="shop_bakery"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@getFeature')
        cy.get('#attribute-layer-table-shop_bakery tbody tr').should('have.length', 0)

        cy.get('#nav-tab-attribute-summary').click()
        cy.get('button[value="townhalls_EPSG2154"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@getFeature')
        cy.get('#attribute-layer-table-townhalls_EPSG2154 tbody tr').should('have.length', 0)

        cy.get('#nav-tab-attribute-summary').click()
        cy.get('button[value="shop_bakery_pg"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@getFeature')
        cy.get('#attribute-layer-table-shop_bakery_pg tbody tr').should('have.length', 0)

        cy.get('#nav-tab-attribute-summary').click()
        cy.get('button[value="townhalls_pg"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@getFeature')
        cy.get('#attribute-layer-table-townhalls_pg tbody tr').should('have.length', 16)

        // The user cannot edit the data, even for the layer townhalls_pg

        // Every edit and delete buttons are hidden
        cy.get('#attribute-layer-table-townhalls_pg button.feature-edit.hide').should('have.length', 16)
        cy.get('#attribute-layer-table-townhalls_pg button.feature-delete.hide').should('have.length', 16)

        // Edition is impossible even when forcing button's display
        cy.get('#attribute-layer-table-townhalls_pg .feature-edit:first').invoke("removeClass", "hide").click({ force: true })
        // => a message is displayed
        cy.get('ul.jelix-msg > li').should('have.class', 'jelix-msg-item-FeatureNotEditable')
    })

    it('connected as user_in_group_a', function () {
        cy.loginAsUserA()
        cy.visit('index.php/view/map/?repository=testsrepository&project=filter_layer_data_by_polygon_for_groups')
        cy.wait('@getMap')
        cy.wait(1000)
        // The user can see all the data in the map, popup and attribute table for the layers`townhalls_pg` and`townhalls_EPSG2154`.

        // 1/ map
        cy.get('#node-townhalls_pg').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            // cy.fixture('images/filter_layer_data_by_polygon_for_groups/townhalls_pg_getmap.png').then((image) => {
            //     expect(image, 'expect townhalls_pg map being displayed').to.equal(responseBodyAsBase64)
            // })
        })

        cy.get('#node-shop_bakery_pg').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            // cy.fixture('images/filter_layer_data_by_polygon_for_groups/shop_bakery_pg_getmap.png').then((image) => {
            //     expect(image, 'expect shop_bakery_pg map being displayed').to.equal(responseBodyAsBase64)
            // })
        })

        cy.get('#node-townhalls_EPSG2154').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            // cy.fixture('images/filter_layer_data_by_polygon_for_groups/townhalls_EPSG2154_getmap.png').then((image) => {
            //     expect(image, 'expect townhalls_EPSG2154 map being displayed').to.equal(responseBodyAsBase64)
            // })
        })

        cy.get('#node-shop_bakery').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            // cy.fixture('images/filter_layer_data_by_polygon_for_groups/shop_bakery_getmap.png').then((image) => {
            //     expect(image, 'expect shop_bakery map being displayed').to.equal(responseBodyAsBase64)
            // })
        })

        // 2/ popup
        cy.mapClick(630, 415)
        //cy.mapClick(605, 400)
        cy.wait('@postGetFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.length', 1)
        cy.get('.lizmapPopupTitle').should('have.text', 'townhalls_pg')

        cy.get('.lizmapPopupDiv .feature-edit').should('have.class', 'hide')

        cy.mapClick(575, 275)
        cy.wait('@postGetFeatureInfo')
        cy.get('.lizmapPopupDiv .feature-edit').should('not.have.class', 'hide')

        // 3/ attribute table
        // only townhalls_pg should return all data, other should be filtered
        cy.get('#button-attributeLayers').click()

        cy.get('button[value="shop_bakery"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@getFeature')
        cy.get('#attribute-layer-table-shop_bakery tbody tr').should('have.length', 5)

        cy.get('#nav-tab-attribute-summary').click()
        cy.get('button[value="townhalls_EPSG2154"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@getFeature')
        cy.get('#attribute-layer-table-townhalls_EPSG2154 tbody tr').should('have.length', 4)

        cy.get('#nav-tab-attribute-summary').click()
        cy.get('button[value="shop_bakery_pg"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@getFeature')
        cy.get('#attribute-layer-table-shop_bakery_pg tbody tr').should('have.length', 4)

        cy.get('#nav-tab-attribute-summary').click()
        cy.get('button[value="townhalls_pg"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@getFeature')
        cy.get('#attribute-layer-table-townhalls_pg tbody tr').should('have.length', 16)

        // The user can only edit 5 features for the layer townhalls_pg (16 - 5 = 11 are hidden)
        cy.get('#attribute-layer-table-townhalls_pg button.feature-edit.hide').should('have.length', 11)
        cy.get('#attribute-layer-table-townhalls_pg button.feature-edit:not(.hide)').should('have.length', 5)

        // Edition is impossible even when forcing button's display
        cy.get('#attribute-layer-table-townhalls_pg lizmap-feature-toolbar[value="townhalls_pg_f97f7bce_29dc_469b_a5ef_baaf25ba1b31.4"] .feature-edit').invoke("removeClass", "hide").click({ force: true })
        // => a message is displayed
        cy.get('ul.jelix-msg > li').should('have.class', 'jelix-msg-item-FeatureNotEditable')

        // Close attribute table
        cy.get('.btn-bottomdock-clear').click({ force: true })

        // 4/ For townhalls_pg (tested) and shop_bakery_pg if the user creates a point outside the red polygons
        //    => an error must be raised: "The given geometry is outside the authorized polygon".
        // The edition dock is already displayed because of the error message
        //cy.get('#button-edition').click()

        cy.get('#edition-layer').select('townhalls_pg_f97f7bce_29dc_469b_a5ef_baaf25ba1b31')

        // Intercept editFeature query to wait for its end
        cy.intercept('/index.php/lizmap/edition/editFeature*').as('editFeature')
        cy.get('#edition-draw').click()
        // Wait editFeature query ends + slight delay for UI to be ready
        cy.wait('@editFeature')
        cy.wait(200)

        // Click to create feature outside allowed area
        cy.ol2MapClick(675, 465)

        cy.get('#jforms_view_edition__submit_submit').click()

        // Assert error message
        cy.get('#jforms_view_edition_errors > p').should('have.text', 'The given geometry is outside the authorized polygon.')

    })

    it('connected as admin', function () {
        cy.loginAsAdmin()
        cy.visit('index.php/view/map/?repository=testsrepository&project=filter_layer_data_by_polygon_for_groups')
        cy.wait('@getMap')
        cy.wait(1000)
        // The admin can see all the data in the map, popup and attribute table.

        // 1/ map
        cy.get('#node-townhalls_pg').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            // cy.fixture('images/filter_layer_data_by_polygon_for_groups/townhalls_pg_getmap.png').then((image) => {
            //     expect(image, 'expect townhalls_pg map being displayed').to.equal(responseBodyAsBase64)
            // })
        })

        cy.get('#node-shop_bakery_pg').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            // cy.fixture('images/blank_getmap.png').then((image) => {
            //     expect(image, 'expect shop_bakery_pg map being displayed as not blank').to.not.equal(responseBodyAsBase64)
            // })

            // cy.fixture('images/filter_layer_data_by_polygon_for_groups/shop_bakery_pg_getmap.png').then((image) => {
            //     expect(image, 'expect shop_bakery_pg map being displayed with all data').to.not.equal(responseBodyAsBase64)
            // })
        })

        cy.get('#node-townhalls_EPSG2154').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            // cy.fixture('images/blank_getmap.png').then((image) => {
            //     expect(image, 'expect townhalls_EPSG2154 map being displayed as not blank').to.not.equal(responseBodyAsBase64)
            // })

            // cy.fixture('images/filter_layer_data_by_polygon_for_groups/townhalls_EPSG2154_getmap.png').then((image) => {
            //     expect(image, 'expect townhalls_EPSG2154 map being displayed').to.not.equal(responseBodyAsBase64)
            // })
        })

        cy.get('#node-shop_bakery').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            // cy.fixture('images/blank_getmap.png').then((image) => {
            //     expect(image, 'expect shop_bakery map being displayed as not blank').to.not.equal(responseBodyAsBase64)
            // })

            // cy.fixture('images/filter_layer_data_by_polygon_for_groups/shop_bakery_getmap.png').then((image) => {
            //     expect(image, 'expect shop_bakery map being displayed with all data').to.not.equal(responseBodyAsBase64)
            // })
        })

        // 2/ popup
        cy.mapClick(630, 415)
        cy.wait('@postGetFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.length', 2)
        cy.get('.lizmapPopupTitle').first().should('have.text', 'townhalls_pg')
        cy.get('.lizmapPopupTitle').last().should('have.text', 'shop_bakery_pg')

        cy.get('.lizmapPopupDiv .feature-edit').should('not.have.class', 'hide')

        cy.mapClick(605, 400)
        cy.wait('@postGetFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.length', 1)
        cy.get('.lizmapPopupTitle').should('have.text', 'townhalls_pg')

        cy.get('.lizmapPopupDiv .feature-edit').should('not.have.class', 'hide')

        cy.mapClick(575, 275)
        cy.wait('@postGetFeatureInfo')
        cy.get('.lizmapPopupDiv .feature-edit').should('not.have.class', 'hide')

        // 3/ attribute table
        // only townhalls_pg should return all data, other should be filtered
        cy.get('#button-attributeLayers').click()

        cy.get('button[value="shop_bakery"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@getFeature')
        cy.get('#attribute-layer-table-shop_bakery tbody tr').should('have.length', 25)

        cy.get('#nav-tab-attribute-summary').click()
        cy.get('button[value="townhalls_EPSG2154"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@getFeature')
        cy.get('#attribute-layer-table-townhalls_EPSG2154 tbody tr').should('have.length', 17)

        cy.get('#nav-tab-attribute-summary').click()
        cy.get('button[value="shop_bakery_pg"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@getFeature')
        cy.get('#attribute-layer-table-shop_bakery_pg tbody tr').should('have.length', 17)

        cy.get('#nav-tab-attribute-summary').click()
        cy.get('button[value="townhalls_pg"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@getFeature')
        cy.get('#attribute-layer-table-townhalls_pg tbody tr').should('have.length', 16)

        // The user can edit all features for the layer townhalls_pg
        cy.get('#attribute-layer-table-townhalls_pg button.feature-edit.hide').should('have.length', 0)
        cy.get('#attribute-layer-table-townhalls_pg button.feature-edit:not(.hide)').should('have.length', 16)
    })
})
