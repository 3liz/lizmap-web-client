<?php
/**
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License
 */
class serviceCtrl extends jController
{
    private $repository;
    private $project;
    private $config;

    public function __construct($request)
    {
        parent::__construct($request);
    }

    public function index()
    {
        $rep = $this->getResponse('json');

        // Check project
        $repository = $this->param('repository');
        $project = $this->param('project');

        // Check dataviz config
        jClasses::inc('dataviz~datavizConfig');
        $dv = new datavizConfig($repository, $project);
        if (!$dv->getStatus()) {
            return $this->error($dv->getErrors());
        }
        $config = $dv->getConfig();
        if (empty($config)) {
            return $this->error($dv->getErrors());
        }
        $this->repository = $repository;
        $this->project = $project;
        $this->config = $config;

        // Redirect to method corresponding on REQUEST param
        $request = $this->param('request', 'getPlot');
        if ($request == 'getPlot') {
            return $this->getPlot();
        }
    }

    public function error($errors)
    {
        $rep = $this->getResponse('json');
        $rep->data = array('errors' => $errors);

        return $rep;
    }

    public function getPlot()
    {
        $rep = $this->getResponse('json');

        // Get params
        $repository = $this->param('repository');
        $project = $this->param('project');
        $plot_id = $this->intParam('plot_id');
        $exp_filter = trim($this->param('exp_filter'));
        $color = null;
        $color2 = null;
        $layout = null;

        $layerId = null;

        // Fins layer by id
        if (array_key_exists($plot_id, $this->config['layers'])) {
            $plotConfig = $this->config['layers'][$plot_id];
        } else {
            return array(
                'errors' => array(
                    'title' => 'No corresponding plot',
                    'detail' => 'No plot could be created for this request',
                ),
            );
        }

        // Create plot
        jClasses::inc('dataviz~datavizPlot');
        $type = $plotConfig['plot']['type'];
        if ($type == 'scatter') {
            $dplot = new datavizPlotScatter($repository, $project, $layerId, $plotConfig);
        } elseif ($type == 'box') {
            $dplot = new datavizPlotBox($repository, $project, $layerId, $plotConfig);
        } elseif ($type == 'bar') {
            $dplot = new datavizPlotBar($repository, $project, $layerId, $plotConfig);
        } elseif ($type == 'histogram') {
            $dplot = new datavizPlotHistogram($repository, $project, $layerId, $plotConfig);
        } elseif ($type == 'pie') {
            $dplot = new datavizPlotPie($repository, $project, $layerId, $plotConfig);
        } elseif ($type == 'histogram2d') {
            $dplot = new datavizPlotHistogram2d($repository, $project, $layerId, $plotConfig);
        } elseif ($type == 'polar') {
            $dplot = new datavizPlotPolar($repository, $project, $layerId, $plotConfig);
        } else {
            $dplot = null;
        }
        if (!$dplot) {
            return array(
                'errors' => array(
                    'title' => 'No corresponding plot',
                    'detail' => 'No plot could be created for this request',
                ),
            );
        }

        $fd = $dplot->fetchData('wfs', $exp_filter);
        $plot = array(
            'title' => $dplot->title,
            'data' => $dplot->getData(),
            'layout' => $dplot->getLayout(),
        );

        $rep->data = $plot;

        return $rep;
    }
}
