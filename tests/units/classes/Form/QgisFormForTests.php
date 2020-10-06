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
}

class QgisFormForConstructTests extends Form\QgisForm
{
    public function getAttributesEditorForm()
    {
    }
}