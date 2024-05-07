// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

//Adds for cypress-file-upload
import 'cypress-file-upload';

Cypress.Commands.add('logout', () => {
    cy.visit('admin.php/auth/login/out?lang=en_US')
    cy.visit('index.php/view/')
    cy.get('li.login a span.text.hidden-phone').should('have.text', "Connect")
})

Cypress.Commands.add(
    '_login',(username, password) => {
        cy.logout();
        cy.visit('admin.php/auth/login')

        cy.get('#jforms_jcommunity_login_auth_login').type(username)
        cy.get('#jforms_jcommunity_login_auth_password').type(password)
        cy.get('form').submit()
        cy.get('#info-user-login').should('have.text', username)
    }
)

Cypress.Commands.add(
    'loginAsAdmin',() => {
        cy._login(Cypress.env('login_admin'), Cypress.env('password_admin'))
    }
)

Cypress.Commands.add(
    'loginAsUserA',() => {
        cy._login(Cypress.env('login_user_a'), Cypress.env('password_user_a'))
    }
)

Cypress.Commands.add(
    'loginAsPublisher',() => {
        cy._login(Cypress.env('login_publisher'), Cypress.env('password_publisher'))
    }
)


Cypress.Commands.add(
    'mapClick', (x, y) => {
        // Make a click on the map when we have absolute coordinates from the whole web-browser canvas.
        // We need to remove some pixels to focus only on the map
        // The left menu measures 30 pixels
        // The header measures 75 pixels
        cy.get('#newOlMap').click(x - 30, y - 75)
    }
)

Cypress.Commands.add(
    'ol2MapClick', (x, y) => {
        cy.get('#map').click(x - 30, y - 75)
    }
)

Cypress.Commands.add(
    'gotoMap', (url, check = true) => {
        // TODO keep this function synchronized with the Playwright equivalent

        cy.visit(url)

        // Better way to wait for a GetCapabilities at least ?
        cy.wait(300)

        if (check) {
            cy.get('.error-msg').should("not.exist");
            cy.get('#dock').should("exist");
        } else {
            cy.get('.error-msg').should("exist");
            cy.contains('.error-msg', "An error occurred while loading this map.")
            cy.get('#dock').should("not.exist");
        }
    }
)
