// These tests does not pass in Github CI because layer does not display
// FIXME: find why layer does not display in CI
describe('Popup', function() {
    beforeEach(function(){
        // Runs before each tests in this block
        cy.visit('/index.php/view/map/?repository=testsrepository&project=popup')
        // Click on triangle
        cy.get('#map').click(480,340)
    })

    it('click on the shape to show the popup', function(){
        // When clicking on triangle feature a popup with two tabs must appear
        cy.get('#liz_layer_popup').should('be.visible')
        cy.get('#liz_layer_popup_contentDiv > div > div > div > ul > li.active > a').should('be.visible')
        cy.get('#liz_layer_popup_contentDiv > div > div > div > ul > li:nth-child(2) > a').should('be.visible')
    })

    it('changes popup tab', function(){
        //When clicking `tab2`, `tab2_value` must appear
        cy.get('.container > ul:nth-child(2) > li:nth-child(2)').click()
        cy.get('#popup_dd_1_tab2').should('have.class', 'active')
    })

})
