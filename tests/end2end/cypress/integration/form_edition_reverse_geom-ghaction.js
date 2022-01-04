describe('Form edition reverse geom', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/map/?repository=testsrepository&project=reverse_geom')
        // Todo wait for map to be fully loaded
        cy.wait(1000)
    })

    it('must reverse geom', function () {
        //Launch edition via the feature popup
        cy.get('#map').click(678, 430)
        cy.get('#popupcontent .feature-edit').click()

        // Go to digitization tab
        cy.get('#edition a[href="#tabdigitization"]').click()
        
        // Click reverse geom button
        cy.get('#tabdigitization lizmap-reverse-geom').click()

        // TODO: test screenshot before and after reverse
    })

})
