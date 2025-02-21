<?php

/**
 * Manage and give access to qgis project.
 *
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project;

use Lizmap\App;
use Lizmap\Form;

/**
 * @phpstan-type MapLayerDef array{
 *  type: string,
 *  id: string,
 *  name: string,
 *  shortname: string,
 *  title: string,
 *  abstract: string,
 *  proj4: string,
 *  srid: int,
 *  authid: int,
 *  datasource: string,
 *  provider: string,
 *  keywords: array<string>,
 *  qgsmtime?: int,
 *  file?: string,
 *  embedded?: int,
 *  projectPath?: string
 * }
 * @phpstan-type VectorLayerDef array{
 *  type: string,
 *  id: string,
 *  name: string,
 *  shortname: string,
 *  title: string,
 *  abstract: string,
 *  proj4: string,
 *  srid: int,
 *  authid: int,
 *  datasource: string,
 *  provider: string,
 *  keywords: array<string>,
 *  fields: array,
 *  aliases: array,
 *  defaults: array,
 *  constraints: array,
 *  wfsFields: array,
 *  webDavFields: array,
 *  webDavBaseUris: array,
 *  qgsmtime?: int,
 *  file?: string,
 *  embedded?: int,
 *  projectPath?: string
 * }
 */
class QgisProject
{
    /**
     * @var string QGIS project path
     */
    protected $path;

    /**
     * @var \SimpleXMLElement QGIS project XML
     */
    protected $xml;

    /**
     * @var array QGIS project data
     */
    protected $data = array();

    /**
     * Version of QGIS which wrote the project.
     *
     * @var int
     */
    protected $qgisProjectVersion;

    /**
     * Last saved date time in the QGIS file.
     *
     * @var string the last saved date contained in the QGS file
     */
    protected $lastSaveDateTime;

    /**
     * @var array<string, mixed> contains WMS info
     */
    protected $WMSInformation;

    /**
     * @var string
     */
    protected $canvasColor = '';

    /**
     * @var array<string, string> authid => proj4
     */
    protected $allProj4 = array();

    /**
     * @var array<string, array> for each referenced layer, there is an item
     *                           with referencingLayer, referencedField, referencingField keys.
     *                           There is also a 'pivot' key
     */
    protected $relations = array();

    /**
     * @var array list of fields properties for each relation
     */
    protected $relationsFields = array();

    /**
     * @var array<string, array> list of themes
     */
    protected $themes = array();

    /**
     * @var bool
     */
    protected $useLayerIDs = false;

    /**
     * @var array[] list of layers. Each item is a list of layer properties
     */
    protected $layers = array();

    /**
     * @var array list of custom project variables defined by user in project
     */
    protected $customProjectVariables = array();

    /**
     * @var \lizmapServices
     */
    protected $services;

    /**
     * @var array List of cached properties
     */
    protected static $cachedProperties = array(
        'WMSInformation',
        'canvasColor',
        'allProj4',
        'relations',
        'relationsFields',
        'themes',
        'useLayerIDs',
        'layers',
        'data',
        'qgisProjectVersion',
        'lastSaveDateTime',
        'customProjectVariables',
    );

    /**
     * @var array List of embedded projects
     */
    protected $qgisEmbeddedProjects = array();

    /**
     * @var App\AppContextInterface
     */
    protected $appContext;

    /**
     * constructor.
     *
     * @param string                  $file       the QGIS project path
     * @param \lizmapServices         $services
     * @param App\AppContextInterface $appContext
     * @param mixed                   $data
     */
    public function __construct($file, $services, $appContext, $data = false)
    {
        $this->appContext = $appContext;
        $this->services = $services;
        $this->path = $file;

        if ($data === false) {
            // FIXME reading XML could take time, so many process could
            // read it and construct the cache at the same time. We should
            // have a kind of lock to avoid this issue.
            $this->readXmlProject($file);
        } else {
            foreach (self::$cachedProperties as $prop) {
                if (array_key_exists($prop, $data)) {
                    $this->{$prop} = $data[$prop];
                }
            }
        }
    }

    public function getCacheData()
    {
        $data = array();
        foreach (self::$cachedProperties as $prop) {
            if (!isset($this->{$prop}) || isset($data[$prop])) {
                continue;
            }
            $data[$prop] = $this->{$prop};
        }

        return $data;
    }

    /**
     * @deprecated
     *
     * @param string $key
     *
     * @return null|mixed
     */
    public function getData($key)
    {
        if (!array_key_exists($key, $this->data)) {
            return null;
        }

        return $this->data[$key];
    }

    /**
     * Get the project title.
     *
     * @return string the project title
     */
    public function getTitle()
    {
        return $this->getData('title');
    }

    /**
     * Get the project abstract.
     *
     * @return string the project abstract
     */
    public function getAbstract()
    {
        return $this->getData('abstract');
    }

    /**
     * List of keywords.
     *
     * @return array
     */
    public function getKeywordList()
    {
        return $this->getData('keywordList');
    }

    /**
     * WMS Max Width.
     *
     * @return int
     */
    public function getWMSMaxWidth()
    {
        return $this->getData('wmsMaxWidth');
    }

    /**
     * WMS Max Height.
     *
     * @return int
     */
    public function getWMSMaxHeight()
    {
        return $this->getData('wmsMaxHeight');
    }

    public function getQgisProjectVersion()
    {
        return $this->qgisProjectVersion;
    }

