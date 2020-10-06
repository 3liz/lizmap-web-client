<?php

use PHPUnit\Framework\TestCase;
use Lizmap\Form;
use Lizmap\Project;

require_once('QgisLayerForTests.php');
require_once('QgisFormForTests.php');
require_once(__DIR__.'/../Project/TestContext.php');
require_once(__DIR__.'/../Project/ProjectForTests.php');
include(__DIR__.'/../../../../lib/jelix/forms/jFormsBase.class.php');

class dummyForm
{
    public $check;

    public $data;

    public $controls;

    public function check()
    {
        return $this->check;
    }

    public function addControl()
    {}

    public function setReadOnly()
    {}

    public function getSelector()
    {}

    public function getContainer()
    {
        return (object)array('privateData' => array());
    }

    public function getData()
    {
        return $this->data;
    }

    public function setErrorOn()
    {}

    public function getControl($ref)
    {
        return $this->controls[$ref];
    }
}

class QgisFormTest extends TestCase
{
    protected $appContext;

    public function setUpEnv($file, $fields)
    {
        $ids = explode('.', $file);
        $appContext = new testContext();
        $appContext->setResult(array('path' => __DIR__.'/forms/'));
        $this->appContext = $appContext;
        $layer = new QgisLayerForTests();
        $layer->fields = $fields;
        $layer->setId($ids[1]);
        $proj = new ProjectForTests();
        $proj->setRepo(new \Lizmap\Project\Repository('key', array(), null, null, null));
        $proj->setKey($ids[0]);
        $layer->setProject($proj);
        return $layer;
    }

    public function getConstructData()
    {
        $fields = (object)array(
            'pkuid' => (object)array(
                'autoIncrement' => true,
                'type' => 'float'
            ),
            'customdate' => (object)array(
                'autoIncrement' => true,
                'type' => 'float'
            ),
        );
        $fields2 = (object)array(
            'pkuid' => (object)array(
                'autoIncrement' => true,
                'type' => 'float'
            ),
            'label' => (object)array(
                'autoIncrement' => true,
                'type' => 'float'
            ),
            'description' => (object)array(
                'autoIncrement' => true,
                'type' => 'float'
            ),
            'difficulty' => (object)array(
                'autoIncrement' => true,
                'type' => 'float'
            ),
        );
        return array(
            array('test.date.form.json', $fields),
            array('montpellier.line.form.json', $fields2),
            array('not.existing.form.php', null)
        );
    }

    /**
     * @dataProvider getConstructData
     */
    public function testContruct($file, $fields)
    {
        $layer = $this->setUpEnv($file, $fields);
        // Used to autoload jFormsControl* 
        // $formBase = jForms::create('view~edition');
        if (!$fields) {
            $this->expectException('Exception');
        }
        $form = new QgisFormForConstructTests($layer, new dummyForm(), null, false, $this->appContext, true);
        if ($fields) {
            $controls = $form->getQgisControls();
            $this->assertEquals(count((array)$fields), count($controls));
            foreach ($fields as $key => $props) {
                $this->assertTrue(array_key_exists($key, $controls));
            }
        }
    }

    public function getDefaultValuesData()
    {
        return array(
            array('1231', null, '1231'),
            array('', null, null),
            array(null, null, null),
            array('\'test!!tests\'', null, 'test!!tests'),
            array('"name" IS NOT NULL AND "name" <> \'\'', (object)array('testField' => 'default'), 'default')
        );
    }

    /**
     * @dataProvider getDefaultValuesData
     */
    public function testGetDefaultValues($defaultValue, $expressionResult, $expectedResult)
    {
        $formMock = $this->getMockBuilder(QgisFormForTests::class)->setMethods(['evaluateExpression'])->getMock();
        $formMock->method('evaluateExpression')->willReturn($expressionResult);
        $layer = new QgisLayerForTests();
        $layer->setDefaultValues(array('testField' => $defaultValue));
        $formMock->setLayer($layer);
        $this->assertEquals($expectedResult, $formMock->getDefaultValueForTests('testField'));
    }

