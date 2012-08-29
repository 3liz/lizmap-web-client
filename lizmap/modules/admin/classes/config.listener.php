<?php
class configListener extends jEventListener{
 
  function onmasteradminGetMenuContent ($event) {
    // Create the "lizmap" parent menu item
    $bloc = new masterAdminMenuItem('lizmap', 'LizMap', '', 100);
    // Child for the configuration of lizmap repositories
    $bloc->childItems[] = new masterAdminMenuItem(
      'lizmap_configuration', 
      jLocale::get("lizmap~admin.menu.configuration.main.label"), 
      jUrl::get('admin~config:index'), 110, 'lizmap'
    );
    // Add the bloc
    $event->add($bloc);
  }
}