    /**
     * Last saved date time in the QGIS file.
     *
     * @return string the last saved date contained in the QGS file
     */
    public function getLastSaveDateTime()
    {
        return $this->lastSaveDateTime;
    }

    /**
     * WMS informations.
     *
     * @return array<string, mixed>
     */
    public function getWMSInformation()
    {
        return $this->WMSInformation;
    }

    public function getCanvasColor()
    {
        return $this->canvasColor;
    }

    /**
     * Proj4 string for proj Auth Id if is known by the project.
     *
     * @param string $authId
     *
     * @return null|string
     */
    public function getProj4($authId)
    {
        if (!array_key_exists($authId, $this->allProj4)) {
            return null;
        }

        return $this->allProj4[$authId];
    }

    /**
     * All proj4.
     *
     * @return array<string, string>
     */
    public function getAllProj4()
    {
        return $this->allProj4;
    }

    /**
     * Relations.
     *
     * @return array<string, array>
     */
    public function getRelations()
    {
        return $this->relations;
    }

    /**
     * Themes of the QGIS project.
     *
     * @return array<string, array>
     */
    public function getThemes()
    {
        return $this->themes;
    }

    public function getCustomProjectVariables()
    {
        return $this->customProjectVariables;
    }

    /**
     * @return bool
     */
    public function isUsingLayerIDs()
    {
        return $this->useLayerIDs;
    }

    public function setPropertiesAfterRead(ProjectConfig $cfg)
    {
        $this->setShortNames($cfg);
        $this->setLayerOpacity($cfg);
        $this->setLayerGroupData($cfg);
        $this->setLayerShowFeatureCount($cfg);
        $this->unsetPropAfterRead($cfg);
    }

    /**
     * Set layers' shortname with XML data.
     */
    protected function setShortNames(ProjectConfig $cfg)
    {
        if (!$this->path) {
            return;
        }

        $project = Qgis\ProjectInfo::fromQgisPath($this->path);
        foreach ($project->projectlayers as $layer) {
            if (!isset($layer->shortname)) {
                continue;
            }
            $layerCfg = $cfg->getLayer($layer->layername);
            if ($layerCfg) {
                $layerCfg->shortname = $layer->shortname;
            }
        }
    }

    /**
     * Set layers' opacity with XML data.
     */
    protected function setLayerOpacity(ProjectConfig $cfg)
    {
        if (!$this->path) {
            return;
        }

        $project = Qgis\ProjectInfo::fromQgisPath($this->path);
        foreach ($project->projectlayers as $layer) {
            $layername = '';
            $opacity = 1;

            /** @var Qgis\Layer\MapLayer $layer */
            if ($layer->embedded) {
                try {
                    /** @var Qgis\Layer\EmbeddedLayer $layer */
                    $embeddedLayer = $layer->getEmbeddedLayer($this->path);
                } catch (\Exception $e) {
                    continue;
                }
                $layername = $embeddedLayer->layername;
                $opacity = $embeddedLayer->getLayerOpacity();
            } else {
                $layername = $layer->layername;
                $opacity = $layer->getLayerOpacity();
            }
            if ($layername == '' || $opacity == 1) {
                continue;
            }
            $layerCfg = $cfg->getLayer($layername);
            if ($layerCfg) {
                $layerCfg->opacity = $opacity;
            }
        }
    }

    /**
     * Set layers' group infos.
     */
    protected function setLayerGroupData(ProjectConfig $cfg)
    {
        if (!$this->path) {
            return;
        }

        $project = Qgis\ProjectInfo::fromQgisPath($this->path);
        $groupShortNames = $project->layerTreeRoot->getGroupShortNames();
        foreach ($groupShortNames as $name => $shortName) {
            $layerCfg = $cfg->getLayer($name);
            if (!$layerCfg) {
                continue;
            }
            $layerCfg->shortname = $shortName;
        }
        $groupsMutuallyExclusive = $project->layerTreeRoot->getGroupsMutuallyExclusive();
        foreach ($groupsMutuallyExclusive as $group) {
            $layerCfg = $cfg->getLayer($group);
            if (!$layerCfg) {
                continue;
            }
            $layerCfg->mutuallyExclusive = 'True';
        }
    }

    /**
     * Set layers' last infos.
     */
    protected function setLayerShowFeatureCount(ProjectConfig $cfg)
    {
        if (!$this->path) {
            return;
        }

        $project = Qgis\ProjectInfo::fromQgisPath($this->path);
        $layersShowFeatureCount = $project->layerTreeRoot->getLayersShowFeatureCount();
        foreach ($layersShowFeatureCount as $layer) {
            $layerCfg = $cfg->getLayer($layer);
            if (!$layerCfg) {
                continue;
            }
            $layerCfg->showFeatureCount = 'True';
        }
    }