    public function testGetAttributeEditorForm()
    {
        $proj = new Project\QgisProject(__DIR__.'/forms/attributeEditorTest.qgs', new lizmapServices(array(), array(), false, '', null), new testContext());
        $layer = $proj->getLayer('LayerId', $proj);
        $layerFalse = $proj->getLayer('LayerFalse', $proj);
        $form = new QgisFormForTests();
        $form->setForm(new dummyForm());
        $form->setLayer($layer);
        $form->setFormName(null);
        $attributeForm = $form->getAttributesEditorForm();
        $this->assertNotNull($attributeForm);
        $this->assertInstanceOf(\qgisAttributeEditorElement::class, $attributeForm);
        $form->setFormName(null);
        $form->setLayer($layerFalse);
        $attributeForm = $form->getAttributesEditorForm();
        $this->assertNull($attributeForm);
    }

    public function getCheckData()
    {
        $dbFieldsInfo = (object)array(
            'dataFields' => (object)array(
                'pkuid' => null,
                'field' => null,
                'geometry' => null,
            ),
            'geometryColumn' => 'geometry'
        );
        $evaluateTrue = array(
            'pkuid' => 1,
            'field' => 1,
            'geometry' => 1,
        );
        $evaluateFalse = array(
            'pkuid' => false,
            'field' => 1,
            'geometry' => 1,
        );
        $constraintsTrue = array(
            'exp' => 'test',
            'exp_desc' => null,
            'exp_value' => 'test'
        );
        $constraintsFalse = array();
        return array(
            array($dbFieldsInfo, true, 'not empty', $evaluateTrue, $constraintsTrue, true),
            array($dbFieldsInfo, false, 'not empty', $evaluateTrue, $constraintsTrue, false),
            array($dbFieldsInfo, true, '', $evaluateTrue, $constraintsTrue, false),
            array($dbFieldsInfo, false, '', $evaluateTrue, $constraintsTrue, false),
            array($dbFieldsInfo, true, '0', $evaluateTrue, $constraintsTrue, true),
            array($dbFieldsInfo, true, 'not empty', $evaluateTrue, $constraintsFalse, true),
            array($dbFieldsInfo, false, 'not empty', $evaluateTrue, $constraintsFalse, false),
            array($dbFieldsInfo, true, '', $evaluateTrue, $constraintsFalse, false),
            array($dbFieldsInfo, false, '', $evaluateTrue, $constraintsFalse, false),
            array($dbFieldsInfo, true, '0', $evaluateTrue, $constraintsFalse, true),
            array($dbFieldsInfo, true, 'not empty', $evaluateFalse, $constraintsTrue, false),
            array($dbFieldsInfo, false, 'not empty', $evaluateFalse, $constraintsTrue, false),
            array($dbFieldsInfo, true, '', $evaluateFalse, $constraintsTrue, false),
            array($dbFieldsInfo, false, '', $evaluateFalse, $constraintsTrue, false),
            array($dbFieldsInfo, true, '0', $evaluateFalse, $constraintsTrue, false),
        );
    }

    /**
     * @dataProvider getCheckData
     */
    public function testCheck($dbFieldsInfo, $check, $data, $evaluateExpression, $constraints, $expectedResult)
    {
        $mockFuncs = array('getAttributesEditorForm', 'getFieldValue', 'getConstraints', 'evaluateExpression');
        $formMock = $this->getMockBuilder(QgisFormForTests::class)->setMethods($mockFuncs)->getMock();
        foreach ($mockFuncs as $method) {
            if ($method === 'evaluateExpression') {
                $formMock->method($method)->willReturn($evaluateExpression);
            } else if ($method === 'getConstraints') {
                $formMock->method($method)->willReturn($constraints);
            } else {
                $formMock->method($method)->willReturn(null);
            }
        }
        $formMock->dbFieldsInfo = $dbFieldsInfo;
        $formMock->appContext = new testContext();
        $jForm = new dummyForm();
        $jForm->check = $check;
        $jForm->data = $data;
        $layer = new QgisLayerForTests();
        $layer->eCapabilities = (object)array('capabilities' => (object)array('modifyGeometry' => 'True'));
        $layer->dbFieldValues = array();
        $formMock->setForm($jForm);
        $formMock->setLayer($layer);
        $this->assertEquals($expectedResult, $formMock->check());
    }

