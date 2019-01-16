
function jelix_wymeditor_default(textarea_id, form_id, skin, config) {
    if (!skin)
        skin = 'default';

   jQuery(function() {
        jQuery("#"+textarea_id).wymeditor({
            basePath: config.jelixWWWPath+'wymeditor/',
            jQueryPath: config.jqueryFile != '' ? config.jqueryFile : '',
            lang: config.locale.substr(0,2).toLowerCase(),
            preInit : function(wym) {
                jQuery('#'+form_id).bind('jFormsUpdateFields', function(event){
                    wym.update();
                });
            }
        });
  });

}