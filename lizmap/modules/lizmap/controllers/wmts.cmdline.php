<?php
/**
 * @author    your name
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    All rights reserved
 */
require JELIX_LIB_CORE_PATH.'request/jClassicRequest.class.php';

/**
 * @internal
 * @coversNothing
 */
class jCoordinatorForTest extends jCoordinator
{
    public function testSetRequest($request)
    {
        $this->setRequest($request);
    }
}

class wmtsCtrl extends jControllerCmdLine
{
    /**
     * Options to the command line
     *  'method_name' => array('-option_name' => true/false)
     * true means that a value should be provided for the option on the command line.
     */
    protected $allowed_options = array(
        'capabilities' => array(
            '-v' => false,
        ),
        'seeding' => array(
            '-v' => false,
            '-f' => false,
            '-bbox' => true,
        ),
    );

    /**
     * Parameters for the command line
     * 'method_name' => array('parameter_name' => true/false)
     * false means that the parameter is optional. All parameters which follow an optional parameter
     * is optional.
     */
    protected $allowed_parameters = array(
        'capabilities' => array(
            'repository' => true,
            'project' => true,
            'layer' => false,
            'TileMatrixSet' => false,
        ),
        'seeding' => array(
            'repository' => true,
            'project' => true,
            'layers' => true,
            'TileMatrixSet' => true,
            'TileMatrixMin' => true,
            'TileMatrixMax' => true,
        ),
    );

    /**
     * Help.
     */
    public $help = array(
        'capabilities' => 'Get seeding capabilities
    options:
        -v  verbose, provide tiles count for each TileMatrix
    parameters:
        repository      the repository id
        project         the project name
    optional prameters:
        layer           the layer name for which you want to know capabilities
        TileMatrixSet   the TileMatrixSet for which you want to know capabilites
    Use:
        php lizmap/scripts/script.php lizmap~wmts:capabilities [-v] repository project [layer] [TileMatrixSet]
        ',
        'seeding' => 'Generate cache for a layer
    options:
        -v  verbose
        -f  forced the cache generation, overwrite already done cache
        -bbox bounding box to restrict generation
    parameters:
        repository      the repository id
        project         the project name
        layers          the layer name list for which you want to generate the cache
        TileMatrixSet   the TileMatrixSet for which you want to generate the cache. The TileMatrixSet is a CRS
        TileMatrixMin   the min zoom level to generate
        TileMatrixMax   the min zoom level to generate
    Use:
        php lizmap/scripts/script.php lizmap~wmts:seeding [-v] [-f] [-bbox xmin,ymin,xmax,ymax] repository project layer TileMatrixSet TileMatrixMin TileMatrixMax
        ',
    );

