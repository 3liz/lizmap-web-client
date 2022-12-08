// Disabled on CI for now, I can't make it work
describe('Cors', function() {

    it('send authorized request', function(){
        cy.visit('http://othersite.local:8130')
        cy.get('#launch-request').click();
        cy.get('#status').should('have.text','200');
        cy.get('#response').invoke('val').should('not.be.empty')

    })


    it('send unauthorized request', function(){
        cy.visit('http://othersite.local:8130')
        cy.get('#launch-request-bad').click();
        cy.get('#status_bad').should('be.empty');
        cy.get('#response_bad').invoke('val').should('be.empty')
    })

})
