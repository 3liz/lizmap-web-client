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

namespace Lizmap\Request;

use Lizmap\App;

/**
 * Base class for Requests
 * https://en.wikipedia.org/wiki/Open_Geospatial_Consortium.
 */
abstract class OGCRequest
{
    /**
     * @var lizmapProject
     */
    protected $project;

    protected $repository;

    protected $params;

    protected $requestXml;

    protected $services;

    protected $tplExceptions;

    protected $appContext;

    /**
     * constructor.
     *
     * @param \Lizmap\Project\Project $project    the project has a lizmapProject Class
     * @param array                   $params     the params array
     * @param \lizmapServices         $services
     * @param string                  $requestXml the params array
     */
    public function __construct($project, $params, $services, App\AppContextInterface $appContext, $requestXml = null)
    {
        //print_r( $project != null );
        $this->project = $project;

        $this->repository = $project->getRepository();

        $this->services = $services;
        $this->appContext = $appContext;

        $params['map'] = $project->getRelativeQgisPath();
        $this->params = Proxy::normalizeParams($params);
        $this->requestXml = $requestXml;
    }

    /**
     * Gets the value of a request parameter. If not defined, gets its default value.
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

    public function parameters()
    {
        $appContext = $this->appContext;
        // Check if a user is authenticated
        if (!$appContext->UserisConnected()) {
            // return parameters with empty user param
            return array_merge($this->params, array(
                'Lizmap_User' => '',
                'Lizmap_User_Groups' => '',
            ));
        }

        // Provide user and groups to lizmap plugin access control
        $user = $appContext->getUserSession();
        $userGroups = $appContext->aclUserGroupsId();
        $loginFilteredOverride = $appContext->aclCheck('lizmap.tools.loginFilteredLayers.override', $this->repository->getKey());

        return array_merge($this->params, array(
            'Lizmap_User' => $user->login,
            'Lizmap_User_Groups' => implode(', ', $userGroups),
            'Lizmap_Override_Filter' => $loginFilteredOverride,
        ));
    }

    /**
     * Call the wanted Request.
     */
    public function process()
    {
        $req = $this->param('request');
        if ($req && method_exists($this, $req)) {
            return $this->{$req}();
        }

        if (!$req) {
            \jMessage::add('Please add or check the value of the REQUEST parameter', 'OperationNotSupported');
        } else {
            \jMessage::add('Request '.$req.' is not supported', 'OperationNotSupported');
        }

        return $this->serviceException(501);
    }

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

    protected function buildQuery($params)
    {
        $bparams = http_build_query($params);

        // replace some chars (not needed in php 5.4, use the 4th parameter of http_build_query)
        $a = array('+', '_', '.', '-');
        $b = array('%20', '%5F', '%2E', '%2D');

        return str_replace($a, $b, $bparams);
    }

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

        list($data, $mime, $code) = Proxy::getRemoteData($querystring, $options);

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
        );
    }

    protected function serviceException($code = 400)
    {
        $messages = \jMessage::getAll();
        $mime = 'text/plain';
        if (!$messages) {
            $data = '';
        } else {
            if (is_array($messages)) {
                $data = '';
            } else {
                $data = implode('\n', $messages);
            }
        }

        if ($this->tplExceptions !== null) {
            $mime = 'text/xml';
            $tpl = new \jTpl();
            $tpl->assign('messages', $messages);
            $data = $tpl->fetch($this->tplExceptions);
        }
        \jMessage::clearAll();

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => false,
        );
    }

    protected function getcapabilities()
    {
        $appContext = $this->appContext;
        // Get cached session
        $key = session_id().'-'.
               $this->project->getRepository()->getKey().'-'.
               $this->project->getKey().'-'.
               $this->param('service').'-getcapabilities';
        if ($appContext->UserisConnected()) {
            $juser = $appContext->getUserSession();
            $key .= '-'.$juser->login;
        }
        $key = sha1($key);
        $cached = false;

        try {
            $cached = $appContext->getCache($key, 'qgisprojects');
        } catch (\Exception $e) {
            // if qgisprojects profile does not exist, or if there is an
            // other error about the cache, let's log it
            \jLog::logEx($e, 'error');
        }
        // invalid cache
        if ($cached !== false &&
            $cached['mtime'] < $this->project->getFileTime() &&
            (!array_key_exists('ctime', $cached) ||
              $cached['ctime'] < $this->project->getCfgFileTime())
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
            $cached = $appContext->setCache($key, $cached, 3600, 'qgisprojects');
        }

        return (object) array(
            'code' => $response->code,
            'mime' => $response->mime,
            'data' => $response->data,
            'cached' => $cached,
        );
    }
}
