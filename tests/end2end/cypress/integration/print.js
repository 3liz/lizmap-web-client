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

    const path = require("path")
    const downloadsFolder = Cypress.config("downloadsFolder")

    it('should print title labels (PNG)', function () {
        const PNG = require('pngjs').PNG;
        const pixelmatch = require('pixelmatch');

        cy.get('#print-format').select('png')
        cy.intercept('POST', '*test_print*').as('GetPrint')
        let getprinturl = null
        cy.window().then((win) => {
            cy.stub(win, 'open', (_url, _target) => {
                expect(_target).to.be.equal('_blank')
                expect(_url).to.contain('blob:')
                getprinturl = _url
                // By default the method is replaced and do nothing
                // To reactivate window.open uncomment the next line
                //return win.open.wrappedMethod.call(win, _url, _target)
            }).as("OpenGetPrint")
        })

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

                expect(pixelmatch(img1.data, img2.data, null, width, height, { threshold: 0 }), 'expect print default values in the title labels').to.equal(0)
            })

            // stub has been called
            cy.get('@OpenGetPrint').should("be.called")
            expect(getprinturl).to.be.not.null

            // check URL provided window.open
            fetch(getprinturl).then(r => {
                expect([...(r.headers.keys())]).to.include.members(['content-type', 'content-length'])
                expect(r.headers.get('content-type')).to.contain('image/png')
                expect(parseInt(r.headers.get('content-length'))).to.be.greaterThan(0)
                expect(r.url).to.contain('blob:')
                //r.blob()
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

                expect(pixelmatch(img1.data, img2.data, null, width, height, { threshold: 0 }), 'expect print changed values in the title labels').to.equal(0)
            })
        })
    })

    it('should print JPG', function () {
        cy.get('#print-format').select('jpg')
        cy.intercept('POST', '*test_print*').as('GetPrint')
        let getprinturl = null
        cy.window().then((win) => {
            cy.stub(win, 'open', (_url, _target) => {
                expect(_target).to.be.equal('_blank')
                expect(_url).to.contain('blob:')
                getprinturl = _url
                // By default the method is replaced and do nothing
                // To reactivate window.open uncomment the next line
                //return win.open.wrappedMethod.call(win, _url, _target)
            }).as("OpenGetPrint")
        })

        // Default values in title labels
        cy.get('#print-launch').click()

        cy.wait('@GetPrint').should(({ request, response }) => {
            expect(response.headers['content-type']).to.contain('image/jpeg')
            expect(response.headers['content-disposition']).to.contain('attachment; filename=')

            // stub has been called
            cy.get('@OpenGetPrint').should("be.called")
            expect(getprinturl).to.be.not.null

            // check URL provided window.open
            fetch(getprinturl).then(r => {
                expect([...(r.headers.keys())]).to.include.members(['content-type', 'content-length'])
                expect(r.headers.get('content-type')).to.contain('image/jpeg')
                expect(parseInt(r.headers.get('content-length'))).to.be.greaterThan(0)
                expect(r.url).to.contain('blob:')
                //r.blob()
            })
        })
    })

    it('should print SVG', function () {
        cy.get('#print-format').select('svg')
        cy.intercept('POST', '*test_print*').as('GetPrint')
        let getprinturl = null
        cy.window().then((win) => {
            cy.stub(win, 'open', (_url, _target) => {
                expect(_target).to.be.equal('_blank')
                expect(_url).to.contain('blob:')
                getprinturl = _url
                // By default the method is replaced and do nothing
                // To reactivate window.open uncomment the next line
                //return win.open.wrappedMethod.call(win, _url, _target)
            }).as("OpenGetPrint")
        })

        // Default values in title labels
        cy.get('#print-launch').click()

        cy.wait('@GetPrint').should(({ request, response }) => {
            expect(response.headers['content-type']).to.contain('image/svg+xml')
            expect(response.headers['content-disposition']).to.contain('attachment; filename=')
            expect(response.body).to.contain('Change title')

            // stub has been called
            cy.get('@OpenGetPrint').should("be.called")
            expect(getprinturl).to.be.not.null

            // check URL provided window.open
            fetch(getprinturl).then(r => {
                expect([...(r.headers.keys())]).to.include.members(['content-type', 'content-length'])
                expect(r.headers.get('content-type')).to.contain('image/svg+xml')
                expect(parseInt(r.headers.get('content-length'))).to.be.greaterThan(0)
                expect(r.url).to.contain('blob:')
                r.text().then(body => {
                    expect(body).to.contain('Change title')
                })
            })
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

            // stub has been called
            cy.get('@OpenGetPrint').should("be.called")
            expect(getprinturl).to.be.not.null

            // check URL provided window.open
            fetch(getprinturl).then(r => {
                expect([...(r.headers.keys())]).to.include.members(['content-type', 'content-length'])
                expect(r.headers.get('content-type')).to.contain('image/svg+xml')
                expect(parseInt(r.headers.get('content-length'))).to.be.greaterThan(0)
                expect(r.url).to.contain('blob:')
                r.text().then(body => {
                    expect(body).to.contain('A test')
                })
            })
        })
    })


    it('should print PDF', function () {
        cy.get('#print-format').select('pdf')
        cy.intercept('POST', '*test_print*').as('GetPrint')
        let getprinturl = null
        cy.window().then((win) => {
            cy.stub(win, 'open', (_url, _target) => {
                expect(_target).to.be.equal('_blank')
                expect(_url).to.contain('blob:')
                getprinturl = _url
                // By default the method is replaced and do nothing
                // To reactivate window.open uncomment the next line
                //return win.open.wrappedMethod.call(win, _url, _target)
            }).as("OpenGetPrint")
        })

        // Default values in title labels
        cy.get('#print-launch').click()

        cy.wait('@GetPrint').should(({ request, response }) => {
            expect(response.headers['content-type']).to.contain('application/pdf')
            expect(response.headers['content-disposition']).to.contain('attachment; filename=')

            // stub has been called
            cy.get('@OpenGetPrint').should("be.called")
            expect(getprinturl).to.be.not.null

            // check URL provided window.open
            fetch(getprinturl).then(r => {
                expect([...(r.headers.keys())]).to.include.members(['content-type', 'content-length'])
                expect(r.headers.get('content-type')).to.contain('application/pdf')
                expect(parseInt(r.headers.get('content-length'))).to.be.greaterThan(0)
                expect(r.url).to.contain('blob:')
                //r.blob()
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
