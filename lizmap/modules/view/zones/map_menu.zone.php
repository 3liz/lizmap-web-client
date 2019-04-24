<?php
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

        // Get lizmapProject class
        $assign = array(
            'display_home'=> !$services->onlyMaps,
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
            $configOptions = $lproj->getOptions();

            if (property_exists($configOptions, 'measure') &&
                $configOptions->measure == 'True'
            ) {
                $assign['measure'] = true;
            }

            $assign['locate'] = $lproj->hasLocateByLayer();

            if (property_exists($configOptions, 'print') &&
                $configOptions->print == 'True'
            ) {
                $assign['print'] = true;
            }

            $assign['edition'] = $lproj->hasEditionLayers();

            if (property_exists($configOptions, 'geolocation') &&
                $configOptions->geolocation == 'True'
            ) {
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
