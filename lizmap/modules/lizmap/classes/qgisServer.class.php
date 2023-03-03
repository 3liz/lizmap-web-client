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
    // lizmapServices instance
    protected $services;

    // List of activated server plugins
    public $plugins = array();

    // constructor
    public function __construct()
    {
        $this->services = lizmap::getServices();
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
        $url = \Lizmap\Request\Proxy::constructUrl($params, $this->services);
        list($data, $mime, $code) = \Lizmap\Request\Proxy::getRemoteData($url);
        if (strpos($mime, 'text/json') === 0 || strpos($mime, 'application/json') === 0) {
            $json = json_decode($data);
            if (property_exists($json, 'lizmap')) {
                $metadata = $json->lizmap;
                $plugins[$metadata->name] = array('version' => $metadata->version);
            }
        }

        jCache::set($key, $plugins, 3600);

        return $plugins;
    }
}
