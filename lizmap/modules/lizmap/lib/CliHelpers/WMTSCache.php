<?php

namespace Lizmap\CliHelpers;

use Lizmap\Project\UnknownLizmapProjectException;
use Lizmap\Request\Proxy;
use Lizmap\Request\WMTSRequest;

class WMTSCache
{
    private $outputFunc;

    public function __construct(callable $outputFunc)
    {
        if (!is_callable($outputFunc)) {
            throw new \Exception('output Callback not callable');
        }
        $this->outputFunc = $outputFunc;
    }

    private function getProject($repoName, $projectName)
    {
        $project = null;

        try {
            $project = \lizmap::getProject($repoName.'~'.$projectName);
            // Project not found
            if (!$project) {
                throw new \Exception('Unknown repository!');
            }
        } catch (UnknownLizmapProjectException $e) {
            throw new \Exception('The project has not be found!');
        }

        return $project;
    }

    /**
     * display WMTS Capabalities for a whole project or a specific layer.
     *
     * @param null|string $layerName
     * @param null|string $tileMatrixSetId
     */
    public function capabilities(string $repoName, string $projectName, $layerName, $tileMatrixSetId, bool $verbose): int
    {
        $outputCallback = $this->outputFunc;
        $project = null;

        try {
            $project = $this->getProject($repoName, $projectName);
        } catch (\Exception $e) {
            $outputCallback($e->getMessage());

            return 1;
        }

        $tileCapabilities = null;

        try {
            $tileCapabilities = \lizmapTiler::getTileCapabilities($project);
        } catch (\Exception $e) {
            // if default profile does not exist, or if there is an
            // other error about the cache, let's log it
            \jLog::logEx($e, 'error');
            // Error message
            $outputCallback('The cache is not available!');
            $outputCallback($e->getMessage().'');

            return 1;
        }

        if ($tileCapabilities === null
             || $tileCapabilities->tileMatrixSetList === null
             || $tileCapabilities->layerTileInfoList === null
        ) {
            // Error message
            $outputCallback('The cache is not available!');
            $outputCallback("The WMTS Service can't be initialized!");

            return 1;
        }

        if (count($tileCapabilities->layerTileInfoList) === 0) {
            $outputCallback('No layers configured with cache!');

            return 1;
        }
        $layerFound = false;
        $tileMatrixFound = false;
        foreach ($tileCapabilities->layerTileInfoList as $layer) {
            if ($layerName && $layer->name != $layerName) {
                continue;
            }
            $layerFound = true;
            foreach ($layer->tileMatrixSetLinkList as $tileMatrixSetLink) {
                if ($tileMatrixSetId && $tileMatrixSetLink->ref != $tileMatrixSetId) {
                    continue;
                }
                $tileMatrixFound = true;
                if ($verbose) {
                    foreach ($tileMatrixSetLink->tileMatrixLimits as $tileMatrixLimit) {
                        $tmCount = ($tileMatrixLimit->maxRow - $tileMatrixLimit->minRow + 1) * ($tileMatrixLimit->maxCol - $tileMatrixLimit->minCol + 1);
                        $outputCallback('For "'.$layer->name.'" and "'.$tileMatrixSetLink->ref.'" the TileMatrix '.$tileMatrixLimit->id.' has '.$tmCount.' tiles');
                    }
                } else {
                    $tmls = array();
                    foreach ($tileMatrixSetLink->tileMatrixLimits as $tileMatrixLimit) {
                        $tmls[] = $tileMatrixLimit->id;
                    }
                    $outputCallback('For "'.$layer->name.'" and "'.$tileMatrixSetLink->ref.'" from TileMatrix '.min($tmls).' to '.max($tmls).'');
                }
            }
        }
        if (!$layerFound) {
            $outputCallback('layer '.$layerName.' not found');
        }
        if (!$tileMatrixFound) {
            $outputCallback('TileMatrixSet '.$tileMatrixSetId.' not found');
        }

        return 0;
    }

