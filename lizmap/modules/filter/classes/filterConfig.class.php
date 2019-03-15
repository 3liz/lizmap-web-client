<?php
/**
* Manage and give access to lizmap configuration.
* @package   lizmap
* @subpackage filter
* @author    3liz
* @copyright 2017 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class filterConfig {


    private $status = false;
    private $errors = array();
    private $repository = null;
    private $project = null;
    private $lproj = null;
    private $config = null;

    function __construct( $repository, $project ){

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if(!$lproj){
                $this->errors = array(
                    'title'=>'Invalid Query Parameter',
                    'detail'=>'The lizmapProject '.strtoupper($project).' does not exist !'
                );
                return false;
            }
        }
        catch(UnknownLizmapProjectException $e) {
            $this->errors = array(
                'title'=>'Invalid Query Parameter',
                'detail'=>'The lizmapProject '.strtoupper($project).' does not exist !'
            );
            return false;
        }

        // Check acl
        if ( !$lproj->checkAcl() ){
            $this->errors = array(
                'title'=>'Access Denied',
                'detail'=>jLocale::get('view~default.repository.access.denied')
            );
            return false;
        }

        // Get config
        $filterConfig = null;
        if ( !$lproj->hasFormFilterLayers() ){
            $this->errors = array(
                'title'=>'filter Configuration not found',
                'detail'=> 'No filter configuration has been found for this project'
            );
            return false;
        }
        $filterConfig = $lproj->getFormFilterLayersConfig();

        $this->repository = $repository;
        $this->project = $project;
        $this->lproj = $lproj;
        $this->status = true;
        $this->config = $filterConfig;
    }

    public function getConfig(){
        return $this->config;
    }

    public function getStatus(){
        return $this->status;
    }

    public function getErrors(){
        return $this->errors;
    }

}
