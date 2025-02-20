<?php

/**
 * QGIS Project.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis;

use Lizmap\App;
use Lizmap\Project;

/**
 * QGIS Project info class.
 *
 * @property string                                    $version
 * @property string                                    $projectname
 * @property string                                    $title
 * @property null|string                               $saveDateTime
 * @property SpatialRefSys                             $projectCrs
 * @property ProjectProperties                         $properties
 * @property LayerTreeRoot                             $layerTreeRoot
 * @property array<ProjectVisibilityPreset>            $visibilityPresets
 * @property array<ProjectRelation>                    $relations
 * @property array<Layer\EmbeddedLayer|Layer\MapLayer> $projectlayers
 * @property array<Layout\Layout>                      $Layouts
 */
class ProjectInfo extends BaseQgisXmlObject
{
    /** @var array<ProjectInfo> The instances created with ProjectInfo::fromQgisPath */
    protected static $instances = array();

    /**
     * Get a QGIS Project info instance from a QGIS Project path.
     *
     * @param string $qgisProjectPath A QGIS Project path
     *
     * @return ProjectInfo the QGIS project info instance corresponding to the path
     */
    public static function fromQgisPath($qgisProjectPath)
    {
        if (!file_exists($qgisProjectPath)) {
            throw new \Exception('The QGIS project '.basename($qgisProjectPath).' does not exist!');
        }

        $xmlFilePath = realpath($qgisProjectPath);
        if (array_key_exists($xmlFilePath, static::$instances)) {
            return static::$instances[$xmlFilePath];
        }
        $xmlReader = App\XmlTools::xmlReaderFromFile($qgisProjectPath);

        /** @var ProjectInfo $project */
        $project = static::fromXmlReader($xmlReader);
        static::$instances[$xmlFilePath] = $project;

        return $project;
    }

    /**
     * Get the QGIS project path if it has been created with ProjectInfo::fromQgisPath.
     *
     * @param ProjectInfo $qgisProject A QGIS Project info created with ProjectInfo::fromQgisPath
     *
     * @return null|string
     */
    public static function getQgisPath($qgisProject)
    {
        foreach (static::$instances as $path => $project) {
            if ($project === $qgisProject) {
                return $path;
            }
        }

        return null;
    }

    /** @var string The QGIS project path */
    protected $path;

    protected $properties = array(
        'version',
        'projectname',
        'saveDateTime',
        'title',
        'projectCrs',
        'properties',
        'layerTreeRoot',
        'visibilityPresets',
        'relations',
        'projectlayers',
        'Layouts',
    );

    protected $mandatoryProperties = array(
        'version',
        'projectname',
        'title',
        'projectCrs',
        'properties',
        'layerTreeRoot',
        'visibilityPresets',
        'relations',
        'projectlayers',
        'Layouts',
    );

    /** @var array The default values for properties */
    protected $defaultValues = array(
        'visibilityPresets' => array(),
        'relations' => array(),
        'projectlayers' => array(),
        'Layouts' => array(),
    );

    protected static $children = array(
        'title',
        'projectCrs',
        'properties',
    );

    protected static $mandatoryChildren = array(
        'title',
        'projectCrs',
        'properties',
    );

    /**
     * Get the project path if it has been created with ProjectInfo::fromQgisPath.
     *
     * @return null|string
     */
    public function getPath()
    {
        if ($this->path === null) {
            $this->path = ProjectInfo::getQgisPath($this);
        }

        return $this->path;
    }

    /**
     * Get the vWMS informations as key array.
     *
     * @return array<string, mixed>
     */
    public function getWmsInformationsAsKeyArray()
    {
        $prop = $this->__get('properties');

        return array(
            'WMSServiceTitle' => $prop->WMSServiceTitle,
            'WMSServiceAbstract' => $prop->WMSServiceAbstract,
            'WMSKeywordList' => is_array($prop->WMSKeywordList) ? implode(', ', $prop->WMSKeywordList) : '',
            'WMSExtent' => is_array($prop->WMSExtent) ? implode(', ', $prop->WMSExtent) : '',
            'ProjectCrs' => $this->projectCrs->authid,
            'WMSOnlineResource' => $prop->WMSOnlineResource,
            'WMSContactMail' => $prop->WMSContactMail,
            'WMSContactOrganization' => $prop->WMSContactOrganization,
            'WMSContactPerson' => $prop->WMSContactPerson,
            'WMSContactPhone' => $prop->WMSContactPhone,
        );
    }

    /**
     * Get the visibility presets as key array.
     *
     * @return array<string, array>
     */
    public function getVisibilityPresetsAsKeyArray()
    {
        $data = array();
        foreach ($this->visibilityPresets as $visibilityPreset) {
            $data[$visibilityPreset->name] = $visibilityPreset->toKeyArray();
        }

        return $data;
    }

