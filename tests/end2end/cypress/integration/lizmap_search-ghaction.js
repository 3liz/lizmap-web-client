describe('Advanced form', function () {
    beforeEach(function () {
        // Runs before each tests in the block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=form_advanced')
        cy.wait(1500)
    })

    it('should lizmap search available', function () {
        /* lizMap is not available
        let lizMap
        cy.window().then((win) => {
            lizMap = win.lizMap
        })
        expect(lizMap).to.exist
        expect(lizMap.config.options.searches).to.exist
        expect(lizMap.config.options.searches).to.have.lengthOf(1)

        let searchOption = lizMap.config.options.searches[0]
        expect(searchOption).to.have.keys('type', 'service', 'url')
        expect(searchOption.type).to.equal('Fts')*/

        cy.get('#search-query').should('have.length', 1)

        cy.request({
            //url: searchOption.url,
            url: '/index.php/lizmap/searchFts/get',
            qs: {
                'repository': 'testsrepository',
                'project': 'form_advanced',
                'query': 'ceve',
            },
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/json')
            expect(resp.body).to.have.property('Quartier')

            let quartier = resp.body['Quartier']
            expect(quartier).to.have.property('features')
            expect(quartier.features).to.have.lengthOf(1)

            let result = quartier.features[0]
            expect(result).to.have.keys('label', 'geometry')

            expect(resp.body).to.not.have.property('Sous-Quartier')
        })
    })

    it('connected as user_in_group_a', function () {
        // Log as user_in_group_a
        cy.visit('/admin.php/auth/login/?auth_url_return=%2Findex.php%2Fview%2Fmap%2F%3Frepository%3Dtestsrepository%26project%3Dform_advanced&lang=en_en')

        cy.get('#jforms_jcommunity_login_auth_login').type('user_in_group_a')
        cy.get('#jforms_jcommunity_login_auth_password').type('admin')
        cy.get('form').submit()

        cy.wait(1000)

        // Check search input
        cy.get('#search-query').should('have.length', 1)

        // Try a search
        cy.request({
            url: '/index.php/lizmap/searchFts/get',
            qs: {
                'repository': 'testsrepository',
                'project': 'form_advanced',
                'query': 'ceve',
            },
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/json')
            expect(resp.body).to.have.property('Quartier')

            let quartier = resp.body['Quartier']
            expect(quartier).to.have.property('features')
            expect(quartier.features).to.have.lengthOf(1)

            let result = quartier.features[0]
            expect(result).to.have.keys('label', 'geometry')

            expect(resp.body).to.not.have.property('Sous-Quartier')
        })
    })

    it('connected as admin', function () {
        // Log as admin
        cy.visit('/admin.php/auth/login/?auth_url_return=%2Findex.php%2Fview%2Fmap%2F%3Frepository%3Dtestsrepository%26project%3Dform_advanced&lang=en_en')

        cy.get('#jforms_jcommunity_login_auth_login').type('admin')
        cy.get('#jforms_jcommunity_login_auth_password').type('admin')
        cy.get('form').submit()

        cy.wait(1000)

        // Check search input
        cy.get('#search-query').should('have.length', 1)

        // Try a search
        cy.request({
            url: '/index.php/lizmap/searchFts/get',
            qs: {
                'repository': 'testsrepository',
                'project': 'form_advanced',
                'query': 'ceve',
            },
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/json')
            expect(resp.body).to.have.property('Quartier')

            let quartier = resp.body['Quartier']
            expect(quartier).to.have.property('features')
            expect(quartier.features).to.have.lengthOf(1)

            let q_result = quartier.features[0]
            expect(q_result).to.have.keys('label', 'geometry')

            expect(resp.body).to.have.property('Sous-Quartier')

            let sous_quartier = resp.body['Sous-Quartier']
            expect(sous_quartier).to.have.property('features')
            expect(sous_quartier.features).to.have.lengthOf(1)

            let sq_result = quartier.features[0]
            expect(sq_result).to.have.keys('label', 'geometry')
        })
    })
})
