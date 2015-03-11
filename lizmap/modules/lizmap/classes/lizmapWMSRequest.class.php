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

jClasses::inc('lizmap~lizmapProxy');
jClasses::inc('lizmap~lizmapOGCRequest');
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
        if ( $result->cached )
            return $result;
        
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
        preg_match('/Request.*Request/s', $data, $matches);
        $matches[0] = preg_replace('/xlink\:href=".*"/', 'xlink:href="'.$sUrl.'&amp;"', $matches[0]);
        $data = preg_replace('/Request.*Request/s', $matches[0], $data);

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
        
        // Add response to cache
        $cacheId = $this->repository->getKey().'_'.$this->project->getKey().'_'.$this->param('service');
        $newhash = md5_file( realpath($this->repository->getPath()) . '/' . $this->project->getKey() . ".qgs" );
        jCache::set($cacheId . '_hash', $newhash);
        jCache::set($cacheId . '_mime', $result->mime);
        jCache::set($cacheId . '_data', $data);
        
        return (object) array(
            'code' => 200,
            'mime' => $result->mime,
            'data' => $data,
            'cached' => False
        );
    }
    
    protected function getmap ( ) {
        $getMap = lizmapProxy::getMap($this->repository->getKey(), $this->project->getKey(), $this->params, $this->forceRequest);
        
        return (object) array(
            'code' => $getMap[2],
            'mime' => $getMap[1],
            'data' => $getMap[0],
            'cached' => False
        );
    }
}
