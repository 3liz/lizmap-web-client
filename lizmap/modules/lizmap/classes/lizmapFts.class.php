<?php

/**
 * @author    René-Luc D'hont, Michael Douchin
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license    All rights reserved
 */

use Lizmap\Project\Project;

class lizmapFts
{
    /**
     * Generate the SQL for lizmap_search according to the given project.
     *
     * @param Project $project    The QGIS project
     * @param int     $termsCount How many terms are in the searched string
     *
     * @return string The SQL query
     */
    protected static function generateSql($project, $termsCount)
    {

        // Build search query

        // SELECT
        $sql = "
        SELECT
        item_layer, item_label, concat('EPSG:', ST_SRID(geom)) AS item_epsg, ST_AsText(geom) AS item_wkt,
        similarity(trim( :searchedString ), item_label) AS sim
        ";

        // FROM
        $sql .= '
        FROM lizmap_search
        ';

        // WHERE
        $sql .= '
        WHERE True';

        // Filter by given terms
        // We compare the unaccentuated terms with the unaccentuated item_label
        for ($i = 0; $i < $termsCount; ++$i) {
            $sql .= "
            AND f_unaccent(item_label) ILIKE '%' || f_unaccent( :term".$i." ) || '%'
            ";
        }

        // Add filter by projects
        $sql .= "
        AND (
            item_project IS NULL OR :proj = ANY ( string_to_array(item_project, ',', ' ') )
        )
        ";

        // Add filter by groups and user if the user is authenticated
        $sql .= "
        AND ( item_filter = 'all' OR item_filter IS NULL";
        $isConnected = jAuth::isConnected();
        if ($isConnected) {
            // Ok if any group matches
            $appContext = $project->getAppContext();
            $userGroups = $appContext->aclUserPublicGroupsId();
            foreach ($userGroups as $g) {
                $sql .= " OR item_filter = '".$g."'";
            }
            // Ok if user matches
            $user = jAuth::getUserSession();
            $login = $user->login;
            $sql .= " OR item_filter = '".$login."'";
        }
        $sql .= ' )';
        $sql .= '
        ORDER BY sim DESC, item_label
        LIMIT :lim;
        ';

        return $sql;
    }

    /**
     * Method called by the autocomplete input field for place search.
     *
     * @param Project $project
     * @param string  $searchedString Searched string
     * @param bool    $debug          If the debug mode is ON
     * @param int     $limit          default 40
     *
     * @return List of matching places
     */
    public static function getData($project, $searchedString, $debug, $limit = 40)
    {
        $terms = preg_split('/\s+/', $searchedString);
        $sql = lizmapFts::generateSql($project, count($terms));
        $data = array();

        try {
            // Format words into {foo,bar}
            $params = array(
                'searchedString' => $searchedString,
                'proj' => $project->getKey(),
                'lim' => $limit,
            );

            foreach ($terms as $i => $term) {
                $params['term'.$i] = $term;
            }

            if ($debug) {
                jLog::log(
                    'Debug Lizmap search, SQL query : '.$sql.' with parameters → '.json_encode($params),
                    'lizmapadmin'
                );
            }

            $profile = 'search';

            try {
                // try to get the specific search profile to do not rebuild it
                jProfiles::get('jdb', $profile, true);
            } catch (Exception $e) {
                // else use default
                $profile = null;
            }

            $cnx = jDb::getConnection($profile);
            $resultSet = $cnx->prepare($sql);
            $resultSet->execute($params);

            $result = $resultSet->fetchAll();

            // Limitations
            $limit_tot = 60;
            $limit_search = 30;

            // Prepare array to count items per layer
            $nb = array('search' => array(), 'tot' => 0);
            // Format result
            foreach ($result as $item) {
                $key = $item->item_layer;
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

                $data[$key]['search_name'] = $key;
                $data[$key]['layer_name'] = $key;
                $data[$key]['srid'] = $item->item_epsg;
                if (!array_key_exists('features', $data[$key])) {
                    $data[$key]['features'] = array();
                }
                $data[$key]['features'][] = array(
                    'label' => $item->item_label,
                    'geometry' => $item->item_wkt,
                );
                ++$nb['search'][$key];
                ++$nb['tot'];
            }
        } catch (Exception $e) {
            $data = array();
            jLog::log(
                'An error has been raised when executing lizmap_search on "'.$project->getKey().'":'.$e->getMessage(),
                'lizmapadmin'
            );
            jLog::logEx($e, 'error');
        }

        return $data;
    }
}
