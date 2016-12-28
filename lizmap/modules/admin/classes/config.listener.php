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

      // Child for lizmap theme
      $bloc->childItems[] = new masterAdminMenuItem(
        'lizmap_theme',
        jLocale::get("admin~admin.menu.lizmap.theme.label"),
        jUrl::get('admin~theme:index'), 115, 'lizmap'
      );

      // Child for lizmap logs
      $bloc->childItems[] = new masterAdminMenuItem(
        'lizmap_logs',
        jLocale::get("admin~admin.menu.lizmap.logs.label"),
        jUrl::get('admin~logs:index'), 120, 'lizmap'
      );

      // Add the bloc
      $event->add($bloc);
    }
  }
}
