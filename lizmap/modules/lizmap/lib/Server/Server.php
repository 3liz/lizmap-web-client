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

    /** Get the QGIS plugin server version matching a given name.
     *
     * @param string $name
     *
     * @return null|string String containing the QGIS plugin server version if found
     */
    public function getQgisPluginServerVersion($name)
    {
        if (!in_array($name, $this->metadata['qgis_server_info']['plugins'])) {
            return null;
        }

        return $this->metadata['qgis_server_info']['plugins'][$name]['version'];
    }

    /** List of plugins which must be updated.
     *
     * @return array List of plugins which must be updated
     */
    public function updatableQgisServerPlugins()
    {
        $plugins = array(
            // name in metadata.txt => name of plugin folder
            'Lizmap server' => 'lizmap_server',
            'atlasprint' => 'atlasprint',
            'cadastre' => 'cadastre',
            'wfsOutputExtension' => 'wfsOutputExtension',
        );
        $updateNeeded = array();
        foreach ($plugins as $name => $folderName) {
            $version = $this->getQgisPluginServerVersion($folderName);
            if (is_null($version)) {
                if ($name == 'Lizmap server') {
                    // We must find 'Lizmap server', it shouldn't be renamed
                    // The only plugin required following this name
                    array_push($updateNeeded, $name);
                }

                continue;
            }

            $requiredPluginVersion = \jApp::config()->minimumRequiredVersion[$folder];
            if ($this->pluginServerNeedsUpdate($version, $requiredPluginVersion)) {
                array_push($updateNeeded, $name);
            }
        }

        return $updateNeeded;
    }

    /** Get the current QGIS server version.
     *
     * @return string String containing the current QGIS server version
     */
    public function getQgisServerVersion()
    {
        return $this->metadata['qgis_server_info']['metadata']['version'];
    }

    /** Check if a QGIS server plugin needs to be updated.
     *
     * @param string $currentVersion  The current version to check
     * @param string $requiredVersion The minimum required version
     *
     * @return bool boolean If the plugin needs to be updated
     */
    public function pluginServerNeedsUpdate($currentVersion, $requiredVersion)
    {
        if ($currentVersion == 'master' || $currentVersion == 'dev') {
            return false;
        }

        return $this->versionCompare($currentVersion, $requiredVersion);
    }

    /** Compare two versions and return true if the second parameter is greater or equal to the first parameter.
     *
     * @param string $currentVersion  The current version to check
     * @param string $requiredVersion The minimum required version
     *
     * @return bool boolean If the software needs to be updated
     */
    public function versionCompare($currentVersion, $requiredVersion)
    {
        return version_compare($currentVersion, $requiredVersion) < 0;
    }

    /**
     * Get Lizmap Web Client metadata.
     *
     * @return array Array containing the Lizmap Web Client installation metadata
     */
    private function getLizmapMetadata()
    {
        $data = array();

        // Get Lizmap version from project.xml
        $projectInfos = \Jelix\Core\Infos\AppInfos::load();
        // Version
        $data['info'] = array();
        $data['info']['version'] = $projectInfos->version;
        $data['info']['date'] = $projectInfos->versionDate;

        $jelixVersion = \jFramework::version();

        // Dependencies
        $data['dependencies'] = array(
            'jelix' => array(
                'version' => $jelixVersion,
                // @deprecated
                'minversion' => $jelixVersion,
                // @deprecated
                'maxversion' => $jelixVersion,
            ),
        );

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

            if (isset(\jApp::config()->lizmap['hosting'])) {
                $data['hosting'] = \jApp::config()->lizmap['hosting'];
            }
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
