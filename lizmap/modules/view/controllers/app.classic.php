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

        $server = new \Lizmap\Server\Server();
        $data = $server->getMetadata();
        $rep->data = $data;

        return $rep;
    }
}
