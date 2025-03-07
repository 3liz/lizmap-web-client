<?php
/**
* @package   lizmap
* @subpackage admin_api
* @author    3liz.com
* @copyright 2011-2025 3Liz
* @link      https://3liz.com
* @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
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

