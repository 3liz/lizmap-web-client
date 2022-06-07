/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */

require('dotenv').config({path: '../.env'})

module.exports = (on, config) => {
  let qgis_server = process.env.LZMQGSRVVERSION
  config.env.QGIS_SERVER_INT = parseInt(qgis_server.replace('.', '') + 0 + 0)
  return config
}
