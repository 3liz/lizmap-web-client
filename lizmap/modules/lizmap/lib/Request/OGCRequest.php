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

namespace Lizmap\Request;

use Lizmap\App;

/**
 * @see https://en.wikipedia.org/wiki/Open_Geospatial_Consortium.
 *
 * Base class for Requests
 */
abstract class OGCRequest
{
    /**
     * @var \Lizmap\Project\Project
     */
    protected $project;

    /**
     * @var \Lizmap\Project\Repository
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
     * @var \lizmapServices
     */
    protected $services;

    /**
     * @var string selector of a template
     */
    protected $tplExceptions;

    /**
     * @var App\AppContextInterface
     */
    protected $appContext;

    /**
     * constructor.
     *
     * @param \Lizmap\Project\Project $project    the project
     * @param array                   $params     the params array
     * @param \lizmapServices         $services
     * @param string                  $requestXml the params array
     */
    public function __construct($project, $params, $services, $requestXml = null)
    {
        //print_r( $project != null );
        $this->project = $project;
        $this->repository = $project->getRepository();

        $this->services = $services;
        $this->appContext = $this->project->getAppContext();

        $params['map'] = $project->getRelativeQgisPath();
        $this->params = Proxy::normalizeParams($params);
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
     * Provide the parameters with the lizmap extra parameters for filtering the request.
     *
     * Lizmap_User, Lizmap_User_Groups, Lizmap_Override_Filter
     * have been added to the OGC request parameters.
     *
     * @return array the OGC request parameters with Lizmap extra parameters for filtering request
     */
    public function parameters()
    {
        $appContext = $this->appContext;
        // Check if a user is authenticated
        if (!$appContext->UserIsConnected()) {
            // return parameters with empty user param
            return array_merge($this->params, array(
                'Lizmap_User' => '',
                'Lizmap_User_Groups' => '',
            ));
        }

        // Provide user and groups to lizmap plugin access control without private group
        $user = $appContext->getUserSession();
        $userGroups = $appContext->aclUserPublicGroupsId();
        $loginFilteredOverride = $appContext->aclCheck('lizmap.tools.loginFilteredLayers.override', $this->repository->getKey());

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
     * @return object The request result with HTTP code, response mime-type, response data
     *                (properties $code, $mime, $data, $cached)
     */
    public function process()
    {
        $req = $this->param('request');
        $req_version = $this->param('version');

        // VERSION parameter is mandatory except for GetCapabilities request
        if (strtolower($req) !== 'getcapabilities' && !$req_version) {
            \jMessage::add('Please add the value of the VERSION parameter', 'OperationNotSupported');

            return $this->serviceException(501);
        }

        if ($req) {
            $reqMeth = 'process_'.$req;
            if (method_exists($this, $reqMeth)) {
                return $this->{$reqMeth}();
            }
        }

        if (!$req) {
            \jMessage::add('Please add or check the value of the REQUEST parameter', 'OperationNotSupported');
        } else {
            \jMessage::add('Request '.$req.' is not supported', 'OperationNotSupported');
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

        return Proxy::constructUrl($this->parameters(), $this->services, $url);
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
        $options['loginFilteredOverride'] = \jAcl2::check('lizmap.tools.loginFilteredLayers.override', $this->repository->getKey());

        list($data, $mime, $code) = \Lizmap\Request\Proxy::getRemoteData($querystring, $options);

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
     * @return object The request result with HTTP code, response mime-type, response data
     *                (properties $code, $mime, $data, $cached)
     */
    protected function serviceException($code = 400)
    {
        $messages = \jMessage::getAll();

        if ($this->tplExceptions !== null) {
            $mime = 'text/xml';
            $tpl = new \jTpl();
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
        \jMessage::clearAll();

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
     * @return object The request result with HTTP code, response mime-type, response data
     *                (properties $code, $mime, $data, $cached)
     */
    protected function process_getcapabilities()
    {
        $appContext = $this->appContext;
        // Get cached session
        // the cache should be unique between each user/service because the
        // request content depends on rights of the user
        $key = session_id().'-'.$this->param('service');
        if ($appContext->UserIsConnected()) {
            $juser = $appContext->getUserSession();
            $key .= '-'.$juser->login;
        }
        $key = 'getcapabilities-'.sha1($key);
        $cached = false;

        try {
            $cached = $this->project->getCacheHandler()->getProjectRelatedDataCache($key);
        } catch (\Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            \jLog::logEx($e, 'error');
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
            $cachedContent = array(
                'code' => $response->code,
                'mime' => $response->mime,
                'data' => $response->data,
            );
            $cached = $this->project->getCacheHandler()->setProjectRelatedDataCache($key, $cachedContent, 3600);
        }

        return (object) array(
            'code' => $response->code,
            'mime' => $response->mime,
            'data' => $response->data,
            'cached' => $cached,
        );
    }

    /*
     * Interprets a string of XML into an object
     *
     * @param string $xmldata a well-formed XML string
     * @param string $name    an XML name
     *
     * @return SimpleXMLElement|null an object with properties containing
     *                               the data held within the XML document
     *                               or null
     */
    protected function loadXmlString($xmldata, $name)
    {
        // Get data from XML
        // Create a DOM instance
        $xml = App\XmlTools::xmlFromString($xmldata);
        if (!is_object($xml)) {
            $errormsg = '\n'.$xmldata.'\n'.$xml;
            $errormsg = '\n'.http_build_query($this->params).$errormsg;
            $errormsg = 'An error has been raised when loading '.$name.':'.$errormsg;
            \jLog::log($errormsg, 'error');

            return null;
        }

        return $xml;
    }
}
