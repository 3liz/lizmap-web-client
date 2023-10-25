<?php
/**
 * Parse qgis project.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project;

use Lizmap\App;

class QgisProjectParser
{
    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisDocument($oXmlReader)
    {
        $localName = 'qgis';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array(
            'version' => $oXmlReader->getAttribute('version'),
            'projectname' => $oXmlReader->getAttribute('projectname'),
        );
        $tagNames = array(
            'title',
            'projectCrs',
            // 'mapcanvas', // for theMapCanvas the CRS is provided by projectCrs
            'layer-tree-group',
            'projectlayers',
            'properties',
            'visibility-presets',
            'Layouts',
        );
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            $tagName = $oXmlReader->localName;
            if (!in_array($tagName, $tagNames)
                || $oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'properties') {
                $data[$oXmlReader->localName] = self::readQgisProperties($oXmlReader);
            } else if ($oXmlReader->localName == 'projectCrs') {
                $data[$oXmlReader->localName] = self::readQgisProjectCrs($oXmlReader);
            } else {
                $data[$oXmlReader->localName] = $oXmlReader->readString();
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisProjectCrs($oXmlReader)
    {
        $localName = 'projectCrs';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'spatialrefsys') {
                $data = self::readSpatialRefSys($oXmlReader);
            }
        }
        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisLayerTreeGroup($oXmlReader)
    {
        $localName = 'layer-tree-group';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        $tagNames = array(
            'custom-order'
        );
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            $tagName = $oXmlReader->localName;
            if (!in_array($tagName, $tagNames)
                || $oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'custom-order') {
                $data[$oXmlReader->localName] = self::readQgisCustomOrder($oXmlReader);
            }
        }
        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisCustomOrder($oXmlReader)
    {
        $localName = 'custom-order';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array(
            'enabled' => filter_var($oXmlReader->getAttribute('enabled'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        );
        if ($data['enabled']) {
            $data['items'] = self::readItems($oXmlReader);
        } else {
            while ($oXmlReader->read()) {

                if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                    && $oXmlReader->localName == $localName
                    && $oXmlReader->depth == $depth) {
                    break;
                }

            }
        }
        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisProperties($oXmlReader)
    {
        $localName = 'properties';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        $tagNames = array(
            'WMSServiceTitle',
            'WMSServiceAbstract',
            'WMSKeywordList',
            'WMSExtent',
            // 'ProjectCrs', // it is in SpatialRefSys and is deprecated - the qgis/projectCrs is recommended
            'WMSOnlineResource',
            'WMSContactMail',
            'WMSContactOrganization',
            'WMSContactPerson',
            'WMSContactPhone',
            'WMSMaxWidth',
            'WMSMaxHeight',
            'WMSRestrictedComposers',
            'WMSUseLayerIDs',
            // 'Gui', // it contains Canvas and Selection colors extracted by readQgisGuiProperties
            // 'Variables',
        );
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            $tagName = $oXmlReader->localName;
            if (!in_array($tagName, $tagNames)
                || $oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'Gui') {
                $data[$oXmlReader->localName] = self::readQgisGuiProperties($oXmlReader);
            } else if ($oXmlReader->localName == 'Variables') {
                $data[$oXmlReader->localName] = self::readQgisVariablesProperties($oXmlReader);
            }

            $type = $oXmlReader->getAttribute('type');
            if ($type == 'QStringList') {
                $data[$tagName] = array();
                if (!$oXmlReader->isEmptyElement) {
                    $data[$tagName] = self::readValues($oXmlReader);
                }
            } else if ($type == 'bool') {
                $data[$tagName] = filter_var($oXmlReader->readString(), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            } else if ($type == 'int') {
                $data[$tagName] = (int) $oXmlReader->readString();
            } else {
                $data[$tagName] = $oXmlReader->readString();
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisGuiProperties($oXmlReader)
    {
        $localName = 'Gui';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        $tagNames = array(
            'CanvasColorBluePart',
            'CanvasColorGreenPart',
            'CanvasColorRedPart',
            'SelectionColorAlphaPart',
            'SelectionColorBluePart',
            'SelectionColorGreenPart',
            'SelectionColorRedPart',
            // 'Identify', // it contains disabledLayers
        );
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            $tagName = $oXmlReader->localName;
            if (!in_array($tagName, $tagNames)
                || $oXmlReader->depth != $depth + 1) {
                continue;
            }

            $type = $oXmlReader->getAttribute('type');
            if ($type == 'QStringList') {
                $data[$tagName] = '';
                if (!$oXmlReader->isEmptyElement) {
                    $data[$tagName] = implode(', ', self::readValues($oXmlReader));
                }
            } else if ($type == 'int') {
                $data[$tagName] = (int) $oXmlReader->readString();
            } else {
                $data[$tagName] = $oXmlReader->readString();
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisVariablesProperties($oXmlReader)
    {
        $localName = 'Variables';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        $tagNames = array(
            'variableNames',
            'variableValues',
        );
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            $tagName = $oXmlReader->localName;
            if (!in_array($tagName, $tagNames)
                || $oXmlReader->depth != $depth + 1) {
                continue;
            }

            $type = $oXmlReader->getAttribute('type');
            if ($type == 'QStringList') {
                $data[$tagName] = array();
                if (!$oXmlReader->isEmptyElement) {
                    $data[$tagName] = self::readValues($oXmlReader);
                }
            } else {
                $data[$tagName] = $oXmlReader->readString();
            }
        }
        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisVisibilityPresets($oXmlReader)
    {
        $localName = 'visibility-presets';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'visibility-preset') {
                $data[] = self::readQgisVisibilityPreset($oXmlReader);
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisVisibilityPreset($oXmlReader)
    {
        $localName = 'visibility-preset';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array(
            'name' => $oXmlReader->getAttribute('name'),
            'layers' => array(),
            'checkedGroupNodes' => array(),
            'expandedGroupNodes' => array(),
        );
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth > $depth + 2) {
                continue;
            }

            $tagName = $oXmlReader->localName;
            if ( $tagName == 'layer' ) {
                $data['layers'][] = array(
                    'id' => $oXmlReader->getAttribute('id'),
                    'visible' => filter_var($oXmlReader->getAttribute('visible'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
                    'style' => $oXmlReader->getAttribute('style'),
                    'expanded' => filter_var($oXmlReader->getAttribute('expanded'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
                );
            } else if ( $tagName == 'checked-group-node' ) {
                $data['checkedGroupNodes'][] = $oXmlReader->getAttribute('id');
            } else if ( $tagName == 'expanded-group-node' ) {
                $data['expandedGroupNodes'][] = $oXmlReader->getAttribute('id');
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisProjectLayers($oXmlReader)
    {
        $localName = 'projectlayers';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'maplayer') {
                $data[] = self::readQgisMapLayer($oXmlReader);
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayer($oXmlReader)
    {
        $localName = 'maplayer';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        // The maplayer can reference an embeded layer
        $embedded = filter_var($oXmlReader->getAttribute('embedded'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($embedded) {
            return array(
                'id' => $oXmlReader->getAttribute('id'),
                'embedded' => true,
                'project' => $oXmlReader->getAttribute('project'),
            );
        }

        $depth = $oXmlReader->depth;
        $data = array(
            'type' => $oXmlReader->getAttribute('type'),
            'embedded' => false,
        );
        $tagNames = array(
            'id',
            'layername',
            'shortname',
            'title',
            'abstract',
            'srs',
            'datasource',
            'provider',
            'keywordList',
            // 'fieldConfiguration'
            // 'aliases',
            // 'excludeAttributesWFS'
            // 'excludeAttributesWMS'
            // 'defaults',
            // 'constraints',
            // 'constraintExpressions',
            // 'map-layer-style-manager'
            // 'attributetableconfig'
            // 'vectorjoins'
        );

        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            $tagName = $oXmlReader->localName;
            if (!in_array($tagName, $tagNames)
                || $oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($tagName == 'keywordList') {
                $data[$tagName] = '';
                if (!$oXmlReader->isEmptyElement) {
                    $data[$tagName] = self::readValues($oXmlReader);
                }
            } else if ($tagName == 'srs') {
                $data[$tagName] = self::readQgisMapLayerSrs($oXmlReader);
            } else if ($tagName == 'map-layer-style-manager') {
                $data[$tagName] = self::readQgisMapLayerStyleManager($oXmlReader);
            } else if ($tagName == 'fieldConfiguration') {
                $data[$tagName] = self::readQgisMapLayerFieldConfiguration($oXmlReader);
            } else if ($tagName == 'aliases') {
                $data[$tagName] = self::readQgisMapLayerAliases($oXmlReader);
            } else if ($tagName == 'defaults') {
                $data[$tagName] = self::readQgisMapLayerDefaults($oXmlReader);
            } else if ($tagName == 'constraints') {
                $data[$tagName] = self::readQgisMapLayerConstraints($oXmlReader);
            } else if ($tagName == 'constraintExpressions') {
                $data[$tagName] = self::readQgisMapLayerConstraintExpressions($oXmlReader);
            } else if ($tagName == 'excludeAttributesWFS'
                || $tagName == 'excludeAttributesWMS') {
                $data[$tagName] = self::readAttributes($oXmlReader);
            } else if ($tagName == 'attributetableconfig') {
                $data[$tagName] = self::readQgisMapLayerAttributeTableConfig($oXmlReader);
            } else if ($tagName == 'vectorjoins') {
                $data[$tagName] = self::readQgisMapLayerVectorJoins($oXmlReader);
            } else {
                $data[$tagName] = $oXmlReader->readString();
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerSrs($oXmlReader)
    {
        $localName = 'srs';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'spatialrefsys') {
                $data = self::readSpatialRefSys($oXmlReader);
            }
        }
        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerStyleManager($oXmlReader)
    {
        $localName = 'map-layer-style-manager';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array(
            'current' => $oXmlReader->getAttribute('current'),
            'styles' => array(),
        );
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'map-layer-style') {
                $data['styles'][] = $oXmlReader->getAttribute('name');
            }
        }
        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerFieldConfiguration($oXmlReader)
    {
        $localName = 'fieldConfiguration';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'field') {
                $data[] = self::readQgisMapLayerField($oXmlReader);
            }
        }
        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerField($oXmlReader)
    {
        $localName = 'field';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array(
            'name' => $oXmlReader->getAttribute('name'),
            'configurationFlags' => $oXmlReader->getAttribute('configurationFlags'),
        );
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'editWidget') {
                $data['editWidget'] = self::readQgisMapLayerEditWidget($oXmlReader);
            }
        }
        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerEditWidget($oXmlReader)
    {
        $localName = 'editWidget';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array(
            'type' => $oXmlReader->getAttribute('type'),
        );
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'config') {
                $data['config'] = self::readQgisMapLayerEditWidgetConfig($oXmlReader);
            }
        }
        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerEditWidgetConfig($oXmlReader)
    {
        $localName = 'config';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'Option') {
                $data[] = self::readOption($oXmlReader);
            }
        }
        return $data;
        /*
        <fieldConfiguration>
          <field name="OGC_FID">
            <editWidget type="TextEdit">
              <config>
                <Option type="Map">
                  <Option value="0" type="QString" name="IsMultiline"/>
                  <Option value="0" type="QString" name="UseHtml"/>
                </Option>
              </config>
            </editWidget>
          </field>
        </fieldConfiguration>
        */
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerAliases($oXmlReader)
    {
        $localName = 'aliases';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'alias') {
                $data[] = array(
                    'index' => (int) $oXmlReader->getAttribute('index'),
                    'field' => $oXmlReader->getAttribute('field'),
                    'name' => $oXmlReader->getAttribute('name'),
                );
            }
        }
        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerDefaults($oXmlReader)
    {
        $localName = 'defaults';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'default') {
                $data[] = array(
                    'field' => $oXmlReader->getAttribute('field'),
                    'expression' => $oXmlReader->getAttribute('expression'),
                    'applyOnUpdate' => filter_var($oXmlReader->getAttribute('applyOnUpdate'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
                );
            }
        }
        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerConstraints($oXmlReader)
    {
        $localName = 'constraints';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'constraint') {
                $data[] = array(
                    'field' => $oXmlReader->getAttribute('field'),
                    'constraints' => (int) $oXmlReader->getAttribute('constraints'),
                    'notnull_strength' => filter_var($oXmlReader->getAttribute('notnull_strength'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
                    'unique_strength' => filter_var($oXmlReader->getAttribute('unique_strength'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
                    'exp_strength' => filter_var($oXmlReader->getAttribute('exp_strength'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
                );
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerConstraintExpressions($oXmlReader)
    {
        $localName = 'constraintExpressions';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'constraint') {
                $data[] = array(
                    'field' => $oXmlReader->getAttribute('field'),
                    'exp' => $oXmlReader->getAttribute('exp'),
                    'desc' => $oXmlReader->getAttribute('desc'),
                );
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerAttributeTableConfig($oXmlReader)
    {
        $localName = 'attributetableconfig';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'columns') {
                $data[$oXmlReader->localName] = self::readQgisMapLayerAttributeTableColumns($oXmlReader);
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerAttributeTableColumns($oXmlReader)
    {
        $localName = 'columns';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'column') {
                $data[] = array(
                    'type' => $oXmlReader->getAttribute('type'),
                    'name' => $oXmlReader->getAttribute('name'),
                    'hidden' => filter_var($oXmlReader->getAttribute('hidden'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
                );
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisMapLayerVectorJoins($oXmlReader)
    {
        $localName = 'vectorjoins';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'join') {
                $data[] = array(
                    'joinLayerId' => $oXmlReader->getAttribute('joinLayerId'),
                    'joinFieldName' => $oXmlReader->getAttribute('joinFieldName'),
                    'targetFieldName' => $oXmlReader->getAttribute('targetFieldName'),
                );
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisLayouts($oXmlReader)
    {
        $localName = 'Layouts';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'Layout') {
                $data[] = self::readQgisLayout($oXmlReader);
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisLayout($oXmlReader)
    {
        $localName = 'Layout';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array(
            'name' => $oXmlReader->getAttribute('name'),
            'labels' => array(),
            'maps' => array(),
        );
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'PageCollection') {
                $data['pages'] = self::readQgisLayoutPageCollection($oXmlReader);
            } else if ($oXmlReader->localName == 'LayoutItem') {
                $item = self::readQgisLayoutItem($oXmlReader);

                if (!array_key_exists('typeName', $item)) {
                    continue;
                }

                if ($item['typeName'] === 'label' && $item['id'] !== '') {
                    $data['labels'][] = $item;
                } else if ($item['typeName'] === 'map') {
                    $item['id'] = 'map'.(string) count($data['maps']);
                    $data['maps'][] = $item;
                }
            } else if ($oXmlReader->localName == 'Atlas') {
                $enabled = filter_var($oXmlReader->getAttribute('enabled'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($enabled) {
                    $data['atlas'] = array(
                        'enabled' => $enabled,
                        'coverageLayer' => $oXmlReader->getAttribute('coverageLayer'),
                    );
                }
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisLayoutPageCollection($oXmlReader)
    {
        $localName = 'PageCollection';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'LayoutItem') {
                $item = self::readQgisLayoutItem($oXmlReader);

                if (!array_key_exists('typeName', $item)) {
                    continue;
                }

                if ($item['typeName'] !== 'page') {
                    continue;
                }

                $data[] = $item;
            }
        }
        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readQgisLayoutItem($oXmlReader)
    {
        $localName = 'LayoutItem';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array(
            'type' => $oXmlReader->getAttribute('type'),
        );

        if ($data['type'] == '65638') {
            $pageSize = explode(',', $oXmlReader->getAttribute('size'));
            $pagePosition = explode(',', $oXmlReader->getAttribute('position'));
            $data += array(
                'typeName' => 'page',
                'width' => (int) $pageSize[0],
                'height' => (int) $pageSize[1],
                'x' => (int) $pagePosition[0],
                'y' => (int) $pagePosition[1],
            );
        } else if ($data['type'] == '65639') {
            $mapSize = explode(',', $oXmlReader->getAttribute('size'));
            $data += array(
                'typeName' => 'map',
                'uuid' => $oXmlReader->getAttribute('uuid'),
                'width' => (int) $mapSize[0],
                'height' => (int) $mapSize[1],
                'grid' => False,
            );
        } else if ($data['type'] == '65641') {
            $data += array(
                'typeName' => 'label',
                'id' => $oXmlReader->getAttribute('id'),
                'htmlState' => filter_var($oXmlReader->getAttribute('htmlState'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
                'text' => $oXmlReader->getAttribute('labelText'),
            );
        }

        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($data['type'] !== '65639') {
                continue;
            }

            if ($oXmlReader->localName == 'ComposerMapOverview') {
                $show = filter_var($oXmlReader->getAttribute('show'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                $frameMap = $oXmlReader->getAttribute('frameMap');
                if ($show && $frameMap !== '-1') {
                    $data += array(
                        'overviewMap' => $frameMap,
                    );
                }
            } else if ($oXmlReader->localName == 'ComposerMapGrid') {
                $data += array(
                    'grid' => filter_var($oXmlReader->getAttribute('show'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
                );
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readSpatialRefSys($oXmlReader)
    {
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != 'spatialrefsys') {
            throw new \Exception('Provide a `spatialrefsys` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array();
        $tagNames = array(
            'proj4',
            'srid',
            'authid',
            'description',
        );
        while ($oXmlReader->read()) {

            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == 'spatialrefsys'
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            $tagName = $oXmlReader->localName;
            if (!in_array($tagName, $tagNames)
                || $oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($tagName == 'srid') {
                $data[$tagName] = (int) $oXmlReader->readString();
            } else {
                $data[$tagName] = $oXmlReader->readString();
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readAttributes($oXmlReader)
    {
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        $data = array();
        if ($oXmlReader->isEmptyElement) {
            return $data;
        }

        $localName = $oXmlReader->localName;
        $depth = $oXmlReader->depth;
        while ($oXmlReader->read()) {
            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'attribute') {
                $values[] = $oXmlReader->readString();
            }
        }
        return $values;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readItems($oXmlReader)
    {
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }

        $localName = $oXmlReader->localName;
        $depth = $oXmlReader->depth;
        $values = array();
        while ($oXmlReader->read()) {
            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'item') {
                $values[] = $oXmlReader->readString();
            }
        }
        return $values;
    }

    /**
     * @param \XMLReader $xml
     *
     * @return Array
     */
    public static function readValues($oXmlReader)
    {
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }

        $localName = $oXmlReader->localName;
        $depth = $oXmlReader->depth;
        $values = array();
        while ($oXmlReader->read()) {
            if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                && $oXmlReader->localName == $localName
                && $oXmlReader->depth == $depth) {
                break;
            }

            if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                continue;
            }

            if ($oXmlReader->depth != $depth + 1) {
                continue;
            }

            if ($oXmlReader->localName == 'value') {
                $values[] = $oXmlReader->readString();
            }
        }
        return $values;
    }

    public const MAP_VALUES_AS_VALUES = 0;
    public const MAP_VALUES_AS_KEYS = 1;
    public const MAP_ONLY_VALUES = 2;

    /**
     * @param \XMLReader $xml
     * @param int        $extraction
     *
     * @return Array
     */
    public static function readOption($oXmlReader, $extraction = QgisProjectParser::MAP_VALUES_AS_VALUES)
    {
        $localName = 'Option';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'. $localName .'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $type = $oXmlReader->getAttribute('type');
        $name = $oXmlReader->getAttribute('name');
        $data = array();
        if (!$type && !$name) {
            return $data;
        }
        if ($type == 'Map' || $type == 'List' || $type == 'StringList') {
            if ($name == 'map') {
                $extraction = self::MAP_VALUES_AS_KEYS;
            }
            if ($type == 'StringList') {
                $extraction = self::MAP_ONLY_VALUES;
            }
            $options = array();
            while ($oXmlReader->read()) {
                if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                    && $oXmlReader->localName == $localName
                    && $oXmlReader->depth == $depth) {
                    break;
                }

                if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                    continue;
                }

                if ($oXmlReader->localName == $localName
                    && $oXmlReader->depth == $depth + 1) {
                    if ($extraction == self::MAP_ONLY_VALUES) {
                        $options = array_merge($options, self::readOption($oXmlReader, $extraction));
                    } else {
                        $options += self::readOption($oXmlReader, $extraction);
                    }
                }
            }
            if (!$name) {
                $data = $options;
            } else {
                $data[$name] = $options;
            }
        } else {
            $value = $oXmlReader->getAttribute('value');
            if ($type == 'bool'){
                $value = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            } else if ($type == 'int'){
                $value = (int) $value;
            }
            if ($extraction == self::MAP_ONLY_VALUES) {
                $data[] = $value;
            } else if ($extraction == self::MAP_VALUES_AS_KEYS) {
                $data[$value] = $name;
            } else if ($name) {
                $data[$name] = $value;
            } else {
                $data[] = $value;
            }
        }
        return $data;
    }
}
