
import { arrayBufferToBase64 } from '../support/function.js'

describe('Filter layer data by user', function () {

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

        cy.intercept('*REQUEST=GetFeatureInfo*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getFeatureInfo')
    })

    it('not connected', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=filter_layer_by_user')

        cy.wait(1000)

        // 1 check GetMap

        // display blue_filter_layer_by_user
        cy.get('#layer-blue_filter_layer_by_user button').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            cy.fixture('images/blank_getmap.png').then((image) => {
                expect(image, 'expect blue_filter_layer_by_user button to be blank').to.equal(responseBodyAsBase64)
            })
        })

        // display red_layer_with_no_filter
        cy.get('#layer-red_layer_with_no_filter button').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            cy.fixture('images/blank_getmap.png').then((image) => {
                expect(image, 'expect red_layer_with_no_filter button to not be blank').to.not.equal(responseBodyAsBase64)
            })
        })

        // display green_filter_layer_by_user_edition_only
        cy.get('#layer-green_filter_layer_by_user_edition_only button').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            cy.fixture('images/blank_getmap.png').then((image) => {
                expect(image, 'expect green_filter_layer_by_user_edition_only button to not be blank').to.not.equal(responseBodyAsBase64)
            })
        })

        // 2/ Check Popup
        // red_layer_with_no_filter
        cy.mapClick(627, 269)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'red_layer_with_no_filter')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-edit').should('have.length', 1)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-delete').should('have.length', 1)

        // blue_filter_layer_by_user
        // admin point
        cy.mapClick(548, 421)
        cy.wait('@getFeatureInfo')
        cy.get('.lizmapPopupTitle').should('have.length', 0)
        cy.get('.lizmapPopupContent h4').should('have.text', 'No object has been found at this location.')

        // user a point
        cy.mapClick(701, 418)
        cy.wait('@getFeatureInfo')
        cy.get('.lizmapPopupTitle').should('have.length', 0)
        cy.get('.lizmapPopupContent h4').should('have.text', 'No object has been found at this location.')

        // green_filter_layer_by_user_edition_only
        // admin point
        cy.mapClick(570, 574)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'green_filter_layer_by_user_edition_only')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-edit').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-delete').should('have.length', 0)

        // user a point
        cy.mapClick(668, 578)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'green_filter_layer_by_user_edition_only')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-edit').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-delete').should('have.length', 0)

        // no user point
        cy.mapClick(623, 634)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'green_filter_layer_by_user_edition_only')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-edit').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-delete').should('have.length', 0)
    })

    it('As user a', function(){
        cy.loginAsUserA()
        cy.visit('/index.php/view/map/?repository=testsrepository&project=filter_layer_by_user')

        cy.wait(1000)

        // 1 check GetMap
        // display blue_filter_layer_by_user
        cy.get('#layer-blue_filter_layer_by_user button').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            cy.fixture('images/blank_getmap.png').then((image) => {
                expect(image, 'expect blue_filter_layer_by_user button to be blank').to.not.equal(responseBodyAsBase64)
            })
        })

        // display red_layer_with_no_filter
        cy.get('#layer-red_layer_with_no_filter button').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            cy.fixture('images/blank_getmap.png').then((image) => {
                expect(image, 'expect red_layer_with_no_filter button to not be blank').to.not.equal(responseBodyAsBase64)
            })
        })

        // display green_filter_layer_by_user_edition_only
        cy.get('#layer-green_filter_layer_by_user_edition_only button').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            cy.fixture('images/blank_getmap.png').then((image) => {
                expect(image, 'expect green_filter_layer_by_user_edition_only button to not be blank').to.not.equal(responseBodyAsBase64)
            })
        })

        // red_layer_with_no_filter
        cy.mapClick(627, 269)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'red_layer_with_no_filter')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-edit').should('have.length', 1)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-delete').should('have.length', 1)

        // blue_filter_layer_by_user
        // admin point
        cy.mapClick(548, 421)
        cy.wait('@getFeatureInfo')
        cy.get('.lizmapPopupTitle').should('have.length', 0)
        cy.get('.lizmapPopupContent h4').should('have.text', 'No object has been found at this location.')

        // user a point
        cy.mapClick(701, 418)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'blue_filter_layer_by_user')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.2"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.2"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.2"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.2"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.2"].popup-layer-feature-edit').should('have.length', 1)
        cy.get('#popupcontent button[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.2"].popup-layer-feature-delete').should('have.length', 1)

        // green_filter_layer_by_user_edition_only
        // admin point
        cy.mapClick(570, 574)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'green_filter_layer_by_user_edition_only')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-edit').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-delete').should('have.length', 0)

        // user a point
        cy.mapClick(668, 578)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'green_filter_layer_by_user_edition_only')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-edit').should('have.length', 1)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-delete').should('have.length', 1)

        // no user point
        cy.mapClick(623, 634)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'green_filter_layer_by_user_edition_only')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-edit').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-delete').should('have.length', 0)
    })

    it('As admin', function(){
        cy.loginAsAdmin()
        cy.visit('/index.php/view/map/?repository=testsrepository&project=filter_layer_by_user')

        cy.wait(1000)

        // 1 check GetMap
        // display blue_filter_layer_by_user
        cy.get('#layer-blue_filter_layer_by_user button').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            cy.fixture('images/blank_getmap.png').then((image) => {
                expect(image, 'expect blue_filter_layer_by_user button to be blank').to.not.equal(responseBodyAsBase64)
            })
        })

        // display red_layer_with_no_filter
        cy.get('#layer-red_layer_with_no_filter button').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            cy.fixture('images/blank_getmap.png').then((image) => {
                expect(image, 'expect red_layer_with_no_filter button to not be blank').to.not.equal(responseBodyAsBase64)
            })
        })

        // display green_filter_layer_by_user_edition_only
        cy.get('#layer-green_filter_layer_by_user_edition_only button').click()
        cy.wait('@getMap').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            cy.fixture('images/blank_getmap.png').then((image) => {
                expect(image, 'expect green_filter_layer_by_user_edition_only button to not be blank').to.not.equal(responseBodyAsBase64)
            })
        })

        // red_layer_with_no_filter
        cy.mapClick(627, 269)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'red_layer_with_no_filter')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-edit').should('have.length', 1)
        cy.get('#popupcontent button[value="layer_with_no_filter_89c540b5_0c19_4805_b505_78770286189f.1"].popup-layer-feature-delete').should('have.length', 1)

        // blue_filter_layer_by_user
        cy.mapClick(548, 421)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'blue_filter_layer_by_user')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.1"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.1"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.1"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.1"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.1"].popup-layer-feature-edit').should('have.length', 1)
        cy.get('#popupcontent button[value="filter_layer_by_user_8bd3128f_2cad_4121_b5f9_0b6f6118e2f0.1"].popup-layer-feature-delete').should('have.length', 1)

        // green_filter_layer_by_user_edition_only
        // admin point
        cy.mapClick(570, 574)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'green_filter_layer_by_user_edition_only')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-edit').should('have.length', 1)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.1"].popup-layer-feature-delete').should('have.length', 1)

        // user a point
        cy.mapClick(668, 578)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'green_filter_layer_by_user_edition_only')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-edit').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.2"].popup-layer-feature-delete').should('have.length', 0)

        // no user point
        cy.mapClick(623, 634)
        cy.wait('@getFeatureInfo')

        cy.get('.lizmapPopupTitle').should('have.text', 'green_filter_layer_by_user_edition_only')
        // Check feature toolbar button
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-select').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-filter').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-zoom').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-center').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-edit').should('have.length', 0)
        cy.get('#popupcontent button[value="filter_layer_by_user_edition_only_7bc0e81c_2860_4d6b_8b20_ad6c7b76e42f.3"].popup-layer-feature-delete').should('have.length', 0)
    })
})
