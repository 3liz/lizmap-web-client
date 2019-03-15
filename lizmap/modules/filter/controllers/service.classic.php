<?php
/**
* @package   lizmap
* @subpackage filter
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

        // Check filter config
        jClasses::inc('filter~filterConfig');
        $dv = new filterConfig($repository, $project);
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
        $request = $this->param('request', 'getFeatureCount');
        switch ($request) {
            case 'getFeatureCount':
                return $this->getFeatureCount();
                break;
            case 'getUniqueValues':
                return $this->getUniqueValues();
                break;
            case 'getMinAndMaxValues':
                return $this->getMinAndMaxValues();
                break;
            case 'getExtent':
                return $this->getExtent();
                break;
        }

        $rep->data = array();
        return $rep;

    }

    public function error($errors){
        $rep = $this->getResponse('json');
        $rep->data = array( 'errors' => $errors);
        return $rep;
    }

    public function getFeatureCount(){
        $rep = $this->getResponse('json');

         // Get params
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');
        $filter = trim($this->param('filter', null));

        // Get data
        jClasses::inc('filter~filterDatasource');
        $f = new filterDatasource(  $repository, $project, $layerId );
        $rep->data = $f->getFeatureCount($filter);

        return $rep;
    }

    public function getUniqueValues(){
        $rep = $this->getResponse('json');

        // Get params
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');
        $filter = trim($this->param('filter', null));
        $fieldname = trim($this->param('fieldname'));

        // Get data
        jClasses::inc('filter~filterDatasource');
        $f = new filterDatasource(  $repository, $project, $layerId );
        $rep->data = $f->getUniqueValues($fieldname, $filter);

        return $rep;
    }

    public function getMinAndMaxValues(){
        $rep = $this->getResponse('json');

        // Get params
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');
        $filter = trim($this->param('filter', null));
        $fieldname = trim($this->param('fieldname'));

        // Get data
        jClasses::inc('filter~filterDatasource');
        $f = new filterDatasource(  $repository, $project, $layerId );
        $rep->data = $f->getMinAndMaxValues($fieldname, $filter);

        return $rep;
    }

    public function getExtent(){
        $rep = $this->getResponse('json');

        // Get params
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');
        $crs = trim($this->param('crs', 'EPSG:3857'));
        $filter = trim($this->param('filter', null));

        // Get data
        jClasses::inc('filter~filterDatasource');
        $f = new filterDatasource(  $repository, $project, $layerId );
        $rep->data = $f->getExtent($crs, $filter);

        return $rep;
    }


}
