<?php
/**
 * @author    3liz
 * @copyright 2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class qgisLayerDbFieldsInfo
{
    /**
     * @var jDbFieldProperties[]
     */
    public $dataFields = array();

    /**
     * @var string[] list of primary key names
     */
    public $primaryKeys = array();

    /**
     * @var string name of the geometry column
     */
    public $geometryColumn = '';

    /**
     * @var string name of the geometry type
     */
    public $geometryType = '';
}
