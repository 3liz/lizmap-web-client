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

class QgisProject
{
    /**
     * @var string QGIS project path
     */
    protected $path;

    /**
     * @var SimpleXMLElement QGIS project XML
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
     * @var array List of cached properties
     */
    protected $cachedProperties = array('WMSInformation', 'canvasColor', 'allProj4',
        'relations', 'themes', 'useLayerIDs', 'layers', 'data', 'qgisProjectVersion', );

    /**
     * @var App\AppContextInterface
     */
    protected $appContext;

    /**
     * constructor.
     *
     * @param string $file  : the QGIS project path
     * @param mixed  $jelix
     */
    public function __construct($file, App\AppContextInterface $jelix)
    {
        if (!$this->appContext) {
            $this->appContext = $jelix;
        }
        // Verifying if the files exist
        if (!file_exists($file)) {
            throw new \UnknownLizmapProjectException('The QGIS project '.$file.' does not exist!');
        }

        // For the cache key, we use the full path of the project file
        // to avoid collision in the cache engine
        $data = false;
        $cache = new projectCache($file, $this->appContext);
        $this->xml = simplexml_load_file($file);

        try {
            $data = $cache->retrieveProjectData();
        } catch (\Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            \jLog::logEx($e, 'error');
        }

        if ($data === false ||
            $data['qgsmtime'] < filemtime($file)) {
            // FIXME reading XML could take time, so many process could
            // read it and construct the cache at the same time. We should
            // have a kind of lock to avoid this issue.
            $this->readXmlProject($file);
            $data['qgsmtime'] = filemtime($file);
            foreach ($this->cachedProperties as $prop) {
                $data[$prop] = $this->{$prop};
            }

            try {
                $cache->storeProjectData($data);
            } catch (\Exception $e) {
                \jLog::logEx($e, 'error');
            }
        } else {
            foreach ($this->cachedProperties as $prop) {
                $this->{$prop} = $data[$prop];
            }
        }

        $this->path = $file;
    }

