<?php

use Lizmap\Form;

class QgisFormForTests extends Form\QgisForm
{
    public $dbFieldsInfo;

    public $appContext;

    public $featureId;

    public function __construct() {}

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

    /**
     * Expose protected evaluateDefaultExpressions for unit tests.
     *
     * @param array<string, string> $expressions
     *
     * @return array<string, mixed>
     */
    public function evaluateDefaultExpressionsForTests(array $expressions)
    {
        return $this->evaluateDefaultExpressions($expressions);
    }

    /**
     * Expose protected collectDynamicExpressions for unit tests.
     *
     * @return array<string, string>
     */
    public function collectDynamicExpressionsForTests()
    {
        return $this->collectDynamicExpressions();
    }

    /**
     * Recorded calls to evaluateExpression: each entry is ['expressions' => ..., 'form_feature' => ...].
     *
     * @var array[]
     */
    public $evaluateExpressionCalls = array();

    /**
     * Return value for the evaluateExpression stub.
     *
     * @var mixed
     */
    public $evaluateExpressionReturn = null;

    /**
     * Override evaluateExpression to capture arguments and return a stubbed result.
     *
     * @param array      $expression
     * @param null|array $form_feature
     *
     * @return mixed
     */
    public function evaluateExpression($expression, $form_feature = null)
    {
        $this->evaluateExpressionCalls[] = array(
            'expressions' => $expression,
            'form_feature' => $form_feature,
        );

        return $this->evaluateExpressionReturn;
    }
}

class jAcl2
{
    public static function check($right, $resource = null)
    {
        return true;
    }
}
