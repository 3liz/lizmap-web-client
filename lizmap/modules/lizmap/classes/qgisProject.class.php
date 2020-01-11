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
class qgisProject
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
        'relations', 'useLayerIDs', 'layers', 'data', 'qgisProjectVersion', );

    /**
     * constructor.
     *
     * @param string $file : the QGIS project path
     */
    public function __construct($file)
    {

        // Verifying if the files exist
        if (!file_exists($file)) {
            throw new Exception('The QGIS project '.$file.' does not exist!');
        }

        // For the cache key, we use the full path of the project file
        // to avoid collision in the cache engine
        $data = false;
        if (jApp::config()->isWindows) {
            // Cache backends don't support '\'
            $fileKey = str_replace('\\', '/', $file);
        }
        else {
            $fileKey = $file;
        }
        try {
            $data = jCache::get($fileKey, 'qgisprojects');
        } catch (Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::logEx($e, 'error');
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
                jCache::set($fileKey, $data, null, 'qgisprojects');
            } catch (Exception $e) {
                jLog::logEx($e, 'error');
            }
        } else {
            foreach ($this->cachedProperties as $prop) {
                $this->{$prop} = $data[$prop];
            }
        }

        $this->path = $file;
    }

    public function clearCache()
    {
        $file = $this->path;
        if (jApp::config()->isWindows) {
            // Cache backends don't support '\'
            $file = str_replace('\\', '/', $file);
        }
        try {
            jCache::delete($file, 'qgisprojects');
        } catch (Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::logEx($e, 'error');
        }
    }

    public function getPath()
    {
        return $this->path;
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
                return new qgisVectorLayer($this, $layers[$k]);
            }

            return new qgisMapLayer($this, $layers[$k]);
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
                return new qgisVectorLayer($this, $layers[$k]);
            }

            return new qgisMapLayer($this, $layers[$k]);
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
                    $layers[] = new qgisVectorLayer($this, $layer);
                } else {
                    $layers[] = new qgisMapLayer($this, $layer);
                }
            }
        }

        return $layers;
    }

    /**
     * @FIXME: remove this method. Be sure it is not used in other projects.
     * Data provided by the returned xml element should be extracted and encapsulated
     * into an object. Xml should not be used by callers
     *
     * @return SimpleXMLElement[]
     *
     * @deprecated
     */
    public function getXmlLayers()
    {
        return $this->getXml()->xpath('//maplayer');
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
     * @return SimpleXMLElement[]
     */
    public function getXmlLayer($layerId)
    {
        $layer = $this->getLayerDefinition($layerId);
        if ($layer && array_key_exists('embedded', $layer) && $layer['embedded'] == 1) {
            $qgsProj = new qgisProject(realpath(dirname($this->path).DIRECTORY_SEPARATOR.$layer['projectPath']));

            return $qgsProj->getXml()->xpath("//maplayer[id='${layerId}']");
        }

        return $this->getXml()->xpath("//maplayer[id='${layerId}']");
    }

    /**
     * @FIXME: remove this method. Be sure it is not used in other projects
     * Data provided by the returned xml element should be extracted and encapsulated
     * into an object. Xml should not be used by callers
     *
     * @deprecated
     *
     * @param mixed $key
     *
     * @return SimpleXMLElement[]
     */
    public function getXmlLayerByKeyword($key)
    {
        return $this->getXml()->xpath("//maplayer/keywordList[value='${key}']/parent::*");
    }

    /**
     * @FIXME: remove this method. Be sure it is not used in other projects.
     * Data provided by the returned xml element should be extracted and encapsulated
     * into an object. Xml should not be used by callers
     *
     * @deprecated
     *
     * @param mixed $relationId
     *
     * @return SimpleXMLElement[]
     */
    public function getXmlRelation($relationId)
    {
        return $this->getXml()->xpath("//relation[@id='${relationId}']");
    }

    /**
     * temporary function to read xml for some methods that relies on
     * xml data that are not yet stored in the cache.
     *
     * @return SimpleXMLElement
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
     * Read the qgis files.
     *
     * @param mixed $qgs_path
     */
    protected function readXmlProject($qgs_path)
    {
        if (!file_exists($qgs_path)) {
            throw new Exception('The QGIS project '.basename($qgs_path).' does not exist!');
        }

        $qgs_xml = simplexml_load_file($qgs_path);
        if ($qgs_xml === false) {
            throw new Exception('The QGIS project '.basename($qgs_path).' has invalid content!');
        }
        $this->path = $qgs_path;
        $this->xml = $qgs_xml;

        // Build data
        $this->data = array(
        );

        // get title from WMS properties
        if (property_exists($qgs_xml->properties, 'WMSServiceTitle')) {
            if (!empty($qgs_xml->properties->WMSServiceTitle)) {
                $this->data['title'] = (string) $qgs_xml->properties->WMSServiceTitle;
            }
        }

        // get abstract from WMS properties
        if (property_exists($qgs_xml->properties, 'WMSServiceAbstract')) {
            $this->data['abstract'] = (string) $qgs_xml->properties->WMSServiceAbstract;
        }

        // get WMS max width
        if (property_exists($qgs_xml->properties, 'WMSMaxWidth')) {
            $this->data['wmsMaxWidth'] = (int) $qgs_xml->properties->WMSMaxWidth;
        }
        if (!array_key_exists('WMSMaxWidth', $this->data) or !$this->data['wmsMaxWidth']) {
            unset($this->data['wmsMaxWidth']);
        }

        // get WMS max height
        if (property_exists($qgs_xml->properties, 'WMSMaxHeight')) {
            $this->data['wmsMaxHeight'] = (int) $qgs_xml->properties->WMSMaxHeight;
        }
        if (!array_key_exists('WMSMaxHeight', $this->data) or !$this->data['wmsMaxHeight']) {
            unset($this->data['wmsMaxHeight']);
        }

        // get QGIS project version
        $qgisRoot = $qgs_xml->xpath('//qgis');
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

        $this->WMSInformation = $this->readWMSInformation($qgs_xml);
        $this->canvasColor = $this->readCanvasColor($qgs_xml);
        $this->allProj4 = $this->readAllProj4($qgs_xml);
        $this->relations = $this->readRelations($qgs_xml);
        $this->useLayerIDs = $this->readUseLayerIDs($qgs_xml);
        $this->layers = $this->readLayers($qgs_xml);
    }

    protected function readWMSInformation($qgsLoad)
    {

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
        if ($qgsLoad) {
            $WMSServiceTitle = (string) $qgsLoad->properties->WMSServiceTitle;
            $WMSServiceAbstract = (string) $qgsLoad->properties->WMSServiceAbstract;
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
                $qgsProj = new qgisProject(realpath(dirname($this->path).DIRECTORY_SEPARATOR.(string) $attributes->project));
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
                        foreach($xmlLayer->aliases->alias as $alias) {
                            $aliases[(string) $alias['field']] = (string) $alias['name'];
                        }
                    }

                    if (isset($xmlLayer->defaults->default)) {
                        foreach($xmlLayer->defaults->default as $default) {
                            $defaults[(string) $default['field']] = (string) $default['expression'];
                        }
                    }

                    if (isset($xmlLayer->constraints->constraint)) {
                        foreach($xmlLayer->constraints->constraint as $constraint) {
                            $c = array(
                                'constraints' => 0,
                                'notNull' => false,
                                'unique' => false,
                                'exp' => false
                            );
                            $c['constraints'] = (int) $constraint['constraints'];
                            if ( $c['constraints'] > 0 ) {
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