    public function capabilities()
    {
        $fakeServer = new jelix\FakeServerConf\ApacheMod(jApp::wwwPath(), '/index.php');

        $verbose = $this->option('-v');

        $rep = $this->getResponse(); // cmdline response by default

        $project = null;

        try {
            $project = lizmap::getProject($this->param('repository').'~'.$this->param('project'));
            // Project not found
            if (!$project) {
                $rep->addContent("The project has not be found!\n");
                $rep->setExitCode(1);

                return $rep;
            }
        } catch (UnknownLizmapProjectException $e) {
            $rep->addContent("The project has not be found!\n");
            $rep->setExitCode(1);

            return $rep;
        }
        $repository = $project->getRepository();

        $tileCapabilities = null;

        try {
            $tileCapabilities = lizmapTiler::getTileCapabilities($project);
        } catch (Exception $e) {
            // if default profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::logEx($e, 'error');
            // Error message
            $rep->addContent("The cache is not available!\n");
            $rep->addContent($e->getMessage()."\n");
            $rep->setExitCode(1);

            return $rep;
        }

        if ($tileCapabilities === null ||
             $tileCapabilities->tileMatrixSetList === null ||
             $tileCapabilities->layerTileInfoList === null
        ) {
            // Error message
            $rep->addContent("The cache is not available!\n");
            $rep->addContent("The WMTS Service can't be initialized!\n");
            $rep->setExitCode(1);

            return $rep;
        }

        $layerId = $this->param('layer');
        $TileMatrixSetId = $this->param('TileMatrixSet');

        if (count($tileCapabilities->layerTileInfoList) === 0) {
            $rep->addContent("No layers configured with cache!\n");
            $rep->setExitCode(1);

            return $rep;
        }

        foreach ($tileCapabilities->layerTileInfoList as $layer) {
            if ($layerId && $layer->name != $layerId) {
                continue;
            }
            foreach ($layer->tileMatrixSetLinkList as $tileMatrixSetLink) {
                if ($TileMatrixSetId && $tileMatrixSetLink->ref != $TileMatrixSetId) {
                    continue;
                }
                if ($verbose) {
                    foreach ($tileMatrixSetLink->tileMatrixLimits as $tileMatrixLimit) {
                        $tmCount = ($tileMatrixLimit->maxRow - $tileMatrixLimit->minRow + 1) * ($tileMatrixLimit->maxCol - $tileMatrixLimit->minCol + 1);
                        $rep->addContent('For "'.$layer->name.'" and "'.$tileMatrixSetLink->ref.'" the TileMatrix '.$tileMatrixLimit->id.' has '.$tmCount.' tiles'."\n");
                    }
                } else {
                    $tmls = array();
                    foreach ($tileMatrixSetLink->tileMatrixLimits as $tileMatrixLimit) {
                        $tmls[] = $tileMatrixLimit->id;
                    }
                    $rep->addContent('For "'.$layer->name.'" and "'.$tileMatrixSetLink->ref.'" from TileMatrix '.min($tmls).' to '.max($tmls)."\n");
                }
            }
        }

        return $rep;
    }

