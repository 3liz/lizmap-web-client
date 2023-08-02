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
                array($qgisMinimumVersionRequired, $lizmapPluginMinimumVersionRequired, \lizmap::getServices()->wmsServerURL)
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

        $displayPluginActionColumn = false;
        $lizmapQgisServerNeedsUpdate = $server->pluginServerNeedsUpdate(
            $currentLizmapVersion,
            $lizmapPluginMinimumVersionRequired
        );
        $updateLizmapPlugin = jLocale::get('admin.server.information.plugin.update', array('lizmap_server'));
        if (!is_null($currentQgisVersion) && $lizmapQgisServerNeedsUpdate) {
            // lizmap_server is required to use LWC
            jLog::log($updateLizmapPlugin, 'lizmapadmin');
            $displayPluginActionColumn = true;
        }

        // atlasPrint is not needed anymore starting from 3.7
        // but Lizmap server QGIS plugin is not aware if the current LWC version
        // and it's still providing 'atlasPrint' with a 'not found' value
        // Lizmap server will stop when LWC 3.6 will be retired
        $removeAtlasPrintPlugin = false;
        if (array_key_exists('plugins', $data['qgis_server_info'])
            && array_key_exists('atlasprint', $data['qgis_server_info']['plugins'])
            && $data['qgis_server_info']['plugins']['atlasprint']['version'] == 'not found'
        ) {
            unset($data['qgis_server_info']['plugins']['atlasprint']);
            // Show the deprecated warning
            // Add the else statement again
            // Temporary disabled, let's wait a little
            // $displayPluginActionColumn = true;
            // $removeAtlasPrintPlugin = true;
        }

        // Set the HTML content
        $tpl = new jTpl();
        $assign = array(
            'data' => $data,
            'baseUrlApplication' => \jServer::getServerURI().\jApp::urlBasePath(),
            'qgisServerNeedsUpdate' => $qgisServerNeedsUpdate,
            'updateQgisServer' => $updateQgisServer,
            'displayPluginActionColumn' => $displayPluginActionColumn,
            'lizmapQgisServerNeedsUpdate' => $lizmapQgisServerNeedsUpdate,
            'lizmapPluginUpdate' => $updateLizmapPlugin,
            'removeAtlasPrintPlugin' => $removeAtlasPrintPlugin,
            'minimumQgisVersion' => $qgisMinimumVersionRequired,
            'minimumLizmapServer' => $lizmapPluginMinimumVersionRequired,
        );
        $tpl->assign($assign);
        $rep->body->assign('MAIN', $tpl->fetch('server_information'));
        $rep->body->assign('selectedMenuItem', 'lizmap_server_information');

        return $rep;
    }
}
