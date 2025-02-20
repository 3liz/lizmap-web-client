<?php

use Lizmap\Form\QgisFormControlsInterface;

/**
 * @author    3liz
 * @copyright 2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class qgisAttributeEditorElement
{
    protected $ctrlRef;

    protected $parentId;

    protected $htmlId = '';
    protected $label = '';

    protected $_isContainer = false;
    protected $_isGroupBox = false;
    protected $_isTabPanel = false;
    protected $_isRelationWidget = false;
    protected $_isTextWidget = false;

    protected $_isVisibilityExpressionEnabled = false;
    protected $_visibilityExpression = '';

    protected $attributes = array();

    protected $childrenBeforeTab = array();
    protected $tabChildren = array();
    protected $childrenAfterTab = array();
    protected $_textWidgetText = '';

    public function __construct(
        QgisFormControlsInterface $formControls,
        SimpleXMLElement $node,
        $parentId,
        $idx = 0,
        $depth = 0
    ) {
        $this->parentId = $parentId;

        foreach ($node->attributes() as $name => $attr) {
            $this->attributes[$name] = (string) $attr;
        }

        $formControlName = $formControls->getFormControlName($this->getName());
        if ($formControlName !== null) {
            $this->ctrlRef = $formControlName;
        }

        $name = $node->getName();

        // Label
        $getLabel = $this->getAttribute('label');
        if ($getLabel !== null) {
            $this->label = $getLabel;
        }

        $this->_isContainer = ($name != 'attributeEditorField' && $name != 'attributeEditorRelation' && $name != 'attributeEditorTextElement');
        if (!$this->_isContainer) {
            // Field
            $this->htmlId = $parentId.'-'.$idx;

            // Relation table
            if ($name == 'attributeEditorRelation') {
                // Get the relation detail (referencingLayer, referencedLayer, etc.)
                $this->htmlId = $parentId.'-relation'.$idx;
                $this->_isRelationWidget = true;
            }
            if ($name == 'attributeEditorTextElement') {
                $this->htmlId = $parentId.'-text'.$idx;
                $this->_isTextWidget = true;
                $this->ctrlRef = $this->getName();
                $stringNode = (string) $node;
                $this->_textWidgetText = $stringNode;
            }
        } else {
            // Manage containers: form, group or tab
            if ($name == 'attributeEditorForm') {
                $this->htmlId = $parentId;
            } else {
                $groupBox = $this->getAttribute('groupBox');
                if ($groupBox !== null) {
                    $this->_isGroupBox = ($groupBox === '1');
                } else {
                    $this->_isGroupBox = (($depth % 2) == 1);
                }
                if ($this->_isGroupBox) {
                    $this->htmlId = $parentId.'-group'.$idx;
                } else {
                    $this->_isTabPanel = true;
                    $this->htmlId = $parentId.'-tab'.$idx;
                }
            }

            // Check if the visibility of the object depends on QGIS expressions
            if ($this->getAttribute('visibilityExpressionEnabled') === '1') {
                $this->_isVisibilityExpressionEnabled = true;
                $this->_visibilityExpression = $this->getAttribute('visibilityExpression');
            }

            $childIdx = 0;
            foreach ($node->children() as $child) {
                $name = $child->getName();
                if ($name != 'attributeEditorContainer'
                    && $name != 'attributeEditorForm'
                    && $name != 'attributeEditorField'
                    && $name != 'attributeEditorRelation'
                    && $name != 'attributeEditorTextElement'
                ) {
                    ++$childIdx;

                    continue;
                }
                $child = new qgisAttributeEditorElement($formControls, $child, $this->htmlId, $childIdx, $depth + 1);

                if (!$child->isContainer()) {
                    // Child is a Field input OR a relation widget
                    if ($child->getCtrlRef() !== null || $child->isRelationWidget() || $child->isTextWidget()) {
                        if (count($this->tabChildren)) {
                            $this->childrenAfterTab[] = $child;
                        } else {
                            $this->childrenBeforeTab[] = $child;
                        }
                    }
                } else {
                    if ($child->isGroupBox()) {
                        if (count($this->tabChildren)) {
                            $this->childrenAfterTab[] = $child;
                        } else {
                            $this->childrenBeforeTab[] = $child;
                        }
                    } else {
                        $this->tabChildren[] = $child;
                    }
                }
                ++$childIdx;
            }
        }
    }

    public function getName()
    {
        return $this->getAttribute('name');
    }

    public function getLabel()
    {
        return $this->getAttribute('label');
    }

    public function getHtmlId()
    {
        return $this->htmlId;
    }

    public function getParentId()
    {
        return $this->parentId;
    }

    public function getCtrlRef()
    {
        return $this->ctrlRef;
    }

    public function getAttribute($name)
    {
        if (isset($this->attributes[$name])) {
            return $this->attributes[$name];
        }

        return null;
    }

    /**
     * Returns the _textWidgetText property value.
     *
     * @return string
     */
    public function getTextWidgetText()
    {
        return $this->_textWidgetText;
    }

    public function isContainer()
    {
        return $this->_isContainer;
    }

    /**
     * Returns the _isTextWidget property value, that is, whether the element is a text widget or not.
     *
     * @return bool
     */
    public function isTextWidget()
    {
        return $this->_isTextWidget;
    }

    public function isGroupBox()
    {
        return $this->_isGroupBox;
    }

    public function isTabPanel()
    {
        return $this->_isTabPanel;
    }

    public function isRelationWidget()
    {
        return $this->_isRelationWidget;
    }

    public function isVisibilityExpressionEnabled()
    {
        return $this->_isVisibilityExpressionEnabled
                && $this->_visibilityExpression !== '';
    }

    public function visibilityExpression()
    {
        if ($this->isVisibilityExpressionEnabled()) {
            return $this->_visibilityExpression;
        }

        return null;
    }

    /**
     * @return qgisAttributeEditorElement[]
     */
    public function getChildrenBeforeTab()
    {
        return $this->childrenBeforeTab;
    }

    /**
     * @return qgisAttributeEditorElement[]
     */
    public function getChildrenAfterTab()
    {
        return $this->childrenAfterTab;
    }

    /**
     * @return qgisAttributeEditorElement[]
     */
    public function getTabChildren()
    {
        return $this->tabChildren;
    }

    public function hasTabChildren()
    {
        return count($this->tabChildren) > 0;
    }

    public function hasChildren()
    {
        return (count($this->tabChildren) +
            count($this->childrenBeforeTab) +
            count($this->childrenAfterTab)) > 0;
    }

    public function getFields()
    {
        $fields = array();
        if (!$this->hasChildren()) {
            return $fields;
        }

        foreach ($this->getChildrenBeforeTab() as $child) {
            if ($child->isGroupBox()) {
                $fields = array_merge($fields, $child->getFields());
            } else {
                $fields[] = $child->getName();
            }
        }

        foreach ($this->getTabChildren() as $child) {
            $fields = array_merge($fields, $child->getFields());
        }

        foreach ($this->getChildrenAfterTab() as $child) {
            if ($child->isGroupBox()) {
                $fields = array_merge($fields, $child->getFields());
            } else {
                $fields[] = $child->getName();
            }
        }

        return $fields;
    }

    /**
     * Returns the text widget fields configuration.
     *
     * @return array<mixed|string>[]
     */
    public function getTextWidgetFields()
    {
        $fields = array();
        if (!$this->hasChildren() && $this->isTextWidget() == true) {
            $fields[$this->getName()] = array(
                'label' => $this->getName(),
                'name' => $this->getName(),
                'value' => $this->getTextWidgetText(),
            );

            return $fields;
        }

        foreach ($this->getChildrenBeforeTab() as $child) {
            if ($child->isGroupBox()) {
                $fields = array_merge($fields, $child->getTextWidgetFields());
            } else {
                if ($child->isTextWidget() == true) {
                    $fields[$child->getName()] = array(
                        'label' => $child->getName(),
                        'name' => $child->getName(),
                        'value' => $child->getTextWidgetText(),
                    );
                }
            }
        }

        foreach ($this->getTabChildren() as $child) {
            $fields = array_merge($fields, $child->getTextWidgetFields());
        }

        foreach ($this->getChildrenAfterTab() as $child) {
            if ($child->isGroupBox()) {
                $fields = array_merge($fields, $child->getTextWidgetFields());
            } else {
                if ($this->isTextWidget() == true) {
                    $fields[$child->getName()] = array(
                        'label' => $child->getName(),
                        'name' => $child->getName(),
                        'value' => $child->getTextWidgetText(),
                    );
                }
            }
        }

        return $fields;
    }

    public function getGroupVisibilityExpressions()
    {
        $expressions = array();
        if (!$this->hasChildren()) {
            return $expressions;
        }

        foreach ($this->getChildrenBeforeTab() as $child) {
            if ($child->isGroupBox()) {
                if ($child->isVisibilityExpressionEnabled()) {
                    $expressions[$child->getHtmlId()] = $child->visibilityExpression();
                } else {
                    $expressions[$child->getHtmlId()] = '';
                }
                $expressions = array_merge($expressions, $child->getGroupVisibilityExpressions());
            }
        }

        foreach ($this->getTabChildren() as $child) {
            if ($child->isVisibilityExpressionEnabled()) {
                $expressions[$child->getHtmlId()] = $child->visibilityExpression();
            } else {
                $expressions[$child->getHtmlId()] = '';
            }
            $expressions = array_merge($expressions, $child->getGroupVisibilityExpressions());
        }

        foreach ($this->getChildrenAfterTab() as $child) {
            if ($child->isGroupBox()) {
                if ($child->isVisibilityExpressionEnabled()) {
                    $expressions[$child->getHtmlId()] = $child->visibilityExpression();
                } else {
                    $expressions[$child->getHtmlId()] = '';
                }
                $expressions = array_merge($expressions, $child->getGroupVisibilityExpressions());
            }
        }

        return $expressions;
    }
}
