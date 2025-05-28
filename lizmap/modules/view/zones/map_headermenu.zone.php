<?php

use Lizmap\Project\UnknownLizmapProjectException;

/**
 * Construct the toolbar content.
 *
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class map_headermenuZone extends jZone
{
    protected $_tplname = 'map_headermenu';

    protected function _prepareTpl()
    {
        // Get the project and repository params
        $project = $this->param('project');
        $repository = $this->param('repository');
        $auth_url_return = $this->param('auth_url_return');
        if (!$auth_url_return) {
            $auth_url_return = jUrl::get(
                'view~map:index',
                array(
                    'repository' => $repository,
                    'project' => $project,
                )
            );
        }

        // Get the project
        $assign = array(
            'isConnected' => jAuth::isConnected(),
            'user' => jAuth::getUserSession(),
            'auth_url_return' => $auth_url_return,
            'externalSearch' => '',
            'edition' => false,
            'measure' => false,
            'locate' => false,
            'geolocation' => false,
            'timemanager' => false,
            'print' => false,
            'attributeLayers' => false,
        );

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            $externalSearch = $lproj->getOption('externalSearch');

            if ($externalSearch !== null) {
                $assign['externalSearch'] = $externalSearch;
            }
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');
        }

        $this->_tpl->assign($assign);

        // Get lizmap services
        $services = lizmap::getServices();
        $this->_tpl->assign('allowUserAccountRequests', $services->allowUserAccountRequests);
    }
}
