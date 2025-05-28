// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import { rmErrorsLog } from './function'

beforeEach(function () {
    // Clear errors
    rmErrorsLog()
})

afterEach(function () {
    // Check errors
    cy.exec('./../lizmap-ctl docker-exec cat /srv/lzm/lizmap/var/log/errors.log', {failOnNonZeroExit: false})
        .then((result) => {
            if (result.code == 0) {
                expect(result.stdout).to.be.empty
            } else {
                expect(result.stderr).to.contain('errors.log: No such file or directory')
            }
        })
})
