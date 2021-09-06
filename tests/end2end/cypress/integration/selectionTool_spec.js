describe('Selection tool', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=selection')
    })

    it('should toggle selection tool', function () {
        cy.get('#button-selectiontool').click()
        cy.get('#selectiontool').should('be.visible')

        cy.get('.selectiontool-unselect').should('have.attr', 'disabled')
        cy.get('.selectiontool-filter').should('have.attr', 'disabled')

        cy.get('#button-selectiontool').click()
        cy.get('#selectiontool').should('not.be.visible')
    })
})

describe('Selection tool connectected as admin', function () {
    beforeEach(function () {
        // Login as admin and get redirected to selection project
        // TODO: log with request() and not via UI
        cy.visit('/admin.php/auth/login/?auth_url_return=%2Findex.php%2Fview%2Fmap%2F%3Frepository%3Dtestsrepository%26project%3Dselection')

        cy.get('#jforms_jcommunity_login_auth_login').type('admin')
        cy.get('#jforms_jcommunity_login_auth_password').type('admin')
        cy.get('form').submit()

        cy.get('#info-user-login').should('have.text', 'admin')
    })

    it('should select the single point on map which turns yellow', function () {
        cy.get('#button-selectiontool').click()
        // Activate polygon tool
        cy.get('#selectiontool .digitizing-buttons .dropdown-toggle').first().click()
        cy.get('#selectiontool .digitizing-polygon').click()

        cy.intercept('GET', '*REQUEST=GetMap*').as('new-selection')

        cy.get('#map')
            .click(380, 280)
            .click(400, 380)
            .dblclick(500, 380)

        cy.wait('@new-selection')

        cy.get('@new-selection').should(({ request, response }) => {

            function _arrayBufferToBase64(buffer) {
                var binary = '';
                var bytes = new Uint8Array(buffer);
                var len = bytes.byteLength;
                for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return window.btoa(binary);
            }
            const responseBodyAsBase64 = _arrayBufferToBase64(response.body)

            cy.fixture('images/selection_yellow.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect selection in yellow').to.equal(responseBodyAsBase64)
            })
        })
    })
})
