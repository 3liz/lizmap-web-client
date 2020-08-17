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

class Project
{
    /**
     * @var lizmapRepository
     */
    protected $repository;
    /**
     * @var projectXML QGIS project XML
     */
    protected $xml;
    /**
     * @var object CFG project JSON
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
     * @var JelixInfos The jelixInfos instance
     */
    protected $jelix;

    /**
     * @var lizmapServices The lizmapServices instance
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
     * QGIS project filemtime.
     *
     * @var string
     */
    protected $qgsmtime = '';

    /**
     * Lizmap config filemtime.
     *
     * @var string
     */
    protected $qgscfgmtime = '';

    /**
     * @var array Lizmap repository configuration data
     */
    protected $data = array();

    /**
     * Version of QGIS which wrote the project.
     *
     * @var null|int
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
     * @var array List of cached properties
     */
    protected $cachedProperties = array('WMSInformation', 'canvasColor', 'allProj4',
        'relations', 'themes', 'layersOrder', 'printCapabilities', 'locateByLayer', 'formFilterLayers',
        'editionLayers', 'attributeLayers', 'useLayerIDs', 'layers', 'data', 'cfg', 'qgisProjectVersion', );

    /**
     * @var string
     */
    private $spatialiteExt;

    /**
     * version of the format of data stored in the cache.
     *
     * This number should be increased each time you change the structure of the
     * properties of qgisProject (ex: adding some new data properties into the $layers).
     * So you'll be sure that the cache will be updated when Lizmap code source
     * is updated on a server
     */
    const CACHE_FORMAT_VERSION = 1;

    /**
     * @var projectCache
     */
    protected $cacheHandler;

    /**
     * constructor.
     *
     * @param string           $key      : the project name
     * @param lizmapRepository $rep      : the repository
     * @param jelixInfo        $jelix    the instance of jelixInfos
     * @param mixed            $services
     */
    public function __construct($key, $rep, $jelix, $services)
    {
        $this->key = $key;
        $this->repository = $rep;
        $this->jelix = $jelix;
        $this->services = $services;

        $file = $this->getQgisPath();

        // Verifying if the files exist
        if (!file_exists($file)) {
            throw new UnknownLizmapProjectException('The QGIS project '.$file.' does not exist!');
        }
        if (!file_exists($file.'.cfg')) {
            throw new UnknownLizmapProjectException('The lizmap config '.$file.'.cfg does not exist!');
        }

        $this->cacheHandler = new projectCache($file, $this->jelix);

        $data = $this->cacheHandler->retrieveProjectData();

        if ($data === false ||
            $data['qgsmtime'] < filemtime($file) ||
            $data['qgscfgmtime'] < filemtime($file.'.cfg') ||
            !isset($data['format_version']) ||
            $data['format_version'] != self::CACHE_FORMAT_VERSION
        ) {
            // FIXME reading XML could take time, so many process could
            // read it and construct the cache at the same time. We should
            // have a kind of lock to avoid this issue.
            $this->readProject($key, $rep);
            $data['qgsmtime'] = filemtime($file);
            $data['qgscfgmtime'] = filemtime($file.'.cfg');
            $data['format_version'] = self::CACHE_FORMAT_VERSION;
            foreach ($this->cachedProperties as $prop) {
                $data[$prop] = $this->{$prop};
            }
            $this->cacheHandler->storeProjectData($data);
        } else {
            foreach ($this->cachedProperties as $prop) {
                if (array_key_exists($prop, $data)) {
                    $this->{$prop} = $data[$prop];
                }
            }
        }
        $this->qgsmtime = $data['qgsmtime'];
        $this->qgscfgmtime = $data['qgscfgmtime'];

        $this->path = $file;
    }

    public function clearCache()
    {
        $this->cacheHandler->clearCache();
    }

