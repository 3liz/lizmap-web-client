<?php

use Lizmap\Project\UnknownLizmapProjectException;

/**
 * Php proxy to access OpenStreetMap services.
 *
 * @author    3liz
 * @copyright 2016 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class searchCtrl extends jController
{
    /**
     * Query a QuickFinder database.
     *
     * @urlparam text $query A query on OpenStreetMap object
     * @urlparam text $bbox A bounding box in EPSG:4326 Optionnal
     *
     * @return jResponseBinary geoJSON content
     */
    public function get()
    {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'search_results.json';
        $rep->mimeType = 'application/json';
        $content = '[]';
        $rep->content = $content;

        // Get project and repository, and check rights
        $project = $this->param('project');
        $repository = $this->param('repository');
        $lrep = lizmap::getRepository($repository);
        $lproj = null;

        try {
            $lproj = lizmap::getProject($repository.'~'.$project);
            if (!$lproj) {
                jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

                return $rep;
            }
        } catch (UnknownLizmapProjectException $e) {
            jLog::logEx($e, 'error');
            jMessage::add('The lizmap project '.strtoupper($project).' does not exist !', 'ProjectNotDefined');

            return $rep;
        }
        if (!$lproj->checkAcl()) {
            jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');

            return $rep;
        }

        // Parameters
        $pquery = htmlspecialchars(strip_tags($this->param('query')), ENT_NOQUOTES);
        if (!$pquery) {
            return $rep;
        }

        // Get FTS searches
        $ftsSearches = $lproj->hasFtsSearches();
        if (!$ftsSearches) {
            return $rep;
        }
        $searches = $ftsSearches['searches'];
        $jdb_profile = $ftsSearches['jdb_profile'];

        // Limitations
        $limit_tot = 30;
        $limit_search = 15;

        $cnx = jDb::getConnection($jdb_profile);

        // Create FTS query
        $words = explode(' ', $pquery);
        $matches = implode('* ', $words).'*';
        $sql = 'SELECT search_id,content,wkb_geom FROM quickfinder_data WHERE';
        $sql .= ' content MATCH '.$cnx->quote($matches);

        // Add filter by groups and user if the user is authenticated
        if (!jAcl2::check('lizmap.tools.loginFilteredLayers.override', $lrep->getKey())) {
            $sql .= " AND ( content LIKE '%@@all' OR content NOT LIKE '%@@%'";
            $isConnected = jAuth::isConnected();
            if ($isConnected) {
                // Ok if any group matches
                $appContext = $lproj->getAppContext();
                $userGroups = $appContext->aclUserPublicGroupsId();
                foreach ($userGroups as $g) {
                    $sql .= " OR content LIKE '%@@".$g."'";
                }
                // Ok if user matches
                $user = jAuth::getUserSession();
                $login = $user->login;
                $sql .= " OR content LIKE '%@@".$login."'";
            }
            $sql .= ' )';
        }

        // Query and format data for each search key
        $nb = array('search' => array(), 'tot' => 0);
        $data = array();
        foreach ($searches as $skey => $sval) {

            // Add filter to get only data for given search key
            $sql_search = $sql.' AND search_id = '.$cnx->quote($skey);
            $limit = $limit_search;
            $sql_search .= ' LIMIT '.$limit;
            // jLog::log($sql_search);

            // Run query
            $res = $cnx->query($sql_search);

            // Format data
            foreach ($res as $item) {
                $key = $item->search_id;
                if (!array_key_exists($key, $nb['search'])) {
                    $nb['search'][$key] = 0;
                }
                if ($nb['search'][$key] >= $limit_search) {
                    continue;
                }
                if ($nb['tot'] >= $limit_tot) {
                    break;
                }

                if (!array_key_exists($key, $data)) {
                    $data[$key] = array();
                }

                $data[$key]['search_name'] = $searches[$key]['search_name'];
                $data[$key]['layer_name'] = $searches[$key]['layer_name'];
                $data[$key]['srid'] = $searches[$key]['srid'];
                if (!array_key_exists('features', $data[$key])) {
                    $data[$key]['features'] = array();
                }
                $data[$key]['features'][] = array(
                    'label' => preg_replace('#@@.+#', '', $item->content),
                    'geometry' => $item->wkb_geom,
                );
                ++$nb['search'][$key];
                ++$nb['tot'];
            }
        }
        $rep->content = json_encode($data);

        return $rep;
    }
}
