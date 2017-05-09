<?php
/**
* Manage and give access to lizmap configuration.
* @package   lizmap
* @subpackage dataviz
* @author    3liz
* @copyright 2017 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class datavizConfig {


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
        $datavizConfig = $lproj->getDatavizLayersConfig();
        if ( !$datavizConfig ){
            $this->errors = array(
                'title'=>'Dataviz Configuration not found',
                'detail'=> 'No dataviz configuration has been found for this project'
            );
            return false;
        }

        $this->repository = $repository;
        $this->project = $project;
        $this->lproj = $lproj;
        $this->status = true;
        $this->config = $datavizConfig;
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
