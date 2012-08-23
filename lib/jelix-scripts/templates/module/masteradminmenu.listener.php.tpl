<?php
/**
* @package   %%appname%%
* @subpackage %%module%%
* @author    %%default_creator_name%%
* @copyright %%default_copyright%%
* @link      %%default_website%%
* @license   %%default_license_url%% %%default_license%%
*/

class %%name%%menuListener extends jEventListener {

    /**
    *
    */
    function onmasteradminGetMenuContent ($event) {
        %%checkacl2%%
            $event->add(new masterAdminMenuItem('%%module%%list', '%%name%%', jUrl::get('%%module%%~%%name%%:index'), 1, 'crud'));
    }
}
