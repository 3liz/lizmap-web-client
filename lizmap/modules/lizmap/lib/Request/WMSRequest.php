<?php
/**
 * Manage OGC request.
 *
 * @author    3liz
 * @copyright 2015 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Request;

/**
 * @see https://en.wikipedia.org/wiki/Web_Map_Service.
 */
class WMSRequest extends OGCRequest
{
    protected $tplExceptions = 'lizmap~wms_exception';

    private $forceRequest = false;

    public function getForceRequest()
    {
        return $this->forceRequest;
    }

    public function setForceRequest($forced)
    {
        return $this->forceRequest = $forced;
    }

    public function parameters()
    {
        $params = parent::parameters();

        // Filter data by login if necessary
        // as configured in the plugin for login filtered layers.

        // Filter data by login for request: getmap, getfeatureinfo, getprint, getprintatlas
        if (!in_array($this->param('request'), array('getmap', 'getfeatureinfo', 'getprint', 'getprintatlas'))) {
            return $params;
        }

        // No filter data by login rights
        if ($this->appContext->aclCheck('lizmap.tools.loginFilteredLayers.override', $this->repository->getKey())) {
            return $params;
        }

        // filter data by login
        $layers = $this->param('layers');

        // 'getprintatlas' request has param 'layer' and not 'layers'
        if ($this->param('request') == 'getprintatlas') {
            $layers = $this->param('layer');
        }

        if (is_string($layers)) {
            $layers = explode(',', $layers);
        }

        // get login filters
        $loginFilters = array();

        if ($layers) {
            $loginFilters = $this->project->getLoginFilters($layers);
        }

        // login filters array is empty
        if (empty($loginFilters)) {
            return $params;
        }

        // merge client filter parameter
        $clientFilter = $this->param('filter');
        if ($clientFilter != null && !empty($clientFilter)) {
            $cfexp = explode(';', $clientFilter);
            foreach ($cfexp as $a) {
                $b = explode(':', $a);
                $lname = trim($b[0]);
                $lfilter = trim($b[1]);
                if (array_key_exists($lname, $loginFilters)) {
                    $loginFilters[$lname]['filter'] .= ' AND '.$lfilter;
                } else {
                    $loginFilters[$lname] = array('filter' => $lfilter, 'layername' => $lname);
                }
            }
        }

        // update filter parameter
        $filters = array();
        foreach ($loginFilters as $layername => $lfilter) {
            $filters[] = $layername.':'.$lfilter['filter'];
        }
        $params['filter'] = implode(';', $filters);

        return $params;
    }

    /**
     * @see https://en.wikipedia.org/wiki/Web_Map_Service#Requests.
     */
    protected function getcapabilities()
    {
        $version = $this->param('version');
        // force version if noy defined
        if (!$version) {
            $this->params['version'] = '1.3.0';
        }
        $result = parent::getcapabilities();

        $data = $result->data;
        if (empty($data) or floor($result->code / 100) >= 4) {
            if (empty($data)) {
                \jLog::log('GetCapabilities empty data', 'error');
            } else {
                \jLog::log('GetCapabilities result code: '.$result->code, 'error');
            }
            \jMessage::add('Server Error !', 'Error');

            return $this->serviceException();
        }

        if (preg_match('#ServiceExceptionReport#i', $data)) {
            return $result;
        }

        // Remove no interoparable elements
        $data = preg_replace('@<GetPrint[^>]*?>.*?</GetPrint>@si', '', $data);
        $data = preg_replace('@<ComposerTemplates[^>]*?>.*?</ComposerTemplates>@si', '', $data);

        // Replace qgis server url in the XML (hide real location)
        $sUrl = \jUrl::getFull(
            'lizmap~service:index',
            array('repository' => $this->repository->getKey(), 'project' => $this->project->getKey())
        );
        $sUrl = str_replace('&', '&amp;', $sUrl).'&amp;';
        preg_match('/<get>.*\n*.+xlink\:href="([^"]+)"/i', $data, $matches);
        if (count($matches) < 2) {
            preg_match('/get onlineresource="([^"]+)"/i', $data, $matches);
        }
        if (count($matches) > 1) {
            $data = str_replace($matches[1], $sUrl, $data);
        }
        $data = str_replace('&amp;&amp;', '&amp;', $data);

        if (preg_match('@WMS_Capabilities@i', $data)) {
            // Update namespace
            $schemaLocation = 'http://www.opengis.net/wms';
            $schemaLocation .= ' http://schemas.opengis.net/wms/1.3.0/capabilities_1_3_0.xsd';
            $schemaLocation .= ' http://www.opengis.net/sld';
            $schemaLocation .= ' http://schemas.opengis.net/sld/1.1.0/sld_capabilities.xsd';
            $schemaLocation .= ' http://www.qgis.org/wms';
            $schemaLocation .= ' '.$sUrl.'SERVICE=WMS&amp;REQUEST=GetSchemaExtension';
            $data = preg_replace('@xsi:schemaLocation=".*?"@si', 'xsi:schemaLocation="'.$schemaLocation.'"', $data);
            if (!preg_match('@xmlns:qgs@i', $data)) {
                $data = preg_replace('@xmlns="http://www.opengis.net/wms"@', 'xmlns="http://www.opengis.net/wms" xmlns:qgs="http://www.qgis.org/wms"', $data);
                $data = preg_replace('@GetStyles@', 'qgs:GetStyles', $data);
            }
            if (!preg_match('@xmlns:sld@i', $data)) {
                $data = preg_replace('@xmlns="http://www.opengis.net/wms"@', 'xmlns="http://www.opengis.net/wms" xmlns:sld="http://www.opengis.net/sld"', $data);
                $data = preg_replace('@GetLegendGraphic@', 'sld:GetLegendGraphic', $data);
            }
        }

        //INSERT MaxWidth and MaxHeight
        $dimensions = array('Width', 'Height');
        foreach ($dimensions as $d) {
            if (!preg_match('@Service>.*?Max'.$d.'.*?</Service@si', $data)) {
                $matches = array();
                if (preg_match('@Service>(.*?)</Service@si', $data, $matches)) {
                    if (count($matches) > 1) {
                        $sUpdate = $matches[1].'<Max'.$d.'>3000</Max'.$d.">\n ";
                        $data = str_replace($matches[1], $sUpdate, $data);
                    }
                }
            }
        }

        return (object) array(
            'code' => 200,
            'mime' => $result->mime,
            'data' => $data,
            'cached' => false,
        );
    }

