<?php

/**
 * Displays a full featured map based on one Qgis project.
 *
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
include jApp::getModulePath('view').'controllers/lizMap.classic.php';

class mapCtrl extends lizMapCtrl
{
    /**
     * @return jResponseHtml|jResponseRedirect
     */
    public function index()
    {
        $rep = parent::index();

        // Get repository key
        $repository = $this->param('repository');
        // Get the project key
        $project = htmlspecialchars(strip_tags($this->param('project')));

        $url_params = array(
            'repository' => $repository,
            'project' => $project,
        );
        // other map params
        $knownKeyParams = array(
            'layers',
            'bbox',
            'crs',
            'filter',
            'layerStyles',
            'layerOpacities',
            'mapTheme',
        );
        // Get redirection parameters
        $redirectKeyParams = jEvent::notify('getRedirectKeyParams', array('repository' => $repository, 'project' => $project))->getResponse();
        $keyParams = array_unique(array_merge($knownKeyParams, $redirectKeyParams), SORT_REGULAR);
        $params = $this->params();
        foreach ($keyParams as $key) {
            if (array_key_exists($key, $params)) {
                $url_params[$key] = $params[$key];
            }
        }

        if ($rep->getType() === 'html') {
            // @var jResponseHtml $rep
            $url_params['repository'] = $this->repositoryKey;
            $url_params['project'] = $this->projectKey;

            $rep->body->assign('auth_url_return', jUrl::get('view~map:index', $url_params));

            return $rep;
        }

        /** @var jResponseRedirect $rep */
        if ($rep->getType() === 'redirect' && $rep->action === 'jcommunity~login:index') {
            $rep->params['auth_url_return'] = jUrl::get('view~map:index', $url_params);
        }

        return $rep;
    }
}
