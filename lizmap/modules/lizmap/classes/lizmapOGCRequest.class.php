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
class lizmapOGCRequest
{
    /**
     * @var lizmapProject
     */
    protected $project;

    protected $repository;

    protected $params;

    protected $services;

    protected $tplExceptions;

    /**
     * constructor.
     *
     * @param lizmapProject $project the project has a lizmapProject Class
     * @param array         $params  the params array
     */
    public function __construct($project, $params)
    {
        //print_r( $project != null );
        $this->project = $project;

        $this->repository = $project->getRepository();

        $this->services = lizmap::getServices();

        $params['map'] = $project->getRelativeQgisPath();
        $this->params = lizmapProxy::normalizeParams($params);
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

    /**
     * Gets the request parameters.
     *
     * @return array the request parameters
     */
    public function parameters()
    {
        return $this->params;
    }

    public function process()
    {
        $req = $this->param('request');
        if ($req && method_exists($this, $req)) {
            return $this->{$req}();
        }

        if (!$req) {
            jMessage::add('Please add or check the value of the REQUEST parameter', 'OperationNotSupported');
        } else {
            jMessage::add('Request '.$req.' is not supported', 'OperationNotSupported');
        }

        return $this->serviceException(501);
    }

    protected function constructUrl()
    {
        $url = $this->services->wmsServerURL.'?';

        $bparams = http_build_query($this->params);

        // replace some chars (not needed in php 5.4, use the 4th parameter of http_build_query)
        $a = array('+', '_', '.', '-');
        $b = array('%20', '%5F', '%2E', '%2D');
        $bparams = str_replace($a, $b, $bparams);

        return $url.$bparams;
    }

    protected function serviceException($code = 400)
    {
        $messages = jMessage::getAll();
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
            $tpl = new jTpl();
            $tpl->assign('messages', $messages);
            $data = $tpl->fetch($this->tplExceptions);
        }
        jMessage::clearAll();

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => false,
        );
    }

    protected function getcapabilities()
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
        if ($cached !== false && $cached['mtime'] < $this->project->getFileTime()) {
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

        $querystring = $this->constructUrl();

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

        // Retry if 500 error ( hackish, but QGIS Server segfault sometimes with cache issue )
        if ($code == 500) {
            // Get remote data
            list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);
        }

        if ($code == 200) {
            $cached = array(
                'mtime' => $this->project->getFileTime(),
                'code' => $code,
                'mime' => $mime,
                'data' => $data,
            );
            $cached = jCache::set($key, $cached, 3600, 'qgisprojects');
        }

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => $cached,
        );
    }
}
