describe('Projects homepage', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/')
    })

    it('should display project metadata (cold cache)', function () {
        cy.get('.liz-project-title:contains("Test tags: nature, flower")')
            .prev('.liz-project')
            .children('.liz-project-desc').as('all-metadata')

        cy.get('@all-metadata').find('.title').should('contain.text','Test tags: nature, flower')
        cy.get('@all-metadata').find('.abstract').should('contain.text','This is an abstract')
        cy.get('@all-metadata').find('.keywordList').should('contain.text','nature, flower')
        cy.get('@all-metadata').find('.proj').should('contain.text','EPSG:4326')
        cy.get('@all-metadata').find('.bbox').should('contain.text','-1.2459627329192546, -1.0, 1.2459627329192546, 1.0')
    })

    // Assert metadata are still visible when backend is hot
    it('should display project metadata  (hot cache)', function () {
        cy.get('.liz-project-title:contains("Test tags: nature, flower")')
            .prev('.liz-project')
            .children('.liz-project-desc').as('all-metadata')

        cy.get('@all-metadata').find('.title').should('contain.text', 'Test tags: nature, flower')
        cy.get('@all-metadata').find('.abstract').should('contain.text', 'This is an abstract')
        cy.get('@all-metadata').find('.keywordList').should('contain.text', 'nature, flower')
        cy.get('@all-metadata').find('.proj').should('contain.text', 'EPSG:4326')
        cy.get('@all-metadata').find('.bbox').should('contain.text', '-1.2459627329192546, -1.0, 1.2459627329192546, 1.0')
    })
})
