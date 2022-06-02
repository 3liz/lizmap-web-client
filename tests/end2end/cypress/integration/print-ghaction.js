// # Test Print Label

// LWC allows to update labels in QGIS layouts with the WMS GetPrint Request

// ## Procedure

// ### Test to update the label in WMS GetPrint request

// * [ ] Click on print tool in the left menu
// * [ ] Select PNG instead of PDF
// * [ ] Launch the print by clicking on the blue button
// * [ ] Open the exported PNG and see that are printed `Change title` at top and `Change HTML title` at bottom
// * [ ] Change the input title label with a space between two words `A test`
// * [ ] Change the textarea title label with a line break (Type Enter) `A test{enter}with a line break`
// * [ ] Launch the print by clicking on the blue button
// * [ ] Open the exported PNG and see that `A test` is printed upper, `A test{enter}with a line break` is printed at bottom

import {arrayBufferToBase64} from '../support/function.js'

describe('Print', function () {
    beforeEach(function () {
        // Runs before each tests in this block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=test_print')
        // Open print panel
        cy.get('#button-print').click()
    })

    const path = require("path")
    const downloadsFolder = Cypress.config("downloadsFolder")

    it('should print title labels (PNG)', function () {
        const PNG = require('pngjs').PNG;
        const pixelmatch = require('pixelmatch');

        cy.get('#print-format').select('png')
        cy.intercept('POST', '*test_print*').as('GetPrint')

        // Default values in title labels
        cy.get('#print-launch').click()

        cy.wait('@GetPrint').should(({ request, response }) => {
            expect(response.headers['content-type']).to.contain('image/png')
            expect(response.headers['content-disposition']).to.contain('attachment; filename=')
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/print/print_default_labels.png').then((image) => {
                // image encoded as base64
                const img1 = PNG.sync.read(Buffer.from(responseBodyAsBase64, 'base64'));
                const img2 = PNG.sync.read(Buffer.from(image, 'base64'));
                const { width, height } = img1;

                // Check pixel match
                expect(pixelmatch(img1.data, img2.data, null, width, height, { threshold: 0 }), 'expect print default values in the title labels').to.equal(0)

                // Check content length > 17000 and < 20000
                expect(parseInt(response.headers['content-length']))
                    .to.be.greaterThan(17000)
                    .to.be.lessThan(20000)
                const contentLength = parseInt(response.headers['content-length'])

                // Check file exists in downloads folder and
                // the content length is the same as the one intercepted
                cy.readFile(path.join(downloadsFolder, "test_print_print_labels.png"), 'binary')
                    .should(buffer => expect(buffer.length).to.be.eq(contentLength))
            })
        })

        // Changed values in title labels
        cy.get('#print [name="simple_title"]').clear()
        cy.get('#print [name="simple_title"]').type('A test')

        cy.get('#print [name="html_title"]').clear()
        cy.get('#print [name="html_title"]').type('A test<br>with an <i>HTML</i> line break')

        cy.get('#print-launch').click()
        cy.wait('@GetPrint').should(({ request, response }) => {
            expect(response.headers['content-type']).to.contain('image/png')
            expect(response.headers['content-disposition']).to.contain('attachment; filename=')
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/print/print_changed_labels.png').then((image) => {
                // image encoded as base64
                const img1 = PNG.sync.read(Buffer.from(responseBodyAsBase64, 'base64'));
                const img2 = PNG.sync.read(Buffer.from(image, 'base64'));
                const { width, height } = img1;

                // Check pixel match
                expect(pixelmatch(img1.data, img2.data, null, width, height, { threshold: 0 }), 'expect print changed values in the title labels').to.equal(0)

                // Check content length > 20000
                expect(parseInt(response.headers['content-length'])).to.be.greaterThan(20000)
                const contentLength = parseInt(response.headers['content-length'])

                // Check file exists in downloads folder and
                // the content length is the same as the one intercepted
                cy.readFile(path.join(downloadsFolder, "test_print_print_labels.png"), 'binary')
                    .should(buffer => expect(buffer.length).to.be.eq(contentLength))
            })
        })
    })

    it('should print JPG', function () {
        cy.get('#print-format').select('jpg')
        cy.intercept('POST', '*test_print*').as('GetPrint')

        // Default values in title labels
        cy.get('#print-launch').click()

        cy.wait('@GetPrint').should(({ request, response }) => {
            expect(response.headers['content-type']).to.contain('image/jpeg')
            expect(response.headers['content-disposition']).to.contain('attachment; filename=')

            // Check content length > 22000
            expect(parseInt(response.headers['content-length'])).to.be.greaterThan(22000)
            const contentLength = parseInt(response.headers['content-length'])

            // Check file exists in downloads folder and
            // the content length is the same as the one intercepted
            cy.readFile(path.join(downloadsFolder, "test_print_print_labels.jpg"), 'binary')
                .should(buffer => expect(buffer.length).to.be.eq(contentLength))
        })
    })

    it('should print SVG', function () {
        cy.get('#print-format').select('svg')
        cy.intercept('POST', '*test_print*').as('GetPrint')

        // Default values in title labels
        cy.get('#print-launch').click()

        cy.wait('@GetPrint').should(({ request, response }) => {
            expect(response.headers['content-type']).to.contain('image/svg+xml')
            expect(response.headers['content-disposition']).to.contain('attachment; filename=')

            expect(response.body).to.contain('Change title')

            // Check content length > 24000 and < 33000
            expect(parseInt(response.headers['content-length']))
                .to.be.greaterThan(24000)
                .to.be.lessThan(33000)
            const contentLength = parseInt(response.headers['content-length'])

            // Check file exists in downloads folder and
            // the content length is the same as the one intercepted
            cy.readFile(path.join(downloadsFolder, "test_print_print_labels.svg"), 'binary')
                .should(buffer => expect(buffer.length).to.be.eq(contentLength))
        })

        // Changed values in title labels
        cy.get('#print [name="simple_title"]').clear()
        cy.get('#print [name="simple_title"]').type('A test')

        cy.get('#print [name="html_title"]').clear()
        cy.get('#print [name="html_title"]').type('A test<br>with an <i>HTML</i> line break')

        cy.get('#print-launch').click()
        cy.wait('@GetPrint').should(({ request, response }) => {
            expect(response.headers['content-type']).to.contain('image/svg+xml')
            expect(response.headers['content-disposition']).to.contain('attachment; filename=')

            expect(response.body).to.contain('A test')

            // Check content length > 33000
            expect(parseInt(response.headers['content-length'])).to.be.greaterThan(33000)
            const contentLength = parseInt(response.headers['content-length'])

            // Check file exists in downloads folder and
            // the content length is the same as the one intercepted
            cy.readFile(path.join(downloadsFolder, "test_print_print_labels.svg"), 'binary')
                .should(buffer => expect(buffer.length).to.be.eq(contentLength))
        })
    })


    it('should print PDF', function () {
        cy.get('#print-format').select('pdf')
        cy.intercept('POST', '*test_print*').as('GetPrint')

        // Default values in title labels
        cy.get('#print-launch').click()

        cy.wait('@GetPrint').should(({ request, response }) => {
            expect(response.headers['content-type']).to.contain('application/pdf')
            expect(response.headers['content-disposition']).to.contain('attachment; filename=')

            // Check content length > 8000
            expect(parseInt(response.headers['content-length'])).to.be.greaterThan(8000)
            const contentLength = parseInt(response.headers['content-length'])

            // Check file exists in downloads folder and
            // the content length is the same as the one intercepted
            cy.readFile(path.join(downloadsFolder, "test_print_print_labels.pdf"), 'binary')
                .should(buffer => expect(buffer.length).to.be.eq(contentLength))
        })
    })

    // PDFs can't be intercepted due to a Cypress bug : https://github.com/cypress-io/cypress/issues/15038
    // So we compare downloaded file to fixture
    // TODO : test is flaky, maybe assert pdf is downloaded

    // const path = require("path");
    // it('should download PDF with default title labels', function () {

    //     cy.get('#print-launch').click()
    //     const downloadsFolder = Cypress.config("downloadsFolder");
    //     cy.readFile(path.join(downloadsFolder, "test_print_print_labels.pdf"), 'base64').then((data) => {
    //         cy.fixture('pdf/print/test_print_print_labels.pdf', 'base64').then((pdf) => {
    //             expect(pdf, 'expect downloaded PDF').to.equal(data)
    //         })
    //     })
    // })

})
