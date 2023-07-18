describe('Filename with dot or space', () => {
    
    it('projet with dot or space can be loaded', () => {
        // project file with dot
        cy.visit('/index.php/view/map/?repository=testsrepository&project=base_layers.withdot')
        cy.get('#node-quartiers').should('exist')
        // project file with space 
        cy.visit('/index.php/view/map/?repository=testsrepository&project=base_layers+with+space')
        
        cy.get('#node-quartiers').should('exist')
    })
     
})
