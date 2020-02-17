

/*
 config : an object containing these properties
    locale : the language code
    basePath : the base path of the application
    jqueryPath : the path to jquery library
    jelixWWWPath : the path to the jelix/ directory
*/

function jelix_wymeditor_wymbasic(textarea_id, form_id, skin, config) {
    if (!skin)
        skin = 'default';

    jQuery(function() {
        jQuery("#"+textarea_id).wymeditor({
            basePath: config.jelixWWWPath+'wymeditor/',
            iframeBasePath : config.jelixWWWPath+'js/jforms/htmleditors/wymeditor_basiciframe/',
            jQueryPath: config.jqueryFile != '' ? config.jqueryFile : '',
            lang: config.locale.substr(0,2).toLowerCase(),
            toolsItems: [
                {'name': 'Bold', 'title': 'Strong', 'css': 'wym_tools_strong'},
                {'name': 'Italic', 'title': 'Emphasis', 'css': 'wym_tools_emphasis'},
                {'name': 'InsertOrderedList', 'title': 'Ordered_List', 'css': 'wym_tools_ordered_list'},
                {'name': 'InsertUnorderedList', 'title': 'Unordered_List', 'css': 'wym_tools_unordered_list'},
                {'name': 'Indent', 'title': 'Indent', 'css': 'wym_tools_indent'},
                {'name': 'Outdent', 'title': 'Outdent', 'css': 'wym_tools_outdent'},
                {'name': 'Undo', 'title': 'Undo', 'css': 'wym_tools_undo'},
                {'name': 'Redo', 'title': 'Redo', 'css': 'wym_tools_redo'},
                {'name': 'CreateLink', 'title': 'Link', 'css': 'wym_tools_link'},
                {'name': 'Unlink', 'title': 'Unlink', 'css': 'wym_tools_unlink'},
                {'name': 'InsertImage', 'title': 'Image', 'css': 'wym_tools_image'},
            ],
            containersHtml : '',
            containersItemHtml : '',
            containersItems : [],
            classesHtml: '',
            classesItemHtml:'',
            classesItems : [],
            preInit : function(wym) {
                jQuery('#'+form_id).bind('jFormsUpdateFields', function(event){
                    wym.update();
                });
            },
            //preBind : function(wym) {},
            //postInit : function(wym) {},
        });
    });

}