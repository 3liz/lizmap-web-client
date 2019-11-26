<?php
/**
* Manage and give access to lizmap configuration.
* @package   lizmap
* @subpackage action
* @author    3liz
* @copyright 2017 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class actionDatasource {

    protected $provider = 'postgres';
    private $status = false;
    private $errors = array();
    private $repository = null;
    private $project = null;
    private $lproj = null;
    private $config = null;
    private $data = null;

    protected $blackSqlWords = array(
        ';',
        'select',
        'delete',
        'insert',
        'update',
        'drop',
        'alter',
        '--',
        'truncate',
        'vacuum',
        'create'
    );


    function __construct( $repository, $project, $layerId ){

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
        $this->lproj = lizmap::getProject($repository.'~'.$project);
        $this->status = true;
        $this->config = $dv->getConfig();

    }

    public function getStatus(){
        return $this->status;
    }

    public function getErrors(){
        return $this->errors;
    }

    protected function getData($sql){

        $data = array();
        $cnx = jDb::getConnection();
        try{
            $q = $cnx->query( $sql );
            foreach( $q as $d){
                $data[] = $d;
            }
        }catch(Exception $e){
            jLog::log($e->getMessage(), 'error');
            $this->errors = array(
                'status'=>'error',
                'title'=>'Invalid Query',
                'detail'=>$e->getMessage()
            );
            return $this->errors;
        }
        return $data;
    }

}
