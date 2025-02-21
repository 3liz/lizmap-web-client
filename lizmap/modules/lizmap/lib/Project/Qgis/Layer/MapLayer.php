<?php

/**
 * QGIS Map layer.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis\Layer;

use Lizmap\Project\Qgis;

/**
 * QGIS Map layer.
 *
 * @property string               $id
 * @property bool                 $embedded
 * @property string               $type
 * @property string               $layername
 * @property Qgis\SpatialRefSys   $srs
 * @property string               $datasource
 * @property string               $provider
 * @property MapLayerStyleManager $styleManager
 * @property null|string          $shortname
 * @property null|string          $title
 * @property null|string          $abstract
 * @property null|array<string>   $keywordList
 * @property float                $layerOpacity
 */
class MapLayer extends Qgis\BaseQgisXmlObject
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
        'layerOpacity',
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
     * Get map layer as key array.
     *
     * @return array
     */
    public function toKeyArray()
    {
        return array(
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
    }

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'maplayer';

    /** @var array<string> The XML element parsed children */
    protected static $children = array(
        'id',
        'layername',
        'shortname',
        'title',
        'abstract',
        'srs',
        'datasource',
        'provider',
        'keywordList',
        'previewExpression',
        'layerOpacity',
    );

    protected static $childParsers = array();

    protected static function getAttributes($oXmlReader)
    {
        // The maplayer can reference an embeded layer
        $embedded = filter_var($oXmlReader->getAttribute('embedded'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($embedded) {
            return array(
                'id' => $oXmlReader->getAttribute('id'),
                'embedded' => true,
                'project' => $oXmlReader->getAttribute('project'),
            );
        }

        return array(
            'type' => $oXmlReader->getAttribute('type'),
            'embedded' => false,
        );
    }

    /**
     * Build an instance with data as an array.
     *
     * @param array $data the instance data
     *
     * @return EmbeddedLayer|MapLayer|RasterLayer|VectorLayer the instance
     */
    protected static function buildInstance($data)
    {
        if (array_key_exists('embedded', $data)
            && $data['embedded']) {
            return new EmbeddedLayer($data);
        }
        if (array_key_exists('layerOpacity', $data)) {
            $data['layerOpacity'] = (float) $data['layerOpacity'];
        }
        if (array_key_exists('map-layer-style-manager', $data)) {
            $data['styleManager'] = $data['map-layer-style-manager'];
            unset($data['map-layer-style-manager']);
        }
        if (array_key_exists('renderer-v2', $data)) {
            $data['rendererV2'] = $data['renderer-v2'];
            unset($data['renderer-v2']);
        }
        if (array_key_exists('type', $data)
            && $data['type'] === 'vector') {
            return new VectorLayer($data);
        }
        if (array_key_exists('type', $data)
            && $data['type'] === 'raster') {
            return new RasterLayer($data);
        }

        return new MapLayer($data);
    }
}
MapLayer::registerChildParser('keywordList', function ($oXmlReader) {
    return Qgis\Parser::readValues($oXmlReader);
});
MapLayer::registerChildParser('srs', function ($oXmlReader) {
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
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
            break;
        }
    }

    return Qgis\SpatialRefSys::fromXmlReader($oXmlReader);
});
MapLayer::registerChildParser('map-layer-style-manager', function ($oXmlReader) {
    return MapLayerStyleManager::fromXmlReader($oXmlReader);
});
MapLayer::registerChildParser('fieldConfiguration', function ($oXmlReader) {
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
    }
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
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
            $data[] = VectorLayerField::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
MapLayer::registerChildParser('aliases', function ($oXmlReader) {
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
    }
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
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
            $data[] = VectorLayerAlias::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
MapLayer::registerChildParser('constraints', function ($oXmlReader) {
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
    }
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
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
            $data[] = VectorLayerConstraint::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
MapLayer::registerChildParser('constraintExpressions', function ($oXmlReader) {
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
    }
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
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
            $data[] = VectorLayerConstraintExpression::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
MapLayer::registerChildParser('defaults', function ($oXmlReader) {
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
    }
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
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
            $data[] = VectorLayerDefault::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
MapLayer::registerChildParser('editable', function ($oXmlReader) {
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
    }
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
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
            $data[] = VectorLayerEditableField::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
MapLayer::registerChildParser('vectorjoins', function ($oXmlReader) {
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
    }
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
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
            $data[] = VectorLayerJoin::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
MapLayer::registerChildParser('attributetableconfig', function ($oXmlReader) {
    return AttributeTableConfig::fromXmlReader($oXmlReader);
});
MapLayer::registerChildParser('excludeAttributesWFS', function ($oXmlReader) {
    return Qgis\Parser::readAttributes($oXmlReader);
});
MapLayer::registerChildParser('excludeAttributesWMS', function ($oXmlReader) {
    return Qgis\Parser::readAttributes($oXmlReader);
});
MapLayer::registerChildParser('renderer-v2', function ($oXmlReader) {
    return RendererV2::fromXmlReader($oXmlReader);
});
MapLayer::registerChildParser('pipe', function ($oXmlReader) {
    return RasterLayerPipe::fromXmlReader($oXmlReader);
});
