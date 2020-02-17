<?php
/**
* @package   lizmap
* @subpackage action
* @author    3liz
* @copyright 2017 3liz
* @link      http://3liz.com
* @license    Mozilla Public License
*/

class serviceCtrl extends jController {

    private $repository = null;
    private $project = null;
    private $config = null;
    private $layerId = null;

    function __construct( $request ){
        parent::__construct( $request );
    }

    public function index(){

        $rep = $this->getResponse('json');

        // Get parameters
        $repository = $this->param('repository');
        $project = $this->param('project');
        $layerId = $this->param('layerId');
        $featureId = $this->intParam('featureId', 0);

        // Check project, repository and acl
        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                $errors = array(
                    'title'=>'Wrong repository and project !',
                    'detail'=>'The lizmapProject '.strtoupper($project).' does not exist !'
                );
                return $this->error($errors);
            }
        } catch (UnknownLizmapProjectException $e) {
            $errors = array(
                'title'=>'Wrong repository and project !',
                'detail'=>'The lizmapProject '.strtoupper($project).' does not exist !'
            );
            return $this->error($errors);
        }

        // Redirect if no rights to access this repository
        if (!$lproj->checkAcl()) {
            $errors = array(
                'title'=>'Access forbiden',
                'detail'=>jLocale::get('view~default.repository.access.denied')
            );
            return $this->error($errors);
        }

        if(!$featureId){
            $errors = array(
                'title'=>'No feature id given',
                'detail'=>'The feature id must be a positive integer !'
            );
            return $this->error($errors);
        }

        // Check action config
        jClasses::inc('action~actionConfig');
        $dv = new actionConfig($repository, $project);
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

        // Check if configuration exists for this layer and name
        $name = $this->param('name');
        if( !property_exists($config, $layerId) ){
            $errors = array(
                'title'=>'Layer id unknown',
                'detail'=>'The layer id '.$layerId.' does not exist in the config file !'
            );
            return $this->error($errors);
        }
        $layerConf = $config->$layerId;
        $action = null;
        foreach($layerConf as $layer_action){
            if( $name == $layer_action->name ){
                $action = $layer_action;
                break;
            }
        }
        if(!$action){
            $errors = array(
                'title'=>'Action unknown',
                'detail'=>'The action named '.$name.' does not exist in the config file for this layer !'
            );
            return $this->error($errors);
        }

        // Check layer in project
        $p = lizmap::getProject($repository.'~'.$project);
        $qgisLayer = $p->getLayer($layerId);
        if ($qgisLayer) {
            $cnx = $qgisLayer->getDatasourceConnection();
        }else{
            $errors = array(
                'title'=>'Layer not in project',
                'detail'=>'The layer with id '.$layerId.' does not exist in this project !'
            );
            return $this->error($errors);
        }

        // Get data
        $data = array();
        $layerName = $qgisLayer->getName();
        $lp = $qgisLayer->getDatasourceParameters();
        $action_params = array(
            'layer_name'=> str_replace("'", "''", $layerName),
            'layer_schema'=> $lp->schema,
            'layer_table'=> $lp->tablename,
            'feature_id'=> $featureId,
            'action_name'=> $name
        );
        foreach($action->options as $k=>$v){
            $action_params[$k] = $v;
        }

        // Run action
        $sql = "SELECT lizmap_get_data('";
        $sql.= json_encode($action_params);
        $sql.= "') AS data";
        try{
            $res = $cnx->query($sql);
            foreach($res as $r){
                $data = json_decode($r->data);
            }
        } catch(Exception $e){
            jLog::log("Error while running the query : ". $sql);
            $errors = array(
                'title'=>'An error occured while running the PostgreSQL query !',
                'detail'=>$e->getMessage()
            );
            return $this->error($errors);
        }

        // Send respons
        $rep = $this->getResponse('json');
        $rep->data = $data;
        return $rep;

    }

    public function error($errors){
        $rep = $this->getResponse('json');
        $rep->data = array( 'errors' => $errors);
        return $rep;
    }



}
