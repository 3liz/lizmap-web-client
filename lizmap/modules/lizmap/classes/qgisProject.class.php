<?php
/**
* Manage and give access to qgis project.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2017 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class qgisProject{

    // QGIS project path
    protected $path = null;

    // QGIS project XML
    protected $xml = null;

    // QGIS project data
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
     * @var boolean
     */
    protected $useLayerIDs = false;

    /**
     * @var array
     */
    protected $layers = array();

    /**
     * @var array List of cached properties
     */
    protected $cachedProperties = array('WMSInformation', 'canvasColor', 'allProj4',
        'relations', 'layersOrder', 'useLayerIDs', 'layers', 'data', 'qgisProjectVersion');

    /**
     * constructor
     * @param string $file : the QGIS project path
     */
    public function __construct( $file ) {

        // Verifying if the files exist
        if (!file_exists($file))
            throw new Exception('The QGIS project '.$file.' does not exist!');

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
            $data['qgsmtime'] < filemtime($file) ) {
            // FIXME reading XML could take time, so many process could
            // read it and construct the cache at the same time. We should
            // have a kind of lock to avoid this issue.
            $this->readXmlProject($file);
            $data['qgsmtime'] = filemtime($file);
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
        $file = $this->path;
        try {
            jCache::delete($file, 'qgisprojects');
        }
        catch(Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::log($e->getMessage(), 'error');
        }
    }

    public function getPath() {
        return $this->path;
    }

    public function getData( $key ) {
        if ( !array_key_exists($key, $this->data) )
            return null;
        return $this->data[$key];
    }

    public function getQgisProjectVersion(){
        return $this->qgisProjectVersion;
    }

    public function getWMSInformation(){
        return $this->WMSInformation;
    }

    public function getCanvasColor(){
        return $this->canvasColor;
    }

    public function getProj4( $authId ){
        if ( !array_key_exists($authId, $this->data) )
            return null;
        return $this->allProj4[$authId];
    }

    public function getAllProj4( ) {
        return $this->allProj4;
    }

    public function getRelations() {
        return $this->relations;
    }

    public function getLayerDefinition( $layerId ){
        $layers = array_filter($this->layers, function($layer) use ($layerId) {
           return $layer['id'] ==  $layerId;
        });
        if( count($layers) ) {
            // get first key found in the filtered layers
            $k = key($layers);
            return $layers[$k];
        }
        return null;
    }

    public function getLayer( $layerId ){
        $layers = array_filter($this->layers, function($layer) use ($layerId) {
           return $layer['id'] ==  $layerId;
        });
        if( count($layers) ) {
            // get first key found in the filtered layers
            $k = key($layers);
            if( $layers[$k]['type'] == 'vector' ) {
                return new qgisVectorLayer( $this, $layers[$k] );
            }
            else {
                return new qgisMapLayer( $this, $layers[$k] );
            }
        }
        return null;
    }

    public function getLayerByKeyword( $key ){
        $layers = array_filter($this->layers, function($layer) use ($key) {
           return in_array($key, $layer['keywords']);
        });
        if( count($layers) ) {
            // get first key found in the filtered layers
            $k = key($layers);
            if( $layers[$k]['type'] == 'vector' ) {
                return new qgisVectorLayer( $this, $layers[$k] );
            }
            else {
                return new qgisMapLayer( $this, $layers[$k] );
            }
        }
        return null;
    }

    public function findLayersByKeyword( $key ){
        $foundLayers = array_filter($this->layers, function($layer) use ($key) {
           return in_array($key, $layer['keywords']);
        });
        $layers = array();
        if( $foundLayers ) {
            foreach( $foundLayers as $layer ) {
                if( $layer['type'] == 'vector' ) {
                    $layers[] = new qgisVectorLayer( $this, $layer );
                }
                else {
                    $layers[] = new qgisMapLayer( $this, $layer );
                }
            }
        }
        return $layers;
    }

    /**
     * @FIXME: remove this method. Be sure it is not used in other projects.
     * Data provided by the returned xml element should be extracted and encapsulated
     * into an object. Xml should not be used by callers
     * @deprecated
     */
    public function getXmlLayers(){
        return $this->getXml()->xpath( "//maplayer" );
    }

    /**
     * @FIXME: remove this method. Be sure it is not used in other projects.
     * Data provided by the returned xml element should be extracted and encapsulated
     * into an object. Xml should not be used by callers
     * @deprecated
     */
    public function getXmlLayer( $layerId ){
        $layer = $this->getLayerDefinition( $layerId );
        if ( array_key_exists('embedded', $layer) && $layer['embedded'] == 1 ) {
            $qgsProj = new qgisProject(realpath(dirname($this->path). DIRECTORY_SEPARATOR .$layer['projectPath']));
            return $qgsProj->getXml()->xpath( "//maplayer[id='$layerId']" );
        }
        return $this->getXml()->xpath( "//maplayer[id='$layerId']" );
    }

    /**
     * @FIXME: remove this method. Be sure it is not used in other projects
     * Data provided by the returned xml element should be extracted and encapsulated
     * into an object. Xml should not be used by callers
     * @deprecated
     */
    public function getXmlLayerByKeyword( $key ){
        return $this->getXml()->xpath( "//maplayer/keywordList[value='$key']/parent::*" );
    }

    /**
     * @FIXME: remove this method. Be sure it is not used in other projects.
     * Data provided by the returned xml element should be extracted and encapsulated
     * into an object. Xml should not be used by callers
     * @deprecated
     */
    public function getXmlRelation( $relationId ){
        return $this->getXml()->xpath( "//relation[@id='$relationId']" );
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
        $qgs_path = $this->path;
        if (!file_exists($qgs_path) ) {
            throw new Exception('The QGIS project '.$qgs_path.' does not exist!');
        }
        $xml = simplexml_load_file($qgs_path);
        if ($xml === false) {
            throw new Exception('The QGIS project '.$qgs_path.' has invalid content!');
        }
        $this->xml = $xml;
        return $xml;
    }

    /**
     * Read the qgis files
     */
    protected function readXmlProject($qgs_path) {
        if ( !file_exists($qgs_path) ) {
            throw new Exception('The QGIS project '.$file.' does not exist!');
        }

        $qgs_xml = simplexml_load_file($qgs_path);
        if ($qgs_xml === false) {
            throw new Exception('The QGIS project '.$file.' has invalid content!');
        }
        $this->path = $qgs_path;
        $this->xml = $qgs_xml;

        # Build data
        $this->data = array(
        );

        # get title from WMS properties
        if (property_exists($qgs_xml->properties, 'WMSServiceTitle'))
            if (!empty($qgs_xml->properties->WMSServiceTitle))
                $this->data['title'] = (string)$qgs_xml->properties->WMSServiceTitle;

        # get abstract from WMS properties
        if (property_exists($qgs_xml->properties, 'WMSServiceAbstract'))
            $this->data['abstract'] = (string)$qgs_xml->properties->WMSServiceAbstract;

        # get WMS max width
        if (property_exists($qgs_xml->properties, 'WMSMaxWidth'))
            $this->data['wmsMaxWidth'] = (int)$qgs_xml->properties->WMSMaxWidth;
        if( !array_key_exists('WMSMaxWidth', $this->data) or !$this->data['wmsMaxWidth'] )
            unset($this->data['wmsMaxWidth']);

        # get WMS max height
        if (property_exists($qgs_xml->properties, 'WMSMaxHeight'))
            $this->data['wmsMaxHeight'] = (int)$qgs_xml->properties->WMSMaxHeight;
        if( !array_key_exists('WMSMaxHeight', $this->data) or !$this->data['wmsMaxHeight'] )
            unset($this->data['wmsMaxHeight']);

        // get QGIS project version
        $qgisRoot = $qgs_xml->xpath('//qgis');
        $qgisRootZero = $qgisRoot[0];
        $qgisProjectVersion = (string)$qgisRootZero->attributes()->version;
        $qgisProjectVersion = explode('-', $qgisProjectVersion);
        $qgisProjectVersion = $qgisProjectVersion[0];
        $qgisProjectVersion = explode('.', $qgisProjectVersion);
        $a = '';
        foreach( $qgisProjectVersion as $k ){
            if( strlen($k) == 1 ){
                $a.= $k . '0';
            }
            else {
                $a.= $k;
            }
        }
        $qgisProjectVersion = (integer)$a;
        $this->qgisProjectVersion = $qgisProjectVersion;

        $this->WMSInformation = $this->readWMSInformation($qgs_xml);
        $this->canvasColor = $this->readCanvasColor($qgs_xml);
        $this->allProj4 = $this->readAllProj4($qgs_xml);
        $this->relations = $this->readRelations($qgs_xml);
        $this->layersOrder = $this->readLayersOrder($qgs_xml);
        $this->useLayerIDs = $this->readUseLayerIDs($qgs_xml);
        $this->layers = $this->readLayers($qgs_xml);
    }

    protected function readWMSInformation($qgsLoad) {

        // Default metadata
        $WMSServiceTitle = '';
        $WMSServiceAbstract = '';
        $WMSExtent = '';
        $ProjectCrs = '';
        $WMSOnlineResource = '';
        $WMSContactMail = '';
        $WMSContactOrganization = '';
        $WMSContactPerson = '';
        $WMSContactPhone = '';
        if($qgsLoad){
            $WMSServiceTitle = (string)$qgsLoad->properties->WMSServiceTitle;
            $WMSServiceAbstract = (string)$qgsLoad->properties->WMSServiceAbstract;
            $WMSExtent = $qgsLoad->properties->WMSExtent->value[0];
            $WMSExtent.= ", ".$qgsLoad->properties->WMSExtent->value[1];
            $WMSExtent.= ", ".$qgsLoad->properties->WMSExtent->value[2];
            $WMSExtent.= ", ".$qgsLoad->properties->WMSExtent->value[3];
            $WMSOnlineResource = (string)$qgsLoad->properties->WMSOnlineResource;
            $WMSContactMail = (string)$qgsLoad->properties->WMSContactMail;
            $WMSContactOrganization = (string)$qgsLoad->properties->WMSContactOrganization;
            $WMSContactPerson= (string)$qgsLoad->properties->WMSContactPerson;
            $WMSContactPhone = (string)$qgsLoad->properties->WMSContactPhone;
        }
        if ( isset($qgsLoad->mapcanvas) )
            $ProjectCrs = (string)$qgsLoad->mapcanvas->destinationsrs->spatialrefsys->authid;

        return array(
            'WMSServiceTitle'=>$WMSServiceTitle,
            'WMSServiceAbstract'=>$WMSServiceAbstract,
            'WMSExtent'=>$WMSExtent,
            'ProjectCrs'=>$ProjectCrs,
            'WMSOnlineResource'=>$WMSOnlineResource,
            'WMSContactMail'=>$WMSContactMail,
            'WMSContactOrganization'=>$WMSContactOrganization,
            'WMSContactPerson'=>$WMSContactPerson,
            'WMSContactPhone'=>$WMSContactPhone
        );
    }

    protected function readCanvasColor($xml) {
        $red = $xml->xpath( "//properties/Gui/CanvasColorRedPart" );
        $green = $xml->xpath( "//properties/Gui/CanvasColorGreenPart" );
        $blue = $xml->xpath( "//properties/Gui/CanvasColorBluePart" );
        return 'rgb('.$red[0].','.$green[0].','.$blue[0].')';
    }

    protected function readAllProj4($xml) {
        $srsList = array();
        $spatialrefsys = $xml->xpath( "//spatialrefsys" );
        foreach ( $spatialrefsys as $srs ) {
            $srsList[ (string) $srs->authid ] = (string) $srs->proj4;
        }
        return $srsList;
    }

    protected function readRelations($xml) {
        $xmlRelations = $xml->xpath( "//relations" );
        $relations = array();
        $pivotGather = array();
        $pivot = array();
        if( $xmlRelations ){
            foreach( $xmlRelations[0] as $relation ) {
                $relationObj = $relation->attributes();
                $fieldRefObj = $relation->fieldRef->attributes();
                if( !array_key_exists( (string)$relationObj->referencedLayer, $relations ) )
                    $relations[ (string)$relationObj->referencedLayer ] = array();

                $relations[ (string)$relationObj->referencedLayer ][] = array(
                    'referencingLayer' =>  (string)$relationObj->referencingLayer,
                    'referencedField' => (string)$fieldRefObj->referencedField,
                    'referencingField' => (string)$fieldRefObj->referencingField
                );

                if( !array_key_exists( (string)$relationObj->referencingLayer, $pivotGather ) )
                    $pivotGather[ (string)$relationObj->referencingLayer ] = array();

                $pivotGather[ (string)$relationObj->referencingLayer ][(string)$relationObj->referencedLayer] = (string)$fieldRefObj->referencingField;

            }

            // Keep only child with at least to parents
            foreach( $pivotGather as $pi=>$vo ){
                if( count( $vo ) > 1 ){
                    $pivot[$pi] = $vo;
                }
            }
            $relations['pivot'] = $pivot;

            return $relations;
        }
        else
            return null;
    }

    protected function readLayersOrder($qgsLoad) {
        $legend = $qgsLoad->xpath('//legend');
        $legendZero = $legend[0];
        $updateDrawingOrder = (string)$legendZero->attributes()->updateDrawingOrder;
        $layersOrder = array();

        if( $updateDrawingOrder == 'false' ){
            // For QGIS >=2.4, new item layer-tree-canvas
            if( $this->qgisProjectVersion >= 204000){
                $customeOrder = $qgsLoad->xpath('//layer-tree-canvas/custom-order');
                $customeOrderZero = $customeOrder[0];
                if( $customeOrderZero->attributes()->enabled == 1 ){
                    $items = $customeOrderZero->xpath('//item');
                    $lo = 0;
                    foreach( $items as $layerI ) {
                        # Get layer name from config instead of XML for possible embedded layers
                        $name = $this->getLayerNameByIdFromConfig($layerI);
                        if( $name ){
                            $layersOrder[$name] = $lo;
                        }
                        $lo+=1;
                    }
                }
            } else {
                $layers =  $qgsLoad->xpath('//legendlayer');
                foreach( $layers as $layer ){
                    if( $layer->attributes()->drawingOrder and $layer->attributes()->drawingOrder >= 0 ){
                        $layersOrder[(string)$layer->attributes()->name] = (integer)$layer->attributes()->drawingOrder;
                    }
                }
            }
        }
        return $layersOrder;
    }

    protected function readUseLayerIDs($xml) {
        $WMSUseLayerIDs = $xml->xpath( "//properties/WMSUseLayerIDs" );
        return ( $WMSUseLayerIDs && count($WMSUseLayerIDs) > 0 && $WMSUseLayerIDs[0] == 'true' );
    }

    protected function readLayers($xml) {
        $xmlLayers = $xml->xpath( "//maplayer" );
        $layers = array();
        if ( !$xmlLayers )
            return $layers;

        foreach( $xmlLayers as $xmlLayer ) {
            $attributes = $xmlLayer->attributes();
            if ( isset($attributes['embedded']) && (string)$attributes->embedded == '1'){
                $qgsProj = new qgisProject(realpath(dirname($this->path). DIRECTORY_SEPARATOR .(string)$attributes->project));
                $layer = $qgsProj->getLayerDefinition( (string)$attributes->id );
                $layer['embedded'] = 1;
                $layer['projectPath'] = (string)$attributes->project;
                $layers[] = $layer;
            } else {
                $layer = array(
                    'type' => (string)$attributes->type,
                    'id' => (string)$xmlLayer->id,
                    'name' => (string)$xmlLayer->layername,
                    'shortname' => (string)$xmlLayer->shortname,
                    'title' => (string)$xmlLayer->title,
                    'abstract' => (string)$xmlLayer->abstract,
                    'proj4' => (string)$xmlLayer->srs->spatialrefsys->proj4,
                    'srid' => (integer)$xmlLayer->srs->spatialrefsys->srid,
                    'authid' => (integer)$xmlLayer->srs->spatialrefsys->authid,
                    'datasource' => (string)$xmlLayer->datasource,
                    'provider' => (string)$xmlLayer->provider,
                    'keywords' => array()
                );
                $keywords = $xmlLayer->xpath("./keywordList/value");
                if ($keywords) {
                    foreach($keywords as $keyword) {
                        if ('' != (string)$keyword) {
                            $layer['keywords'][] = (string)$keyword;
                        }
                    }
                }

                $items = $xmlLayer->xpath('//item');
                if ( $layer['title'] == '' ) {
                    $layer['title'] = $layer['name'];
                }
                if ($layer['type'] == 'vector') {
                    $fields = array();
                    $wfsFields = array();
                    $aliases = array();
                    $edittypes = $xmlLayer->xpath(".//edittype");
                    if ( $edittypes ) {
                        foreach( $edittypes as $edittype ) {
                            $field = (string) $edittype->attributes()->name;
                            if ( in_array($field, $fields) ) {
                                continue; // QGIS sometimes stores them twice
                            }
                            $fields[] = $field;
                            $wfsFields[] = $field;
                        }
                    } else {
                        $fieldconfigurations = $xmlLayer->xpath(".//fieldConfiguration/field");
                        if ( $fieldconfigurations ) {
                            foreach( $fieldconfigurations as $fieldconfiguration ) {
                                $field = (string) $fieldconfiguration->attributes()->name;
                                if ( in_array($field, $fields) ) {
                                    continue; // QGIS sometimes stores them twice
                                }
                                $fields[] = $field;
                                $wfsFields[] = $field;
                            }
                        }
                    }
                    foreach( $fields as $field ) {
                        $aliases[$field] = $field;
                        $alias = $xmlLayer->xpath("aliases/alias[@field='".$field."']");
                        if( $alias && count($alias) != 0 ) {
                            $alias = $alias[0];
                            $aliases[$field] = (string)$alias['name'];
                        }
                    }
                    $layer['fields'] = $fields;
                    $layer['aliases'] = $aliases;
                    $layer['wfsFields'] = $wfsFields;

                    $excludeFields = $xmlLayer->xpath(".//excludeAttributesWFS/attribute");
                    if ( $excludeFields && count($excludeFields) > 0 ) {
                        foreach( $excludeFields as $eField ) {
                            $eField = (string) $eField;
                            array_splice( $wfsFields, array_search( $eField, $wfsFields ), 1 );
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