    /**
     * Get proj as key array.
     *
     * @return array<string, string>
     */
    public function getProjAsKeyArray()
    {
        $data = array();
        $data[$this->projectCrs->authid] = $this->projectCrs->proj4;
        foreach ($this->projectlayers as $layer) {
            if ($layer->embedded) {
                try {
                    /** @var Layer\EmbeddedLayer $layer */
                    $embeddedLayer = $layer->getEmbeddedLayer($this->getPath());
                } catch (\Exception $e) {
                    continue;
                }
                $data[$embeddedLayer->srs->authid] = $embeddedLayer->srs->proj4;

                continue;
            }
            $data[$layer->srs->authid] = $layer->srs->proj4;
        }

        return $data;
    }

    /**
     * Get layer by Id.
     *
     * @param string $layerId The layer id
     *
     * @return null|Layer\MapLayer|Layer\RasterLayer|Layer\VectorLayer
     */
    public function getLayerById($layerId)
    {
        // Get layer by layerId
        $layers = array_values(
            array_filter($this->projectlayers, function ($player) use ($layerId) {
                return $player->id === $layerId;
            })
        );

        // The layerId is not known return null
        if (count($layers) == 0) {
            return null;
        }
        $layer = $layers[0];

        // The layer is embedded, get the layer from the embedded project
        if ($layer->embedded) {
            try {
                return $layer->getEmbeddedLayer($this->getPath());
            } catch (\Exception $e) {
                return null;
            }
        }

        // return the found layer
        return $layer;
    }

    /**
     * Get layers as key array.
     *
     * @return array
     */
    public function getLayersAsKeyArray()
    {
        $data = array();
        foreach ($this->projectlayers as $layer) {
            if ($layer->embedded) {
                try {
                    /** @var Layer\EmbeddedLayer $layer */
                    $embeddedLayer = $layer->getEmbeddedLayer($this->getPath());
                } catch (\Exception $e) {
                    continue;
                }
                $embeddedPath = $layer->getEmbeddedProjectFullPath($this->getPath());

                $layerKeyArray = $embeddedLayer->toKeyArray();
                $layerKeyArray['qgsmtime'] = filemtime($embeddedPath);
                $layerKeyArray['file'] = $embeddedPath;
                $layerKeyArray['embedded'] = $layer->embedded;
                $layerKeyArray['projectPath'] = $layer->project;
                $layerKeyArray[] = $layer->toKeyArray();
                $data[] = $layerKeyArray;

                continue;
            }
            $data[] = $layer->toKeyArray();
        }

        return $data;
    }

    /**
     * Get relations as key array.
     *
     * @return array<string, array>
     */
    public function getRelationsAsKeyArray()
    {
        $data = array();
        $pivotGather = array();
        $pivot = array();
        foreach ($this->relations as $relation) {
            // Get referenced layer
            $referencedLayer = $this->getLayerById($relation->referencedLayer);

            // Build relations key array
            if (!array_key_exists($relation->referencedLayer, $data)) {
                $data[$relation->referencedLayer] = array();
            }
            $previewField = $referencedLayer->getPreviewField();
            $data[$relation->referencedLayer][] = array(
                'referencingLayer' => $relation->referencingLayer,
                'referencedField' => $relation->referencedField,
                'referencingField' => $relation->referencingField,
                'previewField' => $previewField !== '' ? $previewField : $relation->referencedField,
                'relationName' => $relation->name,
                'relationId' => $relation->id,
            );

            // Collect pivot informations
            if (!array_key_exists($relation->referencingLayer, $pivotGather)) {
                $pivotGather[$relation->referencingLayer] = array();
            }
            $pivotGather[$relation->referencingLayer][$relation->referencedLayer] = $relation->referencingField;
        }

        // Keep only child with at least two parents
        foreach ($pivotGather as $pi => $vo) {
            if (count($vo) > 1) {
                $pivot[$pi] = $vo;
            }
        }
        $data['pivot'] = $pivot;

        return $data;
    }

    /**
     * Get relations as key array.
     *
     * @return array
     */
    public function getRelationFieldsAsKeyArray()
    {
        $data = array();
        foreach ($this->relations as $relation) {
            // Get referenced layer
            $referencedLayer = $this->getLayerById($relation->referencedLayer);
            $previewField = $referencedLayer->getPreviewField();
            $data[] = array(
                'id' => $relation->id,
                'layerName' => $referencedLayer->layername,
                'typeName' => $referencedLayer->shortname !== null ? $referencedLayer->shortname : str_replace(' ', '_', $referencedLayer->layername),
                'propertyName' => $previewField !== '' ? $relation->referencedField.','.$previewField : $relation->referencedField,
                'filterExpression' => '',
                'referencedField' => $relation->referencedField,
                'referencingField' => $relation->referencingField,
                'previewField' => $previewField,
            );
        }

        return $data;
    }

