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
        $color = null;
        $layout = null;

        // Default values
        $title = $this->param('title');
        $type = $this->param('type');
        $y_field = $this->param('y_field');
        $x_field = $this->param('x_field');
        $color = $this->param('color', null);

        $layerId = null;

        // Fins layer by id
        if( array_key_exists($plot_id, $this->config['layers']) ){
            $plot = $this->config['layers'][$plot_id];
            $layerId = $plot['layer_id'];
            $title = $plot['title'];
            $abstract = $plot['abstract'];
            $type = $plot['plot']['type'];
            $y_field = $plot['plot']['y_field'];
            $x_field = $plot['plot']['x_field'];
            if( array_key_exists('color', $plot['plot']) )
                $color = $plot['plot']['color'];
            if( array_key_exists('layout_config', $plot['plot']) )
                $layout = $plot['plot']['layout_config'];

        }

        // Create plot
        jClasses::inc('dataviz~datavizPlot');
        if( $type == 'pie'){
            $dplot = new datavizPlotPie(  $repository, $project, $x_field, $y_field, $color, $title, $layout );
        }
        elseif( $type == 'bar'){
            $dplot = new datavizPlotBar(  $repository, $project, $x_field, $y_field, $color, $title, $layout );
        }
        elseif( $type == 'bar_h'){
            $dplot = new datavizPlotBarH(  $repository, $project, $x_field, $y_field, $color, $title, $layout );
        }
        elseif( $type == 'scatter'){
            $dplot = new datavizPlotScatter(  $repository, $project, $x_field, $y_field, $color, $title, $layout );
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

        $fd = $dplot->fetchData($layerId, 'wfs');
        $plot = array(
            'title' => $dplot->title,
            'data' => $dplot->getData(),
            'layout' => $dplot->getLayout()
        );

        $rep->data = $plot;
        return $rep;

    }

}