    /**
     * Read the qgis files.
     *
     * @param mixed $key
     * @param mixed $rep
     */
    protected function readProject($key, $rep)
    {
        $qgs_path = $this->getQgisPath();

        if (!file_exists($qgs_path) ||
            !file_exists($qgs_path.'.cfg')) {
            throw new UnknownLizmapProjectException("Files of project {$key} does not exists");
        }

        $this->cfg = new configFile($qgs_path.'.cfg');
        if ($this->cfg === null) {
            throw new UnknownLizmapProjectException(".qgs.cfg File of project {$key} has invalid content");
        }

        $configOptions = $this->cfg->getEditableProperty('options');

        try {
            $this->xml = new qgisProject($qgs_path);
        } catch (Exception $e) {
            throw $e;
        }
        $qgs_xml = $this->xml;

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
        $this->WMSInformation['ProjectCrs'] = $this->data['proj'];

        // get WMS getCapabilities full URL
        $this->data['wmsGetCapabilitiesUrl'] = jUrl::getFull(
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
        $this->data['wmtsGetCapabilitiesUrl'] = jUrl::getFull(
            'lizmap~service:index',
            array(
                'repository' => $rep->getKey(),
                'project' => $key,
                'SERVICE' => 'WMTS',
                'VERSION' => '1.0.0',
                'REQUEST' => 'GetCapabilities',
            )
        );

        $shortNames = $qgs_xml->xpathQuery('//maplayer/shortname');
        if ($shortNames) {
            foreach ($shortNames as $sname) {
                $sname = (string) $sname;
                $xmlLayer = $qgs_xml->xpathQuery("//maplayer[shortname='{$sname}']");
                if (!$xmlLayer) {
                    continue;
                }
                $xmlLayer = $xmlLayer[0];
                $name = (string) $xmlLayer->layername;
                $layer = $this->cfg->getEditableProperty('layers');
                if ($layer !== null && property_exists($layer, $name)) {
                    $layer->{$name}->shortname = $sname;
                }
            }
        }

        $layerWithOpacities = $qgs_xml->xpathQuery('//maplayer/layerOpacity[.!=1]/parent::*');
        if ($layerWithOpacities) {
            foreach ($layerWithOpacities as $layerWithOpacitiy) {
                $name = (string) $layerWithOpacitiy->layername;
                $prop = $this->cfg->getEditableProperty('layers');
                if ($prop && property_exists($prop, $name)) {
                    $opacity = (float) $layerWithOpacitiy->layerOpacity;
                    $prop->{$name}->opacity = $opacity;
                }
            }
        }

        $groupsWithShortName = $qgs_xml->xpathQuery("//layer-tree-group/customproperties/property[@key='wmsShortName']/parent::*/parent::*");
        if ($groupsWithShortName) {
            foreach ($groupsWithShortName as $group) {
                $name = (string) $group['name'];
                $shortNameProperty = $group->xpath("customproperties/property[@key='wmsShortName']");
                if ($shortNameProperty && count($shortNameProperty) > 0) {
                    $shortNameProperty = $shortNameProperty[0];
                    $sname = (string) $shortNameProperty['value'];
                    $prop = $this->cfg->getEditableProperty('layers');
                    if ($prop && property_exists($prop, $name)) {
                        $prop->{$name}->shortname = $sname;
                    }
                }
            }
        }
        $groupsMutuallyExclusive = $qgs_xml->xpathQuery("//layer-tree-group[@mutually-exclusive='1']");
        if ($groupsMutuallyExclusive) {
            foreach ($groupsMutuallyExclusive as $group) {
                $name = (string) $group['name'];
                $prop = $this->cfg->getEditableProperty('layers');
                if ($prop && property_exists($prop, $name)) {
                    $prop->{$name}->smutuallyExclusive = 'True';
                }
            }
        }

        $layersWithShowFeatureCount = $qgs_xml->xpathQuery("//layer-tree-layer/customproperties/property[@key='showFeatureCount']/parent::*/parent::*");
        if ($layersWithShowFeatureCount) {
            foreach ($layersWithShowFeatureCount as $layer) {
                $name = (string) $layer['name'];
                $prop = $this->cfg->getEditableProperty('layers');
                if ($prop && property_exists($prop, $name)) {
                    $prop->{$name}->showFeatureCont = 'True';
                }
            }
        }
        //remove plugin layer
        $pluginLayers = $qgs_xml->xpathQuery('//maplayer[type="plugin"]');
        if ($pluginLayers) {
            foreach ($pluginLayers as $layer) {
                $name = (string) $layer->layername;
                $prop = $this->cfg->getEditableProperty('layers');
                if ($prop && property_exists($prop, $name)) {
                    unset($prop->{$name});
                }
            }
        }

        $this->cfg->unsetPropAfterRead();

        $this->printCapabilities = $this->readPrintCapabilities($qgs_xml, $this->cfg);
        $this->locateByLayer = $this->readLocateByLayers($qgs_xml, $this->cfg);
        $this->formFilterLayers = $this->readFormFilterLayers($qgs_xml, $this->cfg);
        $this->editionLayers = $this->readEditionLayers($qgs_xml, $this->cfg);
        $this->attributeLayers = $this->readAttributeLayers($qgs_xml, $this->cfg);
        $this->layersOrder = $this->readLayersOrder($qgs_xml, $this->cfg);
    }

    public function getQgisPath()
    {
        if (!$this->file) {
            $this->file = realpath($this->repository->getPath()).'/'.$this->key.'.qgs';
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
        return $this->qgsmtime;
    }

    public function getCfgFileTime()
    {
        return $this->qgscfgmtime;
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

    public function hasLocateByLayer()
    {
        $locate = $this->cfg->getProperty('locateByLayer');
        if ($locate && is_array($locate) && count($locate)) {
            return true;
        }

        return false;
    }

    public function hasFormFilterLayers()
    {
        $form = $this->cfg->getProperty('formFilterLayers');
        if ($form && is_array($form) && count($form)) {
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
        $timemanager = $this->cfg->getProperty('timemanagerLayers');
        if ($timemanager && is_array($timemanager) && count($timemanager)) {
            return true;
        }

        return false;
    }

    public function hasAtlasEnabled()
    {
        $options = $this->cfg->getProperty('options');
        $atlas = $this->cfg->getProperty('atlas');
        if (($options->atlasEnabled and $options->atlasEnabled == 'True') // Legacy LWC < 3.4 (only one layer)
            or
            ($atlas and property_exists($atlas, 'layers') and is_array($atlas) and count($atlas) > 0)) { // Multiple atlas
            return true;
        }

        return false;
    }

    /**
     * @return mixed
     */
    public function getQgisServerPlugins()
    {
        $qgisServer = new qgisServer();

        return $qgisServer->getPlugins($this);
    }

    public function hasTooltipLayers()
    {
        $tooltip = $this->cfg->getProperty('tooltipLayers');
        if ($tooltip && count($tooltip)) {
            return true;
        }

        return false;
    }

    public function hasAttributeLayers($onlyDisplayedLayers = false)
    {
        $attributeLayers = $this->cfg->getProperty('attributeLayers');
        if ($attributeLayers) {
            $count = 0;
            $hasDisplayedLayer = !$onlyDisplayedLayers;
            foreach ($attributeLayers as $key => $obj) {
                ++$count;
                if ($onlyDisplayedLayers && !property_exists($obj, 'hideLayer') ||
                    strtolower($obj->hideLayer) != 'true') {
                    $hasDisplayedLayer = true;
                }
            }
            if ($count != 0 && $hasDisplayedLayer) {
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

        $jdbParams = array(
            'driver' => 'pdo',
            'dsn' => 'sqlite:'.$searchDatabase,
        );

        // Create the virtual jdb profile
        $searchJdbName = 'jdb_'.$repository.'_'.$project;
        $this->jelix->createVirtualProfile('jdb', $searchJdbName, $jdbParams);

        // Check FTS db ( tables and geometry storage
        try {
            $cnx = $this->jelix->getConnection($searchJdbName);

            // Get metadata
            $sql = "
            SELECT search_id, search_name, layer_name, geometry_storage, srid
            FROM quickfinder_toc
            WHERE geometry_storage != 'wkb'
            ORDER BY priority
            ";
            $res = $this->jelix->useDbConnection($cnx, 'query', array($sql));
            $searches = array();
            foreach ($res as $item) {
                $searches[$item->search_id] = array(
                    'search_name' => $item->search_name,
                    'layer_name' => $item->layer_name,
                    'srid' => $item->srid,
                );
            }
            if (count($searches) == 0) {
                return false;
            }

            return array(
                'jdb_profile' => $searchJdbName,
                'searches' => $searches,
            );
        } catch (Exception $e) {
            return false;
        }

        return false;
    }

    public function hasEditionLayers()
    {
        if (property_exists($this->cfg, 'editionLayers')) {
            if (!$this->jelix->aclCheckResult(array('lizmap.tools.edition.use', $this->repository->getKey()))) {
                return false;
            }

            $count = 0;
            foreach ($this->cfg->editionLayers as $key => $eLayer) {
                // Check if user groups intersects groups allowed by project editor
                // If user is admin, no need to check for given groups
                if (property_exists($eLayer, 'acl') and $eLayer->acl) {
                    // Check if configured groups white list and authenticated user groups list intersects
                    $editionGroups = $eLayer->acl;
                    $editionGroups = array_map('trim', explode(',', $editionGroups));
                    if (is_array($editionGroups) and count($editionGroups) > 0) {
                        $userGroups = $this->jelix->aclDbUserGroups();
                        if (array_intersect($editionGroups, $userGroups) or $this->jelix->aclCheckResult(array('lizmap.admin.repositories.delete'))) {
                            // User group(s) correspond to the groups given for this edition layer
                            // or user is admin
                            ++$count;
                            unset($this->cfg->editionLayers->{$key}->acl);
                        } else {
                            // No match found, we deactivate the edition layer
                            unset($this->cfg->editionLayers->{$key});
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
        return $this->cfg->editionLayers;
    }

    public function findEditionLayerByName($name)
    {
        if (!$this->hasEditionLayers()) {
            return null;
        }

        if (property_exists($this->cfg->editionLayers, $name)) {
            return $this->cfg->editionLayers->{$name};
        }

        return null;
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

        foreach ($this->cfg->editionLayers as $layer) {
            if (!property_exists($layer, 'layerId')) {
                continue;
            }
            if ($layer->layerId == $layerId) {
                return $layer;
            }
        }

        return null;
    }

    /**
     * @return bool
     */
    public function hasLoginFilteredLayers()
    {
        if (property_exists($this->cfg, 'loginFilteredLayers') && is_array($this->cfg->hasLoginFilteredLayers) && count($this->cfg->loginFilteredLayers)) {
            return true;
        }

        return false;
    }

    public function getLoginFilteredConfig($layername)
    {
        if (!$this->hasLoginFilteredLayers()) {
            return null;
        }

        $ln = $layername;
        // In case $layername is a WFS TypeName
        $layerByTypeName = $this->cfg->findLayerByTypeName($layername);
        if ($layerByTypeName) {
            $ln = $layerByTypeName->name;
        }

        if (!property_exists($this->cfg->loginFilteredLayers, $ln)) {
            return null;
        }

        return $pConfig->loginFilteredLayers->{$n};
    }

    public function getLoginFilters($layers)
    {
        $filters = array();

        if (!$this->hasLoginFilteredLayers()) {
            return $filters;
        }

        foreach ($layers as $layername) {
            $lname = $layername;

            // In case $layername is a WFS TypeName
            $layerByTypeName = $this->cfg->findLayerByTypeName($layername);
            if ($layerByTypeName) {
                $lname = $layerByTypeName->name;
            }

            // Get config
            $loginFilteredConfig = $this->getLoginFilteredConfig($lname);
            if ($loginFilteredConfig == null) {
                continue;
            }

            // attribute to filter
            $attribute = strtolower($loginFilteredConfig->filterAttribute);

            // default no user connected
            $filter = "\"{$attribute}\" = 'all'";

            // A user is connected
            if ($this->jelix->userIsConnected()) {
                $user = $this->jelix->getUserSession();
                $login = $user->login;
                if (property_exists($loginFilteredConfig, 'filterPrivate') &&
                    $this > optionToBoolean($loginFilteredConfig->filterPrivate)
                ) {
                    $filter = "\"{$attribute}\" IN ( '".$login."' , 'all' )";
                } else {
                    $userGroups = $this->jelix->aclDbUserGroups();
                    $flatGroups = implode("' , '", $userGroups);
                    $filter = "\"{$attribute}\" IN ( '".$flatGroups."' , 'all' )";
                }
            }

            $filters[$layername] = array_merge(
                $loginFilteredConfig,
                array('filter' => $filter, 'layername' => $lname)
            );
        }

        return $filters;
    }

    private function optionToBoolean($config_string)
    {
        $ret = false;
        if (strtolower((string) $config_string) == 'true') {
            $ret = true;
        }

        return $ret;
    }

    /**
     * @return array|bool
     */
    public function getDatavizLayersConfig()
    {
        if (!property_exists($this->cfg, 'datavizLayers')) {
            return false;
        }
        $config = array(
            'layers' => array(),
            'dataviz' => array(),
            'locale' => $this->jelix->appConfig()->locale,
        );
        foreach ($this->cfg->datavizLayers as $order => $lc) {
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
            );
            foreach ($properties as $prop) {
                if (property_exists($lc, $prop)) {
                    $plot_conf['plot'][$prop] = $lc->{$prop};
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

            $display_legend = true;
            if (property_exists($lc, 'display_legend')) {
                $display_legend = $this->optionToBoolean($lc->display_legend);
            }
            $plotConf['plot']['display_legend'] = $display_legend;

            $stacked = false;
            if (property_exists($lc, 'stacked')) {
                $stacked = $this->optionToBoolean($lc->stacked);
            }
            $plotConf['plot']['stacked'] = $stacked;

            $horizontal = false;
            if (property_exists($lc, 'horizontal')) {
                $horizontal = $this->optionToBoolean($lc->horizontal);
            }
            $plotConf['plot']['horizontal'] = $horizontal;

            // Add more layout config, written like:
            // layout_config=barmode:stack,bargap:0.5
            if (!empty($lc->layout_config)) {
                $layout_config = array();
                $a = array_map('trim', explode(',', $lc->layout_config));
                foreach ($a as $i) {
                    $b = array_map('trim', explode(':', $i));
                    if (is_array($b) and count($b) == 2) {
                        $c = $b[1];
                        if ($c == 'false') {
                            $c = (bool) false;
                        }
                        if ($c == 'true') {
                            $c = (bool) true;
                        }
                        $layout_config[$b[0]] = $c;
                    }
                }
                if (count($layout_config) > 0) {
                    $plotConf['plot']['layout_config'] = $layout_config;
                }
            }

            if (property_exists($lc, 'layout')) {
                $plotConf['plot']['layout'] = $lc->layout;
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
        if (property_exists($this->cfg->options, 'datavizLocation')
            and in_array($this->cfg->options->datavizLocation, array('dock', 'bottomdock', 'right-dock'))
        ) {
            $config['dataviz']['location'] = $this->cfg->options->datavizLocation;
        }
        if (property_exists($this->cfg->options, 'theme')
            and in_array($this->cfg->options->theme, array('dark', 'light'))
        ) {
            $config['dataviz']['theme'] = $this->cfg->options->theme;
        }

        return $config;
    }

    /**
     * @return bool
     */
    public function needsGoogle()
    {
        $configOptions = $this->cfg->options;
        $googleProps = array(
            'googleStreets',
            'googleSatellite',
            'googleHybrid',
            'googleTerrain',
        );

        foreach ($googleProps as $google) {
            if (property_exists($configOptions, $google) && $configOptions->{$google}) {
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
        $configOptions = $this->cfg->options;
        $gkey = '';
        if (property_exists($configOptions, 'googleKey')
            && $configOptions->googleKey != '') {
            $gkey = $configOptions->googleKey;
        }

        return $gkey;
    }

    protected function readPrintCapabilities($qgsLoad, $cfg)
    {
        $printTemplates = array();
        $options = $cfg->getProp('options');
        if ($options && $options->print == 'True') {
            $printTemplates = $qgsLoad->getPrintTemplates();
        }

        return $printTemplates;
    }

    protected function readLocateByLayers($xml, $cfg)
    {
        $locateByLayer = array();
        $locateByLayer = $cfg->getEditableProperty('locateByLayer');
        if ($locateByLayer) {
            $xml->readLocateByLayers($locateByLayer);
        }

        return $locateByLayer;
    }

    protected function readFormFilterLayers($xml, $cfg)
    {
        $formFilterLayers = $cfg->getProperty('formFilterLayer');

        if (!$formFilterLayer) {
            $formFilterLayer = array();
        }

        return $formFilterLayers;
    }

    protected function readEditionLayers($xml, $cfg)
    {
        $editionLayers = $cfg->getEditableProperty('editionLayers');

        if ($editionLayers) {

            // Check ability to load spatialite extension
            // And remove ONLY spatialite layers if no extension found
            $spatialiteExt = '';
            if (class_exists('SQLite3')) {
                $spatialiteExt = $this->getSpatialiteExtension();
            }
            if (!$spatialiteExt) {
                jLog::log('Spatialite is not available', 'error');
                $xml->readEditionLayers($editionLayers);
            }
        } else {
            $editionLayers = array();
        }

        return $editionLayers;
    }

    protected function readAttributeLayers($xml, $cfg)
    {
        $attributeLayers = $cfg->getEditableProp('attributeLayers');

        if ($attributeLayers) {
            $xml->readAttributeLayers($attributeLayers);
        } else {
            $attributeLayers = array();
        }

        return $attributeLayers;
    }

    /**
     * @param SimpleXMLElement $xml
     * @param $cfg
     *
     * @return int[]
     */
    protected function readLayersOrder($xml, $cfg)
    {
        return $this->xml->readLayersOrder($xml, $this->getLayers());
    }

    /**
     * @return false|string the JSON object corresponding to the configuration
     */
    public function getUpdatedConfig()
    {

        //FIXME: it's better to use clone keyword, isn't it?
        $configJson = clone $this->cfg;

        // Add an option to display buttons to remove the cache for cached layer
        // Only if appropriate right is found
        if ($this->jelix->aclCheckResult(array('lizmap.admin.repositories.delete'))) {
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
            if ($this->jelix->aclCheckResult(array('lizmap.tools.edition.use', $this->repository->getKey()))) {
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
                            $userGroups = $this->jelix->aclDbUserGroups();
                            if (array_intersect($editionGroups, $userGroups) or $this->jelix->aclCheckResult(array('lizmap.admin.repositories.delete'))) {
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
        if ($this->jelix->aclCheckResult(array('lizmap.tools.layer.export', $this->repository->getKey()))) {
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
        $relations = $this->getRelations();
        if ($relations) {
            $configJson->relations = $relations;
        }

        // Update config with project themes
        $themes = $this->getThemes();
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
                $externalSearch['url'] = jUrl::get('lizmap~osm:nominatim');
            } elseif ($configJson->options->externalSearch == 'ban') {
                $externalSearch = array(
                    'type' => 'BAN',
                    'service' => 'lizmapBan',
                    'url' => jUrl::get('lizmap~ban:search'),
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
                'url' => jUrl::get('lizmap~search:get'),
            );
        }
        // Events to get additional searches
        $searchServices = $this->jelix->eventNotify('searchServiceItem', array('repository' => $this->repository->getKey(), 'project' => $this->getKey()))->getResponse();
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
        $qplugins = $this->getQgisServerPlugins();
        $configJson->qgisServerPlugins = $qplugins;

        // Check layers group visibility
        $userGroups = array('');
        if ($this->jelix->userIsConnected()) {
            $userGroups = $this->jelix->aclDbUserGroups();
        }
        $layersToRemove = array();
        foreach ($configJson->layers as $obj) {
            // no group_visibility config, nothing to do
            if (!property_exists($obj, 'group_visibility')) {
                continue;
            }
            if ($obj->group_visibility === '') {
                unset($obj->group_visibility);

                continue;
            }
            // get group visibility as trimed array
            $group_visibility = array_map('trim', explode(',', $obj->group_visibility));
            $layerToKeep = false;
            foreach ($userGroups as $group) {
                if (in_array($group, $group_visibility)) {
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
            if (property_exists($configJson->options, 'atlasEnabled') &&
                $this->optionToBoolean($configJson->options->atlasEnabled) &&
                $configJson->options->atlasLayer == $obj->id) {
                $configJson->options->atlasLayer = '';
                $configJson->options->atlasPrimaryKey = '';
                $configJson->options->atlasFeatureLabel = '';
                $configJson->options->atlasSortField = '';
                $configJson->options->atlasEnabled = 'False';
            }
            // multi-atlas
            // formFilterLayers
            foreach ($configJson->formFilterLayers as $o => $c) {
                if ($c['layerId'] = $obj->id) {
                    unset($configJson->formFilterLayers[$o]);
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
                if (array_key_exists('atlas', $printTemplate) &&
                    array_key_exists('coverageLayer', $printTemplate['atlas']) &&
                    $printTemplate['atlas']['coverageLayer'] != $obj->id) {
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
        return $this->cfg;
    }

    /**
     * @FIXME: remove this method. Be sure it is not used in other projects
     * Data provided by the returned xml element should be extracted and encapsulated
     * into an object. Xml should not be used by callers
     *
     * @deprecated
     *
     * @param mixed $title
     *
     * @return null|SimpleXMLElement
     */
    public function getComposer($title)
    {
        $xmlComposer = $this->getXml()->xpath("//Composer[@title='{$title}']");
        if ($xmlComposer) {
            return $xmlComposer[0];
        }

        return null;
    }

    /**
     * @throws jExceptionSelector
     *
     * @return lizmapMapDockItem[]
     */
    public function getDefaultDockable()
    {
        $dockable = array();
        $confUrlEngine = &$this->jelix->appConfig()->urlengine;
        $bp = $confUrlEngine['basePath'];
        $jwp = $confUrlEngine['jelixWWWPath'];

        // Get lizmap services
        $services = $this->services; // A changer

        if ($services->projectSwitcher) {
            $projectsTpl = new jTpl();
            $ProjectsTpl->assign('excludedProject', $this->repository->getKey().'~'.$this->getKey());
            $dockable[] = new lizmapMapDockItem(
                'projects',
                $this->jelix->getLocale('view~default.repository.list.title'),
                $projectsTpl->fetch('view~map_projects'),
                0
            );
        }

        $switcherTpl = new jTpl();
        $switcherTpl->assign(array(
            'layerExport' => $this->jelix->aclCheckResult(array('lizmap.tools.layer.export', $this->repository->getKey())),
        ));
        $dockable[] = new lizmapMapDockItem(
            'switcher',
            $this->jelix->getLocale('view~map.switchermenu.title'),
            $switcherTpl->fetch('view~map_switcher'),
            1
        );
        //$legendTpl = new jTpl();
        //$dockable[] = new lizmapMapDockItem('legend', 'Légende', $switcherTpl->fetch('map_legend'), 2);

        $metadataTpl = new jTpl();
        // Get the WMS information
        $wmsInfo = $this->getWMSInformation();
        // WMS GetCapabilities Url
        $wmsGetCapabilitiesUrl = $this->jelix->aclCheckResult(
            array(
                'lizmap.tools.displayGetCapabilitiesLinks',
                $this->repository->getKey(), )
        );
        $wmtsGetCapabilitiesUrl = $wmsGetCapabilitiesUrl;
        if ($wmsGetCapabilitiesUrl) {
            $wmsGetCapabilitiesUrl = $this->getData('wmsGetCapabilitiesUrl');
            $wmtsGetCapabilitiesUrl = $this->getData('wmtsGetCapabilitiesUrl');
        }
        $metadataTpl->assign(array_merge(array(
            'repositoryLabel' => $this->getData('label'),
            'repository' => $this->repository->getKey(),
            'project' => $this->getKey(),
            'wmsGetCapabilitiesUrl' => $wmsGetCapabilitiesUrl,
            'wmtsGetCapabilitiesUrl' => $wmtsGetCapabilitiesUrl,
        ), $wmsInfo));
        $dockable[] = new lizmapMapDockItem(
            'metadata',
            $this->jelix->getLocale('view~map.metadata.link.label'),
            $metadataTpl->fetch('view~map_metadata'),
            2
        );

        if ($this->hasEditionLayers()) {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'edition',
                $this->jelix->getLocale('view~edition.navbar.title'),
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
     * @return lizmapMapDockItem[]
     */
    public function getDefaultMiniDockable()
    {
        $dockable = array();
        $configOptions = $this->getOptions();
        $bp = $this->jelix->appConfig()->urlengine['basePath'];

        if ($this->hasAttributeLayers()) {
            $tpl = new jTpl();
            // Add layer-export attribute to lizmap-selection-tool component if allowed
            $layerExport = $this->jelix->aclCheckResult(array('lizmap.tools.layer.export', $this->repository->getKey())) ? 'layer-export' : '';
            $dock = new lizmapMapDockItem(
                'selectiontool',
                $this->jelix->getLocale('view~map.selectiontool.navbar.title'),
                '<lizmap-selection-tool '.$layerExport.'></lizmap-selection-tool>',
                1,
                '',
                $bp.'assets/js/attributeTable.js'
            );
            $dock->icon = '<span class="icon-white icon-star" style="margin-left:2px; margin-top:2px;"></span>';
            $dockable[] = $dock;
        }

        if ($this->hasLocateByLayer()) {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'locate',
                $this->jelix->getLocale('view~map.locatemenu.title'),
                $tpl->fetch('view~map_locate'),
                2
            );
        }

        if (property_exists($configOptions, 'geolocation')
            && $configOptions->geolocation == 'True') {
            $tpl = new jTpl();
            $tpl->assign('hasEditionLayers', $this->hasEditionLayers());
            $dockable[] = new lizmapMapDockItem(
                'geolocation',
                $this->jelix->getLocale('view~map.geolocate.navbar.title'),
                $tpl->fetch('view~map_geolocation'),
                3
            );
        }

        if (property_exists($configOptions, 'print')
            && $configOptions->print == 'True') {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'print',
                $this->jelix->getLocale('view~map.print.navbar.title'),
                $tpl->fetch('view~map_print'),
                4
            );
        }

        if (property_exists($configOptions, 'measure')
            && $configOptions->measure == 'True') {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'measure',
                $this->jelix->getLocale('view~map.measure.navbar.title'),
                $tpl->fetch('view~map_measure'),
                5
            );
        }

        if ($this->hasTooltipLayers()) {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'tooltip-layer',
                $this->jelix->getLocale('view~map.tooltip.navbar.title'),
                $tpl->fetch('view~map_tooltip'),
                6,
                '',
                ''
            );
        }

        if ($this->hasTimemanagerLayers()) {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'timemanager',
                $this->jelix->getLocale('view~map.timemanager.navbar.title'),
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
            if ($this->jelix->userIsConnected()) {
                $juser = $this->jelix->getUserSession();
                $usr_login = $juser->login;
                $daogb = getDao('lizmap~geobookmark');
                $conditions = jDao::createConditions();
                $conditions->addCondition('login', '=', $usr_login);
                $conditions->addCondition(
                    'map',
                    '=',
                    $this->repository->getKey().':'.$this->getKey()
                );
                $gbList = $daogb->findBy($conditions);
                $gbCount = $daogb->countBy($conditions);
            }
            $tpl = new jTpl();
            $tpl->assign('gbCount', $gbCount);
            $tpl->assign('gbList', $gbList);
            $gbContent = null;
            if ($gbList) {
                $gbContent = $tpl->fetch('view~map_geobookmark');
            }
            $tpl = new jTpl();
            $tpl->assign(array(
                'repository' => $this->repository->getKey(),
                'project' => $this->getKey(),
                'gbContent' => $gbContent,
            ));
            $dockable[] = new lizmapMapDockItem(
                'permaLink',
                $this->jelix->getLocale('view~map.permalink.navbar.title'),
                $tpl->fetch('view~map_permalink'),
                8
            );
        }

        if (property_exists($configOptions, 'draw')
            && $configOptions->draw == 'True') {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'draw',
                $this->jelix->getLocale('view~map.draw.navbar.title'),
                $tpl->fetch('view~map_draw'),
                9
            );
        }

        return $dockable;
    }

    /**
     * @throws jExceptionSelector
     *
     * @return lizmapMapDockItem[]
     */
    public function getDefaultBottomDockable()
    {
        $dockable = array();
        $bp = $this->jelix->appConfig()->urlengine['basePath'];

        if ($this->hasAttributeLayers(true)) {
            $form = $this->jelix->createForm('view~attribute_layers_option');
            $assign = array('form' => $form);
            $dockable[] = new lizmapMapDockItem(
                'attributeLayers',
                $this->jelix->getLocale('view~map.attributeLayers.navbar.title'),
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

        // Check right on repository
        if (!$this->jelix->aclCheckResult(array('lizmap.repositories.view', $this->repository->getKey()))) {
            return false;
        }

        // Check acl option is configured in project config
        if (!property_exists($this->cfg->options, 'acl') || !is_array($this->cfg->options->acl) || empty($this->cfg->options->acl)) {
            return true;
        }

        // Check user is authenticated
        if (!$this->jelix->userIsConnected()) {
            return false;
        }

        // Check user is admin -> ok, give permission
        if ($this->jelix->aclCheckResult(array('lizmap.admin.repositories.delete'))) {
            return true;
        }

        // Check if configured groups white list and authenticated user groups list intersects
        $aclGroups = $this->cfg->options->acl;
        $userGroups = $this->jelix->aclDbUserGroups();
        if (array_intersect($aclGroups, $userGroups)) {
            return true;
        }

        return false;
    }

    public function getSpatialiteExtension()
    {
        if ($this->spatialiteExt !== null) {
            return $this->spatialiteExt;
        }

        // Try with mod_spatialite
        try {
            $db = new SQLite3(':memory:');
            $this->spatialiteExt = 'mod_spatialite.so';
            $spatial = @$db->loadExtension($this->spatialiteExt); // loading SpatiaLite as an extension
            if ($spatial) {
                return $this->spatialiteExt;
            }
        } catch (Exception $e) {
            $spatial = false;
        }
        // Try with libspatialite
        if (!$spatial) {
            try {
                $db = new SQLite3(':memory:');
                $this->spatialiteExt = 'libspatialite.so';
                $spatial = @$db->loadExtension($this->spatialiteExt); // loading SpatiaLite as an extension
                if ($spatial) {
                    return $this->spatialiteExt;
                }
            } catch (Exception $e) {
            }
        }
        $this->spatialiteExt = '';

        return '';
    }
}
