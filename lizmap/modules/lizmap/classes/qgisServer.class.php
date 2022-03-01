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

    public function getPlugins($project)
    {
        $key = 'qgis/server/plugins';
        $key = jCache::normalizeKey($key);
        $plugins = jCache::get($key);
        if ($plugins !== false && $plugins !== null) {
            return $plugins;
        }

        $plugins = array();

        // Check Lizmap plugin
        $params = array(
            'service' => 'LIZMAP',
            'request' => 'GetServerSettings',
            'map' => $project->getRelativeQgisPath(),
        );
        $url = lizmapProxy::constructUrl($params);
        list($data, $mime, $code) = lizmapProxy::getRemoteData($url);
        if (strpos($mime, 'text/json') === 0 || strpos($mime, 'application/json') === 0) {
            $json = json_decode($data);
            if (property_exists($json, 'lizmap')) {
                $metadata = $json->lizmap;
                $plugins[$metadata->name] = array('version' => $metadata->version);
            }
            //$plugins['lizmap'] = $json;
        }

        // Check for atlasprint plugin
        $params = array(
            'service' => 'WMS',
            'request' => 'GetCapabilitiesAtlas',
            'map' => $project->getRelativeQgisPath(),
        );
        $url = lizmapProxy::constructUrl($params);
        list($data, $mime, $code) = lizmapProxy::getRemoteData($url);
        if (strpos($mime, 'text/json') === 0 || strpos($mime, 'application/json') === 0) {
            $json = json_decode($data);
            $metadata = $json->metadata;
            $plugins[$metadata->name] = array('version' => $metadata->version);
        }

        jCache::set($key, $plugins, 3600);

        return $plugins;
    }
}
