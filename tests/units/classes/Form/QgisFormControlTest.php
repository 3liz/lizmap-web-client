<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Form\QgisFormControl;

require_once __DIR__.'/../../../../lizmap/vendor/jelix/jelix/lib/jelix/forms/jFormsBase.class.php';

/**
 * @internal
 * @coversNothing
 */
class QgisFormControlTest extends TestCase
{
    public function testSetControlMainProperties(): void
    {
        $ctrl = new \jFormsControlInput('test');
        $ctrl->datatype = new \jDatatypeDecimal();


        $control = new QgisFormControlForTests();
        $properties = new \Lizmap\Form\QgisFormControlProperties(
            'test',
            'Immutable',
            'intput',
            array(
                'Editable' => true
            )
        );
        $control->fieldDataType = 'Immutable';
        $control->isReadOnly = false;
        $control->required = true;
        $control->ctrl = $ctrl;
        $control->setControlMainPropertiesForTests($properties);
        $this->assertTrue($control->isReadOnly);
        $this->assertFalse($control->required);

        $control->ctrl->datatype = new \jDatatypeString();
        $properties = new \Lizmap\Form\QgisFormControlProperties(
            'test',
            'TextEdit',
            'intput',
            array(
                'Editable' => false
            )
        );
        $control->fieldDataType = 'date';
        $control->isReadOnly = false;
        $control->setControlMainPropertiesForTests($properties);
        $this->assertTrue($control->isReadOnly);
        $this->assertFalse($control->required);
        $this->assertInstanceOf(jDatatypeDate::class, $control->ctrl->datatype);

        $properties = new \Lizmap\Form\QgisFormControlProperties(
            'test',
            'TextEdit',
            'intput',
            array(
                'Editable' => true
            )
        );
        $control->ctrl->datatype = new \jDatatypeString();
        $control->fieldDataType = 'decimal';
        $control->isReadOnly = false;
        $control->required = true;
        $control->setControlMainPropertiesForTests($properties);
        $this->assertFalse($control->isReadOnly);
        $this->assertTrue($control->required);
        $this->assertTrue($control->ctrl->required);
        $this->assertInstanceOf(jDatatypeDecimal::class, $control->ctrl->datatype);
    }

    public function testConstructGeometry(): void
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

    public function testConstructPrimaryKey(): void
    {
        $appContext = new ContextForTests();
        # DB properties - Text
        $prop = (object) array(
            'type' => 'int',
            'autoIncrement' => True,
            'notNull' => True,
        );
        # QGIS properties
        $properties = new \Lizmap\Form\QgisFormControlProperties(
            'id',
            'TextEdit',
            'input',
            array(
                'IsMultiline' => false,
                'UseHtml' => false,
                'Editable' => true
            )
        );
        # QGIS Constraints
        # constraints is the number of contraints, 0 for no constraints
        # notNull defined if the not null contraint is activated
        # unique defined if the unique contraint is activated
        # exp defined if the expression contraint is activated
        $constraints = array(
            'constraints' => 0,
            'notNull' => false,
            'unique' => false,
            'exp' => false,
        );

        $control = new QgisFormControl('id', $properties, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->ref, 'id');
        $this->assertEquals($control->fieldName, 'id');
        $this->assertEquals($control->fieldDataType, 'integer');
        $this->assertEquals($control->fieldEditType, 'TextEdit');
        $this->assertEquals($control->ctrl->getWidgetType(), 'input');
        $this->assertFalse($control->isReadOnly);
        $this->assertFalse($control->required);

        # QGIS properties - not editable
        $properties = new \Lizmap\Form\QgisFormControlProperties(
            'id',
            'TextEdit',
            'input',
            array(
                'IsMultiline' => false,
                'UseHtml' => false,
                'Editable' => false
            )
        );
        $control = new QgisFormControl('id', $properties, $prop, null, $constraints, $appContext);
        $this->assertTrue($control->isReadOnly);
        $this->assertFalse($control->required);
    }

