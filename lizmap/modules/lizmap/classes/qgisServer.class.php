<?php
/**
 * Get information about QGIS Server.
 *
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class qgisServer
{
    // QGIS Server version
    public $qgisServerVersion;

    // List of activated server plugins
    public $plugins = array();

    // constructor
    public function __construct()
    {
        $services = lizmap::getServices();

        $this->qgisServerVersion = $services->qgisServerVersion;
    }

    public function info()
    {
        $ser = lizmap::getServices();
        return self::information($ser->wmsServerURL);
    }

    public function getPlugins($project)
    {
        $plugins = array();

        // Check for atlasprint plugin
        $params = array(
            'service' => 'WMS',
            'request' => 'GetCapabilitiesAtlas',
            'map' => $project->getRelativeQgisPath()
        );
        $url = lizmapProxy::constructUrl($params);
        list($data, $mime, $code) = lizmapProxy::getRemoteData($url);
        if (strpos($mime, 'text/json') === 0 || strpos($mime, 'application/json') === 0) {
            $json = json_decode($data);
            $metadata = $json->metadata;
            $plugins[$metadata->name] = array('version' => $metadata->version);
        }

        return $plugins;
    }


    /**
     * Check QGIS Server URL
     *
     * @param string            $url     url of the QGIS Server to check
     *
     * @return array($check, $data, $mime, $http_code) Array containing the check and request data, mime type, end http code
     */
    public static function checkUrl($url)
    {
        $params = array(
            'map' => realpath(\jApp::getModulePath('lizmap').'/resources/qgis_info.qgs'),
            'service' => 'WMS',
            'request' => 'GetCapabilities'
        );

        $bparams = lizmapProxy::buildQuery($params);

        list($resp, $mime, $code) = lizmapProxy::getRemoteData($url.'?'.$bparams);

        if ($code >= 400) {
            return array(false, $resp, $mime, $code);
        }
        if (preg_match('#WMS_Capabilities#i', $resp)) {
            return array(true, $resp, $mime, $code);
        } else {
            return array(false, $resp, $mime, $code);
        }
    }

    /**
     * QGIS Server information
     *
     * @param string            $url     url of the QGIS Server
     *
     * @return array($version, $release_name) Array containing the QGIS Server information version and release name
     */
    public static function information($url)
    {
        list($check, $resp, $mime, $code) = self::checkUrl($url);

        if (!$check) {
            return null;
        }

        $params = array(
            'map' => realpath(\jApp::getModulePath('lizmap').'/resources/qgis_info.qgs'),
            'service' => 'WFS',
            'version' => '1.0.0',
            'request' => 'GetFeature',
            'typename' => 'null_island_qgis_info',
            'outputformat' => 'GeoJSON'
        );

        $bparams = lizmapProxy::buildQuery($params);

        list($resp, $mime, $code) = lizmapProxy::getRemoteData($url.'?'.$bparams);

        if ($code >= 400) {
            return null;
        }

        if (strpos($mime, 'application/vnd.geo+json') !== 0 &&
            strpos($mime, 'application/json') !== 0 &&
            strpos($mime, 'text/json') !== 0) {
            return null;
        }

        $json = json_decode($resp);
        $feat = $json->features[0];
        return array(
            'version' => $feat->properties->qgis_version,
            'release_name' => $feat->properties->qgis_release_name
            );
    }
}
