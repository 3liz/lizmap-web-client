<?php

use Lizmap\Project\UnknownLizmapProjectException;
use Lizmap\Request\Proxy;

/**
 * Php proxy to access database search.
 *
 * @author    3liz
 * @copyright 2018-2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class searchFtsCtrl extends jController
{
    /**
     * Query a database with lizmap_search SQL table.
     *
     * @urlparam text $query A SQL query on objects
     *
     * @return jResponseJson geoJSON
     */
    public function get()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $content = array();
        $rep->data = $content;

        // Parameters
        $pquery = htmlspecialchars(strip_tags($this->param('query')), ENT_NOQUOTES);
        if (!$pquery) {
            jLog::log('Invalid "query" parameter in lizmap_search', 'lizmapadmin');
            $rep->setHttpStatus(400, Proxy::getHttpStatusMsg(400));

            return $rep;
        }

        $repository = $this->param('repository');
        if (!$repository) {
            jLog::log('Invalid "repository" parameter in lizmap_search', 'lizmapadmin');
            $rep->setHttpStatus(400, Proxy::getHttpStatusMsg(400));

            return $rep;
        }

        $project = $this->param('project');
        if (!$project) {
            jLog::log('Invalid "project" parameter in lizmap_search', 'lizmapadmin');
            $rep->setHttpStatus(400, Proxy::getHttpStatusMsg(400));

            return $rep;
        }

        // Check repository
        $lrep = lizmap::getRepository($repository);
        if ($lrep == null) {
            jLog::log('The repository "'.$repository.'"" does not exist.', 'lizmapadmin');
            $rep->setHttpStatus(400, Proxy::getHttpStatusMsg(400));

            return $rep;
        }

        // Get the project object
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if ($lproj == null) {
                jLog::log('Error while loading "'.$project.'" project', 'lizmapadmin');
                $rep->setHttpStatus(400, Proxy::getHttpStatusMsg(400));

                return $rep;
            }
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');
            jLog::log('The lizmap project "'.$project.'" does not exist.', 'lizmapadmin');
            $rep->setHttpStatus(400, Proxy::getHttpStatusMsg(400));

            return $rep;
        }

        // Redirect if no rights to access this repository
        if (!$lproj->checkAcl()) {
            // jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
            $rep->setHttpStatus(403, Proxy::getHttpStatusMsg(403));

            return $rep;
        }

        // Run query
        $fts = jClasses::getService('lizmap~lizmapFts');
        $data = $fts::getData($lproj, $pquery, $this->boolParam('debug'));

        $rep->data = $data;

        return $rep;
    }
}