    public function testConstructInput(): void
    {
        $appContext = new ContextForTests();
        # DB properties - Text
        $prop = (object) array(
            'type' => 'text',
            'autoIncrement' => False,
            'notNull' => False,
        );
        # QGIS properties
        $properties = new \Lizmap\Form\QgisFormControlProperties(
            'label',
            'TextEdit',
            'input',
            array(
                'IsMultiline' => false,
                'UseHtml' => false,
                'Editable' => true
            )
        );
        # QGIS Constraints
        # constraints is the number of contraints, 0 for no constraints
        # notNull defined if the not null contraint is activated
        # unique defined if the unique contraint is activated
        # exp defined if the expression contraint is activated
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
        $constraints['constraints'] = 0;
        $constraints['notNull'] = False;
        $control = new QgisFormControl('label', $properties, $prop, null, $constraints, $appContext);
        $this->assertTrue($control->required);

        # DB properties - Text
        $prop->notNull = False;
        # QGIS constraints - not null
        $constraints['constraints'] = 1;
        $constraints['notNull'] = True;
        $control = new QgisFormControl('label', $properties, $prop, null, $constraints, $appContext);
        $this->assertTrue($control->required);

        # DB properties - Text
        $prop->notNull = False;
        # QGIS properties
        $properties = new \Lizmap\Form\QgisFormControlProperties(
            'label',
            'TextEdit',
            'input',
            array(
                'IsMultiline' => false,
                'UseHtml' => false,
                'Editable' => false
            )
        );
        # QGIS constraints
        $constraints['constraints'] = 0;
        $constraints['notNull'] = False;
        $control = new QgisFormControl('label', $properties, $prop, null, $constraints, $appContext);
        $this->assertTrue($control->isReadOnly);
        $this->assertFalse($control->required);
    }

    public function testConstructCheckbox(): void
    {
        $appContext = new ContextForTests();
        # DB properties - Bool
        $prop = (object) array(
            'type' => 'bool',
            'autoIncrement' => False,
            'notNull' => True,
        );
        # QGIS properties
        $properties = new \Lizmap\Form\QgisFormControlProperties(
            'checked',
            'CheckBox',
            'checkbox',
            array(
                'CheckedState' => 't',
                'UncheckedState' => 'f',
            )
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
        $properties = new \Lizmap\Form\QgisFormControlProperties(
            'checked',
            'CheckBox',
            'checkbox',
            array(
                'CheckedState' => '1',
                'UncheckedState' => '0',
            )
        );

        $control = new QgisFormControl('checked', $properties, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'integer');
        $this->assertEquals($control->ctrl->valueOnCheck, '1');
        $this->assertEquals($control->ctrl->valueOnUncheck, '0');

        # DB properties - text
        $prop->type = 'text';
        # QGIS properties
        $properties = new \Lizmap\Form\QgisFormControlProperties(
            'checked',
            'CheckBox',
            'checkbox',
            array(
                'CheckedState' => 'y',
                'UncheckedState' => 'n',
            )
        );

        $control = new QgisFormControl('checked', $properties, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'text');
        $this->assertEquals($control->ctrl->valueOnCheck, 'y');
        $this->assertEquals($control->ctrl->valueOnUncheck, 'n');

        # Test Rework ValueMap to CheckBox for nor null boolean field
        $prop->type = 'boolean';
        $prop->notNull = True;
        # QGIS properties
        $properties = new \Lizmap\Form\QgisFormControlProperties(
            'checked',
            'ValueMap',
            'menulist',
            array(
                'valueMap' => array(
                     'true' => 'Yes',
                     'false' => 'No',
                     '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}' => '<NULL>',
                ),
                'Editable' => 1
            )
        );

        $control = new QgisFormControl('checked', $properties, $prop, null, $constraints, $appContext);
        $this->assertEquals($control->fieldDataType, 'boolean');
        $this->assertEquals($control->fieldEditType, 'CheckBox');
        $this->assertEquals($control->ctrl->getWidgetType(), 'checkbox');
        $this->assertEquals($control->ctrl->valueOnCheck, 't');
        $this->assertEquals($control->ctrl->valueLabelOnCheck, 'Yes');
        $this->assertEquals($control->ctrl->valueOnUncheck, 'f');
        $this->assertEquals($control->ctrl->valueLabelOnUncheck, 'No');
    }
}
