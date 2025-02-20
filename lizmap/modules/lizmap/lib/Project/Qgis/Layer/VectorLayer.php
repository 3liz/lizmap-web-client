<?php

/**
 * QGIS Vector layer.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis\Layer;

use Lizmap\Form;
use Lizmap\Project\Qgis;

/**
 * QGIS Vector layer.
 *
 * @property string                                 $id
 * @property bool                                   $embedded
 * @property string                                 $type
 * @property string                                 $layername
 * @property Qgis\SpatialRefSys                     $srs
 * @property string                                 $datasource
 * @property string                                 $provider
 * @property MapLayerStyleManager                   $styleManager
 * @property null|string                            $shortname
 * @property null|string                            $title
 * @property null|string                            $abstract
 * @property null|array<string>                     $keywordList
 * @property null|string                            $previewExpression
 * @property float                                  $layerOpacity
 * @property MapLayerStyleManager                   $styleManager
 * @property array<VectorLayerField>                $fieldConfiguration
 * @property array<VectorLayerAlias>                $aliases
 * @property array<VectorLayerConstraint>           $constraints
 * @property array<VectorLayerConstraintExpression> $constraintExpressions
 * @property array<VectorLayerDefault>              $defaults
 * @property array<VectorLayerEditableField>        $editable
 * @property array<VectorLayerJoin>                 $vectorjoins
 * @property AttributeTableConfig                   $attributetableconfig
 * @property null|array<string>                     $excludeAttributesWMS
 * @property null|array<string>                     $excludeAttributesWFS
 * @property null|RendererV2                        $rendererV2
 */
