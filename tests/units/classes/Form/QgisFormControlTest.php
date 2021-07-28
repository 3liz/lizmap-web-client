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

    public function testConstructInput()
    {
        $appContext = new ContextForTests();
        # DB properties - Text
        $prop = (object) array(
            'type' => 'text',
            'autoIncrement' => False,
            'notNull' => False,
        );
        # QGIS properties
        $properties = (object) array(
            'markup' => 'input',
            'fieldEditType' => 'TextEdit',
            'widgetv2configAttr' => (object) array(
                'IsMultiline' => '0',
                'UseHtml' => '0',
            ),
            'edittype' => (object) array(
                'editable' => 1,
            ),
        );
        # QGIS Constraints
        $constraints = array(
            'constraints' => 0,
            'notNull' => false,
            'unique' => false,
            'exp' => false,
        );

        $control = new QgisFormControl('label', $properties, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->ref, 'label');
        $this->assertEquals($control->fieldName, 'label');
        $this->assertEquals($control->fieldDataType, 'text');
        $this->assertEquals($control->fieldEditType, 'TextEdit');
        $this->assertEquals($control->ctrl->getWidgetType(), 'input');
        $this->assertFalse($control->isReadOnly);
        $this->assertFalse($control->required);

        # DB properties - Text - not null
        $prop->notNull = True;
        # QGIS constraints
        $constraints['notNull'] = False;
        $control = new QgisFormControl('label', $properties, $prop, null, $constraints, $appContext);
        $this->assertTrue($control->required);

        # DB properties - Text
        $prop->norNull = False;
        # QGIS constraints - not null
        $constraints['notNull'] = True;
        $control = new QgisFormControl('label', $properties, $prop, null, $constraints, $appContext);
        $this->assertTrue($control->required);

        # DB properties - Text
        $prop->norNull = False;
        # QGIS properties
        $properties->edittype->editable = 0;
        # QGIS constraints
        $constraints['notNull'] = False;
        $control = new QgisFormControl('label', $properties, $prop, null, $constraints, $appContext);
        $this->assertTrue($control->isReadOnly);
        $this->assertFalse($control->required);
    }

    public function testConstructCheckbox()
    {
        $appContext = new ContextForTests();
        # DB properties - Bool
        $prop = (object) array(
            'type' => 'bool',
            'autoIncrement' => False,
            'notNull' => True,
        );
        # QGIS properties
        $properties = (object) array(
            'markup' => 'checkbox',
            'fieldEditType' => 'CheckBox',
            'widgetv2configAttr' => (object) array(
                'CheckedState' => '',
                'UncheckedState' => '',
            ),
        );
        # QGIS Constraints
        $constraints = array(
            'constraints' => 0,
            'notNull' => false,
            'unique' => false,
            'exp' => false,
        );

        $control = new QgisFormControl('checked', $properties, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->ref, 'checked');
        $this->assertEquals($control->fieldName, 'checked');
        $this->assertEquals($control->fieldDataType, 'boolean');
        $this->assertEquals($control->fieldEditType, 'CheckBox');
        $this->assertEquals($control->ctrl->getWidgetType(), 'checkbox');
        $this->assertEquals($control->ctrl->valueOnCheck, 't');
        $this->assertEquals($control->ctrl->valueOnUncheck, 'f');
        $this->assertFalse($control->isReadOnly);
        $this->assertFalse($control->required);

        # DB properties - int
        $prop->type = 'int';
        # QGIS properties
        $properties->widgetv2configAttr->CheckedState = '1';
        $properties->widgetv2configAttr->UncheckedState = '0';

        $control = new QgisFormControl('checked', $properties, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'integer');
        $this->assertEquals($control->ctrl->valueOnCheck, '1');
        $this->assertEquals($control->ctrl->valueOnUncheck, '0');

        # DB properties - text
        $prop->type = 'text';
        # QGIS properties
        $properties->widgetv2configAttr->CheckedState = 'y';
        $properties->widgetv2configAttr->UncheckedState = 'n';

        $control = new QgisFormControl('checked', $properties, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'text');
        $this->assertEquals($control->ctrl->valueOnCheck, 'y');
        $this->assertEquals($control->ctrl->valueOnUncheck, 'n');

        # Test Rework ValueMap to CheckBox for nor null boolean field
        $prop->type = 'boolean';
        $prop->notNull = True;
        # QGIS properties
        $properties->markup = 'menulist';
        $properties->fieldEditType = 'ValueMap';
        $properties->widgetv2configAttr = (object) array(
            'map' => null,
        );
        $properties->widgetv2configAttr->map = array(
            (object) array('key'=>'Yes', 'value'=>'true'),
            (object) array('key'=>'No', 'value'=>'false'),
            (object) array('key'=>'<NULL>', 'value'=>'{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}'),
        );
        $properties->edittype = (object) array(
            'editable' => 1,
            'options' => (object) array('map' => null),
        );
        $properties->edittype->options->map = $properties->widgetv2configAttr->map;
        $control = new QgisFormControl('checked', $properties, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'boolean');
        $this->assertEquals($control->fieldEditType, 'CheckBox');
        $this->assertEquals($control->ctrl->getWidgetType(), 'checkbox');
        $this->assertEquals($control->ctrl->valueOnCheck, 'true');
        $this->assertEquals($control->ctrl->valueLabelOnCheck, 'Yes');
        $this->assertEquals($control->ctrl->valueOnUncheck, 'false');
        $this->assertEquals($control->ctrl->valueLabelOnUncheck, 'No');
    }
}
