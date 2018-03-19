<?php
/**
* @package   lizmap
* @subpackage dataviz
* @author    3liz
* @copyright 2017 3liz
* @link      http://3liz.com
* @license    Mozilla Public License
*/

class serviceCtrl extends jController {


    private $repository = null;
    private $project = null;
    private $config = null;

    function __construct( $request ){

        parent::__construct( $request );

    }

    public function index(){

        $rep = $this->getResponse('json');

        // Check project
        $repository = $this->param('repository');
        $project = $this->param('project');

        // Check dataviz config
        jClasses::inc('dataviz~datavizConfig');
        $dv = new datavizConfig($repository, $project);
        if(!$dv->getStatus()){
            return $this->error($dv->getErrors());
        }
        $config = $dv->getConfig();
        if( empty($config) ){
            return $this->error($dv->getErrors());
        }
        $this->repository = $repository;
        $this->project = $project;
        $this->config = $config;

        // Redirect to method corresponding on REQUEST param
        $request = $this->param('request', 'getPlot');
        if($request == 'getPlot')
            return $this->getPlot();

    }

    public function error($errors){
        $rep = $this->getResponse('json');
        $rep->data = array( 'errors' => $errors);
        return $rep;
    }

    public function getPlot() {

        $rep = $this->getResponse('json');

        // Get params
        $repository = $this->param('repository');
        $project = $this->param('project');
        $plot_id = $this->intParam('plot_id');
        $exp_filter = trim($this->param('exp_filter'));
        $color = null;
        $color2 = null;
        $layout = null;

        // Default values
        $title = $this->param('title');
        $type = $this->param('type');
        $x_field = $this->param('x_field');
        $aggregation = $this->param('aggregation', null);
        $y_field = $this->param('y_field');
        $y2_field = $this->param('y2_field');
        $color = $this->param('color', null);
        $color2 = $this->param('color2', null);

        $layerId = null;

        // Fins layer by id
        if( array_key_exists($plot_id, $this->config['layers']) ){
            $plot = $this->config['layers'][$plot_id];
            $layerId = $plot['layer_id'];
            $title = $plot['title'];
            $abstract = $plot['abstract'];
            $type = $plot['plot']['type'];
            $x_field = $plot['plot']['x_field'];
            $y_field = $plot['plot']['y_field'];

            $y2_field = Null;
            if(array_key_exists('y2_field', $plot['plot']))
                $y2_field = $plot['plot']['y2_field'];
            if(!empty($y2_field)){
                $y_field = $y_field . ',' . $y2_field;
            }
            if(array_key_exists('aggregation', $plot['plot']))
                $aggregation = $plot['plot']['aggregation'];

            // Colors
            $colors = array();
            if( array_key_exists('color', $plot['plot']) ){
                $color = $plot['plot']['color'];
                $colors[] = $color;
            }
            if( array_key_exists('color2', $plot['plot']) ){
                $color2 = $plot['plot']['color2'];
                $colors[] = $color2;
            }

            if( array_key_exists('layout_config', $plot['plot']) )
                $layout = $plot['plot']['layout_config'];
        }

        // Create plot
        jClasses::inc('dataviz~datavizPlot');

        if( $type == 'scatter'){
            $dplot = new datavizPlotScatter(  $repository, $project, $layerId, $x_field, $y_field, $colors, $title, $layout, $aggregation );
        }
        elseif( $type == 'box'){
            $dplot = new datavizPlotBox(  $repository, $project, $layerId, $x_field, $y_field, $colors, $title, $layout, $aggregation );
        }
        elseif( $type == 'bar'){
            $dplot = new datavizPlotBar(  $repository, $project, $layerId, $x_field, $y_field, $colors, $title, $layout, $aggregation );
        }
        elseif( $type == 'histogram'){
            $dplot = new datavizPlotHistogram(  $repository, $project, $layerId, $x_field, $y_field, $colors, $title, $layout, $aggregation );
        }
        elseif( $type == 'pie'){
            $dplot = new datavizPlotPie(  $repository, $project, $layerId, $x_field, $y_field, $colors, $title, $layout, $aggregation );
        }
        elseif( $type == 'histogram2d'){
            $dplot = new datavizPlotHistogram2d(  $repository, $project, $layerId, $x_field, $y_field, $colors, $title, $layout, $aggregation );
        }
        elseif( $type == 'polar'){
            $dplot = new datavizPlotPolar(  $repository, $project, $layerId, $x_field, $y_field, $colors, $title, $layout, $aggregation );
        }
        else{
            $dplot = null;
        }
        if(!$dplot){
            $plot = array(
                'errors' => array(
                    'title'=>'No corresponding plot',
                    'detail'=>'No plot could be created for this request'
                )
            );
            return $plot;
        }

        $fd = $dplot->fetchData('wfs', $exp_filter);
        $plot = array(
            'title' => $dplot->title,
            'data' => $dplot->getData(),
            'layout' => $dplot->getLayout()
        );

        $rep->data = $plot;
        return $rep;

    }

}
