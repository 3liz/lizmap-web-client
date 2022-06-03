describe('Projects homepage', function () {
    beforeEach(function () {
        cy.visit('/index.php/view/')
    })

    it('should display project metadata (cold cache)', function () {
        cy.get('.liz-project-title:contains("Test tags: nature, flower")')
            .prev('.liz-project')
            .children('.liz-project-desc').as('all-metadata')

        cy.get('@all-metadata').should('not.be.visible')
        cy.get('@all-metadata').parent('.liz-project').trigger('mouseover')
        cy.get('@all-metadata').should('be.visible')

        cy.get('@all-metadata').find('.title').should('contain.text','Test tags: nature, flower')
        cy.get('@all-metadata').find('.abstract').should('contain.text','This is an abstract')
        cy.get('@all-metadata').find('.keywordList').should('contain.text','nature, flower')
        cy.get('@all-metadata').find('.proj').should('contain.text','EPSG:4326')
        cy.get('@all-metadata').find('.bbox').should('contain.text','-1.2459627329192546, -1.0, 1.2459627329192546, 1.0')

        cy.get('@all-metadata').parent('.liz-project').trigger('mouseout')
        cy.get('@all-metadata').should('not.be.visible')

        cy.get('.liz-project-title:contains("Tests tags: nature, tree")')
            .prev('.liz-project')
            .children('.liz-project-desc').as('all-metadata-tree')

        cy.get('@all-metadata-tree').should('not.be.visible')
        cy.get('@all-metadata-tree').parent('.liz-project').trigger('mouseover')
        cy.get('@all-metadata-tree').should('be.visible')

        cy.get('@all-metadata-tree').find('.title').should('contain.text','Tests tags: nature, tree')
        cy.get('@all-metadata-tree').find('.abstract').should('contain.text','Tags: nature, tree')
        cy.get('@all-metadata-tree').find('.keywordList').should('contain.text','nature, tree')
        cy.get('@all-metadata-tree').find('.proj').should('contain.text','EPSG:4326')
        cy.get('@all-metadata-tree').find('.bbox').should('contain.text','-1.2459627329192546, -1.0, 1.2459627329192546, 1.0')

        cy.get('@all-metadata-tree').parent('.liz-project').trigger('mouseout')
        cy.get('@all-metadata-tree').should('not.be.visible')
    })

    // Assert metadata are still visible when backend is hot
    it('should display project metadata  (hot cache)', function () {
        cy.get('.liz-project-title:contains("Test tags: nature, flower")')
            .prev('.liz-project')
            .children('.liz-project-desc').as('all-metadata')

        cy.get('@all-metadata').should('not.be.visible')
        cy.get('@all-metadata').parent('.liz-project').trigger('mouseover')
        cy.get('@all-metadata').should('be.visible')

        cy.get('@all-metadata').find('.title').should('contain.text', 'Test tags: nature, flower')
        cy.get('@all-metadata').find('.abstract').should('contain.text', 'This is an abstract')
        cy.get('@all-metadata').find('.keywordList').should('contain.text', 'nature, flower')
        cy.get('@all-metadata').find('.proj').should('contain.text', 'EPSG:4326')
        cy.get('@all-metadata').find('.bbox').should('contain.text', '-1.2459627329192546, -1.0, 1.2459627329192546, 1.0')

        cy.get('@all-metadata').parent('.liz-project').trigger('mouseout')
        cy.get('@all-metadata').should('not.be.visible')
    })

    it('should search in title', function () {
        // Check that toggle search button is in the title search state
        cy.get('#toggle-search').should('contain.text', 'T')
        // Clear the search input
        cy.get('#search-project').clear()
        // The home page displays more than 2 projects
        cy.get('.liz-repository-project-item:visible').should('have.length.greaterThan', 2)
        cy.get('.liz-repository-project-item:visible').its('length').as('totalProjects')
        // Insert value in search input
        cy.get('#search-project').type('nature')
        // CHeck the number of title projects that contains the serach value
        cy.get('.liz-repository-project-item:visible').should('length', 2)
        // Clear the search input
        cy.get('#search-project').clear()
        cy.get('.liz-repository-project-item:visible').should('have.length.greaterThan', 2)
        cy.get('@totalProjects').then((num) => {
            cy.get('.liz-repository-project-item:visible').should('length', num)
        })
    })

    it('should search by tag', function () {
        // Check that toggle search button is in the title search state
        cy.get('#toggle-search').should('contain.text', 'T')
        // Toggle the search
        cy.get('#toggle-search').click(true)
        // Check that toggle search button is in the tag search state
        cy.get('#toggle-search').should('contain.text', '#')
        // Clear the search input
        cy.get('#search-project').clear()
        // The home page displays more than 2 projects
        cy.get('.liz-repository-project-item:visible').should('have.length.greaterThan', 2)
        cy.get('.liz-repository-project-item:visible').its('length').as('totalProjects')
        // Input value in search input
        cy.get('#search-project').type('nature')
        // Search by tag as not been performed yet
        cy.get('.liz-repository-project-item:visible').should('have.length.greaterThan', 2)
        cy.get('@totalProjects').then((num) => {
            cy.get('.liz-repository-project-item:visible').should('length', num)
        })
        // Checked displayed keywords
        cy.get('#search-project-keywords').should('be.visible')
        cy.get('#search-project-result .project-keyword').should('length', 3)
        cy.get('#search-project-result .project-keyword:visible').should('length', 1)
        cy.get('#search-project').should('have.value', 'nature')
        // Select a keyword
        cy.get('#search-project-result .project-keyword:visible').click(true)
        cy.get('#search-project').should('have.value', '')
        cy.get('#search-project-keywords-selected .project-keyword:visible').should('length', 1)
        cy.get('#search-project-result .project-keyword:visible').should('length', 2)
        cy.get('.liz-repository-project-item:visible').should('length', 2)
        // Reset filter by tag
        cy.get('#search-project-keywords-selected .project-keyword:visible .remove-keyword').click(true)
        cy.get('.liz-repository-project-item:visible').should('have.length.greaterThan', 2)
        cy.get('@totalProjects').then((num) => {
            cy.get('.liz-repository-project-item:visible').should('length', num)
        })

        // Clear the search input
        cy.get('#search-project').clear()
        // Input value in search input
        cy.get('#search-project').type('tree')
        cy.get('#search-project-result .project-keyword').should('length', 3)
        cy.get('#search-project-result .project-keyword:visible').should('length', 1)
        // Select a keyword
        cy.get('#search-project-result .project-keyword:visible').click(true)
        cy.get('#search-project-keywords-selected .project-keyword:visible').should('length', 1)
        cy.get('#search-project-result .project-keyword:visible').should('length', 1)
        cy.get('.liz-repository-project-item:visible').should('length', 1)
        // Reset filter by tag
        cy.get('#search-project-keywords-selected .project-keyword:visible .remove-keyword').click(true)


        // Clear the search input
        cy.get('#search-project').clear()
        // Input value in search input
        cy.get('#search-project').type('flower')
        cy.get('#search-project-result .project-keyword').should('length', 3)
        cy.get('#search-project-result .project-keyword:visible').should('length', 1)
        // Select a keyword
        cy.get('#search-project-result .project-keyword:visible').click(true)
        cy.get('#search-project-keywords-selected .project-keyword:visible').should('length', 1)
        cy.get('#search-project-result .project-keyword:visible').should('length', 1)
        cy.get('.liz-repository-project-item:visible').should('length', 1)
        // Reset filter by tag
        cy.get('#search-project-keywords-selected .project-keyword:visible .remove-keyword').click(true)
    })

    it('should search by tags', function () {
        // Check that toggle search button is in the title search state
        cy.get('#toggle-search').should('contain.text', 'T')
        // Toggle the search
        cy.get('#toggle-search').click(true)
        // Check that toggle search button is in the tag search state
        cy.get('#toggle-search').should('contain.text', '#')
        // Clear the search input
        cy.get('#search-project').clear()
        // The home page displays more than 2 projects
        cy.get('.liz-repository-project-item:visible').should('have.length.greaterThan', 2)
        cy.get('.liz-repository-project-item:visible').its('length').as('totalProjects')
        // Input value in search input
        cy.get('#search-project').type('nature')
        // Checked displayed keywords
        cy.get('#search-project-keywords').should('be.visible')
        cy.get('#search-project-result .project-keyword').should('length', 3)
        cy.get('#search-project-result .project-keyword:visible').should('length', 1)
        cy.get('#search-project').should('have.value', 'nature')
        // Select a keyword
        cy.get('#search-project-result .project-keyword:visible').click(true)
        cy.get('#search-project').should('have.value', '')
        cy.get('#search-project-keywords-selected .project-keyword:visible').should('length', 1)
        cy.get('#search-project-result .project-keyword:visible').should('length', 2)
        cy.get('.liz-repository-project-item:visible').should('length', 2)
        // Select a second keyword
        cy.get('#search-project-result .project-keyword:visible').first().click(true)
        cy.get('#search-project-keywords-selected .project-keyword:visible').should('length', 2)
        cy.get('.liz-repository-project-item:visible').should('length', 1)
        cy.get('.liz-repository-project-item:visible .liz-project-title').contains('nature, flower')
        // Unselect the second keyword
        cy.get('#search-project-keywords-selected .project-keyword:visible').last().find('.remove-keyword').click(true)
        cy.get('#search-project-keywords-selected .project-keyword:visible').should('length', 1)
        cy.get('#search-project-result .project-keyword:visible').should('length', 2)
        cy.get('.liz-repository-project-item:visible').should('length', 2)
        // Select an other second keyword
        cy.get('#search-project-result .project-keyword:visible').last().click(true)
        cy.get('#search-project-keywords-selected .project-keyword:visible').should('length', 2)
        cy.get('.liz-repository-project-item:visible').should('length', 1)
        cy.get('.liz-repository-project-item:visible .liz-project-title').contains('nature, tree')
        // Unselect the first keyword
        cy.get('#search-project-keywords-selected .project-keyword:visible').first().find('.remove-keyword').click(true)
        cy.get('#search-project-keywords-selected .project-keyword:visible').should('length', 1)
        cy.get('#search-project-result .project-keyword:visible').should('length', 1)
        cy.get('.liz-repository-project-item:visible').should('length', 1)
        cy.get('.liz-repository-project-item:visible .liz-project-title').contains('nature, tree')
        // Reset filter by tag
        cy.get('#search-project-keywords-selected .project-keyword:visible .remove-keyword').click(true)
        cy.get('.liz-repository-project-item:visible').should('have.length.greaterThan', 2)
        cy.get('@totalProjects').then((num) => {
            cy.get('.liz-repository-project-item:visible').should('length', num)
        })
    })

    it('Check project_acl visibility according to the connected user and its group', function () {
        cy.logout();
        cy.visit('/index.php/view/');
        cy.get('.liz-repository-project-item:visible .liz-project-title').contains('project_acl').should('not.exist');

        cy.loginAsUserA();
        cy.visit('/index.php/view/');
        cy.get('.liz-repository-project-item:visible .liz-project-title').contains('project_acl').should('exist');

        cy.loginAsAdmin();
        cy.visit('/index.php/view/');
        cy.get('.liz-repository-project-item:visible .liz-project-title').contains('project_acl').should('not.exist');
        cy.logout();
    })
})
