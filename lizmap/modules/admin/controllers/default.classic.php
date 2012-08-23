<?php
/**
* @package   lizmap
* @subpackage admin
* @author    3liz
* @copyright 2012 3liz
* @link      http://www.3liz.com
* @license    Mozilla Public Licence - MPL
*/

class defaultCtrl extends jController {
    /**
    *
    */
    function index() {
        $rep = $this->getResponse('htmladmin');

        return $rep;
    }
}