    /**
     * Set/Unset some properties after reading the config file.
     */
    protected function unsetPropAfterRead(ProjectConfig $cfg)
    {
        // remove plugin layer
        if ($this->path) {
            $project = Qgis\ProjectInfo::fromQgisPath($this->path);
            foreach ($project->projectlayers as $layer) {
                if ($layer->type === 'plugin') {
                    $cfg->removeLayer($layer->layername);
                }
            }
        }

        // unset cache for editionLayers
        $eLayers = $cfg->getEditionLayers();
        foreach ($eLayers as $key => $obj) {
            $layerCfg = $cfg->getLayer($key);
            if ($layerCfg) {
                $layerCfg->cached = 'False';
                $layerCfg->clientCacheExpiration = 0;
                if (property_exists($layerCfg, 'cacheExpiration')) {
                    unset($layerCfg->cacheExpiration);
                }
            }
        }

        // unset cache for loginFilteredLayers
        $loginFiltered = $cfg->getLoginFilteredLayers();
        foreach ($loginFiltered as $key => $obj) {
            $layerCfg = $cfg->getLayer($key);
            if ($layerCfg) {
                $layerCfg->cached = 'False';
                $layerCfg->clientCacheExpiration = 0;
                if (property_exists($layerCfg, 'cacheExpiration')) {
                    unset($layerCfg->cacheExpiration);
                }
            }
        }

        // unset displayInLegend for geometryType none or unknown
        $layers = $cfg->getLayers();
        foreach ($layers as $layerCfg) {
            if (property_exists($layerCfg, 'geometryType')
                && ($layerCfg->geometryType == 'none'
                    || $layerCfg->geometryType == 'unknown')
            ) {
                $layerCfg->displayInLegend = 'False';
            }
        }

        // Override the dataviz HTML template if a Drag & Drop template
        // has been written
        $cfg->setDatavizTemplateFromDragAndDropLayout($this->services->debugMode == '1');
    }

    /**
     * @param string $layerId
     *
     * @return null|MapLayerDef|VectorLayerDef
     */
    public function getLayerDefinition($layerId)
    {
        $layers = array_filter($this->layers, function ($layer) use ($layerId) {
            return $layer['id'] == $layerId;
        });
        if (count($layers)) {
            // get first key found in the filtered layers
            $k = key($layers);

            return $layers[$k];
        }

        return null;
    }

    /**
     * @param string  $layerId
     * @param Project $proj
     *
     * @return null|\qgisMapLayer|\qgisVectorLayer
     */
    public function getLayer($layerId, $proj)
    {
        /** @var array[] $layersFiltered */
        $layersFiltered = array_filter($this->layers, function ($layer) use ($layerId) {
            return $layer['id'] == $layerId;
        });
        if (count($layersFiltered)) {
            // get first key found in the filtered layers
            $k = key($layersFiltered);
            if ($this->layers[$k]['type'] == 'vector') {
                return new \qgisVectorLayer($proj, $this->layers[$k]);
            }

            return new \qgisMapLayer($proj, $this->layers[$k]);
        }

        return null;
    }

    /**
     * @param string  $key
     * @param Project $proj
     *
     * @return null|\qgisMapLayer|\qgisVectorLayer
     */
    public function getLayerByKeyword($key, $proj)
    {
        /** @var array[] $layers */
        $layers = array_filter($this->layers, function ($layer) use ($key) {
            return in_array($key, $layer['keywords']);
        });
        if (count($layers)) {
            // get first key found in the filtered layers
            $k = key($layers);
            if ($layers[$k]['type'] == 'vector') {
                return new \qgisVectorLayer($proj, $layers[$k]);
            }

            return new \qgisMapLayer($proj, $layers[$k]);
        }

        return null;
    }

    /**
     * @param string  $key
     * @param Project $proj
     *
     * @return \qgisMapLayer[]|\qgisVectorLayer[]
     */
    public function findLayersByKeyword($key, $proj)
    {
        /** @var array[] $foundLayers */
        $foundLayers = array_filter($this->layers, function ($layer) use ($key) {
            return in_array($key, $layer['keywords']);
        });
        $layers = array();
        if ($foundLayers) {
            foreach ($foundLayers as $layer) {
                if ($layer['type'] == 'vector') {
                    $layers[] = new \qgisVectorLayer($proj, $layer);
                } else {
                    $layers[] = new \qgisMapLayer($proj, $layer);
                }
            }
        }

        return $layers;
    }

    /**
     * Execute an xpath Query on the XML content and return the result.
     *
     * @param string $query The query to execute
     *
     * @return array
     */
    public function xpathQuery($query)
    {
        $ret = $this->getXml()->xpath($query);
        if ($ret && is_array($ret)) {
            return $ret;
        }

        return array();
    }

    /**
     * @FIXME: remove this method. Be sure it is not used in other projects.
     * Data provided by the returned xml element should be extracted and encapsulated
     * into an object. Xml should not be used by callers
     *
     * @deprecated
     *
     * @param mixed $layerId
     *
     * @return \SimpleXMLElement[]
     */
    public function getXmlLayer($layerId)
    {
        $layer = $this->getLayerDefinition($layerId);
        if ($layer && array_key_exists('embedded', $layer) && $layer['embedded'] == 1) {
            // avoid reloading the same qgis project multiple times while reading relations by checking embeddedRelationsProjects param
            // If this array is null or does not contains the corresponding qgis project, then the function if forced to load a new qgis project
            if (array_key_exists($layer['projectPath'], $this->qgisEmbeddedProjects)) {
                // use QgisProject instance already created
                $qgsProj = $this->qgisEmbeddedProjects[$layer['projectPath']];
            } else {
                // create new QgisProject instance
                $qgsProj = new QgisProject(realpath(dirname($this->path).DIRECTORY_SEPARATOR.$layer['projectPath']), $this->services, $this->appContext);
                // update the array, if exists
                $this->qgisEmbeddedProjects[$layer['projectPath']] = $qgsProj;
            }

            return $qgsProj->getXml()->xpath("//maplayer[id='{$layerId}']");
        }

        return $this->getXml()->xpath("//maplayer[id='{$layerId}']");
    }

