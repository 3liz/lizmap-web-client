<?php

use Jelix\FakeServerConf\ApacheMod;
use Lizmap\CliHelpers\WMTSCache;

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
 *
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
            '-dry-run' => false,
        ),
        'cleaning' => array(
            '-v' => false,
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
        'cleaning' => array(
            'repository' => true,
            'project' => true,
            'layer' => false,
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
        -v       verbose
        -f       forced the cache generation, overwrite already done cache
        -bbox    bounding box to restrict generation
        -dry-run it does not generate the cache, it only gives statistics
    parameters:
        repository      the repository id
        project         the project name
        layers          the layer name list for which you want to generate the cache
        TileMatrixSet   the TileMatrixSet for which you want to generate the cache. The TileMatrixSet is a CRS
        TileMatrixMin   the min zoom level to generate
        TileMatrixMax   the max zoom level to generate
    Use:
        php lizmap/scripts/script.php lizmap~wmts:seeding [-v] [-f] [-dry-run] [-bbox xmin,ymin,xmax,ymax] repository project layer TileMatrixSet TileMatrixMin TileMatrixMax
        ',
        'cleaning' => 'Cleaning cache
    options:
        -v  verbose
    parameters:
        repository      the repository id
        project         the project name
    optional prameters:
        layer           the layer name for which you want to clean the cache
    Use:
        php lizmap/scripts/script.php lizmap~wmts:cleaning [-v] repository project [layer]
        ',
    );

    public function capabilities()
    {
        $fakeServer = new ApacheMod(jApp::wwwPath(), '/index.php');

        /** @var jResponseCmdline $rep */
        $rep = $this->getResponse(); // cmdline response by default
        $rep->addContent("Using this command is deprecated, all commands are now unified in console.php
        In lizmap folder, use 'php console.php wmts:capabilities <repository> <project> [layer] [tileMatrix]'\n\n");

        $WMTSCache = new WMTSCache(function ($str) use ($rep) {$rep->addContent($str."\n"); });

        $returnCode = $WMTSCache->capabilities(
            $this->param('repository'),
            $this->param('project'),
            $this->param('layer'),
            $this->param('TileMatrixSet'),
            $this->option('-v')
        );

        $rep->setExitCode($returnCode);

        return $rep;
    }

    public function seeding()
    {
        $fakeServer = new ApacheMod(jApp::wwwPath(), '/index.php');

        /** @var jResponseCmdline $rep */
        $rep = $this->getResponse();
        $rep->addContent("Using this command is deprecated, all commands are now unified in console.php
        In lizmap folder, use 'php console.php wmts:cache:seed <repository> <project> <layers> <TileMatrixSet> <TileMatrixMin> <TileMatrixMax>'\n\n");
        $tileMatrixMin = $this->param('TileMatrixMin');
        $tileMatrixMax = $this->param('TileMatrixMax');
        if (!(filter_var($tileMatrixMin, FILTER_VALIDATE_INT) && filter_var($tileMatrixMax, FILTER_VALIDATE_INT))) {
            $rep->addContent("TileMatrixMin and TileMatrixMax must be of type int\n");
            $rep->setExitCode(1);

            return $rep;
        }

        $WMTSCache = new WMTSCache(function ($str) use ($rep) {$rep->addContent($str."\n"); });

        $returnCode = $WMTSCache->seed(
            $this->param('repository'),
            $this->param('project'),
            $this->param('layers'),
            $this->param('TileMatrixSet'),
            $tileMatrixMin,
            $tileMatrixMax,
            $this->option('bbox'),
            $this->option('-v'),
            $this->option('-dry-run'),
            $this->option('-f')
        );

        $rep->setExitCode($returnCode);

        return $rep;
    }

    public function cleaning()
    {
        $fakeServer = new ApacheMod(jApp::wwwPath(), '/index.php');

        /** @var jResponseCmdline $rep */
        $rep = $this->getResponse();
        $rep->addContent("Using this command is deprecated, all commands are now unified in console.php
        In lizmap folder, use 'php console.php wmts:cache:clean <repository> <project>'\n\n");

        $WMTSCache = new WMTSCache(function ($str) use ($rep) {$rep->addContent($str."\n"); });
        $returnCode = $WMTSCache->clean(
            $this->param('repository'),
            $this->param('project'),
            $this->param('layer')
        );
        $rep->setExitCode($returnCode);

        return $rep;
    }
}
