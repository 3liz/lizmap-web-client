<?php

use Lizmap\Form;

/**
 * QgisForm built by its real constructor, without the HTTP calls to QGIS Server.
 */
class QgisForm2ForTests extends Form\QgisForm
{
    /** @var array[] recorded calls to evaluateExpression */
    public $evaluateExpressionCalls = array();

    /** @var mixed return value of the evaluateExpression stub */
    public $evaluateExpressionReturn;

    public function getAttributesEditorForm() {}

    public function evaluateExpression($expression, $form_feature = null)
    {
        $this->evaluateExpressionCalls[] = array(
            'expressions' => $expression,
            'form_feature' => $form_feature,
        );

        return $this->evaluateExpressionReturn;
    }

    protected function fillFormControl($formControl, $fieldName, $form)
    {
        // Upload controls need the Lizmap services
        if ($formControl->isUploadControl()) {
            return;
        }
        parent::fillFormControl($formControl, $fieldName, $form);
    }

    public function getDynamicDefaultExpressionsForTests()
    {
        return $this->dynamicDefaultExpressions;
    }

    public function getDefaultApplyOnUpdateMapForTests()
    {
        return $this->defaultApplyOnUpdateMap;
    }

    public function collectDynamicExpressionsForTests()
    {
        return $this->collectDynamicExpressions();
    }

    public function computeDefaultFilenameForTests($uploadCtrl, $ref, $formData)
    {
        return $this->computeDefaultFilename($uploadCtrl, $ref, $formData);
    }
}
