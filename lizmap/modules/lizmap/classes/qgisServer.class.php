<?php

/**
 * Get information about QGIS Server.
 *
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class qgisServer
{
    // lizmapServices instance
    protected $services;

    // List of activated server plugins
    public $plugins = array();

    // constructor
    public function __construct()
    {
        $this->services = lizmap::getServices();
    }
}
