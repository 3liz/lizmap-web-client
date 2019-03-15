<?php
/**
* @package   lizmap
* @subpackage filter
* @author    3liz
* @copyright 2019 3liz
* @link      http://3liz.com
* @license    Mozilla Public Licence 2
*/

class defaultCtrl extends jController {
    /**
    *
    */
    function index() {
        $rep = $this->getResponse('html');
        return $rep;
    }
}

