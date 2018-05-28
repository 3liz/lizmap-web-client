<?php
/**
* Manage and give access to lizmap configuration.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class lizmapProject extends qgisProject {

    // lizmapRepository
    protected $repository = null;
    // QGIS project XML
    protected $xml = null;
    // CFG project JSON
    protected $cfg = null;

    // services properties
    protected $properties = array(
        'repository',
        'id',
        'title',
        'abstract',
        'proj',
        'bbox'
    );
    // Lizmap repository key
    protected $key = '';
    // Lizmap repository configuration data
    protected $data = array();
    // Version of QGIS which wrote the project
    protected $qgisProjectVersion = null;

    /**
     * @var array contains WMS info
     */
    protected $WMSInformation = null;

    /**
     * @var string
     */
    protected $canvasColor = '';

    /**
     * @var array  authid => proj4
     */
    protected $allProj4 = array();

    /**
     * @var array  for each referenced layer, there is an item
     *            with referencingLayer, referencedField, referencingField keys.
     *            There is also a 'pivot' key
     */
    protected $relations = array();

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
    protected $editionLayers = array();

    /**
     * @var array
     */
    protected $attributeLayers = array();

    /**
     * @var boolean
     */
    protected $useLayerIDs = false;

    /**
     * @var array List of cached properties
     */
    protected $cachedProperties = array('WMSInformation', 'canvasColor', 'allProj4',
        'relations', 'layersOrder', 'printCapabilities', 'locateByLayer',
        'editionLayers', 'attributeLayers', 'useLayerIDs', 'layers', 'data', 'cfg', 'qgisProjectVersion');

    /**
     * constructor
     * @param string $key : the project name
     * @param lizmapRepository $ rep : the repository
     */
    public function __construct ( $key, $rep ) {
        $this->key = $key;
        $this->repository = $rep;

        $file = $rep->getPath().$key.'.qgs';

        // Verifying if the files exist
        if (!file_exists($file))
            throw new UnknownLizmapProjectException('The QGIS project '.$file.' does not exist!');
        if (!file_exists($file.'.cfg'))
            throw new UnknownLizmapProjectException('The lizmap config '.$file.'.cfg does not exist!');

        // For the cache key, we use the full path of the project file
        // to avoid collision in the cache engine
        $data = false;
        try {
            $data = jCache::get($file, 'qgisprojects');
        }
        catch(Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::log($e->getMessage(), 'error');
        }

        if ($data === false ||
            $data['qgsmtime'] < filemtime($file) ||
            !array_key_exists('cfg', $data) ||
            !array_key_exists('attributeLayers', $data) || // to force cache invalidation for this new feature
            $data['qgscfgmtime'] < filemtime($file.'.cfg') ) {
            // FIXME reading XML could take time, so many process could
            // read it and construct the cache at the same time. We should
            // have a kind of lock to avoid this issue.
            $this->readProject($key, $rep);
            $data['qgsmtime'] = filemtime($file);
            $data['qgscfgmtime'] = filemtime($file.'.cfg');
            foreach($this->cachedProperties as $prop) {
                $data[$prop] = $this->$prop;
            }
            try {
                jCache::set($file, $data, null, 'qgisprojects');
            }
            catch(Exception $e) {
                 jLog::log($e->getMessage(), 'error');
            }
        }
        else {
            foreach($this->cachedProperties as $prop) {
                $this->$prop = $data[$prop];
            }
        }

        $this->path = $file;
    }

    public function clearCache() {
        $file = $this->repository->getPath().$this->key.'.qgs';
        try {
            jCache::delete($file, 'qgisprojects');
        }
        catch(Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::log($e->getMessage(), 'error');
        }
    }
    /**
     * temporary function to read xml for some methods that relies on
     * xml data that are not yet stored in the cache
     * @deprecated
     */
    protected function getXml() {
        if ($this->xml) {
            return $this->xml;
        }
        $qgs_path = $this->repository->getPath().$this->key.'.qgs';
        if (!file_exists($qgs_path) ||
            !file_exists($qgs_path.'.cfg') ) {
            throw new Error("Files of project ".$this->key." does not exists");
        }
        $xml = simplexml_load_file($qgs_path);
        if ($xml === false) {
            throw new Exception("Qgs File of project ".$this->key." has invalid content");
        }
        $this->xml = $xml;
        return $xml;
    }

    /**
     * Read the qgis files
     */
    protected function readProject($key, $rep) {
        $qgs_path = $rep->getPath().$key.'.qgs';

        if (!file_exists($qgs_path) ||
            !file_exists($qgs_path.'.cfg') ) {
            throw new Exception("Files of project $key does not exists");
        }

        $config = jFile::read($qgs_path.'.cfg');
        $this->cfg = json_decode($config);
        if ($this->cfg === null) {
            throw new Exception(".qgs.cfg File of project $key has invalid content");
        }

        $configOptions = $this->cfg->options;

        try {
            parent::readXmlProject($qgs_path);
        }
        catch(Exception $e) {
            throw $e;
        }
        $qgs_xml = $this->xml;

        // Complete data
        $this->data['repository'] = $rep->getKey();
        $this->data['id'] = $key;
        if ( !array_key_exists('title', $this->data) )
            $this->data['title'] = ucfirst($key);
        if ( !array_key_exists('abstract', $this->data) )
            $this->data['abstract'] = '';
        $this->data['proj'] = $configOptions->projection->ref;
        $this->data['bbox'] = join($configOptions->bbox,', ');

        // Update WMSInformation
        $this->WMSInformation['ProjectCrs'] = $this->data['proj'];

        # get WMS getCapabilities full URL
        $this->data['wmsGetCapabilitiesUrl'] = jUrl::getFull(
            'lizmap~service:index',
            array(
                'repository' => $rep->getKey(),
                'project' => $key,
                'SERVICE' => 'WMS',
                'VERSION' => '1.3.0',
                'REQUEST' => 'GetCapabilities'
            )
        );

        # get WMTS getCapabilities full URL
        $this->data['wmtsGetCapabilitiesUrl'] = jUrl::getFull(
            'lizmap~service:index',
            array(
                'repository' => $rep->getKey(),
                'project' => $key,
                'SERVICE' => 'WMTS',
                'VERSION' => '1.0.0',
                'REQUEST' => 'GetCapabilities'
            )
        );

        $shortNames = $qgs_xml->xpath('//maplayer/shortname');
        if ( $shortNames && count( $shortNames ) > 0 ) {
            foreach( $shortNames as $sname ) {
                $sname = (string) $sname;
                $xmlLayer = $qgs_xml->xpath( "//maplayer[shortname='$sname']" );
                if(count($xmlLayer) == 0){
                    continue;
                }
                $xmlLayer = $xmlLayer[0];
                $name = (string)$xmlLayer->layername;
                if ( property_exists($this->cfg->layers, $name ) )
                    $this->cfg->layers->$name->shortname = $sname;
            }
        }

        $groupsWithShortName = $qgs_xml->xpath("//layer-tree-group/customproperties/property[@key='wmsShortName']/parent::*/parent::*");
        if ( $groupsWithShortName && count( $groupsWithShortName ) > 0 ) {
            foreach( $groupsWithShortName as $group ) {
                $name = (string)$group['name'];
                $shortNameProperty = $group->xpath("customproperties/property[@key='wmsShortName']");
                if ( $shortNameProperty && count( $shortNameProperty ) > 0 ) {
                    $shortNameProperty = $shortNameProperty[0];
                    $sname = (string) $shortNameProperty['value'];
                    if ( property_exists($this->cfg->layers, $name ) )
                        $this->cfg->layers->$name->shortname = $sname;
                }
            }
        }
        $groupsMutuallyExclusive = $qgs_xml->xpath("//layer-tree-group[@mutually-exclusive='1']");
        if ( $groupsMutuallyExclusive && count( $groupsMutuallyExclusive ) > 0 ) {
            foreach( $groupsMutuallyExclusive as $group ) {
                $name = (string)$group['name'];
                if ( property_exists($this->cfg->layers, $name ) )
                    $this->cfg->layers->$name->mutuallyExclusive = 'True';
            }
        }

        $layersWithShowFeatureCount = $qgs_xml->xpath("//layer-tree-layer/customproperties/property[@key='showFeatureCount']/parent::*/parent::*");
        if ( $layersWithShowFeatureCount && count( $layersWithShowFeatureCount ) > 0 ) {
            foreach( $layersWithShowFeatureCount as $layer ) {
                $name = (string)$layer['name'];
                if ( property_exists($this->cfg->layers, $name ) )
                    $this->cfg->layers->$name->showFeatureCount = 'True';
            }
        }
        //remove plugin layer
        $pluginLayers = $qgs_xml->xpath('//maplayer[type="plugin"]');
        if ( $pluginLayers && count( $pluginLayers ) > 0 ) {
            foreach( $pluginLayers as $layer ) {
                $name = (string)$layer->layername;
                if ( property_exists($this->cfg->layers, $name ) )
                    unset($this->cfg->layers->$name);
            }
        }
        //unset cache for editionLayers
        if (property_exists($this->cfg, 'editionLayers') ){
            foreach( $this->cfg->editionLayers as $key=>$obj ){
                if (property_exists($this->cfg->layers, $key) ){
                    $this->cfg->layers->$key->cached = 'False';
                    $this->cfg->layers->$key->clientCacheExpiration = 0;
                    if ( property_exists($this->cfg->layers->$key, 'cacheExpiration') )
                        unset($this->cfg->layers->$key->cacheExpiration);
                }
            }
        }
        //unset cache for loginFilteredLayers
        if ( property_exists($this->cfg,'loginFilteredLayers') ){
            foreach( $this->cfg->loginFilteredLayers as $key=>$obj ){
                if (property_exists($this->cfg->layers, $key) ){
                    $this->cfg->layers->$key->cached = 'False';
                    $this->cfg->layers->$key->clientCacheExpiration = 0;
                    if ( property_exists($this->cfg->layers->$key, 'cacheExpiration') )
                        unset($this->cfg->layers->$key->cacheExpiration);
                }
            }
        }
        //unset displayInLegend for geometryType none or unknown
        foreach( $this->cfg->layers as $key=>$obj ){
            if ( property_exists($this->cfg->layers->$key, 'geometryType') &&
                 ($this->cfg->layers->$key->geometryType == 'none' || $this->cfg->layers->$key->geometryType == 'unknown') )
                $this->cfg->layers->$key->displayInLegend = 'False';
        }

        $this->printCapabilities = $this->readPrintCapabilities($qgs_xml, $this->cfg);
        $this->locateByLayer = $this->readLocateByLayers($qgs_xml, $this->cfg);
        $this->editionLayers = $this->readEditionLayers($qgs_xml, $this->cfg);
        $this->attributeLayers = $this->readAttributeLayers($qgs_xml, $this->cfg);
    }

    public function getQgisPath(){
        return realpath($this->repository->getPath()).'/'.$this->key.'.qgs';
    }

    public function getRelativeQgisPath(){
        $services = lizmap::getServices();

        $mapParam = $this->getQgisPath();
        if ( !$services->isRelativeWMSPath() )
            return $mapParam;

        $rootRepositories = $services->getRootRepositories();
        if ( strpos($mapParam, $rootRepositories) === 0) {
            $mapParam = str_replace( $rootRepositories, '', $mapParam );
            $mapParam = ltrim($mapParam, '/');
        }
        return $mapParam;
    }

    public function getKey(){
        return $this->key;
    }

    public function getRepository(){
        return $this->repository;
    }

    public function getProperties(){
        return $this->properties;
    }

    public function getOptions(){
        return $this->cfg->options;
    }

    public function getLayers(){
        return $this->cfg->layers;
    }


    public function findLayerByAnyName( $name ){
        // Get by name ie as written in QGIS Desktop legend
        $layer = $this->findLayerByName( $name );
        if ( $layer  ) return $layer;

        // since 2.14 layer's name can be layer's shortName
        $layer = $this->findLayerByShortName( $name );
        if ( $layer  ) return $layer;

        // Get layer by typename : qgis server replaces ' ' by '_' for layer names
        $layer = $this->findLayerByTypeName( $name );
        if ( $layer  ) return $layer;

        // Get by id
        $layer = $this->findLayerByLayerId( $name );
        if ( $layer  ) return $layer;

        // since 2.6 layer's name can be layer's title
        $layer = $this->findLayerByTitle( $name );
        return $layer;
    }

    public function findLayerByName( $name ){
        if ( property_exists($this->cfg->layers, $name ) )
            return $this->cfg->layers->$name;
        return null;
    }

    public function findLayerByShortName( $shortName ){
        foreach ( $this->cfg->layers as $layer ) {
            if ( !property_exists( $layer, 'shortname' ) )
                continue;
            if ( $layer->shortname == $shortName )
                return $layer;
        }
        return null;
    }

    public function findLayerByTitle( $title ){
        foreach ( $this->cfg->layers as $layer ) {
            if ( !property_exists( $layer, 'title' ) )
                continue;
            if ( $layer->title == $title )
                return $layer;
        }
        return null;
    }

    public function findLayerByLayerId( $layerId ){
        foreach ( $this->cfg->layers as $layer ) {
            if ( !property_exists( $layer, 'id' ) )
                continue;
            if ( $layer->id == $layerId )
                return $layer;
        }
        return null;
    }

    public function findLayerByTypeName( $typeName ){
        if ( property_exists($this->cfg->layers, $typeName ) )
            return $this->cfg->layers->$typeName;
        $layerName = str_replace('_', ' ', $typeName );
        if ( property_exists($this->cfg->layers, $layerName ) )
            return $this->cfg->layers->$layerName;
        return null;
    }

    public function hasLocateByLayer(){
        if ( property_exists($this->cfg,'locateByLayer') ){
            $count = 0;
            foreach( $this->cfg->locateByLayer as $key=>$obj ){
                $count += 1;
            }
            if ( $count != 0 )
                return true;
            return false;
        }
        return false;
    }

    public function hasTimemanagerLayers(){
        if ( property_exists($this->cfg,'timemanagerLayers') ){
            $count = 0;
            foreach( $this->cfg->timemanagerLayers as $key=>$obj ){
                $count += 1;
            }
            if ( $count != 0 )
                return true;
            return false;
        }
        return false;
    }

    public function hasAtlasEnabled(){
        if ( property_exists($this->cfg->options,'atlasEnabled') and $this->cfg->options->atlasEnabled == 'True' ){
            return true;
        }
        return false;
    }

    public function getQgisServerPlugins(){
        $qgisServer = jClasses::getService('lizmap~qgisServer');
        return $qgisServer->plugins;
    }

    public function hasTooltipLayers(){
        if ( property_exists($this->cfg,'tooltipLayers') ){
            $count = 0;
            foreach( $this->cfg->tooltipLayers as $key=>$obj ){
                $count += 1;
            }
            if ( $count != 0 )
                return true;
            return false;
        }
        return false;
    }

    public function hasAttributeLayers(){
        if ( property_exists($this->cfg,'attributeLayers') ){
            $count = 0;
            foreach( $this->cfg->attributeLayers as $key=>$obj ){
                $count += 1;
            }
            if ( $count != 0 )
                return true;
            return false;
        }
        return false;
    }


    public function hasFtsSearches(){
        // Virtual jdb profile corresponding to the layer database
        $project = $this->key;
        $repository = $this->repository->getKey();

        $repositoryPath = realpath($this->repository->getPath());
        $repositoryPath = str_replace('\\', '/', $repositoryPath);
        $searchDatabase = $repositoryPath.'/default.qfts';

        if ( !file_exists($searchDatabase) ) {
          // Search for project database
          $searchDatabase = $repositoryPath.'/'.$project.'.qfts';
        }
        if ( !file_exists($searchDatabase) ) {
          return false;
        }

        $jdbParams = array(
            "driver"=>"pdo",
            "dsn"=>'sqlite:'.$searchDatabase
        );

        // Create the virtual jdb profile
        $searchJdbName = "jdb_".$repository.'_'.$project;
        jProfiles::createVirtualProfile('jdb', $searchJdbName, $jdbParams);

        // Check FTS db ( tables and geometry storage
        try{
            $cnx = jDb::getConnection($searchJdbName);

            // Get metadata
            $sql = "
            SELECT search_id, search_name, layer_name, geometry_storage, srid
            FROM quickfinder_toc
            WHERE geometry_storage != 'wkb'
            ORDER BY priority
            ";
            $res = $cnx->query($sql);
            $searches = array();
            foreach($res as $item){
                $searches[$item->search_id] = array(
                    'search_name' => $item->search_name,
                    'layer_name' => $item->layer_name,
                    'srid' => $item->srid
                );
            }
            if( count($searches) == 0 ){
                return false;
            }
            return array(
                'jdb_profile' => $searchJdbName,
                'searches' => $searches
            );
        }
        catch(Exception $e){
            return false;
        }

        return false;
    }

    public function hasEditionLayers(){
        if ( property_exists($this->cfg,'editionLayers') ){
            if(!jAcl2::check('lizmap.tools.edition.use', $this->repository->getKey()))
                return false;

            $count = 0;
            foreach( $this->cfg->editionLayers as $key=>$eLayer ){
                // Check if user groups intersects groups allowed by project editor
                // If user is admin, no need to check for given groups
                if( property_exists($eLayer, 'acl') and $eLayer->acl ){
                    // Check if configured groups white list and authenticated user groups list intersects
                    $editionGroups = $eLayer->acl;
                    $editionGroups = array_map('trim', explode(',', $editionGroups));
                    if( is_array($editionGroups) and count($editionGroups)>0 ){
                        $userGroups = jAcl2DbUserGroup::getGroups();
                        if( array_intersect($editionGroups, $userGroups) or jAcl2::check('lizmap.admin.repositories.delete')){
                            // User group(s) correspond to the groups given for this edition layer
                            // or user is admin
                            $count += 1;
                            unset($this->cfg->editionLayers->$key->acl);
                        }else{
                            // No match found, we deactivate the edition layer
                            unset($this->cfg->editionLayers->$key);
                        }
                    }
                }else{
                    $count += 1;
                }
            }
            if ( $count != 0 )
                return true;
            return false;
        }
        return false;
    }

    public function getEditionLayers(){
        return $this->cfg->editionLayers;
    }

    public function findEditionLayerByName( $name ){
        if ( !$this->hasEditionLayers() )
            return null;

        if ( property_exists($this->cfg->editionLayers, $name ) )
            return $this->cfg->editionLayers->$name;
        return null;
    }

    public function findEditionLayerByLayerId( $layerId ){
        if ( !$this->hasEditionLayers() )
            return null;

        foreach ( $this->cfg->editionLayers as $layer ) {
            if ( !property_exists( $layer, 'layerId' ) )
                continue;
            if ( $layer->layerId == $layerId )
                return $layer;
        }
        return null;
    }

    public function hasLoginFilteredLayers(){
        if ( property_exists($this->cfg,'loginFilteredLayers') ){
            $count = 0;
            foreach( $this->cfg->loginFilteredLayers as $key=>$obj ){
                $count += 1;
            }
            if ( $count != 0 )
                return true;
            return false;
        }
        return false;
    }

    public function getDatavizLayersConfig(){
        if(!property_exists($this->cfg, 'datavizLayers')){
            return false;
        }
        $config = array(
            'layers'=>array(),
            'dataviz'=>array()
        );
        foreach( $this->cfg->datavizLayers as $order=>$lc ){
            if(!array_key_exists('layerId', $lc))
                continue;
            $layer = $this->findLayerByAnyName($lc->layerId);
            if(!$layer)
                continue;
            $title = $layer->title;
            if(!empty($lc->title))
                $title = $lc->title;
            $plotConf = array(
                'plot_id' => $lc->order,
                'layer_id' => $layer->id,
                'title' => $title,
                'abstract' => $layer->abstract,
                'plot'=>array(
                    'type' => $lc->type,
                    'x_field' => $lc->x_field,
                    'y_field' => $lc->y_field,
                )
            );

            if(property_exists($lc, 'popup_display_child_plot'))
                $plotConf['popup_display_child_plot'] = $lc->popup_display_child_plot;
            if(property_exists($lc, 'only_show_childs'))
                $plotConf['only_show_childs'] = $lc->only_show_childs;
            if(property_exists($lc, 'y2_field'))
                $plotConf['plot']['y2_field'] = $lc->y2_field;
            if( !empty($lc->color) ){
                $plotConf['plot']['color'] = $lc->color;
            }
            if(property_exists($lc, 'aggregation'))
                $plotConf['plot']['aggregation'] = $lc->aggregation;
            if(property_exists($lc, 'colorfield'))
                $plotConf['plot']['colorfield'] = $lc->colorfield;
            if(property_exists($lc, 'colorfield2'))
                $plotConf['plot']['colorfield2'] = $lc->colorfield2;

            // Add more layout config, written like:
            // layout_config=barmode:stack,bargap:0.5
            if( !empty($lc->layout_config) ){
                $layout_config = array();
                $a = array_map( 'trim', explode(',', $lc->layout_config) );
                foreach($a as $i){
                    $b = array_map('trim', explode(':', $i));
                    if( is_array($b) and count($b) == 2 ){
                        $c = $b[1];
                        if( $c == 'false'){
                            $c = (boolean)false;
                        }
                        if( $c == 'true'){
                            $c = (boolean)true;
                        }
                        $layout_config[$b[0]] = $c;
                    }
                }
                if( count($layout_config)>0 )
                    $plotConf['plot']['layout_config'] = $layout_config;
            }
            $config['layers'][$order] = $plotConf;

        }
        if(empty($config['layers'])){
            return false;
        }

        $config['dataviz'] = array(
            'location'=>'dock'
        );
        if( property_exists($this->cfg->options, 'datavizLocation')
            and in_array( $this->cfg->options->datavizLocation, array('dock', 'bottomdock', 'right-dock' ) )
        ){
            $config['dataviz']['location'] = $this->cfg->options->datavizLocation;
        }
        return $config;
    }

    public function needsGoogle(){
        $configOptions = $this->cfg->options;
        return (
            (
                property_exists($configOptions,'googleStreets')
                && $configOptions->googleStreets == 'True'
            ) ||
            (
                property_exists($configOptions,'googleSatellite')
                && $configOptions->googleSatellite == 'True'
            ) ||
            (
                property_exists($configOptions,'googleHybrid')
                && $configOptions->googleHybrid == 'True'
            ) ||
            (
                property_exists($configOptions,'googleTerrain')
                && $configOptions->googleTerrain == 'True'
            ) ||
            (
                property_exists($configOptions,'externalSearch')
                && $configOptions->externalSearch == 'google'
            )
        );
    }

    public function getGoogleKey(){
        $configOptions = $this->cfg->options;
        $gkey = '';
        if (property_exists($configOptions,'googleKey')
            && $configOptions->googleKey != '')
            $gkey = $configOptions->googleKey;
        return $gkey;
    }

    public function getLayerNameByIdFromConfig( $layerId ){
        $layers = $this->getLayers();
        $name = null;
        foreach ($layers as $name=>$props){
            if( $props->id == $layerId)
                return $name;
        }
        return $name;
    }

    protected function readPrintCapabilities($qgsLoad, $cfg) {
        $printTemplates = array();

        if( property_exists($cfg->options, 'print')
            && $cfg->options->print == 'True' ) {
            // get restricted composers
            $rComposers = array();
            $restrictedComposers = $qgsLoad->xpath( "//properties/WMSRestrictedComposers/value" );
            if ( $restrictedComposers && count( $restrictedComposers ) > 0 ) {
                foreach($restrictedComposers as $restrictedComposer){
                    $rComposers[] = (string)$restrictedComposer;
                }
            }
            // get composer
            $composers =  $qgsLoad->xpath('//Composer');
            if ( $composers && count( $composers ) > 0 ) {
                foreach($composers as $composer){
                    // test restriction
                    if( in_array((string)$composer['title'], $rComposers) )
                        continue;
                    // get composition element
                    $composition = $composer->xpath('Composition');
                    if( !$composition || count($composition) == 0 )
                        continue;
                    $composition = $composition[0];

                    // init print template element
                    $printTemplate = array(
                        'title'=>(string)$composer['title'],
                        'width'=>(int)$composition['paperWidth'],
                        'height'=>(int)$composition['paperHeight'],
                        'maps'=>array(),
                        'labels'=>array()
                    );

                    // get composer maps
                    $cMaps = $composer->xpath('.//ComposerMap');
                    if( $cMaps && count($cMaps) > 0 ) {
                        foreach( $cMaps as $cMap ) {
                            $cMapItem = $cMap->xpath('ComposerItem');
                            if( count($cMapItem) == 0 )
                                continue;
                            $cMapItem = $cMapItem[0];
                            $ptMap = array(
                                'id'=>'map'.(string)$cMap['id'],
                                'width'=>(int)$cMapItem['width'],
                                'height'=>(int)$cMapItem['height'],
                            );

                            // Before 2.6
                            if ( property_exists( $cMap->attributes(), 'overviewFrameMap' ) and (string)$cMap['overviewFrameMap'] != '-1' ){
                                $ptMap['overviewMap'] = 'map'.(string)$cMap['overviewFrameMap'];
                            }
                            // >= 2.6
                            $cMapOverviews = $cMap->xpath('ComposerMapOverview');
                            foreach($cMapOverviews as $cMapOverview){
                                if ( $cMapOverview and (string)$cMapOverview->attributes()->frameMap != '-1' ){
                                    $ptMap['overviewMap'] = 'map' . (string)$cMapOverview->attributes()->frameMap;
                                }
                            }
                            // Grid
                            $cMapGrids = $cMap->xpath('ComposerMapGrid');
                            foreach($cMapGrids as $cMapGrid){
                                if ( $cMapGrid and (string)$cMapGrid->attributes()->show != '0' ){
                                    $ptMap['grid'] = 'True';
                                }
                            }

                            $printTemplate['maps'][] = $ptMap;
                        }
                    }

                    // get composer labels
                    $cLabels = $composer->xpath('.//ComposerLabel');
                    if( $cLabels && count($cLabels) > 0 ) {
                        foreach( $cLabels as $cLabel ) {
                            $cLabelItem = $cLabel->xpath('ComposerItem');
                            if( !$cLabelItem || count($cLabelItem) == 0 )
                                continue;
                            $cLabelItem = $cLabelItem[0];
                            if( (string)$cLabelItem['id'] == '' )
                                continue;
                            $printTemplate['labels'][] = array(
                                'id'=>(string)$cLabelItem['id'],
                                'htmlState'=>(int)$cLabel['htmlState'],
                                'text'=>(string)$cLabel['labelText']
                            );
                        }
                    }

                    // get composer attribute tables
                    $cTables = $composer->xpath('.//ComposerAttributeTableV2');
                    if( $cTables && count($cTables) > 0 ) {
                        foreach( $cTables as $cTable ) {
                            $printTemplate['tables'][] = array(
                                'composerMap'=>(int)$cTable['composerMap'],
                                'vectorLayer'=>(string)$cTable['vectorLayer']
                            );
                        }
                    }

                    // Atlas
                    $Atlas = $composer->xpath('Atlas');
                    if( count($Atlas) == 1 ){
                        $Atlas = $Atlas[0];
                        $printTemplate['atlas'] = array(
                            'enabled' => (string)$Atlas['enabled'],
                            'coverageLayer' => (string)$Atlas['coverageLayer']
                        );
                    }
                    $printTemplates[] = $printTemplate;
                }
            }
        }
        return $printTemplates;
    }

    protected function getXmlLayer2($xml, $layerId ){
        return $xml->xpath( "//maplayer[id='$layerId']" );
    }

    protected function readLocateByLayers($xml, $cfg) {
        $locateByLayer = array();
        if (property_exists($cfg, 'locateByLayer')) {
            $locateByLayer = $cfg->locateByLayer;
            // collect layerIds
            $locateLayerIds = array();
            foreach( $locateByLayer as $k=>$v) {
                    $locateLayerIds[] = $v->layerId;
            }
            // update locateByLayer with alias and filter information
            foreach( $locateByLayer as $k=>$v) {
                $xmlLayer = $this->getXmlLayer2($xml, $v->layerId );
                if(count($xmlLayer) == 0){
                    continue;
                }
                $xmlLayerZero = $xmlLayer[0];
                // aliases
                $alias = $xmlLayerZero->xpath("aliases/alias[@field='".$v->fieldName."']");
                if( $alias && count($alias) != 0 ) {
                    $alias = $alias[0];
                    $v->fieldAlias = (string)$alias['name'];
                    $locateByLayer->$k = $v;
                }
                if ( property_exists( $v, 'filterFieldName') ) {
                    $alias = $xmlLayerZero->xpath("aliases/alias[@field='".$v->filterFieldName."']");
                    if( $alias && count($alias) != 0 ) {
                        $alias = $alias[0];
                        $v->filterFieldAlias = (string)$alias['name'];
                        $locateByLayer->$k = $v;
                    }
                }
                // vectorjoins
                $vectorjoins = $xmlLayerZero->xpath('vectorjoins/join');
                if( $vectorjoins && count($vectorjoins) != 0 ) {
                    if ( !property_exists( $v, 'vectorjoins' ) )
                        $v->vectorjoins = array();
                    foreach( $vectorjoins as $vectorjoin ) {
                        $joinLayerId = (string)$vectorjoin['joinLayerId'];
                        if ( in_array($joinLayerId, $locateLayerIds ) )
                            $v->vectorjoins[] = (object) array(
                                "joinFieldName"=>(string)$vectorjoin['joinFieldName'],
                                "targetFieldName"=>(string)$vectorjoin['targetFieldName'],
                                "joinLayerId"=>(string)$vectorjoin['joinLayerId'],
                            );
                    }
                    $locateByLayer->$k = $v;
                }
            }
        }
        return $locateByLayer;
    }

    protected function readEditionLayers($xml, $cfg) {
        $editionLayers = array();

        if ( property_exists( $cfg, 'editionLayers' ) ) {

            // Add data into editionLayers from configuration
            $editionLayers = $cfg->editionLayers;

            // Check ability to load spatialite extension
            // And remove ONLY spatialite layers if no extension found
            $spatial = false;
            if ( class_exists('SQLite3') ) {
                // Try with libspatialite
                try{
                    $db = new SQLite3(':memory:');
                    $spatial = @$db->loadExtension('libspatialite.so'); # loading SpatiaLite as an extension
                }catch(Exception $e){
                    $spatial = False;
                }
                // Try with mod_spatialite
                if( !$spatial )
                    try{
                        $db = new SQLite3(':memory:');
                        $spatial = @$db->loadExtension('mod_spatialite.so'); # loading SpatiaLite as an extension
                    }catch(Exception $e){
                        //jLog::log($e->getMessage(), 'error');
                        $spatial = False;
                    }
            }
            if(!$spatial){
                jLog::log('Spatialite is not available', 'error');
                foreach( $editionLayers as $key=>$obj ){
                    $layerXml = $this->getXmlLayer2($xml, $obj->layerId );
                    if(count($layerXml) == 0){
                        continue;
                    }
                    $layerXmlZero = $layerXml[0];
                    $provider = $layerXmlZero->xpath('provider');
                    $provider = (string)$provider[0];
                    if ( $provider == 'spatialite' )
                        unset($editionLayers->$key);
                }
            }

        }

        return $editionLayers;
    }


    protected function readAttributeLayers($xml, $cfg) {
        $attributeLayers = array();

        if ( property_exists( $cfg, 'attributeLayers' ) ) {

            // Add data into attributeLayers from configuration
            $attributeLayers = $cfg->attributeLayers;

            // Get field order & visibility
            foreach( $attributeLayers as $key=>$obj ){
                $layerXml = $this->getXmlLayer2($xml, $obj->layerId );
                if(count($layerXml) == 0){
                    continue;
                }
                $layerXmlZero = $layerXml[0];
                $attributetableconfigXml = $layerXmlZero->xpath('attributetableconfig');
                if(count($attributetableconfigXml) == 0){
                    continue;
                }
                $attributetableconfig = str_replace(
                    '@',
                    '',
                    json_encode($attributetableconfigXml[0] )
                );
                $obj->attributetableconfig = json_decode($attributetableconfig);
                $attributeLayers->$key = $obj;

            }

        }

        return $attributeLayers;
    }




    public function getUpdatedConfig(){

        //FIXME: it's better to use clone keyword, isn't it?
        $configRead = json_encode($this->cfg);
        $configJson = json_decode($configRead);

        // Add an option to display buttons to remove the cache for cached layer
        // Only if appropriate right is found
        if( jAcl2::check('lizmap.admin.repositories.delete') ){
            $configJson->options->removeCache = 'True';
        }

        // Remove layerOrder option from config if not required
        if(!empty($this->layersOrder)){
            $configJson->layersOrder = $this->layersOrder;
        }

        // set printTemplates in config
        $configJson->printTemplates = $this->printCapabilities;

        // Update locate by layer with vecctorjoins
        $configJson->locateByLayer = $this->locateByLayer;

        // Update attributeLayesr with attributetableconfig
        $configJson->attributeLayers = $this->attributeLayers;

        // Remove FTP remote directory
        if(property_exists($configJson->options, 'remoteDir'))
            unset($configJson->options->remoteDir);

        // Remove editionLayers from config if no right to access this tool
        if ( property_exists( $configJson, 'editionLayers' ) ) {
            if( jAcl2::check('lizmap.tools.edition.use', $this->repository->getKey()) ){
                $configJson->editionLayers = $this->editionLayers;
                // Check right to edit this layer (if property "acl" is in config)
                foreach( $configJson->editionLayers as $key=>$eLayer ){
                    // Check if user groups intersects groups allowed by project editor
                    // If user is admin, no need to check for given groups
                    if( property_exists($eLayer, 'acl') and $eLayer->acl ){
                        // Check if configured groups white list and authenticated user groups list intersects
                        $editionGroups = $eLayer->acl;
                        $editionGroups = array_map('trim', explode(',', $editionGroups));
                        if( is_array($editionGroups) and count($editionGroups)>0 ){
                            $userGroups = jAcl2DbUserGroup::getGroups();
                            if( array_intersect($editionGroups, $userGroups) or jAcl2::check('lizmap.admin.repositories.delete')){
                                // User group(s) correspond to the groups given for this edition layer
                                // or the user is admin
                                unset($configJson->editionLayers->$key->acl);
                            }else{
                                // No match found, we deactivate the edition layer
                                unset($configJson->editionLayers->$key);
                            }
                        }
                    }
                }

            } else {
                unset($configJson->editionLayers);
            }
        }


        // Add export layer right
        if( jAcl2::check('lizmap.tools.layer.export', $this->repository->getKey()) ){
            $configJson->options->exportLayers = 'True';
        }

        // Add WMS max width ad height
        $services = lizmap::getServices();
        if ( array_key_exists( 'wmsMaxWidth', $this->data ) )
            $configJson->options->wmsMaxWidth = $this->data['wmsMaxWidth'];
        else
            $configJson->options->wmsMaxWidth = $services->wmsMaxWidth;
        if ( array_key_exists( 'wmsMaxHeight', $this->data ) )
            $configJson->options->wmsMaxHeight = $this->data['wmsMaxHeight'];
        else
            $configJson->options->wmsMaxHeight = $services->wmsMaxHeight;

        // Add QGS Server version
        $configJson->options->qgisServerVersion = $services->qgisServerVersion;

        // Update config with layer relations
        $relations = $this->getRelations();
        if( $relations )
            $configJson->relations = $relations;

        if ( $this->useLayerIDs ) {
            $configJson->options->useLayerIDs = 'True';
        }

        // Update searches informations.
        if ( !property_exists( $configJson->options, 'searches' ) ) {
            $configJson->options->searches = array();
        }
        if ( property_exists( $configJson->options, 'externalSearch' ) ) {
            $externalSearch = array(
                'type' => 'externalSearch',
                'service' => $configJson->options->externalSearch
            );
            if ( $configJson->options->externalSearch == 'nominatim' )
                $externalSearch['url'] = jUrl::get('lizmap~osm:nominatim');
            else if ( $configJson->options->externalSearch == 'ign' )
                $externalSearch['url'] = jUrl::get('lizmap~ign:address');
            $configJson->options->searches[] = (object) $externalSearch;
            unset( $configJson->options->externalSearch );
        }
        // Add FTS sqlite searches (db created with from quickfinder)
        $ftsSearches = $this->hasFtsSearches();
        if( $ftsSearches ){
            $configJson->options->searches[] = (object) array(
                'type' => 'QuickFinder',
                'service' => 'lizmapQuickFinder',
                'url' => jUrl::get('lizmap~search:get')
            );
        }
        // Events to get additional searches
        $searchServices = jEvent::notify('searchServiceItem',array('repository'=>$this->repository->getKey(), 'project'=>$this->getKey()))->getResponse();
        foreach( $searchServices as $searchService ){
            if( is_array($searchService) ) {
                if ( array_key_exists( 'type', $searchService ) && array_key_exists( 'url', $searchService ) )
                    $configJson->options->searches[] = (object) $searchService;
            }
            else if( is_object($searchService) ) {
                if ( property_exists( $searchService, 'type' ) && property_exists( $searchService, 'url' ) )
                    $configJson->options->searches[] = $searchService;
            }
        }

        // Update dataviz config
        if ( property_exists( $configJson, 'datavizLayers' ) ) {
            $datavizLayers = $this->getDatavizLayersConfig();
            if($datavizLayers){
                $configJson->datavizLayers = $datavizLayers;
            }
            else{
                unset($configJson->datavizLayers);
            }
        }

        // Get server plugins
        $qplugins = $this->getQgisServerPlugins();
        $configJson->qgisServerPlugins = $qplugins;

        $configRead = json_encode($configJson);

        return $configRead;
    }

    public function getFullCfg(){
        return $this->cfg;
    }

    /**
     * @FIXME: remove this method. Be sure it is not used in other projects
     * Data provided by the returned xml element should be extracted and encapsulated
     * into an object. Xml should not be used by callers
     * @deprecated
     */
    public function getComposer( $title ){
        $xmlComposer = $this->getXml()->xpath( "//Composer[@title='$title']" );
        if( $xmlComposer )
            return $xmlComposer[0];
        else
            return null;
    }

    public function getDefaultDockable() {
        $dockable = array();
        $bp = jApp::config()->urlengine['basePath'];

        // Get lizmap services
        $services = lizmap::getServices();

        // only maps
        if($services->onlyMaps) {
                $projectsTpl = new jTpl();
                $projectsTpl->assign('excludedProject', $this->repository->getKey().'~'.$this->getKey());
                $dockable[] = new lizmapMapDockItem(
                    'home',
                    jLocale::get('view~default.repository.list.title'),
                    $projectsTpl->fetch('view~map_projects'),
                    0
                );
        }

        $switcherTpl = new jTpl();
        $switcherTpl->assign(array(
            'layerExport'=>jAcl2::check('lizmap.tools.layer.export', $this->repository->getKey())
        ));
        $dockable[] = new lizmapMapDockItem(
            'switcher',
            jLocale::get('view~map.switchermenu.title'),
            $switcherTpl->fetch('view~map_switcher'),
            1
        );
        //$legendTpl = new jTpl();
        //$dockable[] = new lizmapMapDockItem('legend', 'Légende', $switcherTpl->fetch('map_legend'), 2);

        $metadataTpl = new jTpl();
        // Get the WMS information
        $wmsInfo = $this->getWMSInformation();
        // WMS GetCapabilities Url
        $wmsGetCapabilitiesUrl = jAcl2::check(
            'lizmap.tools.displayGetCapabilitiesLinks',
            $this->repository->getKey()
        );
        $wmtsGetCapabilitiesUrl = $wmsGetCapabilitiesUrl;
        if ( $wmsGetCapabilitiesUrl ) {
            $wmsGetCapabilitiesUrl = $this->getData('wmsGetCapabilitiesUrl');
            $wmtsGetCapabilitiesUrl = $this->getData('wmtsGetCapabilitiesUrl');
        }
        $metadataTpl->assign(array_merge(array(
            'repositoryLabel'=>$this->getData('label'),
            'repository'=>$this->repository->getKey(),
            'project'=>$this->getKey(),
            'wmsGetCapabilitiesUrl' => $wmsGetCapabilitiesUrl,
            'wmtsGetCapabilitiesUrl' => $wmtsGetCapabilitiesUrl
        ), $wmsInfo));
        $dockable[] = new lizmapMapDockItem(
            'metadata',
            jLocale::get('view~map.metadata.link.label'),
            $metadataTpl->fetch('view~map_metadata'),
            2
        );


        if ( $this->hasEditionLayers() ) {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'edition',
                jLocale::get('view~edition.navbar.title'),
                $tpl->fetch('view~map_edition'),
                3,
                '',
                $bp.'js/edition.js'
            );
        }

        return $dockable;
    }

    public function getDefaultMiniDockable() {
        $dockable = array();
        $configOptions = $this->getOptions();
        $bp = jApp::config()->urlengine['basePath'];

        if ( $this->hasAttributeLayers() ) {
            $tpl = new jTpl();
            $layerExport = jAcl2::check('lizmap.tools.layer.export', $this->repository->getKey());
            $tpl->assign('layerExport', $layerExport);
            $dock = new lizmapMapDockItem(
                'selectiontool',
                jLocale::get('view~map.selectiontool.navbar.title'),
                $tpl->fetch('view~map_selectiontool'),
                1
            );
            $dock->icon = '<span class="icon-white icon-star" style="margin-left:2px; margin-top:2px;"></span>';
            $dockable[] = $dock;
        }

        if ( $this->hasLocateByLayer() ) {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'locate',
                jLocale::get('view~map.locatemenu.title'),
                $tpl->fetch('view~map_locate'),
                2
            );
        }

        if ( property_exists($configOptions,'geolocation')
            && $configOptions->geolocation == 'True') {
            $tpl = new jTpl();
            $tpl->assign('hasEditionLayers', $this->hasEditionLayers());
            $dockable[] = new lizmapMapDockItem(
                'geolocation',
                jLocale::get('view~map.geolocate.navbar.title'),
                $tpl->fetch('view~map_geolocation'),
                3
            );
        }

        if ( property_exists($configOptions,'print')
            && $configOptions->print == 'True') {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'print',
                jLocale::get('view~map.print.navbar.title'),
                $tpl->fetch('view~map_print'),
                4
            );
        }

        if ( property_exists($configOptions,'measure')
            && $configOptions->measure == 'True') {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'measure',
                jLocale::get('view~map.measure.navbar.title'),
                $tpl->fetch('view~map_measure'),
                5
            );
        }

        if ( $this->hasTooltipLayers() ) {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'tooltip-layer',
                jLocale::get('view~map.tooltip.navbar.title'),
                $tpl->fetch('view~map_tooltip'),
                6,
                '',
                ''
            );
        }

        if ( $this->hasTimemanagerLayers() ) {
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'timemanager',
                jLocale::get('view~map.timemanager.navbar.title'),
                $tpl->fetch('view~map_timemanager'),
                7,
                '',
                $bp.'js/timemanager.js'
            );
        }

        // Permalink
        if ( true ) {
            // Get geobookmark if user is connected
            $gbCount = False; $gbList = Null;
            if( jAuth::isConnected() ){
                $juser = jAuth::getUserSession();
                $usr_login = $juser->login;
                $daogb = jDao::get('lizmap~geobookmark');
                $conditions = jDao::createConditions();
                $conditions->addCondition('login','=',$usr_login);
                $conditions->addCondition(
                    'map',
                    '=',
                    $this->repository->getKey().':'.$this->getKey()
                );
                $gbList = $daogb->findBy($conditions);
                $gbCount = $daogb->countBy($conditions);
            }
            $tpl = new jTpl();
            $tpl->assign( 'gbCount', $gbCount );
            $tpl->assign( 'gbList', $gbList );
            $gbContent = Null;
            if( $gbList )
                $gbContent = $tpl->fetch('view~map_geobookmark');
            $tpl = new jTpl();
            $tpl->assign(array(
                'repository'=>$this->repository->getKey(),
                'project'=>$this->getKey(),
                'gbContent'=>$gbContent
            ));
            $dockable[] = new lizmapMapDockItem(
                'permaLink',
                jLocale::get('view~map.permalink.navbar.title'),
                $tpl->fetch('view~map_permalink'),
                8
            );
        }

        return $dockable;
    }

    public function getDefaultBottomDockable() {
        $dockable = array();
        $configOptions = $this->getOptions();
        $bp = jApp::config()->urlengine['basePath'];

        if ( $this->hasAttributeLayers() ) {
            $form = jForms::create( 'view~attribute_layers_option' );
            $assign = array( 'form' => $form );
            $tpl = new jTpl();
            $dockable[] = new lizmapMapDockItem(
                'attributeLayers',
                jLocale::get('view~map.attributeLayers.navbar.title'),
                array( 'view~map_attributeLayers', $assign ),
                1,
                '',
                $bp.'js/attributeTable.js'
            );
        }

        return $dockable;
    }

    /**
     * Check acl rights on the project
     */
    public function checkAcl () {

        // Check right on repository
        if (!jAcl2::check('lizmap.repositories.view', $this->repository->getKey())){
            return False;
        }

        // Check acl option is configured in project config
        if (!property_exists($this->cfg->options, 'acl') || !is_array($this->cfg->options->acl) || empty($this->cfg->options->acl) ){
            return True;
        }

        // Check user is authenticated
        if(!jAuth::isConnected()){
            return False;
        }

        // Check user is admin -> ok, give permission
        if( jAcl2::check('lizmap.admin.repositories.delete') ){
            return True;
        }

        // Check if configured groups white list and authenticated user groups list intersects
        $aclGroups = $this->cfg->options->acl;
        $userGroups = jAcl2DbUserGroup::getGroups();
        if( array_intersect($aclGroups, $userGroups) ){
            return True;
        }

        return False;
    }

}
