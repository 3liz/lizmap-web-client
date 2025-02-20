<?php

use Lizmap\Events\LizmapMetadataEvent;
use Lizmap\Server\Server;

/**
 * Methods providing information about Lizmap application.
 *
 * @author    3liz
 * @copyright 2016-2022 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class appCtrl extends jController
{
    /**
     * Returns Lizmap Web Client version.
     *
     * @return jResponseJson containing application information
     */
    public function metadata()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        // Authenticate
        $basicAuthUsed = false;
        if (isset($_SERVER['PHP_AUTH_USER'])) {
            $basicAuthUsed = true;
            $logUser = jAuth::login($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
        }

        // Get server metadata from LWC and QGIS Server Lizmap plugin
        $server = new Server();
        $data = $server->getMetadata();

        // Only show QGIS related data for admins
        $serverInfoAccess = (jAcl2::check('lizmap.admin.access') || jAcl2::check('lizmap.admin.server.information.view'));
        if (!$serverInfoAccess) {
            $data['qgis_server_info'] = array('error' => 'NO_ACCESS');
        }

        // If the user is not logged and has tried basic auth
        // Return a different error to let the plugin differentiate the two cases
        if ($basicAuthUsed && !$logUser) {
            $data['qgis_server_info'] = array('error' => 'WRONG_CREDENTIALS');
        }

        // retrieves foreign metadata
        $event = new LizmapMetadataEvent();
        jEvent::notify($event);
        // merge other foreign metadata with current metadata.
        // We don't want that foreign metadata overwrite our own metadata.
        $data = array_merge($event->getMetadata(), $data);

        $rep->data = $data;

        return $rep;
    }
}
