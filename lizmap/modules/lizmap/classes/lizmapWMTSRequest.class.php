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

class lizmapWMTSRequest extends lizmapOGCRequest {

    protected $tplExceptions = 'lizmap~wmts_exception';

    private $forceRequest = False;

    public function getForceRequest( ) {
        return $this->forceRequest;
    }

    public function setForceRequest( $forced ) {
        return $this->forceRequest = $forced;
    }

    protected function getcapabilities( ) {
        //Get Cache
        $cacheId = $this->repository->getKey().'_'.$this->project->getKey().'_WMTS';
        $hash = jCache::get($cacheId . '_hash');
        $newhash = md5_file( realpath($this->repository->getPath()) . '/' . $this->project->getKey() . ".qgs" );
        $tileMatrixSetList = jCache::get($cacheId . '_tilematrixsetlist');
        $layers = jCache::get($cacheId . '_layers');

        if( !$tileMatrixSetList || !$layers || $hash != $newhash ) {

            $wmsRequest = new lizmapWMSRequest( $this->project, array(
                    'service'=>'WMS',
                    'request'=>'GetCapabilities'
                )
            );
            $wmsResult = $wmsRequest->process();
            $wms = $wmsResult->data;

            $wms_xml = simplexml_load_string( $wms );
            $wms_xml->registerXPathNamespace("wms", "http://www.opengis.net/wms");
            $wms_xml->registerXPathNamespace("xlink", "http://www.w3.org/1999/xlink");

            $tileMatrixSetList = lizmapTiler::getTileMatrixSetList( $this->project, $wms_xml );
            $cfgLayers = $this->project->getLayers();
            $layers = array();
            foreach( $cfgLayers as $n=>$l ) {
                if ( $l->cached == 'True' && $l->singleTile != 'True' && strtolower( $l->name ) != 'overview' ) {
                    $layer = lizmapTiler::getLayerTileInfo( $l->name, $this->project, $wms_xml, $tileMatrixSetList );
                    if ($layer) {
                        $layers[] = $layer;
                    }
                }
            }

            jCache::set($cacheId . '_hash', $newhash, 3600);
            jCache::set($cacheId . '_tilematrixsetlist', $tileMatrixSetList, 3600 );
            jCache::set($cacheId . '_layers', $layers, 3600);
        }
        $sUrl = jUrl::getFull(
            "lizmap~service:index",
            array("repository"=>$this->repository->getKey(), "project"=>$this->project->getKey())
        );

        $tpl = new jTpl();
        $tpl->assign( 'url', $sUrl );
        $tpl->assign( 'repository', $this->param('repository') );
        $tpl->assign( 'project', $this->param('project') );
        $tpl->assign( 'tileMatrixSetList', $tileMatrixSetList );
        $tpl->assign( 'layers', $layers );

        return (object) array(
            'code' => 200,
            'mime' => 'text/xml',
            'data' => $tpl->fetch('lizmap~wmts_capabilities'),
            'cached' => False
        );
    }

    function gettile(){
        //jLog::log('GetTile '.http_build_query($this->params));
        // Get the layer
        $LayerName = $this->param('Layer');
        if(!$LayerName){
            // Error message
            jMessage::add('The parameter Layer is mandatory !', 'MissingParameter');
            return $this->serviceException();
        }
        $Format = $this->param('Format');
        if(!$Format){
            // Error message
            jMessage::add('The parameter Format is mandatory !', 'MissingParameter');
            return $this->serviceException();
        }
        $TileMatrixSetId = $this->param('TileMatrixSet');
        if(!$TileMatrixSetId){
            // Error message
            jMessage::add('The parameter TileMatrixSet is mandatory !', 'MissingParameter');
            return $this->serviceException();
        }
        $TileMatrixId = $this->param('TileMatrix');
        if($TileMatrixId === null){
            // Error message
            jMessage::add('The parameter TileMatrix is mandatory !', 'MissingParameter');
            return $this->serviceException();
        }
        $TileRow = $this->param('TileRow');
        if($TileRow === null){
            // Error message
            jMessage::add('The parameter TileRow is mandatory !', 'MissingParameter');
            return $this->serviceException();
        }
        $TileCol = $this->param('TileCol');
        if($TileCol === null){
            // Error message
            jMessage::add('The parameter TileCol is mandatory !', 'MissingParameter');
            return $this->serviceException();
        }

        $cacheId = $this->repository->getKey().'_'.$this->project->getKey().'_WMTS';
        $tileMatrixSetList = jCache::get($cacheId . '_tilematrixsetlist');

        if( !$tileMatrixSetList ) {
            $this->getcapabilities();
            $tileMatrixSetList = jCache::get($cacheId . '_tilematrixsetlist');
        }

        $tileMatrixSet = null;

        foreach( $tileMatrixSetList as $tms ) {
            if ( $tms->ref == $TileMatrixSetId ) {
                $tileMatrixSet = $tms;
                break;
            }
        }

        if($tileMatrixSet === null){
            // Error message
            jMessage::add('TileMatrixSet seems to be wrong', 'MissingParameter');
            return $this->serviceException();
        }

        $tileWidth = 256.0;
        $tileHeight = 256.0;

        $tileMatrix = $tileMatrixSet->tileMatrixList[ (int) $TileMatrixId ];

        $res = $tileMatrix->resolution;
        $minx = $tileMatrix->left + ( (int) $TileCol ) * ($tileWidth * $res);
        $miny = $tileMatrix->top - ( (int) $TileRow + 1 ) * ($tileHeight * $res);
        $maxx = $tileMatrix->left + ( (int) $TileCol + 1) * ($tileWidth * $res);
        $maxy = $tileMatrix->top - ( (int) $TileRow ) * ($tileHeight * $res);

        $bbox = (string) round($minx,6) .','. (string) round($miny,6) .','. (string) round($maxx,6) .','. (string) round($maxy,6);
        if( $TileMatrixSetId == 'EPSG:4326' )
            $bbox = (string) round($miny,6) .','. (string) round($minx,6) .','. (string) round($maxy,6) .','. (string) round($maxx,6);

        $params['service'] = 'WMS';
        $params['version'] = '1.3.0';
        $params['request'] = 'GetMap';
        $params['layers'] = $LayerName;
        $params['styles'] = '';
        $params['format'] = $Format;
        $params['crs'] = $TileMatrixSetId;
        $params['bbox'] = $bbox;
        $params['width'] = $tileWidth;
        $params['height'] = $tileHeight;
        $params['dpi'] = '96';
        if(preg_match('#png#', $Format))
            $params['transparent'] = 'true';

        $filter = $this->param('filter');
        if($filter)
            $params['filter'] = $filter;
        $exp_filter = $this->param('exp_filter');
        if($exp_filter)
            $params['exp_filter'] = $exp_filter;

        $wmsRequest = new lizmapWMSRequest( $this->project, $params );
        $wmsRequest->setForceRequest( $this->forceRequest );

        return $wmsRequest->process();
    }
}
