<?php

use Lizmap\Form\QgisFormControl;
use Lizmap\Form\QgisFormControlProperties;

class QgisFormControlForTests extends QgisFormControl
{
    public $edittype;

    public function __construct()
    {
        self::buildEditTypeMap();
    }


    /**
     * @param QgisFormControlProperties $properties
     */
    public function setControlMainPropertiesForTests($properties)
    {
        $this->setProperties($properties);
        $this->setControlMainProperties();
    }
}
