<?php
class viewListener extends jEventListener{

   function onmasteradminGetInfoBoxContent ($event) {

        $event->add(new masterAdminMenuItem('view', jLocale::get("view~default.repository.list.title"), jUrl::get('view~default:index')));
  
   }
}
?>
