<?php
/**
* @package   %%appname%%
* @subpackage %%module%%
* @author    %%default_creator_name%%
* @copyright %%default_copyright%%
* @link      %%default_website%%
* @license   %%default_license_url%% %%default_license%%
*/


class admin%%module%%Listener extends jEventListener{

    /**
    *
    */
    function onmasteradminGetMenuContent ($event) {
        //if(jAcl2::check('%%module%%.my.right')) {
            $item = new masterAdminMenuItem('%%module%%',
                                            jLocale::get('%%module%%~interface.menu.item'),
                                            jUrl::get('%%module%%~default:index'),
                                            5, 'toplinks');
            $event->add($item);
        //}
    }
    
    function onmasterAdminGetDashboardWidget ($event) {
        //if(jAcl2::check('%%module%%.my.right')) {
            $box = new masterAdminDashboardWidget();
            $box->title = "%%module%%";
            $box->content = '<p>My widget</p>';
            $event->add($box);
        //}
   }

}