    /**
     * temporary function to read xml for some methods that relies on
     * xml data that are not yet stored in the cache.
     *
     * @return \SimpleXMLElement
     *
     * @deprecated
     */
    protected function getXml()
    {
        if ($this->xml !== null) {
            return $this->xml;
        }
        $qgs_path = $this->path;
        if (!file_exists($qgs_path)) {
            throw new \Exception('The QGIS project '.$qgs_path.' does not exist!');
        }

        $xml = App\XmlTools::xmlFromFile($qgs_path);
        if (!is_object($xml)) {
            $errormsg = '\n'.basename($qgs_path).'\n'.$xml;
            $errormsg = 'An error has been raised when loading QGIS Project:'.$errormsg;
            \jLog::log($errormsg, 'lizmapadmin');

            throw new \Exception('The QGIS project '.basename($qgs_path).' has invalid content!');
        }

        $this->xml = $xml;

        return $xml;
    }

    /**
     * @param \SimpleXMLElement $xml
     * @param string            $layerId
     *
     * @return null|\SimpleXMLElement
     *
     * @deprecated
     */
    protected function getXmlLayer2($xml, $layerId)
    {
        $layerList = $xml->xpath('//maplayer');
        foreach ($layerList as $layer) {
            if ((string) $layer->id === $layerId) {
                return $layer;
            }
        }

        return null;
    }

    /**
     * @param string $layerId
     * @param object $layers
     *
     * @return null|string
     */
    public function getLayerNameByIdFromConfig($layerId, $layers)
    {
        $name = null;
        foreach ($layers as $name => $props) {
            if ($props->id == $layerId) {
                return $name;
            }
        }

        return $name;
    }

    /**
     * @return array
     */
    public function getPrintTemplates()
    {
        if (!$this->path) {
            return array();
        }

        $project = Qgis\ProjectInfo::fromQgisPath($this->path);

        return $project->getLayoutsAsKeyArray();
    }

    /**
     * @param object $locateByLayer
     */
    public function readLocateByLayer($locateByLayer)
    {
        if (!$this->path) {
            return;
        }

        // collect layerIds
        $locateLayerIds = array();
        foreach ($locateByLayer as $k => $v) {
            $locateLayerIds[] = $v->layerId;
        }

        // update locateByLayer with project from path
        $project = Qgis\ProjectInfo::fromQgisPath($this->path);

        // update locateByLayer with alias and filter information
        foreach ($locateByLayer as $k => $v) {
            $updateLocate = false;
            $layer = $project->getLayerById($v->layerId);
            // Get field alias
            $alias = $layer->getFieldAlias($v->fieldName);
            if ($alias !== null) {
                // Update locate with field alias
                $v->fieldAlias = $alias;
                $updateLocate = true;
            }
            if (property_exists($v, 'filterFieldName')) {
                // Get filter field alias
                $filterAlias = $layer->getFieldAlias($v->filterFieldName);
                if ($filterAlias !== null) {
                    // Update locate with filter field alias
                    $v->filterFieldAlias = $filterAlias;
                    $updateLocate = true;
                }
            }
            // Get joins
            if ($layer->vectorjoins !== null && count($layer->vectorjoins) > 0) {
                if (!property_exists($v, 'vectorjoins')) {
                    // Add joins to locate
                    $v->vectorjoins = array();
                    $updateLocate = true;
                }
                foreach ($layer->vectorjoins as $vectorjoin) {
                    if (in_array($vectorjoin->joinLayerId, $locateLayerIds)) {
                        // Add join info to locate
                        $v->vectorjoins[] = (object) array(
                            'joinFieldName' => $vectorjoin->joinFieldName,
                            'targetFieldName' => $vectorjoin->targetFieldName,
                            'joinLayerId' => $vectorjoin->joinLayerId,
                        );
                        $updateLocate = true;
                    }
                }
            }
            if ($updateLocate) {
                // Update locate if needed
                $locateByLayer->{$k} = $v;
            }
        }
    }

    /**
     * @param object $editionLayers
     */
    public function readEditionLayers($editionLayers)
    {
        if (!$this->path) {
            return;
        }

        $project = Qgis\ProjectInfo::fromQgisPath($this->path);
        foreach ($editionLayers as $key => $obj) {
            // Improve performance by getting provider directly from config
            // Available for lizmap plugin >= 3.3.2
            if (property_exists($obj, 'provider')) {
                if ($obj->provider == 'spatialite') {
                    unset($editionLayers->{$key});
                }

                continue;
            }
            // check for embedded layers
            $layer = $project->getLayerById($obj->layerId);
            if ($layer->provider == 'spatialite') {
                unset($editionLayers->{$key});
            }
        }
    }

    /**
     * @param object       $editionLayers
     * @param null|Project $proj
     */
    public function readEditionForms($editionLayers, $proj = null)
    {
        if (!$this->path) {
            return;
        }

        $project = Qgis\ProjectInfo::fromQgisPath($this->path);
        foreach ($editionLayers as $obj) {
            $layer = $project->getLayerById($obj->layerId);
            if ($layer === null) {
                continue;
            }
            if ($layer->type !== 'vector') {
                continue;
            }

            /** @var Qgis\Layer\VectorLayer $layer */
            $formControls = $proj->getCacheHandler()->getEditableLayerFormCache($obj->layerId);
            if (!$formControls && $proj) {
                $proj->getCacheHandler()->setEditableLayerFormCache($obj->layerId, $layer->getFormControls());
            }
        }
    }

