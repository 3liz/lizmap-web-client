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
use Lizmap\Server\Server;

/**
 * @phpstan-import-type MapLayerDef from QgisProject
 * @phpstan-import-type VectorLayerDef from QgisProject
 */
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
     * @var App\AppContextInterface The jelixInfos instance
     */
    protected $appContext;

    /**
     * @var \lizmapServices The lizmapServices instance
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
     * @var array list of layer orders: layer name => order
     */
    protected $layersOrder = array();

    /**
     * @var object
     */
    protected $printCapabilities = array();

    /**
     * @var null|object[] layer names => layers
     */
    protected $editionLayersForCurrentUser;

    /**
     * @var null|object[] List of layers with labeled fields configuration: layer ids => fields
     */
    protected $layersLabeledFieldsConfig;

    /**
     * @var array List of cached properties
     */
    protected static $cachedProperties = array(
        'layersOrder',
        'printCapabilities',
        'layersLabeledFieldsConfig',
    );

    /**
     * @var string
     */
    private $spatialiteExt;

    protected $path;

    /**
     * @var ProjectCache
     */
    protected $cacheHandler;

    /**
     * constructor.
     *
     * @param string                  $key        the project name
     * @param Repository              $rep        the repository
     * @param App\AppContextInterface $appContext context
     */
    public function __construct($key, Repository $rep, App\AppContextInterface $appContext, \lizmapServices $services)
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
        $qgsMtime = filemtime($file);
        $qgsCfgMtime = filemtime($file.'.cfg');

        $this->cacheHandler = new ProjectCache($file, $qgsMtime, $qgsCfgMtime, $this->appContext);

        $data = $this->cacheHandler->retrieveProjectData();
        if ($data === false) {
            // FIXME reading XML could take time, so many process could
            // read it and construct the cache at the same time. We should
            // have a kind of lock to avoid this issue.
            try {
                $fileContent = file_get_contents($file.'.cfg');
                $cfgContent = json_decode($fileContent);
                if ($cfgContent === null) {
                    throw new UnknownLizmapProjectException('The file '.$file.'.cfg cannot be decoded.');
                }

                $this->cfg = new ProjectConfig($cfgContent);
            } catch (UnknownLizmapProjectException $e) {
                throw $e;
            }

            $this->qgis = new QgisProject($file, $services, $this->appContext);
            $this->readProject();

            // set project data in cache
            $dataProj = array();
            foreach (self::$cachedProperties as $prop) {
                if (isset($this->{$prop}) && !empty($this->{$prop})) {
                    $dataProj[$prop] = $this->{$prop};
                }
            }

            $data = array(
                'project' => $dataProj,
                'qgis' => $this->qgis->getCacheData(),
                'cfg' => $this->cfg->getCacheData(),
            );
            $this->cacheHandler->storeProjectData($data);
        } else {
            foreach (self::$cachedProperties as $prop) {
                if (array_key_exists($prop, $data['project'])) {
                    $this->{$prop} = $data['project'][$prop];
                }
            }
            $rewriteCache = false;
            // embedded layers
            $embeddedProjects = array();
            foreach ($data['qgis']['layers'] as $index => $layer) {
                if (array_key_exists('embedded', $layer)
                    && $layer['embedded'] == '1'
                    && (
                        !array_key_exists('qgsmtime', $layer)
                        || $layer['qgsmtime'] < filemtime($layer['file'])
                    )
                ) {
                    if (!array_key_exists($layer['file'], $embeddedProjects)) {
                        $embeddedProjects[$layer['file']] = array();
                    }
                    // populate array of embedded layers
                    $embeddedProjects[$layer['file']][$index] = $layer;
                    $rewriteCache = true;
                }
            }

            // loop through the embedded projects if any, to get the embedded layers definition
            foreach ($embeddedProjects as $projectPath => $embeddedLayers) {
                if (is_array($embeddedLayers)) {
                    $embeddedProject = new QgisProject($projectPath, $this->services, $this->appContext);
                    foreach ($embeddedLayers as $index => $embeddedLayer) {
                        $newLayer = $embeddedProject->getLayerDefinition($embeddedLayer['id']);
                        $newLayer['qgsmtime'] = filemtime($embeddedLayer['file']);
                        $newLayer['file'] = $embeddedLayer['file'];
                        $newLayer['embedded'] = 1;
                        $newLayer['projectPath'] = $embeddedLayer['projectPath'];
                        $data['qgis']['layers'][$index] = $newLayer;
                    }
                }
            }

            if ($rewriteCache) {
                $this->cacheHandler->storeProjectData($data);
            }

            $this->cfg = new ProjectConfig($data['cfg']);
            $this->qgis = new QgisProject($file, $services, $appContext, $data['qgis']);
        }

        $this->path = $file;
    }

    /**
     * @return ProjectCache
     */
    public function getCacheHandler()
    {
        return $this->cacheHandler;
    }

    public function clearCache()
    {
        $this->cacheHandler->clearCache();
    }

    /**
     * Read the qgis files.
     */
    protected function readProject()
    {
        $qgsXml = $this->qgis;

        $this->qgis->setPropertiesAfterRead($this->cfg);

        $this->printCapabilities = $this->readPrintCapabilities($qgsXml);
        $this->readLocateByLayer($qgsXml, $this->cfg);
        $this->readEditionLayers($qgsXml);
        $this->layersOrder = $this->readLayersOrder($qgsXml);
        $this->readAttributeLayers($qgsXml, $this->cfg);

        $this->qgis->readEditionForms($this->getEditionLayers(), $this);

        // Get the fields configurations for attribute tables, form filter & dataviz
        $this->layersLabeledFieldsConfig = $this->qgis->readLayersLabeledFieldsConfig(
            $this->getLayersWithLabels(),
            $this
        );
    }

    /**
     * List of the layers configured in the tools
     * Attribute table, form filter & dataviz.
     *
     * We use this list to find all the fields for which
     * we need to replace the code by their corresponding labels
     *
     * @return array Array of layer ids
     */
    protected function getLayersWithLabels()
    {
        return $this->cfg->getLayersWithLabels();
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

    /**
     * Get the last date saved in the QGIS file.
     *
     * @return string the last saved date contained in the QGS file
     */
    public function getLastSaveDateTime()
    {
        return $this->qgis->getLastSaveDateTime();
    }

    /**
     * Get the version of the Lizmap plugin
     * used by the project editor on QGIS Desktop.
     * Default to 3.1.8 if the CFG is too old.
     *
     * @return string Version of the lizmap plugin
     */
    public function getLizmapPluginVersion()
    {
        $pluginMetadata = $this->cfg->getPluginMetadata();
        if (!is_null($pluginMetadata)) {
            return $pluginMetadata->lizmap_plugin_version;
        }

        // The CFG is very old, at least older than 3.1.8
        // Same value as in lizmap/www/assets/js/map.js
        return '3.1.8';
    }

    /**
     * Get the target version of Lizmap Web Client set in the QGIS desktop plugin.
     *
     * @return int Target version of Lizmap Web Client. Default to 30200 if the CFG is too old.
     */
    public function getLizmapWebClientTargetVersion()
    {
        $pluginMetadata = $this->cfg->getPluginMetadata();
        if (!is_null($pluginMetadata)) {
            return $pluginMetadata->lizmap_web_client_target_version;
        }

        // The CFG is very old, at least older than QGIS plugin 3.2
        // Same value as in lizmap/www/assets/js/map.js
        return 30200;
    }

    public function getRelations()
    {
        return $this->qgis->getRelations();
    }

    public function getRelationField($relationId)
    {
        return $this->qgis->getRelationField($relationId);
    }

    public function getThemes()
    {
        return $this->qgis->getThemes();
    }

    public function getCustomProjectVariables()
    {
        return $this->qgis->getCustomProjectVariables();
    }

    /**
     * @param string $layerId
     *
     * @return null|MapLayerDef|VectorLayerDef
     */
    public function getLayerDefinition($layerId)
    {
        return $this->qgis->getLayerDefinition($layerId);
    }

    /**
     * @param string $key
     *
     * @return null|\qgisMapLayer|\qgisVectorLayer
     */
    public function getLayerByKeyword($key)
    {
        return $this->qgis->getLayerByKeyword($key, $this);
    }

    /**
     * @param string $key
     *
     * @return \qgisMapLayer[]|\qgisVectorLayer[]
     */
    public function findLayersByKeyword($key)
    {
        return $this->qgis->findLayersByKeyword($key, $this);
    }

    /**
     * @return App\AppContextInterface
     */
    public function getAppContext()
    {
        return $this->appContext;
    }

    public function getKey()
    {
        return $this->key;
    }

    /**
     * @return Repository
     */
    public function getRepository()
    {
        return $this->repository;
    }

    /**
     * @return string
     */
    public function getRepositoryKey()
    {
        return $this->repository->getKey();
    }

    /**
     * Get the project title.
     *
     * @return string the project title
     */
    public function getTitle()
    {
        $title = $this->qgis->getTitle();
        if ($title == null) {
            $title = ucfirst($this->key);
        }

        return $title;
    }

    /**
     * Get the abstract.
     *
     * @return string abstract
     */
    public function getAbstract()
    {
        $abstract = $this->qgis->getAbstract();

        return $abstract ?: '';
    }

    /**
     * Get the keywords list.
     *
     * @return array list of keywords
     */
    public function getKeywordsList()
    {
        return $this->qgis->getKeywordList();
    }

    /**
     * Get proj.
     *
     * @return string
     */
    public function getProj()
    {
        return $this->cfg->getOption('projection')->ref;
    }

    /**
     * Get the bbox.
     *
     * @return string
     */
    public function getBbox()
    {
        return implode(', ', $this->cfg->getOption('bbox'));
    }

    /**
     * WMS Max Width.
     *
     * @return int
     */
    public function getWMSMaxWidth()
    {
        return $this->qgis->getWMSMaxWidth();
    }

    /**
     * WMS Max Height.
     *
     * @return int
     */
    public function getWMSMaxHeight()
    {
        return $this->qgis->getWMSMaxHeight();
    }

    /**
     * Get OGC service Url.
     *
     * @return string
     */
    public function getOgcServiceUrl()
    {
        return $this->appContext->getFullUrl(
            'lizmap~service:index',
            array(
                'repository' => $this->repository->getKey(),
                'project' => $this->key,
            )
        );
    }

    /**
     * Get the WMS GetCapabilities Url.
     *
     * @return string
     */
    public function getWMSGetCapabilitiesUrl()
    {
        return $this->appContext->getFullUrl(
            'lizmap~service:index',
            array(
                'repository' => $this->repository->getKey(),
                'project' => $this->key,
                'SERVICE' => 'WMS',
                'VERSION' => '1.3.0',
                'REQUEST' => 'GetCapabilities',
            )
        );
    }

    /**
     * Get the WMTS GetCapabilities Url.
     *
     * @return string
     */
    public function getWMTSGetCapabilitiesUrl()
    {
        return $this->appContext->getFullUrl(
            'lizmap~service:index',
            array(
                'repository' => $this->repository->getKey(),
                'project' => $this->key,
                'SERVICE' => 'WMTS',
                'VERSION' => '1.0.0',
                'REQUEST' => 'GetCapabilities',
            )
        );
    }

    public function getFileTime()
    {
        return $this->cacheHandler->getFileTime();
    }

    public function getCfgFileTime()
    {
        return $this->cacheHandler->getCfgFileTime();
    }

    /**
     * unknown purpose.
     *
     * @deprecated
     *
     * @return array|string[]
     */
    public function getProperties()
    {
        return array(
            'repository',
            'id',
            'title',
            'abstract',
            'proj',
            'bbox',
        );
    }

    /**
     * @return object
     *
     * @deprecated use getOption() or getBooleanOption() instead
     */
    public function getOptions()
    {
        return $this->cfg->getOptions();
    }

    /**
     * @param string $name the option name
     *
     * @return null|mixed
     */
    public function getOption($name)
    {
        return $this->cfg->getOption($name);
    }

    /**
     * Retrieve the given option as a boolean value.
     *
     * @param string $name the option name
     *
     * @return null|bool true if the option value is 'True', null if it does not exist
     */
    public function getBooleanOption($name)
    {
        return $this->cfg->getBooleanOption($name);
    }

    public function getLayers()
    {
        return $this->cfg->getLayers();
    }

    /**
     * Get the number of layers.
     *
     * @return int
     */
    public function getLayerCount()
    {
        return count((array) $this->cfg->getLayers());
    }

    /**
     * @param string $layerId
     *
     * @return null|\qgisMapLayer|\qgisVectorLayer
     */
    public function getLayer($layerId)
    {
        return $this->qgis->getLayer($layerId, $this);
    }

    /**
     * @param string $layerId
     *
     * @return \SimpleXMLElement[]
     *
     * @deprecated
     */
    public function getXmlLayer($layerId)
    {
        return $this->qgis->getXmlLayer($layerId);
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
        switch ($key) {
            case 'id':
                return $this->key;

            case 'repository':
                return $this->repository->getKey();

            case 'title':
                return $this->getTitle();

            case 'abstract':
                return $this->getAbstract();

            case 'proj':
                return $this->getProj();

            case 'bbox':
                return $this->getBbox();

            case 'wmsGetCapabilitiesUrl':
                return $this->getWMSGetCapabilitiesUrl();

            case 'wmtsGetCapabilitiesUrl':
                return $this->getWMTSGetCapabilitiesUrl();
        }

        return $this->qgis->getData($key);
    }

    /**
     * Get the minimum needed project information for some pages (landing page, admin project listing).
     *
     * @return ProjectMetadata
     */
    public function getMetadata()
    {
        return new ProjectMetadata($this);
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
        $WMSInformation = $this->qgis->getWMSInformation();
        $WMSInformation['ProjectCrs'] = $this->cfg->getOption('projection')->ref;

        return $WMSInformation;
    }

    public function hasLocateByLayer()
    {
        $locate = $this->cfg->getLocateByLayer();
        if ($locate && count((array) $locate)) {
            return true;
        }

        return false;
    }

    /**
     * Lizmap < 3.7: return true:
     * - if print checkbox is checked and
     * - if there is at least one print layout which is not an atlas
     * Lizmap >= 3.7: return true:
     * - if there is at least one print layout enabled which is not an atlas.
     *
     * @return bool
     */
    public function hasPrintEnabled()
    {
        // Lizmap < 3.7
        if ($this->cfg->getBooleanOption('print')) {
            foreach ($this->printCapabilities as $printCfg) {
                if (array_key_exists('atlas', $printCfg)
                && array_key_exists('enabled', $printCfg['atlas']) && $printCfg['atlas']['enabled'] == '0') {
                    return true;
                }
            }
        }

        // Lizmap >= 3.7
        $layouts = $this->cfg->getLayouts();
        if (property_exists($layouts, 'list')) {
            foreach ($layouts->list as $layout) {
                if (property_exists($layout, 'enabled') && $layout->enabled) {
                    return true;
                }
            }
        }

        return false;
    }

    public function hasFormFilterLayers()
    {
        $form = $this->cfg->getFormFilterLayers();
        if ($form && count((array) $form)) {
            return true;
        }

        return false;
    }

    public function getFormFilterLayersConfig()
    {
        return $this->cfg->getFormFilterLayers();
    }

    public function hasTimemanagerLayers()
    {
        $timeManager = $this->cfg->getTimemanagerLayers();
        if ($timeManager && count((array) $timeManager)) {
            return true;
        }

        return false;
    }

    public function hasAtlasEnabled()
    {
        $atlasEnabled = $this->cfg->getBooleanOption('atlasEnabled');
        $atlas = $this->cfg->getAtlas();

        if ($atlasEnabled // Legacy LWC < 3.4 (only one layer)
            || ($atlas && property_exists($atlas, 'layers') && count((array) $atlas->layers) > 0)) { // Multiple atlas
            return true;
        }

        return false;
    }

    public function hasTooltipLayers()
    {
        $tooltip = $this->cfg->getTooltipLayers();
        if ($tooltip && count((array) $tooltip)) {
            return true;
        }

        return false;
    }

    public function hasAttributeLayers($onlyDisplayedLayers = false)
    {
        $attributeLayers = $this->cfg->getAttributeLayers();
        if ($attributeLayers) {
            $hasDisplayedLayer = !$onlyDisplayedLayers;
            if ($onlyDisplayedLayers) {
                foreach ($attributeLayers as $obj) {
                    if (!property_exists($obj, 'hideLayer')
                        || strtolower($obj->hideLayer) != 'true'
                    ) {
                        $hasDisplayedLayer = true;
                    }
                }
            }

            if (count((array) $attributeLayers) && $hasDisplayedLayer) {
                return true;
            }
        }

        return false;
    }

    public function hasAttributeLayersForLayer($layerName)
    {
        $attributeLayers = $this->cfg->getAttributeLayers();

        return property_exists($attributeLayers, $layerName);
    }

    public function isPivotLayer($layerName)
    {
        $attributeLayers = $this->cfg->getAttributeLayers();
        if (property_exists($attributeLayers, $layerName)) {
            $attributeLayer = $attributeLayers->{$layerName};

            return property_exists($attributeLayer, 'pivot') && $attributeLayer->pivot == 'True';
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

    /**
     * same as hasEditionLayersForCurrentUser.
     *
     * @return bool
     *
     * @deprecated will returns all edition layers, regarding ACL
     */
    public function hasEditionLayers()
    {
        return $this->hasEditionLayersForCurrentUser();
    }

    public function hasEditionLayersForCurrentUser()
    {
        if ($this->editionLayersForCurrentUser === null) {
            $this->readEditionLayersForCurrentUser();
        }

        if (count($this->editionLayersForCurrentUser) != 0) {
            return true;
        }

        return false;
    }

    protected function readEditionLayersForCurrentUser()
    {
        if (!$this->cfg->hasEditionLayers()) {
            $this->editionLayersForCurrentUser = array();

            return;
        }

        if (!$this->appContext->aclCheck('lizmap.tools.edition.use', $this->repository->getKey())) {
            $this->editionLayersForCurrentUser = array();

            return;
        }

        $editionLayers = $this->cfg->getEditionLayers();
        $this->editionLayersForCurrentUser = array();
        $isAdmin = $this->appContext->aclCheck('lizmap.admin.repositories.delete');
        $userGroups = $this->appContext->aclUserGroupsId();

        foreach ($editionLayers as $key => $eLayer) {
            if ($this->_checkEditionLayerAcl($eLayer, $isAdmin, $userGroups)) {
                $this->editionLayersForCurrentUser[$key] = $eLayer;
            }
        }
    }

    /**
     * Indicate if the edition layer can be edit by the current user.
     *
     * @param object $eLayer edition layer object
     */
    public function checkEditionLayerAcl($eLayer)
    {
        $isAdmin = $this->appContext->aclCheck('lizmap.admin.repositories.delete');
        $userGroups = $this->appContext->aclUserGroupsId();

        return $this->_checkEditionLayerAcl($eLayer, $isAdmin, $userGroups);
    }

    /**
     * @param object   $eLayer     the edition layer
     * @param bool     $isAdmin
     * @param string[] $userGroups
     *
     * @return bool
     */
    protected function _checkEditionLayerAcl($eLayer, $isAdmin, $userGroups)
    {
        // Check if user groups intersects groups allowed by project editor
        // If user is admin, no need to check for given groups
        if (property_exists($eLayer, 'acl') && $eLayer->acl) {
            // Check if configured groups white list and authenticated user
            // groups list intersects
            $editionGroups = preg_split('/\s*,\s*/', $eLayer->acl);
            if ($isAdmin || ($editionGroups
                && array_intersect($editionGroups, $userGroups))) {
                // User group(s) correspond to the groups given for this edition layer
                // or user is admin: we take the layer.
                unset($eLayer->acl);

                return true;
            }

            return false;
        }

        return true;
    }

    /**
     * @param mixed $layerName
     *
     * @return null|object the layer or null if does not exist
     */
    public function getEditionLayerForCurrentUser($layerName)
    {
        if ($this->editionLayersForCurrentUser !== null) {
            // we already read all edition layers, just pick the corresponding one
            if (isset($this->editionLayersForCurrentUser[$layerName])) {
                return $this->editionLayersForCurrentUser[$layerName];
            }

            return null;
        }

        // we didn't yet retrieve all edition layer. Just pick and check the
        // given edition layer. We do not call readEditionLayersForCurrentUser
        // because we may need only the given layer during the php request process
        // and we don't want to spend time on all others layers

        $layer = $this->cfg->getEditionLayerByName($layerName);
        if (!$layer) {
            return null;
        }

        if (!$this->appContext->aclCheck('lizmap.tools.edition.use', $this->repository->getKey())) {
            return null;
        }

        if ($this->checkEditionLayerAcl($layer)) {
            return $layer;
        }

        return null;
    }

    public function getEditionLayersForCurrentUser()
    {
        if ($this->editionLayersForCurrentUser === null) {
            $this->readEditionLayersForCurrentUser();
        }

        return $this->editionLayersForCurrentUser;
    }

    /**
     * @return object
     */
    public function getEditionLayers()
    {
        return $this->cfg->getEditionLayers();
    }

    /**
     * Return the given edition layer, whether the user has the right to edit
     * or not.
     *
     * @param mixed $layerName
     */
    public function getEditionLayerByName($layerName)
    {
        $eLayers = $this->getEditionLayers();
        if (!property_exists($eLayers, $layerName)) {
            return null;
        }

        return $eLayers->{$layerName};
    }

    /**
     * @return object
     */
    public function getTooltipLayers()
    {
        return $this->cfg->getTooltipLayers();
    }

    /**
     * Return the given edition layer if it exists and if the
     * current user can edit it.
     *
     * Similar to getEditionLayerForCurrentUser except that
     * findEditionLayerByName loads alls edition layers if not already done.
     * Use it in a layers loop instead of getEditionLayerForCurrentUser.
     *
     * @param mixed $name
     *
     * @return null|object
     */
    public function findEditionLayerByName($name)
    {
        if (!$this->hasEditionLayersForCurrentUser()) {
            return null;
        }

        return $this->getEditionLayerForCurrentUser($name);
    }

    /**
     * Return the given edition layer if it exists and if the
     * current user can edit it.
     *
     * notice: it checks all edition layers.
     *
     * @param mixed $layerId
     *
     * @return null|object
     */
    public function findEditionLayerByLayerId($layerId)
    {
        if (!$this->hasEditionLayersForCurrentUser()) {
            return null;
        }

        $layer = $this->cfg->getEditionLayerByLayerId($layerId);
        if ($layer && $this->checkEditionLayerAcl($layer)) {
            return $layer;
        }

        return null;
    }

    /**
     * @return bool
     */
    public function hasLoginFilteredLayers()
    {
        $login = (array) $this->cfg->getLoginFilteredLayers();
        if (count((array) $login) > 0) {
            return true;
        }

        return false;
    }

    /**
     * Get login filtered config.
     *
     * @param string $layerName : layer's name
     * @param bool   $edition   : get login filters for edition
     *
     * @return null|object the login filtered config
     */
    public function getLoginFilteredConfig($layerName, $edition = false)
    {
        if (!$this->hasLoginFilteredLayers() || !$layerName) {
            return null;
        }

        $ln = $layerName;
        // In case $layerName is a WFS TypeName
        $layerByTypeName = $this->cfg->findLayerByTypeName($layerName);
        if ($layerByTypeName) {
            $ln = $layerByTypeName->name;
        }

        $login = $this->cfg->getLoginFilteredLayers();
        if (!$login || !property_exists($login, $ln)) {
            return null;
        }

        $loginFilteredConfig = $login->{$ln};

        // If login filter is configured for edition only and the expression
        // is not requested for edition, do not return expression
        if (property_exists($loginFilteredConfig, 'edition_only')
            && $this->optionToBoolean($loginFilteredConfig->edition_only)
            && !$edition) {
            return null;
        }

        return $loginFilteredConfig;
    }

    /**
     * Get login filters, get expressions for layers based on login filtered
     * config.
     *
     * NOTE: We could delegate this completely to the lizmap_server plugin
     * for all requests. The only request needed to have the SQL filter
     * is the WFS GetFeature request, if the layer is a PostgreSQL layer.
     * It this particular case, we could use a similar approach
     * that the one use with qgisVectorLayer::requestPolygonFilter
     * which calls the server plugin with SERVICE=Lizmap&REQUEST=GetSubsetString
     *
     * @param string[] $layers  : layers' name list
     * @param bool     $edition : get login filters for edition
     *
     * @return array Array containing layers names as key and filter configuration
     *               and SQL filters as values. Array might be empty if no filter
     *               is configured for the layer.
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
            $loginFilteredConfig = $this->getLoginFilteredConfig($lName, $edition);
            if ($loginFilteredConfig == null) {
                continue;
            }

            // attribute to filter
            $attribute = $loginFilteredConfig->filterAttribute;
            // profile for db connection
            $profile = null;

            // get QGIS layer
            /** @var null|\qgisVectorLayer $qgisLayer The QGIS vector layer instance */
            $qgisLayer = $this->qgis->getLayer($layerByTypeName->id, $this);

            // get datasource profile
            if ($qgisLayer) {
                $profile = $qgisLayer->getDatasourceProfile();
            }

            $cnx = $this->appContext->getDbConnection($profile ? $profile : '');
            // Quoted attribute with double-quotes
            $quotedField = $cnx->encloseName($attribute);

            // Get QGIS vector layer provider
            $provider = 'unknown';
            if ($qgisLayer) {
                $provider = $qgisLayer->getProvider();
            }

            // default no user connected
            $filter = "{$quotedField} = 'all'";

            // For PostgreSQL layers, allow multiple values in the filter field
            // E.g. "groupe_a,other_group"
            if ($provider == 'postgres'
                && property_exists($loginFilteredConfig, 'allow_multiple_acl_values')
                && $loginFilteredConfig->allow_multiple_acl_values
            ) {
                $filter .= " OR {$quotedField} LIKE 'all,%'";
                $filter .= " OR {$quotedField} LIKE '%,all'";
                $filter .= " OR {$quotedField} LIKE '%,all,%'";
            }

            // A user is connected
            if ($this->appContext->userIsConnected()) {
                // Get the user
                $user = $this->appContext->getUserSession();
                $login = $user->login;

                // List of values for expression
                $values = array();
                if (property_exists($loginFilteredConfig, 'filterPrivate')
                    && $this->optionToBoolean($loginFilteredConfig->filterPrivate)
                ) {
                    // If filter is private use user_login
                    $values[] = $login;
                } else {
                    // Else use user groups
                    $userGroups = $this->appContext->aclUserPublicGroupsId();
                    $values = $userGroups;
                }

                // Add all to values
                $values[] = 'all';
                $allValuesFilters = array();

                // For each value (group, all, login, etc.), create a filter
                // combining all the possibility: equality & LIKE
                foreach ($values as $value) {
                    $valueFilters = array();
                    // Quote the value with single quotes
                    $quotedValue = $cnx->quote($value);

                    // equality
                    $valueFilters[] = "{$quotedField} = {$quotedValue}";

                    // For PostgreSQL layers, allow multiple values in the filter field
                    // E.g. "groupe_a,other_group"
                    if ($provider == 'postgres'
                        && property_exists($loginFilteredConfig, 'allow_multiple_acl_values')
                        && $loginFilteredConfig->allow_multiple_acl_values
                    ) {
                        // begins with value & comma
                        $quotedLikeValue = $cnx->quote("{$value},%");
                        $valueFilters[] = "{$quotedField} LIKE {$quotedLikeValue}";

                        // ends with comma & value
                        $quotedLikeValue = $cnx->quote("%,{$value}");
                        $valueFilters[] = "{$quotedField} LIKE {$quotedLikeValue}";

                        // value between two commas
                        $quotedLikeValue = $cnx->quote("%,{$value},%");
                        $valueFilters[] = "{$quotedField} LIKE {$quotedLikeValue}";
                    }

                    // Build the filter for this value
                    $allValuesFilters[] = implode(' OR ', $valueFilters);
                }

                // Build filter for all values
                $filter = implode(' OR ', $allValuesFilters);
            }

            $filters[$layerName] = array_merge(
                (array) $loginFilteredConfig,
                array('filter' => '( '.$filter.' )', 'layername' => $lName)
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

    /** Checks if the project has a configuration and layers for the filter by polygon.
     *
     * @return bool
     */
    public function hasPolygonFilteredLayers()
    {
        $filter_config = (array) $this->cfg->getPolygonFilterConfig();
        if (!$filter_config) {
            return false;
        }

        if (!array_key_exists('config', $filter_config)) {
            return false;
        }

        if (array_key_exists('layers', $filter_config) && count($filter_config['layers']) > 0) {
            return true;
        }

        return false;
    }

    /**
     * Get the configuration for the polygon filter of the given layer
     * from the Lizmap JSON config file.
     *
     * If the polygon filter is configured for editing only
     * and we are not in an editing context we return null
     * to tell there is no filter in this context.
     *
     * @param string $layerName      : the layer name
     * @param bool   $editingContext : we are in editing context
     *
     * @return null|array the configuration for the polygon filter the given layer
     */
    public function getLayerPolygonFilterConfig($layerName, $editingContext = false)
    {
        if (!$this->hasPolygonFilteredLayers()) {
            return null;
        }

        // Get layer ID
        $layer = $this->cfg->findLayerByAnyName($layerName);
        if (!$layer) {
            return null;
        }

        // Get the global filter by polygon config in cfg
        $polygon_filter_config = $this->cfg->getPolygonFilterConfig();

        // Find the given layer among the layers object of the config
        // layers is an array of objects with keys: layer, primary_key & filter_mode
        $filtered_layers = (array) $polygon_filter_config->layers;

        $layer_config = null;
        foreach ($filtered_layers as $filtered_layer) {
            if ($filtered_layer->layer == $layer->id) {
                $layer_config = $filtered_layer;

                break;
            }
        }
        if (!$layer_config) {
            return null;
        }
        $layer_config = (array) $layer_config;

        // If the polygon filter is configured for editing only
        // and we are not in an editing context
        // No need to return the filter config
        if (!$editingContext && $layer_config['filter_mode'] == 'editing_only') {
            return null;
        }

        return $layer_config;
    }

    /**
     * @param object $object   The configuration
     * @param string $property String about the property to request
     * @param mixed  $default  Default returned if the property is not found
     *
     * @return mixed
     */
    private function getPropertyOrDefault(object $object, string $property, $default = null)
    {
        if (property_exists($object, $property)) {
            return $object->{$property};
        }

        return $default;
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

    public function parseDatavizPlotConfig($config)
    {
        if (!property_exists($config, 'layerId')) {
            if ($this->services->debugMode == '1') {
                \jLog::log('Dataviz - layerId not found ! No plot configuration found.', 'lizmapadmin');
            }

            return null;
        }
        $layer = $this->cfg->findLayerByAnyName($config->layerId);
        if (!$layer) {
            if ($this->services->debugMode == '1') {
                \jLog::log('Dataviz - layer not found, id   = '.$config->layerId, 'lizmapadmin');
            }

            return null;
        }
        $title = $layer->title;
        if (!empty($config->title)) {
            $title = trim($config->title);
        }
        // Since LWC 3.7, the title can be different
        // when the plot is displayed in popup
        $title_popup = $title;
        if (property_exists($config, 'title_popup') && !empty(trim($config->title_popup))) {
            $title_popup = trim($config->title_popup);
        }

        $type = 'bar';
        $allowedTypes = array(
            'bar', 'pie', 'scatter', 'box',
            'histogram', 'histogram2d',
            'polar', 'sunburst', 'html',
        );
        if (in_array($config->type, $allowedTypes)) {
            $type = $config->type;
        }
        $plotConfig = array(
            'plot_id' => (int) $config->order,
            'layer_id' => $layer->id,
            'title' => $title,
            'title_popup' => $title_popup,
            'plot' => array(
                'type' => $type,
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
            if (property_exists($config, $prop)) {
                $plotConfig['plot'][$prop] = $config->{$prop};
            }
        }

        if (property_exists($config, 'popup_display_child_plot')) {
            $plotConfig['popup_display_child_plot'] = $config->popup_display_child_plot;
        }
        if (property_exists($config, 'only_show_child')) {
            $plotConfig['only_show_child'] = $config->only_show_child;
        }
        // Since LWC 3.7
        $plotConfig['trigger_filter'] = $this->getPropertyOrDefault($config, 'trigger_filter', true);

        $plotConfig['abstract'] = trim($layer->abstract);
        $description = trim($this->getPropertyOrDefault($config, 'description', ''));
        if ($description !== '') {
            $plotConfig['abstract'] = $description;
        }

        $props = array(
            'display_legend' => true,
            'stacked' => false,
            'horizontal' => false,
        );
        foreach ($props as $prop => $default) {
            $value = $default;
            if (property_exists($config, $prop)) {
                $value = $this->optionToBoolean($config->{$prop});
            }
            $plotConfig['plot'][$prop] = $value;
        }

        // Add more layout config, written like:
        // layout_config=barmode:stack,bargap:0.5
        if (!empty($config->layout_config)) {
            $layout_config = array();
            $a = array_map('trim', explode(',', $config->layout_config));
            foreach ($a as $i) {
                $b = array_map('trim', explode(':', $i));
                if (is_array($b) and count($b) == 2) {
                    $c = $b[1];
                    $c = $this->optionToBoolean($c);
                    $layout_config[$b[0]] = $c;
                }
            }
            if (count($layout_config) > 0) {
                $plotConfig['plot']['layout_config'] = $layout_config;
            }
        }

        return $plotConfig;
    }

    /**
     * @return array the dataviz layers config extended with locale
     */
    public function getDatavizLayersConfig()
    {
        // Initialize the dataviz config to be used by the browser
        $config = array(
            'layers' => array(),
            'dataviz' => array(),
            'locale' => $this->appContext->appConfig()->locale,
        );

        // Get the dataviz plots from the JSON config (as given by the plugin)
        $datavizLayers = $this->cfg->getDatavizLayers();
        if (!$datavizLayers) {
            // provide the empty config with locale
            return $config;
        }

        // Check if all the plot must be displayed only in the parent popup
        $countPlotOnlyChild = 0;
        foreach ($datavizLayers as $order => $lc) {
            $plotConfig = $this->parseDatavizPlotConfig($lc);
            if ($plotConfig) {
                $config['layers'][$order] = $plotConfig;
                if (array_key_exists('only_show_child', $plotConfig) && strtolower($plotConfig['only_show_child']) == 'true') {
                    ++$countPlotOnlyChild;
                }
            }
        }

        // No plots in the configuration, return empty content
        if (empty($config['layers'])) {
            // provide the empty config with locale
            return $config;
        }

        // Add the dataviz configuration options in the returned object
        $config['dataviz'] = array(
            'location' => 'dock',
            'theme' => 'dark',
        );

        // Location i.e. in which dock should the plots be displayed
        $optionDatavizLocation = $this->cfg->getOption('datavizLocation');
        if (in_array(
            $optionDatavizLocation,
            array('dock', 'bottomdock', 'right-dock')
        )
        ) {
            $config['dataviz']['location'] = $optionDatavizLocation;
        }

        // Dataviz theme : dark, light
        $theme = $this->cfg->getOption('theme');
        if (in_array($theme, array('dark', 'light'))) {
            $config['dataviz']['theme'] = $theme;
        }

        // Tell that all the plots must only be displayed in the popup
        if ($countPlotOnlyChild === count($config['layers'])) {
            $config['dataviz']['location'] = 'only-popup';
        }

        return $config;
    }

    /**
     * @return bool
     */
    public function needsGoogle()
    {
        $googleProps = array(
            'googleStreets',
            'googleSatellite',
            'googleHybrid',
            'googleTerrain',
        );

        foreach ($googleProps as $google) {
            if ($this->cfg->getBooleanOption($google)) {
                return true;
            }
        }

        $externalSearch = $this->cfg->getOption('externalSearch');

        return $externalSearch == 'google';
    }

    /**
     * @return string
     */
    public function getGoogleKey()
    {
        $gKey = $this->cfg->getOption('googleKey');
        if ($gKey === null) {
            $gKey = '';
        }

        return $gKey;
    }

    protected function readPrintCapabilities(QgisProject $qgsLoad)
    {
        return $qgsLoad->getPrintTemplates();
    }

    protected function readLocateByLayer(QgisProject $xml, ProjectConfig $cfg)
    {
        $locateByLayer = $cfg->getLocateByLayer();
        if ($locateByLayer) {
            $xml->readLocateByLayer($locateByLayer);
        }
    }

    protected function readEditionLayers(QgisProject $xml)
    {
        if (!$this->cfg->hasEditionLayers()) {
            return;
        }

        $xml->readEditionLayers($this->cfg->getEditionLayers());
    }

    protected function readAttributeLayers(QgisProject $xml, ProjectConfig $cfg)
    {
        $attributeLayers = $cfg->getAttributeLayers();

        if ($attributeLayers) {
            $xml->readAttributeLayers($attributeLayers);
        }
    }

    /**
     * @return int[]
     */
    protected function readLayersOrder(QgisProject $xml)
    {
        return $xml->readLayersOrder($this->cfg->getLayers());
    }

    /**
     * @param string $layerId
     *
     * @return null|string
     */
    public function getLayerNameByIdFromConfig($layerId)
    {
        return $this->qgis->getLayerNameByIdFromConfig($layerId, $this->cfg->getLayers());
    }

    /**
     * @param mixed $name
     */
    public function findLayerByAnyName($name)
    {
        return $this->cfg->findLayerByAnyName($name);
    }

    /**
     * @param mixed $name
     */
    public function findLayerByName($name)
    {
        return $this->cfg->findLayerByName($name);
    }

    /**
     * @param mixed $shortName
     */
    public function findLayerByShortName($shortName)
    {
        return $this->cfg->findLayerByShortName($shortName);
    }

    /**
     * @param mixed $title
     */
    public function findLayerByTitle($title)
    {
        return $this->cfg->findLayerByTitle($title);
    }

    /**
     * @param mixed $layerId
     */
    public function findLayerByLayerId($layerId)
    {
        return $this->cfg->findLayerByLayerId($layerId);
    }

    /**
     * @param mixed $typeName
     */
    public function findLayerByTypeName($typeName)
    {
        return $this->cfg->findLayerByTypeName($typeName);
    }

    /**
     * Get the configuration for the layers used in the UI
     * for which some fields values must be replaced by the corresponding labels.
     *
     * @return array The layers and fields configuration
     */
    public function getLayersLabeledFieldsConfig()
    {
        return $this->layersLabeledFieldsConfig;
    }

    /**
     * @return object the JSON object corresponding to the configuration
     */
    public function getUpdatedConfig()
    {
        $configJson = $this->cfg->getConfigContent();

        // Add an option to display buttons to remove the cache for cached layer
        // Only if appropriate right is found
        if ($this->appContext->aclCheck('lizmap.admin.repositories.delete')) {
            $configJson->options->removeCache = 'True';
        }

        // Remove layerOrder option from config if not required
        if (!empty($this->layersOrder)) {
            $configJson->layersOrder = $this->layersOrder;
        }

        // Remove FTP remote directory
        if (property_exists($configJson->options, 'remoteDir')) {
            unset($configJson->options->remoteDir);
        }

        // Remove editionLayers from config if no right to access this tool
        if ($this->hasEditionLayersForCurrentUser()) {
            // give only layer that the user has the right to edit
            $configJson->editionLayers = (object) $this->editionLayersForCurrentUser;
        } else {
            unset($configJson->editionLayers);
        }

        // Add export layer right
        if ($this->appContext->aclCheck('lizmap.tools.layer.export', $this->repository->getKey())) {
            $configJson->options->exportLayers = 'True';
        }

        // Add WMS max width ad height
        $services = $this->services;

        $wmsMaxWidth = $this->qgis->getWMSMaxWidth();
        $configJson->options->wmsMaxWidth = $wmsMaxWidth ?: $services->wmsMaxWidth;

        $wmsMaxHeight = $this->qgis->getWMSMaxHeight();
        $configJson->options->wmsMaxHeight = $wmsMaxHeight ?: $services->wmsMaxHeight;

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
        if ($this->qgis->isUsingLayerIDs()) {
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
        $searchServices = $this->appContext->eventNotify(
            'searchServiceItem',
            array(
                'repository' => $this->repository->getKey(),
                'project' => $this->getKey(),
            )
        )->getResponse();

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

        // Get user groups to check layouts and layers visibility
        $userGroups = array('');
        if ($this->appContext->userIsConnected()) {
            $userGroups = $this->appContext->aclUserGroupsId();
        }

        // set printTemplates in config
        $layoutsList = null;
        if (property_exists($configJson, 'layouts')
            && property_exists($configJson->layouts, 'list')) {
            $layoutsList = $configJson->layouts->list;
        }
        $enabledLayoutNames = null;
        $enabledLayouts = null;
        if ($layoutsList !== null) {
            $enabledLayoutNames = array();
            $enabledLayouts = array();
            foreach ($layoutsList as $layoutCfg) {
                if (!$layoutCfg->enabled) {
                    continue;
                }
                $layoutName = $layoutCfg->layout;
                if (!property_exists($layoutCfg, 'allowed_groups')
                    || empty($layoutCfg->allowed_groups)) {
                    $enabledLayoutNames[] = $layoutName;
                    if (property_exists($layoutCfg, 'allowed_groups')) {
                        unset($layoutCfg->allowed_groups);
                    }
                    $enabledLayouts[] = $layoutCfg;

                    continue;
                }
                $allowed_groups = $layoutCfg->allowed_groups;
                if (!is_array($allowed_groups)) {
                    $allowed_groups = explode(',', $allowed_groups);
                }
                $allowed_groups = array_map('trim', $allowed_groups);
                foreach ($userGroups as $group) {
                    if (!in_array($group, $allowed_groups)) {
                        continue;
                    }

                    $enabledLayoutNames[] = $layoutName;
                    unset($layoutCfg->allowed_groups);
                    $enabledLayouts[] = $layoutCfg;

                    break;
                }
            }
            $configJson->layouts->list = $enabledLayouts;
        }
        // Add printTemplates to the config
        $configJson->printTemplates = array();
        // Get server metadata to check atlasprint plugin
        $server = new Server();
        $serverMetadata = $server->getMetadata();
        $serverPlugins = $serverMetadata['qgis_server_info']['plugins'];
        foreach ($this->printCapabilities as $printTemplate) {
            /** @var array $printTemplate */
            if ($serverPlugins['atlasprint']['version'] == 'not found'
                && array_key_exists('atlas', $printTemplate)
                && array_key_exists('coverageLayer', $printTemplate['atlas'])
                && $printTemplate['atlas']['coverageLayer'] != '') {
                // The atlasprint plugin is not available
                continue;
            }
            if ($enabledLayoutNames === null
                || in_array($printTemplate['title'], $enabledLayoutNames)) {
                $configJson->printTemplates[] = $printTemplate;
            }
        }

        // Check layers visibility
        // and update the layers info
        $layersToRemove = array();
        foreach ($configJson->layers as $obj) {
            // Add layer type to layers
            // and external access data if it is interesting
            if ($obj->type == 'layer') {
                // Get layer definition extracted from XML
                $layerDef = $this->getLayerDefinition($obj->id);
                // Layer can be not found in XML
                if ($layerDef) {
                    // Add layer type
                    $obj->layerType = $layerDef['type'];
                    // add webDav fields as layer property
                    if (array_key_exists('webDavFields', $layerDef)) {
                        $obj->webDavFields = $layerDef['webDavFields'];
                    }
                    // Extract layer datasource parameters only for raster/wms
                    if ($layerDef['type'] == 'raster' && $layerDef['provider'] == 'wms') {
                        // source xyz: $layerDatasource['type'] == 'xyz'
                        // source wmts: stripos($layerDatasource['url'], 'wmts')
                        // source wms : else
                        parse_str($layerDef['datasource'], $layerDatasource);
                        // Do not provide external access data if the datasource contains
                        // authentication parameters
                        if (!array_key_exists('password', $layerDatasource)
                            && !array_key_exists('authcfg', $layerDatasource)) {
                            // Add wmts type if type is not already defined (it is for xyz)
                            // and the url contains wmts and the CRS is EPSG:3857
                            if (!array_key_exists('type', $layerDatasource)
                                && stripos($layerDatasource['url'], 'service=wmts')) {
                                $layerDatasource['type'] = 'wmts';
                            }
                            // Add crs if type is xyz
                            if (array_key_exists('type', $layerDatasource)
                                && $layerDatasource['type'] == 'xyz'
                                && !array_key_exists('crs', $layerDatasource)) {
                                $layerDatasource['crs'] = 'EPSG:3857';
                            }
                            // if the layer datasource contains type and crs EPSG:3857
                            // external access can be provided
                            if (array_key_exists('type', $layerDatasource)
                                && $layerDatasource['crs'] == 'EPSG:3857') {
                                $obj->externalWmsToggle = 'True';
                                $obj->externalAccess = $layerDatasource;
                            }
                        }
                    }
                }
            }

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
        foreach ($layersToRemove as $key => $layerToRemoveCfg) {
            // locateByLayer
            if (property_exists($configJson->locateByLayer, $key)) {
                unset($configJson->locateByLayer->{$key});
            }
            // locateByLayer vectorjoins
            foreach ($configJson->locateByLayer as $singleLocateByLayerCfg) {
                if (!property_exists($singleLocateByLayerCfg, 'vectorjoins')) {
                    continue;
                }
                $vectorjoinsToKeep = array();
                foreach ($singleLocateByLayerCfg->vectorjoins as $vectorjoinCfg) {
                    if ($vectorjoinCfg->joinLayerId != $layerToRemoveCfg->id) {
                        $vectorjoinsToKeep[] = $vectorjoinCfg;
                    }
                }
                $singleLocateByLayerCfg->vectorjoins = $vectorjoinsToKeep;
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
            if ($this->hasEditionLayersForCurrentUser()
                && property_exists($configJson->editionLayers, $key)) {
                unset($configJson->editionLayers->{$key});
            }
            // datavizLayers
            if (property_exists($configJson, 'datavizLayers')) {
                $dvlLayers = $configJson->datavizLayers['layers'];
                foreach ($dvlLayers as $o => $c) {
                    if ($c['layer_id'] == $layerToRemoveCfg->id) {
                        unset($configJson->datavizLayers['layers'][$o]);
                    }
                }
            }
            // atlas
            if (property_exists($configJson->options, 'atlasEnabled')
                && $this->optionToBoolean($configJson->options->atlasEnabled)
                && $configJson->options->atlasLayer == $layerToRemoveCfg->id) {
                $configJson->options->atlasLayer = '';
                $configJson->options->atlasPrimaryKey = '';
                $configJson->options->atlasFeatureLabel = '';
                $configJson->options->atlasSortField = '';
                $configJson->options->atlasEnabled = 'False';
            }
            // multi-atlas
            // formFilterLayers
            foreach ($configJson->formFilterLayers as $o => $c) {
                if (property_exists($c, 'layerId') && $c->layerId == $layerToRemoveCfg->id) {
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
                    if ($r['referencingLayer'] != $layerToRemoveCfg->id) {
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
                /** @var array $printTemplate */
                if (array_key_exists('atlas', $printTemplate)
                    && array_key_exists('coverageLayer', $printTemplate['atlas'])
                    && $printTemplate['atlas']['coverageLayer'] != $layerToRemoveCfg->id) {
                    $printTemplatesToKeep[] = $printTemplate;
                }
            }
            $configJson->printTemplates = $printTemplatesToKeep;

            // remove layer
            unset($configJson->layers->{$key});
        }

        return $configJson;
    }

    /**
     * access to configuration raw content.
     *
     * @return object
     *
     * @deprecated Don't access directly to configuration, use Project methods
     */
    public function getFullCfg()
    {
        return $this->cfg->getConfigContent();
    }

    /**
     * @return \lizmapMapDockItem[]
     *
     * @throws \jExceptionSelector
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
                0,
                null,
                $bp.'assets/js/map-projects.js',
                array('defer' => '')
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
        // $legendTpl = new jTpl();
        // $dockable[] = new lizmapMapDockItem('legend', 'Légende', $switcherTpl->fetch('map_legend'), 2);

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
            $wmsGetCapabilitiesUrl = $this->getWMSGetCapabilitiesUrl();
            $wmtsGetCapabilitiesUrl = $this->getWMTSGetCapabilitiesUrl();
        }
        $metadataTpl->assign(array_merge(array(
            'repositoryLabel' => $this->repository->getLabel(),
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

        if ($this->hasEditionLayersForCurrentUser()) {
            $tpl = new \jTpl();
            $dockable[] = new \lizmapMapDockItem(
                'edition',
                $this->appContext->getLocale('view~edition.navbar.title'),
                $tpl->fetch('view~map_edition'),
                3,
                $jwp.'design/jform.css',
                $bp.'assets/js/edition.js',
                array('defer' => '')
            );
        }

        if ($this->getOption('popupLocation') === 'dock') {
            $dockable[] = new \lizmapMapDockItem(
                'popupcontent',
                'Popup',
                '<div class="menu-content"><div class="lizmapPopupContent"><h4>'.$this->appContext->getLocale('view~dictionnary.popup.msg.start').'</h4></div></div>',
                4
            );
        }

        return $dockable;
    }

    /**
     * @return \lizmapMapDockItem[]
     *
     * @throws \jException
     * @throws \jExceptionSelector
     */
    public function getDefaultMiniDockable()
    {
        $dockable = array();
        $bp = $this->appContext->appConfig()->urlengine['basePath'];

        if ($this->getOption('popupLocation') === 'mini-dock') {
            $dockable[] = new \lizmapMapDockItem(
                'popupcontent',
                'Popup',
                '<div class="menu-content"><div class="lizmapPopupContent"><h4>'.$this->appContext->getLocale('view~dictionnary.popup.msg.start').'</h4></div></div>',
                0
            );
        }

        if ($this->hasAttributeLayers()) {
            // Add layer-export attribute to lizmap-selection-tool component if allowed
            $layerExport = $this->appContext->aclCheck('lizmap.tools.layer.export', $this->repository->getKey()) ? 'layer-export' : '';
            $dock = new \lizmapMapDockItem(
                'selectiontool',
                $this->appContext->getLocale('view~map.selectiontool.navbar.title'),
                '<lizmap-selection-tool '.$layerExport.'></lizmap-selection-tool>',
                1,
                '',
                $bp.'assets/js/attributeTable.js',
                array('defer' => '')
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

        if ($this->cfg->getBooleanOption('geolocation')) {
            $tpl = new \jTpl();
            $tpl->assign('hasEditionLayers', $this->hasEditionLayersForCurrentUser());
            $dockable[] = new \lizmapMapDockItem(
                'geolocation',
                $this->appContext->getLocale('view~map.geolocate.navbar.title'),
                $tpl->fetch('view~map_geolocation'),
                3
            );
        }

        if ($this->hasPrintEnabled()) {
            $tpl = new \jTpl();
            $dockable[] = new \lizmapMapDockItem(
                'print',
                $this->appContext->getLocale('view~map.print.navbar.title'),
                $tpl->fetch('view~map_print'),
                4
            );
        }

        if ($this->cfg->getBooleanOption('measure')) {
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
                $bp.'assets/js/timemanager.js',
                array('defer' => '')
            );
        }

        // Permalink
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

        if ($this->cfg->getBooleanOption('draw')) {
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
     * @return \lizmapMapDockItem[]
     *
     * @throws \jExceptionSelector
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
                $bp.'assets/js/attributeTable.js',
                array('defer' => '')
            );
        }

        return $dockable;
    }

    /**
     * @return \lizmapMapDockItem[]
     *
     * @throws \jExceptionSelector
     */
    public function getDefaultRightDockable()
    {
        $dockable = array();

        if ($this->getOption('popupLocation') === 'right-dock') {
            $dockable[] = new \lizmapMapDockItem(
                'popupcontent',
                'Popup',
                '<div class="menu-content"><div class="lizmapPopupContent"><h4>'.$this->appContext->getLocale('view~dictionnary.popup.msg.start').'</h4></div></div>',
                0
            );
        }

        return $dockable;
    }

    /**
     * Check if the project needs an update which lead to an error.
     *
     * @return bool true if the project needs to be updated in the QGIS desktop plugin
     */
    public function needsUpdateError()
    {
        $requiredTargetLwcVersion = \jApp::config()->minimumRequiredVersion['lizmapWebClientTargetVersion'];
        if ($this->getLizmapWebClientTargetVersion() < $requiredTargetLwcVersion) {
            return true;
        }

        return false;
    }

    /**
     * Check if the project needs an update which lead to an warning.
     *
     * @return bool true if the project needs to be updated in the QGIS desktop plugin
     */
    public function needsUpdateWarning()
    {
        $requiredTargetLwcVersion = \jApp::config()->minimumRequiredVersion['lizmapWebClientTargetVersion'];
        if ($this->getLizmapWebClientTargetVersion() == $requiredTargetLwcVersion) {
            return true;
        }

        return false;
    }

    /**
     * Project needs an update on plugin side.
     * The check is done only if the QGIS file has been edited recently.
     *
     * @return bool true if the plugin needs to be updated
     */
    public function qgisLizmapPluginUpdateNeeded()
    {
        return $this->getMetadata()->qgisLizmapPluginUpdateNeeded();
    }

    /**
     * Project warnings in the CFG file.
     *
     * @return null|mixed
     */
    public function getProjectCfgWarnings()
    {
        // Before plugin 4.0.0, it was a array of errors :
        // e.g ["ogc_not_valid", "invalid_field_type"] → 2
        // Starting from 4.0.0, it's an object : with properties for each error type having value as error count :
        // e.g  {"ogc_not_valid": 1, "invalid_field_type": 3} → 4
        return $this->cfg->getProjectCfgWarnings();
    }

    /**
     * Project warnings counts in the CFG file.
     *
     * @see getProjectCfgWarnings() for data structure
     *
     * @return int
     */
    public function projectCountCfgWarnings()
    {
        $warnings = $this->getProjectCfgWarnings();
        if (is_array($warnings)) {
            return count($warnings);
        }

        return array_sum((array) $warnings);
    }

    /**
     * Project warnings in the CFG file.
     *
     * @see getProjectCfgWarnings() for data structure
     *
     * @return mixed List of warnings in the project and their counts
     */
    public function projectCfgWarnings()
    {
        $warnings = $this->getProjectCfgWarnings();
        if (is_array($warnings)) {
            return array_fill_keys($warnings, '≥1');
        }

        return $warnings;
    }

    /**
     * Check acl rights on the project.
     *
     * @return bool true if the current user as rights on the project
     */
    public function checkAcl()
    {
        // Check right on repository
        if (!$this->appContext->aclCheck('lizmap.repositories.view', $this->repository->getKey())) {
            return false;
        }

        // Check acl option is configured in project config
        $aclGroups = $this->cfg->getOption('acl');
        if ($aclGroups === null || !is_array($aclGroups) || empty($aclGroups)) {
            return true;
        }

        // Check user is authenticated
        if (!$this->appContext->userIsConnected()) {
            return false;
        }

        // Check if configured groups white list and authenticated user groups list intersects
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
        if (!$this->appContext->aclCheck('lizmap.repositories.view', $this->repository->getKey())) {
            return false;
        }

        // Check acl option is configured in project config
        $aclGroups = $this->cfg->getOption('acl');
        if ($aclGroups === null || !is_array($aclGroups) || empty($aclGroups)) {
            return true;
        }

        // Check if configured groups white list and authenticated user groups list intersects
        $userGroups = $this->appContext->aclGroupsIdByUser($login);
        if (array_intersect($aclGroups, $userGroups)) {
            return true;
        }

        return false;
    }
}
