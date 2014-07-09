<?php

function __($str)
{
    return $str;
}

$GLOBALS['_jelix_cb_autoload'] = array(
    'files'	=> __DIR__.'/common/lib.files.php',
    'path'	=> __DIR__.'/common/lib.files.php',
);


function jelix_cb_autoload($name) {
    global $_jelix_cb_autoload;
    if (isset($_jelix_cb_autoload[$name])) {
        require_once($_jelix_cb_autoload[$name]);
    }
}

spl_autoload_register("jelix_cb_autoload");
