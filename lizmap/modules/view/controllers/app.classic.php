<?php
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
        $rep = $this->getResponse('json');

        // Authenticate
        if (isset($_SERVER['PHP_AUTH_USER'])) {
            jAuth::login($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
        }

        // Get server metadata from LWC and QGIS Server Lizmap plugin        $server = new \Lizmap\Server\Server();
        $data = $server->getMetadata();
        $rep->data = $data;

        return $rep;
    }
}
