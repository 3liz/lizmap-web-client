<?php
$dirname = dirname(__FILE__).'/';

function __($str)
{
    return $str;
}

$GLOBALS['_jelix_cb_autoload'] = array(
    'files'	=> $dirname.'common/lib.files.php',
    'path'	=> $dirname.'common/lib.files.php',
);


function jelix_cb_autoload($name) {
    global $_jelix_cb_autoload;
    if (isset($_jelix_cb_autoload[$name])) {
        require_once($_jelix_cb_autoload[$name]);
    }
}

spl_autoload_register("jelix_cb_autoload");
