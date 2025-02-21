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
    /** @var jDbConnection */
    protected $cnx;

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

    /**
     * @param jDbConnection $cnx
     */
    public function __construct($cnx)
    {
        $this->cnx = $cnx;
    }

    public function getQuotedValue($ref, $value)
    {
        $ut = $this->dataFields[$ref]->unifiedType;
        if ($ut != 'integer'
            && $ut != 'numeric'
            && $ut != 'float'
            && $ut != 'decimal') {
            return $this->cnx->quote($value);
        }

        return $value;
    }

    public function getSQLRefEquality($ref, $value)
    {
        return $this->cnx->encloseName($ref).' = '.$this->getQuotedValue($ref, $value);
    }
}
