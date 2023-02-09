import {arrayBufferToBase64, serverMetadata} from '../support/function.js'

describe('Legend tests', function () {
    it('Test GetLegendGraphics', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=layer_legends')

        // We do not want to test straight the GetLegendGraphic, because we want to check how the URL is built
        // so we better just check the URL and not the output

        const checks = ['layer_legend_single_symbol', 'layer_legend_categorized']

        for (const check of checks) {
            cy.intercept('*GetLegendGraphic*').as('legend')
            cy.get('tr#layer-' + check +'.liz-layer.initialized.parent.collapsed td a.expander').click()

            cy.wait('@legend').then((interception) => {
                expect(interception.response.headers['content-type'], 'expect mime type to be image/png').to.equal('image/png')

                serverMetadata().then(metadataResponse => {
                    const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

                    // Default image for QGIS 3.22
                    let expected_path = 'images/treeview/' + check +'.png'

                    if (metadataResponse.body.qgis_server_info.metadata.version_int < 31700 && check == 'layer_legend_categorized') {
                        // previous image of the legend which was working for QGIS 3.16
                        expected_path = 'images/treeview/layer_legend_categorized_316.png';
                    }

                    // With QGIS 3.28, we do not test anymore : https://github.com/qgis/QGIS/pull/50256
                    if (metadataResponse.body.qgis_server_info.metadata.version_int < 32800) {
                        cy.fixture(expected_path).then((image) => {
                            expect(image, 'expect legend to be compared with ' + expected_path).to.equal(responseBodyAsBase64)
                        })
                    }
                })
            })
        }
    })
})
