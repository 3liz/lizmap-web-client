<?php
/**
* Get information about QGIS Server.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2012 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class qgisServer {

    // QGIS Server version
    public $qgisServerVersion = null;

    // List of activated server plugins
    public $plugins = array();


    /*
     * constructor
     */
    public function __construct () {
        $services = lizmap::getServices();

        $this->qgisServerVersion = $services->qgisServerVersion;

        $this->getPlugins();

    }

    protected function getPlugins(){

        $plugins = array();

        // Check for atlasprint plugin
        $params =  array(
            'service'=>'WMS',
            'request'=>'GetCapabilitiesAtlas'
        );
        $url = lizmapProxy::constructUrl($params);
        $getRemoteData = lizmapProxy::getRemoteData($url);
        $data = $getRemoteData[0];
        $mime = $getRemoteData[1];
        if($mime=='text/json'){
            $json = json_decode($data);
            $metadata = $json->metadata;
            $plugins[$metadata->name] = array('version' => $metadata->version);
        }

        $this->plugins = $plugins;

    }
}
