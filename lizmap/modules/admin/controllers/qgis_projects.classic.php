<?php

use LizmapAdmin\QgisProjectsListData;

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
     * Display the QGIS projects list page.
     *
     * The page ships an empty table shell; the rows are loaded as JSON by
     * DataTables from the `data` action below.
     *
     * @return jResponseHtml
     */
    public function index()
    {
        /** @var jResponseHtml */
        $rep = $this->getResponse('html');
        $rep->title = 'Admin - Lizmap projects';

        // Context needed to render the legend modal and the server status banner
        // (server versions, thresholds, required versions).
        $listData = new QgisProjectsListData();

        // Set the HTML content
        $tpl = new jTpl();
        $tpl->assign($listData->getContext());
        $tpl->assign('dataUrl', jUrl::get('admin~qgis_projects:data'));
        $tpl->assign(
            'notDisplayedMessage',
            jLocale::get(
                'admin~admin.project.error.some.projects.not.displayed',
                array(jLocale::get('admin~admin.project.modal.title'))
            )
        );
        $rep->body->assign('MAIN', $tpl->fetch('project_list'));
        $rep->body->assign('selectedMenuItem', 'lizmap_project_list');

        return $rep;
    }

    /**
     * Return the QGIS projects list as JSON, consumed by DataTables.
     *
     * @return jResponseJson
     */
    public function data()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        $listData = new QgisProjectsListData();
        $rep->data = $listData->getData();

        return $rep;
    }
}
