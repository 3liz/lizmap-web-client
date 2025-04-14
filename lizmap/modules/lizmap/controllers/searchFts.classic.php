<?php

use Lizmap\Project\UnknownLizmapProjectException;

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
            return $rep;
        }

        $repository = $this->param('repository');
        if (!$repository) {
            // The parameter repository is mandatory !

            return $rep;
        }

        $project = $this->param('project');
        if (!$project) {
            // The parameter project is mandatory !

            return $rep;
        }

        // Check repository
        $lrep = lizmap::getRepository($repository);
        if ($lrep == null) {
            jLog::log('The repository '.$repository.' does not exist !', 'lizmapadmin');

            return $rep;
        }

        // Get the project object
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if ($lproj == null) {
                jLog::log('The lizmap project '.$project.' does not exist !', 'lizmapadmin');

                return $rep;
            }
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');
            jLog::log('The lizmap project '.$project.' does not exist !', 'lizmapadmin');

            return $rep;
        }

        // Redirect if no rights to access this repository
        if (!$lproj->checkAcl()) {
            // jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');

            return $rep;
        }

        // Run query
        $fts = jClasses::getService('lizmap~lizmapFts');
        $data = $fts->getData($lproj, $pquery, $this->boolParam('debug'));

        $rep->data = $data;

        return $rep;
    }
}
