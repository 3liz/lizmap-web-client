describe('Form edition', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=form_edition')
        // Todo wait for map to be fully loaded
        cy.wait(1000)
        // Display edition if not active
        cy.get('li.edition #button-edition').click()
    })

    it('must not show digitization tab for non geom layers', function () {
        // Intercept editFeature query to wait for its end
        cy.intercept('/index.php/lizmap/edition/editFeature*').as('editFeature')

        cy.get('#edition-draw').click()

        // Wait editFeature query ends + slight delay for UI to be ready
        cy.wait('@editFeature')
        cy.wait(200)

        cy.get('.edition-tabs button[data-bs-target="#tabdigitization"]').should('not.be.visible')
    })

    it('must show digitization tab for geom layers', function () {
        // Intercept editFeature query to wait for its end
        cy.intercept('/index.php/lizmap/edition/editFeature*').as('editFeature')

        // Select layer with geometry for edition
        cy.get('#edition-layer').select('end2end_form_edition_geom_a08c6b07_3376_4193_9dd6_dff1d6755382')
        cy.get('#edition-draw').click()

        // Wait editFeature query ends + slight delay for UI to be ready
        cy.wait('@editFeature')
        cy.wait(200)

        cy.get('.edition-tabs button[data-bs-target="#tabdigitization"]').should('be.visible')
    })

    it('must save feature without geom and allow geom creation when not existing', function () {
        // Select layer with geometry for edition
        cy.get('#edition-layer').select('end2end_form_edition_geom_a08c6b07_3376_4193_9dd6_dff1d6755382')
        cy.get('#edition-draw').click()

        cy.get('#jforms_view_edition_value').type('42')

        // Save feature without geom
        cy.get('#jforms_view_edition__submit_submit').click()

        // Assert success message is displayed
        cy.get('#message .jelix-msg-item-success').should('be.visible')

        // Allow geom creation when not existing
        cy.get('button[value="end2end_form_edition_geom"].btn-open-attribute-layer').click({ force: true })
        cy.get('button.feature-edit:first').click({ force: true })
        cy.get('.edition-tabs button[data-bs-target="#tabdigitization"]').should('be.visible')

        // Draw point
        cy.ol2MapClick(630, 325)

        // Save feature with new geom point
        cy.get('#jforms_view_edition__submit_submit').click()

        // Delete feature
        cy.get('button.feature-delete:first').click({ force: true })
    })


    it('must show edition form, submit form and gets success message', function () {
        // Intercept editFeature query to wait for its end
        cy.intercept('/index.php/lizmap/edition/editFeature*').as('editFeature')

        // Select layer with no geometry for edition
        cy.get('#edition-layer').select('end2end_form_edition_e77a188c_0547_4304_8df1_a74755e5b42e')
        cy.get('#edition-draw').click()

        // Wait editFeature query ends + slight delay for UI to be ready
        cy.wait('@editFeature')
        cy.wait(200)

        // Assert form is displayed
        cy.get('#edition').should('be.visible')

        cy.get('#jforms_view_edition_value').type('42')
        cy.get('#jforms_view_edition__submit_submit').click()

        // Assert success message is displayed
        cy.get('#message .jelix-msg-item-success').should('be.visible')
    })

    it('must show edition form when edition launched via attribute table', function () {
        cy.get('#button-attributeLayers').click()

        // Use { force: true } because pointer is not on bottom-dock
        cy.get('button[value="end2end_form_edition"].btn-open-attribute-layer').click({ force: true })
        cy.get('button.feature-edit:first').click({ force: true })

        // Assert form is displayed
        cy.get('#edition').should('be.visible')

    })
})
