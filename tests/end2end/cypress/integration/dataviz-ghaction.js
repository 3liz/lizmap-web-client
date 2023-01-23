describe('Dataviz tests', function () {
    it('Test dataviz plots are rendered', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=dataviz')
        cy.get('#button-dataviz').click()

        // Test first plot - Municipalities
        cy.get('#dataviz_plot_0_container > h3:nth-child(1) > span:nth-child(1) > span:nth-child(2)')
            .should('have.text', 'Municipalities')

        // Test - Bar bakeries by municipalities
        cy.get('#dataviz_plot_1_container > h3:nth-child(1) > span:nth-child(1) > span:nth-child(2)')
            .should('have.text', 'Bar Bakeries by municipalities')

        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.plot')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.plot g.trace.bars')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.plot g.trace.bars g.points')
            .should('have.length', 1)
        cy.get('#dataviz_plot_1 div.svg-container svg.main-svg g.cartesianlayer g.plot g.trace.bars g.points g.point')
            .should('have.length', 10)

        // Test - Pie bakeries by municipalities
        cy.get('#dataviz_plot_2_container > h3:nth-child(1) > span:nth-child(1) > span:nth-child(2)')
            .should('have.text', 'Pie Bakeries by municipalities')

        cy.get('#dataviz_plot_2 div.svg-container svg.main-svg g.pielayer')
            .should('have.length', 1)
        cy.get('#dataviz_plot_2 div.svg-container svg.main-svg g.pielayer g.trace')
            .should('have.length', 1)
        cy.get('#dataviz_plot_2 div.svg-container svg.main-svg g.pielayer g.trace g.slice')
            .should('have.length', 10)

        // Test - Horizontal bar bakeries in municipalities
        cy.get('#dataviz_plot_3_container > h3:nth-child(1) > span:nth-child(1) > span:nth-child(2)')
            .should('have.text', 'Horizontal bar bakeries in municipalities')

        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer')
            .should('have.length', 1)
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.plot')
            .should('have.length', 1)
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.plot g.trace.bars')
            .should('have.length', 1)
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.plot g.trace.bars g.points')
            .should('have.length', 1)
        cy.get('#dataviz_plot_3 div.svg-container svg.main-svg g.cartesianlayer g.plot g.trace.bars g.points g.point')
            .should('have.length', 10)

        // This test is not really covering the dataviz capabilities for now.
    })

    it('Test filtered dataviz plots are rendered in a popup', function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=dataviz_filtered_in_popup')

        // Dataviz button does not exist because every dataviz has to be displayed in popup
        cy.get('#button-dataviz').should('not.exist')

        // Popup
        cy.mapClick(550, 400)
        cy.get('#popupcontent').should('be.visible')

        cy.get('#popupcontent .lizmapPopupChildren.lizdataviz > h4').should('have.text', 'Number of bakeries by polygon')

        cy.get('#popupcontent .lizmapPopupChildren.lizdataviz .dataviz-waiter').should('not.be.visible')
        cy.get('#popupcontent .lizmapPopupChildren.lizdataviz .plot-container')
            .should('be.visible').should('have.class', 'plotly')
            .children().first() // <div class="svg-container" style="position:relative; width: 100%; height: 400px;">
            .should('have.class', 'svg-container')
            .should('have.css', 'height', '400px')
    })


    it('Test JSON data for plot 0 - Municipalities', function () {
        cy.request({
            method: 'GET',
            url: '/index.php/dataviz/service?repository=testsrepository&project=dataviz',
            qs: {
                'request': 'getPlot',
                'plot_id': '0'
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/json')
            expect(resp.body).to.have.property('title', 'Municipalities')
            expect(resp.body).to.have.property('data')
            expect(resp.body.data).to.have.length(1)
            expect(resp.body.data[0]).to.have.property('type', 'bar')
            expect(resp.body.data[0]).to.have.property('x').to.deep.eq(["Grabels", "Clapiers", "Montferrier-sur-Lez", "Saint-Jean-de-Védas", "Lattes", "Montpellier", "Lavérune", "Juvignac", "Le Crès", "Castelnau-le-Lez"])
            expect(resp.body.data[0]).to.have.property('y').to.deep.eq([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
            expect(resp.body).to.have.property('layout')
        })
    })

    it('Test JSON data for plot 2 - Pie bakeries by municipalities', function () {
        cy.request({
            method: 'GET',
            url: '/index.php/dataviz/service?repository=testsrepository&project=dataviz',
            qs: {
                'request': 'getPlot',
                'plot_id': '2'
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/json')
            expect(resp.body).to.have.property('title', 'Pie Bakeries by municipalities')
            expect(resp.body).to.have.property('data')
            expect(resp.body.data).to.have.length(1)
            expect(resp.body.data[0]).to.have.property('type', 'pie')
            expect(resp.body.data[0]).to.have.property('values').to.deep.eq([ 4, 2, 6, 1, 2, 1, 2, 1, 4, 2 ])
            expect(resp.body.data[0]).to.have.property('labels').to.deep.eq([ "Castelnau-le-Lez", "Clapiers", "Grabels", "Juvignac", "Lattes", "Lavérune", "Le Crès", "Montferrier-sur-Lez", "Montpellier", "Saint-Jean-de-Védas" ])
            expect(resp.body).to.have.property('layout')
        })
    })



    it('Test JSON data for plot 3 - Horizontal bar bakeries in municipalities', function () {
        cy.request({
            method: 'GET',
            url: '/index.php/dataviz/service?repository=testsrepository&project=dataviz',
            qs: {
                'request': 'getPlot',
                'plot_id': '3'
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/json')
            expect(resp.body).to.have.property('title', 'Horizontal bar bakeries in municipalities')
            expect(resp.body).to.have.property('data')
            expect(resp.body.data).to.have.length(1)
            expect(resp.body.data[0]).to.have.property('orientation', 'h')
            expect(resp.body.data[0].transforms).to.deep.eq(
                [
                    {
                        "type": "aggregate",
                        "groups": "y",
                        "aggregations": [
                            {
                                "target": "x",
                                "func": "count",
                                "enabled": true
                            }
                        ]
                    }
                ]
            )
            expect(resp.body.data[0]).to.have.property('x').to.deep.eq([
                1,
                16,
                68,
                69,
                73,
                79,
                99,
                102,
                103,
                119,
                126,
                140,
                143,
                151,
                155,
                157,
                158,
                163,
                168,
                173,
                174,
                181,
                195,
                197,
                199
            ])
            expect(resp.body.data[0]).to.have.property('type', 'bar')
            expect(resp.body.data[0]).to.have.property('y').to.deep.eq([
                "Grabels",
                "Grabels",
                "Montferrier-sur-Lez",
                "Lavérune",
                "Montpellier",
                "Montpellier",
                "Saint-Jean-de-Védas",
                "Grabels",
                "Clapiers",
                "Clapiers",
                "Montpellier",
                "Juvignac",
                "Castelnau-le-Lez",
                "Castelnau-le-Lez",
                "Grabels",
                "Grabels",
                "Le Crès",
                "Lattes",
                "Lattes",
                "Castelnau-le-Lez",
                "Castelnau-le-Lez",
                "Saint-Jean-de-Védas",
                "Montpellier",
                "Le Crès",
                "Grabels"
            ])
            expect(resp.body).to.have.property('layout')
        })
    })

    it('Test JSON data filtered for plot in popup - Number of bakeries by polygon', function () {
        cy.request({
            method: 'GET',
            url: '/index.php/dataviz/service?repository=testsrepository&project=dataviz_filtered_in_popup',
            qs: {
                'request': 'getPlot',
                'plot_id': '0',
                'exp_filter': `"polygon_id" IN ('5')`

            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/json')
            expect(resp.body).to.have.property('title', 'Number of bakeries by polygon')
            expect(resp.body).to.have.property('data')
            expect(resp.body.data).to.have.length(1)
            expect(resp.body.data[0]).to.have.property('type', 'bar')
            expect(resp.body.data[0]).to.have.property('x').to.deep.eq([ 5, 5, 5, 5 ])
            expect(resp.body.data[0]).to.have.property('y').to.deep.eq([ 73, 79, 126, 195 ])
            expect(resp.body).to.have.property('layout')
        })
    })

    it('Test the dataviz API as admin with basic auth to create a new plot', function () {
        let json_body = {
            "repository": "testsrepository",
            "project": "dataviz",
            "plot_config": {
                "type": "bar",
                "title": "Bakeries by district",
                "layerId": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810",
                "x_field": "polygons_name",
                "aggregation": "count",
                "traces": [
                    {
                        "color": "cyan",
                        "colorfield": "",
                        "y_field": "id",
                        "z_field": ""
                    }
                ],
                "popup_display_child_plot": "False",
                "stacked": "False",
                "horizontal": "False",
                "only_show_child": "False",
                "display_legend": "True",
                "display_when_layer_visible": "False",
                "order": 5
            }
        };

        cy.request({
            method: 'POST',
            url: '/index.php/dataviz/service?',
            headers:{
                authorization:'Basic YWRtaW46YWRtaW4=',
            },
            json: true,
            body: json_body
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/json')
            expect(resp.body).to.have.property('title', 'Bakeries by district')
            expect(resp.body).to.have.property('data')
            expect(resp.body.data).to.have.length(1)
            expect(resp.body.data[0]).to.have.property('type', 'bar')
            expect(resp.body.data[0].marker).to.have.property('color', 'cyan')
            expect(resp.body.data[0].transforms[0].aggregations[0]).to.have.property('func', 'count')
        })
    })

    it('Test the dataviz API as admin with a wrong layer id', function () {
        let json_body = {
            "repository": "testsrepository",
            "project": "dataviz",
            "plot_config": {
                "type": "bar",
                "title": "Bakeries by district",
                "layerId": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810_WRONG_LAYER_ID",
                "x_field": "polygons_name",
                "aggregation": "count",
                "traces": [
                    {
                        "color": "cyan",
                        "colorfield": "",
                        "y_field": "id",
                        "z_field": ""
                    }
                ],
                "popup_display_child_plot": "False",
                "stacked": "False",
                "horizontal": "False",
                "only_show_child": "False",
                "display_legend": "True",
                "display_when_layer_visible": "False",
                "order": 5
            }
        };

        cy.request({
            method: 'POST',
            url: '/index.php/dataviz/service?',
            headers:{
                authorization:'Basic YWRtaW46YWRtaW4=',
            },
            json: true,
            body: json_body,
            failOnStatusCode: false
        }).then((resp) => {
            expect(resp.status).to.eq(404)
            expect(resp.headers['content-type']).to.contain('application/json')
            expect(resp.body).to.have.property('errors')
            expect(resp.body.errors).to.have.property('code', 404)
            expect(resp.body.errors).to.have.property('error_code', 'layer_not_found')
        })
    })

})