    /**
     * @param string $layer
     *
     * @return null|QgisProject
     */
    public function getEmbeddedQgisProject($layer)
    {
        $qgisProject = null;
        $layerDefinition = $this->getLayerDefinition($layer);
        if ($layerDefinition && array_key_exists('embedded', $layerDefinition) && $layerDefinition['embedded'] == 1) {
            if (array_key_exists($layerDefinition['projectPath'], $this->qgisEmbeddedProjects)) {
                // use QgisProject instance already created
                $qgisProject = $this->qgisEmbeddedProjects[$layerDefinition['projectPath']];
            } else {
                // create new QgisProject instance or retreive it from cache, if any
                $path = realpath(dirname($this->path).DIRECTORY_SEPARATOR.$layerDefinition['projectPath']);
                $qgsMtime = filemtime($path);
                $qgsCfgMtime = filemtime($path.'.cfg');
                $cacheHandler = new ProjectCache($path, $qgsMtime, $qgsCfgMtime, $this->appContext);
                $data = $cacheHandler->retrieveProjectData();

                if ($data) {
                    $qgisProject = new QgisProject($path, $this->services, $this->appContext, $data['qgis']);
                } else {
                    $qgisProject = new QgisProject($path, $this->services, $this->appContext);
                }

                $this->qgisEmbeddedProjects[$layerDefinition['projectPath']] = $qgisProject;
            }
        }

        return $qgisProject;
    }

    /**
     * Read the layer QGIS form configuration for the layers
     * used in attribute tables, form filter & dataviz,
     * and get the configuration for the fields for which to display
     * labels instead of codes.
     *
     * This concerns fields with ValueMap, ValueRelation & RelationReference config
     *
     * @param array        $layerIds List of layer identifiers
     * @param null|Project $proj
     */
    public function readLayersLabeledFieldsConfig($layerIds, $proj = null)
    {
        // Get QGIS form fields configurations for each layer
        $layersLabeledFieldsConfig = array();

        if (!$this->path) {
            return $layersLabeledFieldsConfig;
        }

        $project = Qgis\ProjectInfo::fromQgisPath($this->path);
        foreach ($layerIds as $layerId) {
            $layer = $project->getLayerById($layerId);
            if ($layer === null) {
                continue;
            }
            if ($layer->type !== 'vector') {
                continue;
            }

            /** @var Qgis\Layer\VectorLayer $layer */
            $formControls = array();
            if ($proj) {
                $formControls = $proj->getCacheHandler()->getEditableLayerFormCache($layerId);
            }
            if (!$formControls) {
                $formControls = $layer->getFormControls();
            }

            $fields_config = array();
            foreach ($formControls as $fieldName => $control) {
                $editType = $control->getFieldEditType();
                if (!in_array($editType, array('ValueMap', 'ValueRelation', 'RelationReference'))) {
                    continue;
                }
                $fields_config[$fieldName] = array(
                    'type' => $editType,
                );
                if ($editType == 'ValueMap') {
                    $valueMap = $control->getValueMap();
                    if ($valueMap) {
                        $fields_config[$fieldName]['data'] = $valueMap;
                    }
                } elseif ($editType == 'ValueRelation') {
                    $valueRelationData = $control->getValueRelationData();
                    $fields_config[$fieldName]['source_layer_id'] = $valueRelationData['layer'];
                    $fields_config[$fieldName]['source_layer'] = $valueRelationData['layerName'];
                    $fields_config[$fieldName]['code_field'] = $valueRelationData['key'];
                    $fields_config[$fieldName]['label_field'] = $valueRelationData['value'];
                    $fields_config[$fieldName]['exp_filter'] = $valueRelationData['filterExpression'];
                } else {
                    // RelationReference
                    // We need to get the relation properties
                    $relationReferenceData = $control->getRelationReference();
                    $relation = $relationReferenceData['relation'];
                    $referencedLayerId = $relationReferenceData['referencedLayerId'];
                    if (!array_key_exists($referencedLayerId, $this->relations)) {
                        continue;
                    }
                    $fields_config[$fieldName]['relation'] = $relation;
                    $fields_config[$fieldName]['source_layer_id'] = $referencedLayerId;
                    $fields_config[$fieldName]['source_layer'] = $relationReferenceData['referencedLayerName'];
                    $fields_config[$fieldName]['code_field'] = $this->relations[$referencedLayerId][0]['referencedField'];
                    $fields_config[$fieldName]['label_field'] = $this->relations[$referencedLayerId][0]['previewField'];
                    $fields_config[$fieldName]['exp_filter'] = $relationReferenceData['filterExpression'];
                }
            }
            $layersLabeledFieldsConfig[$layer->layername] = $fields_config;
        }

        return $layersLabeledFieldsConfig;
    }

    /**
     * @param object $attributeLayers
     */
    public function readAttributeLayers($attributeLayers)
    {
        if (!$this->path) {
            return;
        }

        $project = Qgis\ProjectInfo::fromQgisPath($this->path);
        // Get field order & visibility
        foreach ($attributeLayers as $obj) {
            // Improve performance by getting custom_config status directly from config
            // Available for lizmap plugin >= 3.3.3
            if (property_exists($obj, 'custom_config') && $obj->custom_config != 'True') {
                continue;
            }

            $layer = $project->getLayerById($obj->layerId);
            $obj->attributetableconfig = $layer->attributetableconfig->toKeyArray();
        }
    }

