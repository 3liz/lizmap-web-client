<?php

/**
 * @author    3liz
 * @copyright 2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public Licence 2
 */
class defaultCtrl extends jController
{
    public function index()
    {
        return $this->getResponse('html');
    }
}
