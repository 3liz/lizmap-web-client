<?php
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
        $server = new \Lizmap\Server\Server();
        $data = $server->getMetadata();

        $qgisMinimumVersionRequired = jApp::config()->minimumRequiredVersion['qgisServer'];
        $lizmapPluginMinimumVersionRequired = jApp::config()->minimumRequiredVersion['lizmapServerPlugin'];
        $linkDocumentation = 'https://docs.lizmap.com/current/en/install/pre_requirements.html#lizmap-server-plugin';

        $qgisServerNeedsUpdate = $server->versionCompare(
            $server->getQgisServerVersion(),
            $qgisMinimumVersionRequired
        );
        $updateQgisServer = jLocale::get('admin.server.information.qgis.update', array($qgisMinimumVersionRequired));
        if ($qgisServerNeedsUpdate) {
            jLog::log($updateQgisServer, 'error');
        }

        $displayPluginActionColumn = false;
        $lizmapQgisServerNeedsUpdate = $server->pluginServerNeedsUpdate(
            $server->getLizmapPluginServerVersion(),
            $lizmapPluginMinimumVersionRequired
        );
        $updateLizmapPlugin = jLocale::get('admin.server.information.plugin.update', array('lizmap_server'));
        if ($lizmapQgisServerNeedsUpdate) {
            // lizmap_server is required to use LWC
            jLog::log($updateLizmapPlugin, 'error');
            $displayPluginActionColumn = true;
        }

        // Set the HTML content
        $tpl = new jTpl();
        $assign = array(
            'data' => $data,
            'baseUrlApplication' => \jServer::getServerURI().\jApp::urlBasePath(),
            'linkDocumentation' => $linkDocumentation,
            'qgisServerNeedsUpdate' => $qgisServerNeedsUpdate,
            'updateQgisServer' => $updateQgisServer,
            'displayPluginActionColumn' => $displayPluginActionColumn,
            'lizmapQgisServerNeedsUpdate' => $lizmapQgisServerNeedsUpdate,
            'lizmapPluginUpdate' => $updateLizmapPlugin,
            'minimumQgisVersion' => $qgisMinimumVersionRequired,
            'minimumLizmapServer' => $lizmapPluginMinimumVersionRequired,
        );
        $tpl->assign($assign);
        $rep->body->assign('MAIN', $tpl->fetch('server_information'));
        $rep->body->assign('selectedMenuItem', 'lizmap_server_information');

        return $rep;
    }
}
