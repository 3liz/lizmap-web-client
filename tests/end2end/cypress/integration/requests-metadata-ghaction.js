describe('Request JSON metadata', function () {
    it('As anonymous', function () {
        cy.logout();

        var metadata = cy.request({
            url: 'index.php/view/app/metadata',
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.headers['content-type']).to.eq('application/json');
            expect(response.body.qgis_server_info.error).to.eq("NO_ACCESS")
        });
    })

    it('As admin using basic auth', function () {
        cy.logout()

        var request = cy.request({
            url: 'index.php/view/app/metadata',
            headers: {
                authorization: 'Basic YWRtaW46YWRtaW4=',
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.headers['content-type']).to.eq('application/json');

            expect(response.body.qgis_server_info.metadata.py_qgis_server).to.eq(true)
            expect(response.body.qgis_server_info.metadata.py_qgis_server_version).to.contain('.')
            expect(response.body.qgis_server_info.metadata.version).to.contain('3.')
            expect(response.body.qgis_server_info.plugins.lizmap_server.version).to.match(/(\.|master|dev)/i)

            // check the repositories
            expect(response.body.repositories.testsrepository.label).to.eq("Tests repository");
            expect(response.body.repositories.testsrepository.path).to.eq("tests/");
            expect(response.body.repositories.testsrepository.authorized_groups.sort()).to.deep.eq(
                [
                    "__anonymous",
                    "admins",
                    "group_a",
                    "publishers"
                ].sort()
            );
            expect(response.body.repositories.testsrepository.authorized_groups.sort()).to.deep.eq(
                [
                    "__anonymous",
                    "admins",
                    "group_a",
                    "publishers"
                ].sort()
            );
            expect(response.body.repositories.montpellier.projects).to.deep.eq(
                {
                    "events": {
                        "title": "Touristic events around Montpellier, France"
                    },
                    "montpellier": {
                        "title": "Montpellier - Transports"
                    }
                }
            );

            // check the groups of users
            expect(response.body.acl.groups).to.deep.eq(
                {
                    "admins": {
                        "label": "admins"
                    },
                    "group_a": {
                        "label": "group_a"
                    },
                    "intranet": {
                        "label": "Intranet demos group"
                    },
                    "lizadmins": {
                        "label": "lizadmins"
                    },
                    "publishers": {
                        "label": "Publishers"
                    },
                    "users": {
                        "label": "users"
                    }
                }
            )

        });
    })

    it('As admin after login using the UI', function () {
        cy.loginAsAdmin()

        var request = cy.request({
            url: 'index.php/view/app/metadata',
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.headers['content-type']).to.eq('application/json');

            expect(response.body.qgis_server_info.metadata.py_qgis_server).to.eq(true)
            expect(response.body.qgis_server_info.metadata.py_qgis_server_version).to.contain('.')
            expect(response.body.qgis_server_info.metadata.version).to.contain('3.')
            expect(response.body.qgis_server_info.plugins.lizmap_server.version).to.match(/(\.|master|dev)/i)
        });
    })

    it('As normal user using UI', function () {
        cy.loginAsUserA()

        var request = cy.request({
            url: 'index.php/view/app/metadata',
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.headers['content-type']).to.eq('application/json');
            expect(response.body.qgis_server_info.error).to.eq("NO_ACCESS")

        });
    })



    it('As publisher user using UI', function () {
        cy.loginAsPublisher()

        var request = cy.request({
            url: 'index.php/view/app/metadata',
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.headers['content-type']).to.eq('application/json');
            expect(response.body.qgis_server_info.metadata.py_qgis_server).to.eq(true)

            // check the repositories
            expect(response.body.repositories.testsrepository.label).to.eq("Tests repository");
            expect(response.body.repositories.testsrepository.path).to.eq("tests/");
            expect(response.body.repositories.testsrepository.authorized_groups.sort()).to.deep.eq(
                [
                    "__anonymous",
                    "admins",
                    "group_a",
                    "publishers"
                ].sort()
            );
            expect(response.body.repositories.testsrepository.authorized_groups.sort()).to.deep.eq(
                [
                    "__anonymous",
                    "admins",
                    "group_a",
                    "publishers"
                ].sort()
            );
            expect(response.body.repositories.testsrepository.projects.events.title).to.eq('Touristic events around Montpellier, France');

            // check the groups of users
            expect(response.body.acl.groups).to.deep.eq(
                {
                    "admins": {
                        "label": "admins"
                    },
                    "group_a": {
                        "label": "group_a"
                    },
                    "intranet": {
                        "label": "Intranet demos group"
                    },
                    "lizadmins": {
                        "label": "lizadmins"
                    },
                    "publishers": {
                        "label": "Publishers"
                    },
                    "users": {
                        "label": "users"
                    }
                }
            )
        });

    })

    it('As publisher using BASIC Auth with wrong credentials', function () {
        var request = cy.request({
            url: 'index.php/view/app/metadata',
            headers: {
                authorization: 'Basic dXNlcl9pbl9ncm91cF9hOm1hdXZhaXM=',
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.headers['content-type']).to.eq('application/json');
            expect(response.body.qgis_server_info.error).to.eq("WRONG_CREDENTIALS")
            expect(response.body.api.dataviz.version).to.eq("1.0.0")
        });
    })


})
