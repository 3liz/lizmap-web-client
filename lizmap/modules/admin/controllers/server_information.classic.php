<?php

use Lizmap\Server\Server;
use LizmapAdmin\ModulesInfo\ModulesChecker;

/**
 * Lizmap administration : Server information page.
 *
 * @author    3liz
 * @copyright 2016 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class server_informationCtrl extends jController
{
    // Configure access via jacl2 rights management
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'lizmap.admin.server.information.view'),
    );

    /**
     * Get the information from QGIS Server and display them.
     *
     * @return jResponseHtml
     */
    public function index()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        // Get the metadata
        $server = new Server();
        $data = $server->getMetadata();

        $qgisMinimumVersionRequired = jApp::config()->minimumRequiredVersion['qgisServer'];
        $lizmapPluginMinimumVersionRequired = jApp::config()->minimumRequiredVersion['lizmapServerPlugin'];

        // Get current versions of QGIS server and Lizmap QGIS server plugin
        $currentQgisVersion = $server->getQgisServerVersion();
        $currentLizmapVersion = $server->getLizmapPluginServerVersion();

        // Check their status
        if (is_null($currentQgisVersion) || is_null($currentLizmapVersion)) {
            // Either QGIS server or Lizmap QGIS server were not found
            // Lizmap QGIS server is needed to know the version of QGIS server

            // Maybe both QGIS server and Lizmap QGIS server are both installed with correct minimal versions,
            // but LWC could not reach QGIS server or the Lizmap API
            jLog::log(jLocale::get(
                'admin.server.information.qgis.unknown',
                array($qgisMinimumVersionRequired, $lizmapPluginMinimumVersionRequired, lizmap::getServices()->wmsServerURL)
            ), 'lizmapadmin');
        }

        $qgisServerNeedsUpdate = $server->versionCompare(
            $currentQgisVersion,
            $qgisMinimumVersionRequired
        );
        $updateQgisServer = jLocale::get('admin.server.information.qgis.update', array($qgisMinimumVersionRequired));
        if (!is_null($currentQgisVersion) && $qgisServerNeedsUpdate) {
            jLog::log($updateQgisServer, 'lizmapadmin');
        }

        $lizmapQgisServerNeedsUpdate = $server->pluginServerNeedsUpdate(
            $currentLizmapVersion,
            $lizmapPluginMinimumVersionRequired
        );
        $updateLizmapPlugin = jLocale::get('admin.server.information.plugin.update');
        if (!is_null($currentQgisVersion) && $lizmapQgisServerNeedsUpdate) {
            // lizmap_server is required to use LWC
            jLog::log($updateLizmapPlugin, 'lizmapadmin');
        }

        $modules = new ModulesChecker();

        // Set the HTML content
        $tpl = new jTpl();
        $assign = array(
            'data' => $data,
            'baseUrlApplication' => jServer::getServerURI().jApp::urlBasePath(),
            'modules' => $modules->getList(false),
            'qgisServerNeedsUpdate' => $qgisServerNeedsUpdate,
            'updateQgisServer' => $updateQgisServer,
            'lizmapQgisServerNeedsUpdate' => $lizmapQgisServerNeedsUpdate,
            'lizmapPluginUpdate' => $updateLizmapPlugin,
            'minimumQgisVersion' => $qgisMinimumVersionRequired,
            'minimumLizmapServer' => $lizmapPluginMinimumVersionRequired,
            'currentLizmapCommitId' => jApp::config()->commitSha,
        );
        $tpl->assign($assign);
        $rep->body->assign('MAIN', $tpl->fetch('server_information'));
        $rep->body->assign('selectedMenuItem', 'lizmap_server_information');

        return $rep;
    }
}
