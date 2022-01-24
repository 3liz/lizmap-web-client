<?php
/**
 * Manage and give access to lizmap configuration.
 *
 * @author    3liz
 * @copyright 2012-2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Server;

class Server
{
    /**
     * @var array Metadata about LWC installation & QGIS Server status and configuration
     */
    protected $metadata;

    /**
     * constructor.
     */
    public function __construct()
    {
        $lizmap_data = $this->getLizmapMetadata();
        $lizmap_data['qgis_server_info'] = $this->getQgisServerMetadata();

        $this->metadata = $lizmap_data;
    }

    /** Get the server metadata.
     *
     */
    public function getMetadata()
    {
        return $this->metadata;
    }

    /**
     * Get Lizmap Web Client metadata.
     *
     * @return array Array containing the Lizmap Web Client instalation metadata
     */
    private function getLizmapMetadata()
    {
        $data = array();

        // Get Lizmap version from project.xml
        $xmlPath = \jApp::appPath('project.xml');
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

        // Get Lizmap services
        $services = \lizmap::getServices();

        // Try a request to QGIS Server
        $data['qgis_server'] = array();
        $params = array(
            'service' => 'WMS',
            'request' => 'GetCapabilities',
        );
        $url = \Lizmap\Request\Proxy::constructUrl($params, $services);
        list($resp, $mime, $code) = \Lizmap\Request\Proxy::getRemoteData($url);
        if (preg_match('#ServerException#i', $resp)
            || preg_match('#ServiceExceptionReport#i', $resp)
            || preg_match('#WMS_Capabilities#i', $resp)) {
            $data['qgis_server']['test'] = 'OK';
        } else {
            $data['qgis_server']['test'] = 'ERROR';
        }
        $data['qgis_server']['mime_type'] = $mime;
        $isAdmin = \jAcl2::check('lizmap.admin.access');
        if ($isAdmin) {
            $data['qgis_server']['http_code'] = $code;
            $data['qgis_server']['response'] = $resp;
        }

        return $data;
    }

    /**
     * Get QGIS Server status and metadata.
     * We use the new entrypoint /lizmap/server.json.
     *
     * @return array QGIS Server and plugins metadata. In case of error, it contains
     *               a 'error' key.
     */
    private function getQgisServerMetadata()
    {
        // Get Lizmap services
        $services = \lizmap::getServices();

        // Only show QGIS related data for admins
        $isAdmin = \jAcl2::check('lizmap.admin.access');
        if (!$isAdmin) {
            return array('error' => 'NO_ACCESS');
        }

        // Get the data from the QGIS Server Lizmap plugin
        if (empty($services->lizmapPluginAPIURL)) {
            // When the Lizmap API URL is not set, we use the WMS server URL only
            $lizmap_url = rtrim($services->wmsServerURL, '/').'/lizmap/server.json';
        } else {
            // When the Lizmap API URL is set
            $lizmap_url = rtrim($services->lizmapPluginAPIURL, '/').'/server.json';
        }

        list($resp, $mime, $code) = \Lizmap\Request\Proxy::getRemoteData($lizmap_url);
        if ($code == 200 && $mime == 'application/json' && strpos((string) $resp, 'metadata') !== false) {
            // Convert the JSON to an associative array
            $qgis_server_data = json_decode($resp, true);
            if (!empty($qgis_server_data) && array_key_exists('qgis_server', $qgis_server_data)) {
                $data = $qgis_server_data['qgis_server'];
            } else {
                $data = array('error' => 'BAD_DATA');
            }
        } else {
            $data = array('error' => 'HTTP_ERROR', 'error_http_code' => $code, 'error_message' => $resp);
        }

        return $data;
    }
}
