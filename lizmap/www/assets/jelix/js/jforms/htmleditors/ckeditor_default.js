function jelix_ckeditor_ckdefault(textarea_id, form_id, skin, config){
    var conf = {
            toolbar:
            [
                ['Cut','Copy','Paste','PasteText','PasteFromWord'],
                ['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],
                ['Maximize', 'ShowBlocks'],
                '/',
                ['Bold','Italic','Underline','Strike','-','Subscript','Superscript'],
                ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
                ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
                ['Link','Unlink','Anchor'],
                ['Image','Table','HorizontalRule', 'SpecialChar'],
            ],
            scayt_autoStartup : false
    };
    if (skin !='default')
        conf['skin'] = skin;
    conf["language"] = config.locale.substr(0,2).toLowerCase();

    var editor=CKEDITOR.instances[textarea_id];
    if (editor){
        editor.destroy(true);
    }

    editor = CKEDITOR.replace(textarea_id, conf);
    jQuery('#'+form_id).bind('jFormsUpdateFields', function(event){
        editor.updateElement();
    });
}