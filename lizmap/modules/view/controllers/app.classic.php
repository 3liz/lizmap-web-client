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

        // Try a request to QGIS Server
        $data['qgis_server'] = array();
        $params = array(
            'service' => 'WMS',
            'request' => 'GetCapabilities',
        );
        $url = lizmapProxy::constructUrl($params);
        list($resp, $mime, $code) = lizmapProxy::getRemoteData($url);
        if (preg_match('#ServerException#i', $resp) ||
            preg_match('#ServiceExceptionReport#i', $resp) ||
            preg_match('#WMS_Capabilities#i', $resp)) {
            $data['qgis_server']['test'] = 'OK';
        } else {
            $data['qgis_server']['test'] = 'ERROR';
        }
        $data['qgis_server']['mime_type'] = $mime;
        if (jAcl2::check('lizmap.admin.access')) {
            $data['qgis_server']['http_code'] = $code;
            $data['qgis_server']['response'] = $resp;
        }

        $rep->data = $data;

        return $rep;
    }
}