    public function getData($key)
    {
        if (!array_key_exists($key, $this->data)) {
            return null;
        }

        return $this->data[$key];
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
        if (!array_key_exists($authId, $this->data)) {
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

    public function setPropertiesAfterRead(projectConfig $cfg)
    {
        $this->setShortNames($cfg);
        $this->setLayerOpacity($cfg);
        $this->setLayerGroupData($cfg);
        $this->setLayerShowFeatureCount($cfg);
        $this->unsetPropAfterRead($cfg);
    }

    /**
     * Set layers' shortname with XML data.
     *
     * @param projectConfig $qgsXml
     */
    protected function setShortNames(projectConfig $cfg)
    {
        $shortNames = $this->xpathQuery('//maplayer/shortname');
        $layers = $cfg->getProperty('layers');
        if ($shortNames) {
            foreach ($shortNames as $sname) {
                $sname = (string) $sname;
                $xmlLayer = $this->xpathQuery("//maplayer[shortname='{$sname}']");
                if (!$xmlLayer) {
                    continue;
                }
                $xmlLayer = $xmlLayer[0];
                $name = (string) $xmlLayer->layername;
                if ($layers && property_exists($layers, $name)) {
                    $layers->{$name}->shortname = $sname;
                }
            }
        }
        $cfg->setProperty('layers', $layers);
    }

    /**
     * Set layers' opacity with XML data.
     *
     * @param projectConfig $qgsXml
     */
    protected function setLayerOpacity(projectConfig $cfg)
    {
        $layerWithOpacities = $this->xpathQuery('//maplayer/layerOpacity[.!=1]/parent::*');
        $layers = $cfg->getProperty('layers');
        if ($layerWithOpacities) {
            foreach ($layerWithOpacities as $layerWithOpacitiy) {
                $name = (string) $layerWithOpacitiy->layername;
                if ($layers && property_exists($layers, $name)) {
                    $opacity = (float) $layerWithOpacitiy->layerOpacity;
                    $layers->{$name}->opacity = $opacity;
                }
            }
        }
        $cfg->setProperty('layers', $layers);
    }

    /**
     * Set layers' group infos.
     *
     * @param projectConfig $qgsXml
     */
    protected function setLayerGroupData(projectConfig $cfg)
    {
        $groupsWithShortName = $this->xpathQuery("//layer-tree-group/customproperties/property[@key='wmsShortName']/parent::*/parent::*");
        $layers = $cfg->getProperty('layers');
        if ($groupsWithShortName) {
            foreach ($groupsWithShortName as $group) {
                $name = (string) $group['name'];
                $shortNameProperty = $group->xpath("customproperties/property[@key='wmsShortName']");
                if ($shortNameProperty && count($shortNameProperty) > 0) {
                    $shortNameProperty = $shortNameProperty[0];
                    $sname = (string) $shortNameProperty['value'];
                    if ($layers && property_exists($layers, $name)) {
                        $layers->{$name}->shortname = $sname;
                    }
                }
            }
        }
        $groupsMutuallyExclusive = $this->xpathQuery("//layer-tree-group[@mutually-exclusive='1']");
        if ($groupsMutuallyExclusive) {
            foreach ($groupsMutuallyExclusive as $group) {
                $name = (string) $group['name'];
                if ($layers && property_exists($layers, $name)) {
                    $layers->{$name}->smutuallyExclusive = 'True';
                }
            }
        }
        $cfg->setProperty('layers', $layers);
    }

    /**
     * Set layers' last infos.
     *
     * @param projectConfig $qgsXml
     */
    protected function setLayerShowFeatureCount(projectConfig $cfg)
    {
        $layersWithShowFeatureCount = $this->xpathQuery("//layer-tree-layer/customproperties/property[@key='showFeatureCount']/parent::*/parent::*");
        if ($layersWithShowFeatureCount) {
            foreach ($layersWithShowFeatureCount as $layer) {
                $name = (string) $layer['name'];
                $cfgLayers = $cfg->getProperty('layers');
                if ($cfgLayers && property_exists($cfgLayers, $name)) {
                    $cfgLayers->{$name}->showFeatureCont = 'True';
                }
            }
        }
        $cfg->setProperty('layers', $cfgLayers);
    }

    /**
     * Set/Unset some properties after reading the config file.
     *
     * @param projectConfig $qgsXml
     */
    protected function unsetPropAfterRead(projectConfig $cfg)
    {
        //remove plugin layer
        $pluginLayers = $this->xpathQuery('//maplayer[type="plugin"]');
        if ($pluginLayers) {
            foreach ($pluginLayers as $layer) {
                $name = (string) $layer->layername;
                $layers = $cfg->getProperty('layers');
                if ($layers && property_exists($layers, $name)) {
                    $cfg->unsetProp('layers', $name);
                }
            }
        }
        //unset cache for editionLayers
        $eLayers = $cfg->getProperty('editionLayers');
        $layers = $cfg->getProperty('layers');
        if ($eLayers) {
            foreach ($eLayers as $key => $obj) {
                if (property_exists($layers, $key)) {
                    $layers->{$key}->cached = 'False';
                    $layers->{$key}->clientCacheExpiration = 0;
                    if (property_exists($layers->{$key}, 'cacheExpiration')) {
                        unset($layers->{$key}->cacheExpiration);
                    }
                    $cfg->setProperty('layers', $layers);
                }
            }
        }
        //unset cache for loginFilteredLayers
        $loginFiltered = $cfg->getProperty('loginFilteredLayers');
        $layers = $cfg->getProperty('layers');
        if ($loginFiltered) {
            foreach ($loginFiltered as $key => $obj) {
                if (property_exists($layers, $key)) {
                    $layers->{$key}->cached = 'False';
                    $layers->{$key}->clientCacheExpiration = 0;
                    if (property_exists($layers->{$key}, 'cacheExpiration')) {
                        unset($layers->{$key}->cacheExpiration);
                    }
                }
            }
        }
        //unset displayInLegend for geometryType none or unknown
        foreach ($layers as $key => $obj) {
            if (property_exists($layers->{$key}, 'geometryType') &&
                 ($layers->{$key}->geometryType == 'none' ||
                     $layers->{$key}->geometryType == 'unknown')
            ) {
                $layers->{$key}->displayInLegend = 'False';
            }
        }
        $cfg->setProperty('layers', $layers);
    }

    /**
     * @param $layerId
     *
     * @return null|int|string
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
     * @param $layerId
     *
     * @return null|qgisMapLayer|qgisVectorLayer
     */
    public function getLayer($layerId)
    {
        /** @var array[] $layers */
        $layers = array_filter($this->layers, function ($layer) use ($layerId) {
            return $layer['id'] == $layerId;
        });
        if (count($layers)) {
            // get first key found in the filtered layers
            $k = key($layers);
            if ($layers[$k]['type'] == 'vector') {
                return new \qgisVectorLayer($this, $layers[$k]);
            }

            return new \qgisMapLayer($this, $layers[$k]);
        }

        return null;
    }

    /**
     * @param string $key
     *
     * @return null|qgisMapLayer|qgisVectorLayer
     */
    public function getLayerByKeyword($key)
    {
        /** @var array[] $layers */
        $layers = array_filter($this->layers, function ($layer) use ($key) {
            return in_array($key, $layer['keywords']);
        });
        if (count($layers)) {
            // get first key found in the filtered layers
            $k = key($layers);
            if ($layers[$k]['type'] == 'vector') {
                return new \qgisVectorLayer($this, $layers[$k]);
            }

            return new \qgisMapLayer($this, $layers[$k]);
        }

        return null;
    }

    /**
     * @param string $key
     *
     * @return qgisMapLayer[]|qgisVectorLayer[]
     */
    public function findLayersByKeyword($key)
    {
        /** @var array[] $foundLayers */
        $foundLayers = array_filter($this->layers, function ($layer) use ($key) {
            return in_array($key, $layer['keywords']);
        });
        $layers = array();
        if ($foundLayers) {
            foreach ($foundLayers as $layer) {
                if ($layer['type'] == 'vector') {
                    $layers[] = new \qgisVectorLayer($this, $layer);
                } else {
                    $layers[] = new \qgisMapLayer($this, $layer);
                }
            }
        }

        return $layers;
    }

    /**
     * Execute an xpath Query on the XML content and return the result.
     *
     * @param string $query The query to execute
     */
    public function xpathQuery($query)
    {
        $ret = $this->xml->xpath($query);
        if (!$ret || empty($ret)) {
            $ret = null;
        }

        return $ret;
    }

    /**
     * @param SimpleXMLElement $xml
     * @param string           $layerId
     *
     * @return SimpleXMLElement[]
     */
    protected function getXmlLayer2($xml, $layerId)
    {
        return $xml->xpath("//maplayer[id='{$layerId}']");
    }

    /**
     * @param string $layerId
     * @param mixed  $layers
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

    public function getPrintTemplates()
    {
        // get restricted composers
        $rComposers = array();
        $restrictedComposers = $this->xml->xpath('//properties/WMSRestrictedComposers/value');
        if ($restrictedComposers && count($restrictedComposers) > 0) {
            foreach ($restrictedComposers as $restrictedComposer) {
                $rComposers[] = (string) $restrictedComposer;
            }
        }

        $services = $this->services;
        // get composer qg project version < 3
        $composers = $this->xml->xpath('//Composer');
        if ($composers && count($composers) > 0) {
            foreach ($composers as $composer) {
                // test restriction
                if (in_array((string) $composer['title'], $rComposers)) {
                    continue;
                }
                // get composition element
                $composition = $composer->xpath('Composition');
                if (!$composition || count($composition) == 0) {
                    continue;
                }
                $composition = $composition[0];

                // init print template element
                $printTemplate = array(
                    'title' => (string) $composer['title'],
                    'width' => (int) $composition['paperWidth'],
                    'height' => (int) $composition['paperHeight'],
                    'maps' => array(),
                    'labels' => array(),
                );

                // get composer maps
                $cMaps = $composer->xpath('.//ComposerMap');
                if ($cMaps && count($cMaps) > 0) {
                    foreach ($cMaps as $cMap) {
                        $cMapItem = $cMap->xpath('ComposerItem');
                        if (count($cMapItem) == 0) {
                            continue;
                        }
                        $cMapItem = $cMapItem[0];
                        $ptMap = array(
                            'id' => 'map'.(string) $cMap['id'],
                            'width' => (int) $cMapItem['width'],
                            'height' => (int) $cMapItem['height'],
                        );

                        // Before 2.6
                        if (property_exists($cMap->attributes(), 'overviewFrameMap') and (string) $cMap['overviewFrameMap'] != '-1') {
                            $ptMap['overviewMap'] = 'map'.(string) $cMap['overviewFrameMap'];
                        }
                        // >= 2.6
                        $cMapOverviews = $cMap->xpath('ComposerMapOverview');
                        foreach ($cMapOverviews as $cMapOverview) {
                            if ($cMapOverview and (string) $cMapOverview->attributes()->frameMap != '-1') {
                                $ptMap['overviewMap'] = 'map'.(string) $cMapOverview->attributes()->frameMap;
                            }
                        }
                        // Grid
                        $cMapGrids = $cMap->xpath('ComposerMapGrid');
                        foreach ($cMapGrids as $cMapGrid) {
                            if ($cMapGrid and (string) $cMapGrid->attributes()->show != '0') {
                                $ptMap['grid'] = 'True';
                            }
                        }
                        // In QGIS 3.*
                        // Layout maps now use a string UUID as "id", let's assume that the first map
                        // has id 0 and so on ...
                        if (version_compare($services->qgisServerVersion, '3.0', '>=')) {
                            $ptMap['id'] = 'map'.(string) count($printTemplate['maps']);
                        }
                        $printTemplate['maps'][] = $ptMap;
                    }
                }

                // get composer labels
                $cLabels = $composer->xpath('.//ComposerLabel');
                if ($cLabels && count($cLabels) > 0) {
                    foreach ($cLabels as $cLabel) {
                        $cLabelItem = $cLabel->xpath('ComposerItem');
                        if (!$cLabelItem || count($cLabelItem) == 0) {
                            continue;
                        }
                        $cLabelItem = $cLabelItem[0];
                        if ((string) $cLabelItem['id'] == '') {
                            continue;
                        }
                        $printTemplate['labels'][] = array(
                            'id' => (string) $cLabelItem['id'],
                            'htmlState' => (int) $cLabel['htmlState'],
                            'text' => (string) $cLabel['labelText'],
                        );
                    }
                }

                // get composer attribute tables
                $cTables = $composer->xpath('.//ComposerAttributeTableV2');
                if ($cTables && count($cTables) > 0) {
                    foreach ($cTables as $cTable) {
                        $printTemplate['tables'][] = array(
                            'composerMap' => (int) $cTable['composerMap'],
                            'vectorLayer' => (string) $cTable['vectorLayer'],
                        );
                    }
                }

                // Atlas
                $Atlas = $composer->xpath('Atlas');
                if (count($Atlas) == 1) {
                    $Atlas = $Atlas[0];
                    $printTemplate['atlas'] = array(
                        'enabled' => (string) $Atlas['enabled'],
                        'coverageLayer' => (string) $Atlas['coverageLayer'],
                    );
                }
                $printTemplates[] = $printTemplate;
            }
        }
        // get layout qgs project version >= 3
        $layouts = $this->xml->xpath('//Layout');
        if ($layouts && count($layouts) > 0 &&
            version_compare($services->qgisServerVersion, '3.0', '>=')) {
            foreach ($layouts as $layout) {
                // test restriction
                if (in_array((string) $layout['name'], $rComposers)) {
                    continue;
                }
                // get page element
                $page = $layout->xpath('PageCollection/LayoutItem[@type="65638"]');
                if (!$page || count($page) == 0) {
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
                if ($lMaps && count($lMaps) > 0) {
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
                if ($lLabels && count($lLabels) > 0) {
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

                // get layout attribute tables
                $lTables = $layout->xpath('LayoutMultiFrame[@type="65649"]');
                if ($lTables && count($lTables) > 0) {
                    foreach ($lTables as $lTable) {
                        $composerMap = -1;
                        if (isset($lTable['mapUuid'])) {
                            $mapUuid = (string) $lTable['mapUuid'];
                            if (!array_key_exists($mapUuid, $mapUuidId)) {
                                $mapId = $mapUuidId[$mapUuid];
                                $composerMap = (string) str_replace('map', '', $mapId);
                            }
                        }

                        $printTemplate['tables'][] = array(
                            'composerMap' => $composerMap,
                            'vectorLayer' => (string) $lTable['vectorLayer'],
                            'vectorLayerName' => (string) $lTable['vectorLayerName'],
                        );
                    }
                }

                // Atlas
                $atlas = $layout->xpath('Atlas');
                if (count($atlas) == 1) {
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

    public function readLocateByLayers(&$locateByLayer)
    {
        // collect layerIds
        $locateLayerIds = array();
        foreach ($locateByLayer as $k => $v) {
            $locateLayerIds[] = $v->layerId;
        }
        // update locateByLayer with alias and filter information
        foreach ($locateByLayer as $k => $v) {
            $xmlLayer = $this->getXmlLayer2($this->data, $v->layerId);
            if (count($xmlLayer) == 0) {
                continue;
            }
            $xmlLayerZero = $xmlLayer[0];
            // aliases
            $alias = $xmlLayerZero->xpath("aliases/alias[@field='".$v->fieldName."']");
            if ($alias && count($alias) != 0) {
                $alias = $alias[0];
                $v->fieldAlias = (string) $alias['name'];
                $locateByLayer->{$k} = $v;
            }
            if (property_exists($v, 'filterFieldName')) {
                $alias = $xmlLayerZero->xpath("aliases/alias[@field='".$v->filterFieldName."']");
                if ($alias && count($alias) != 0) {
                    $alias = $alias[0];
                    $v->filterFieldAlias = (string) $alias['name'];
                    $locateByLayer->{$k} = $v;
                }
            }
            // vectorjoins
            $vectorjoins = $xmlLayerZero->xpath('vectorjoins/join');
            if ($vectorjoins && count($vectorjoins) != 0) {
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

    public function readEditionLayers(&$editionLayers)
    {
        foreach ($editionLayers as $key => $obj) {
            $layerXml = $this->getXmlLayer2($this->data, $obj->layerId);
            if (count($layerXml) == 0) {
                continue;
            }
            $layerXmlZero = $layerXml[0];
            $provider = $layerXmlZero->xpath('provider');
            $provider = (string) $provider[0];
            if ($provider == 'spatialite') {
                unset($editionLayers->{$key});
            }
        }
    }

    public function readAttributeLayers(&$attributeLayers)
    {
        // Get field order & visibility
        foreach ($attributeLayers as $key => $obj) {
            $layerXml = $this->getXmlLayer2($this->data, $obj->layerId);
            if (count($layerXml) == 0) {
                continue;
            }
            $layerXmlZero = $layerXml[0];
            $attributetableconfigXml = $layerXmlZero->xpath('attributetableconfig');
            if (count($attributetableconfigXml) == 0) {
                continue;
            }
            $attributetableconfig = str_replace(
                '@',
                '',
                json_encode($attributetableconfigXml[0])
            );
            $obj->attributetableconfig = json_decode($attributetableconfig);
            $attributeLayers->{$key} = $obj;
        }
    }

    /**
     * @param SimpleXMLElement $xml
     * @param $cfg
     * @param mixed $layers
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
            if ($customOrderZero->attributes()->enabled == 1) {
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
            if ($customOrderZero->attributes()->enabled == 1) {
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
                    if ($layer->attributes()->drawingOrder and $layer->attributes()->drawingOrder >= 0) {
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
     * @param mixed $qgsPath
     */
    protected function readXmlProject($qgsPath)
    {
        if (!file_exists($qgsPath)) {
            throw new \Exception('The QGIS project '.basename($qgsPath).' does not exist!');
        }

        $this->path = $qgsPath;
        $qgsXml = $this->xml;
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
        $qgisRoot = $qgsXml->xpath('//qgis');
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
        $qgisProjectVersion = (int) $a;
        $this->qgisProjectVersion = $qgisProjectVersion;

        $this->WMSInformation = $this->readWMSInformation($qgsXml);
        $this->canvasColor = $this->readCanvasColor($qgsXml);
        $this->allProj4 = $this->readAllProj4($qgsXml);
        $this->relations = $this->readRelations($qgsXml);
        $this->themes = $this->readThemes($qgsXml);
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

            $values = array();
            foreach ($qgsLoad->properties->WMSKeywordList->value as $value) {
                if ((string) $value !== '') {
                    $values[] = (string) $value;
                }
            }
            $WMSKeywordList = implode(', ', $values);

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
     * @param SimpleXMLElement $xml
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
     * @param SimpleXMLElement $xml
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
     * @param SimpleXMLElement $xml
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
                    $themes[(string) $themeObj->name]['layers'][(string) $layerObj->id] = array(
                        'style' => (string) $layerObj->style,
                        'expanded' => (string) $layerObj->expanded,
                    );
                }

                // Copy expanded group nodes
                foreach ($theme->{'expanded-group-nodes'}->{'expanded-group-node'} as $expandedGroupNode) {
                    $expandedGroupNodeObj = $expandedGroupNode->attributes();
                    $themes[(string) $themeObj->name]['expandedGroupNode'][] = (string) $expandedGroupNodeObj->id;
                }
            }

            return $themes;
        }