    public function seeding()
    {
        $fakeServer = new jelix\FakeServerConf\ApacheMod(jApp::wwwPath(), '/index.php');

        $forced = $this->option('-f');
        $verbose = $this->option('-v');

        $rep = $this->getResponse(); // cmdline response by default

        $project = null;

        try {
            $project = lizmap::getProject($this->param('repository').'~'.$this->param('project'));
            // Project not found
            if (!$project) {
                $rep->addContent("The project has not be found!\n");
                $rep->setExitCode(1);

                return $rep;
            }
        } catch (UnknownLizmapProjectException $e) {
            $rep->addContent("The project has not be found!\n");
            $rep->setExitCode(1);

            return $rep;
        }
        $repository = $project->getRepository();

        $tileCapabilities = null;

        try {
            $tileCapabilities = lizmapTiler::getCalculatedTileCapabilities($project);
        } catch (Exception $e) {
            // if default profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::logEx($e, 'error');
            // Error message
            $rep->addContent("The cache is not available!\n");
            $rep->addContent($e->getMessage()."\n");
            $rep->setExitCode(1);

            return $rep;
        }

        if ($tileCapabilities === null ||
             $tileCapabilities->tileMatrixSetList === null ||
             $tileCapabilities->layerTileInfoList === null) {
            // Error message
            $rep->addContent("The cache is not available!\n");
            $rep->addContent("The WMTS Service has not been initialized!\n");

            try {
                $tileCapabilities = lizmapTiler::getTileCapabilities($project);
            } catch (Exception $e) {
                // if default profile does not exist, or if there is an
                // other error about the cache, let's log it
                jLog::logEx($e, 'error');
                // Error message
                $rep->addContent("The cache is not available!\n");
                $rep->addContent($e->getMessage()."\n");
                $rep->setExitCode(1);

                return $rep;
            }

            if ($tileCapabilities === null ||
                 $tileCapabilities->tileMatrixSetList === null ||
                 $tileCapabilities->layerTileInfoList === null) {
                // Error message
                $rep->addContent("The cache is not available!\n");
                $rep->addContent("The WMTS Service can't be initialized!\n");
                $rep->setExitCode(1);

                return $rep;
            }
            $rep->addContent("The WMTS Service has been initialized!\n");
        }

        if (count($tileCapabilities->layerTileInfoList) === 0) {
            $rep->addContent("No layers configured with cache!\n");
            $rep->setExitCode(1);

            return $rep;
        }

        $layerIds = explode(',', $this->param('layers'));
        $selectedLayers = array();
        foreach ($tileCapabilities->layerTileInfoList as $l) {
            if (in_array('*', $layerIds) || in_array($l->name, $layerIds)) {
                $selectedLayers[] = $l;
            }
        }
        // Layer not found
        if (count($selectedLayers) === 0) {
            $rep->addContent("The layers '".implode(',', $layerIds)."' have not be found!\n");
            $rep->setExitCode(1);

            return $rep;
        }

        $TileMatrixSetId = $this->param('TileMatrixSet');
        $tileMatrixSet = null;
        foreach ($tileCapabilities->tileMatrixSetList as $tms) {
            $rep->addContent("The TileMatrixSet '".$tms->ref."'!\n");
            if ($tms->ref == $TileMatrixSetId) {
                $tileMatrixSet = $tms;

                break;
            }
        }

        // TileMatrixSet not found
        if (!$tileMatrixSet) {
            $rep->addContent("The TileMatrixSet '".$TileMatrixSetId."' has not be found!\n");
            $rep->setExitCode(1);

            return $rep;
        }

        $bbox = $this->option('-bbox');
        if ($bbox) {
            $bbox = explode(',', $bbox);
            if (count($bbox) != 4) {
                $rep->addContent("The optional bbox has to contain 4 numbers separated by comma!\n");
                $rep->setExitCode(1);

                return $rep;
            }
            $nbbox = array();
            foreach ($bbox as $b) {
                if (!is_numeric($b)) {
                    $rep->addContent("The optional bbox has to contain 4 numbers separated by comma!\n");
                    $rep->setExitCode(1);

                    return $rep;
                }
                $nbbox[] = (float) $b;
            }
            $bbox = $nbbox;
        }

        foreach ($selectedLayers as $layer) {
            $tileMatrixSetLink = null;
            foreach ($layer->tileMatrixSetLinkList as $tms) {
                if ($tms->ref == $TileMatrixSetId) {
                    $tileMatrixSetLink = $tms;

                    break;
                }
            }

            $TileMatrixMin = (int) $this->param('TileMatrixMin');
            $TileMatrixMax = (int) $this->param('TileMatrixMax');
            // count tiles
            $tileCount = 0;
            $tileMatrixLimits = array();
            foreach ($tileMatrixSetLink->tileMatrixLimits as $tileMatrixLimit) {
                if ($tileMatrixLimit->id >= $TileMatrixMin && $tileMatrixLimit->id <= $TileMatrixMax) {
                    if ($bbox) {
                        $width = 256.0;
                        $height = 256.0;
                        $tileMatrix = $tileMatrixSet->tileMatrixList[(int) $tileMatrixLimit->id];
                        $res = $tileMatrix->resolution;

                        $minCol = floor(($bbox[0] - $tileMatrix->left) / ($width * $res));
                        $maxCol = ceil(($bbox[2] - $tileMatrix->left) / ($width * $res));
                        $minRow = floor(($tileMatrix->top - $bbox[3]) / ($height * $res));
                        $maxRow = ceil(($tileMatrix->top - $bbox[1]) / ($height * $res));

                        $tileMatrix = (object) array(
                            id => $tileMatrixLimit->id,
                            minRow => min($minRow, $tileMatrixLimit->minRow),
                            minCol => min($minCol, $tileMatrixLimit->minCol),
                            maxRow => min($maxRow, $tileMatrixLimit->maxRow),
                            maxCol => min($maxCol, $tileMatrixLimit->maxCol),
                        );
                        $tileMatrixLimits[] = $tileMatrix;

                        $tmCount = ($tileMatrix->maxRow - $tileMatrix->minRow + 1) * ($tileMatrix->maxCol - $tileMatrix->minCol + 1);
                        if ($verbose) {
                            $rep->addContent($tmCount.' tiles to generate for "'.$layer->name.'" "'.$TileMatrixSetId.'" "'.$tileMatrixLimit->id.'" "'.implode(',', $bbox).'"'."\n");
                        }
                        $tileCount += $tmCount;
                    } else {
                        $tileMatrixLimits[] = $tileMatrixLimit;

                        $tmCount = ($tileMatrixLimit->maxRow - $tileMatrixLimit->minRow + 1) * ($tileMatrixLimit->maxCol - $tileMatrixLimit->minCol + 1);
                        if ($verbose) {
                            $rep->addContent($tmCount.' tiles to generate for "'.$layer->name.'" "'.$TileMatrixSetId.'" "'.$tileMatrixLimit->id.'"'."\n");
                        }
                        $tileCount += $tmCount;
                    }
                }
            }
            if ($verbose) {
                $rep->addContent($tileCount.' tiles to generate for "'.$layer->name.'" "'.$TileMatrixSetId.'" between "'.$TileMatrixMin.'" and "'.$TileMatrixMax.'"'."\n");
            }

            // generate tiles
            $rep->addContent("Start generation\n");
            $rep->addContent("================\n");
            $tileProgress = 0;
            $tileStepHeight = max(5.0, floor(5 * 100 / $tileCount));
            $tileStep = $tileStepHeight;
            foreach ($tileMatrixLimits as $tileMatrixLimit) {
                if ($tileMatrixLimit->id >= $TileMatrixMin && $tileMatrixLimit->id <= $TileMatrixMax) {
                    $row = (int) $tileMatrixLimit->minRow;
                    //$rep->addContent( $tileMatrixLimit->id.' '.$tileMatrixLimit->minRow.' '.$tileMatrixLimit->maxRow.' '.$tileMatrixLimit->minCol.' '.$tileMatrixLimit->maxCol."\n");
                    while ($row <= $tileMatrixLimit->maxRow) {
                        $col = (int) $tileMatrixLimit->minCol;
                        while ($col <= $tileMatrixLimit->maxCol) {
                            $request = new lizmapWMTSRequest(
                                $project,
                                array(
                                    'service' => 'WMTS',
                                    'version' => '1.0.0',
                                    'request' => 'GetTile',
                                    'layer' => $layer->name,
                                    'format' => $layer->imageFormat,
                                    'TileMatrixSet' => $TileMatrixSetId,
                                    'TileMatrix' => $tileMatrixLimit->id,
                                    'TileRow' => $row,
                                    'TileCol' => $col,
                                )
                            );
                            if ($forced) {
                                $request->setForceRequest(true);
                            }
                            $result = $request->process();
                            if (!preg_match('/^image/', $result->mime)) {
                                $rep->addContent('Error for tile: '.$layer->name.' / '.$TileMatrixSetId.' / '.$tileMatrixLimit->id.' / '.$row.' / '.$col."\n");
                            }
                            if (!$result->cached) {
                                $rep->addContent('Error, tile not cached: '.$layer->name.' / '.$TileMatrixSetId.' / '.$tileMatrixLimit->id.' / '.$row.' / '.$col."\n");
                            }
                            //$rep->addContent($layer->name.' '.$layer->imageFormat.' '.$TileMatrixSetId.' '.$tileMatrixLimit->id.' '.$row.' '.$col.' '.$result->code."\n");
                            ++$col;
                            ++$tileProgress;
                            if ($verbose && $tileProgress * 100 / $tileCount >= $tileStep) {
                                $tileStep = floor($tileProgress * 100 / $tileCount);
                                $rep->addContent('Progression: '.$tileStep.'%, '.$tileProgress.' tiles generated on '.$tileCount.' tiles'."\n");
                                $tileStep = $tileStep + $tileStepHeight;
                            }
                        }
                        ++$row;
                    }
                }
            }
            $rep->addContent("================\n");
            $rep->addContent("End generation\n");
        }

        return $rep;
    }
}
