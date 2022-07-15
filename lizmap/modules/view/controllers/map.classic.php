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
        if ($this->param('layers')) {
            $url_params['layers'] = $this->param('layers');
        }
        if ($this->param('bbox')) {
            $url_params['bbox'] = $this->param('bbox');
        }
        if ($this->param('crs')) {
            $url_params['crs'] = $this->param('crs');
        }
        if ($this->param('filter')) {
            $url_params['filter'] = $this->param('filter');
        }
        if ($this->param('layerStyles')) {
            $url_params['layerStyles'] = $this->param('layerStyles');
        }
        if ($this->param('layerOpacities')) {
            $url_params['layerOpacities'] = $this->param('layerOpacities');
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
