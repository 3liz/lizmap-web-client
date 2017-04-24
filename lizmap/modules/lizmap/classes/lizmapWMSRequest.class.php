<?php
/**
* Manage OGC request.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2015 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class lizmapWMSRequest extends lizmapOGCRequest {

    protected $tplExceptions = 'lizmap~wms_exception';

    private $forceRequest = False;

    public function getForceRequest ( ) {
        return $this->forceRequest;
    }

    public function setForceRequest ( $forced ) {
        return $this->forceRequest = $forced;
    }

    protected function getcapabilities ( ) {
        $result = parent::getcapabilities();

        $data = $result->data;
        if ( empty( $data ) or floor( $result->code / 100 ) >= 4 ) {
            jMessage::add('Server Error !', 'Error');
            return $this->serviceException();
        }

        if ( preg_match( '#ServiceExceptionReport#i', $data ) )
            return $result;

        // Remove no interoparable elements
        $data = preg_replace('@<GetPrint[^>]*?>.*?</GetPrint>@si', '', $data);
        $data = preg_replace('@<ComposerTemplates[^>]*?>.*?</ComposerTemplates>@si', '', $data);

        // Replace qgis server url in the XML (hide real location)
        $sUrl = jUrl::getFull(
          "lizmap~service:index",
          array("repository"=>$this->repository->getKey(), "project"=>$this->project->getKey())
        );
        $sUrl = str_replace('&', '&amp;', $sUrl);
        preg_match('/<get>.*\n*.+xlink\:href="(.+)"/i', $data, $matches);
        if ( count( $matches ) < 2 )
            preg_match('/get onlineresource="(.+)"/i', $data, $matches);
        if ( count( $matches ) > 1 )
            $data = str_replace($matches[1], $sUrl, $data);
        $data = str_replace('&amp;&amp;', '&amp;', $data);

        if ( preg_match( '@WMS_Capabilities@i', $data) ) {
            // Update namespace
            $schemaLocation = "http://www.opengis.net/wms";
            $schemaLocation .= " http://schemas.opengis.net/wms/1.3.0/capabilities_1_3_0.xsd";
            $schemaLocation .= " http://www.opengis.net/sld";
            $schemaLocation .= " http://schemas.opengis.net/sld/1.1.0/sld_capabilities.xsd";
            $schemaLocation .= " http://www.qgis.org/wms";
            $schemaLocation .= " ". $sUrl ."SERVICE=WMS&amp;REQUEST=GetSchemaExtension";
            $data = preg_replace('@xsi:schemaLocation=".*?"@si', 'xsi:schemaLocation="'.$schemaLocation.'"', $data);
            if ( !preg_match( '@xmlns:qgs@i', $data) ) {
              $data = preg_replace('@xmlns="http://www.opengis.net/wms"@', 'xmlns="http://www.opengis.net/wms" xmlns:qgs="http://www.qgis.org/wms"', $data);
              $data = preg_replace('@GetStyles@', 'qgs:GetStyles', $data);
            }
            if ( !preg_match( '@xmlns:sld@i', $data) ) {
              $data = preg_replace('@xmlns="http://www.opengis.net/wms"@', 'xmlns="http://www.opengis.net/wms" xmlns:sld="http://www.opengis.net/sld"', $data);
              $data = preg_replace('@GetLegendGraphic@', 'sld:GetLegendGraphic', $data);
            }
        }

        //INSERT MaxWidth and MaxHeight
        if ( !preg_match( '@Service>.*?MaxWidth.*?</Service@si', $data) ) {
            $matches = array();
            if( preg_match( '@Service>(.*?)</Service@si', $data, $matches) ) {
                if ( count( $matches ) > 1 ) {
                    $sUpdate = $matches[1]."<MaxWidth>3000</MaxWidth>\n ";
                    $data = str_replace($matches[1], $sUpdate, $data);
                }
            }
        }
        if ( !preg_match( '@Service>.*?MaxHeight.*?</Service@si', $data) ) {
            $matches = array();
            if( preg_match( '@Service>(.*?)</Service@si', $data, $matches) ) {
                if ( count( $matches ) > 1 ) {
                    $sUpdate = $matches[1]."<MaxHeight>3000</MaxHeight>\n ";
                    $data = str_replace($matches[1], $sUpdate, $data);
                }
            }
        }

        return (object) array(
            'code' => 200,
            'mime' => $result->mime,
            'data' => $data,
            'cached' => False
        );
    }

    protected function getmap ( ) {
        if( !$this->checkMaximumWidthHeight() ) {
            jMessage::add('The requested map size is too large', 'Size error');
            return $this->serviceException();
        }

        $getMap = lizmapProxy::getMap($this->project, $this->params, $this->forceRequest);

        return (object) array(
            'code' => $getMap[2],
            'mime' => $getMap[1],
            'data' => $getMap[0],
            'cached' => False
        );
    }

    protected function checkMaximumWidthHeight ( ) {
        $maxWidth = $this->project->getData('wmsMaxWidth');
        if( !$maxWidth )
            $maxWidth = $this->services->wmsMaxWidth;
        if( !$maxWidth )
            $maxWidth = 3000;
        if( $this->params['width'] > $maxWidth )
            return false;
        $maxHeight = $this->project->getData('wmsMaxHeight');
        if( !$maxHeight )
            $maxHeight = $this->services->wmsMaxHeight;
        if( !$maxHeight )
            $maxHeight = 3000;
        if( $this->params['height'] > $maxHeight )
            return false;
        return true;
    }

    protected function getlegendgraphic ( ) {
        return $this->getlegendgraphics();
    }

    protected function getlegendgraphics ( ) {
        $layers = $this->param('Layers','');
        if( $layers == '' )
            $layers = $this->param('Layer','');
        $layers = explode(',', $layers);
        if ( count($layers) == 1 ) {
            $lName = $layers[0];
            $layer = $this->project->findLayerByAnyName( $lName );
            if ( $layer && property_exists($layer, 'showFeatureCount' ) && $layer->showFeatureCount == 'True') {
                $this->params['showFeatureCount'] = 'True';
            }
        }

        $querystring = $this->constructUrl();

        // Get remote data
        $getRemoteData = lizmapProxy::getRemoteData(
          $querystring,
          $this->services->proxyMethod,
          $this->services->debugMode
        );
        $data = $getRemoteData[0];
        $mime = $getRemoteData[1];
        $code = $getRemoteData[2];

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => False
        );
    }
}
