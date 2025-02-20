<?php

/**
 * Displays an embedded map based on one Qgis project.
 *
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
include jApp::getModulePath('view').'controllers/lizMap.classic.php';

class embedCtrl extends lizMapCtrl
{
    /**
     * @return jResponseHtml|jResponseRedirect
     */
    public function index()
    {
        $req = jApp::coord()->request;
        $req->params['h'] = 0;
        $req->params['l'] = 0;

        $rep = parent::index();

        if ($rep->getType() != 'html') {
            // @var jResponseRedirect $rep
            return $rep;
        }

        // @var jResponseHtml $rep
        // add embed specific css
        $rep->addAssets('embed');

        // force undisplay home
        $rep->addStyle('#mapmenu li.home', 'display:none;');
        // do not display locate by layer
        // display tooltip at bottom

        $rep->setBodyAttributes(array('data-lizmap-embed' => true));

        // Get repository key
        $repository = $this->repositoryKey;
        // Get the project key
        $project = $this->projectKey;

        $rep->body->assign(
            'auth_url_return',
            jUrl::get(
                'view~map:index',
                array(
                    'repository' => $repository,
                    'project' => $project,
                )
            )
        );

        return $rep;
    }

    protected function getProjectDockables()
    {
        $assign = parent::getProjectDockables();
        $available = array('switcher', 'metadata', 'locate', 'measure', 'tooltip-layer', 'permaLink'); // , 'print', 'permaLink'
        $dAssign = array();
        foreach ($assign['dockable'] as $dock) {
            if (in_array($dock->id, $available)) {
                $dAssign[] = $dock;
            }
        }
        $assign['dockable'] = $dAssign;
        $mdAssign = array();
        foreach ($assign['minidockable'] as $dock) {
            if (in_array($dock->id, $available)) {
                $mdAssign[] = $dock;
            }
        }
        $assign['minidockable'] = $mdAssign;
        $bdAssign = array();
        foreach ($assign['bottomdockable'] as $dock) {
            if (in_array($dock->id, $available)) {
                $bdAssign[] = $dock;
            }
        }
        $assign['bottomdockable'] = $bdAssign;
        $rdAssign = array();
        foreach ($assign['rightdockable'] as $dock) {
            if (in_array($dock->id, $available)) {
                $rdAssign[] = $dock;
            }
        }
        $assign['rightdockable'] = $rdAssign;

        return $assign;
    }
}