    public function seed(string $repoName, string $projectName, string $layers, string $tileMatrixSetId, int $tileMatrixMin, int $tileMatrixMax, $bbox, bool $verbose, bool $dryRun, bool $forced)
    {
        $outputCallback = $this->outputFunc;

        try {
            $project = $this->getProject($repoName, $projectName);
        } catch (\Exception $e) {
            $outputCallback($e->getMessage());

            return 1;
        }
        $tileCapabilities = null;

        try {
            $tileCapabilities = \lizmapTiler::getCalculatedTileCapabilities($project);
        } catch (\Exception $e) {
            // if default profile does not exist, or if there is an
            // other error about the cache, let's log it
            \jLog::logEx($e, 'error');
            // Error message
            $outputCallback('The cache is not available!');
            $outputCallback($e->getMessage());

            return 1;
        }

        if ($tileCapabilities === null
             || $tileCapabilities->tileMatrixSetList === null
             || $tileCapabilities->layerTileInfoList === null) {
            // Error message
            $outputCallback('The cache is not available!');
            $outputCallback('The WMTS Service has not been initialized!');

            try {
                $tileCapabilities = \lizmapTiler::getTileCapabilities($project);
            } catch (\Exception $e) {
                // if default profile does not exist, or if there is an
                // other error about the cache, let's log it
                \jLog::logEx($e, 'error');
                // Error message
                $outputCallback('The cache is not available!');
                $outputCallback($e->getMessage().'');

                return 1;
            }

            if ($tileCapabilities === null
                 || $tileCapabilities->tileMatrixSetList === null
                 || $tileCapabilities->layerTileInfoList === null) {
                // Error message
                $outputCallback('The cache is not available!');
                $outputCallback("The WMTS Service can't be initialized!");

                return 1;
            }
            $outputCallback('The WMTS Service has been initialized!');
        }

        if (count($tileCapabilities->layerTileInfoList) === 0) {
            $outputCallback('No layers configured with cache!');

            return 1;
        }

        $layerIds = explode(',', $layers);
        $selectedLayers = array();
        foreach ($tileCapabilities->layerTileInfoList as $l) {
            if (in_array('*', $layerIds) || in_array($l->name, $layerIds)) {
                $selectedLayers[] = $l;
            }
        }
        // Layer not found
        if (count($selectedLayers) === 0) {
            $outputCallback("The layers '".implode(',', $layerIds)."' have not be found!");

            return 1;
        }

        $tileMatrixSet = null;
        foreach ($tileCapabilities->tileMatrixSetList as $tms) {
            $outputCallback("The TileMatrixSet '".$tms->ref."'!");
            if ($tms->ref == $tileMatrixSetId) {
                $tileMatrixSet = $tms;

                break;
            }
        }

        // TileMatrixSet not found
        if (!$tileMatrixSet) {
            $outputCallback("The TileMatrixSet '".$tileMatrixSetId."' has not be found!");

            return 1;
        }

        if ($bbox) {
            $bbox = explode(',', $bbox);
            if (count($bbox) != 4) {
                $outputCallback('The optional bbox has to contain 4 numbers separated by comma!');

                return 1;
            }
            $nbbox = array();
            foreach ($bbox as $b) {
                if (!is_numeric($b)) {
                    $outputCallback('The optional bbox has to contain 4 numbers separated by comma!');

                    return 1;
                }
                $nbbox[] = (float) $b;
            }
            $bbox = $nbbox;
        }

        foreach ($selectedLayers as $layer) {
            $tileMatrixSetLink = null;
            foreach ($layer->tileMatrixSetLinkList as $tms) {
                if ($tms->ref == $tileMatrixSetId) {
                    $tileMatrixSetLink = $tms;

                    break;
                }
            }

            // count tiles
            $tileCount = 0;
            $tileMatrixLimits = array();
            foreach ($tileMatrixSetLink->tileMatrixLimits as $tileMatrixLimit) {
                if ($tileMatrixLimit->id >= $tileMatrixMin && $tileMatrixLimit->id <= $tileMatrixMax) {
                    if ($bbox) {
                        $width = 256.0;
                        $height = 256.0;
                        $tileMatrix = $tileMatrixSet->tileMatrixList[(int) $tileMatrixLimit->id];
                        $res = $tileMatrix->resolution;

                        $minCol = floor(($bbox[0] - $tileMatrix->left) / ($width * $res));
                        $maxCol = floor(($bbox[2] - $tileMatrix->left) / ($width * $res));
                        $minRow = floor(($tileMatrix->top - $bbox[3]) / ($height * $res));
                        $maxRow = floor(($tileMatrix->top - $bbox[1]) / ($height * $res));

                        $tileMatrix = (object) array(
                            'id' => $tileMatrixLimit->id,
                            'minRow' => max($minRow, $tileMatrixLimit->minRow),
                            'minCol' => max($minCol, $tileMatrixLimit->minCol),
                            'maxRow' => min($maxRow, $tileMatrixLimit->maxRow),
                            'maxCol' => min($maxCol, $tileMatrixLimit->maxCol),
                        );

                        if (($tileMatrix->maxRow < $tileMatrix->minRow) || ($tileMatrix->maxCol < $tileMatrix->minCol)) {
                            // the BBox is out of tile matrix limit
                            // do not save tile matrix
                            continue;
                        }

                        $tileMatrixLimits[] = $tileMatrix;

                        $tmCount = ($tileMatrix->maxRow - $tileMatrix->minRow + 1) * ($tileMatrix->maxCol - $tileMatrix->minCol + 1);
                        if ($verbose || $dryRun) {
                            $outputCallback($tmCount.' tiles to generate for "'.$layer->name.'" "'.$tileMatrixSetId.'" "'.$tileMatrixLimit->id.'" "'.implode(',', $bbox).'"');
                        }
                        $tileCount += $tmCount;
                    } else {
                        $tileMatrixLimits[] = $tileMatrixLimit;

                        $tmCount = ($tileMatrixLimit->maxRow - $tileMatrixLimit->minRow + 1) * ($tileMatrixLimit->maxCol - $tileMatrixLimit->minCol + 1);
                        if ($verbose || $dryRun) {
                            $outputCallback($tmCount.' tiles to generate for "'.$layer->name.'" "'.$tileMatrixSetId.'" "'.$tileMatrixLimit->id.'"');
                        }
                        $tileCount += $tmCount;
                    }
                }
            }
            if ($verbose || $dryRun) {
                $outputCallback($tileCount.' tiles to generate for "'.$layer->name.'" "'.$tileMatrixSetId.'" between "'.$tileMatrixMin.'" and "'.$tileMatrixMax.'"');
            }
            if ($dryRun) {
                return 0;
            }

            // generate tiles
            $outputCallback('Start generation');
            $outputCallback('================');
            $tileProgress = 0;
            $tileStepHeight = max(5.0, floor(5 * 100 / $tileCount));
            $tileStep = $tileStepHeight;
            foreach ($tileMatrixLimits as $tileMatrixLimit) {
                if ($tileMatrixLimit->id >= $tileMatrixMin && $tileMatrixLimit->id <= $tileMatrixMax) {
                    $row = (int) $tileMatrixLimit->minRow;
                    // $outputCallback( $tileMatrixLimit->id.' '.$tileMatrixLimit->minRow.' '.$tileMatrixLimit->maxRow.' '.$tileMatrixLimit->minCol.' '.$tileMatrixLimit->maxCol."");
                    while ($row <= $tileMatrixLimit->maxRow) {
                        $col = (int) $tileMatrixLimit->minCol;
                        while ($col <= $tileMatrixLimit->maxCol) {
                            $request = new WMTSRequest(
                                $project,
                                array(
                                    'service' => 'WMTS',
                                    'version' => '1.0.0',
                                    'request' => 'GetTile',
                                    'layer' => $layer->name,
                                    'format' => $layer->imageFormat,
                                    'TileMatrixSet' => $tileMatrixSetId,
                                    'TileMatrix' => $tileMatrixLimit->id,
                                    'TileRow' => $row,
                                    'TileCol' => $col,
                                ),
                                \lizmap::getServices()
                            );
                            if ($forced) {
                                $request->setForceRequest(true);
                            }
                            $result = $request->process();
                            if (!preg_match('/^image/', $result->mime)) {
                                $outputCallback('Error for tile: '.$layer->name.' / '.$tileMatrixSetId.' / '.$tileMatrixLimit->id.' / '.$row.' / '.$col.'');
                            }
                            if (!$result->cached) {
                                $outputCallback('Error, tile not cached: '.$layer->name.' / '.$tileMatrixSetId.' / '.$tileMatrixLimit->id.' / '.$row.' / '.$col.'');
                            }
                            // $outputCallback($layer->name.' '.$layer->imageFormat.' '.$TileMatrixSetId.' '.$tileMatrixLimit->id.' '.$row.' '.$col.' '.$result->code."");
                            ++$col;
                            ++$tileProgress;
                            if ($verbose && $tileProgress * 100 / $tileCount >= $tileStep) {
                                $tileStep = floor($tileProgress * 100 / $tileCount);
                                $outputCallback('Progression: '.$tileStep.'%, '.$tileProgress.' tiles generated on '.$tileCount.' tiles');
                                $tileStep += $tileStepHeight;
                            }
                        }
                        ++$row;
                    }
                }
            }
            $outputCallback('================');
            $outputCallback('End generation');

            return 0;
        }
    }

