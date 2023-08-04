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
     * @var array contains WMS info
     */
    protected $WMSInformation;

    /**
     * @var string
     */
    protected $canvasColor = '';

    /**
     * @var array authid => proj4
     */
    protected $allProj4 = array();

    /**
     * @var array for each referenced layer, there is an item
     *            with referencingLayer, referencedField, referencingField keys.
     *            There is also a 'pivot' key
     */
    protected $relations = array();

    /**
     * @var array list of fields properties for each relation
     */
    protected $relationsFields = array();

    /**
     * @var array list of themes
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
        'customProjectVariables',
    );

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

    public function getWMSInformation()
    {
        return $this->WMSInformation;
    }

    public function getCanvasColor()
    {
        return $this->canvasColor;
    }

    public function getProj4($authId)
    {
        if (!array_key_exists($authId, $this->allProj4)) {
            return null;
        }

        return $this->allProj4[$authId];
    }

    public function getAllProj4()
    {
        return $this->allProj4;
    }

    public function getRelations()
    {
        return $this->relations;
    }

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
        $shortNames = $this->xpathQuery('//maplayer/shortname');
        if ($shortNames) {
            foreach ($shortNames as $sname) {
                $sname = (string) $sname;
                $xmlLayer = $this->xpathQuery("//maplayer[shortname='{$sname}']");
                if (!$xmlLayer) {
                    continue;
                }
                $xmlLayer = $xmlLayer[0];
                $name = (string) $xmlLayer->layername;
                $layerCfg = $cfg->getLayer($name);
                if ($layerCfg) {
                    $layerCfg->shortname = $sname;
                }
            }
        }
    }

    /**
     * Set layers' opacity with XML data.
     */
    protected function setLayerOpacity(ProjectConfig $cfg)
    {
        $layerWithOpacities = $this->xpathQuery('//maplayer/layerOpacity[.!=1]/parent::*');
        if ($layerWithOpacities) {
            foreach ($layerWithOpacities as $layerWithOpacity) {
                $name = (string) $layerWithOpacity->layername;
                $layerCfg = $cfg->getLayer($name);
                if ($layerCfg) {
                    $opacity = (float) $layerWithOpacity->layerOpacity;
                    $layerCfg->opacity = $opacity;
                }
            }
        }
    }

    /**
     * Set layers' group infos.
     */
    protected function setLayerGroupData(ProjectConfig $cfg)
    {
        $groupsWithShortName = $this->xpathQuery("//layer-tree-group/customproperties/property[@key='wmsShortName']/parent::*/parent::*");
        if ($groupsWithShortName) {
            foreach ($groupsWithShortName as $group) {
                $name = (string) $group['name'];
                $shortNameProperty = $group->xpath("customproperties/property[@key='wmsShortName']");
                if (!$shortNameProperty) {
                    continue;
                }

                $shortNameProperty = $shortNameProperty[0];
                $sname = (string) $shortNameProperty['value'];
                if (!$sname) {
                    continue;
                }

                $layerCfg = $cfg->getLayer($name);
                if (!$layerCfg) {
                    continue;
                }
                $layerCfg->shortname = $sname;
            }
        } else {
            $groupsWithShortName = $this->xpathQuery("//layer-tree-group/customproperties/Option[@type='Map']/Option[@name='wmsShortName']/parent::*/parent::*/parent::*");
            if ($groupsWithShortName) {
                foreach ($groupsWithShortName as $group) {
                    $name = (string) $group['name'];
                    $shortNameProperty = $group->xpath("customproperties/Option[@type='Map']/Option[@name='wmsShortName']");
                    if (!$shortNameProperty) {
                        continue;
                    }

                    $shortNameProperty = $shortNameProperty[0];
                    $sname = (string) $shortNameProperty['value'];
                    if (!$sname) {
                        continue;
                    }

                    $layerCfg = $cfg->getLayer($name);
                    if (!$layerCfg) {
                        continue;
                    }
                    $layerCfg->shortname = $sname;
                }
            }
        }

        $groupsMutuallyExclusive = $this->xpathQuery("//layer-tree-group[@mutually-exclusive='1']");
        if ($groupsMutuallyExclusive) {
            foreach ($groupsMutuallyExclusive as $group) {
                $name = (string) $group['name'];
                $layerCfg = $cfg->getLayer($name);
                if ($layerCfg) {
                    $layerCfg->mutuallyExclusive = 'True';
                }
            }
        }
    }

    /**
     * Set layers' last infos.
     */
    protected function setLayerShowFeatureCount(ProjectConfig $cfg)
    {
        $layersWithShowFeatureCount = $this->xpathQuery("//layer-tree-layer/customproperties/property[@key='showFeatureCount'][@value='1']/parent::*/parent::*");
        if (!$layersWithShowFeatureCount) {
            $layersWithShowFeatureCount = $this->xpathQuery("//layer-tree-layer/customproperties/Option[@type='Map']/Option[@name='showFeatureCount'][@value='1']/parent::*/parent::*/parent::*");
        }
        if ($layersWithShowFeatureCount) {
            foreach ($layersWithShowFeatureCount as $layer) {
                $name = (string) $layer['name'];
                $layerCfg = $cfg->getLayer($name);
                if ($layerCfg) {
                    $layerCfg->showFeatureCount = 'True';
                }
            }
        }
    }

    /**
     * Set/Unset some properties after reading the config file.
     */
    protected function unsetPropAfterRead(ProjectConfig $cfg)
    {
        // remove plugin layer
        $pluginLayers = $this->xpathQuery('//maplayer[type="plugin"]');
        if ($pluginLayers) {
            foreach ($pluginLayers as $layer) {
                $name = (string) $layer->layername;
                $cfg->removeLayer($name);
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
        foreach ($layers as $key => $layerCfg) {
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
     * @return null|array|string
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
        $ret = $this->xml->xpath($query);
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
            $qgsProj = new QgisProject(realpath(dirname($this->path).DIRECTORY_SEPARATOR.$layer['projectPath']), $this->services, $this->appContext);

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
        if ($this->xml) {
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
        // get restricted composers
        $rComposers = array();
        $restrictedComposers = $this->xml->xpath('//properties/WMSRestrictedComposers/value');
        if ($restrictedComposers && is_array($restrictedComposers)) {
            foreach ($restrictedComposers as $restrictedComposer) {
                $rComposers[] = (string) $restrictedComposer;
            }
        }

        $printTemplates = array();
        // get layout qgs project version >= 3
        $layouts = $this->xml->xpath('//Layout');
        if ($layouts && is_array($layouts)) {
            foreach ($layouts as $layout) {
                // test restriction
                if (in_array((string) $layout['name'], $rComposers)) {
                    continue;
                }
                // get page element
                $page = $layout->xpath('PageCollection/LayoutItem[@type="65638"]');
                if (!$page) {
                    continue;
                }
                $page = $page[0];

                $pageSize = explode(',', $page['size']);
                // init print template element
                $printTemplate = array(
                    'title' => (string) $layout['name'],
                    'width' => (int) $pageSize[0],
                    'height' => (int) $pageSize[1],
                    'maps' => array(),
                    'labels' => array(),
                );

                // store mapping between uuid and id
                $mapUuidId = array();
                // get layout maps
                $lMaps = $layout->xpath('LayoutItem[@type="65639"]');
                if ($lMaps && is_array($lMaps)) {
                    // Convert xml to json config
                    foreach ($lMaps as $lMap) {
                        $lMapSize = explode(',', $lMap['size']);
                        $ptMap = array(
                            'id' => 'map'.(string) count($printTemplate['maps']),
                            'uuid' => (string) $lMap['uuid'],
                            'width' => (int) $lMapSize[0],
                            'height' => (int) $lMapSize[1],
                        );
                        // store mapping between uuid and id
                        $mapUuidId[(string) $lMap['uuid']] = 'map'.(string) count($printTemplate['maps']);

                        // Overview
                        $cMapOverviews = $lMap->xpath('ComposerMapOverview');
                        foreach ($cMapOverviews as $cMapOverview) {
                            if ($cMapOverview and (string) $cMapOverview->attributes()->show !== '0' and (string) $cMapOverview->attributes()->frameMap != '-1') {
                                // frameMap is an uuid
                                $ptMap['overviewMap'] = (string) $cMapOverview->attributes()->frameMap;
                            }
                        }
                        // Grid
                        $cMapGrids = $lMap->xpath('ComposerMapGrid');
                        foreach ($cMapGrids as $cMapGrid) {
                            if ($cMapGrid and (string) $cMapGrid->attributes()->show !== '0') {
                                $ptMap['grid'] = 'True';
                            }
                        }

                        $printTemplate['maps'][] = $ptMap;
                    }
                    // Modifying overviewMap to id instead of uuid
                    foreach ($printTemplate['maps'] as $ptMap) {
                        if (!array_key_exists('overviewMap', $ptMap)) {
                            continue;
                        }
                        if (!array_key_exists($ptMap['overviewMap'], $mapUuidId)) {
                            unset($ptMap['overviewMap']);

                            continue;
                        }
                        $ptMap['overviewMap'] = $mapUuidId[$ptMap['overviewMap']];
                    }
                }

                // get layout labels
                $lLabels = $layout->xpath('LayoutItem[@type="65641"]');
                if ($lLabels && is_array($lLabels)) {
                    foreach ($lLabels as $lLabel) {
                        if ((string) $lLabel['id'] == '') {
                            continue;
                        }
                        $printTemplate['labels'][] = array(
                            'id' => (string) $lLabel['id'],
                            'htmlState' => (int) $lLabel['htmlState'],
                            'text' => (string) $lLabel['labelText'],
                        );
                    }
                }

                // Atlas
                $atlas = $layout->xpath('Atlas');
                if ($atlas) {
                    $atlas = $atlas[0];
                    $printTemplate['atlas'] = array(
                        'enabled' => (string) $atlas['enabled'],
                        'coverageLayer' => (string) $atlas['coverageLayer'],
                    );
                }
                $printTemplates[] = $printTemplate;
            }
        }

        return $printTemplates;
    }

    /**
     * @param object $locateByLayer
     */
    public function readLocateByLayer($locateByLayer)
    {
        // collect layerIds
        $locateLayerIds = array();
        foreach ($locateByLayer as $k => $v) {
            $locateLayerIds[] = $v->layerId;
        }
        // update locateByLayer with alias and filter information
        foreach ($locateByLayer as $k => $v) {
            $xmlLayer = $this->getXmlLayer2($this->xml, $v->layerId);
            if (is_null($xmlLayer)) {
                continue;
            }
            // aliases
            $alias = $xmlLayer->xpath("aliases/alias[@field='".$v->fieldName."']");
            if ($alias && is_array($alias)) {
                $alias = $alias[0];
                $v->fieldAlias = (string) $alias['name'];
                $locateByLayer->{$k} = $v;
            }
            if (property_exists($v, 'filterFieldName')) {
                $alias = $xmlLayer->xpath("aliases/alias[@field='".$v->filterFieldName."']");
                if ($alias && is_array($alias)) {
                    $alias = $alias[0];
                    $v->filterFieldAlias = (string) $alias['name'];
                    $locateByLayer->{$k} = $v;
                }
            }
            // vectorjoins
            $vectorjoins = $xmlLayer->xpath('vectorjoins/join');
            if ($vectorjoins && is_array($vectorjoins)) {
                if (!property_exists($v, 'vectorjoins')) {
                    $v->vectorjoins = array();
                }
                foreach ($vectorjoins as $vectorjoin) {
                    $joinLayerId = (string) $vectorjoin['joinLayerId'];
                    if (in_array($joinLayerId, $locateLayerIds)) {
                        $v->vectorjoins[] = (object) array(
                            'joinFieldName' => (string) $vectorjoin['joinFieldName'],
                            'targetFieldName' => (string) $vectorjoin['targetFieldName'],
                            'joinLayerId' => (string) $vectorjoin['joinLayerId'],
                        );
                    }
                }
                $locateByLayer->{$k} = $v;
            }
        }
    }

    /**
     * @param object $editionLayers
     */
    public function readEditionLayers($editionLayers)
    {
        foreach ($editionLayers as $key => $obj) {
            // Improve performance by getting provider directly from config
            // Available for lizmap plugin >= 3.3.2
            if (property_exists($obj, 'provider')) {
                if ($obj->provider == 'spatialite') {
                    unset($editionLayers->{$key});
                }

                continue;
            }

            // Read layer property from QGIS project XML
            $layerXml = $this->getXmlLayer2($this->xml, $obj->layerId);
            if (is_null($layerXml)) {
                continue;
            }
            $provider = $layerXml->xpath('provider');
            $provider = (string) $provider[0];
            if ($provider == 'spatialite') {
                unset($editionLayers->{$key});
            }
        }
    }

    /**
     * @param object  $editionLayers
     * @param Project $proj
     */
    public function readEditionForms($editionLayers, $proj)
    {
        foreach ($editionLayers as $key => $obj) {
            $layerXml = $this->getXmlLayer2($this->xml, $obj->layerId);
            if (is_null($layerXml)) {
                continue;
            }
            $formControls = $this->readFormControls($layerXml, $obj->layerId, $proj);
            $proj->getCacheHandler()->setEditableLayerFormCache($obj->layerId, $formControls);
        }
    }

    /**
     * Read the layer QGIS form configuration for the layers
     * used in attribute tables, form filter & dataviz,
     * and get the configuration for the fields for which to display
     * labels instead of codes.
     *
     * This concerns fields with ValueMap, ValueRelation & RelationReference config
     *
     * @param array   $layerIds List of layer identifiers
     * @param Project $proj
     */
    public function readLayersLabeledFieldsConfig($layerIds, $proj)
    {
        // Get QGIS form fields configurations for each layer
        $layersLabeledFieldsConfig = array();
        foreach ($layerIds as $layerId) {
            $layerXml = $this->getXmlLayer2($this->xml, $layerId);
            if (is_null($layerXml)) {
                continue;
            }
            $formControls = $this->readFormControls($layerXml, $layerId, $proj);
            $getLayer = $this->getLayer($layerId, $proj);
            $layerName = $getLayer->getName();
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

            $layersLabeledFieldsConfig[$layerName] = $fields_config;
        }

        return $layersLabeledFieldsConfig;
    }

    /**
     * @param object $attributeLayers
     */
    public function readAttributeLayers($attributeLayers)
    {
        // Get field order & visibility
        foreach ($attributeLayers as $key => $obj) {
            // Improve performance by getting custom_config status directly from config
            // Available for lizmap plugin >= 3.3.3
            if (property_exists($obj, 'custom_config') && $obj->custom_config != 'True') {
                continue;
            }

            // Read layer property from QGIS project XML
            $layerXml = $this->getXmlLayer2($this->xml, $obj->layerId);
            if (is_null($layerXml)) {
                continue;
            }
            $attributetableconfigXml = $layerXml->xpath('attributetableconfig');
            if (count($attributetableconfigXml) == 0) {
                continue;
            }
            $attributetableconfig = str_replace(
                '@',
                '',
                json_encode($attributetableconfigXml[0])
            );
            $obj->attributetableconfig = json_decode($attributetableconfig);
        }
    }

    /**
     * @param \SimpleXMLElement $xml
     * @param mixed             $layers
     *
     * @return int[]
     */
    public function readLayersOrder($xml, $layers)
    {
        $layersOrder = array();
        if ($this->qgisProjectVersion >= 30000) { // For QGIS >=3.0, custom-order is in layer-tree-group
            $customOrder = $this->xml->xpath('layer-tree-group/custom-order');
            if (count($customOrder) == 0) {
                return $layersOrder;
            }
            $customOrderZero = $customOrder[0];
            if (intval($customOrderZero->attributes()->enabled) == 1) {
                $items = $customOrderZero->xpath('//item');
                $lo = 0;
                foreach ($items as $layerI) {
                    // Get layer name from config instead of XML for possible embedded layers
                    $name = $this->getLayerNameByIdFromConfig($layerI, $layers);
                    if ($name) {
                        $layersOrder[$name] = $lo;
                    }
                    ++$lo;
                }
            } else {
                return $layersOrder;
            }
        } elseif ($this->qgisProjectVersion >= 20400) { // For QGIS >=2.4, new item layer-tree-canvas
            $customOrder = $this->xml->xpath('//layer-tree-canvas/custom-order');
            if (count($customOrder) == 0) {
                return $layersOrder;
            }
            $customOrderZero = $customOrder[0];
            if (intval($customOrderZero->attributes()->enabled) == 1) {
                $items = $customOrderZero->xpath('//item');
                $lo = 0;
                foreach ($items as $layerI) {
                    // Get layer name from config instead of XML for possible embedded layers
                    $name = $this->getLayerNameByIdFromConfig($layerI, $layers);
                    if ($name) {
                        $layersOrder[$name] = $lo;
                    }
                    ++$lo;
                }
            } else {
                $items = $this->xml->xpath('layer-tree-group//layer-tree-layer');
                $lo = 0;
                foreach ($items as $layerTree) {
                    // Get layer name from config instead of XML for possible embedded layers
                    $name = $this->getLayerNameByIdFromConfig($layerTree->attributes()->id, $layers);
                    if ($name) {
                        $layersOrder[$name] = $lo;
                    }
                    ++$lo;
                }
            }
        } else {
            $legend = $this->xml->xpath('//legend');
            if (count($legend) == 0) {
                return $layersOrder;
            }
            $legendZero = $legend[0];
            $updateDrawingOrder = (string) $legendZero->attributes()->updateDrawingOrder;
            if ($updateDrawingOrder == 'false') {
                $layers = $this->xml->xpath('//legendlayer');
                foreach ($layers as $layer) {
                    if ($layer->attributes()->drawingOrder && intval($layer->attributes()->drawingOrder) >= 0) {
                        $layersOrder[(string) $layer->attributes()->name] = (int) $layer->attributes()->drawingOrder;
                    }
                }
            }
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

        $qgsXml = App\XmlTools::xmlFromFile($qgs_path);
        if (!is_object($qgsXml)) {
            $errormsg = '\n'.basename($qgs_path).'\n'.$qgsXml;
            $errormsg = 'An error has been raised when loading QGIS Project:'.$errormsg;
            \jLog::log($errormsg, 'lizmapadmin');

            throw new \Exception('The QGIS project '.basename($qgs_path).' has invalid content!');
        }
        $this->xml = $qgsXml;
        // Build data
        $this->data = array(
        );

        // get title from WMS properties
        if (property_exists($qgsXml->properties, 'WMSServiceTitle')) {
            if (!empty($qgsXml->properties->WMSServiceTitle)) {
                $this->data['title'] = (string) $qgsXml->properties->WMSServiceTitle;
            }
        }

        // get abstract from WMS properties
        if (property_exists($qgsXml->properties, 'WMSServiceAbstract')) {
            $this->data['abstract'] = (string) $qgsXml->properties->WMSServiceAbstract;
        }

        // get keyword list from WMS properties
        if (property_exists($qgsXml->properties, 'WMSKeywordList')) {
            $values = array();
            foreach ($qgsXml->properties->WMSKeywordList->value as $value) {
                if ((string) $value !== '') {
                    $values[] = (string) $value;
                }
            }
            $this->data['keywordList'] = implode(', ', $values);
        }

        // get WMS max width
        if (property_exists($qgsXml->properties, 'WMSMaxWidth')) {
            $this->data['wmsMaxWidth'] = (int) $qgsXml->properties->WMSMaxWidth;
        }
        if (!array_key_exists('WMSMaxWidth', $this->data) or !$this->data['wmsMaxWidth']) {
            unset($this->data['wmsMaxWidth']);
        }

        // get WMS max height
        if (property_exists($qgsXml->properties, 'WMSMaxHeight')) {
            $this->data['wmsMaxHeight'] = (int) $qgsXml->properties->WMSMaxHeight;
        }
        if (!array_key_exists('WMSMaxHeight', $this->data) or !$this->data['wmsMaxHeight']) {
            unset($this->data['wmsMaxHeight']);
        }

        // get QGIS project version
        $this->qgisProjectVersion = $this->readQgisProjectVersion($qgsXml);

        $this->WMSInformation = $this->readWMSInformation($qgsXml);
        $this->canvasColor = $this->readCanvasColor($qgsXml);
        $this->allProj4 = $this->readAllProj4($qgsXml);
        list($this->relations, $this->relationsFields) = $this->readRelations($qgsXml);
        $this->themes = $this->readThemes($qgsXml);
        $this->customProjectVariables = $this->readCustomProjectVariables($qgsXml);
        $this->useLayerIDs = $this->readUseLayerIDs($qgsXml);
        $this->layers = $this->readLayers($qgsXml);
    }

    protected function readWMSInformation($qgsLoad)
    {

        // Default metadata
        $WMSServiceTitle = '';
        $WMSServiceAbstract = '';
        $WMSKeywordList = '';
        $WMSExtent = '';
        $ProjectCrs = '';
        $WMSOnlineResource = '';
        $WMSContactMail = '';
        $WMSContactOrganization = '';
        $WMSContactPerson = '';
        $WMSContactPhone = '';
        if ($qgsLoad) {
            $WMSServiceTitle = (string) $qgsLoad->properties->WMSServiceTitle;
            $WMSServiceAbstract = (string) $qgsLoad->properties->WMSServiceAbstract;

            if (property_exists($qgsLoad->properties, 'WMSKeywordList')) {
                $values = array();
                foreach ($qgsLoad->properties->WMSKeywordList->value as $value) {
                    if ((string) $value !== '') {
                        $values[] = (string) $value;
                    }
                }
                $WMSKeywordList = implode(', ', $values);
            }

            $WMSExtent = $qgsLoad->properties->WMSExtent->value[0];
            $WMSExtent .= ', '.$qgsLoad->properties->WMSExtent->value[1];
            $WMSExtent .= ', '.$qgsLoad->properties->WMSExtent->value[2];
            $WMSExtent .= ', '.$qgsLoad->properties->WMSExtent->value[3];
            $WMSOnlineResource = (string) $qgsLoad->properties->WMSOnlineResource;
            $WMSContactMail = (string) $qgsLoad->properties->WMSContactMail;
            $WMSContactOrganization = (string) $qgsLoad->properties->WMSContactOrganization;
            $WMSContactPerson = (string) $qgsLoad->properties->WMSContactPerson;
            $WMSContactPhone = (string) $qgsLoad->properties->WMSContactPhone;
        }
        if (isset($qgsLoad->mapcanvas)) {
            $ProjectCrs = (string) $qgsLoad->mapcanvas->destinationsrs->spatialrefsys->authid;
        }

        return array(
            'WMSServiceTitle' => $WMSServiceTitle,
            'WMSServiceAbstract' => $WMSServiceAbstract,
            'WMSKeywordList' => $WMSKeywordList,
            'WMSExtent' => $WMSExtent,
            'ProjectCrs' => $ProjectCrs,
            'WMSOnlineResource' => $WMSOnlineResource,
            'WMSContactMail' => $WMSContactMail,
            'WMSContactOrganization' => $WMSContactOrganization,
            'WMSContactPerson' => $WMSContactPerson,
            'WMSContactPhone' => $WMSContactPhone,
        );
    }

    /**
     * @param \SimpleXMLElement $xml
     */
    protected function readQgisProjectVersion($xml)
    {
        $qgisRoot = $xml->xpath('//qgis');
        $qgisRootZero = $qgisRoot[0];
        $qgisProjectVersion = (string) $qgisRootZero->attributes()->version;
        $qgisProjectVersion = explode('-', $qgisProjectVersion);
        $qgisProjectVersion = $qgisProjectVersion[0];
        $qgisProjectVersion = explode('.', $qgisProjectVersion);
        $a = '';
        foreach ($qgisProjectVersion as $k) {
            if (strlen($k) == 1) {
                $a .= '0'.$k;
            } else {
                $a .= $k;
            }
        }

        return (int) $a;
    }

    /**
     * @param \SimpleXMLElement $xml
     *
     * @return string
     */
    protected function readCanvasColor($xml)
    {
        $red = $xml->xpath('//properties/Gui/CanvasColorRedPart');
        $green = $xml->xpath('//properties/Gui/CanvasColorGreenPart');
        $blue = $xml->xpath('//properties/Gui/CanvasColorBluePart');

        return 'rgb('.$red[0].','.$green[0].','.$blue[0].')';
    }

    /**
     * @param \SimpleXMLElement $xml
     *
     * @return array
     */
    protected function readAllProj4($xml)
    {
        $srsList = array();
        $spatialrefsys = $xml->xpath('//spatialrefsys');
        foreach ($spatialrefsys as $srs) {
            $srsList[(string) $srs->authid] = (string) $srs->proj4;
        }

        return $srsList;
    }

    /**
     * @param \SimpleXMLElement $xml
     *
     * @return null|array[]
     */
    protected function readThemes($xml)
    {
        $xmlThemes = $xml->xpath('//visibility-presets');
        $themes = array();

        if ($xmlThemes) {
            foreach ($xmlThemes[0] as $theme) {
                $themeObj = $theme->attributes();
                if (!array_key_exists((string) $themeObj->name, $themes)) {
                    $themes[(string) $themeObj->name] = array();
                }

                // Copy layers and their attributes
                foreach ($theme->layer as $layer) {
                    $layerObj = $layer->attributes();
                    // Since QGIS 3.26, theme contains every layers with visible attributes
                    // before only visible layers are in theme
                    // So do not keep layer with visible != '1' if it is defined
                    if (isset($layerObj->visible) && (string) $layerObj->visible != '1') {
                        continue;
                    }
                    $themes[(string) $themeObj->name]['layers'][(string) $layerObj->id] = array(
                        'style' => (string) $layerObj->style,
                        'expanded' => (string) $layerObj->expanded,
                    );
                }

                // Copy checked group nodes
                if (isset($theme->{'checked-group-nodes'}->{'checked-group-node'})) {
                    foreach ($theme->{'checked-group-nodes'}->{'checked-group-node'} as $checkedGroupNode) {
                        $checkedGroupNodeObj = $checkedGroupNode->attributes();
                        $themes[(string) $themeObj->name]['checkedGroupNode'][] = (string) $checkedGroupNodeObj->id;
                    }
                }

                // Copy expanded group nodes
                if (isset($theme->{'expanded-group-nodes'}->{'expanded-group-node'})) {
                    foreach ($theme->{'expanded-group-nodes'}->{'expanded-group-node'} as $expandedGroupNode) {
                        $expandedGroupNodeObj = $expandedGroupNode->attributes();
                        $themes[(string) $themeObj->name]['expandedGroupNode'][] = (string) $expandedGroupNodeObj->id;
                    }
                }
            }

            return $themes;
        }

        return null;
    }

    /**
     * @param \SimpleXMLElement $xml
     *
     * @return null|array<string, string> array of custom variable name => variable value
     */
    protected function readCustomProjectVariables($xml)
    {
        $xmlCustomProjectVariables = $xml->xpath('//properties/Variables');
        $customProjectVariables = array();

        if ($xmlCustomProjectVariables) {
            $variableIndex = 0;
            foreach ($xmlCustomProjectVariables[0]->variableNames->value as $variableName) {
                $customProjectVariables[(string) $variableName] = (string) $xmlCustomProjectVariables[0]->variableValues->value[$variableIndex];
                ++$variableIndex;
            }

            return $customProjectVariables;
        }

        return null;
    }

    /**
     * @param \SimpleXMLElement $xml
     *
     * @return null|array[] list of two list: reference between relation, and fields of relations
     */
    protected function readRelations($xml)
    {
        $xmlRelations = $xml->xpath('//relations');
        $relations = array();
        $relationsFields = array();
        $pivotGather = array();
        $pivot = array();
        if ($xmlRelations) {
            /** @var \SimpleXMLElement $relation */
            foreach ($xmlRelations[0] as $relation) {
                $relationObj = $relation->attributes();

                $relationField = $this->readRelationField($relation);
                if ($relationField === null) {
                    // no corresponding layer
                    continue;
                }
                $relationsFields[] = $relationField;

                $referencedLayerId = (string) $relationObj->referencedLayer;
                $referencingLayerId = (string) $relationObj->referencingLayer;
                if (!array_key_exists($referencedLayerId, $relations)) {
                    $relations[$referencedLayerId] = array();
                }
                $relations[$referencedLayerId][] = array(
                    'referencingLayer' => $referencingLayerId,
                    'referencedField' => $relationField['referencedField'],
                    'referencingField' => $relationField['referencingField'],
                    'previewField' => $relationField['previewField'],
                    'relationName' => (string) $relationObj->name,
                    'relationId' => (string) $relationObj->id,
                );

                if (!array_key_exists($referencingLayerId, $pivotGather)) {
                    $pivotGather[$referencingLayerId] = array();
                }

                $pivotGather[$referencingLayerId][$referencedLayerId] = $relationField['referencingField'];
            }

            // Keep only child with at least two parents
            foreach ($pivotGather as $pi => $vo) {
                if (count($vo) > 1) {
                    $pivot[$pi] = $vo;
                }
            }
            $relations['pivot'] = $pivot;

            return array($relations, $relationsFields);
        }

        return null;
    }

    /**
     * @param \SimpleXMLElement $relationXml
     */
    protected function readRelationField($relationXml)
    {
        $referencedLayerId = $relationXml->attributes()->referencedLayer;

        $_referencedLayerXml = $this->getXmlLayer($referencedLayerId);
        if (count($_referencedLayerXml) == 0) {
            return null;
        }
        $referencedLayerXml = $_referencedLayerXml[0];

        $_layerName = $referencedLayerXml->xpath('layername');
        if (count($_layerName) == 0) {
            return null;
        }
        $layerName = (string) $_layerName[0];
        $typeName = str_replace(' ', '_', $layerName);
        $_shortname = $referencedLayerXml->xpath('shortname');
        if (count($_shortname) > 0) {
            $shortname = (string) $_shortname[0];
            if (!empty($shortname)) {
                $typeName = $shortname;
            }
        }
        $referencedField = (string) $relationXml->fieldRef->attributes()->referencedField;
        $referencingField = (string) $relationXml->fieldRef->attributes()->referencingField;

        $referenceField = array(
            'id' => (string) $relationXml->attributes()->id,
            'layerName' => $layerName,
            'typeName' => $typeName,
            'propertyName' => '',
            'filterExpression' => '',
            'referencedField' => $referencedField,
            'referencingField' => $referencingField,
            'previewField' => '',
        );

        $_previewExpression = $referencedLayerXml->xpath('previewExpression');
        if (count($_previewExpression) == 0) {
            return $referenceField;
        }
        $previewExpression = (string) $_previewExpression[0];

        $previewField = $previewExpression;
        if (substr($previewField, 0, 8) == 'COALESCE') {
            if (preg_match('/"([\S ]+)"/', $previewField, $matches) == 1) {
                $previewField = $matches[1];
            } else {
                $previewField = $referencedField;
            }
        } elseif (substr($previewField, 0, 1) == '"' and substr($previewField, -1) == '"') {
            $previewField = substr($previewField, 1, -1);
        }

        $referenceField['propertyName'] = $referencedField.','.$previewField;
        $referenceField['previewField'] = $previewField;

        return $referenceField;
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
     * @param \SimpleXMLElement $xml
     *
     * @return bool
     */
    protected function readUseLayerIDs($xml)
    {
        $WMSUseLayerIDs = $xml->xpath('//properties/WMSUseLayerIDs');

        return $WMSUseLayerIDs && $WMSUseLayerIDs[0] == 'true';
    }

    /**
     * @param \SimpleXMLElement $xml
     *
     * @throws \Exception
     *
     * @return array[] list of layers. Each item is a list of layer properties
     */
    protected function readLayers($xml)
    {
        $xmlLayers = $xml->xpath('//maplayer');
        $layers = array();
        if (!$xmlLayers) {
            return $layers;
        }

        foreach ($xmlLayers as $xmlLayer) {
            $attributes = $xmlLayer->attributes();
            if (isset($attributes['embedded']) && (string) $attributes->embedded == '1') {
                $xmlFile = realpath(dirname($this->path).DIRECTORY_SEPARATOR.(string) $attributes->project);
                $qgsProj = new QgisProject($xmlFile, $this->services, $this->appContext);
                $layer = $qgsProj->getLayerDefinition((string) $attributes->id);
                $layer['qsgmtime'] = filemtime($xmlFile);
                $layer['file'] = $xmlFile;
                $layer['embedded'] = 1;
                $layer['projectPath'] = (string) $attributes->project;
                $layers[] = $layer;
            } else {
                $layer = array(
                    'type' => (string) $attributes->type,
                    'id' => (string) $xmlLayer->id,
                    'name' => (string) $xmlLayer->layername,
                    'shortname' => (string) $xmlLayer->shortname,
                    'title' => (string) $xmlLayer->title,
                    'abstract' => (string) $xmlLayer->abstract,
                    'proj4' => (string) $xmlLayer->srs->spatialrefsys->proj4,
                    'srid' => (int) $xmlLayer->srs->spatialrefsys->srid,
                    'authid' => (int) $xmlLayer->srs->spatialrefsys->authid,
                    'datasource' => (string) $xmlLayer->datasource,
                    'provider' => (string) $xmlLayer->provider,
                    'keywords' => array(),
                );
                $keywords = $xmlLayer->xpath('./keywordList/value');
                if ($keywords) {
                    foreach ($keywords as $keyword) {
                        if ((string) $keyword != '') {
                            $layer['keywords'][] = (string) $keyword;
                        }
                    }
                }

                if ($layer['title'] == '') {
                    $layer['title'] = $layer['name'];
                }
                if ($layer['type'] == 'vector') {
                    $fields = array();
                    $wfsFields = array();
                    $aliases = array();
                    $defaults = array();
                    $constraints = array();
                    $edittypes = $xmlLayer->xpath('.//edittype');
                    if ($edittypes) {
                        foreach ($edittypes as $edittype) {
                            $field = (string) $edittype->attributes()->name;
                            if (in_array($field, $fields)) {
                                continue; // QGIS sometimes stores them twice
                            }
                            $fields[] = $field;
                            $wfsFields[] = $field;
                            $aliases[$field] = $field;
                            $defaults[$field] = null;
                            $constraints[$field] = null;
                        }
                    } else {
                        $fieldconfigurations = $xmlLayer->xpath('.//fieldConfiguration/field');
                        if ($fieldconfigurations) {
                            foreach ($fieldconfigurations as $fieldconfiguration) {
                                $field = (string) $fieldconfiguration->attributes()->name;
                                if (in_array($field, $fields)) {
                                    continue; // QGIS sometimes stores them twice
                                }
                                $fields[] = $field;
                                $wfsFields[] = $field;
                                $aliases[$field] = $field;
                                $defaults[$field] = null;
                                $constraints[$field] = null;
                            }
                        }
                    }

                    if (isset($xmlLayer->aliases->alias)) {
                        foreach ($xmlLayer->aliases->alias as $alias) {
                            $aliases[(string) $alias['field']] = (string) $alias['name'];
                        }
                    }

                    if (isset($xmlLayer->defaults->default)) {
                        foreach ($xmlLayer->defaults->default as $default) {
                            $defaults[(string) $default['field']] = (string) $default['expression'];
                        }
                    }

                    if (isset($xmlLayer->constraints->constraint)) {
                        foreach ($xmlLayer->constraints->constraint as $constraint) {
                            $c = array(
                                'constraints' => 0,
                                'notNull' => false,
                                'unique' => false,
                                'exp' => false,
                            );
                            $c['constraints'] = (int) $constraint['constraints'];
                            if ($c['constraints'] > 0) {
                                $c['notNull'] = ((int) $constraint['notnull_strength'] > 0);
                                $c['unique'] = ((int) $constraint['unique_strength'] > 0);
                                $c['exp'] = ((int) $constraint['exp_strength'] > 0);
                            }
                            $constraints[(string) $constraint['field']] = $c;
                        }
                    }

                    if (isset($xmlLayer->constraintExpressions->constraint)) {
                        foreach ($xmlLayer->constraintExpressions->constraint as $constraint) {
                            $f = (string) $constraint['field'];
                            $c = array(
                                'constraints' => 0,
                                'notNull' => false,
                                'unique' => false,
                                'exp' => false,
                            );
                            if (array_key_exists($f, $constraints)) {
                                $c = $constraints[$f];
                            }
                            $exp_val = (string) $constraint['exp'];
                            if ($exp_val !== '') {
                                $c['exp'] = true;
                                $c['exp_value'] = $exp_val;
                                $c['exp_desc'] = (string) $constraint['desc'];
                            }
                            $constraints[$f] = $c;
                        }
                    }

                    $layer['fields'] = $fields;
                    $layer['aliases'] = $aliases;
                    $layer['defaults'] = $defaults;
                    $layer['constraints'] = $constraints;
                    $layer['wfsFields'] = $wfsFields;

                    // Do not expose fields with HideFromWfs parameter
                    // Format in .qgs has changed in QGIS 3.16
                    if ($this->qgisProjectVersion >= 31600) {
                        $excludeFields = $xmlLayer->xpath('.//field[contains(@configurationFlags,"HideFromWfs")]/@name');
                    } else {
                        $excludeFields = $xmlLayer->xpath('.//excludeAttributesWFS/attribute');
                    }

                    if ($excludeFields && is_array($excludeFields)) {
                        foreach ($excludeFields as $eField) {
                            $eField = (string) $eField;
                            if (!in_array($eField, $wfsFields)) {
                                continue; // QGIS sometimes stores them twice
                            }
                            array_splice($wfsFields, array_search($eField, $wfsFields), 1);
                        }
                        $layer['wfsFields'] = $wfsFields;
                    }
                }
                $layers[] = $layer;
            }
        }

        return $layers;
    }

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
        }

        $fieldEditOptions['UploadMimeTypes'] = $mimeTypes;
        $fieldEditOptions['DefaultRoot'] = $defaultRoot;
        $fieldEditOptions['UploadAccept'] = $acceptAttr;
        $fieldEditOptions['UploadCapture'] = $captureAttr;
        $fieldEditOptions['UploadImage'] = $imageUpload;
    }

    public const MAP_VALUES_AS_VALUES = 0;
    public const MAP_VALUES_AS_KEYS = 1;
    public const MAP_ONLY_VALUES = 2;

    /**
     * @param \SimpleXMLElement $optionList
     * @param int               $valuesExtraction one of MAP_* const
     *
     * @return array
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
     */
    protected function getFieldConfiguration($layerXml)
    {
        $edittypes = array();
        $fieldConfiguration = $layerXml->fieldConfiguration;
        foreach ($fieldConfiguration->field as $key => $field) {
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