    /**
     * Get layouts as key array.
     *
     * @return array
     */
    public function getLayoutsAsKeyArray()
    {
        $data = array();
        // get restricted composers
        $rComposers = array();
        if ($this->__get('properties')->WMSRestrictedComposers !== null) {
            $rComposers = $this->__get('properties')->WMSRestrictedComposers;
        }
        foreach ($this->Layouts as $layout) {
            // test restriction
            if (in_array($layout->name, $rComposers)) {
                continue;
            }
            // get page element
            if (!$layout->PageCollection) {
                continue;
            }
            $page = $layout->PageCollection[0];

            // init print template element
            $printTemplate = array(
                'title' => $layout->name,
                'width' => $page->width,
                'height' => $page->height,
                'maps' => array(),
                'labels' => array(),
            );

            // store mapping between uuid and id
            $mapUuidId = array();
            foreach ($layout->Items as $item) {
                if ($item->type == 65639) {
                    // Build map
                    $map = array(
                        'id' => 'map'.(string) count($printTemplate['maps']),
                        'uuid' => $item->uuid,
                        'width' => $item->width,
                        'height' => $item->height,
                        'grid' => $item->grid,
                        'overviewMap' => $item->overviewMap,
                    );

                    // store mapping between uuid and id
                    $mapUuidId[$map['uuid']] = $map['id'];

                    // store map info
                    $printTemplate['maps'][] = $map;
                } elseif ($item->type == 65641) {
                    // Check the label item has an id
                    // if not continue
                    if ($item->id == '') {
                        continue;
                    }

                    // store label info
                    $printTemplate['labels'][] = array(
                        'id' => $item->id,
                        'htmlState' => $item->htmlState,
                        'text' => $item->text,
                    );
                }
            }
            // Modifying overviewMap to id instead of uuid and remove null
            foreach ($printTemplate['maps'] as $ptMap) {
                if (!array_key_exists($ptMap['overviewMap'], $mapUuidId)) {
                    unset($ptMap['overviewMap']);

                    continue;
                }
                $ptMap['overviewMap'] = $mapUuidId[$ptMap['overviewMap']];
            }

            // Atlas
            if ($layout->Atlas) {
                $printTemplate['atlas'] = $layout->Atlas;
            }

            $data[] = $printTemplate;
        }

        return $data;
    }

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'qgis';

    /**
     * Get attributes from an XMLReader instance at an element.
     *
     * @param \XMLReader $oXmlReader An XMLReader instance at an element
     *
     * @return array{'version': string, 'projectname': string} the element attributes as keys / values
     */
    protected static function getAttributes($oXmlReader)
    {
        return array(
            'version' => $oXmlReader->getAttribute('version'),
            'projectname' => $oXmlReader->getAttribute('projectname'),
            'saveDateTime' => $oXmlReader->getAttribute('saveDateTime'),
        );
    }

    protected static $childParsers = array();

    /**
     * Build an instance with data as an array.
     *
     * @param array $data the instance data
     *
     * @return ProjectInfo the instance
     */
    protected static function buildInstance($data)
    {
        if (array_key_exists('layer-tree-group', $data)) {
            $data['layerTreeRoot'] = $data['layer-tree-group'];
            unset($data['layer-tree-group']);
        }
        if (array_key_exists('visibility-presets', $data)) {
            $data['visibilityPresets'] = $data['visibility-presets'];
            unset($data['visibility-presets']);
        }

        return new ProjectInfo($data);
    }
}

ProjectInfo::registerChildParser('title', function ($oXmlReader) {
    return $oXmlReader->readString();
});
ProjectInfo::registerChildParser('projectCrs', function ($oXmlReader) {
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
    if ($oXmlReader->isEmptyElement) {
        return null;
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

        if ($oXmlReader->localName == 'spatialrefsys') {
            break;
        }
    }

    return SpatialRefSys::fromXmlReader($oXmlReader);
});
ProjectInfo::registerChildParser('properties', function ($oXmlReader) {
    return ProjectProperties::fromXmlReader($oXmlReader);
});
ProjectInfo::registerChildParser('layer-tree-group', function ($oXmlReader) {
    return LayerTreeRoot::fromXmlReader($oXmlReader);
});
ProjectInfo::registerChildParser('visibility-presets', function ($oXmlReader) {
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
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

        if ($oXmlReader->localName == 'visibility-preset') {
            $data[] = ProjectVisibilityPreset::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
ProjectInfo::registerChildParser('relations', function ($oXmlReader) {
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
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

        if ($oXmlReader->localName == 'relation') {
            $data[] = ProjectRelation::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
ProjectInfo::registerChildParser('projectlayers', function ($oXmlReader) {
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
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

        if ($oXmlReader->localName == 'maplayer') {
            $data[] = Layer\MapLayer::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
ProjectInfo::registerChildParser('Layouts', function ($oXmlReader) {
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
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

        if ($oXmlReader->localName == 'Layout') {
            $data[] = Layout\Layout::fromXmlReader($oXmlReader);
        }
    }

    return $data;
});