    public function clean($repoName, $projectName, $layer)
    {
        $outputCallback = $this->outputFunc;
        $project = null;

        try {
            $project = $this->getProject($repoName, $projectName);
        } catch (\Exception $e) {
            $outputCallback($e->getMessage());

            return 1;
        }
        $repository = $project->getRepository();

        $tileCapabilities = null;

        try {
            $tileCapabilities = \lizmapTiler::getTileCapabilities($project);
        } catch (\Exception $e) {
            // if default profile does not exist, or if there is an
            // other error about the cache, let's log it
            \jLog::logEx($e, 'error');
            // Error message

            $outputCallback('The cache is not available!');
            $outputCallback($e->getMessage());

            return 5;
        }

        if ($tileCapabilities === null
             || $tileCapabilities->tileMatrixSetList === null
             || $tileCapabilities->layerTileInfoList === null
        ) {
            // Error message
            $outputCallback('The cache is not available!');
            $outputCallback('The WMTS Service can\'t be initialized!');

            return 5;
        }

        $layerId = $layer;

        if (count($tileCapabilities->layerTileInfoList) === 0) {
            $outputCallback('No layers configured with cache!');

            return 5;
        }

        $outputCallback('Start cleaning');
        $outputCallback('================');
        if ($layerId) {
            $result = Proxy::clearLayerCache($repository->getKey(), $project->getKey(), $layerId);
        } else {
            $result = Proxy::clearProjectCache($repository->getKey(), $project->getKey());
        }
        $outputCallback('================');
        if (!$result) {
            $outputCallback('End cleaning');
        } else {
            $outputCallback('Error cleaning');

            return 5;
        }

        return 0;
    }
}
