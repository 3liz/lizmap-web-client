<?php

use Lizmap\App\XmlTools;
use Lizmap\Project\Project;
use Lizmap\Request\WMSRequest;
use proj4php\Point as Proj4Point;
use proj4php\Proj as Proj4Proj;
use proj4php\Proj4php;

/**
 * WMTS.
 *
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizmapTiler
{
    // tile matrix info
    protected static $tileMatrixInfo = array(
        'EPSG:3857' => array(
            'extent' => array(-20037508.3427892480, -20037508.3427892480, 20037508.3427892480, 20037508.3427892480),
            // 'scaleDenominator'=> 559082264.0287178958533332,
            'scaleDenominator' => 559082264.0287179,
            'unit' => 'm',
        ),
        'EPSG:900913' => array(
            'extent' => array(-20037508.3427892480, -20037508.3427892480, 20037508.3427892480, 20037508.3427892480),
            // 'scaleDenominator'=> 559082264.0287178958533332,
            'scaleDenominator' => 559082264.0287179,
            'unit' => 'm',
        ),
        'EPSG:4326' => array(
            'extent' => array(-180, -90, 180, 90),
            'scaleDenominator' => 279541132.0143588675418869,
            'unit' => 'dd',
        ),
    );

    /**
     * this is a static class, so private constructor.
     */
    private function __construct() {}

    /**
     * Get tile capabililities.
     *
     * @param mixed $project
     */
    public static function getTileCapabilities($project)
    {
        $repository = $project->getRepository();

        $cacheId = jCache::normalizeKey($repository->getKey().'_'.$project->getKey().'_WMTS');
        $file = $repository->getPath().$project->getKey().'.qgs';

        $hash = false;
        $tileMatrixSetList = false;
        $layers = false;

        try {
            $hash = jCache::get($cacheId.'_hash');
            $tileMatrixSetList = jCache::get($cacheId.'_tilematrixsetlist');
            $layers = jCache::get($cacheId.'_layers');
        } catch (Exception $e) {
            // if default profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::logEx($e, 'error');
        }

        if (!is_array($tileMatrixSetList) || !is_array($layers) || !is_array($hash)
            || $hash['qgsmtime'] < filemtime($file)
            || $hash['qgscfgmtime'] < filemtime($file.'.cfg')) {
            $wmsRequest = new WMSRequest(
                $project,
                array(
                    'service' => 'WMS',
                    'request' => 'GetCapabilities',
                ),
                lizmap::getServices()
            );
            $wmsResult = $wmsRequest->process();
            // Http code error
            if (($wmsResult->code / 100) >= 4) {
                $errormsg = 'An error has been raised when loading WMS GetCapabilities: HTTP Code '.$wmsResult->code;
                jLog::log($errormsg, 'error');

                return null;
            }
            $wms = $wmsResult->data;
            // empty data or service exception, WMS not available
            if (empty($wms) or preg_match('/ServiceExceptionReport/', $wms)) {
                $errormsg = 'An error has been raised when loading WMS GetCapabilities: ServiceExceptionReport';
                $errormsg .= '\n'.$wms;
                jLog::log($errormsg, 'error');

                return null;
            }

            $wms_xml = XmlTools::xmlFromString($wms);
            if (!is_object($wms_xml)) {
                $errormsg = '\n'.$file.'\n'.$wms_xml;
                $errormsg = 'An error has been raised when loading WMS GetCapabilities:'.$errormsg;
                jLog::log($errormsg, 'error');

                return null;
            }

            $wms_xml->registerXPathNamespace('wms', 'http://www.opengis.net/wms');
            $wms_xml->registerXPathNamespace('xlink', 'http://www.w3.org/1999/xlink');

            $tileMatrixSetList = self::getTileMatrixSetList($project, $wms_xml);

            $layers = self::getLayerTileInfoList($project, $wms_xml, $tileMatrixSetList);

            $hash = array();
            $hash['qgsmtime'] = filemtime($file);
            $hash['qgscfgmtime'] = filemtime($file.'.cfg');

            jCache::set($cacheId.'_hash', $hash, 3600);
            jCache::set($cacheId.'_tilematrixsetlist', $tileMatrixSetList, 3600);
            jCache::set($cacheId.'_layers', $layers, 3600);
        }

        $tileCapabilities = (object) array(
            'tileMatrixSetList' => null,
            'layerTileInfoList' => null,
        );

        if (is_array($tileMatrixSetList) && is_array($layers)) {
            $tileCapabilities->tileMatrixSetList = $tileMatrixSetList;
            $tileCapabilities->layerTileInfoList = $layers;
        }

        return $tileCapabilities;
    }

    /**
     * Get calculated tile capabililities.
     *
     * @param mixed $project
     */
    public static function getCalculatedTileCapabilities($project)
    {
        $repository = $project->getRepository();

        $cacheId = jCache::normalizeKey($repository->getKey().'_'.$project->getKey().'_WMTS');

        $tileMatrixSetList = false;
        $layers = false;

        try {
            $tileMatrixSetList = jCache::get($cacheId.'_tilematrixsetlist');
            $layers = jCache::get($cacheId.'_layers');
        } catch (Exception $e) {
            // if default profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::logEx($e, 'error');
        }

        $tileCapabilities = (object) array(
            'tileMatrixSetList' => null,
            'layerTileInfoList' => null,
        );
        if (is_array($tileMatrixSetList) && is_array($layers)) {
            $tileCapabilities->tileMatrixSetList = $tileMatrixSetList;
            $tileCapabilities->layerTileInfoList = $layers;
        }

        return $tileCapabilities;
    }

    /**
     * Get a list of tileMatrixSet.
     *
     * @param Project $project
     * @param mixed   $wms_xml
     */
    public static function getTileMatrixSetList($project, $wms_xml)
    {
        $DOTS_PER_INCH = 72;
        $METERS_PER_INCH = 0.02540005080010160020;
        $INCHES_PER_UNIT = array(
            'inches' => 1.0,
            'ft' => 12.0,
            'mi' => 63360.0,
            'm' => 39.37,
            'km' => 39370,
            'dd' => 4374754,
            'yd' => 36,
        );
        $INCHES_PER_UNIT['in'] = $INCHES_PER_UNIT['inches'];
        $INCHES_PER_UNIT['degrees'] = $INCHES_PER_UNIT['dd'];
        $INCHES_PER_UNIT['nmi'] = 1852 * $INCHES_PER_UNIT['m'];

        $tileWidth = 256.0;
        $tileHeight = 256.0;

        $rootLayer = $wms_xml->xpath('//wms:Capability/wms:Layer');
        if (!$rootLayer || count($rootLayer) == 0) {
            return array();
        }

        $rootLayer = $rootLayer[0];
        $rootExtent = array(
            (float) $rootLayer->EX_GeographicBoundingBox->westBoundLongitude,
            (float) $rootLayer->EX_GeographicBoundingBox->southBoundLatitude,
            (float) $rootLayer->EX_GeographicBoundingBox->eastBoundLongitude,
            (float) $rootLayer->EX_GeographicBoundingBox->northBoundLatitude,
        );
        $geoExtent = self::$tileMatrixInfo['EPSG:4326']['extent'];
        if ($rootExtent[0] < $geoExtent[0]) {
            $rootExtent[0] = $geoExtent[0];
        }
        if ($rootExtent[1] < $geoExtent[1]) {
            $rootExtent[1] = $geoExtent[1];
        }
        if ($rootExtent[2] > $geoExtent[2]) {
            $rootExtent[2] = $geoExtent[2];
        }
        if ($rootExtent[3] > $geoExtent[3]) {
            $rootExtent[3] = $geoExtent[3];
        }

        $scales = self::normalizeProjectScales($project);
        $projection = $project->getOption('projection');

        $tileMatrixSetList = array();
        foreach ($rootLayer[0]->CRS as $CRS) {
            $CRS = (string) $CRS;

            if (array_key_exists($CRS, self::$tileMatrixInfo)) {
                $tileMatrixInfo = self::$tileMatrixInfo[$CRS];
                $extent = $tileMatrixInfo['extent'];
                $scaleDenominator = $tileMatrixInfo['scaleDenominator'];
                $unit = $tileMatrixInfo['unit'];
                $minScale = $scales[count($scales) - 1];

                $tileMatrixList = array();
                $scale = $scaleDenominator;
                $res = 0.28E-3 * $scale / $METERS_PER_INCH / $INCHES_PER_UNIT[$unit];
                // $res = $scale / ($INCHES_PER_UNIT[ $unit ] * 96.0);
                $col = round(($extent[2] - $extent[0]) / ($tileWidth * $res));
                $row = round(($extent[3] - $extent[1]) / ($tileHeight * $res));
                $left = ($extent[0] + ($extent[2] - $extent[0]) / 2) - ($col / 2) * ($tileWidth * $res);
                $top = ($extent[1] + ($extent[3] - $extent[1]) / 2) + ($row / 2) * ($tileHeight * $res);

                $tileMatrixList[] = (object) array(
                    'resolution' => $res,
                    'scaleDenominator' => $scale,
                    'col' => $col,
                    'row' => $row,
                    'left' => max($left, $extent[0]),
                    'top' => min($top, $extent[3]),
                );

                while ($scaleDenominator > $minScale) {
                    $scaleDenominator /= 2;
                    $scale = $scaleDenominator;
                    $res = 0.28E-3 * $scale / $METERS_PER_INCH / $INCHES_PER_UNIT[$unit];
                    // $res = $scale / ($INCHES_PER_UNIT[ $unit ] * 96.0);
                    $col = round(($extent[2] - $extent[0]) / ($tileWidth * $res));
                    $row = round(($extent[3] - $extent[1]) / ($tileHeight * $res));
                    $left = ($extent[0] + ($extent[2] - $extent[0]) / 2) - ($col / 2) * ($tileWidth * $res);
                    $top = ($extent[1] + ($extent[3] - $extent[1]) / 2) + ($row / 2) * ($tileHeight * $res);

                    $tileMatrixList[] = (object) array(
                        'resolution' => $res,
                        'scaleDenominator' => $scale,
                        'col' => $col,
                        'row' => $row,
                        'left' => max($left, $extent[0]),
                        'top' => min($top, $extent[3]),
                    );
                }

                $tileMatrixSet = (object) array(
                    'ref' => $CRS,
                    'unit' => $unit,
                    'extent' => null,
                    'tileMatrixList' => null,
                );
                $tileMatrixSet->extent = $extent;
                $tileMatrixSet->tileMatrixList = $tileMatrixList;
                $tileMatrixSetList[] = $tileMatrixSet;
            } elseif ($CRS == $projection->ref) {
                $proj4 = new Proj4php();
                $proj4->addDef($CRS, $projection->proj4);
                $sourceProj = new Proj4Proj('EPSG:4326', $proj4);
                $destProj = new Proj4Proj($projection->ref, $proj4);

                $sourceMinPt = new Proj4Point($rootExtent[0], $rootExtent[1]);
                $destMinPt = $proj4->transform($sourceProj, $destProj, $sourceMinPt);

                $sourceMaxPt = new Proj4Point($rootExtent[2], $rootExtent[3]);
                $destMaxPt = $proj4->transform($sourceProj, $destProj, $sourceMaxPt);

                $extent = array($destMinPt->x, $destMinPt->y, $destMaxPt->x, $destMaxPt->y);

                preg_match('/ \+units=(?P<unit>\w+) /', $projection->proj4, $matches);
                $unit = $matches['unit'];

                // $res = 0.28E-3 * $scales[0] / $METERS_PER_INCH / $INCHES_PER_UNIT[ $unit ];
                $res = $scales[0] / ($INCHES_PER_UNIT[$unit] * 96.0);
                $scale = $res * $METERS_PER_INCH * $INCHES_PER_UNIT[$unit] / 0.28E-3;
                $col = ceil(($extent[2] - $extent[0]) / ($tileWidth * $res));
                $row = ceil(($extent[3] - $extent[1]) / ($tileHeight * $res));
                $left = ($extent[0] + ($extent[2] - $extent[0]) / 2) - ($col / 2) * ($tileWidth * $res);
                $top = ($extent[1] + ($extent[3] - $extent[1]) / 2) + ($row / 2) * ($tileHeight * $res);
                $right = ($extent[0] + ($extent[2] - $extent[0]) / 2) + ($col / 2) * ($tileWidth * $res);
                $bottom = ($extent[1] + ($extent[3] - $extent[1]) / 2) - ($row / 2) * ($tileHeight * $res);

                $extent = array($left, $bottom, $right, $top);

                $tileMatrixList = array();
                foreach ($scales as $scale) {
                    $res = $scale / ($INCHES_PER_UNIT[$unit] * 96.0);
                    $scale = $res * $METERS_PER_INCH * $INCHES_PER_UNIT[$unit] / 0.28E-3;
                    $col = round(($extent[2] - $extent[0]) / ($tileWidth * $res));
                    $row = round(($extent[3] - $extent[1]) / ($tileHeight * $res));
                    $left = ($extent[0] + ($extent[2] - $extent[0]) / 2) - ($col / 2) * ($tileWidth * $res);
                    $top = ($extent[1] + ($extent[3] - $extent[1]) / 2) + ($row / 2) * ($tileHeight * $res);
                    $tileMatrixList[] = (object) array(
                        'resolution' => $res,
                        'scaleDenominator' => $scale,
                        'col' => $col,
                        'row' => $row,
                        'left' => max($left, $extent[0]),
                        'top' => min($top, $extent[3]),
                    );
                }

                $tileMatrixSet = (object) array(
                    'ref' => $CRS,
                    'unit' => $unit,
                    'extent' => null,
                    'tileMatrixList' => null,
                );
                $tileMatrixSet->extent = $extent;
                $tileMatrixSet->tileMatrixList = $tileMatrixList;
                $tileMatrixSetList[] = $tileMatrixSet;
            }
        }

        return $tileMatrixSetList;
    }

    /**
     * Get layers list.
     *
     * @param mixed $project
     * @param mixed $wms_xml
     * @param mixed $tileMatrixSetList
     */
    public static function getLayerTileInfoList($project, $wms_xml, $tileMatrixSetList)
    {
        $cfgLayers = $project->getLayers();
        $layers = array();
        foreach ($cfgLayers as $l) {
            if ($l->cached == 'True' && $l->singleTile != 'True' && strtolower($l->name) != 'overview') {
                $layer = lizmapTiler::getLayerTileInfo($l->name, $project, $wms_xml, $tileMatrixSetList);
                if ($layer) {
                    $layers[] = $layer;
                }
            }
        }

        return $layers;
    }

    /**
     * Get layer tile info.
     *
     * @param mixed $layerName
     * @param mixed $project
     * @param mixed $wms_xml
     * @param mixed $tileMatrixSetList
     */
    public static function getLayerTileInfo($layerName, $project, $wms_xml, $tileMatrixSetList)
    {
        $DOTS_PER_INCH = 72;
        $METERS_PER_INCH = 0.02540005080010160020;
        $INCHES_PER_UNIT = array(
            'inches' => 1.0,
            'ft' => 12.0,
            'mi' => 63360.0,
            'm' => 39.37,
            'km' => 39370,
            'dd' => 4374754,
            'yd' => 36,
        );
        $INCHES_PER_UNIT['in'] = $INCHES_PER_UNIT['inches'];
        $INCHES_PER_UNIT['degrees'] = $INCHES_PER_UNIT['dd'];
        $INCHES_PER_UNIT['nmi'] = 1852 * $INCHES_PER_UNIT['m'];

        $tileWidth = 256.0;
        $tileHeight = 256.0;

        $rootLayer = $wms_xml->xpath('//wms:Capability/wms:Layer');
        if (!$rootLayer || count($rootLayer) == 0) {
            return null;
        }

        $rootLayer = $rootLayer[0];
        $rootExtent = array(
            (float) $rootLayer->EX_GeographicBoundingBox->westBoundLongitude,
            (float) $rootLayer->EX_GeographicBoundingBox->southBoundLatitude,
            (float) $rootLayer->EX_GeographicBoundingBox->eastBoundLongitude,
            (float) $rootLayer->EX_GeographicBoundingBox->northBoundLatitude,
        );
        $geoExtent = self::$tileMatrixInfo['EPSG:4326']['extent'];
        if ($rootExtent[0] < $geoExtent[0]) {
            $rootExtent[0] = $geoExtent[0];
        }
        if ($rootExtent[1] < $geoExtent[1]) {
            $rootExtent[1] = $geoExtent[1];
        }
        if ($rootExtent[2] > $geoExtent[2]) {
            $rootExtent[2] = $geoExtent[2];
        }
        if ($rootExtent[3] > $geoExtent[3]) {
            $rootExtent[3] = $geoExtent[3];
        }

        $scales = self::normalizeProjectScales($project);

        $layers = $project->getLayers();
        $layer = $layers->{$layerName};

        $wmsName = property_exists($layer, 'shortname') ? $layer->shortname : $layer->name;
        $xmlLayer = $wms_xml->xpath('//wms:Layer/wms:Name[. ="'.$wmsName.'"]/parent::*');
        if (!$xmlLayer || count($xmlLayer) == 0) {
            return null;
        }
        $xmlLayer = $xmlLayer[0];
        $layerExtent = null;

        $xmlLayers = $wms_xml->xpath('//wms:Layer/wms:Name[. ="'.$wmsName.'"]/parent::*//wms:Layer');
        foreach ($xmlLayers as $xmlcLayer) {
            if (!property_exists($xmlcLayer, 'Layer')) {
                if ($layerExtent == null) {
                    $layerExtent = array(
                        (float) $xmlcLayer->EX_GeographicBoundingBox->westBoundLongitude,
                        (float) $xmlcLayer->EX_GeographicBoundingBox->southBoundLatitude,
                        (float) $xmlcLayer->EX_GeographicBoundingBox->eastBoundLongitude,
                        (float) $xmlcLayer->EX_GeographicBoundingBox->northBoundLatitude,
                    );
                } else {
                    if ($layerExtent[0] > (float) $xmlcLayer->EX_GeographicBoundingBox->westBoundLongitude) {
                        $layerExtent[0] = (float) $xmlcLayer->EX_GeographicBoundingBox->westBoundLongitude;
                    }
                    if ($layerExtent[1] > (float) $xmlcLayer->EX_GeographicBoundingBox->southBoundLatitude) {
                        $layerExtent[1] = (float) $xmlcLayer->EX_GeographicBoundingBox->southBoundLatitude;
                    }
                    if ($layerExtent[2] < (float) $xmlcLayer->EX_GeographicBoundingBox->eastBoundLongitude) {
                        $layerExtent[2] = (float) $xmlcLayer->EX_GeographicBoundingBox->eastBoundLongitude;
                    }
                    if ($layerExtent[3] < (float) $xmlcLayer->EX_GeographicBoundingBox->northBoundLatitude) {
                        $layerExtent[3] = (float) $xmlcLayer->EX_GeographicBoundingBox->northBoundLatitude;
                    }
                }
            }
        }
        if ($layerExtent == null) {
            $layerExtent = array(
                (float) $xmlLayer->EX_GeographicBoundingBox->westBoundLongitude,
                (float) $xmlLayer->EX_GeographicBoundingBox->southBoundLatitude,
                (float) $xmlLayer->EX_GeographicBoundingBox->eastBoundLongitude,
                (float) $xmlLayer->EX_GeographicBoundingBox->northBoundLatitude,
            );
        }
        // cannot be extra rootExtent
        if ($layerExtent[0] < $rootExtent[0]) {
            $layerExtent[0] = $rootExtent[0];
        }
        if ($layerExtent[1] < $rootExtent[1]) {
            $layerExtent[1] = $rootExtent[1];
        }
        if ($layerExtent[2] > $rootExtent[2]) {
            $layerExtent[2] = $rootExtent[2];
        }
        if ($layerExtent[3] > $rootExtent[3]) {
            $layerExtent[3] = $rootExtent[3];
        }

        $lowerCorner = (object) array(
            'x' => $layerExtent[0],
            'y' => $layerExtent[1],
        );
        $upperCorner = (object) array(
            'x' => $layerExtent[2],
            'y' => $layerExtent[3],
        );

        $projection = $project->getOption('projection');
        $proj4 = new Proj4php();

        $proj4->addDef($projection->ref, $projection->proj4);
        $sourceProj = new Proj4Proj('EPSG:4326', $proj4);

        $tileMatrixSetLinkList = array();
        foreach ($tileMatrixSetList as $tileMatrixSet) {
            $destProj = new Proj4Proj($tileMatrixSet->ref, $proj4);
            $destMaxExtent = $tileMatrixSet->extent;

            $sourceMinPt = new Proj4Point($layerExtent[0], $layerExtent[1]);
            $destMinPt = new Proj4Point($destMaxExtent[0], $destMaxExtent[1]);

            $sourceMaxPt = new Proj4Point($layerExtent[2], $layerExtent[3]);
            $destMaxPt = new Proj4Point($destMaxExtent[2], $destMaxExtent[3]);

            try {
                $destMinPt = $proj4->transform($sourceProj, $destProj, $sourceMinPt);
            } catch (Exception $e) {
                jLog::logEx($e, 'error');
                $destMinPt = new Proj4Point($destMaxExtent[0], $destMaxExtent[1]);
            }

            try {
                $destMaxPt = $proj4->transform($sourceProj, $destProj, $sourceMaxPt);
            } catch (Exception $e) {
                jLog::logEx($e, 'error');
                $destMaxPt = new Proj4Point($destMaxExtent[2], $destMaxExtent[3]);
            }

            $extent = array($destMinPt->x, $destMinPt->y, $destMaxPt->x, $destMaxPt->y);

            $tileMatrixList = $tileMatrixSet->tileMatrixList;
            $tileMatrixLimits = array();
            foreach ($tileMatrixList as $k => $tileMatrix) {
                $maxScale = $layer->maxScale;
                /*
                if ( $maxScale > $scales[0] )
                    $maxScale = $scales[0];
                    * */
                $minScale = $layer->minScale;
                /*
                if ( $minScale < $scales[ count($scales) - 1 ] )
                    $minScale = $scales[ count($scales) - 1 ];
                    * */
                if ($tileMatrix->scaleDenominator <= $maxScale && $tileMatrix->scaleDenominator >= $minScale) {
                    $res = $tileMatrix->resolution;
                    $minCol = floor(($extent[0] - $tileMatrix->left) / ($tileWidth * $res));
                    $maxCol = floor(($extent[2] - $tileMatrix->left) / ($tileWidth * $res));
                    $minRow = floor(($tileMatrix->top - $extent[3]) / ($tileHeight * $res));
                    $maxRow = floor(($tileMatrix->top - $extent[1]) / ($tileHeight * $res));
                    $tileMatrixLimits[] = (object) array(
                        'id' => $k,
                        'minRow' => $minRow,
                        'maxRow' => $maxRow,
                        'minCol' => $minCol,
                        'maxCol' => $maxCol,
                    );
                }
            }

            $tileMatrixSetLink = (object) array(
                'ref' => $tileMatrixSet->ref,
                'tileMatrixLimits' => null,
            );
            $tileMatrixSetLink->tileMatrixLimits = $tileMatrixLimits;

            $tileMatrixSetLinkList[] = $tileMatrixSetLink;
        }

        $l = (object) array(
            'id' => $layer->id,
            'name' => $wmsName,
            'title' => $layer->title,
            'abstract' => $layer->abstract,
            'imageFormat' => $layer->imageFormat,
            'lowerCorner' => $lowerCorner,
            'upperCorner' => $upperCorner,
            'minScale' => $layer->minScale,
            'maxScale' => $layer->maxScale,
            'tileMatrixSetLinkList' => null,
        );
        $l->tileMatrixSetLinkList = $tileMatrixSetLinkList;

        return $l;
    }

    /**
     * Get tile bbox.
     *
     * @param mixed $tileMatrixSet
     * @param mixed $tileMatrixId
     * @param mixed $tileRow
     * @param mixed $tileCol
     */
    public static function getTileBbox($tileMatrixSet, $tileMatrixId, $tileRow, $tileCol)
    {
        $tileWidth = 256.0;
        $tileHeight = 256.0;

        $tileMatrix = $tileMatrixSet->tileMatrixList[(int) $tileMatrixId];

        $res = $tileMatrix->resolution;
        $minx = $tileMatrix->left + ((int) $tileCol) * ($tileWidth * $res);
        $miny = $tileMatrix->top - ((int) $tileRow) * ($tileHeight * $res);
        $maxx = $tileMatrix->left + ((int) $tileCol + 1) * ($tileWidth * $res);
        $maxy = $tileMatrix->top - ((int) $tileRow + 1) * ($tileHeight * $res);

        return (string) $minx.','.(string) $miny.','.(string) $maxx.','.(string) $maxy;
    }

    private static function normalizeProjectScales($project)
    {
        $scales = array_merge(array(), $project->getOption('mapScales'));
        if ($scales[0] == 0) {
            $scales[0] = 1;
            trigger_error('The minimum scale cannot have a value of 0, redefined as 1.', E_USER_NOTICE);
        }
        rsort($scales);

        return $scales;
    }
}
