<?php
class lizmapConfigListener extends jEventListener{
 
  function onAdminGetMenuContent ($event) {
    // Create the "lizmap" parent menu item
    $bloc = new adminMenuItem('lizmap', 'LizMap', '', 100);
    // Child for the configuration of lizmap repositories
    $bloc->childItems[] = new adminMenuItem(
      'lizmap_configuration', 
      jLocale::get("lizmap~admin.menu.configuration.main.label"), 
      jUrl::get('lizmap~admin:index'), 110, 'lizmap'
    );
    // Add the bloc
    $event->add($bloc);
  }
}
