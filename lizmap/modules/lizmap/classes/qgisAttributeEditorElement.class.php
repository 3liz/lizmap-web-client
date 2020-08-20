<?php
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

    protected $_isContainer = false;
    protected $_isGroupBox = false;
    protected $_isTabPanel = false;

    protected $attributes = array();

    protected $childrenBeforeTab = array();
    protected $tabChildren = array();
    protected $childrenAfterTab = array();

    public function __construct(
        qgisFormControlsInterface $formControls,
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
        $this->_isContainer = ($name != 'attributeEditorField');
        if (!$this->_isContainer) {
            $this->htmlId = $parentId.'-'.$idx;
        } else {
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

            $childIdx = 0;
            foreach ($node->children() as $child) {
                $name = $child->getName();
                if ($name != 'attributeEditorContainer' &&
                    $name != 'attributeEditorForm' &&
                    $name != 'attributeEditorField'
                ) {
                    ++$childIdx;

                    continue;
                }
                $child = new qgisAttributeEditorElement($formControls, $child, $this->htmlId, $childIdx, $depth + 1);

                if (!$child->isContainer()) {
                    if ($child->getCtrlRef() !== null) {
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

    public function isContainer()
    {
        return $this->_isContainer;
    }

    public function isGroupBox()
    {
        return $this->_isGroupBox;
    }

    public function isTabPanel()
    {
        return $this->_isTabPanel;
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
}