    /**
     * @param mixed $layers
     *
     * @return int[]
     */
    public function readLayersOrder($layers)
    {
        $layersOrder = array();
        if (!$this->path) {
            return $layersOrder;
        }

        $project = Qgis\ProjectInfo::fromQgisPath($this->path);
        $customOrder = $project->layerTreeRoot->customOrder;
        if (!$customOrder->enabled) {
            return $layersOrder;
        }
        $lo = 0;
        foreach ($customOrder->items as $layerI) {
            // Get layer name from config instead of XML for possible embedded layers
            $name = $this->getLayerNameByIdFromConfig($layerI, $layers);
            if ($name) {
                $layersOrder[$name] = $lo;
            }
            ++$lo;
        }

        return $layersOrder;
    }

    /**
     * Read the qgis files.
     *
     * @param mixed $qgs_path
     */
    protected function readXmlProject($qgs_path)
    {
        if (!file_exists($qgs_path)) {
            throw new \Exception('The QGIS project '.basename($qgs_path).' does not exist!');
        }

        $project = Qgis\ProjectInfo::fromQgisPath($qgs_path);

        // Build data
        $this->data = array(
            'title' => $project->properties->WMSServiceTitle,
            'abstract' => $project->properties->WMSServiceAbstract,
            'keywordList' => is_array($project->properties->WMSKeywordList) ? implode(', ', $project->properties->WMSKeywordList) : '',
            'wmsMaxWidth' => $project->properties->WMSMaxWidth,
            'wmsMaxHeight' => $project->properties->WMSMaxHeight,
        );

        // get QGIS project version
        $this->qgisProjectVersion = $this->convertQgisProjectVersion($project->version);
        $this->lastSaveDateTime = $project->saveDateTime;

        $this->WMSInformation = $project->getWmsInformationsAsKeyArray();
        $this->canvasColor = $project->properties->Gui->getCanvasColor();
        $this->allProj4 = $project->getProjAsKeyArray();
        $this->themes = $project->getVisibilityPresetsAsKeyArray();
        $this->customProjectVariables = $project->properties->Variables !== null ? $project->properties->Variables->getVariablesAsKeyArray() : array();
        $this->useLayerIDs = $project->properties->WMSUseLayerIDs !== null ? $project->properties->WMSUseLayerIDs : false;
        $this->layers = $project->getLayersAsKeyArray();
        $this->relations = $project->getRelationsAsKeyArray();
        $this->relationsFields = $project->getRelationFieldsAsKeyArray();
    }

    /**
     * @param string $version
     *
     * @return int
     */
    protected function convertQgisProjectVersion($version)
    {
        $version = explode('-', $version);
        $version = $version[0];
        $version = explode('.', $version);
        $a = '';
        foreach ($version as $k) {
            if (strlen($k) == 1) {
                $a .= '0'.$k;
            } else {
                $a .= $k;
            }
        }

        return (int) $a;
    }

    public function getRelationField($relationId)
    {
        $fields = array_filter($this->relationsFields, function ($rf) use ($relationId) {
            return $rf['id'] == $relationId;
        });
        if (count($fields)) {
            // get first key found in the filtered layers
            $k = key($fields);

            return $fields[$k];
        }

        return null;
    }

    /**
     * @deprecated 3.9.0 No longer used by internal code and not recommended.
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
     *
     * @deprecated 3.9.0 No longer used by internal code and not recommended.
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

    public const MAP_VALUES_AS_VALUES = 0;
    public const MAP_VALUES_AS_KEYS = 1;
    public const MAP_ONLY_VALUES = 2;

    /**
     * @param \SimpleXMLElement $optionList
     * @param int               $valuesExtraction one of MAP_* const
     *
     * @return array
     *
     * @deprecated 3.9.0 No longer used by internal code and not recommended.
     */
    protected function getValuesFromOptions($optionList, $valuesExtraction = 0)
    {
        $values = array();

        foreach ($optionList->Option as $v) {
            // converting values based on type
            $value = $this->convertValueOptions((string) $v->attributes()->value, (string) $v->attributes()->type);

            if ($valuesExtraction == self::MAP_ONLY_VALUES) {
                $values[] = $value;
            } elseif ($valuesExtraction == self::MAP_VALUES_AS_VALUES) {
                $values[(string) $v->attributes()->name] = $value;
            } else { // self::MAP_VALUES_AS_KEYS
                $values[$value] = (string) $v->attributes()->name;
            }
        }

        return $values;
    }

    /**
     * @param \SimpleXMLElement $layerXml
     *
     * @return Form\QgisFormControlProperties[]
     *
     * @deprecated 3.9.0 No longer used by internal code and not recommended.
     */
    protected function getFieldConfiguration($layerXml)
    {
        $edittypes = array();
        $fieldConfiguration = $layerXml->fieldConfiguration;
        foreach ($fieldConfiguration->field as $field) {
            $editWidget = $field->editWidget;
            $fieldName = (string) $field->attributes()->name;
            $fieldEditType = (string) $editWidget->attributes()->type;
            $options = $editWidget->config->Option;

            // Option + Attributes
            if (count((array) $options) > 2) {
                \jLog::log('Project '.basename($this->path).': More than one Option found in the Qgis File for field '.$fieldName.', only the first will be read.', 'lizmapadmin');
            }
            $fieldEditOptions = $this->getFieldConfigurationOptions($options);

            // editable
            $editableFieldXml = $layerXml->xpath("editable/field[@name='{$fieldName}']");
            if ($editableFieldXml && is_array($editableFieldXml)) {
                $editable = (int) $editableFieldXml[0]->attributes()->editable;
            } else {
                $editable = 1;
            }
            $fieldEditOptions['editable'] = $editable;

            $this->convertTypeOptions($fieldEditOptions);
            $markup = $this->getMarkup($fieldEditType, $fieldEditOptions);
            if ($markup == 'upload') {
                $this->readUploadOptions($fieldEditType, $fieldEditOptions);
            }
            $control = new Form\QgisFormControlProperties($fieldName, $fieldEditType, $markup, $fieldEditOptions);
            $edittypes[$fieldName] = $control;
        }

        return $edittypes;
    }