    protected function getcontext()
    {
        // Get remote data
        $response = $this->request();

        // Replace qgis server url in the XML (hide real location)
        $sUrl = $this->appContext->getFullUrl(
            'lizmap~service:index',
            array('repository' => $this->repository->getKey(), 'project' => $this->project->getKey())
        );
        $sUrl = str_replace('&', '&amp;', $sUrl).'&amp;';
        $data = $response->data;
        $data = preg_replace('/xlink\:href=".*"/', 'xlink:href="'.$sUrl.'&amp;"', $data);

        return (object) array(
            'code' => $response->code,
            'mime' => $response->mime,
            'data' => $data,
            'cached' => false,
        );
    }

    protected function getschemaextension()
    {
        $data = '<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://www.w3.org/2001/XMLSchema" xmlns:wms="http://www.opengis.net/wms" xmlns:qgs="http://www.qgis.org/wms" targetNamespace="http://www.qgis.org/wms" elementFormDefault="qualified" version="1.0.0">
  <import namespace="http://www.opengis.net/wms" schemaLocation="http://schemas.opengis.net/wms/1.3.0/capabilities_1_3_0.xsd"/>
  <element name="GetPrint" type="wms:OperationType" substitutionGroup="wms:_ExtendedOperation" />
  <element name="GetPrintAtlas" type="wms:OperationType" substitutionGroup="wms:_ExtendedOperation" />
  <element name="GetStyles" type="wms:OperationType" substitutionGroup="wms:_ExtendedOperation" />
</schema>';

        return (object) array(
            'code' => 200,
            'mime' => 'text/xml',
            'data' => $data,
            'cached' => false,
        );
    }

    /**
     * @see https://en.wikipedia.org/wiki/Web_Map_Service#Requests.
     */
    protected function getmap()
    {
        if (!$this->checkMaximumWidthHeight()) {
            \jMessage::add('The requested map size is too large', 'Size error');

            return $this->serviceException();
        }

        $getMap = $this->getMapData($this->project, $this->parameters(), $this->forceRequest);

        return (object) array(
            'code' => $getMap[2],
            'mime' => $getMap[1],
            'data' => $getMap[0],
            'cached' => $getMap[3],
        );
    }

    /**
     * Check wether the height and width values are valids.
     */
    protected function checkMaximumWidthHeight()
    {
        $dimensions = array('Width', 'Height');

        foreach ($dimensions as $d) {
            $var = 'wmsMax'.$d;
            $max = $this->project->getData($var);
            if (!$max) {
                $max = $this->services->{$var} ? $this->services->{$var} : 3000;
            }
            $dim = $this->param(lcfirst($d));
            if ($dim == null || !is_numeric($dim) || intval($dim) > $max) {
                return false;
            }
        }

        return true;
    }

