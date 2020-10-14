<?php

use PHPUnit\Framework\TestCase;

require_once 'QgisFormControlForTests.php';
require_once __DIR__.'/../Project/TestContext.php';
require_once __DIR__.'/../Project/ProjectForTests.php';
require_once __DIR__.'/../../../../lib/jelix/forms/jFormsBase.class.php';

/**
 * @internal
 * @coversNothing
 */
class QgisFormControlTest extends TestCase
{
    public function testSetControlMainProperties()
    {
        $control = new QgisFormControlForTests();
        $ctrl = new \jFormsControlInput('test');
        $ctrl->datatype = new \jDatatypeDecimal();
        $control->fieldDataType = 'Immutable';
        $control->fieldEditType = 'Immutable';
        $control->edittype = (object) array('editable' => 2);
        $control->isReadOnly = false;
        $control->required = true;
        $control->ctrl = $ctrl;
        $control->setControlMainPropertiesForTests();
        $this->assertTrue($control->isReadOnly);
        $this->assertFalse($control->required);
        $control->ctrl->datatype = new \jDatatypeString('test');
        $control->fieldDataType = 'date';
        $control->fieldEditType = 'TextEdit';
        $control->isReadOnly = false;
        $control->edittype = (object) array('editable' => 0);
        $control->setControlMainPropertiesForTests();
        $this->assertTrue($control->isReadOnly);
        $this->assertFalse($control->required);
        $this->assertInstanceOf(jDatatypeDate::class, $control->ctrl->datatype);
        $control->ctrl->datatype = new \jDatatypeString('test');
        $control->fieldDataType = 'float';
        $control->isReadOnly = false;
        $control->required = true;
        $control->edittype = (object) array('editable' => 5);
        $control->setControlMainPropertiesForTests();
        $this->assertFalse($control->isReadOnly);
        $this->assertTrue($control->required);
        $this->assertTrue($control->ctrl->required);
        $this->assertInstanceOf(jDatatypeDecimal::class, $control->ctrl->datatype);
    }
}
