<?php
/**
 * Manage OGC request.
 *
 * @author    3liz
 * @copyright 2015 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

use Lizmap\App;

class lizmapOGCRequest
{
    /**
     * @var lizmapProject
     */
    protected $project;

    /**
     * @var lizmapRepository
     */
    protected $repository;

    /**
     * @var array
     */
    protected $params;

    /**
     * @var null|string
     */
    protected $requestXml;

    /**
     * @var lizmapServices
     */
    protected $services;

    /**
     * @var string selector of a template
     */
    protected $tplExceptions;

    /**
     * Build a lizmapOGCRequest child instance based on request.
     * The parameters or the xml request has to contain the OGC service name.
     * WMS, WFS and WMTS services are supported.
     *
     * @param lizmapProject $project    the project has a lizmapProject Class
     * @param array         $params     the OGC request parameters array
     * @param string        $requestXml the OGC XML Request as string
     *
     * @return lizmapOGCRequest a child instance based on the request
     */
    public static function build($project, $params, $requestXml = null)
    {
        $service = null;
        $request = null;

        // Check request XML
        if ($requestXml && substr(trim($requestXml), 0, 1) == '<') {
            $requestXml = trim($requestXml);
        } else {
            $requestXml = null;
        }

        // Parse request XML
        if ($requestXml) {
            $xml = App\XmlTools::xmlFromString($requestXml);
            if (!is_object($xml)) {
                $errormsg = '\n'.$requestXml.'\n'.$xml;
                $errormsg = 'An error has been raised when loading requestXml:'.$errormsg;
                jLog::log($errormsg, 'error');
                $requestXml = null;
            } else {
                $request = $xml->getName();
                if (property_exists($xml->attributes(), 'service')) {
                    // OGC service has to be upper case for QGIS Server
                    $service = strtoupper($xml['service']);
                }
            }
        }

        // Check parameters
        if (!$requestXml && isset($params['service'])) {
            // OGC service has to be upper case for QGIS Server
            $service = strtoupper($params['service']);
            if (isset($params['request'])) {
                $request = strtolower($params['request']);
            }
        }

        if ($service == null) {
            return null;
        }
        $params['service'] = $service;
        if ($request !== null) {
            $params['request'] = $request;
        }
        if ($service == 'WMS') {
            return new lizmapWMSRequest($project, $params, $requestXml);
        }
        if ($service == 'WMTS') {
            return new lizmapWMTSRequest($project, $params, $requestXml);
        }
        if ($service == 'WFS') {
            return new lizmapWFSRequest($project, $params, $requestXml);
            // Not yet
        //} else if ($service == 'WCS') {
        //    return new lizmapWCSRequest($project, $params, $requestXml)
        }

        return null;
    }

    /**
     * constructor.
     *
     * @param lizmapProject $project    the project has a lizmapProject Class
     * @param array         $params     the OGC request parameters array
     * @param string        $requestXml the OGC XML Request as string
     */
    public function __construct($project, $params, $requestXml = null)
    {
        //print_r( $project != null );
        $this->project = $project;

        $this->repository = $project->getRepository();

        $this->services = lizmap::getServices();

        $params['map'] = $project->getRelativeQgisPath();
        $this->params = lizmapProxy::normalizeParams($params);
        $this->requestXml = $requestXml;
    }

    /**
     * Get the value of a request parameter. If not defined, gets its default value.
     *
     * @param string $name              the name of the request parameter
     * @param mixed  $defaultValue      the default returned value if the parameter doesn't exists
     * @param bool   $useDefaultIfEmpty true: says to return the default value if the parameter value is ""
     *
     * @return mixed the request parameter value
     */
    public function param($name, $defaultValue = null, $useDefaultIfEmpty = false)
    {
        $name = strtolower($name);
        if (isset($this->params[$name])) {
            if ($useDefaultIfEmpty && trim($this->params[$name]) == '') {
                return $defaultValue;
            }

            return $this->params[$name];
        }

        return $defaultValue;
    }

    /**
     * Provide the parameters with the lizmap extra parameters for filtering request
     * Lizmap_User, Lizmap_User_Groups and Lizmap_Override_Filter has been added to the OGC request parameters.
     *
     * @return array the OGC request aprameters with lizmap extra parameters for filtering request
     */
    public function parameters()
    {
        // Check if a user is authenticated
        if (!jAuth::isConnected()) {
            // return parameters with empty user param
            return array_merge($this->params, array(
                'Lizmap_User' => '',
                'Lizmap_User_Groups' => '',
            ));
        }

        // Provide user and groups to lizmap plugin access control
        $user = jAuth::getUserSession();
        $userGroups = jAcl2DbUserGroup::getGroups();
        $loginFilteredOverride = jAcl2::check('lizmap.tools.loginFilteredLayers.override', $this->repository->getKey());

        return array_merge($this->params, array(
            'Lizmap_User' => $user->login,
            'Lizmap_User_Groups' => implode(', ', $userGroups),
            'Lizmap_Override_Filter' => $loginFilteredOverride,
        ));
    }

    /**
     * Process the OGC Request
     * Checks the request parameter and performs the right method.
     *
     * @return array['code', 'mime', 'data', 'cached'] The request result with HTTP code, response mime-type and response data
     */
    public function process()
    {
        $req = $this->param('request');
        if ($req) {
            $reqMeth = 'process_'.$req;
            if (method_exists($this, $reqMeth)) {
                return $this->{$reqMeth}();
            }
        }

        if (!$req) {
            jMessage::add('Please add or check the value of the REQUEST parameter', 'OperationNotSupported');
        } else {
            jMessage::add('Request '.$req.' is not supported', 'OperationNotSupported');
        }

        return $this->serviceException(501);
    }

    /**
     * Build the URL to request QGIS Server.
     *
     * @return string The URL to use to request QGIS Server
     */
    protected function constructUrl()
    {
        $url = $this->services->wmsServerURL.'';
        if (!preg_match('/\?/', $url)) {
            $url .= '?';
        } elseif (!preg_match('/&$/', $url)) {
            $url .= '&';
        }

        return $url.$this->buildQuery($this->parameters());
    }

    /**
     * Generate URL-encoded query string.
     *
     * @param array $params The key value parameters array
     *
     * @return string the URL-encoded query string
     */
    protected function buildQuery($params)
    {
        $bparams = http_build_query($params);

        // replace some chars (not needed in php 5.4, use the 4th parameter of http_build_query)
        $a = array('+', '_', '.', '-');
        $b = array('%20', '%5F', '%2E', '%2D');

        return str_replace($a, $b, $bparams);
    }

    /**
     * Request QGIS Server.
     *
     * @param bool $post Force to use POST request
     *
     * @return object The request result with HTTP code, response mime-type and response data
     *                (properties $code, $mime, $data)
     */
    protected function request($post = false)
    {
        $querystring = $this->constructUrl();

        $options = array();
        if ($this->requestXml !== null) {
            $options = array(
                'method' => 'post',
                'headers' => array('Content-Type' => 'text/xml'),
                'body' => $this->requestXml,
            );
        } elseif ($post) {
            $options = array('method' => 'post');
        }

        // Add login filtered override info
        $options['loginFilteredOverride'] = jAcl2::check('lizmap.tools.loginFilteredLayers.override', $this->repository->getKey());

        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring, $options);

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
        );
    }

    /**
     * Provide an OGC Service Exception result.
     *
     * @param int $code The HTTP code to return
     *
     * @return object ['code', 'mime', 'data', 'cached'] The request result with HTTP code, response mime-type and response data
     */
    protected function serviceException($code = 400)
    {
        $messages = jMessage::getAll();

        if ($this->tplExceptions !== null) {
            $mime = 'text/xml';
            $tpl = new jTpl();
            $tpl->assign('messages', $messages);
            $data = $tpl->fetch($this->tplExceptions);
        } else {
            $mime = 'text/plain';
            if (is_array($messages) && count($messages)) {
                $data = implode('\n', $messages);
            } else {
                $data = '';
            }
        }
        jMessage::clearAll();

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => false,
        );
    }

    /**
     * Perform an OGC GetCapabilities Request.
     *
     * @return object ['code', 'mime', 'data', 'cached'] The request result with HTTP code, response mime-type and response data
     */
    protected function process_getcapabilities()
    {
        // Get cached session
        $key = session_id().'-'.
               $this->project->getRepository()->getKey().'-'.
               $this->project->getKey().'-'.
               $this->param('service').'-getcapabilities';
        if (jAuth::isConnected()) {
            $juser = jAuth::getUserSession();
            $key .= '-'.$juser->login;
        }
        $key = sha1($key);
        $cached = false;

        try {
            $cached = jCache::get($key, 'qgisprojects');
        } catch (Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            jLog::logEx($e, 'error');
        }
        // invalid cache
        if ($cached !== false
            && $cached['mtime'] < $this->project->getFileTime()
            && (!array_key_exists('ctime', $cached)
              || $cached['ctime'] < $this->project->getCfgFileTime())
            ) {
            $cached = false;
        }
        // return cached data
        if ($cached !== false) {
            return (object) array(
                'code' => $cached['code'],
                'mime' => $cached['mime'],
                'data' => $cached['data'],
                'cached' => true,
            );
        }

        // Get remote data
        $response = $this->request();

        // Retry if 500 error ( hackish, but QGIS Server segfault sometimes with cache issue )
        if ($response->code == 500) {
            // Get remote data
            $response = $this->request();
        }

        if ($response->code == 200) {
            $cached = array(
                'mtime' => $this->project->getFileTime(),
                'ctime' => $this->project->getCfgFileTime(),
                'code' => $response->code,
                'mime' => $response->mime,
                'data' => $response->data,
            );
            $cached = jCache::set($key, $cached, 3600, 'qgisprojects');
        }

        return (object) array(
            'code' => $response->code,
            'mime' => $response->mime,
            'data' => $response->data,
            'cached' => $cached,
        );
    }
}
