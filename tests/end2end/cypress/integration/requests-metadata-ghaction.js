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

            // check repositories
            expect(response.body.repositories.testsrepository).to.deep.eq(
                {
                    "label": "Tests repository",
                    "path": "tests/",
                    "authorized_groups": [
                        "__anonymous",
                        "admins",
                        "group_a"
                    ],
                    "editing_authorized_groups": [
                        "__anonymous",
                        "admins",
                        "group_a"
                    ]
                }
            )

            // check groups of users
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
})
