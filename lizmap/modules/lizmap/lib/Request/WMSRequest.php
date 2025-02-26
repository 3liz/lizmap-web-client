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

use Lizmap\Project\Project;
use Lizmap\Project\UnknownLizmapProjectException;

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
        $wmsRequest = strtolower($this->param('request'));
        if (!in_array($wmsRequest, array('getmap', 'getfeatureinfo', 'getprint', 'getprintatlas'))) {
            return $params;
        }

        // No filter data by login rights
        if ($this->appContext->aclCheck('lizmap.tools.loginFilteredLayers.override', $this->repository->getKey())) {
            return $params;
        }

        // filter data by login
        $layers = $this->param('layers');

        // 'getprintatlas' request has param 'layer' and not 'layers'
        if ($wmsRequest == 'getprintatlas') {
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
        $clientFilter = $this->param('filter', '');
        if (!empty($clientFilter)) {
            $cfexp = explode(';', $clientFilter);
            foreach ($cfexp as $a) {
                $b = explode(':', $a);
                $lname = trim($b[0]);
                $lfilter = trim($b[1]);
                if (array_key_exists($lname, $loginFilters)) {
                    $loginFilters[$lname]['filter'] .= ' AND ( '.$lfilter.' )';
                } else {
                    $loginFilters[$lname] = array('filter' => '( '.$lfilter.' )', 'layername' => $lname);
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
     * @return OGCResponse
     *
     * @see https://en.wikipedia.org/wiki/Web_Map_Service#Requests.
     */
    protected function process_getcapabilities()
    {
        $version = $this->param('version');
        // force version if noy defined
        if (!$version) {
            $this->params['version'] = '1.3.0';
        }
        $result = parent::process_getcapabilities();

        $data = $result->data;
        if (empty($data) or floor($result->code / 100) >= 4) {
            if (empty($data)) {
                \jLog::log('Error in project '.$this->repository->getKey().'/'.$this->project->getKey().': GetCapabilities empty data', 'lizmapadmin');
            } else {
                \jLog::log('Error in project '.$this->repository->getKey().'/'.$this->project->getKey().': GetCapabilities result code: '.$result->code, 'lizmapadmin');
            }
            \jMessage::add('Server Error !', 'Error');

            return $this->serviceException();
        }

        if (preg_match('#ServiceExceptionReport#i', $data)) {
            return $result;
        }

        // Remove no interoperable elements
        $data = preg_replace('@<GetPrint[^>]*?>.*?</GetPrint>@si', '', $data);
        $data = preg_replace('@<ComposerTemplates[^>]*?>.*?</ComposerTemplates>@si', '', $data);

        // Replace qgis server url in the XML (hide real location)

        if (preg_match('@WMS_Capabilities@i', $data)) {
            // Update namespace and add VERSION to GetSchemaExtension request
            $schemaLocation = 'http://www.opengis.net/wms';
            $schemaLocation .= ' http://schemas.opengis.net/wms/1.3.0/capabilities_1_3_0.xsd';
            $schemaLocation .= ' http://www.opengis.net/sld';
            $schemaLocation .= ' http://schemas.opengis.net/sld/1.1.0/sld_capabilities.xsd';
            $schemaLocation .= ' http://www.qgis.org/wms';

            $sUrl = \jUrl::getFull(
                'lizmap~service:index',
                array('repository' => $this->repository->getKey(), 'project' => $this->project->getKey())
            );
            $sUrl = str_replace('&', '&amp;', $sUrl).'&amp;';
            $schemaLocation .= ' '.$sUrl.'SERVICE=WMS&amp;VERSION=1.3.0&amp;REQUEST=GetSchemaExtension';

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

        // INSERT MaxWidth and MaxHeight
        $dimensions = array('Width', 'Height');
        foreach ($dimensions as $d) {
            if (!preg_match('@Service>.*?Max'.$d.'.*?</Service@si', $data)) {
                $matches = array();
                if (preg_match('@Service>(.*?)</Service@si', $data, $matches)) {
                    $sUpdate = $matches[1].'<Max'.$d.'>3000</Max'.$d.">\n ";
                    $data = str_replace($matches[1], $sUpdate, $data);
                }
            }
        }

        return new OGCResponse($result->code, $result->mime, $data, $result->cached);
    }

    /**
     * @return OGCResponse
     */
    protected function process_getcontext()
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

        return new OGCResponse($response->code, $response->mime, $data, $response->cached);
    }

    /**
     * @return OGCResponse
     */
    protected function process_getschemaextension()
    {
        $data = '<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://www.w3.org/2001/XMLSchema" xmlns:wms="http://www.opengis.net/wms" xmlns:qgs="http://www.qgis.org/wms" targetNamespace="http://www.qgis.org/wms" elementFormDefault="qualified" version="1.0.0">
  <import namespace="http://www.opengis.net/wms" schemaLocation="http://schemas.opengis.net/wms/1.3.0/capabilities_1_3_0.xsd"/>
  <element name="GetPrint" type="wms:OperationType" substitutionGroup="wms:_ExtendedOperation" />
  <element name="GetPrintAtlas" type="wms:OperationType" substitutionGroup="wms:_ExtendedOperation" />
  <element name="GetStyles" type="wms:OperationType" substitutionGroup="wms:_ExtendedOperation" />
</schema>';

        return new OGCResponse(200, 'text/xml', $data);
    }

    /**
     * @return OGCResponse
     *
     * @see https://en.wikipedia.org/wiki/Web_Map_Service#Requests.
     */
    protected function process_getmap()
    {
        if (!$this->checkMaximumWidthHeight()) {
            \jMessage::add('The requested map size is too large', 'Size error');

            return $this->serviceException();
        }

        return $this->getMapData($this->project, $this->parameters(), $this->forceRequest);
    }

    /**
     * Check wether the height and width values are valid.
     *
     * @return bool
     */
    protected function checkMaximumWidthHeight()
    {
        $max = $this->project->getWMSMaxWidth();
        if (!$max) {
            $max = $this->services->wmsMaxWidth ?: 3000;
        }
        $dim = $this->param('width');
        if ($dim == null || !is_numeric($dim) || intval($dim) > $max) {
            return false;
        }

        $max = $this->project->getWMSMaxHeight();
        if (!$max) {
            $max = $this->services->wmsMaxHeight ?: 3000;
        }
        $dim = $this->param('height');
        if ($dim == null || !is_numeric($dim) || intval($dim) > $max) {
            return false;
        }

        return true;
    }

    /**
     * @return OGCResponse
     *
     * @see https://en.wikipedia.org/wiki/Web_Map_Service#Requests.
     */
    protected function process_getlegendgraphics()
    {
        // The right request name is GetLegendGraphic not GetLegendGraphics
        $this->params['request'] = 'getlegendgraphic';

        return $this->process_getlegendgraphic();
    }

    protected function process_getlegendgraphic()
    {
        $layers = $this->param('layers', $this->param('layer', ''));
        $layers = explode(',', $layers);
        if (count($layers) == 1) {
            $lName = $layers[0];
            $layer = $this->project->findLayerByAnyName($lName);
            if ($layer && property_exists($layer, 'showFeatureCount') && $layer->showFeatureCount == 'True') {
                $this->params['showFeatureCount'] = 'True';
            }
        }
        if ($this->param('format') == 'application/json') {
            if ($this->param('force_qgis', '') == '1') {
                // check if we want to get the QGIS version to make tests
                return $this->request(true);
            }
            // The root response
            $legends = array(
                'nodes' => array(),
                'title' => '',
            );
            // If only one layer do not change the request
            if (count($layers) == 1) {
                $result = $this->request(true);
                if ($result->code == 200) {
                    $layer = $this->project->findLayerByAnyName($lName);
                    $nodes = json_decode($result->data)->nodes;
                    if (!$nodes) {
                        return $result;
                    }
                    // Rework nodes
                    if ($layer->groupAsLayer == 'True' | $layer->type == 'group') {
                        // Create a dedicated node for group
                        $legends['nodes'] = array(array(
                            'nodes' => $nodes,
                            'type' => 'group',
                            'name' => $lName,
                            'title' => $layer->title ? $layer->title : $layer->name,
                            'layerName' => $layer->name,
                        ));
                    } else {
                        // Add name to the layer node
                        $node = $nodes[0];
                        $node->name = $lName;
                        $node->layerName = $layer->name;
                        $legends['nodes'][] = $node;
                    }

                    return new OGCResponse(200, 'application/json', json_encode($legends));
                }

                return $result;
            }
            // Else split the request into 1 request per layer
            $styles = $this->param('styles', $this->param('style', ''));
            $styles = explode(',', $styles);
            // Check styles is well defined
            if (count($styles) != 1 && count($styles) != count($layers)) {
                // if the number of styles and layers is not the same
                // add empty string in styles
                foreach ($layers as $idx => $lName) {
                    if ($idx + 1 <= count($layers)) {
                        continue;
                    }
                    $styles[] = '';
                }
            }

            // Prepare parameters
            $singleLayerParams = array_merge(array(), $this->params);
            if (array_key_exists('layers', $singleLayerParams)) {
                unset($singleLayerParams['layers']);
            }
            if (array_key_exists('layer', $singleLayerParams)) {
                unset($singleLayerParams['layer']);
            }
            if (array_key_exists('styles', $singleLayerParams)) {
                unset($singleLayerParams['styles']);
            }
            if (array_key_exists('style', $singleLayerParams)) {
                unset($singleLayerParams['style']);
            }

            // The order in the response is the reverse of the parameters
            $layers = array_reverse($layers);
            $styles = array_reverse($styles);

            // Loop through layers
            foreach ($layers as $idx => $lName) {
                $style = $styles[$idx];
                $singleLayerParams['layer'] = $lName;
                $singleLayerParams['styles'] = $style;

                // Perform the request
                $singleRequest = Proxy::build($this->project, $singleLayerParams);
                $result = $singleRequest->process();
                if ($result->code != 200) {
                    // The request failed
                    // return the result
                    return $result;
                }
                $nodes = json_decode($result->data)->nodes;
                if ($nodes) {
                    $legends['nodes'][] = $nodes[0];
                }
            }

            return new OGCResponse(200, 'application/json', json_encode($legends));
        }

        // Get remote data
        return $this->request(true);
    }

    /**
     * @return OGCResponse
     *
     * @see https://en.wikipedia.org/wiki/Web_Map_Service#Requests.
     */
    protected function process_getfeatureinfo()
    {
        $queryLayers = $this->param('query_layers');
        // QUERY_LAYERS is mandatory
        if (!$queryLayers) {
            \jMessage::add('The QUERY_LAYERS parameter is missing.', 'MissingParameterValue');

            return $this->serviceException();
        }

        // We split layers in two groups. First contains external WMS, second contains QGIS layers
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
            list($data, $mime, $code) = Proxy::getRemoteData($querystring);

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
        // Starting from LWC 3.9, we need to request the maptip with Bootstrap 5
        // TODO, remove later when the lizmapWebClientTargetVersion=30800 because all projects will be migrated.
        $this->params['CSS_FRAMEWORK'] = 'BOOTSTRAP5';

        // Get remote data
        $response = $this->request(true);
        $code = $response->code;
        $mime = $response->mime;
        $data = $response->data;

        // Get HTML content if needed
        if ($toHtml and preg_match('#/xml#', $mime)) {
            $rep .= $this->gfiXmlToHtml($data);
            $mime = 'text/html';
        } else {
            $rep .= $data;
        }

        return new OGCResponse($code, $mime, $rep, $response->cached);
    }

    /**
     * @return OGCResponse
     */
    protected function process_getprint()
    {
        // Get remote data
        return $this->request(true);
    }

    /**
     * @return OGCResponse
     */
    protected function process_getprintatlas()
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
        return $this->request(true);
    }

    /**
     * @return OGCResponse
     *
     * @see https://en.wikipedia.org/wiki/Web_Map_Service#Requests.
     */
    protected function process_getstyles()
    {

        // Get remote data
        return $this->request(true);
    }

    /**
     * @param mixed $tplName
     * @param mixed $layerName
     * @param mixed $layerId
     * @param mixed $layerTitle
     * @param mixed $params
     *
     * @return string
     */
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
     * @param string $xmlData XML data from getFeatureInfo
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
     * @param string            $layerId
     * @param string            $layerName
     * @param string            $layerTitle
     * @param \SimpleXmlElement $layer
     * @param object            $configLayer
     * @param array             $filterFid
     *
     * @return array Vector features Info in HTML format
     */
    protected function gfiVectorXmlToHtml($layerId, $layerName, $layerTitle, $layer, $configLayer, $filterFid)
    {
        $content = array();
        $popupClass = $this->appContext->getClassService('view~popup');

        $remoteStorageProfile = RemoteStorageRequest::getProfile('webdav');

        // Get the template for the popup content
        $templateConfigured = false;
        $popupTemplate = '';
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

                // replace webdav url, if any
                if ($remoteStorageProfile) {
                    $popupTemplate = $this->replaceWebDavPathByMediaUrl($popupTemplate, $remoteStorageProfile['baseUri']);
                }
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
        $allFeatureToolbars = array();

        foreach ($layer->Feature as $feature) {
            $id = (string) $feature['id'];
            // Optionally filter by feature id
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
            // TODO Deprecated, it will be removed later
            // Use data-attributes in the parent div instead
            $hiddenFeatureId = '<input type="hidden" value="'.$layerId.'.'.$id.'" class="lizmap-popup-layer-feature-id"/>'.PHP_EOL;

            $popupFeatureContent = $this->getViewTpl('view~popupDefaultContent', $layerName, $layerId, $layerTitle, array(
                'featureId' => $id,
                'attributes' => $feature->Attribute,
                'remoteStorageProfile' => $remoteStorageProfile,
            ));
            $autoContent = $popupFeatureContent;
            // Get specific template for the layer has been configured
            $lizmapContent = '';
            if ($templateConfigured) {
                $popupFeatureContent = $popupTemplate;

                // then replace all column data by appropriate content
                foreach ($feature->Attribute as $attribute) {
                    // Replace #col and $col by column name and value
                    $popupFeatureContent = $popupClass->getHtmlFeatureAttribute(
                        $attribute['name'],
                        $attribute['value'],
                        $this->repository->getKey(),
                        $this->project->getKey(),
                        $popupFeatureContent,
                        $remoteStorageProfile
                    );
                }
                $lizmapContent = $popupFeatureContent;
            }

            // Use default template if needed or maptip value if defined
            // Get geometry data
            $hiddenGeometry = '';
            $featureToolbarExtent = '';
            $maptipValue = null;

            foreach ($feature->Attribute as $attribute) {
                if ($attribute['name'] == 'maptip') {
                    // first replace all "media/bla/bla/llkjk.ext" by full url
                    $maptipValue = preg_replace_callback(
                        '#(["\']){1}((\.\./)?media/.+\.\w{3,10})(["\']){1}#',
                        array($this, 'replaceMediaPathByMediaUrl'),
                        $attribute['value']
                    );

                    if ($remoteStorageProfile) {
                        $maptipValue = $this->replaceWebDavPathByMediaUrl($maptipValue, $remoteStorageProfile['baseUri']);
                    }
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
                    if ($feature->BoundingBox) {
                        // Fix geometry by adding space between geometry type and Z, M or ZM
                        $geom = \lizmapWkt::fix($attribute['value']);
                        // Insert geometry as an hidden input
                        $hiddenGeometry .= '<input type="hidden" value="'.$geom.'" class="lizmap-popup-layer-feature-geometry"/>'.PHP_EOL;
                        // Insert bounding box data as hidden inputs
                        $bbox = $feature->BoundingBox[0];
                        foreach ($props as $prop => $class) {
                            $hiddenGeometry .= '<input type="hidden" value="'.$bbox[$prop].'" class="lizmap-popup-layer-feature-'.$class.'"/>'.PHP_EOL;
                            $featureToolbarExtent .= $class.'="'.$bbox[$prop].'" ';
                        }
                    }
                }
            }

            // Feature toolbar
            // edition can be restricted on current feature
            $qgisLayer = $this->project->getLayer($layerId);

            // get wfs name
            /** @var \qgisVectorLayer $qgisLayer */
            $typename = $qgisLayer->getWfsTypeName();

            // additional WFS parameter for features filtering
            $wfsParams = array(
                'FEATUREID' => $typename.'.'.$id,
            );

            $editableFeatures = $qgisLayer->editableFeatures($wfsParams);
            $editionRestricted = '';
            if (array_key_exists('status', $editableFeatures) && $editableFeatures['status'] === 'restricted') {
                $editionRestricted = 'edition-restricted="true"';
                foreach ($editableFeatures['features'] as $editableFeature) {
                    $pKeyValue = explode('.', $editableFeature->id)[1];
                    if ($pKeyValue == $id) {
                        $editionRestricted = 'edition-restricted="false"';

                        break;
                    }
                }
            }
            $featureToolbar = '<lizmap-feature-toolbar '.$editionRestricted.' value="'.$layerId.'.'.$id.'" '.$featureToolbarExtent.'></lizmap-feature-toolbar>'.PHP_EOL;

            // New option to choose the popup source : auto (=default), lizmap (=popupTemplate), qgis (=qgis maptip)
            $finalContent = $autoContent;
            if (property_exists($configLayer, 'popupSource')) {
                if (in_array($configLayer->popupSource, array('qgis', 'form')) && $maptipValue) {
                    $finalContent = $maptipValue;
                }
                if ($configLayer->popupSource == 'lizmap' && $templateConfigured) {
                    $finalContent = $lizmapContent;
                }
                if ($configLayer->popupSource == 'auto') {
                    $allFeatureAttributes[] = $feature->Attribute;
                    $allFeatureToolbars[] = $featureToolbar;
                }
            }

            $content[] = $this->getViewTpl('view~popup', $layerName, $layerId, $layerTitle, array(
                'featureId' => $id,
                'popupContent' => $hiddenFeatureId.$hiddenGeometry.$featureToolbar.$finalContent,
            ));
        } // loop features

        // Build hidden table containing all features when there are more than one
        if (count($allFeatureAttributes) > 1) {
            $content[] = $this->getViewTpl('view~popup_all_features_table', $layerName, $layerId, $layerTitle, array(
                'allFeatureAttributes' => array_reverse($allFeatureAttributes),
                'remoteStorageProfile' => $remoteStorageProfile,
                'allFeatureToolbars' => array_reverse($allFeatureToolbars),
            ));
        }

        return $content;
    }

    /**
     * gfiRasterXmlToHtml : return Raster HTML for the getFeatureInfo XML.
     *
     * @param string            $layerId
     * @param string            $layerName
     * @param string            $layerTitle
     * @param \SimpleXmlElement $layer
     *
     * @return string Raster feature Info in HTML format
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
            )
        );
        $return .= '"';

        return $return;
    }

    /**
     * replaceWebDavPathByMediaUrl : replace all webdav remote url to corresponding path for getMedia endpoint.
     *
     * @param string $template         The string to search on
     * @param string $remoteStorageUri The remote baseUri to replace
     *
     * @return string replaced text
     */
    protected function replaceWebDavPathByMediaUrl($template, $remoteStorageUri)
    {
        return preg_replace_callback(
            '#(["\']){1}('.$remoteStorageUri.'){1}(.*?)(["\'])#',
            function ($matches) use ($remoteStorageUri) {
                $appContext = $this->appContext;

                $replaced = preg_replace('#'.$remoteStorageUri.'#', RemoteStorageRequest::$davUrlRootPrefix, $matches[0]);
                $return = '"';
                $return .= $appContext->getFullUrl(
                    'view~media:getMedia',
                    array(
                        'repository' => $this->repository->getKey(),
                        'project' => $this->project->getKey(),
                        'path' => preg_replace('#(["\'])#', '', $replaced),
                    )
                );
                $return .= '"';

                return $return;
            },
            $template
        );
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

        $HTMLResponse = "<h4>{$layerTitle}</h4><div class='lizmapPopupDiv'><table class='lizmapPopupTable'>";

        foreach ($xmlFeature->children() as $key => $value) {
            $HTMLResponse .= "<tr><td>{$key}&nbsp;:&nbsp;</td><td>{$value}</td></tr>";
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
                    \jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

                    return array('error', 'text/plain');
                }
            } catch (UnknownLizmapProjectException $e) {
                \jLog::logEx($e, 'error');
                \jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

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

    /**
     * @param array  $params
     * @param string $profile
     * @param bool   $useCache
     * @param bool   $forced
     * @param false  $debug    deprecated
     *
     * @return array|string
     */
    public function getTileCache($params, $profile, $useCache, $forced, $debug = false)
    {
        // Get cache if exists
        $keyParams = $params;
        // Remove keys not necessary for cache
        // MAP parameter has been normalized
        // The user lizmap parameters has not been normalized OGCRequest.php#L92
        if (array_key_exists('map', $keyParams)) {
            unset($keyParams['map']);
        }
        if (array_key_exists('Lizmap_User', $keyParams)) {
            unset($keyParams['Lizmap_User']);
        }
        if (array_key_exists('Lizmap_User_Groups', $keyParams)) {
            unset($keyParams['Lizmap_User_Groups']);
        }
        if (array_key_exists('Lizmap_Override_Filter', $keyParams)) {
            unset($keyParams['Lizmap_Override_Filter']);
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
                $mime = 'image/jpeg';
                if (preg_match('#png#', $params['format'])) {
                    $mime = 'image/png';
                }

                \lizmap::logMetric('LIZMAP_PROXY_HIT_CACHE', 'WMS', array(
                    'qgisParams' => $params,
                ));

                return array($tile, $mime, 200, true);
            }
        }

        return $key;
    }

    /**
     * @param array  $params
     * @param string $metatileSize
     *
     * @return array(array $params, array $originalParams, int $xFactor, int $yFactor)
     */
    protected function getMetaTileData($params, $metatileSize)
    {
        $metatileBuffer = 5;
        // Metatile Size
        $metatileSizeExp = explode(',', $metatileSize);
        $metatileSizeX = (int) $metatileSizeExp[0];
        $metatileSizeY = (int) $metatileSizeExp[1];

        // Get requested bbox
        $bboxExp = explode(',', $params['bbox']);
        $bbox0 = (float) $bboxExp[0];
        $bbox1 = (float) $bboxExp[1];
        $bbox2 = (float) $bboxExp[2];
        $bbox3 = (float) $bboxExp[3];
        $width = $bbox2 - $bbox0;
        $height = $bbox3 - $bbox1;
        // Calculate factors
        $xFactor = (int) ($metatileSizeX / 2);
        $yFactor = (int) ($metatileSizeY / 2);
        // Calculate the new bbox
        $param_width = (int) $params['width'];
        $param_height = (int) $params['height'];
        $xmin = $bbox0 - $xFactor * $width - $metatileBuffer * $width / $param_width;
        $ymin = $bbox1 - $yFactor * $height - $metatileBuffer * $height / $param_height;
        $xmax = $bbox2 + $xFactor * $width + $metatileBuffer * $width / $param_width;
        $ymax = $bbox3 + $yFactor * $height + $metatileBuffer * $height / $param_height;
        // Replace request bbox by metatile bbox
        $params['bbox'] = "{$xmin},{$ymin},{$xmax},{$ymax}";

        // Keep original param value
        $originalParams = array('width' => $param_width, 'height' => $param_height);
        // Replace width and height before requesting the image from qgis
        $params['width'] = $metatileSizeX * $param_width + 2 * $metatileBuffer;
        $params['height'] = $metatileSizeY * $param_height + 2 * $metatileBuffer;

        return array($params, $originalParams, $xFactor, $yFactor);
    }

    /**
     * @param string $data           string data of the original image
     * @param array  $params         array
     * @param array  $originalParams array
     * @param float  $xFactor        int
     * @param float  $yFactor        int
     * @param false  $debug          bool deprecated
     *
     * @return false|string content of the image
     */
    protected function getImageData($data, $params, $originalParams, $xFactor, $yFactor, $debug = false)
    {
        $metatileBuffer = 5;
        // Save original content into an image var
        $original = imagecreatefromstring($data);

        // crop parameters
        $newWidth = (int) $originalParams['width']; // px
        $newHeight = (int) $originalParams['height']; // px
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

        \lizmap::logMetric('LIZMAP_PROXY_CROP_METATILE', 'WMS', array(
            'qgisParams' => $params,
        ));

        return $data;
    }

    /**
     * Get data from map service or from the cache.
     *
     * @param Project $project the project
     * @param array   $params  array of parameters
     * @param mixed   $forced
     *
     * @return OGCResponse normalized and filtered response
     */
    protected function getMapData($project, $params, $forced = false)
    {
        $layers = str_replace(',', '_', $params['layers']);
        // The CRS value is provided by the SRS parameter or the CRS parameter for VERSION 1.3.0
        $crs = null;
        if (version_compare($params['version'], '1.3.0') >= 0 && array_key_exists('crs', $params)) {
            $crs = $params['crs'];
        } elseif (array_key_exists('srs', $params)) {
            $crs = $params['srs'];
        }
        if (!$crs) {
            // SRS or CRS is mandatory
            if (version_compare($params['version'], '1.3.0') >= 0) {
                \jMessage::add('The CRS parameter is missing.', 'MissingParameterValue');
            } else {
                \jMessage::add('The SRS parameter is missing.', 'MissingParameterValue');
            }

            return $this->serviceException();
        }
        $crs = preg_replace('#[^a-zA-Z0-9_]#', '_', $crs);

        // Get repository data
        $lrep = $project->getRepository();
        $lproj = $project;
        $project = $lproj->getKey();
        $repository = $lrep->getKey();

        // Read config file for the current project
        $layername = $params['layers'];
        $configLayer = $lproj->findLayerByAnyName($layername);

        list($repository, $project) = $this->getVProfileInfos($configLayer, $repository, $project);

        if ($repository === 'error') {
            return new OGCResponse(404, 'text/plain', 'error', false);
        }

        // Get tile cache virtual profile (tile storage)
        // And get tile if already in cache
        // --> must be done after checking that parent project is involved
        $profile = Proxy::createVirtualProfile($repository, $project, $layers, $crs);

        \lizmap::logMetric('LIZMAP_PROXY_READ_LAYER_CONFIG', 'WMS', array(
            'qgisParams' => $params,
        ));

        list($useCache, $wmsClient) = $this->useCache($configLayer, $params, $profile);

        // Get cache if exists
        $key = $this->getTileCache($params, $profile, $useCache, $forced);
        if (is_array($key)) {
            return new OGCResponse($key[2], $key[1], $key[0], $key[3]);
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
        $originalParams = array();
        $xFactor = -1;
        $yFactor = -1;
        if ($metatileSize && $useCache && $wmsClient == 'web'
            && extension_loaded('gd') && function_exists('gd_info')
        ) {
            list($params, $originalParams, $xFactor, $yFactor) = $this->getMetaTileData($params, $metatileSize);
        }

        // Get data from the map server: use POST to avoid too long URLS
        $options = array('method' => 'post');
        list($data, $mime, $code) = Proxy::getRemoteData(
            Proxy::constructUrl($params, $this->services),
            $options
        );

        \lizmap::logMetric('LIZMAP_PROXY_REQUEST_QGIS_MAP', 'WMS', array(
            'qgisParams' => $params,
            'qgisResponseCode' => $code,
        ));

        if ($useCache && !preg_match('/^image/', $mime)) {
            $useCache = false;
        }

        // Metatile : if needed, crop the metatile into a single tile
        if ($metatileSize && $useCache && $wmsClient == 'web'
            && extension_loaded('gd') && function_exists('gd_info')
        ) {
            $data = $this->getImageData($data, $params, $originalParams, $xFactor, $yFactor);
        }

        // Store into cache if needed
        $cached = false;
        if ($useCache) {
            // ~ \jLog::log( ' Store into cache');
            $cacheExpiration = (int) $this->services->cacheExpiration;
            if (property_exists($configLayer, 'cacheExpiration')) {
                $cacheExpiration = (int) $configLayer->cacheExpiration;
            }

            try {
                $this->appContext->setCache($key, $data, $cacheExpiration, $profile);
                $cached = true;

                \lizmap::logMetric('LIZMAP_PROXY_WRITE_CACHE', 'WMS', array(
                    'qgisParams' => $params,
                ));
            } catch (\Exception $e) {
                \jLog::logEx($e, 'error');
                $cached = false;
            }
        }

        return new OGCResponse($code, $mime, $data, $cached);
    }
}