    /**
     * @deprecated 3.9.0 No longer used by internal code and not recommended.
     */
    protected function getFieldConfigurationOptions(\SimpleXMLElement $options)
    {
        $fieldEditOptions = array();
        foreach ($options->Option as $option) {
            $optionName = (string) $option->attributes()->name;
            $optionType = (string) $option->attributes()->type;

            // Define values extraction type
            $valuesExtraction = self::MAP_VALUES_AS_VALUES;
            if ($optionName === 'map') {
                // If the option is named 'map' the value attributes are keys
                $valuesExtraction = self::MAP_VALUES_AS_KEYS;
            } elseif ($optionType === 'StringList') {
                // If the type is 'StringList' only values are extracted
                $valuesExtraction = self::MAP_ONLY_VALUES;
            }

            if ($optionType === 'List') {
                $values = array();
                foreach ($option->Option as $l) {
                    if ((string) $l->attributes()->type === 'Map') {
                        $optionValues = $this->getValuesFromOptions($l, $valuesExtraction);
                        // we don't use array_merge, because this function reindexes keys if they are
                        // numerical values, and this is not what we want.
                        $values += $optionValues;
                    } else {
                        $values[] = $this->convertValueOptions((string) $l->attributes()->value, (string) $l->attributes()->type);
                    }
                }
                $fieldEditOptions[$optionName] = $values;
            // Option with list of values as Map or string list of values
            } elseif ($optionType === 'Map' || $optionType === 'StringList') {
                $fieldEditOptions[$optionName] = $this->getValuesFromOptions($option, $valuesExtraction);
                if ($optionName === 'PropertyCollection') {
                    foreach ($option->Option as $propertyCollectionOption) {
                        // get properties of property collection
                        if ((string) $propertyCollectionOption->attributes()->name == 'properties') {
                            $propName = (string) $propertyCollectionOption->attributes()->name;
                            $fieldEditOptions[$optionName][$propName] = array();
                            foreach ($propertyCollectionOption->Option as $subOptions) {
                                $subOpt = (string) $subOptions->attributes()->name;
                                $fieldEditOptions[$optionName][$propName][$subOpt] = $this->getValuesFromOptions($subOptions, $valuesExtraction);
                            }
                        }
                    }
                }
            // Simple option
            } else {
                $fieldEditOptions[$optionName] = $this->convertValueOptions((string) $option->attributes()->value, (string) $option->attributes()->type);
            }
        }

        return $fieldEditOptions;
    }

    /**
     * @param \SimpleXMLElement $layerXml
     *
     * @return Form\QgisFormControlProperties[]
     *
     * @deprecated 3.9.0 No longer used by internal code and not recommended.
     */
    protected function getEditType($layerXml)
    {
        $edittypes = $layerXml->edittypes;
        $editTab = array();

        foreach ($edittypes->edittype as $edittype) {
            if (!property_exists($edittype->attributes(), 'name')) {
                continue;
            }
            $fieldName = (string) $edittype->attributes()->name;
            $attributes = array();

            // New QGIS 2.4 edittypes : use widgetv2type property
            if (property_exists($edittype->attributes(), 'widgetv2type')) {
                // translate the SimpleXmlElement containing attributes into an array
                foreach ($edittype->widgetv2config->attributes() as $name => $value) {
                    $attributes[$name] = (string) $value;
                }
                $fieldEditType = (string) $edittype->attributes()->widgetv2type;

                $chainFilters = false;
                $filters = array();
                if (property_exists($edittype->widgetv2config, 'FilterFields')) {
                    foreach ($edittype->widgetv2config->FilterFields->children('field') as $f) {
                        $filters[] = (string) $f->attributes()->name;
                    }
                    $chainFilters = filter_var($edittype->widgetv2config->FilterFields->attributes()->ChainFilters, FILTER_VALIDATE_BOOLEAN);
                }
                $attributes['filters'] = $filters;
                $attributes['chainFilters'] = $chainFilters;
            }
            // Before QGIS 2.4
            else {
                $fieldEditType = (int) $edittype->attributes()->type;
                // convert edittype name to widgetv2type names
                $convertName = array(
                    'min' => 'Min',
                    'max' => 'Max',
                    'editable' => 'Editable',
                    'checked' => 'CheckedState',
                    'unchecked' => 'UncheckedState',
                    'allowNull' => 'AllowNull',
                    'orderByValue' => 'OrderByValue',
                    'layer' => 'Layer',
                    'key' => 'Key',
                    'value' => 'Value',
                    'allowMulti' => 'AllowMulti',
                    'filterExpression' => 'FilterExpression',
                );
                // translate the SimpleXmlElement containing attributes into an array
                foreach ($edittype->attributes() as $name => $value) {
                    if (in_array($name, array('name', 'type'))) {
                        continue;
                    }
                    if (isset($convertName[$name])) {
                        $name = $convertName[$name];
                    }
                    $attributes[$name] = (string) $value;
                }
            }

            if ($fieldEditType === 3) {
                $data = array();
                foreach ($edittype->xpath('valuepair') as $valuepair) {
                    $k = (string) $valuepair->attributes()->key;
                    $v = (string) $valuepair->attributes()->value;
                    $data[$v] = $k;
                }
                $attributes['valueMap'] = $data;
            } elseif ($fieldEditType === 'ValueMap') {
                $data = array();
                foreach ($edittype->widgetv2config->xpath('value') as $value) {
                    $k = (string) $value->attributes()->key;
                    $v = (string) $value->attributes()->value;
                    $data[$v] = $k;
                }
                $attributes['valueMap'] = $data;
            }

            $markup = $this->getMarkup($fieldEditType, $attributes);
            $this->convertTypeOptions($attributes);
            if ($markup == 'upload') {
                $this->readUploadOptions($fieldEditType, $fieldEditOptions);
            }
            $control = new Form\QgisFormControlProperties($fieldName, $fieldEditType, $markup, $attributes);
            $editTab[$fieldName] = $control;
        }

        return $editTab;
    }

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
     * @param string $value the option value attribute content
     * @param string $type  the option type attribute content
     *
     * @return bool|float|int|string
     *
     * @deprecated 3.9.0 No longer used by internal code and not recommended.
     */
    protected function convertValueOptions($value, $type)
    {
        switch ($type) {
            case 'double':
            case 'float':
                return (float) $value;

            case 'int':
            case 'LongLong':
            case 'ULongLong':
                return (int) $value;

            case 'bool':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);

        }

