<?php

use Lizmap\Form;

class QgisFormForTests extends Form\QgisForm
{
    public $dbFieldsInfo;

    public $appContext;

    public $featureId;

    public function __construct()
    {
    }

    public function setLayer($layer)
    {
        $this->layer = $layer;
    }

    public function setFormName($name)
    {
        $this->form_name = $name;
    }

    public function setForm($form)
    {
        $this->form = $form;
    }

    public function getDefaultValueForTests($fieldName)
    {
        return $this->getDefaultValue($fieldName);
    }

    public function getFieldListForTests($geometryColumn, $insert)
    {
        return $this->getFieldList($geometryColumn, $insert, array());
    }

    public function fillControlFromUniqueValuesForTests($fieldName, $control)
    {
        $this->fillControlFromUniqueValues($fieldName, $control);
    }
}



class jAcl2
{
    public static function check()
    {
        return true;
    }
}
