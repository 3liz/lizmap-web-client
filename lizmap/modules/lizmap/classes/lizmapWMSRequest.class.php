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
class lizmapWMSRequest extends lizmapOGCRequest
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

    protected function getcapabilities()
    {
        $result = parent::getcapabilities();

        $data = $result->data;
        if (empty($data) or floor($result->code / 100) >= 4) {
            if (empty($data)) {
                jLog::log('GetCapabilities empty data', 'error');
            } else {
                jLog::log('GetCapabilities result code: '.$result->code, 'error');
            }
            jMessage::add('Server Error !', 'Error');

            return $this->serviceException();
        }

        if (preg_match('#ServiceExceptionReport#i', $data)) {
            return $result;
        }

        // Remove no interoparable elements
        $data = preg_replace('@<GetPrint[^>]*?>.*?</GetPrint>@si', '', $data);
        $data = preg_replace('@<ComposerTemplates[^>]*?>.*?</ComposerTemplates>@si', '', $data);

        // Replace qgis server url in the XML (hide real location)
        $sUrl = jUrl::getFull(
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
        if (!preg_match('@Service>.*?MaxWidth.*?</Service@si', $data)) {
            $matches = array();
            if (preg_match('@Service>(.*?)</Service@si', $data, $matches)) {
                if (count($matches) > 1) {
                    $sUpdate = $matches[1]."<MaxWidth>3000</MaxWidth>\n ";
                    $data = str_replace($matches[1], $sUpdate, $data);
                }
            }
        }
        if (!preg_match('@Service>.*?MaxHeight.*?</Service@si', $data)) {
            $matches = array();
            if (preg_match('@Service>(.*?)</Service@si', $data, $matches)) {
                if (count($matches) > 1) {
                    $sUpdate = $matches[1]."<MaxHeight>3000</MaxHeight>\n ";
                    $data = str_replace($matches[1], $sUpdate, $data);
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
        $querystring = $this->constructUrl();

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

        // Replace qgis server url in the XML (hide real location)
        $sUrl = jUrl::getFull(
            'lizmap~service:index',
            array('repository' => $this->repository->getKey(), 'project' => $this->project->getKey())
        );
        $sUrl = str_replace('&', '&amp;', $sUrl).'&amp;';
        $data = preg_replace('/xlink\:href=".*"/', 'xlink:href="'.$sUrl.'&amp;"', $data);

        return (object) array(
            'code' => $code,
            'mime' => $mime,
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

    protected function getmap()
    {
        if (!$this->checkMaximumWidthHeight()) {
            jMessage::add('The requested map size is too large', 'Size error');

            return $this->serviceException();
        }

        $getMap = lizmapProxy::getMap($this->project, $this->params, $this->forceRequest);

        return (object) array(
            'code' => $getMap[2],
            'mime' => $getMap[1],
            'data' => $getMap[0],
            'cached' => $getMap[3],
        );
    }

    protected function checkMaximumWidthHeight()
    {
        $maxWidth = $this->project->getData('wmsMaxWidth');
        if (!$maxWidth) {
            $maxWidth = $this->services->wmsMaxWidth;
        }
        if (!$maxWidth) {
            $maxWidth = 3000;
        }
        $width = $this->param('width');
        if ($width == null || !is_numeric($width)) {
            // raise exception
            return false;
        }
        $width = intval($width);
        if ($width > $maxWidth) {
            return false;
        }
        $maxHeight = $this->project->getData('wmsMaxHeight');
        if (!$maxHeight) {
            $maxHeight = $this->services->wmsMaxHeight;
        }
        if (!$maxHeight) {
            $maxHeight = 3000;
        }
        $height = $this->param('height');
        if ($height == null || !is_numeric($height)) {
            // raise exception
            return false;
        }
        $height = intval($height);
        if ($height > $maxHeight) {
            return false;
        }

        return true;
    }

    protected function getlegendgraphic()
    {
        return $this->getlegendgraphics();
    }

    protected function getlegendgraphics()
    {
        $layers = $this->param('Layers', '');
        if ($layers == '') {
            $layers = $this->param('Layer', '');
        }
        $layers = explode(',', $layers);
        if (count($layers) == 1) {
            $lName = $layers[0];
            $layer = $this->project->findLayerByAnyName($lName);
            if ($layer && property_exists($layer, 'showFeatureCount') && $layer->showFeatureCount == 'True') {
                $this->params['showFeatureCount'] = 'True';
            }
        }

        $querystring = $this->constructUrl();

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => false,
        );
    }

    protected function getfeatureinfo()
    {
        $toHtml = ($this->param('info_format') == 'text/html');
        if ($toHtml) {
            $this->params['info_format'] = 'text/xml';
        }

        // Always request maptip to QGIS server so we can decide if to use it later
        $this->params['with_maptip'] = 'true';
        // Always request geometry to QGIS server so we can decide if to use it later
        $this->params['with_geometry'] = 'true';

        $querystring = $this->constructUrl();

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

        // Get HTML content if needed
        if ($toHtml and preg_match('#/xml#', $mime)) {
            $data = $this->gfiXmlToHtml($data);
            $mime = 'text/html';
        }

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => false,
        );
    }

    protected function getprint()
    {
        $querystring = $this->constructUrl();

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring, array('method' => 'post'));

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => false,
        );
    }

    protected function getprintatlas()
    {
        $querystring = $this->constructUrl();

        // Trigger optional actions by other modules
        // For example, cadastre module can create a file
        $eventParams = array(
            'params' => $this->params,
            'repository' => $this->repository->getKey(),
            'project' => $this->project->getKey(),
        );
        jEvent::notify('BeforePdfCreation', $eventParams);

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring, array('method' => 'post'));

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => false,
        );
    }

    protected function getstyles()
    {
        $querystring = $this->constructUrl();

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => false,
        );
    }

    /**
     * gfiXmlToHtml : return HTML for the getFeatureInfo XML.
     *
     * @param string $xmldata XML data from getFeatureInfo
     *
     * @return string feature Info in HTML format
     */
    protected function gfiXmlToHtml($xmldata)
    {
        // Get data from XML
        $use_errors = libxml_use_internal_errors(true);
        $errorlist = array();
        // Create a DOM instance
        $xml = simplexml_load_string($xmldata);
        if (!$xml) {
            foreach (libxml_get_errors() as $error) {
                $errorlist[] = $error;
            }
            $errormsg = 'An error has been raised when loading GetFeatureInfoHtml:';
            $errormsg.= '\n'.http_build_query($gfiparams);
            $errormsg.= '\n'.$xmldata;
            $errormsg.= '\n'.implode('\n', $errorlist);
            jLog::log($errormsg, 'error');
            // return empty html string
            return '';
        }

        // Check layer children
        if (!$xml->Layer) {
            // No data found
            // return empty html string
            return '';
        }

        // Get json configuration for the project
        $configLayers = $this->project->getLayers();

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
                if ($editionLayer != null &&
                    ($editionLayer->capabilities->modifyGeometry == 'True'
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

            if($layer->Feature && count($layer->Feature) > 0) {
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
     * @param string $layerId
     * @param string $layerName
     * @param string $layerTitle
     * @param SimpleXmlElement $layer
     * @param Object $configLayer
     * @param Array $filterFid
     *
     * @return array Vector features Info in HTML format
     */
    protected function gfiVectorXmlToHtml($layerId, $layerName, $layerTitle, $layer, $configLayer, $filterFid)
    {
        $content = array();
        $popupClass = jClasses::getService('view~popup');

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
        foreach ($layer->Feature as $feature) {
            $id = (string) $feature['id'];
            // Optionnally filter by feature id
            if ($filterFid &&
                isset($filterFid[$configLayer->name]) &&
                $filterFid[$configLayer->name] != $id
            ) {
                continue;
            }

            if ($layerFeaturesCounter == $popupMaxFeatures) {
                break;
            }
            ++$layerFeaturesCounter;

            // Hidden input containing layer id and feature id
            $hiddenFeatureId = '<input type="hidden" value="'.$layerId.'.'.$id.'" class="lizmap-popup-layer-feature-id"/>
    ';

            // First get default template
            $tpl = new jTpl();
            $tpl->assign('layerName', $layerName);
            $tpl->assign('layerId', $layerId);
            $tpl->assign('layerTitle', $layerTitle);
            $tpl->assign('featureId', $id);
            $tpl->assign('attributes', $feature->Attribute);
            $tpl->assign('repository', $this->repository->getKey());
            $tpl->assign('project', $this->project->getKey());
            $popupFeatureContent = $tpl->fetch('view~popupDefaultContent', 'html');
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
            $hasMaptip = false;
            $maptipValue = '';
            // Get geometry data
            $hasGeometry = false;
            $geometryValue = '';

            foreach ($feature->Attribute as $attribute) {
                if ($attribute['name'] == 'maptip') {
                    $hasMaptip = true;
                    $maptipValue = $attribute['value'];
                } elseif ($attribute['name'] == 'geometry') {
                    $hasGeometry = true;
                    $geometryValue = $attribute['value'];
                }
            }
            // If there is a maptip attribute we display its value
            if ($hasMaptip) {
                // first replace all "media/bla/bla/llkjk.ext" by full url
                $maptipValue = preg_replace_callback(
                    '#(["\']){1}((\.\./)?media/.+\.\w{3,10})(["\']){1}#',
                    array($this, 'replaceMediaPathByMediaUrl'),
                    $maptipValue
                );
                // Replace : html encoded chars to let further regexp_replace find attributes
                $maptipValue = str_replace(array('%24', '%7B', '%7D'), array('$', '{', '}'), $maptipValue);
                $qgisContent = $maptipValue;
            }

            // Get the BoundingBox data
            $hiddenGeometry = '';
            if ($hasGeometry && $feature->BoundingBox) {
                $hiddenGeometry = '<input type="hidden" value="'.$geometryValue.'" class="lizmap-popup-layer-feature-geometry"/>
        ';
                $bbox = $feature->BoundingBox[0];
                $hiddenGeometry .= '<input type="hidden" value="'.$bbox['CRS'].'" class="lizmap-popup-layer-feature-crs"/>
        ';
                $hiddenGeometry .= '<input type="hidden" value="'.$bbox['minx'].'" class="lizmap-popup-layer-feature-bbox-minx"/>
        ';
                $hiddenGeometry .= '<input type="hidden" value="'.$bbox['miny'].'" class="lizmap-popup-layer-feature-bbox-miny"/>
        ';
                $hiddenGeometry .= '<input type="hidden" value="'.$bbox['maxx'].'" class="lizmap-popup-layer-feature-bbox-maxx"/>
        ';
                $hiddenGeometry .= '<input type="hidden" value="'.$bbox['maxy'].'" class="lizmap-popup-layer-feature-bbox-maxy"/>
        ';
            }

            // New option to choose the popup source : auto (=default), lizmap (=popupTemplate), qgis (=qgis maptip)
            $finalContent = $autoContent;
            if (property_exists($configLayer, 'popupSource')) {
                if ($configLayer->popupSource == 'qgis' and $hasMaptip) {
                    $finalContent = $qgisContent;
                }
                if ($configLayer->popupSource == 'lizmap' and $templateConfigured) {
                    $finalContent = $lizmapContent;
                }
            }

            $tpl = new jTpl();
            $tpl->assign('layerTitle', $layerTitle);
            $tpl->assign('layerName', $layerName);
            $tpl->assign('layerId', $layerId);
            $tpl->assign('featureId', $id);
            $tpl->assign('popupContent', $hiddenFeatureId.$hiddenGeometry.$finalContent);
            $content[] = $tpl->fetch('view~popup', 'html');
        } // loop features
        return $content;
    }


    /**
     * gfiRasterXmlToHtml : return Raster HTML for the getFeatureInfo XML.
     *
     * @param string $layerId
     * @param string $layerName
     * @param string $layerTitle
     * @param SimpleXmlElement $layer
     *
     * @return array Raster feature Info in HTML format
     */
    protected function gfiRasterXmlToHtml($layerId, $layerName, $layerTitle, $layer)
    {
        $tpl = new jTpl();
        $tpl->assign('layerName', $layerName);
        $tpl->assign('layerId', $layerId);
        $tpl->assign('attributes', $layer->Attribute);
        $tpl->assign('repository', $this->repository->getKey());
        $tpl->assign('project', $this->project->getKey());
        $popupRasterContent = $tpl->fetch('view~popupRasterContent', 'html');

        $tpl = new jTpl();
        $tpl->assign('layerTitle', $layerTitle);
        $tpl->assign('layerName', $layerName);
        $tpl->assign('layerId', $layerId);
        $tpl->assign('popupContent', $popupRasterContent);
        return $tpl->fetch('view~popup', 'html');
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
        $req = jApp::coord()->request;
        $return = '';
        $return .= '"';
        $return .= jUrl::getFull(
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

}
