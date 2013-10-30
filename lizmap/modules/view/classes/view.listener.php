<?php
class viewListener extends jEventListener{

   function onmasteradminGetInfoBoxContent ($event) {

        $home = new masterAdminMenuItem('home', jLocale::get("view~default.repository.list.title"), jUrl::get('view~default:index'));
        $home->icon = True;
        $event->add($home);
  
   }
}
?>
