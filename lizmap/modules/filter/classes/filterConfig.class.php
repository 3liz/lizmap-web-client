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

        // Filter config may be an empty array
        // This means no layers have been set up with the filter by form tool
        // BUT : we still need to return data so that other tools can use the filter methods
        // Ex: timemanager uses the getMinAndMaxValues method of the service controller
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
