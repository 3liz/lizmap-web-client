<?php
/**
 * Displays the list of projects for ajax request.
 *
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizAjaxCtrl extends jController
{
    /**
     * Return 404.
     *
     * @param mixed $message
     */
    protected function error404($message)
    {
        $rep = $this->getResponse('htmlfragment');
        $content = '<p>404 not found (wrong action)</p>';
        $content .= '<p>'.$message.'</p>';
        $rep->addContent($content);
        $rep->setHttpStatus('404', 'Not Found');

        return $rep;
        /*
          $rep = $this->getResponse('text');
          $rep->content = $message  ;
          $rep->setHttpStatus('404', 'Not Found');
          return $rep;
         */
    }

    /**
     * Return 403.
     *
     * @param mixed $message
     */
    protected function error403($message)
    {
        $rep = $this->getResponse('htmlfragment');
        $content = '<p>403 forbidden (you\'re not allowed to access to this content)</p>';
        $content .= '<p>'.$message.'</p>';
        $rep->addContent($content);
        $rep->setHttpStatus('403', 'Forbidden');

        return $rep;
    }

    /**
     * Return 401.
     *
     * @param mixed $message
     */
    protected function error401($message)
    {
        $rep = $this->getResponse('htmlfragment');
        $content = '<p>401 Unauthorized (authentication is required)</p>';
        $content .= '<p>'.$message.'</p>';
        $rep->addContent($content);
        $rep->setHttpStatus('401', 'Unauthorized');

        return $rep;
    }

    /**
     * Displays the list of project for a given repository for ajax request.
     *
     * @param string $repository. Name of the repository.
     *
     * @return Html fragment with a list of projects
     */
    public function index()
    {
        $rep = $this->getResponse('htmlfragment');

        // Get repository data
        $repository = $this->param('repository');

        if ($repository) {
            $lrep = lizmap::getRepository($repository);
            if (!$lrep) {
                return $this->error404('');
            }
            if (!jAcl2::check('lizmap.repositories.view', $lrep->getKey())) {
                return $this->error403(jLocale::get('view~default.repository.access.denied'));
            }
        }

        $content = jZone::get('ajax_view', array('repository' => $repository));
        $rep->addContent($content);

        return $rep;
    }

    /**
     * Displays map for ajax request.
     *
     * @param string $repository. Name of the repository.
     * @param string $project.    Name of the project.
     *
     * @return Html fragment with a list of projects
     */
    public function map()
    {
        $rep = $this->getResponse('htmlfragment');

        // Get the project
        $project = filter_var($this->param('project'), FILTER_SANITIZE_STRING);

        // Get repository data
        $repository = $this->param('repository');

        // Get lizmapRepository class
        // if repository not found get the default
        $lrep = null;
        $lser = lizmap::getServices();
        if (!$repository) {
            $lrep = lizmap::getRepository($lser->defaultRepository);
            $repository = $lser->defaultRepository;
        } else {
            $lrep = lizmap::getRepository($repository);
        }

        if (!$lrep) {
            return $this->error404('');
        }
        if (!jAcl2::check('lizmap.repositories.view', $lrep->getKey())) {
            return $this->error403(jLocale::get('view~default.repository.access.denied'));
        }

        // We must redirect to default repository project list if no project given
        if (!$project) {
            try {
                $lproj = lizmap::getProject($lrep->getKey().'~'.$lser->defaultProject);
                if (!$lproj) {
                    return $this->error404('The parameter project is mandatory!');
                }
                $project = $lser->defaultProject;
            } catch (UnknownLizmapProjectException $e) {
                return $this->error404('The parameter project is mandatory!');
            }
        }

        // Get lizmapProject class
        try {
            $lproj = lizmap::getProject($lrep->getKey().'~'.$project);
            if (!$lproj) {
                return $this->error404('The lizmapProject '.strtoupper($project).' does not exist !');
            }
        } catch (UnknownLizmapProjectException $e) {
            return $this->error404('The lizmapProject '.strtoupper($project).' does not exist !');
        }

        if (!$lproj->checkAcl()) {
            return $this->error403('view~default.repository.access.denied');
        }

        $lizUrls = array(
            'params' => array('repository' => $repository, 'project' => $project),
            'config' => jUrl::getFull('lizmap~service:getProjectConfig'),
            'wms' => jUrl::getFull('lizmap~service:index'),
            'media' => jUrl::getFull('view~media:getMedia'),
            'nominatim' => jUrl::getFull('lizmap~osm:nominatim'),
            'edition' => jUrl::getFull('lizmap~edition:getFeature'),
            'permalink' => jUrl::getFull('view~map:index'),
        );

        // Get optional WMS public url list
        if ($lser->wmsPublicUrlList) {
            $publicUrlList = $lser->wmsPublicUrlList;
            function f($x)
            {
                return jUrl::getFull('lizmap~service:index', array(), 0, trim($x));
            }
            $pul = array_map('f', explode(',', $publicUrlList));
            $lizUrls['publicUrlList'] = $pul;
        }

        if (jAcl2::check('lizmap.admin.repositories.delete')) {
            $lizUrls['removeCache'] = jUrl::getFull('admin~config:removeLayerCache');
        }

        $content = '<script type="text/javascript" src="'.jUrl::getFull('view~translate:index').'"/>'."\n";
        $content .= '<script type="text/javascript">// <![CDATA['."\n";
        $content .= 'var lizUrls = '.json_encode($lizUrls).";\n";
        $content .= 'var lizPosition = {"lon":null, "lat":null, "zoom":null};'."\n";
        $content .= "$('#map').css('background-color','".$lproj->getCanvasColor()."');\n";
        $content .= '// ]]></script>';

        // Get the WMS information
        $wmsInfo = $lproj->getWMSInformation();
        // Set page title from projet title
        if ($wmsInfo['WMSServiceTitle'] != '') {
            $rep->title = $wmsInfo['WMSServiceTitle'];
        } else {
            $rep->title = $repository.' - '.$project;
        }

        $assign = array_merge(array(
            'repositoryLabel' => $lrep->getData('label'),
            'repository' => $lrep->getKey(),
            'project' => $project,
        ), $wmsInfo);

        $tpl = new jTpl();
        $tpl->assign($assign);
        $content .= $tpl->fetch('view~map');

        $rep->addContent($content);

        return $rep;
    }
}
