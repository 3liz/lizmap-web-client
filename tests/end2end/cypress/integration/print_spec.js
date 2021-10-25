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

const arrayBufferToBase64 = (buffer) => {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

describe('Print', function () {
    beforeEach(function () {
        // Runs before each tests in this block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=test_print')
        // Open print panel
        cy.get('#button-print').click()
    })

    it('shoud print title labels (PNG)', function () {
        cy.get('#print-format').select('png')
        cy.intercept('POST', '*test_print*').as('GetPrint')

        // Default values in title labels
        cy.get('#print-launch').click()

        cy.wait('@GetPrint').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            cy.fixture('images/print/print_default_labels.png', 'base64').then((png) => {
                expect(png, 'expect print default values in the title labels').to.equal(responseBodyAsBase64)
            })
        })

        // Changed values in title labels
        cy.get('#print [name="simple_title"]').clear()
        cy.get('#print [name="simple_title"]').type('A test')

        cy.get('#print [name="html_title"]').clear()
        cy.get('#print [name="html_title"]').type('A test<br>with an <i>HTML</i> line break')

        cy.get('#print-launch').click()

        cy.wait('@GetPrint').then((interception) => {
            const responseBodyAsBase64 = arrayBufferToBase64(interception.response.body)

            cy.fixture('images/print/print_changed_labels.png', 'base64').then((png) => {
                expect(png, 'expect print changed values in the title labels').to.equal(responseBodyAsBase64)
            })
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
