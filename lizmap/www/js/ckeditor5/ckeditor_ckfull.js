function jelix_ckeditor_ckfull(textarea_id, form_id, skin, config){
    var ckConfig = {
        toolbar: [
            'heading', '|',
            'bold', 'italic','underline','strikethrough', 'subscript', 'superscript', 'link', '|',
            'outdent','indent', 'alignment', 'bulletedList', 'numberedList','blockQuote', '|',
            'undo', 'redo',  '|',
            "insertTable", "tableColumn", "tableRow", "mergeTableCells"
        ],

        heading: {
            options: [
                { model: 'paragraph', title: 'Paragraphe', class: 'ck-heading_paragraph' },
                { model: 'heading2', view: 'h2', title: 'Titre 2', class: 'ck-heading_heading2' },
                { model: 'heading3', view: 'h3', title: 'Titre 3 ', class: 'ck-heading_heading3' }
            ]
        },
        indentBlock: {
            offset: 2,
            unit: 'em'
        },
        language: config.locale.substr(0,2).toLowerCase()
    };

    ClassicEditor
        .create( document.querySelector( '#'+textarea_id ), ckConfig )
        .then( function(editor) {
            jQuery('#'+form_id).bind('jFormsUpdateFields', function(event){
                editor.updateSourceElement();
            });
        } )
        .catch( function(error) {
            console.error( error );
        });
}
