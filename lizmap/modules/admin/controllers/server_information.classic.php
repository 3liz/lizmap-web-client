<?php
/**
 * Lizmap administration : landing page content.
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
        '*' => array('jacl2.right' => 'lizmap.admin.access'),
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

        // Set the HTML content
        $tpl = new jTpl();
        $assign = array(
            'data' => $data,
            'linkDocumentation' => $linkDocumentation,
            'errorQgisPlugin' => jLocale::get(
                'admin.server.information.qgis.error.fetching.information.detail',
                array(
                    $qgisMinimumVersionRequired,
                    $lizmapPluginMinimumVersionRequired,
                    $qgisMinimumVersionRequired,
                    $lizmapPluginMinimumVersionRequired,
                )
            ),
        );
        $tpl->assign($assign);
        $rep->body->assign('MAIN', $tpl->fetch('server_information'));
        $rep->body->assign('selectedMenuItem', 'lizmap_server_information');

        return $rep;
    }
}
