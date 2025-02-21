<?php

/**
 * @author    your name
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    All rights reserved
 */
class defaultCtrl extends jController
{
    public function index()
    {
        return $this->getResponse('html');
    }
}