class VectorLayer extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'id',
        'embedded',
        'type',
        'layername',
        'srs',
        'datasource',
        'provider',
        'styleManager',
        'shortname',
        'title',
        'abstract',
        'keywordList',
        'previewExpression',
        'layerOpacity',
        'fieldConfiguration',
        'aliases',
        'defaults',
        'constraints',
        'constraintExpressions',
        'editable',
        'excludeAttributesWFS',
        'excludeAttributesWMS',
        'attributetableconfig',
        'vectorjoins',
        'rendererV2',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'id',
        'embedded',
        'type',
        'layername',
        'srs',
        'datasource',
        'provider',
        'styleManager',
    );

    /** @var array The default values for properties */
    protected $defaultValues = array(
        'layerOpacity' => 1,
    );

    /**
     * Get layer opacity.
     *
     * @return float
     */
    public function getLayerOpacity()
    {
        return $this->layerOpacity;
    }

    /**
     * Get preview field.
     *
     * @return string
     */
    public function getPreviewField()
    {
        if ($this->previewExpression === null) {
            return '';
        }
        $previewField = $this->previewExpression;
        if (substr($previewField, 0, 8) == 'COALESCE') {
            if (preg_match('/"([\S ]+)"/', $previewField, $matches) == 1) {
                $previewField = $matches[1];
            } else {
                $previewField = '';
            }
        } elseif (substr($previewField, 0, 1) == '"' and substr($previewField, -1) == '"') {
            $previewField = substr($previewField, 1, -1);
        }

        return $previewField;
    }

    /**
     * Get field alias.
     *
     * @param mixed $fieldName
     *
     * @return null|string
     */
    public function getFieldAlias($fieldName)
    {
        if ($this->aliases === null) {
            return null;
        }
        foreach ($this->aliases as $alias) {
            if ($alias->field === $fieldName) {
                return $alias->name;
            }
        }

        return null;
    }

    /**
     * Get field editable.
     *
     * @param mixed $fieldName
     *
     * @return bool
     */
    public function getFieldEditable($fieldName)
    {
        if (count($this->editable) == 0) {
            return true;
        }
        foreach ($this->editable as $editable) {
            if ($editable->name === $fieldName) {
                return $editable->editable;
            }
        }

        return false;
    }

    /**
     * Get vector layer as key array.
     *
     * @return array
     */
    public function toKeyArray()
    {
        $data = array(
            'type' => $this->type,
            'id' => $this->id,
            'name' => $this->layername,
            'shortname' => $this->shortname !== null ? $this->shortname : '',
            'title' => $this->title !== null ? $this->title : $this->layername,
            'abstract' => $this->abstract !== null ? $this->abstract : '',
            'proj4' => $this->srs->proj4,
            'srid' => $this->srs->srid,
            'authid' => $this->srs->authid,
            'datasource' => $this->datasource,
            'provider' => $this->provider,
            'keywords' => $this->keywordList !== null ? $this->keywordList : array(),
        );

        $fields = array();
        $wfsFields = array();
        $aliases = array();
        $defaults = array();
        $constraints = array();
        $webDavFields = array();
        $webDavBaseUris = array();
        foreach ($this->fieldConfiguration as $field) {
            if (in_array($field->name, $fields)) {
                continue; // QGIS sometimes stores them twice
            }
            $fields[] = $field->name;
            if (!$field->isHideFromWfs()) {
                $wfsFields[] = $field->name;
            }
            $aliases[$field->name] = $field->name;
            $defaults[$field->name] = null;
            $constraints[$field->name] = null;

            if ($field->editWidget->type === 'ExternalResource') {
                if ($field->editWidget->config instanceof Qgis\BaseQgisObject) {
                    $fieldEditOptions = $field->editWidget->config->getData();
                } else {
                    $fieldEditOptions = array_merge(array(), $field->editWidget->config);
                }
                if (array_key_exists('StorageType', $fieldEditOptions) && $fieldEditOptions['StorageType'] === 'WebDAV') {
                    $this->readWebDavStorageOptions($fieldEditOptions);
                    $webDavFields[] = $field->name;
                    $webDavBaseUris[] = $fieldEditOptions['webDAVStorageUrl'];
                }
            }
        }
        if ($this->aliases !== null) {
            foreach ($this->aliases as $alias) {
                $aliases[$alias->field] = $alias->name;
            }
        }
        if ($this->defaults !== null) {
            foreach ($this->defaults as $default) {
                $defaults[$default->field] = $default->expression;
            }
        }
        if ($this->constraints !== null) {
            foreach ($this->constraints as $constraint) {
                $c = array(
                    'constraints' => 0,
                    'notNull' => false,
                    'unique' => false,
                    'exp' => false,
                );
                $c['constraints'] = $constraint->constraints;
                if ($c['constraints'] > 0) {
                    $c['notNull'] = $constraint->notnull_strength;
                    $c['unique'] = $constraint->unique_strength;
                    $c['exp'] = $constraint->exp_strength;
                }
                $constraints[$constraint->field] = $c;
            }
        }
        if ($this->constraintExpressions !== null) {
            foreach ($this->constraintExpressions as $constraint) {
                $c = array(
                    'constraints' => 0,
                    'notNull' => false,
                    'unique' => false,
                    'exp' => false,
                );
                if (array_key_exists($constraint->field, $constraints)) {
                    $c = $constraints[$constraint->field];
                }
                if ($constraint->exp !== '') {
                    $c['exp'] = true;
                    $c['exp_value'] = $constraint->exp;
                    $c['exp_desc'] = $constraint->desc;
                }
                $constraints[$constraint->field] = $c;
            }
        }

        $data['fields'] = $fields;
        $data['aliases'] = $aliases;
        $data['defaults'] = $defaults;
        $data['constraints'] = $constraints;
        $data['wfsFields'] = $wfsFields;
        $data['webDavFields'] = $webDavFields;
        $data['webDavBaseUris'] = $webDavBaseUris;

        if ($this->excludeAttributesWFS !== null) {
            foreach ($this->excludeAttributesWFS as $eField) {
                if (!in_array($eField, $wfsFields)) {
                    continue; // QGIS sometimes stores them twice
                }
                array_splice($wfsFields, array_search($eField, $wfsFields), 1);
            }
            $data['wfsFields'] = $wfsFields;
        }

        return $data;
    }

    /** @var array<string, string> The options type */
    protected static $optionTypes = array(
        'Min' => 'f',
        'Max' => 'f',
        'Step' => 'i',
        'Precision' => 'i',
        'AllowMulti' => 'b',
        'AllowNull' => 'b',
        'UseCompleter' => 'b',
        'DocumentViewer' => 'b',
        'fieldEditable' => 'b',
        'editable' => 'b',
        'Editable' => 'b',
        'notNull' => 'b',
        'MapIdentification' => 'b',
        'IsMultiline' => 'b',
        'UseHtml' => 'b',
        'field_iso_format' => 'b',
    );

    /**
     * Update options value by converting them.
     *
     * @param array $options
     */
    protected function convertTypeOptions(&$options)
    {
        foreach ($options as $name => $val) {
            if (isset(self::$optionTypes[$name])) {
                switch (self::$optionTypes[$name]) {
                    case 'f':
                        $options[$name] = (float) $val;

                        break;

                    case 'i':
                        $options[$name] = (int) $val;

                        break;

                    case 'b':
                        $options[$name] = filter_var($val, FILTER_VALIDATE_BOOLEAN);

                        break;

                }
            }
        }
    }

    /**
     * Get the HTML markup.
     *
     * @param string $fieldEditType    Field edit type
     * @param array  $fieldEditOptions Field edit config options
     *
     * @return string The HTML markup corresponding to field edit type and config options
     */
    protected function getMarkup($fieldEditType, $fieldEditOptions)
    {
        $qgisEdittypeMap = Form\QgisFormControl::getEditTypeMap();

        if ($fieldEditType === 'TextEdit') {
            $isMultiLine = false;
            if (array_key_exists('IsMultiline', $fieldEditOptions)) {
                $isMultiLine = $fieldEditOptions['IsMultiline'];
            }

            if (!$isMultiLine) {
                $fieldEditType = 'LineEdit';
                $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'];
            } else {
                $useHtml = false;
                if (array_key_exists('UseHtml', $fieldEditOptions)) {
                    $useHtml = $fieldEditOptions['UseHtml'];
                }
                if ($useHtml) {
                    $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'][1];
                } else {
                    $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'][0];
                }
            }
        } elseif ($fieldEditType === 'ValueRelation') {
            $allowMulti = false;
            if (array_key_exists('AllowMulti', $fieldEditOptions)) {
                $allowMulti = $fieldEditOptions['AllowMulti'];
            }
            $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'][$allowMulti];
        } elseif ($fieldEditType === 'Range' || $fieldEditType === 'EditRange') {
            $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'][0];
        } elseif ($fieldEditType === 'SliderRange' || $fieldEditType === 'DialRange') {
            $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'][1];
        } elseif ($fieldEditType === 'DateTime') {
            $markup = 'date';
            $display_format = '';
            if (array_key_exists('display_format', $fieldEditOptions)) {
                $display_format = $fieldEditOptions['display_format'];
            }
            // Use date AND time widget id type is DateTime and we find HH
            if (preg_match('#HH#i', $display_format)) {
                $markup = 'datetime';
            }
            // Use only time if field is only time
            if (preg_match('#HH#i', $display_format) and !preg_match('#YY#i', $display_format)) {
                $markup = 'time';
            }
        } elseif (array_key_exists($fieldEditType, $qgisEdittypeMap)) {
            $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'];
        } else {
            $markup = '';
        }

        return $markup;
    }

    /**
     * Update upload config options.
     *
     * @param string $fieldEditType    Field edit type
     * @param array  $fieldEditOptions Field edit config options
     */
    protected function readUploadOptions($fieldEditType, &$fieldEditOptions)
    {
        $mimeTypes = array();
        $acceptAttr = '';
        $captureAttr = '';
        $imageUpload = false;
        $defaultRoot = '';

        if ($fieldEditType === 'Photo') {
            $mimeTypes = array('image/jpg', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/gif');
            $acceptAttr = implode(', ', $mimeTypes);
            $captureAttr = 'environment';
            $imageUpload = true;
        } elseif ($fieldEditType === 'ExternalResource') {
            $accepts = array();
            $FileWidgetFilter = $fieldEditOptions['FileWidgetFilter'] ?? '';
            if ($FileWidgetFilter) {
                // QFileDialog::getOpenFileName filter
                $FileWidgetFilter = explode(';;', $FileWidgetFilter);
                $re = '/\*(\.\w{3,6})/';
                $hasNoImageItem = false;
                foreach ($FileWidgetFilter as $FileFilter) {
                    $matches = array();
                    if (preg_match_all($re, $FileFilter, $matches)) {
                        foreach ($matches[1] as $m) {
                            $type = \jFile::getMimeTypeFromFilename('f'.$m);
                            if ($type != 'application/octet-stream') {
                                $mimeTypes[] = $type;
                            }
                            if (strpos($type, 'image/') === 0) {
                                $imageUpload = true;
                            } else {
                                $hasNoImageItem = true;
                            }
                            $accepts[] = $m;
                        }
                    }
                }
                if ($hasNoImageItem) {
                    $imageUpload = false;
                }

                if (count($accepts) > 0) {
                    $mimeTypes = array_unique($mimeTypes);
                    $accepts = array_unique($accepts);
                    $acceptAttr = implode(', ', $accepts);
                }
            }
            $isDocumentViewer = $fieldEditOptions['DocumentViewer'] ?? '';
            if ($isDocumentViewer) {
                if (count($accepts)) {
                    $mimeTypes = array();
                    $typeTab = array(
                        '.gif' => 'image/gif',
                        '.png' => 'image/png',
                        '.jpg' => array('image/jpg', 'image/jpeg', 'image/pjpeg'),
                        '.jpeg' => array('image/jpg', 'image/jpeg', 'image/pjpeg'),
                        '.bm' => array('image/bmp', 'image/x-windows-bmp'),
                        '.bmp' => array('image/bmp', 'image/x-windows-bmp'),
                        '.pbm' => 'image/x-portable-bitmap',
                        '.pgm' => array('image/x-portable-graymap', 'image/x-portable-greymap'),
                        '.ppm' => 'image/x-portable-pixmap',
                        '.xbm' => array('image/xbm', 'image/x-xbm', 'image/x-xbitmap'),
                        '.xpm' => array('image/xpm', 'image/x-xpixmap'),
                        '.svg' => 'image/svg+xml',
                    );
                    $filteredAccepts = array();
                    foreach ($accepts as $a) {
                        if (array_key_exists($a, $typeTab)) {
                            if ((in_array($a, array('.jpg', '.jpeg')) && in_array('image/jpg', $mimeTypes))
                                || (in_array($a, array('.bm', '.bmp')) && in_array('image/bmp', $mimeTypes))) {
                                continue;
                            }
                            if (is_array($typeTab[$a])) {
                                $mimeTypes = array_merge($mimeTypes, $typeTab[$a]);
                            } else {
                                $mimeTypes[] = $typeTab[$a];
                            }
                            $filteredAccepts[] = $a;
                        }
                    }
                    $mimeTypes = array_unique($mimeTypes);
                    $accepts = array_unique($filteredAccepts);
                    $acceptAttr = implode(', ', $accepts);
                } else {
                    $mimeTypes = array('image/jpg', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/gif');
                    $acceptAttr = 'image/jpg, image/jpeg, image/pjpeg, image/png, image/gif';
                }
                $captureAttr = 'environment';
                $imageUpload = true;
            }
            $defaultRoot = $fieldEditOptions['DefaultRoot'] ?? '';

            if ($defaultRoot
                && (preg_match('#^../media(/)?#', $defaultRoot)
                    || preg_match('#^media(/)?#', $defaultRoot))) {
                // Remove the last slashes and add only one
                $defaultRoot = rtrim($defaultRoot, '/').'/';
            } else {
                $defaultRoot = '';
            }
            $this->readWebDavStorageOptions($fieldEditOptions);
        }

        $fieldEditOptions['UploadMimeTypes'] = $mimeTypes;
        $fieldEditOptions['DefaultRoot'] = $defaultRoot;
        $fieldEditOptions['UploadAccept'] = $acceptAttr;
        $fieldEditOptions['UploadCapture'] = $captureAttr;
        $fieldEditOptions['UploadImage'] = $imageUpload;
    }

    /**
     * update the upload options with the property 'webDAVStorageUrl'.
     *
     * @param array $fieldEditOptions
     */
    protected function readWebDavStorageOptions(&$fieldEditOptions)
    {
        $webDAV = (array_key_exists('StorageType', $fieldEditOptions) && $fieldEditOptions['StorageType'] == 'WebDAV') ? $fieldEditOptions['StorageType'] : null;
        if ($webDAV) {
            if (isset($fieldEditOptions['PropertyCollection'], $fieldEditOptions['PropertyCollection']['properties'], $fieldEditOptions['PropertyCollection']['properties']['storageUrl'], $fieldEditOptions['PropertyCollection']['properties']['storageUrl']['expression'])) {
                $fieldEditOptions['webDAVStorageUrl'] = $fieldEditOptions['PropertyCollection']['properties']['storageUrl']['expression'];
            } else {
                $fieldEditOptions['webDAVStorageUrl'] = $fieldEditOptions['StorageUrl'];
            }
        }
    }

    /**
     * Get form controls.
     *
     * @return array<Form\QgisFormControlProperties>
     */
    public function getFormControls()
    {
        $formControls = array();
        foreach ($this->fieldConfiguration as $field) {
            $fieldName = $field->name;
            $fieldEditType = $field->editWidget->type;
            if ($field->editWidget->config instanceof Qgis\BaseQgisObject) {
                $fieldEditOptions = $field->editWidget->config->getData();
            } else {
                $fieldEditOptions = array_merge(array(), $field->editWidget->config);
            }
            $fieldEditOptions['editable'] = $this->getFieldEditable($fieldName);
            $this->convertTypeOptions($fieldEditOptions);
            $markup = $this->getMarkup($fieldEditType, $fieldEditOptions);
            if ($markup == 'upload') {
                $this->readUploadOptions($fieldEditType, $fieldEditOptions);
            }
            $control = new Form\QgisFormControlProperties($fieldName, $fieldEditType, $markup, $fieldEditOptions);

            $alias = $this->getFieldAlias($fieldName);
            if ($alias !== null) {
                $control->setFieldAlias($alias);
            }

            if ($this->rendererV2 && $this->rendererV2->type == 'categorizedSymbol') {
                $control->setRendererCategories($this->rendererV2->categories);
            }

            $formControls[$fieldName] = $control;
        }

        return $formControls;
    }
}
