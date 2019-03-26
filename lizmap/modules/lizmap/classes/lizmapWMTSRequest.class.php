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
class lizmapWMTSRequest extends lizmapOGCRequest
{
    protected $tplExceptions = 'lizmap~wmts_exception';

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
        $tileCapabilities = null;

        try {
            $tileCapabilities = lizmapTiler::getTileCapabilities($this->project);
        } catch (Exception $e) {
            // if default profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::logEx($e, 'error');
            // Error message
            jMessage::add('The WMTS Service can\'t be initialized!', 'ServiceError');

            return $this->serviceException();
        }

        if ($tileCapabilities === null ||
             $tileCapabilities->tileMatrixSetList === null ||
             $tileCapabilities->layerTileInfoList === null) {
            // Error message
            jMessage::add('The WMTS Service can\'t be initialized!', 'ServiceError');

            return $this->serviceException();
        }

        $sUrl = jUrl::getFull(
            'lizmap~service:index',
            array('repository' => $this->repository->getKey(), 'project' => $this->project->getKey())
        );
        $sUrl .= '&';

        $tpl = new jTpl();
        $tpl->assign('url', $sUrl);
        $tpl->assign('repository', $this->param('repository'));
        $tpl->assign('project', $this->param('project'));
        $tpl->assign('tileMatrixSetList', $tileCapabilities->tileMatrixSetList);
        $tpl->assign('layers', $tileCapabilities->layerTileInfoList);

        return (object) array(
            'code' => 200,
            'mime' => 'text/xml',
            'data' => $tpl->fetch('lizmap~wmts_capabilities'),
            'cached' => false,
        );
    }

    public function gettile()
    {
        //jLog::log('GetTile '.http_build_query($this->params));
        // Get the layer
        $LayerName = $this->param('Layer');
        if (!$LayerName) {
            // Error message
            jMessage::add('The parameter Layer is mandatory!', 'MissingParameter');

            return $this->serviceException();
        }
        $Format = $this->param('Format');
        if (!$Format) {
            // Error message
            jMessage::add('The parameter Format is mandatory!', 'MissingParameter');

            return $this->serviceException();
        }
        $TileMatrixSetId = $this->param('TileMatrixSet');
        if (!$TileMatrixSetId) {
            // Error message
            jMessage::add('The parameter TileMatrixSet is mandatory!', 'MissingParameter');

            return $this->serviceException();
        }
        $TileMatrixId = $this->param('TileMatrix');
        if ($TileMatrixId === null) {
            // Error message
            jMessage::add('The parameter TileMatrix is mandatory!', 'MissingParameter');

            return $this->serviceException();
        }
        $TileRow = $this->param('TileRow');
        if ($TileRow === null) {
            // Error message
            jMessage::add('The parameter TileRow is mandatory!', 'MissingParameter');

            return $this->serviceException();
        }
        $TileCol = $this->param('TileCol');
        if ($TileCol === null) {
            // Error message
            jMessage::add('The parameter TileCol is mandatory!', 'MissingParameter');

            return $this->serviceException();
        }

        $tileCapabilities = null;

        try {
            // if the cache is not available, the tile matrix is calculated
            // if there is an issue with the cache, the tile matrix is caclulated each time
            // to get an error we acn used getCalculatedTileCapabilities
            $tileCapabilities = lizmapTiler::getTileCapabilities($this->project);
        } catch (Exception $e) {
            // if default profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::logEx($e, 'error');
            // Error message
            jMessage::add('The WMTS Service can\'t be initialized!', 'ServiceError');

            return $this->serviceException();
        }

        if ($tileCapabilities === null ||
             $tileCapabilities->tileMatrixSetList === null ||
             $tileCapabilities->layerTileInfoList === null) {
            // Error message
            jMessage::add('The WMTS Service can\'t be initialized!', 'ServiceError');

            return $this->serviceException();
        }

        $tileMatrixSet = null;

        foreach ($tileCapabilities->tileMatrixSetList as $tms) {
            if ($tms->ref == $TileMatrixSetId) {
                $tileMatrixSet = $tms;

                break;
            }
        }

        if ($tileMatrixSet === null) {
            // Error message
            jMessage::add('TileMatrixSet seems to be wrong', 'ServiceError');

            return $this->serviceException();
        }

        $tileWidth = 256.0;
        $tileHeight = 256.0;

        $tileMatrix = $tileMatrixSet->tileMatrixList[(int) $TileMatrixId];

        $res = $tileMatrix->resolution;
        $minx = $tileMatrix->left + ((int) $TileCol) * ($tileWidth * $res);
        $miny = $tileMatrix->top - ((int) $TileRow + 1) * ($tileHeight * $res);
        $maxx = $tileMatrix->left + ((int) $TileCol + 1) * ($tileWidth * $res);
        $maxy = $tileMatrix->top - ((int) $TileRow) * ($tileHeight * $res);

        $bbox = (string) round($minx, 6).','.(string) round($miny, 6).','.(string) round($maxx, 6).','.(string) round($maxy, 6);
        if ($TileMatrixSetId == 'EPSG:4326') {
            $bbox = (string) round($miny, 6).','.(string) round($minx, 6).','.(string) round($maxy, 6).','.(string) round($maxx, 6);
        }

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
        if (preg_match('#png#', $Format)) {
            $params['transparent'] = 'true';
        }

        $filter = $this->param('filter');
        if ($filter) {
            $params['filter'] = $filter;
        }
        $exp_filter = $this->param('exp_filter');
        if ($exp_filter) {
            $params['exp_filter'] = $exp_filter;
        }

        $wmsRequest = new lizmapWMSRequest($this->project, $params);
        $wmsRequest->setForceRequest($this->forceRequest);

        return $wmsRequest->process();
    }
}
