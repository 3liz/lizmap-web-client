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
     * @var array
     */
    protected $attributeLowerNames = array();

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
     * @param int|string $fieldEditType the field edit type
     * @param string     $markup        type of markup for the control
     * @param array      $attributes    list of qgis/lizmap attributes about the form control
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

        foreach (array_keys($attributes) as $name) {
            $this->attributeLowerNames[strtolower($name)] = $name;
        }
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
     * @return bool
     */
    public function hasEditAttribute($attrName)
    {
        $lowerName = strtolower($attrName);

        return isset($this->attributes[$attrName]) || isset($this->attributeLowerNames[$lowerName]);
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

        $lowerName = strtolower($attrName);
        if (isset($this->attributeLowerNames[$lowerName])) {
            return $this->attributes[$this->attributeLowerNames[$lowerName]];
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
            'layerName' => $this->getEditAttribute('LayerName'),
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
        // TODO Remove orderByValue when QGIS 3.32 will be the minimum version for allowing a QGIS project
        return array(
            'allowNull' => $this->getEditAttribute('AllowNull'),
            'orderByValue' => $this->hasEditAttribute('OrderByValue') ? $this->getEditAttribute('OrderByValue') : true, // OrderByValue has been removed from XML since QGIS 3.32
            'relation' => $this->getEditAttribute('Relation'),
            'mapIdentification' => $this->getEditAttribute('MapIdentification'),
            'filters' => $this->getEditAttribute('filters'),
            'filterExpression' => $this->getEditAttribute('FilterExpression'),
            'chainFilters' => $this->getEditAttribute('chainFilters'),
            'referencedLayerName' => $this->getEditAttribute('ReferencedLayerName'),
            'referencedLayerId' => $this->getEditAttribute('ReferencedLayerId'),
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

    public function getMimeTypes()
    {
        $mime = $this->getEditAttribute('UploadMimeTypes');
        if (!is_array($mime)) {
            return array();
        }

        return $mime;
    }

    /**
     * Get the accept value for upload controls.
     *
     * @return string list of type of files separated by a comma. see HTTP accept attribute.
     */
    public function getUploadAccept()
    {
        $attr = $this->getEditAttribute('UploadAccept');
        if ($attr === null) {
            return '';
        }

        return $attr;
    }

    /**
     * Get the capture value for upload controls.
     *
     * @return string the type of capture. empty or 'camera'
     */
    public function getUploadCapture()
    {
        $attr = $this->getEditAttribute('UploadCapture');
        if ($attr === null) {
            return '';
        }

        return $attr;
    }

    public function isImageUpload()
    {
        return $this->getEditAttribute('UploadImage') === true;
    }
}
