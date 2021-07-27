<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Form\QgisFormControl;

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

    public function testConstructGeometry()
    {
        $appContext = new ContextForTests();
        # DB properties - Point
        $prop = (object) array(
            'type' => 'Point',
            'autoIncrement' => False,
            'notNull' => True,
        );
        # QGIS Constraints
        $constraints = array(
            'constraints' => 0,
            'notNull' => false,
            'unique' => false,
            'exp' => false,
        );

        $control = new QgisFormControl('geom', null, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->ref, 'geom');
        $this->assertEquals($control->fieldName, 'geom');
        $this->assertEquals($control->fieldDataType, 'geometry');
        $this->assertEquals($control->fieldEditType, '');
        $this->assertEquals($control->ctrl->getWidgetType(), 'hidden');
        $this->assertFalse($control->isReadOnly);
        $this->assertTrue($control->required);

        # DB properties - MultiPoint
        $prop->type = 'MultiPoint';
        $control = new QgisFormControl('geom', null, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'geometry');

        # DB properties - LINE
        $prop->type = 'LINE';
        $control = new QgisFormControl('geom', null, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'geometry');

        # DB properties - LineString
        $prop->type = 'LineString';
        $control = new QgisFormControl('geom', null, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'geometry');

        # DB properties - MultiLineString
        $prop->type = 'MultiLineString';
        $control = new QgisFormControl('geom', null, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'geometry');

        # DB properties - Polygon
        $prop->type = 'Polygon';
        $control = new QgisFormControl('geom', null, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'geometry');

        # DB properties - MultiPolygon
        $prop->type = 'MultiPolygon';
        $control = new QgisFormControl('geom', null, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'geometry');

        # DB properties - Geometry
        $prop->type = 'Geometry';
        $control = new QgisFormControl('geom', null, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'geometry');

        # DB properties - GeometryCollection
        $prop->type = 'GeometryCollection';
        $control = new QgisFormControl('geom', null, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'geometry');
    }
}
