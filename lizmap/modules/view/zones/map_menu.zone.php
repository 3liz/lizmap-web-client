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
class map_menuZone extends jZone
{
    protected $_tplname = 'map_menu';

    protected function _prepareTpl()
    {

        // Get lizmap services
        $services = lizmap::getServices();

        // Get the project and repository params
        $project = $this->param('project');
        $repository = $this->param('repository');

        // Get the project
        $assign = array(
            'display_home' => !$services->onlyMaps,
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

            if ($lproj->getBooleanOption('measure')) {
                $assign['measure'] = true;
            }

            $assign['locate'] = $lproj->hasLocateByLayer();

            if ($lproj->getBooleanOption('print')) {
                $assign['print'] = true;
            }

            $assign['edition'] = $lproj->hasEditionLayersForCurrentUser();

            if ($lproj->getBooleanOption('geolocation')) {
                $assign['geolocation'] = true;
            }

            $assign['timemanager'] = $lproj->hasTimemanagerLayers();

            $assign['attributeLayers'] = $lproj->hasAttributeLayers();
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');
        }

        $this->_tpl->assign($assign);
    }
}
