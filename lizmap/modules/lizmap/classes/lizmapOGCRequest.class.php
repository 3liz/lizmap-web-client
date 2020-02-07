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

    public function process()
    {
        return $this->{$this->param('request')}();
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

    protected function serviceException()
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
            'code' => 400,
            'mime' => $mime,
            'data' => $data,
            'cached' => false,
        );
    }

    protected function getcapabilities()
    {
        $querystring = $this->constructUrl();

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

        // Retry if 500 error ( hackish, but QGIS Server segfault sometimes with cache issue )
        if ($code == 500) {
            // Get remote data
            list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);
        }

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => false,
        );
    }
}
