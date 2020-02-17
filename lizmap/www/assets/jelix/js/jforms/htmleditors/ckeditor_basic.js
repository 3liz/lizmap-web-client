function jelix_ckeditor_ckbasic(textarea_id, form_id, skin, config){
    var conf = {toolbar:'Basic',
                removePlugins : 'elementspath',
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