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
     * Get the parameters used to filter the lizmap_search items by user.
     *
     * The items can be restricted to some groups or users with the item_filter
     * column. The groups of the authenticated user are given as parameters
     * grp0, grp1..., and its login as the parameter login.
     *
     * @param Project $project The QGIS project
     *
     * @return array<string, string> the parameters, empty if the user is not authenticated
     */
    protected static function getUserFilterParameters($project)
    {
        $params = array();
        if (!jAuth::isConnected()) {
            return $params;
        }

        // Groups of the user
        $appContext = $project->getAppContext();
        $userGroups = array_values($appContext->aclUserPublicGroupsId());
        foreach ($userGroups as $i => $group) {
            $params['grp'.$i] = (string) $group;
        }

        // Login of the user
        $user = jAuth::getUserSession();
        $params['login'] = (string) $user->login;

        return $params;
    }

    /**
     * Generate the SQL for lizmap_search according to the given project.
     *
     * The values are not put in the SQL: it contains named parameters, given
     * when executing the query.
     *
     * @param Project               $project          The QGIS project
     * @param int                   $termsCount       How many terms are in the searched string
     * @param array<string, string> $userFilterParams The parameters returned by getUserFilterParameters()
     *
     * @return string The SQL query
     */
    protected static function generateSql($project, $termsCount, $userFilterParams = array())
    {

        // Build search query

        // SELECT
        // word_similarity measures how well the search term matches the best
        // word-level substring of item_label. Unlike similarity(), it gives
        // equal scores to all labels that contain the search term as a whole
        // word, so the secondary alphabetical sort on item_label is effective.
        $sql = "
        SELECT
        item_layer, item_label, concat('EPSG:', ST_SRID(geom)) AS item_epsg, ST_AsText(geom) AS item_wkt,
        word_similarity(trim( :searchedString ), item_label) AS sim
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
        // Ok if any group or the login of the authenticated user matches:
        // the values are given as named parameters
        foreach (array_keys($userFilterParams) as $paramName) {
            $sql .= ' OR :'.$paramName." = ANY ( string_to_array(item_filter, ',', ' ') )";
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
    public static function getData($project, $searchedString, $debug, $limit = 500)
    {
        $terms = preg_split('/\s+/', $searchedString);
        // Groups and login of the authenticated user, to filter the items
        $userFilterParams = lizmapFts::getUserFilterParameters($project);
        $sql = lizmapFts::generateSql($project, count($terms), $userFilterParams);
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
            $params = array_merge($params, $userFilterParams);

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
            $limit_tot = 100;
            $limit_search = 50;

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