        return null;
    }

    /**
     * @param SimpleXMLElement $xml
     *
     * @return null|array[]
     */
    protected function readRelations($xml)
    {
        $xmlRelations = $xml->xpath('//relations');
        $relations = array();
        $pivotGather = array();
        $pivot = array();
        if ($xmlRelations) {
            foreach ($xmlRelations[0] as $relation) {
                $relationObj = $relation->attributes();
                $fieldRefObj = $relation->fieldRef->attributes();
                if (!array_key_exists((string) $relationObj->referencedLayer, $relations)) {
                    $relations[(string) $relationObj->referencedLayer] = array();
                }

                $relations[(string) $relationObj->referencedLayer][] = array(
                    'referencingLayer' => (string) $relationObj->referencingLayer,
                    'referencedField' => (string) $fieldRefObj->referencedField,
                    'referencingField' => (string) $fieldRefObj->referencingField,
                );

                if (!array_key_exists((string) $relationObj->referencingLayer, $pivotGather)) {
                    $pivotGather[(string) $relationObj->referencingLayer] = array();
                }

                $pivotGather[(string) $relationObj->referencingLayer][(string) $relationObj->referencedLayer] = (string) $fieldRefObj->referencingField;
            }

            // Keep only child with at least to parents
            foreach ($pivotGather as $pi => $vo) {
                if (count($vo) > 1) {
                    $pivot[$pi] = $vo;
                }
            }
            $relations['pivot'] = $pivot;

            return $relations;
        }

        return null;
    }

    /**
     * @param SimpleXMLElement $xml
     *
     * @return bool
     */
    protected function readUseLayerIDs($xml)
    {
        $WMSUseLayerIDs = $xml->xpath('//properties/WMSUseLayerIDs');

        return $WMSUseLayerIDs && count($WMSUseLayerIDs) > 0 && $WMSUseLayerIDs[0] == 'true';
    }

    /**
     * @param SimpleXMLElement $xml
     *
     * @throws Exception
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
                $qgsProj = new qgisProject(realpath(dirname($this->path).DIRECTORY_SEPARATOR.(string) $attributes->project), $this->appContext);
                $layer = $qgsProj->getLayerDefinition((string) $attributes->id);
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

                    $layer['fields'] = $fields;
                    $layer['aliases'] = $aliases;
                    $layer['defaults'] = $defaults;
                    $layer['constraints'] = $constraints;
                    $layer['wfsFields'] = $wfsFields;

                    $excludeFields = $xmlLayer->xpath('.//excludeAttributesWFS/attribute');
                    if ($excludeFields && count($excludeFields) > 0) {
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
}