    public function testSaveToDbInsert()
    {
        $dbFieldsInfo = (object)array(
            'dataFields' => (object)array(
                'pkuid' => null,
                'field' => null,
                'geometry' => null,
            ),
            'geometryColumn' => 'geometry'
        );
        $controls = array(
            'pkuid' => new \jFormsControlInput('pkuid'),
            'field' => new \jFormsControlInput('field'),
            'geometry' => new \jFormsControlInput('geometry')
        );
        $values = array(
            'pkuid' => true,
            'field' => true,
            'geometry' => true,
        );
        $formMock = $this->getMockBuilder(QgisFormForTests::class)->setMethods(['getFieldList', 'getParsedValue', 'ProcessUploadedFile', 'filterDataByLogin'])->getMock();
        $jForm = new dummyForm();
        $jForm->controls = $controls;
        $layerMock = $this->getMockBuilder(QgisLayerForTests::class)->setMethods(['getDatasourceParameters', 'updateFeature', 'insertFeature'])->getMock();
        $layerMock->method('getDatasourceParameters')->willReturn((object)array('tablename' => null, 'schema' => null));
        $layerMock->expects($this->once())->method('insertFeature')->with($this->equalTo($values));
        $formMock->dbFieldsInfo = $dbFieldsInfo;
        $formMock->setLayer($layerMock);
        $formMock->setForm($jForm);
        $formMock->method('getFieldList')->willReturn(array_keys($controls));
        $formMock->appContext = new TestContext();
        $formMock->method('getParsedValue')->willReturn(true);
        $formMock->saveToDb();
    }

    public function testSaveToDbUpdate()
    {
        $dbFieldsInfo = (object)array(
            'dataFields' => (object)array(
                'pkuid' => null,
                'field' => null,
                'geometry' => null,
            ),
            'geometryColumn' => 'geometry'
        );
        $controls = array(
            'pkuid' => new \jFormsControlInput('pkuid'),
            'field' => new \jFormsControlInput('field'),
            'geometry' => new \jFormsControlUpload('geometry')
        );
        $values = array(
            'pkuid' => true,
            'field' => true,
            'geometry' => true,
        );
        $formMock = $this->getMockBuilder(QgisFormForTests::class)->setMethods(['getFieldList', 'getParsedValue', 'processUploadedFile', 'filterDataByLogin'])->getMock();
        $jForm = new dummyForm();
        $jForm->controls = $controls;
        $layerMock = $this->getMockBuilder(QgisLayerForTests::class)->setMethods(['getDatasourceParameters', 'getDatasourceConnection', 'updateFeature', 'insertFeature'])->getMock();
        $layerMock->name = 'name';
        $layerMock->method('getDatasourceParameters')->willReturn((object)array('tablename' => null, 'schema' => null));
        $layerMock->expects($this->once())->method('updateFeature')->with($this->equalTo('feature'), $this->equalTo($values), $this->anything());
        $formMock->dbFieldsInfo = $dbFieldsInfo;
        $formMock->featureId = 'not null';
        $formMock->setLayer($layerMock);
        $formMock->setForm($jForm);
        $formMock->method('getFieldList')->willReturn(array_keys($controls));
        $formMock->method('getParsedValue')->willReturn(true);
        $formMock->method('processUploadedFile')->willReturn(true);
        $formMock->expects($this->once())->method('processUploadedFile');
        $formMock->expects($this->once())->method('filterDataByLogin')->with($this->equalTo('name'));
        $formMock->appContext = new TestContext();
        $formMock->saveToDb('feature');
    }
}