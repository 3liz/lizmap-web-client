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

class actionConfig {


    private $status = false;
    private $errors = array();
    private $repository = null;
    private $project = null;
    private $lproj = null;
    private $config = null;

    function __construct( $repository, $project ){

        $this->status = false;
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

        // Test if action file is found
        $action_path = $lproj->getQgisPath() . '.action';
        if (!file_exists($action_path)) {
            return false;
        }

        // Parse config
        $config = jFile::read($action_path);
        $this->config = json_decode($config);
        if ($this->config === null) {
            return false;
        }

        // Get config
        $this->repository = $repository;
        $this->project = $project;
        $this->lproj = $lproj;
        $this->status = true;
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
