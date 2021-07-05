<?php
/**
 * Manage OGC request.
 *
 * @author    3liz
 * @copyright 2015-2021 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
/**
 * dummy class for compatibility.
 *
 * @see \Lizmap\Request\OGCRequest
 * @deprecated
 */
class lizmapOGCRequest extends \Lizmap\Request\OGCRequest
{
    /**
     * constructor.
     *
     * @param lizmapProject $project    the project has a lizmapProject Class
     * @param array         $params     the OGC request parameters array
     * @param string        $requestXml the OGC XML Request as string
     */
    public function __construct($project, $params, $requestXml = null)
    {
        $this->project = $project;

        $this->repository = $project->getRepository();

        $this->services = lizmap::getServices();
        $this->appContext = \Lizmap\Request\Proxy::getAppContext();

        $params['map'] = $project->getRelativeQgisPath();
        $this->params = \Lizmap\Request\Proxy::normalizeParams($params);
        $this->requestXml = $requestXml;
    }
}
