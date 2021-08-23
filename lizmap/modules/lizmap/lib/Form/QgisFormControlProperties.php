<?php
/**
 * Properties of a Form field.
 *
 * @author    3liz
 * @copyright 2021 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Form;

/**
 * Properties of a Form field.
 *
 * These properties are set during the read of the QGIS file. Can be stored
 * into a cache.
 */
class QgisFormControlProperties
{
    /**
     * @var string
     */
    protected $name = '';

    /**
     * @var int|string
     */
    protected $fieldEditType;

    /**
     * @var array
     */
    protected $attributes = array();

    /**
     * @var bool
     */
    protected $editable = true;

    /**
     * @var string
     */
    protected $fieldAlias = '';

    /**
     * @var array
     */
    protected $rendererCategories = array();

    protected $_IsMultiline = false;

    protected $_UseHtml = false;

    protected $markup = '';

    /**
     * @param string     $name
     * @param int|string $fieldEditType
     * @param mixed      $markup
     */
    public function __construct($name, $fieldEditType, $markup, array $attributes)
    {
        $this->name = $name;
        $this->fieldEditType = $fieldEditType; // != '' ? $fieldEditType: 'undefined';
        $this->markup = $markup;

        foreach (array('IsMultiline', 'UseHtml') as $prop) {
            if (isset($attributes[$prop])) {
                $this->{'_'.$prop} = $attributes[$prop];
                unset($attributes[$prop]);
            }
        }

        // if one of these attributes is false, the control is not editable
        foreach (array('editable', 'Editable', 'fieldEditable') as $prop) {
            if (isset($attributes[$prop])) {
                if (!$attributes[$prop]) {
                    $this->editable = false;
                }
                unset($attributes[$prop]);
            }
        }

        if (!isset($attributes['filters'])) {
            $attributes['filters'] = array();
        }
        if (!isset($attributes['chainFilters'])) {
            $attributes['chainFilters'] = false;
        }

        $this->attributes = $attributes;
    }

    /**
     * The name of the control.
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    public function getFieldEditType()
    {
        return $this->fieldEditType;
    }

    /**
     * @return array
     */
    public function getEditAttributes()
    {
        return $this->attributes;
    }

    /**
     * @param string $attrName
     *
     * @return null|mixed
     */
    public function getEditAttribute($attrName)
    {
        if (isset($this->attributes[$attrName])) {
            return $this->attributes[$attrName];
        }

        return null;
    }

    /**
     * @return bool
     */
    public function isEditable()
    {
        return $this->editable;
    }

    /**
     * @return bool
     */
    public function isMultiline()
    {
        return $this->_IsMultiline;
    }

    /**
     * @return bool
     */
    public function useHtml()
    {
        return $this->_UseHtml;
    }

    public function getValueMap()
    {
        // for the case when it is stored into <edittype>
        if (isset($this->attributes['valueMap'])
            && is_array($this->attributes['valueMap'])
        ) {
            return $this->attributes['valueMap'];
        }
        // for the case when it is stored into <fieldConfiguration>
        if (isset($this->attributes['map'])
            && is_array($this->attributes['map'])
        ) {
            return $this->attributes['map'];
        }

        return array();
    }

    public function getValueRelationData()
    {
        return array(
            'allowNull' => $this->getEditAttribute('AllowNull'),
            'orderByValue' => $this->getEditAttribute('OrderByValue'),
            'layer' => $this->getEditAttribute('Layer'),
            'key' => $this->getEditAttribute('Key'),
            'value' => $this->getEditAttribute('Value'),
            'allowMulti' => $this->getEditAttribute('AllowMulti'),
            'filterExpression' => $this->getEditAttribute('FilterExpression'),
            'useCompleter' => $this->getEditAttribute('UseCompleter'),
            'fieldEditable' => $this->isEditable(),
        );
    }

    public function getRelationReference()
    {
        return array(
            'allowNull' => $this->getEditAttribute('AllowNull'),
            'orderByValue' => $this->getEditAttribute('OrderByValue'),
            'relation' => $this->getEditAttribute('Relation'),
            'mapIdentification' => $this->getEditAttribute('MapIdentification'),
            'filters' => $this->getEditAttribute('filters'),
            'chainFilters' => $this->getEditAttribute('chainFilters'),
        );
    }

    public function setRendererCategories(array $rendererCategories)
    {
        $this->rendererCategories = $rendererCategories;
    }

    /**
     * @return array
     */
    public function getRendererCategories()
    {
        return $this->rendererCategories;
    }

    /**
     * @return string
     */
    public function getMarkup()
    {
        return $this->markup;
    }

    /**
     * @param string $fieldAlias
     */
    public function setFieldAlias($fieldAlias)
    {
        $this->fieldAlias = $fieldAlias;
    }

    /**
     * @return string
     */
    public function getFieldAlias()
    {
        return $this->fieldAlias;
    }
}
