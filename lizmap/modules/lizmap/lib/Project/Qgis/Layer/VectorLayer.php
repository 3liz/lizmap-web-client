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
}
