<?php
class configListener extends jEventListener{
 
  function onmasteradminGetMenuContent ($event) {
  
    if( jAcl2::check("lizmap.admin.access")){
      // Create the "lizmap" parent menu item
      $bloc = new masterAdminMenuItem('lizmap', 'LizMap', '', 100);
      // Child for the configuration of lizmap repositories
      $bloc->childItems[] = new masterAdminMenuItem(
        'lizmap_configuration', 
        jLocale::get("admin~admin.menu.configuration.main.label"), 
        jUrl::get('admin~config:index'), 110, 'lizmap'
      );
      // Add the bloc
      $event->add($bloc);
    }
  }
}