    /**
     * @see https://en.wikipedia.org/wiki/Web_Map_Service#Requests.
     */
    protected function getlegendgraphic()
    {
        return $this->getlegendgraphics();
    }

    protected function getlegendgraphics()
    {
        $layers = $this->param('Layers', $this->param('Layer', ''));
        $layers = explode(',', $layers);
        if (count($layers) == 1) {
            $lName = $layers[0];
            $layer = $this->project->findLayerByAnyName($lName);
            if ($layer && property_exists($layer, 'showFeatureCount') && $layer->showFeatureCount == 'True') {
                $this->params['showFeatureCount'] = 'True';
            }
        }

        // Get remote data
        $response = $this->request(true);

        return (object) array(
            'code' => $response->code,
            'mime' => $response->mime,
            'data' => $response->data,
            'cached' => false,
        );
    }

    /**
     * @see https://en.wikipedia.org/wiki/Web_Map_Service#Requests.
     */
    protected function getfeatureinfo()
    {
        $queryLayers = $this->param('query_layers');
        // QUERY_LAYERS is mandatory
        if (!$queryLayers) {
            \jMessage::add('The QUERY_LAYERS parameter is missing.', 'MissingParameterValue');

            return $this->serviceException();
        }

        // We split layers in two groups. First contains exernal WMS, second contains QGIS layers
        $queryLayers = explode(',', $queryLayers);
        $externalWMSConfigLayers = array();
        $qgisQueryLayers = array();
        foreach ($queryLayers as $queryLayer) {
            $configLayer = $this->project->findLayerByAnyName($queryLayer);
            if (property_exists($configLayer, 'externalAccess')
                && $configLayer->externalAccess != 'False'
                && property_exists($configLayer->externalAccess, 'url')
            ) {
                $externalWMSConfigLayers[] = $configLayer;
            } else {
                $qgisQueryLayers[] = $queryLayer;
            }
        }

        $rep = '';

        // External WMS
        foreach ($externalWMSConfigLayers as $configLayer) {
            $externalWMSLayerParams = array_merge(array(), $this->params);
            if (array_key_exists('map', $externalWMSLayerParams)) {
                unset($externalWMSLayerParams['map']);
            }
            if (array_key_exists('filter', $externalWMSLayerParams)) {
                unset($externalWMSLayerParams['filter']);
            }
            if (array_key_exists('selection', $externalWMSLayerParams)) {
                unset($externalWMSLayerParams['selection']);
            }

            $externalWMSLayerParams['layers'] = $configLayer->name;
            $externalWMSLayerParams['query_layers'] = $configLayer->name;

            // We force info_format application/vnd.ogc.gml as default value.
            // TODO let user choose which format he wants in lizmap plugin
            $externalWMSLayerParams['info_format'] = 'application/vnd.ogc.gml';

            // build Query string
            $url = $configLayer->externalAccess->url;
            if (!preg_match('/\?/', $url)) {
                $url .= '?';
            } elseif (!preg_match('/&$/', $url)) {
                $url .= '&';
            }
            $querystring = Proxy::constructUrl($externalWMSLayerParams, $this->services, $url);

            // Query external WMS layers
            list($data, $mime, $code) = \Lizmap\Request\Proxy::getRemoteData($querystring);

            $rep .= $this->gfiGmlToHtml($data, $configLayer);
        }

        $toHtml = ($this->param('info_format') == 'text/html');
        if ($toHtml) {
            $this->params['info_format'] = 'text/xml';
        }

        // force layers
        $this->params['query_layers'] = implode(',', $qgisQueryLayers);
        $this->params['layers'] = implode(',', $qgisQueryLayers);

        // Always request maptip to QGIS server so we can decide if to use it later
        $this->params['with_maptip'] = 'true';
        // Always request geometry to QGIS server so we can decide if to use it later
        $this->params['with_geometry'] = 'true';

        // Get remote data
        $response = $this->request(true);
        $code = $response->code;
        $mime = $response->mime;
        $data = $response->data;

        // Get HTML content if needed
        if ($toHtml and preg_match('#/xml#', $mime)) {
            $rep .= $this->gfiXmlToHtml($data);
            $mime = 'text/html';
        }

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $rep,
            'cached' => false,
        );
    }

    protected function getprint()
    {
        // Get remote data
        $response = $this->request(true);

        return (object) array(
            'code' => $response->code,
            'mime' => $response->mime,
            'data' => $response->data,
            'cached' => false,
        );
    }

    protected function getprintatlas()
    {
        // Trigger optional actions by other modules
        // For example, cadastre module can create a file
        $eventParams = array(
            'params' => $this->params,
            'repository' => $this->repository->getKey(),
            'project' => $this->project->getKey(),
        );
        $this->appContext->eventNotify('BeforePdfCreation', $eventParams);

        // Get remote data
        $response = $this->request(true);

        return (object) array(
            'code' => $response->code,
            'mime' => $response->mime,
            'data' => $response->data,
            'cached' => false,
        );
    }

    protected function getstyles()
    {

        // Get remote data
        $response = $this->request();

        return (object) array(
            'code' => $response->code,
            'mime' => $response->mime,
            'data' => $response->data,
            'cached' => false,
        );
    }

    protected function getViewTpl($tplName, $layerName, $layerId, $layerTitle, $params = array())
    {
        $tpl = new \jTpl();
        $tpl->assign('layerName', $layerName);
        $tpl->assign('layerId', $layerId);
        $tpl->assign('layerTitle', $layerTitle);
        $tpl->assign('repository', $this->repository->getKey());
        $tpl->assign('project', $this->project->getKey());
        foreach ($params as $key => $value) {
            $tpl->assign($key, $value);
        }

        return $tpl->fetch($tplName, 'html');
    }

    /**
     * gfiXmlToHtml : return HTML for the getFeatureInfo XML.
     *
     * @param string $xmldata XML data from getFeatureInfo
     * @param mixed  $xmlData
     *
     * @return string feature Info in HTML format
     */
    protected function gfiXmlToHtml($xmlData)
    {
        $xml = $this->loadXmlString($xmlData, 'getFeatureInfoHtml');

        if (!$xml || !$xml->Layer) {
            return '';
        }

        // Get optional parameter fid
        $filterFid = null;
        $fid = $this->param('fid');
        if ($fid) {
            $expFid = explode('.', $fid);
            if (count($expFid) == 2) {
                $filterFid = array();
                $filterFid[$expFid[0]] = $expFid[1];
            }
        }

        // Loop through the layers
        $content = array();

        foreach ($xml->Layer as $layer) {
            $layerName = (string) $layer['name'];
            $configLayer = $this->project->findLayerByAnyName($layerName);
            if ($configLayer == null) {
                continue;
            }

            // Avoid layer if no popup asked by the user for it
            // or if no popup property
            // or if no edition
            $returnPopup = false;
            if (property_exists($configLayer, 'popup') && $configLayer->popup == 'True') {
                $returnPopup = true;
            }

            if (!$returnPopup) {
                $editionLayer = $this->project->findEditionLayerByLayerId($configLayer->id);
                if ($editionLayer != null
                    && ($editionLayer->capabilities->modifyGeometry == 'True'
                    || $editionLayer->capabilities->modifyAttribute == 'True'
                    || $editionLayer->capabilities->deleteFeature == 'True')
                ) {
                    $returnPopup = true;
                }
            }

            if (!$returnPopup) {
                continue;
            }

            // Get layer title
            $layerTitle = $configLayer->title;
            $layerId = $configLayer->id;

            if ($layer->Feature && count($layer->Feature) > 0) {
                $content = array_merge(
                    $content,
                    $this->gfiVectorXmlToHtml($layerId, $layerName, $layerTitle, $layer, $configLayer, $filterFid)
                );
            }

            // Raster Popup
            if ($layer->Attribute && count($layer->Attribute) > 0) {
                $content[] = $this->gfiRasterXmlToHtml($layerId, $layerName, $layerTitle, $layer);
            }
        } // loop layers

        $content = array_reverse($content);

        return implode("\n", $content);
    }

    /**
     * gfiVectorXmlToHtml : return Vector HTML for the getFeatureInfo XML.
     *
     * @param string           $layerId
     * @param string           $layerName
     * @param string           $layerTitle
     * @param SimpleXmlElement $layer
     * @param object           $configLayer
     * @param array            $filterFid
     *
     * @return array Vector features Info in HTML format
     */
    protected function gfiVectorXmlToHtml($layerId, $layerName, $layerTitle, $layer, $configLayer, $filterFid)
    {
        $content = array();
        $popupClass = $this->appContext->getClassService('view~popup');

        // Get the template for the popup content
        $templateConfigured = false;
        if (property_exists($configLayer, 'popupTemplate')) {
            // Get template content
            $popupTemplate = (string) trim($configLayer->popupTemplate);
            // Use it if not empty
            if (!empty($popupTemplate)) {
                $templateConfigured = true;
                // first replace all "media/bla/bla/llkjk.ext" by full url
                $popupTemplate = preg_replace_callback(
                    '#(["\']){1}((\.\./)?media/.+\.\w{3,10})(["\']){1}#',
                    array($this, 'replaceMediaPathByMediaUrl'),
                    $popupTemplate
                );
                // Replace : html encoded chars to let further regexp_replace find attributes
                $popupTemplate = str_replace(array('%24', '%7B', '%7D'), array('$', '{', '}'), $popupTemplate);
            }
        }

        // Loop through the features
        $popupMaxFeatures = 10;
        if (property_exists($configLayer, 'popupMaxFeatures') && is_numeric($configLayer->popupMaxFeatures)) {
            $popupMaxFeatures = $configLayer->popupMaxFeatures + 0;
        }
        $layerFeaturesCounter = 0;
        $allFeatureAttributes = array();

        foreach ($layer->Feature as $feature) {
            $id = (string) $feature['id'];
            // Optionnally filter by feature id
            if ($filterFid
                && isset($filterFid[$configLayer->name])
                && $filterFid[$configLayer->name] != $id
            ) {
                continue;
            }

            if ($layerFeaturesCounter == $popupMaxFeatures) {
                break;
            }
            ++$layerFeaturesCounter;

            // Hidden input containing layer id and feature id
            $hiddenFeatureId = '<input type="hidden" value="'.$layerId.'.'.$id.'" class="lizmap-popup-layer-feature-id"/>'.PHP_EOL;

            $popupFeatureContent = $this->getViewTpl('view~popupDefaultContent', $layerName, $layerId, $layerTitle, array(
                'featureId' => $id,
                'attributes' => $feature->Attribute,
            ));
            $autoContent = $popupFeatureContent;

            // Get specific template for the layer has been configured
            if ($templateConfigured) {
                $popupFeatureContent = $popupTemplate;

                // then replace all column data by appropriate content
                foreach ($feature->Attribute as $attribute) {
                    // Replace #col and $col by colomn name and value
                    $popupFeatureContent = $popupClass->getHtmlFeatureAttribute(
                        $attribute['name'],
                        $attribute['value'],
                        $this->repository->getKey(),
                        $this->project->getKey(),
                        $popupFeatureContent
                    );
                }
                $lizmapContent = $popupFeatureContent;
            }

            // Use default template if needed or maptip value if defined
            // Get geometry data
            $hasGeometry = false;
            $hiddenGeometry = '';
            $maptipValue = null;

            foreach ($feature->Attribute as $attribute) {
                if ($attribute['name'] == 'maptip') {
                    // first replace all "media/bla/bla/llkjk.ext" by full url
                    $maptipValue = preg_replace_callback(
                        '#(["\']){1}((\.\./)?media/.+\.\w{3,10})(["\']){1}#',
                        array($this, 'replaceMediaPathByMediaUrl'),
                        $attribute['value']
                    );
                    // Replace : html encoded chars to let further regexp_replace find attributes
                    $maptipValue = str_replace(array('%24', '%7B', '%7D'), array('$', '{', '}'), $maptipValue);
                } elseif ($attribute['name'] == 'geometry') {
                    // Get the BoundingBox data
                    $props = array(
                        'CRS' => 'crs',
                        'minx' => 'bbox-minx',
                        'miny' => 'bbox-miny',
                        'maxx' => 'bbox-maxx',
                        'maxy' => 'bbox-maxy',
                    );
                    if ($hasGeometry && $feature->BoundingBox) {
                        $hiddenGeometry .= '<input type="hidden" value="'.$attribute['value'].'" class="lizmap-popup-layer-feature-geometry"/>'.PHP_EOL;
                        $bbox = $feature->BoundingBox[0];
                        foreach ($props as $prop => $class) {
                            $hiddenGeometry .= '<input type="hidden" value="'.$bbox[$prop].'" class="lizmap-popup-layer-feature-'.$class.'"/>'.PHP_EOL;
                        }
                    }
                }
            }

            // New option to choose the popup source : auto (=default), lizmap (=popupTemplate), qgis (=qgis maptip)
            $finalContent = $autoContent;
            if (property_exists($configLayer, 'popupSource')) {
                if ($configLayer->popupSource == 'qgis' && $maptipValue) {
                    $finalContent = $maptipValue;
                }
                if ($configLayer->popupSource == 'lizmap' && $templateConfigured) {
                    $finalContent = $lizmapContent;
                }
                if ($configLayer->popupSource == 'auto') {
                    $allFeatureAttributes[] = $feature->Attribute;
                }
            }

            $content[] = $this->getViewTpl('view~popup', $layerName, $layerId, $layerTitle, array(
                'featureId' => $id,
                'popupContent' => $hiddenFeatureId.$hiddenGeometry.$finalContent,
            ));
        } // loop features

        // Build hidden table containing all features
        if (count($allFeatureAttributes) > 0) {
            $content[] = $this->getViewTpl('view~popup_all_features_table', $layerName, $layerId, $layerTitle, array(
                'allFeatureAttributes' => array_reverse($allFeatureAttributes),
            ));
        }

        return $content;
    }

    /**
     * gfiRasterXmlToHtml : return Raster HTML for the getFeatureInfo XML.
     *
     * @param string           $layerId
     * @param string           $layerName
     * @param string           $layerTitle
     * @param SimpleXmlElement $layer
     *
     * @return array Raster feature Info in HTML format
     */
    protected function gfiRasterXmlToHtml($layerId, $layerName, $layerTitle, $layer)
    {
        $popupRasterContent = $this->getViewTpl('view~popupRasterContent', $layerName, $layerId, $layerTitle, array(
            'attributes' => $layer->Attribute,
        ));

        return $this->getViewTpl('view~popup', $layerName, $layerId, $layerTitle, array(
            'popupContent' => $popupRasterContent,
        ));
    }

    /**
     * replaceMediaPathByMediaUrl : replace all "/media/bla" in a text by the getMedia corresponding URL.
     * This method is used as callback in GetFeatureInfoHtml method for the preg_replace_callback.
     *
     * @param array $matches Array containing the preg matches
     *
     * @return string replaced text
     */
    protected function replaceMediaPathByMediaUrl($matches)
    {
        $appContext = $this->appContext;
        $req = $appContext->getCoord()->request;
        $return = '"';
        $return .= $appContext->getFullUrl(
            'view~media:getMedia',
            array(
                'repository' => $this->repository->getKey(),
                'project' => $this->project->getKey(),
                'path' => $matches[2],
            ),
            0,
            $req->getDomainName().$req->getPort()
        );
        $return .= '"';

        return $return;
    }

    /**
     * gfiGmlToHtml : return HTML for the getFeatureInfo GML.
     *
     * @param string $gmldata     GML data from getFeatureInfo
     * @param object $configLayer
     *
     * @return string feature Info in HTML format
     */
    protected function gfiGmlToHtml($gmldata, $configLayer)
    {
        $xml = $this->loadXmlString($gmldata, 'GetFeatureInfoHtml');

        if (!$xml || count($xml->children()) == 0) {
            return '';
        }

        $layerstring = $configLayer->name.'_layer';
        if (!property_exists($xml, $layerstring)) {
            return '';
        }
        $xmlLayer = $xml->{$layerstring};

        $featurestring = $configLayer->name.'_feature';
        if (!property_exists($xmlLayer, $featurestring)) {
            return '';
        }
        $xmlFeature = $xmlLayer->{$featurestring};

        if (count($xmlFeature->children())) {
            return '';
        }

        // Create HTML response
        $layerTitle = $configLayer->title;

        $HTMLResponse = "<h4>${layerTitle}</h4><div class='lizmapPopupDiv'><table class='lizmapPopupTable'>";

        foreach ($xmlFeature->children() as $key => $value) {
            $HTMLResponse .= "<tr><td>${key}&nbsp;:&nbsp;</td><td>${value}</td></tr>";
        }
        $HTMLResponse .= '</table></div>';

        return $HTMLResponse;
    }

    protected function getVProfileInfos($configLayer, $repository, $project)
    {
        // Set or get tile from the parent project in case of embedded layers
        if ($configLayer
            && property_exists($configLayer, 'sourceRepository')
            && $configLayer->sourceRepository != ''
            && property_exists($configLayer, 'sourceProject')
            && $configLayer->sourceProject != ''
        ) {
            $newRepository = (string) $configLayer->sourceRepository;
            $newProject = (string) $configLayer->sourceProject;
            $repository = $newRepository;
            $project = $newProject;
            $lrep = \lizmap::getRepository($repository);
            if (!$lrep) {
                \jMessage::add('The repository '.strtoupper($repository).' does not exist !', 'RepositoryNotDefined');

                return array('error', 'text/plain');
            }

            try {
                $lproj = \lizmap::getProject($repository.'~'.$project);
                if (!$lproj) {
                    \jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

                    return array('error', 'text/plain');
                }
            } catch (\Lizmap\Project\UnknownLizmapProjectException $e) {
                \jLog::logEx($e, 'error');
                \jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

                return array('error', 'text/plain');
            }
        }

        return array($repository, $project);
    }

    protected function useCache($configLayer, $params, $profile)
    {
        // Has the user asked for cache for this layer ?
        $wmsClient = 'web';
        $useCache = false;
        if ($configLayer) {
            $useCache = strtolower($configLayer->cached) == 'true';
        }
        // Avoid using cache for requests concerning not square tiles or too big
        // Focus on real web square tiles
        if ($useCache
            && $params['width'] != $params['height']
            && ($params['width'] > 300 || $params['height'] > 300)
        ) {
            $wmsClient = 'gis';
            $useCache = false;
        }

        // Get the cache Driver, to be sure that we can use the configured cache
        if ($useCache) {
            try {
                $drv = $this->appContext->getCacheDriver($profile);
                if (!$drv) {
                    $useCache = false;
                }
            } catch (\Exception $e) {
                \jLog::logEx($e, 'error');
                $useCache = false;
            }
        }

        return array($useCache, $wmsClient);
    }

    public function getTileCache($params, $profile, $useCache, $forced, $debug)
    {
        // Get cache if exists
        $keyParams = $params;
        // Remove keys not necessary for cache
        if (array_key_exists('map', $keyParams)) {
            unset($keyParams['map']);
        }
        if (array_key_exists('lizmap_user', $keyParams)) {
            unset($keyParams['lizmap_user']);
        }
        if (array_key_exists('lizmap_user_groups', $keyParams)) {
            unset($keyParams['lizmap_user_groups']);
        }
        if (array_key_exists('lizmap_override_filter', $keyParams)) {
            unset($keyParams['lizmap_override_filter']);
        }
        ksort($keyParams);
        $key = md5(serialize($keyParams));
        if ($useCache && !$forced) {
            try {
                $tile = $this->appContext->getCache($key, $profile);
            } catch (\Exception $e) {
                \jLog::logEx($e, 'error');
                $tile = false;
            }
            if ($tile) {
                $_SESSION['LIZMAP_GETMAP_CACHE_STATUS'] = 'read';
                $mime = 'image/jpeg';
                if (preg_match('#png#', $params['format'])) {
                    $mime = 'image/png';
                }

                if ($debug) {
                    \lizmap::logMetric('LIZMAP_PROXY_HIT_CACHE');
                }

                return array($tile, $mime, 200, true);
            }
        }

        return $key;
    }

    protected function getMetaTileData($params, $metatileSize)
    {
        $metatileBuffer = 5;
        // Metatile Size
        $metatileSizeExp = explode(',', $metatileSize);
        $metatileSizeX = (int) $metatileSizeExp[0];
        $metatileSizeY = (int) $metatileSizeExp[1];

        // Get requested bbox
        $bboxExp = explode(',', $params['bbox']);
        $width = $bboxExp[2] - $bboxExp[0];
        $height = $bboxExp[3] - $bboxExp[1];
        // Calculate factors
        $xFactor = (int) ($metatileSizeX / 2);
        $yFactor = (int) ($metatileSizeY / 2);
        // Calculate the new bbox
        $xmin = $bboxExp[0] - $xFactor * $width - $metatileBuffer * $width / $params['width'];
        $ymin = $bboxExp[1] - $yFactor * $height - $metatileBuffer * $height / $params['height'];
        $xmax = $bboxExp[2] + $xFactor * $width + $metatileBuffer * $width / $params['width'];
        $ymax = $bboxExp[3] + $yFactor * $height + $metatileBuffer * $height / $params['height'];
        // Replace request bbox by metatile bbox
        $params['bbox'] = "${xmin},${ymin},${xmax},${ymax}";

        // Keep original param value
        $originalParams = array('width' => $params['width'], 'height' => $params['height']);
        // Replace width and height before requesting the image from qgis
        $params['width'] = $metatileSizeX * $params['width'] + 2 * $metatileBuffer;
        $params['height'] = $metatileSizeY * $params['height'] + 2 * $metatileBuffer;

        return array($params, $originalParams, $xFactor, $yFactor);
    }

    protected function getImageData($data, $params, $originalParams, $xFactor, $yFactor, $debug)
    {
        $metatileBuffer = 5;
        // Save original content into an image var
        $original = imagecreatefromstring($data);

        // crop parameters
        $newWidth = (int) ($originalParams['width']); // px
        $newHeight = (int) ($originalParams['height']); // px
        $positionX = (int) ($xFactor * $originalParams['width']) + $metatileBuffer; // left translation of 30px
        $positionY = (int) ($yFactor * $originalParams['height']) + $metatileBuffer; // top translation of 20px

        // create new gd image
        $image = imagecreatetruecolor($newWidth, $newHeight);

        // save transparency if needed
        if (preg_match('#png#', $params['format'])) {
            imagesavealpha($original, true);
            imagealphablending($image, false);
            $color = imagecolortransparent($image, imagecolorallocatealpha($image, 0, 0, 0, 127));
            imagefill($image, 0, 0, $color);
            imagesavealpha($image, true);
        }

        // crop image
        imagecopyresampled($image, $original, 0, 0, $positionX, $positionY, $newWidth, $newHeight, $newWidth, $newHeight);

        // Output the image as a string (use PHP buffering)
        ob_start();
        if (preg_match('#png#', $params['format'])) {
            imagepng($image, null, 9);
        } else {
            imagejpeg($image, null, 90);
        }
        $data = ob_get_contents(); // read from buffer
        ob_end_clean(); // delete buffer

        // Destroy image handlers
        imagedestroy($original);
        imagedestroy($image);

        if ($debug) {
            \lizmap::logMetric('LIZMAP_PROXY_CROP_METATILE');
        }

        return $data;
    }

    /**
     * Get data from map service or from the cache.
     *
     * @param lizmapProject $project the project
     * @param array         $params  array of parameters
     * @param mixed         $forced
     *
     * @return array $data normalized and filtered array
     */
    protected function getMapData($project, $params, $forced = false)
    {
        $layers = str_replace(',', '_', $params['layers']);
        $crs = preg_replace('#[^a-zA-Z0-9_]#', '_', $params['crs']);

        // Get repository data
        $lrep = $project->getRepository();
        $lproj = $project;
        $project = $lproj->getKey();
        $repository = $lrep->getKey();

        // Change to true to put some information in debug files
        $debug = $this->services->debugMode;

        // Read config file for the current project
        $layername = $params['layers'];
        $configLayers = $lproj->getLayers();
        $configLayer = null;
        if (property_exists($configLayers, $layername)) {
            $configLayer = $configLayers->{$layername};
        }

        list($repository, $project) = $this->getVProfileInfos($configLayer, $repository, $project);

        if ($repository === 'error') {
            return array('error', 'text/plain', '404', false);
        }

        // Get tile cache virtual profile (tile storage)
        // And get tile if already in cache
        // --> must be done after checking that parent project is involved
        $profile = Proxy::createVirtualProfile($repository, $project, $layers, $crs);

        if ($debug) {
            \lizmap::logMetric('LIZMAP_PROXY_READ_LAYER_CONFIG');
        }

        list($useCache, $wmsClient) = $this->useCache($configLayer, $params, $profile);
        // Get cache if exists

        $key = $this->getTileCache($params, $profile, $useCache, $forced, $debug);
        if (is_array($key)) {
            return $key;
        }

        // ***************************
        // No cache hit : need to ask the tile from QGIS Server
        // ***************************
        // Add project path into map parameter
        $params['map'] = $lproj->getRelativeQgisPath();

        // Metatile : if needed, change the bbox
        // Avoid metatiling when the cache is not active for the layer
        $metatileSize = '1,1';
        if ($configLayer and property_exists($configLayer, 'metatileSize')) {
            if (preg_match('#^[3579],[3579]$#', $configLayer->metatileSize)) {
                $metatileSize = $configLayer->metatileSize;
            }
        }

        // Also checks if gd is installed
        if ($metatileSize && $useCache && $wmsClient == 'web'
            && extension_loaded('gd') && function_exists('gd_info')) {
            list($params, $originalParams, $xFactor, $yFactor) = $this->getMetaTileData($params, $metatileSize);
        }

        // Get data from the map server
        list($data, $mime, $code) = Proxy::getRemoteData(
            Proxy::constructUrl($params, $this->services)
        );

        if ($debug) {
            \lizmap::logMetric('LIZMAP_PROXY_REQUEST_QGIS_MAP');
        }

        if ($useCache && !preg_match('/^image/', $mime)) {
            $useCache = false;
        }

        // Metatile : if needed, crop the metatile into a single tile
        // Also checks if gd is installed
        if ($metatileSize && $useCache && $wmsClient == 'web'
            && extension_loaded('gd') && function_exists('gd_info')
        ) {
            $data = $this->getImageData($data, $params, $originalParams, $xFactor, $yFactor, $debug);
        }

        $_SESSION['LIZMAP_GETMAP_CACHE_STATUS'] = 'off';

        // Store into cache if needed
        $cached = false;
        if ($useCache) {
            //~ \jLog::log( ' Store into cache');
            $cacheExpiration = (int) $this->services->cacheExpiration;
            if (property_exists($configLayer, 'cacheExpiration')) {
                $cacheExpiration = (int) $configLayer->cacheExpiration;
            }

            try {
                $this->appContext->setCache($key, $data, $cacheExpiration, $profile);
                $_SESSION['LIZMAP_GETMAP_CACHE_STATUS'] = 'write';
                $cached = true;

                if ($debug) {
                    \lizmap::logMetric('LIZMAP_PROXY_WRITE_CACHE');
                }
            } catch (\Exception $e) {
                \jLog::logEx($e, 'error');
                $cached = false;
            }
        }

        return array($data, $mime, $code, $cached);
    }
}
