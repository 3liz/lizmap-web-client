describe('Form edition all field type', function() {
    beforeEach(function(){
        cy.visit('/index.php/view/map/?repository=testsrepository&project=form_edition_all_field_type')
        cy.get('#button-edition').click()
    })

    it('media specific folder', function () {
        cy.get('#edition-layer').select('form_edition_upload')
        cy.get('#edition-draw').click()

        // text_file_mandatory
        cy.get('#jforms_view_edition_text_file_mandatory').selectFile({
            contents: Cypress.Buffer.from('file contents'),
            fileName: 'file.txt',
            mimeType: 'text/plain',
            lastModified: Date.now(),
        })

        // image_file_mandatory
        // This field is hidden ...
        // I don't know how to press the button
        cy.fixture('images/blank_getmap.png').then(fileContent => {
             cy.get('#jforms_view_edition_image_file_mandatory').attachFile({
                 fileContent: fileContent.toString(),
                 fileName: 'image.png',
                 mimeType: 'image/png'
             })
        })

        // image_file_specific_root_folder
        cy.get('#jforms_view_edition_image_file_specific_root_folder_jf_action_new').click()
        cy.fixture('images/blank_getmap.png').then(fileContent => {
             cy.get('#jforms_view_edition_image_file_specific_root_folder').attachFile({
                 fileContent: fileContent.toString(),
                 fileName: 'image.png',
                 mimeType: 'image/png'
             })
        })

        cy.get('#jforms_view_edition__submit_submit').click()

    })
})