        return $value;
    }

    /**
     * @param int|string $fieldEditType
     * @param array      $editAttributes attributes of widgetv2config
     *
     * @return string
     *
     * @deprecated 3.9.0 No longer used by internal code and not recommended.
     */
    protected function getMarkup($fieldEditType, $editAttributes)
    {
        $qgisEdittypeMap = Form\QgisFormControl::getEditTypeMap();

        if ($fieldEditType === 12) {
            $useHtml = 0;
            if (array_key_exists('UseHtml', $editAttributes)) {
                $useHtml = $editAttributes['UseHtml'];
            }
            $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'][$useHtml];
        } elseif ($fieldEditType === 'TextEdit') {
            $isMultiLine = false;
            if (array_key_exists('IsMultiline', $editAttributes)) {
                $isMultiLine = $editAttributes['IsMultiline'];
            }

            if (!$isMultiLine) {
                $fieldEditType = 'LineEdit';
                $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'];
            } else {
                $useHtml = false;
                if (array_key_exists('UseHtml', $editAttributes)) {
                    $useHtml = $editAttributes['UseHtml'];
                }
                if ($useHtml) {
                    $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'][1];
                } else {
                    $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'][0];
                }
            }
        } elseif ($fieldEditType === 5) {
            $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'][0];
        } elseif ($fieldEditType === 15 || $fieldEditType === 'ValueRelation') {
            $allowMulti = false;
            if (array_key_exists('AllowMulti', $editAttributes)) {
                $allowMulti = $editAttributes['AllowMulti'];
            }
            $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'][$allowMulti];
        } elseif ($fieldEditType === 'Range' || $fieldEditType === 'EditRange') {
            $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'][0];
        } elseif ($fieldEditType === 'SliderRange' || $fieldEditType === 'DialRange') {
            $markup = $qgisEdittypeMap[$fieldEditType]['jform']['markup'][1];
        } elseif ($fieldEditType === 'DateTime') {
            $markup = 'date';
            $display_format = '';
            if (array_key_exists('display_format', $editAttributes)) {
                $display_format = $editAttributes['display_format'];
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
     * @param \SimpleXMLElement $layerXml
     * @param string            $layerId
     * @param Project           $proj
     *
     * @return array
     *
     * @deprecated 3.9.0 No longer used by internal code and not recommended.
     */
    public function readFormControls($layerXml, $layerId, $proj)
    {
        // Get null, \qgisMapLayer or \qgisVectorLayer
        $layer = $this->getLayer($layerId, $proj);
        if (!$layer || $layer->getType() !== 'vector') {
            return array();
        }

        if ($layerXml->edittypes && count($layerXml->edittypes->edittype)) {
            $props = $this->getEditType($layerXml);
        } elseif ($layerXml->fieldConfiguration) {
            $props = $this->getFieldConfiguration($layerXml);
        } else {
            return array();
        }

        /** @var \qgisVectorLayer $layer */
        $aliases = $layer->getAliasFields();

        $categoriesXml = $layerXml->xpath('renderer-v2/categories');
        if ($categoriesXml) {
            $categoriesXml = $categoriesXml[0];
            $categories = array();
            foreach ($categoriesXml as $category) {
                $l = (string) $category->attributes()->label;
                $v = (string) $category->attributes()->value;
                $categories[$v] = $l;
            }
            asort($categories);
        } else {
            $categories = array();
        }

        foreach ($props as $fieldName => $prop) {
            $alias = null;
            if ($aliases && array_key_exists($fieldName, $aliases)) {
                $alias = $aliases[$fieldName];
            }
            if ($alias) {
                $prop->setFieldAlias($alias);
            }
            $props[$fieldName]->setRendererCategories($categories);
        }

        return $props;
    }
}
