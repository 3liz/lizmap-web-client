<?php

use Lizmap\Form\QgisFormControl;

class QgisFormControlForTests extends QgisFormControl
{
    public $edittype;

    public function __construct()
    {
        self::buildEditTypeMap();
    }

    public function setControlMainPropertiesForTests()
    {
        $this->setControlMainProperties();
    }
}
