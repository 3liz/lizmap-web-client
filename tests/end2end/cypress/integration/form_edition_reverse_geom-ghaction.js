describe('Form edition reverse geom', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=reverse_geom')
        // Todo wait for map to be fully loaded
        cy.wait(1000)
    })

    it('must reverse geom', function () {
        //Launch edition via the feature popup
        cy.mapClick(650, 415)
        cy.get('#popupcontent .feature-edit').click()

        // Go to digitization tab
        cy.get('#edition button[data-bs-target="#tabdigitization"]').click()

        // Click reverse geom button
        cy.get('#tabdigitization lizmap-reverse-geom').click()

        // TODO: test screenshot before and after reverse
    })

})
