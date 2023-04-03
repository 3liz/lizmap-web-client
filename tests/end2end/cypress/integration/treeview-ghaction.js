import {arrayBufferToBase64, serverMetadata} from '../support/function.js'

describe('Treeview', () => {
    before( () => {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=treeview')
    })

    it('displays group with space in name and shortname defined', () => {
        cy.get('#group-group_with_space_in_name_and_shortname_defined').should('be.visible')
    })

    it('displays legend with features count', () => {
        cy.intercept('*REQUEST=GetLegendGraphic*',
        { middleware: true },
        (req) => {
            req.on('before:response', (res) => {
                // force all API responses to not be cached
                // It is needed when launching tests multiple time in headed mode
                res.headers['cache-control'] = 'no-store'
            })
        }).as('glg')

        cy.get('#layer-quartiers .expander').click()

        cy.wait('@glg')

        cy.get('@glg').should(({ request, response }) => {

            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/treeview/glg_feature_count.png').then((image) => {
                // image encoded as base64
                serverMetadata().then(metadataResponse => {
                    if (metadataResponse.body.qgis_server_info.metadata.version_int < 32215) {
                        // With QGIS 3.28 : https://github.com/qgis/QGIS/pull/50256
                        // Which has been backported in 3.22.15
                        expect(image, 'expect legend with feature count').to.equal(responseBodyAsBase64)
                    }
                });
            })
        })
    })

    it('displays mutually exclusive group', () => {
        cy.get('#switcher-layers .mutually-exclusive').should('have.length', 2)

        cy.get('#layer-quartiers button.checkbox').should('have.class', 'checked')
        cy.get('#layer-shop_bakery_pg button.checkbox').should('not.have.class', 'checked')

        // switch visibility
        cy.get('#layer-shop_bakery_pg button.checkbox').click()

        cy.get('#layer-quartiers button.checkbox').should('not.have.class', 'checked')
        cy.get('#layer-shop_bakery_pg button.checkbox').should('have.class', 'checked')
    })
})
