<?php
/**
* Displays a full featured map based on one Qgis project.
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

include jApp::getModulePath('view').'controllers/lizMap.classic.php';

class mapCtrl extends lizMapCtrl {

    function index() {
        $rep = parent::index();

        if ( $rep->getType() != 'html' )
            return $rep;

        // Get repository key
        $repository = $this->repositoryKey;
        // Get the project key
        $project = $this->projectKey;

        $rep->body->assign('auth_url_return',
            jUrl::get('view~map:index',
                array(
                    "repository"=>$repository,
                    "project"=>$project,
                )
            )
        );

        return $rep;
    }
}
