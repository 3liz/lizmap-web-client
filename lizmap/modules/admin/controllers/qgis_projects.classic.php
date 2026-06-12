<?php

/**
 * Lizmap administration : List of QGIS projects.
 *
 * @author    3liz
 * @copyright 2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class qgis_projectsCtrl extends jController
{
    // Configure access via jacl2 rights management
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'lizmap.admin.project.list.view'),
    );

    /**
     * Get the information from QGIS Server and display them.
     *
     * @return jResponseHtml
     */
    public function index()
    {
        /** @var jResponseHtml */
        $rep = $this->getResponse('html');
        $rep->title = 'Admin - Lizmap projects';


        // Set the HTML content
        $tpl = new jTpl();
        $repoName = $this->param('repository');
        // bad repo name, set to null
        if (is_null(lizmap::getRepository($repoName ?? ''))) {
            $repoName = null;
        }
        $tpl->assign('repository', $repoName);
        $tpl->assign('repositoriesList', lizmap::getRepositoryList(true));
        $tpl->assign('baseurl', jUrl::get('qgis_projects:index'));
        $rep->body->assign('MAIN', $tpl->fetch('project_list'));
        $rep->body->assign('selectedMenuItem', 'lizmap_project_list');

        return $rep;
    }
}
