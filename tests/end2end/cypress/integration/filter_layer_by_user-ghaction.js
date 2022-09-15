describe('Filter layer by user with attributes', function() {

    function checkRedLayer() {

    }

    function checkGreenLayerReadOnly() {

    }

//    it('As anonymous', function(){
//        cy.logout()
//        cy.visit('/index.php/view/map/?repository=testsrepository&project=filter_layer_by_user')
//        cy.get('#button-attributeLayers').click()
//
//        // Red layer without any filter
//        cy.get('button[value="red_layer_with_no_filter"].btn-open-attribute-layer').click({ force: true })
//        cy.get('#attribute-layer-table-red_layer_with_no_filter tbody tr').should('have.length', 1)
//        cy.get('#attribute-layer-table-red_layer_with_no_filter tbody tr .feature-edit').should('exist')
//        cy.get('#attribute-layer-table-red_layer_with_no_filter tbody tr .feature-delete').should('exist')
//        cy.get('#attribute-summary').click({ force: true })
//
//        // Blue layer, filtered by user
//        cy.get('button[value="blue_filter_layer_by_user"].btn-open-attribute-layer').click({ force: true })
//        cy.get('#attribute-layer-table-blue_filter_layer_by_user tbody tr').should('have.length', 0)
//        cy.get('#attribute-summary').click({ force: true })
//
//        // Green layer, filter by user edition only
//        cy.get('button[value="green_filter_layer_by_user_edition_only"].btn-open-attribute-layer').click({ force: true })
//        cy.get('#attribute-layer-table-green_filter_layer_by_user_edition_only tbody tr').should('have.length', 3)
//        cy.get('#attribute-summary').click({ force: true })
//    })

    it('As admin', function(){
        cy.loginAsAdmin()
        cy.visit('/index.php/view/map/?repository=testsrepository&project=filter_layer_by_user')
        cy.get('#button-attributeLayers').click()

        cy.intercept('POST', '/index.php/lizmap/edition/editableFeatures').as('editableFeatures')

        // Red layer without any filter
        cy.get('button[value="red_layer_with_no_filter"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@editableFeatures').its('response.statusCode').should('eq', 200)
        cy.get('#attribute-layer-table-red_layer_with_no_filter tbody tr').should('have.length', 1)
        cy.get('#attribute-layer-table-red_layer_with_no_filter tbody tr .feature-edit').should('exist').should('not.have.attr', 'disabled')
        cy.get('#attribute-layer-table-red_layer_with_no_filter tbody tr .feature-delete').should('exist').should('not.have.attr', 'disabled')
        cy.get('#attribute-summary').click({ force: true })

        // Blue layer, filtered by user
        cy.get('button[value="blue_filter_layer_by_user"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@editableFeatures').its('response.statusCode').should('eq', 200)
        cy.get('#attribute-layer-table-blue_filter_layer_by_user tbody tr').should('have.length', 1)
        cy.get('#attribute-layer-table-blue_filter_layer_by_user tbody tr .feature-edit').should('exist').should('not.have.attr', 'disabled')
        cy.get('#attribute-layer-table-blue_filter_layer_by_user tbody tr .feature-delete').should('exist').should('not.have.attr', 'disabled')
        cy.get('#attribute-summary').click({ force: true })

        // Green layer, filter by user edition only
        cy.get('button[value="green_filter_layer_by_user_edition_only"].btn-open-attribute-layer').click({ force: true })
        cy.wait('@editableFeatures').its('response.statusCode').should('eq', 200)
        cy.get('#attribute-layer-table-green_filter_layer_by_user_edition_only tr[id="2"] lizmap-feature-toolbar .feature-select').click({ force: true })
        cy.get('#attribute-layer-table-green_filter_layer_by_user_edition_only tr[id="1"] lizmap-feature-toolbar .feature-edit').should('exist')
        cy.get('#attribute-layer-table-green_filter_layer_by_user_edition_only tr[id="2"] lizmap-feature-toolbar .feature-edit').should('not.exist')
        cy.get('#attribute-summary').click({ force: true })


        //cy.get('#attribute-layer-table-blue_filter_layer_by_user tbody tr .feature-delete').should('have.length', 1)
        //cy.get('#attribute-layer-table-blue_filter_layer_by_user tbody tr .feature-delete').should('exist')
        //cy.get('#attribute-summary').click({ force: true })
    })
//
//    it('As super admin', function(){
//        cy.loginAsSuperAdmin()
//        cy.visit('/index.php/view/map/?repository=testsrepository&project=filter_layer_by_user')
//        cy.get('#button-attributeLayers').click()

//        cy.mapClick(550, 400)
//    })

})
