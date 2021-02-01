<?php
/**
 * Manage and give access to lizmap configuration.
 *
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project;

use Lizmap\App;

class Project
{
    /**
     * @var Repository
     */
    protected $repository;
    /**
     * @var QgisProject QGIS project XML
     */
    protected $qgis;
    /**
     * @var ProjectConfig CFG project JSON
     */
    protected $cfg;

    /**
     * @var array services properties
     */
    protected $properties = array(
        'repository',
        'id',
        'title',
        'abstract',
        'proj',
        'bbox',
    );

    /**
     * @var App\AppContextInterface The jelixInfos instance
     */
    protected $appContext;

    /**
     * @var \LizmapServices The lizmapServices instance
     */
    protected $services;

    /**
     * @var string .qgs file path
     */
    protected $file;
    /**
     * Lizmap project key.
     *
     * @var string
     */
    protected $key = '';

    /**
     * @var array Lizmap repository configuration data
     */
    protected $data = array();

    /**
     * Version of QGIS which wrote the project.
     *
     * @var null|int
     */
    protected $QgisProjectVersion;

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
     * @var array list of layer orders: layer name => order
     */
    protected $layersOrder = array();

    /**
     * @var array
     */
    protected $printCapabilities = array();

    /**
     * @var array
     */
    protected $locateByLayer = array();

    /**
     * @var array
     */
    protected $formFilterLayers = array();

    /**
     * @var array
     */
    protected $editionLayers = array();

    /**
     * @var array
     */
    protected $attributeLayers = array();

    /**
     * @var bool
     */
    protected $useLayerIDs = false;

    /**
     * @var array
     */
    protected $layers = array();

    /**
     * @var null
     */
    protected $xml;

    /**
     * @var array
     */
    protected $options;

    /**
     * @var mixed
     */
    protected $cfgContent;

    /**
     * @var array List of cached properties
     */
    protected $cachedProperties = array('WMSInformation', 'canvasColor', 'allProj4',
        'relations', 'themes', 'layersOrder', 'printCapabilities', 'locateByLayer', 'formFilterLayers',
        'editionLayers', 'attributeLayers', 'useLayerIDs', 'layers', 'data', 'cfgContent', 'options', 'QgisProjectVersion', );

    /**
     * @var string
     */
    private $spatialiteExt;

    protected $path;

    /**
     * version of the format of data stored in the cache.
     *
     * This number should be increased each time you change the structure of the
     * properties of QgisProject (ex: adding some new data properties into the $layers).
     * So you'll be sure that the cache will be updated when Lizmap code source
     * is updated on a server
     */
    const CACHE_FORMAT_VERSION = 1;

    /**
     * @var ProjectCache
     */
    protected $cacheHandler;

    /**
     * constructor.
     *
     * @param string                  $key        : the project name
     * @param Repository              $rep        : the repository
     * @param App\AppContextInterface $appContext the instance of jelixInfos
     */
    public function __construct($key, Repository $rep, App\AppContextInterface $appContext, \LizmapServices $services)
    {
        $this->key = $key;
        $this->repository = $rep;
        $this->appContext = $appContext;
        $this->services = $services;

        $file = $this->getQgisPath();

        // Verifying if the files exist
        if (!file_exists($file)) {
            throw new UnknownLizmapProjectException('The QGIS project '.$file.' does not exist!');
        }
        if (!file_exists($file.'.cfg')) {
            throw new UnknownLizmapProjectException('The lizmap config '.$file.'.cfg does not exist!');
        }

        $this->cacheHandler = new ProjectCache($file, $this->appContext);

        $data = $this->cacheHandler->retrieveProjectData();
        if ($data === false) {
            // FIXME reading XML could take time, so many process could
            // read it and construct the cache at the same time. We should
            // have a kind of lock to avoid this issue.
            try {
                $this->cfg = new ProjectConfig($file.'.cfg');
            } catch (UnknownLizmapProjectException $e) {
                throw $e;
            }

            try {
                $this->qgis = new QgisProject($file, $services, $this->appContext);
            } catch (UnknownLizmapProjectException $e) {
                throw $e;
            }
            $this->readProject($key, $rep);
            foreach ($this->cachedProperties as $prop) {
                if (isset($this->{$prop}) && !empty($this->{$prop})) {
                    $data[$prop] = $this->{$prop};
                }
            }
            $data = array_merge($data, $this->qgis->getCacheData($data), $this->cfg->getCacheData($data));
            $this->cacheHandler->storeProjectData($data);
        } else {
            foreach ($this->cachedProperties as $prop) {
                if (array_key_exists($prop, $data)) {
                    $this->{$prop} = $data[$prop];
                }
            }
            $rewriteCache = false;
            foreach ($this->layers as $index => $layer) {
                if (array_key_exists('embedded', $layer) && $layer['embedded'] == '1' && $layer['qgsmtime'] < filemtime($layer['file'])) {
                    $qgsProj = new QgisProject($layer['file'], $services, $this->appContext);
                    $newLayer = $qgsProj->getLayerDefinition($layer['id']);
                    $newLayer['qsgmtime'] = filemtime($layer['file']);
                    $newLayer['file'] = $layer['file'];
                    $newLayer['embedded'] = 1;
                    $newLayer['projectPath'] = $layer['projectPath'];
                    $this->layers[$index] = $newLayer;
                    $data['layers'][$index] = $newLayer;
                    $rewriteCache = true;
                }
            }
            if ($rewriteCache) {
                $this->cacheHandler->storeProjectData($data);
            }

            try {
                $this->cfg = new ProjectConfig($file.'.cfg', $data);
            } catch (UnknownLizmapProjectException $e) {
                throw $e;
            }

            try {
                $this->qgis = new QgisProject($file, $services, $appContext, $data);
            } catch (UnknownLizmapProjectException $e) {
                throw $e;
            }
        }

        $this->path = $file;
    }

    public function clearCache()
    {
        $this->cacheHandler->clearCache();
    }

    /**
     * Read the qgis files.
     *
     * @param string $key
     */
    protected function readProject($key, Repository $rep)
    {
        $qgsXml = $this->qgis;
        $configOptions = $this->cfg->getProperty('options');

        $this->options = $configOptions;
        // Complete data
        $this->data['repository'] = $rep->getKey();
        $this->data['id'] = $key;
        if (!array_key_exists('title', $this->data)) {
            $this->data['title'] = ucfirst($key);
        }
        if (!array_key_exists('abstract', $this->data)) {
            $this->data['abstract'] = '';
        }
        $this->data['proj'] = $configOptions->projection->ref;
        $this->data['bbox'] = implode(', ', $configOptions->bbox);

        // Update WMSInformation
        // $this->WMSInformation = array($this->qgis->getWMSInformation(), 'ProjectCrs' => $this->data['proj']);
        $this->WMSInformation['ProjectCrs'] = $this->data['proj'];
        $this->WMSInformation = array_merge($this->qgis->getWMSInformation(), $this->WMSInformation);

        // get WMS getCapabilities full URL
        $this->data['wmsGetCapabilitiesUrl'] = $this->appContext->getFullUrl(
            'lizmap~service:index',
            array(
                'repository' => $rep->getKey(),
                'project' => $key,
                'SERVICE' => 'WMS',
                'VERSION' => '1.3.0',
                'REQUEST' => 'GetCapabilities',
            )
        );

        // get WMTS getCapabilities full URL
        $this->data['wmtsGetCapabilitiesUrl'] = $this->appContext->getFullUrl(
            'lizmap~service:index',
            array(
                'repository' => $rep->getKey(),
                'project' => $key,
                'SERVICE' => 'WMTS',
                'VERSION' => '1.0.0',
                'REQUEST' => 'GetCapabilities',
            )
        );

        $this->qgis->setPropertiesAfterRead($this->cfg);

        $props = array(
            'printCapabilities',
            'locateByLayers',
            // 'formFilterLayers',
            'editionLayers',
            'layersOrder',
            'attributeLayers',
        );
        foreach ($props as $prop) {
            $method = 'read'.ucfirst($prop);
            $this->{$prop} = $this->{$method}($qgsXml, $this->cfg);
            $this->cfg->setProperty($prop, $this->{$prop});
        }
        $this->qgis->readEditionForms($this->getEditionLayers(), $this);
    }

    public function getQgisPath()
    {
        $path = $this->repository->getPath();
        if (!$this->file && $path != '' && $path != false) {
            $this->file = $path.$this->key.'.qgs';
        }

        return $this->file;
    }

    public function getRelativeQgisPath()
    {
        $services = $this->services;

        $mapParam = $this->getQgisPath();
        if (!$services->isRelativeWMSPath()) {
            return $mapParam;
        }

        $rootRepositories = $services->getRootRepositories();
        if ($rootRepositories != '' && strpos($mapParam, $rootRepositories) === 0) {
            $mapParam = str_replace($rootRepositories, '', $mapParam);
            $mapParam = ltrim($mapParam, '/');
        }

        return $mapParam;
    }

    public function getPath()
    {
        return $this->path;
    }

    public function getQgisProjectVersion()
    {
        return $this->qgis->getQgisProjectVersion();
    }

    public function getRelations()
    {
        return $this->qgis->getRelations();
    }

    public function getThemes()
    {
        return $this->qgis->getThemes();
    }

    public function getLayerDefinition($layerId)
    {
        return $this->qgis->getLayerDefinition($layerId);
    }

    public function getLayerByKeyword($key)
    {
        return $this->qgis->getLayerByKeyword($key, $this);
    }

    public function findLayersByKeyword($key)
    {
        return $this->qgis->findLayersByKeyword($key, $this);
    }

    public function getKey()
    {
        return $this->key;
    }

    public function getRepository()
    {
        return $this->repository;
    }

    public function getFileTime()
    {
        return $this->cacheHandler->getFileTime();
    }

    public function getCfgFileTime()
    {
        return $this->cacheHandler->getCfgFileTime();
    }

    public function getProperties()
    {
        return $this->properties;
    }

    public function getOptions()
    {
        return $this->cfg->getProperty('options');
    }

    public function getLayers()
    {
        return $this->cfg->getProperty('layers');
    }

    public function getLayer($layerId)
    {
        return $this->qgis->getLayer($layerId, $this);
    }

    public function getXmlLayer($layerId)
    {
        return $this->qgis->getXmlLayer($layerId);
    }

    public function getData($key)
    {
        if (array_key_exists($key, $this->data)) {
            return $this->data[$key];
        }

        return $this->qgis->getData($key);
    }

    public function getProj4($authId)
    {
        return $this->qgis->getProj4($authId);
    }

    public function getAllProj4()
    {
        return $this->qgis->getAllProj4();
    }

    public function getCanvasColor()
    {
        return $this->qgis->getCanvasColor();
    }

    public function getWMSInformation()
    {
        if (isset($this->WMSInformation) && count($this->WMSInformation) > 1) {
            return $this->WMSInformation;
        }

        return $this->qgis->getWMSInformation();
    }

    public function hasLocateByLayer()
    {
        $locate = $this->cfg->getProperty('locateByLayer');
        if ($locate && count((array) $locate)) {
            return true;
        }

        return false;
    }

    public function hasFormFilterLayers()
    {
        $form = $this->cfg->getProperty('formFilterLayers');
        if ($form && count((array) $form)) {
            return true;
        }

        return false;
    }

    public function getFormFilterLayersConfig()
    {
        return $this->cfg->getProperty('formFilterLayers');
    }

    public function hasTimemanagerLayers()
    {
        $timeManager = $this->cfg->getProperty('timemanagerLayers');
        if ($timeManager && count((array) $timeManager)) {
            return true;
        }

        return false;
    }

    public function hasAtlasEnabled()
    {
        $options = $this->getOptions();
        $atlas = $this->cfg->getProperty('atlas');
        if ((property_exists($options, 'atlasEnabled') && $options->atlasEnabled == 'True') // Legacy LWC < 3.4 (only one layer)
            || ($atlas && property_exists($atlas, 'layers') && count((array) $atlas) > 0)) { // Multiple atlas
            return true;
        }

        return false;
    }

    /**
     * @return mixed
     */
    public function getQgisServerPlugins()
    {
        $qgisServer = new \qgisServer();

        return $qgisServer->getPlugins($this);
    }

    public function hasTooltipLayers()
    {
        $tooltip = $this->cfg->getProperty('tooltipLayers');
        if ($tooltip && count((array) $tooltip)) {
            return true;
        }

        return false;
    }

    public function hasAttributeLayers($onlyDisplayedLayers = false)
    {
        $attributeLayers = $this->cfg->getProperty('attributeLayers');
        if ($attributeLayers) {
            $hasDisplayedLayer = !$onlyDisplayedLayers;
            foreach ($attributeLayers as $key => $obj) {
                if ($onlyDisplayedLayers
                    && (!property_exists($obj, 'hideLayer')
                    || strtolower($obj->hideLayer) != 'true')
                ) {
                    $hasDisplayedLayer = true;
                }
            }
            if (count((array) $attributeLayers) && $hasDisplayedLayer) {
                return true;
            }
        }

        return false;
    }

    public function hasFtsSearches()
    {
        // Virtual jdb profile corresponding to the layer database
        $project = $this->key;
        $repository = $this->repository->getKey();

        $repositoryPath = realpath($this->repository->getPath());
        $repositoryPath = str_replace('\\', '/', $repositoryPath);
        $searchDatabase = $repositoryPath.'/default.qfts';

        if (!file_exists($searchDatabase)) {
            // Search for project database
            $searchDatabase = $repositoryPath.'/'.$project.'.qfts';
        }
        if (!file_exists($searchDatabase)) {
            return false;
        }

        $jDbParams = array(
            'driver' => 'pdo',
            'dsn' => 'sqlite:'.$searchDatabase,
        );

        // Create the virtual jdb profile
        $searchJDbName = 'jdb_'.$repository.'_'.$project;
        $this->appContext->createVirtualProfile('jdb', $searchJDbName, $jDbParams);

        $searches = array();

        // Check FTS db ( tables and geometry storage
        try {
            $cnx = $this->appContext->getDbConnection($searchJDbName);

            // Get metadata
            $sql = "
            SELECT search_id, search_name, layer_name, geometry_storage, srid
            FROM quickfinder_toc
            WHERE geometry_storage != 'wkb'
            ORDER BY priority
            ";
            $res = $cnx->query($sql);
            foreach ($res as $item) {
                $searches[$item->search_id] = array(
                    'search_name' => $item->search_name,
                    'layer_name' => $item->layer_name,
                    'srid' => $item->srid,
                );
            }
        } catch (\Exception $e) {
            return false;
        }
        if (count($searches) == 0) {
            return false;
        }

        return array(
            'jdb_profile' => $searchJDbName,
            'searches' => $searches,
        );
    }

    public function hasEditionLayers()
    {
        $editionLayers = $this->cfg->getProperty('editionLayers');
        if ($editionLayers) {
            if (!$this->appContext->aclCheck('lizmap.tools.edition.use', $this->repository->getKey())) {
                return false;
            }
            $count = 0;
            foreach ($editionLayers as $key => $eLayer) {
                // Check if user groups intersects groups allowed by project editor
                // If user is admin, no need to check for given groups
                if (property_exists($eLayer, 'acl') && $eLayer->acl) {
                    // Check if configured groups white list and authenticated user groups list intersects
                    $editionGroups = $eLayer->acl;
                    $editionGroups = array_map('trim', explode(',', $editionGroups));
                    if (is_array($editionGroups) && count($editionGroups) > 0) {
                        $userGroups = $this->appContext->aclUserGroupsId();
                        if (array_intersect($editionGroups, $userGroups) || $this->appContext->aclCheck('lizmap.admin.repositories.delete')) {
                            // User group(s) correspond to the groups given for this edition layer
                            // or user is admin
                            ++$count;
                            $this->cfg->unsetProperty('editionLayers', $key, 'acl');
                        } else {
                            // No match found, we deactivate the edition layer
                            $this->cfg->unsetProperty('editionLayers', $key);
                        }
                    }
                } else {
                    ++$count;
                }
            }
            if ($count != 0) {
                return true;
            }

            return false;
        }

        return false;
    }

    public function getEditionLayers()
    {
        return $this->cfg->getProperty('editionLayers');
    }

    public function findEditionLayerByName($name)
    {
        if (!$this->hasEditionLayers()) {
            return null;
        }

        return $this->cfg->getEditionLayerByName($name);
    }

    /**
     * @param $layerId
     *
     * @return null|array
     */
    public function findEditionLayerByLayerId($layerId)
    {
        if (!$this->hasEditionLayers()) {
            return null;
        }

        return $this->cfg->getEditionLayerByLayerId($layerId);
    }

    /**
     * @return bool
     */
    public function hasLoginFilteredLayers()
    {
        $login = (array) $this->cfg->getProperty('loginFilteredLayers');
        if ($login && count((array) $login)) {
            return true;
        }

        return false;
    }

    public function getLoginFilteredConfig($layerName)
    {
        if (!$this->hasLoginFilteredLayers()) {
            return null;
        }

        $ln = $layerName;
        // In case $layerName is a WFS TypeName
        $layerByTypeName = $this->cfg->findLayerByTypeName($layerName);
        if ($layerByTypeName) {
            $ln = $layerByTypeName->name;
        }

        $login = $this->cfg->getProperty('loginFilteredLayers');
        if (!$login || !property_exists($login, $ln)) {
            return null;
        }

        return $login->{$ln};
    }

    /**
     * Get login filters, get expressions for layers based on login filtered
     * config.
     *
     * @param string[] $layers  : layers' name list
     * @param bool     $edition : get login filters for edition
     *
     * @return array
     */
    public function getLoginFilters($layers, $edition = false)
    {
        $filters = array();

        if (!$this->hasLoginFilteredLayers()) {
            return $filters;
        }

        if (!is_array($layers)) {
            return $filters;
        }

        foreach ($layers as $layerName) {
            $lName = $layerName;

            // In case $layerName is a WFS TypeName
            $layerByTypeName = $this->cfg->findLayerByTypeName($layerName);
            if ($layerByTypeName) {
                $lName = $layerByTypeName->name;
            }

            // Get config
            $loginFilteredConfig = $this->getLoginFilteredConfig($lName);
            if ($loginFilteredConfig == null) {
                continue;
            }

            // If login filter is configured for edition only and the expression
            // is not requested for edition, do not return expression
            if (property_exists($loginFilteredConfig, 'edition_only')
                && $this->optionToBoolean($loginFilteredConfig->edition_only)
                && !$edition) {
                continue;
            }

            // attribute to filter
            $attribute = strtolower($loginFilteredConfig->filterAttribute);

            // default no user connected
            $filter = "\"{$attribute}\" = 'all'";

            // A user is connected
            if ($this->appContext->userIsConnected()) {
                $user = $this->appContext->getUserSession();
                $login = $user->login;
                if (property_exists($loginFilteredConfig, 'filterPrivate')
                    && $this->optionToBoolean($loginFilteredConfig->filterPrivate)
                ) {
                    $filter = "\"{$attribute}\" IN ( '".$login."' , 'all' )";
                } else {
                    $userGroups = $this->appContext->aclUserGroupsId();
                    $flatGroups = implode("' , '", $userGroups);
                    $filter = "\"{$attribute}\" IN ( '".$flatGroups."' , 'all' )";
                }
            }

            $filters[$layerName] = array_merge(
                (array) $loginFilteredConfig,
                array('filter' => $filter, 'layername' => $lName)
            );
        }

        return $filters;
    }

    /**
     * Get login filtered config with the build expression.
     *
     * @param string $layerName : layer's name
     * @param bool   $edition   : get login filters for edition
     *
     * @return array the login filtered config with build expression
     */
    public function getLoginFilter($layerName, $edition = false)
    {
        $loginFilters = $this->getLoginFilters(array($layerName), $edition);

        // login filters array is empty
        if (empty($loginFilters)) {
            return array();
        }

        // layer not in login filters array
        if (!array_key_exists($layerName, $loginFilters)) {
            return array();
        }

        return $loginFilters[$layerName];
    }

    private function optionToBoolean($configString)
    {
        $ret = false;
        if (strtolower((string) $configString) == 'true') {
            $ret = true;
        }

        return $ret;
    }

    protected function objToArray($obj)
    {
        return json_decode(json_encode($obj), true);
    }

    /**
     * @return array|bool
     */
    public function getDatavizLayersConfig()
    {
        $datavizLayers = $this->cfg->getProperty('datavizLayers');
        if (!$datavizLayers) {
            return false;
        }
        $config = array(
            'layers' => array(),
            'dataviz' => array(),
            'locale' => $this->appContext->appConfig()->locale,
        );
        foreach ($datavizLayers as $order => $lc) {
            if (!property_exists($lc, 'layerId')) {
                continue;
            }
            $layer = $this->cfg->findLayerByAnyName($lc->layerId);
            if (!$layer) {
                continue;
            }
            $title = $layer->title;
            if (!empty($lc->title)) {
                $title = $lc->title;
            }
            $plotConf = array(
                'plot_id' => $lc->order,
                'layer_id' => $layer->id,
                'title' => $title,
                'plot' => array(
                    'type' => $lc->type,
                    'x_field' => $lc->x_field,
                ),
            );

            $properties = array(
                'y_field',
                'z_field',
                'x_field',
                'y2_field',
                'color',
                'color2',
                'colorfield',
                'colorfield2',
                'aggregation',
                'html_template',
                'display_when_layer_visible',
                'traces',
                'layout',
            );
            foreach ($properties as $prop) {
                if (property_exists($lc, $prop)) {
                    $plotConf['plot'][$prop] = $lc->{$prop};
                }
            }

            if (property_exists($lc, 'popup_display_child_plot')) {
                $plotConf['popup_display_child_plot'] = $lc->popup_display_child_plot;
            }
            if (property_exists($lc, 'only_show_child')) {
                $plotConf['only_show_child'] = $lc->only_show_child;
            }

            $abstract = $layer->abstract;
            if (property_exists($lc, 'description')) {
                $abstract = $lc->description;
            }
            $plotConf['abstract'] = $abstract;

            $props = array(
                'display_legend' => true,
                'stacked' => false,
                'horizontal' => false,
            );
            foreach ($props as $prop => $default) {
                $value = $default;
                if (property_exists($lc, $prop)) {
                    $value = $this->optionToBoolean($lc->{$prop});
                }
                $plotConf['plot'][$prop] = $value;
            }

            // Add more layout config, written like:
            // layout_config=barmode:stack,bargap:0.5
            if (!empty($lc->layout_config)) {
                $layout_config = array();
                $a = array_map('trim', explode(',', $lc->layout_config));
                foreach ($a as $i) {
                    $b = array_map('trim', explode(':', $i));
                    if (is_array($b) and count($b) == 2) {
                        $c = $b[1];
                        $c = $this->optionToBoolean($c);
                        $layout_config[$b[0]] = $c;
                    }
                }
                if (count($layout_config) > 0) {
                    $plotConf['plot']['layout_config'] = $layout_config;
                }
            }
            $config['layers'][$order] = $plotConf;
        }
        if (empty($config['layers'])) {
            return false;
        }

        $config['dataviz'] = array(
            'location' => 'dock',
            'theme' => 'dark',
        );
        $options = $this->getOptions();
        if ($options && property_exists($options, 'datavizLocation')
            && in_array($options->datavizLocation, array('dock', 'bottomdock', 'right-dock'))
        ) {
            $config['dataviz']['location'] = $options->datavizLocation;
        }
        if (property_exists($options, 'theme')
            and in_array($options->theme, array('dark', 'light'))
        ) {
            $config['dataviz']['theme'] = $options->theme;
        }

        return $config;
    }

    /**
     * @return bool
     */
    public function needsGoogle()
    {
        $configOptions = $this->getOptions();
        $googleProps = array(
            'googleStreets',
            'googleSatellite',
            'googleHybrid',
            'googleTerrain',
        );

        foreach ($googleProps as $google) {
            if (property_exists($configOptions, $google) && $this->optionToBoolean($configOptions->{$google})) {
                return true;
            }
        }

        return property_exists($configOptions, 'externalSearch') && $configOptions->externalSearch == 'google';
    }

    /**
     * @return string
     */
    public function getGoogleKey()
    {
        $configOptions = $this->getOptions();
        $gKey = '';
        if (property_exists($configOptions, 'googleKey')) {
            $gKey = $configOptions->googleKey;
        }

        return $gKey;
    }

    protected function readPrintCapabilities(QgisProject $qgsLoad, ProjectConfig $cfg)
    {
        $printTemplates = array();
        $options = $this->getOptions();
        if ($options && property_exists($options, 'print') && $options->print == 'True') {
            $printTemplates = $qgsLoad->getPrintTemplates();
        }

        return $printTemplates;
    }

    protected function readLocateByLayers(QgisProject $xml, ProjectConfig $cfg)
    {
        $locateByLayer = $cfg->getProperty('locateByLayer');
        if ($locateByLayer) {
            // The method takes a reference
            $xml->readLocateByLayers($locateByLayer);
            // so we can modify it here
            $this->cfg->setProperty('locateByLayer', $locateByLayer);
        }

        return $locateByLayer;
    }

    protected function readFormFilterLayers(QgisProject $xml, ProjectConfig $cfg)
    {
        $formFilterLayers = $cfg->getProperty('formFilterLayer');

        if (!$formFilterLayers) {
            $formFilterLayers = array();
        }

        return $formFilterLayers;
    }

    protected function readEditionLayers(QgisProject $xml, ProjectConfig $cfg)
    {
        $editionLayers = $this->getEditionLayers();

        if ($editionLayers) {
            // Check ability to load spatialite extension
            // And remove ONLY spatialite layers if no extension found
            $spatialiteExt = '';
            if (class_exists('SQLite3')) {
                $spatialiteExt = $this->getSpatialiteExtension();
            }
            if (!$spatialiteExt) {
                $this->appContext->logMessage('Spatialite is not available', 'error');
                $xml->readEditionLayers($editionLayers);
                // so we can ste the data here
                $this->cfg->setProperty('EditionLayers', $editionLayers);
            }
        } else {
            $editionLayers = array();
        }

        return $editionLayers;
    }

    protected function readAttributeLayers(QgisProject $xml, ProjectConfig $cfg)
    {
        $attributeLayers = $cfg->getProperty('attributeLayers');

        if ($attributeLayers) {
            // method takes a reference
            $xml->readAttributeLayers($attributeLayers);
            // so we can modify data here
            $this->cfg->setProperty('attributeLayers', $attributeLayers);
        } else {
            $attributeLayers = array();
        }

        return $attributeLayers;
    }

    /**
     * @param \SimpleXMLElement $xml
     * @param $cfg
     *
     * @return int[]
     */
    protected function readLayersOrder(QgisProject $xml, ProjectConfig $cfg)
    {
        return $this->qgis->readLayersOrder($xml, $this->getLayers());
    }

    public function getLayerNameByIdFromConfig($layerId)
    {
        return $this->qgis->getLayerNameByIdFromConfig($layerId, $this->layers);
    }

    /**
     * @deprecated
     *
     * @param mixed $name
     */
    public function findLayerByAnyName($name)
    {
        return $this->cfg->findLayerByAnyName($name);
    }

    /**
     * @deprecated
     *
     * @param mixed $name
     */
    public function findLayerByName($name)
    {
        return $this->cfg->findLayerByName($name);
    }

    /**
     * @deprecated
     *
     * @param mixed $shortName
     */
    public function findLayerByShortName($shortName)
    {
        return $this->cfg->findLayerByShortName($shortName);
    }

    /**
     * @deprecated
     *
     * @param mixed $title
     */
    public function findLayerByTitle($title)
    {
        return $this->cfg->findLayerByTitle($title);
    }

    /**
     * @deprecated
     *
     * @param mixed $layerId
     */
    public function findLayerByLayerId($layerId)
    {
        return $this->cfg->findLayerByLayerId($layerId);
    }

    /**
     * @deprecated
     *
     * @param mixed $typeName
     */
    public function findLayerByTypeName($typeName)
    {
        return $this->cfg->findLayerByTypeName($typeName);
    }

    /**
     * @return false|string the JSON object corresponding to the configuration
     */
    public function getUpdatedConfig()
    {
        $configJson = $this->cfg->getData();

        // Add an option to display buttons to remove the cache for cached layer
        // Only if appropriate right is found
        if ($this->appContext->aclCheck('lizmap.admin.repositories.delete')) {
            $configJson->options->removeCache = 'True';
        }

        // Remove layerOrder option from config if not required
        if (!empty($this->layersOrder)) {
            $configJson->layersOrder = $this->layersOrder;
        }

        // set printTemplates in config
        $configJson->printTemplates = $this->printCapabilities;

        // Update locate by layer with vecctorjoins
        $configJson->locateByLayer = $this->locateByLayer;

        // Update filter form layers with vecctorjoins
        $configJson->formFilterLayers = $this->formFilterLayers;

        // Update attributeLayers with attributetableconfig
        $configJson->attributeLayers = $this->attributeLayers;

        // Remove FTP remote directory
        if (property_exists($configJson->options, 'remoteDir')) {
            unset($configJson->options->remoteDir);
        }

        // Remove editionLayers from config if no right to access this tool
        if (property_exists($configJson, 'editionLayers')) {
            if ($this->appContext->aclCheck('lizmap.tools.edition.use', $this->repository->getKey())) {
                $configJson->editionLayers = clone $this->editionLayers;
                // Check right to edit this layer (if property "acl" is in config)
                foreach ($configJson->editionLayers as $key => $eLayer) {
                    // Check if user groups intersects groups allowed by project editor
                    // If user is admin, no need to check for given groups
                    if (property_exists($eLayer, 'acl') and $eLayer->acl) {
                        // Check if configured groups white list and authenticated user groups list intersects
                        $editionGroups = $eLayer->acl;
                        $editionGroups = array_map('trim', explode(',', $editionGroups));
                        if (is_array($editionGroups) and count($editionGroups) > 0) {
                            $userGroups = $this->appContext->aclUserGroupsId();
                            if (array_intersect($editionGroups, $userGroups) or $this->appContext->aclCheck('lizmap.admin.repositories.delete')) {
                                // User group(s) correspond to the groups given for this edition layer
                                // or the user is admin
                                unset($configJson->editionLayers->{$key}->acl);
                            } else {
                                // No match found, we deactivate the edition layer
                                unset($configJson->editionLayers->{$key});
                            }
                        }
                    }
                }
            } else {
                unset($configJson->editionLayers);
            }
        }

        // Add export layer right
        if ($this->appContext->aclCheck('lizmap.tools.layer.export', $this->repository->getKey())) {
            $configJson->options->exportLayers = 'True';
        }

        // Add WMS max width ad height
        $services = $this->services;
        if (array_key_exists('wmsMaxWidth', $this->data)) {
            $configJson->options->wmsMaxWidth = $this->data['wmsMaxWidth'];
        } else {
            $configJson->options->wmsMaxWidth = $services->wmsMaxWidth;
        }
        if (array_key_exists('wmsMaxHeight', $this->data)) {
            $configJson->options->wmsMaxHeight = $this->data['wmsMaxHeight'];
        } else {
            $configJson->options->wmsMaxHeight = $services->wmsMaxHeight;
        }

        // Add QGS Server version
        $configJson->options->qgisServerVersion = $services->qgisServerVersion;

        // Update config with layer relations
        $relations = $this->qgis->getRelations();
        if ($relations) {
            $configJson->relations = $relations;
        }

        // Update config with project themes
        $themes = $this->qgis->getThemes();
        if ($themes) {
            $configJson->themes = $themes;
        }
        if ($this->useLayerIDs) {
            $configJson->options->useLayerIDs = 'True';
        }

        // Update searches informations.
        if (!property_exists($configJson->options, 'searches')) {
            $configJson->options->searches = array();
        }
        if (property_exists($configJson->options, 'externalSearch')) {
            $externalSearch = array(
                'type' => 'externalSearch',
                'service' => $configJson->options->externalSearch,
            );
            if ($configJson->options->externalSearch == 'nominatim') {
                $externalSearch['url'] = $this->appContext->getUrl('lizmap~osm:nominatim');
            } elseif ($configJson->options->externalSearch == 'ban') {
                $externalSearch = array(
                    'type' => 'BAN',
                    'service' => 'lizmapBan',
                    'url' => $this->appContext->getUrl('lizmap~ban:search'),
                );
            }
            $configJson->options->searches[] = (object) $externalSearch;
            unset($configJson->options->externalSearch);
        }
        // Add FTS sqlite searches (db created with from quickfinder)
        $ftsSearches = $this->hasFtsSearches();
        if ($ftsSearches) {
            $configJson->options->searches[] = (object) array(
                'type' => 'QuickFinder',
                'service' => 'lizmapQuickFinder',
                'url' => $this->appContext->getUrl('lizmap~search:get'),
            );
        }
        // Events to get additional searches
        $searchServices = $this->appContext->eventNotify('searchServiceItem', array('repository' => $this->repository->getKey(), 'project' => $this->getKey()))->getResponse();
        foreach ($searchServices as $searchService) {
            if (is_array($searchService)) {
                if (array_key_exists('type', $searchService) && array_key_exists('url', $searchService)) {
                    $configJson->options->searches[] = (object) $searchService;
                }
            } elseif (is_object($searchService)) {
                if (property_exists($searchService, 'type') && property_exists($searchService, 'url')) {
                    $configJson->options->searches[] = $searchService;
                }
            }
        }

        // Update dataviz config
        if (property_exists($configJson, 'datavizLayers')) {
            $datavizLayers = $this->getDatavizLayersConfig();
            if ($datavizLayers) {
                $configJson->datavizLayers = $datavizLayers;
            } else {
                unset($configJson->datavizLayers);
            }
        }

        // Get server plugins
        $configJson->qgisServerPlugins = $this->getQgisServerPlugins();

        // Check layers group visibility
        $userGroups = array('');
        if ($this->appContext->userIsConnected()) {
            $userGroups = $this->appContext->aclUserGroupsId();
        }
        $layersToRemove = array();
        foreach ($configJson->layers as $obj) {
            // no group_visibility config, nothing to do
            if (!property_exists($obj, 'group_visibility')) {
                continue;
            }
            if (empty($obj->group_visibility)) {
                unset($obj->group_visibility);

                continue;
            }
            // get group visibility as trimmed array
            $groupVisibility = array_map('trim', $obj->group_visibility);
            $layerToKeep = false;
            foreach ($userGroups as $group) {
                if (in_array($group, $groupVisibility)) {
                    $layerToKeep = true;

                    break;
                }
            }
            if (!$layerToKeep) {
                $layersToRemove[$obj->name] = $obj;
            }
            unset($obj->group_visibility);
        }
        foreach ($layersToRemove as $key => $obj) {
            // locateByLayer
            if (property_exists($configJson->locateByLayer, $key)) {
                unset($configJson->locateByLayer->{$key});
            }
            // locateByLayer vectorjoins
            foreach ($configJson->locateByLayer as $o) {
                if (!property_exists($o, 'vectorjoins')) {
                    continue;
                }
                $vectorjoinsToKeep = array();
                foreach ($o->vectorjoins as $i => $v) {
                    if ($v->joinLayerId != $obj->id) {
                        $vectorjoinsToKeep[] = $o;
                    }
                }
                $o->vectorjoins = $vectorjoinsToKeep;
            }
            // attributeLayers
            if (property_exists($configJson->attributeLayers, $key)) {
                unset($configJson->attributeLayers->{$key});
            }
            // tooltipLayers
            if (property_exists($configJson->tooltipLayers, $key)) {
                unset($configJson->tooltipLayers->{$key});
            }
            // editionLayers
            if (property_exists($configJson->editionLayers, $key)) {
                unset($configJson->editionLayers->{$key});
            }
            // datavizLayers
            if (property_exists($configJson, 'datavizLayers')) {
                $dvlLayers = $configJson->datavizLayers['layers'];
                foreach ($dvlLayers as $o => $c) {
                    if ($c['layer_id'] == $obj->id) {
                        unset($configJson->datavizLayers['layers'][$o]);
                    }
                }
            }
            // atlas
            if (property_exists($configJson->options, 'atlasEnabled')
                && $this->optionToBoolean($configJson->options->atlasEnabled)
                && $configJson->options->atlasLayer == $obj->id) {
                $configJson->options->atlasLayer = '';
                $configJson->options->atlasPrimaryKey = '';
                $configJson->options->atlasFeatureLabel = '';
                $configJson->options->atlasSortField = '';
                $configJson->options->atlasEnabled = 'False';
            }
            // multi-atlas
            // formFilterLayers
            foreach ($configJson->formFilterLayers as $o => $c) {
                if (property_exists($c, 'layerId') && $c->layerId == $obj->id) {
                    unset($configJson->formFilterLayers->{$o});
                }
            }
            // relations
            if (array_key_exists($key, $configJson->relations)) {
                unset($configJson->relations->{$key});
            }
            foreach ($configJson->relations as $k => $layerRelations) {
                if ($k == 'pivot') {
                    continue;
                }
                $relationsToKeep = array();
                foreach ($layerRelations as $r) {
                    if ($r['referencingLayer'] != $obj->id) {
                        $relationsToKeep[] = $r;
                    }
                }
                if (count($relationsToKeep) > 0) {
                    $configJson->relations[$k] = $relationsToKeep;
                } else {
                    unset($configJson->relations[$k]);
                }
            }
            // printTemplates
            $printTemplatesToKeep = array();
            foreach ($configJson->printTemplates as $printTemplate) {
                if (array_key_exists('atlas', $printTemplate)
                    && array_key_exists('coverageLayer', $printTemplate['atlas'])
                    && $printTemplate['atlas']['coverageLayer'] != $obj->id) {
                    $printTemplatesToKeep[] = $printTemplate;
                }
            }
            $configJson->printTemplates = $printTemplatesToKeep;

            // remove layer
            unset($configJson->layers->{$key});
        }

        return json_encode($configJson);
    }

    /**
     * @return object
     */
    public function getFullCfg()
    {
        return $this->cfg->getData();
    }

    /**
     * @throws jExceptionSelector
     *
     * @return \lizmapMapDockItem[]
     */
    public function getDefaultDockable()
    {
        $dockable = array();
        $confUrlEngine = $this->appContext->appConfig()->urlengine;
        $bp = $confUrlEngine['basePath'];
        $jwp = $confUrlEngine['jelixWWWPath'];

        // Get lizmap services
        $services = $this->services; // A changer

        if ($services->projectSwitcher) {
            $projectsTpl = new \jTpl();
            $projectsTpl->assign('excludedProject', $this->repository->getKey().'~'.$this->getKey());
            $dockable[] = new \lizmapMapDockItem(
                'projects',
                $this->appContext->getLocale('view~default.repository.list.title'),
                $projectsTpl->fetch('view~map_projects'),
                0
            );
        }

        $switcherTpl = new \jTpl();
        $switcherTpl->assign(array(
            'layerExport' => $this->appContext->aclCheck('lizmap.tools.layer.export', $this->repository->getKey()), ));
        $dockable[] = new \lizmapMapDockItem(
            'switcher',
            $this->appContext->getLocale('view~map.switchermenu.title'),
            $switcherTpl->fetch('view~map_switcher'),
            1
        );
        //$legendTpl = new jTpl();
        //$dockable[] = new lizmapMapDockItem('legend', 'Légende', $switcherTpl->fetch('map_legend'), 2);

        $metadataTpl = new \jTpl();
        // Get the WMS information
        $wmsInfo = $this->qgis->getWMSInformation();
        // WMS GetCapabilities Url
        $wmsGetCapabilitiesUrl = $this->appContext->aclCheck(
            'lizmap.tools.displayGetCapabilitiesLinks',
            $this->repository->getKey()
        );
        $wmtsGetCapabilitiesUrl = $wmsGetCapabilitiesUrl;
        if ($wmsGetCapabilitiesUrl) {
            $wmsGetCapabilitiesUrl = $this->qgis->getData('wmsGetCapabilitiesUrl');
            $wmtsGetCapabilitiesUrl = $this->qgis->getData('wmtsGetCapabilitiesUrl');
        }
        $metadataTpl->assign(array_merge(array(
            'repositoryLabel' => $this->qgis->getData('label'),
            'repository' => $this->repository->getKey(),
            'project' => $this->getKey(),
            'wmsGetCapabilitiesUrl' => $wmsGetCapabilitiesUrl,
            'wmtsGetCapabilitiesUrl' => $wmtsGetCapabilitiesUrl,
        ), $wmsInfo));
        $dockable[] = new \lizmapMapDockItem(
            'metadata',
            $this->appContext->getLocale('view~map.metadata.link.label'),
            $metadataTpl->fetch('view~map_metadata'),
            2
        );

        if ($this->hasEditionLayers()) {
            $tpl = new \jTpl();
            $dockable[] = new \lizmapMapDockItem(
                'edition',
                $this->appContext->getLocale('view~edition.navbar.title'),
                $tpl->fetch('view~map_edition'),
                3,
                $jwp.'design/jform.css',
                $bp.'assets/js/edition.js'
            );
        }

        return $dockable;
    }

    /**
     * @throws jException
     * @throws jExceptionSelector
     *
     * @return \lizmapMapDockItem[]
     */
    public function getDefaultMiniDockable()
    {
        $dockable = array();
        $configOptions = $this->getOptions();
        $bp = $this->appContext->appConfig()->urlengine['basePath'];

        if ($this->hasAttributeLayers()) {
            $tpl = new \jTpl();
            // Add layer-export attribute to lizmap-selection-tool component if allowed
            $layerExport = $this->appContext->aclCheck('lizmap.tools.layer.export', $this->repository->getKey()) ? 'layer-export' : '';
            $dock = new \lizmapMapDockItem(
                'selectiontool',
                $this->appContext->getLocale('view~map.selectiontool.navbar.title'),
                '<lizmap-selection-tool '.$layerExport.'></lizmap-selection-tool>',
                1,
                '',
                $bp.'assets/js/attributeTable.js'
            );
            $dock->icon = '<span class="icon-white icon-star" style="margin-left:2px; margin-top:2px;"></span>';
            $dockable[] = $dock;
        }

        if ($this->hasLocateByLayer()) {
            $tpl = new \jTpl();
            $dockable[] = new \lizmapMapDockItem(
                'locate',
                $this->appContext->getLocale('view~map.locatemenu.title'),
                $tpl->fetch('view~map_locate'),
                2
            );
        }

        if (property_exists($configOptions, 'geolocation')
            && $configOptions->geolocation == 'True') {
            $tpl = new \jTpl();
            $tpl->assign('hasEditionLayers', $this->hasEditionLayers());
            $dockable[] = new \lizmapMapDockItem(
                'geolocation',
                $this->appContext->getLocale('view~map.geolocate.navbar.title'),
                $tpl->fetch('view~map_geolocation'),
                3
            );
        }

        if (property_exists($configOptions, 'print')
            && $configOptions->print == 'True') {
            $tpl = new \jTpl();
            $dockable[] = new \lizmapMapDockItem(
                'print',
                $this->appContext->getLocale('view~map.print.navbar.title'),
                $tpl->fetch('view~map_print'),
                4
            );
        }

        if (property_exists($configOptions, 'measure')
            && $configOptions->measure == 'True') {
            $tpl = new \jTpl();
            $dockable[] = new \lizmapMapDockItem(
                'measure',
                $this->appContext->getLocale('view~map.measure.navbar.title'),
                $tpl->fetch('view~map_measure'),
                5
            );
        }

        if ($this->hasTooltipLayers()) {
            $tpl = new \jTpl();
            $dockable[] = new \lizmapMapDockItem(
                'tooltip-layer',
                $this->appContext->getLocale('view~map.tooltip.navbar.title'),
                $tpl->fetch('view~map_tooltip'),
                6,
                '',
                ''
            );
        }

        if ($this->hasTimemanagerLayers()) {
            $tpl = new \jTpl();
            $dockable[] = new \lizmapMapDockItem(
                'timemanager',
                $this->appContext->getLocale('view~map.timemanager.navbar.title'),
                $tpl->fetch('view~map_timemanager'),
                7,
                '',
                $bp.'assets/js/timemanager.js'
            );
        }

        // Permalink
        if (true) {
            // Get geobookmark if user is connected
            $gbCount = false;
            $gbList = null;
            if ($this->appContext->userIsConnected()) {
                $jUser = $this->appContext->getUserSession();
                $usrLogin = $jUser->login;
                $daoGb = \jDao::get('lizmap~geobookmark');
                $conditions = \jDao::createConditions();
                $conditions->addCondition('login', '=', $usrLogin);
                $conditions->addCondition(
                    'map',
                    '=',
                    $this->repository->getKey().':'.$this->getKey()
                );
                $gbList = $daoGb->findBy($conditions);
                $gbCount = $daoGb->countBy($conditions);
            }
            $tpl = new \jTpl();
            $tpl->assign('gbCount', $gbCount);
            $tpl->assign('gbList', $gbList);
            $gbContent = null;
            if ($gbList) {
                $gbContent = $tpl->fetch('view~map_geobookmark');
            }
            $tpl = new \jTpl();
            $tpl->assign(array(
                'repository' => $this->repository->getKey(),
                'project' => $this->getKey(),
                'gbContent' => $gbContent,
            ));
            $dockable[] = new \lizmapMapDockItem(
                'permaLink',
                $this->appContext->getLocale('view~map.permalink.navbar.title'),
                $tpl->fetch('view~map_permalink'),
                8
            );
        }

        if (property_exists($configOptions, 'draw')
            && $configOptions->draw == 'True') {
            $tpl = new \jTpl();
            $dockable[] = new \lizmapMapDockItem(
                'draw',
                $this->appContext->getLocale('view~map.draw.navbar.title'),
                $tpl->fetch('view~map_draw'),
                9
            );
        }

        return $dockable;
    }

    /**
     * @throws jExceptionSelector
     *
     * @return \lizmapMapDockItem[]
     */
    public function getDefaultBottomDockable()
    {
        $dockable = array();
        $bp = $this->appContext->appConfig()->urlengine['basePath'];

        if ($this->hasAttributeLayers(true)) {
            $form = $this->appContext->createJelixForm('view~attribute_layers_option');
            $assign = array('form' => $form);
            $dockable[] = new \lizmapMapDockItem(
                'attributeLayers',
                $this->appContext->getLocale('view~map.attributeLayers.navbar.title'),
                array('view~map_attributeLayers', $assign),
                1,
                '',
                $bp.'assets/js/attributeTable.js'
            );
        }

        return $dockable;
    }

    /**
     * Check acl rights on the project.
     *
     * @return bool true if the current user as rights on the project
     */
    public function checkAcl()
    {
        $options = $this->getOptions();

        // Check right on repository
        if (!$this->appContext->aclCheck('lizmap.repositories.view', $this->repository->getKey())) {
            return false;
        }

        // Check acl option is configured in project config
        if (!property_exists($options, 'acl') || !is_array($options->acl) || empty($options->acl)) {
            return true;
        }

        // Check user is authenticated
        if (!$this->appContext->userIsConnected()) {
            return false;
        }

        // Check if configured groups white list and authenticated user groups list intersects
        $aclGroups = $options->acl;
        $userGroups = $this->appContext->aclUserGroupsId();
        if (array_intersect($aclGroups, $userGroups)) {
            return true;
        }

        return false;
    }

    /**
     * Check acl rights on the project by given user.
     *
     * @param mixed $login Login of the user to test access
     *
     * @return bool true if the current user as rights on the project
     *
     * @since Jelix 1.6.29
     */
    public function checkAclByUser($login)
    {

        // Check right on repository
        if (!$this->appContext->aclCheck($login, 'lizmap.repositories.view', $this->repository->getKey())) {
            return false;
        }

        // Check acl option is configured in project config
        if (!property_exists($this->cfg->options, 'acl') || !is_array($this->cfg->options->acl) || empty($this->cfg->options->acl)) {
            return true;
        }

        // Check if configured groups white list and authenticated user groups list intersects
        $aclGroups = $this->cfg->options->acl;
        $userGroups = $this->appContext->aclGroupsIdByUser($login);
        if (array_intersect($aclGroups, $userGroups)) {
            return true;
        }

        return false;
    }

    public function getSpatialiteExtension()
    {
        if ($this->spatialiteExt !== null && $this->spatialiteExt !== '') {
            return $this->spatialiteExt;
        }

        // Try with mod_spatialite
        try {
            $db = new \SQLite3(':memory:');
            $this->spatialiteExt = 'mod_spatialite.so';
            $spatial = @$db->loadExtension($this->spatialiteExt); // loading SpatiaLite as an extension
            if ($spatial) {
                return $this->spatialiteExt;
            }
        } catch (\Exception $e) {
            $spatial = false;
        }
        // Try with libspatialite
        if (!$spatial) {
            try {
                $db = new \SQLite3(':memory:');
                $this->spatialiteExt = 'libspatialite.so';
                $spatial = @$db->loadExtension($this->spatialiteExt); // loading SpatiaLite as an extension
                if ($spatial) {
                    return $this->spatialiteExt;
                }
            } catch (\Exception $e) {
            }
        }
        $this->spatialiteExt = '';

        return '';
    }
}
