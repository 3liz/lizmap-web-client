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

        // These variables are temporary until
        // https://github.com/3liz/lizmap-web-client/issues/2972
        // If these values are updated, update as well lizmap/modules/admin/controllers/config.classic.php
        $qgisMinimumVersionRequired = '3.10';
        $lizmapPluginMinimumVersionRequired = '1.1.1';
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
