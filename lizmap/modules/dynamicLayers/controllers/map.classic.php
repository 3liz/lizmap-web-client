<?php
/**
 * DynamicLayers - Redirect to Lizmap view~map after creating child project.
 *
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class mapCtrl extends jController
{
    /**
     * Use DynamicLayers python plugin to get a child project
     * And redirect to Lizmap view map controller with changed project parameter.
     */
    public function index()
    {

        /** @var jResponseRedirect $rep */
        // Set up redirect response
        $rep = $this->getResponse('redirect');
        $rep->action = 'view~map:index';
        $params = jApp::coord()->request->params;
        $rep->params = $params;

        $project = $this->param('project');
        $repository = $this->param('repository');
        if (!$project || $repository) {
            jLog::log('Dynamic layers - no parameters project or repository', 'lizmapadmin');

            return $rep;
        }

        // Get project path
        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            jLog::log('Dynamic layers - bad repository '.$repository, 'lizmapadmin');

            return $rep;
        }

        // Redirect to normal map if no suitable parameters
        if (!$params['dlsourcelayer'] or !$params['dlexpression']) {
            jLog::log('Dynamic layers - project '.$repository.'/'.$project.': no parameters DLSOURCELAYER or DLEXPRESSION', 'lizmapadmin');

            return $rep;
        }

        $projectTemplatePath = realpath($lrep->getPath()).'/'.$project.'.qgs';

        // Use QGIS python plugins dynamicLayers to get child project
        $lizmapServices = lizmap::getServices();
        $url = $lizmapServices->wmsServerURL.'?';
        $qparams = array();
        $qparams['service'] = 'dynamicLayers';
        $qparams['map'] = $projectTemplatePath;
        $qparams['dlsourcelayer'] = $params['dlsourcelayer'];
        $qparams['dlexpression'] = $params['dlexpression'];
        $rparams = http_build_query($qparams);
        $querystring = $url.$rparams;

        // Get remote data
        list($data, $mime, $code) = \Lizmap\Request\Proxy::getRemoteData($querystring);

        // Get returned response and redirect to appropriate project page
        $json = json_decode($data);
        if ($json->status == 0) {
            jLog::log('DynamicLayers error : '.$json->message, 'lizmapadmin');
        } else {
            $params['project'] = preg_replace('#\.qgs$#', '', $json->childProject);
            unset($params['dlsourcelayer'] , $params['dlexpression']);

            $rep->params = $params;

            jLog::log('DynamicLayers message : '.$json->message.' - '.$json->childProject, 'lizadmin');
        }

        return $rep;
    }
}
