<?php
/**
 * Methods provinding information about Lizmap application.
 *
 * @author    3liz
 * @copyright 2016 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class appCtrl extends jController
{
    /**
     * Returns Lizmap Web Client version.
     *
     * @return Json containing application information
     */
    public function metadata()
    {
        $rep = $this->getResponse('json');
        $data = array();

        // Get Lizmap version from project.xml
        $xmlPath = jApp::appPath('project.xml');
        $xmlLoad = simplexml_load_file($xmlPath);

        // Version
        $data['info'] = array();
        $data['info']['version'] = (string) $xmlLoad->info->version;
        $data['info']['date'] = (string) $xmlLoad->info->version->attributes()->date;

        // Dependencies
        $data['dependencies'] = array();
        $data['dependencies']['jelix'] = array();
        $data['dependencies']['jelix']['minversion'] = (string) $xmlLoad->dependencies->jelix->attributes()->minversion;
        $data['dependencies']['jelix']['maxversion'] = (string) $xmlLoad->dependencies->jelix->attributes()->maxversion;

        $rep->data = $data;

        return $rep;
    }
}
