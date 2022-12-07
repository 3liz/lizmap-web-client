import {arrayBufferToBase64} from '../support/function.js'

describe('Overview', () => {

    it('3857', function () {
        cy.intercept('*REQUEST=GetMap*LAYERS=Overview*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMapOverview')

        cy.visit('/index.php/view/map/?repository=testsrepository&project=overview-3857')

        cy.wait('@getMapOverview').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/overview/3857.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect overview 3857').to.equal(responseBodyAsBase64)
            })
        })
    })

    it('4326', function () {
        cy.intercept('*REQUEST=GetMap*LAYERS=Overview*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMapOverview')

        cy.visit('/index.php/view/map/?repository=testsrepository&project=overview-4326')

        cy.wait('@getMapOverview').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/overview/4326.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect overview 4326').to.equal(responseBodyAsBase64)
            })
        })
    })

    it('2154', function () {
        cy.intercept('*REQUEST=GetMap*LAYERS=Overview*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMapOverview')

        cy.visit('/index.php/view/map/?repository=testsrepository&project=overview-2154')

        cy.wait('@getMapOverview').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/overview/2154.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect overview 2154').to.equal(responseBodyAsBase64)
            })
        })
    })

    it('4326 to 3857', function () {
        cy.intercept('/index.php/lizmap/service/getProjectConfig*',
            { middleware: true },
            (req) => {
                delete req.headers['if-none-match']
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
                req.continue((res) => {
                    //expect(res.body).to.include('options')
                    //res.body.options.ignStreets = 'True'
                })
                req.on('response', (res) => {
                    expect(res).to.have.property('body')
                    expect(res.body).to.have.property('options')
                    res.body.options['ignStreets'] = 'True'
                })
            }).as('getProjectConfig')
        cy.intercept('*REQUEST=GetMap*LAYERS=Overview*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMapOverview')

        cy.visit('/index.php/view/map/?repository=testsrepository&project=overview-4326')

        cy.wait('@getMapOverview').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/overview/4326-to-3857.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect overview 4326 to 3857').to.equal(responseBodyAsBase64)
            })
        })
    })

    it('2154 to 3857', function () {
        cy.intercept('/index.php/lizmap/service/getProjectConfig*',
            { middleware: true },
            (req) => {
                delete req.headers['if-none-match']
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
                req.continue((res) => {
                    //expect(res.body).to.include('options')
                    //res.body.options.ignStreets = 'True'
                })
                req.on('response', (res) => {
                    expect(res).to.have.property('body')
                    expect(res.body).to.have.property('options')
                    res.body.options['ignStreets'] = 'True'
                })
            }).as('getProjectConfig')
        cy.intercept('*REQUEST=GetMap*LAYERS=Overview*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMapOverview')

        cy.visit('/index.php/view/map/?repository=testsrepository&project=overview-2154')

        cy.wait('@getMapOverview').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/overview/2154-to-3857.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect overview 2154 to 3857').to.equal(responseBodyAsBase64)
            })
        })
    })

    it('3857 overview with no fixed scale', function () {
        cy.intercept('/index.php/lizmap/service/getProjectConfig*',
            { middleware: true },
            (req) => {
                delete req.headers['if-none-match']
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
                req.continue((res) => {
                    //expect(res.body).to.include('options')
                    //res.body.options.ignStreets = 'True'
                })
                req.on('response', (res) => {
                    expect(res).to.have.property('body')
                    expect(res.body).to.have.property('options')
                    res.body.options['fixed_scale_overview_map'] = false
                })
            }).as('getProjectConfig')

        cy.intercept('*REQUEST=GetMap*LAYERS=Overview*',
            { middleware: true },
            (req) => {
                req.on('before:response', (res) => {
                    // force all API responses to not be cached
                    // It is needed when launching tests multiple time in headed mode
                    res.headers['cache-control'] = 'no-store'
                })
            }).as('getMapOverview')

        cy.visit('/index.php/view/map/?repository=testsrepository&project=overview-3857')

        cy.wait('@getMapOverview').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/overview/3857.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect overview 3857').not.to.equal(responseBodyAsBase64)
            })
        })

        // Zoom twice to get new overview map
        cy.get('#navbar button.btn.zoom-in').click()
        cy.get('#navbar button.btn.zoom-in').click()

        cy.wait('@getMapOverview').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/overview/3857.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect overview 3857').not.to.equal(responseBodyAsBase64)
            })
        })

        // Zoom twice to get new overview map
        cy.get('#navbar button.btn.zoom-in').click()
        cy.get('#navbar button.btn.zoom-in').click()

        cy.wait('@getMapOverview').should(({ request, response }) => {
            const responseBodyAsBase64 = arrayBufferToBase64(response.body)

            cy.fixture('images/overview/3857.png').then((image) => {
                // image encoded as base64
                expect(image, 'expect overview 3857').not.to.equal(responseBodyAsBase64)
            })
        })
    })
})
