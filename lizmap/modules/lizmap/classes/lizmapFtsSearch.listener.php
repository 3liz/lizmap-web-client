<?php
/**
 * Lizmap FTS searcher.
 *
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizmapFtsSearchListener extends jEventListener
{
    public function onsearchServiceItem($event)
    {
        // Check if needed table lizmap_fts is queryable
        if ($this->checkLizmapFts()) {
            $event->add(
                array(
                    'type' => 'Fts',
                    'service' => 'lizmapFts',
                    'url' => jUrl::get('lizmap~searchFts:get'),
                )
            );
        }
    }

    protected function checkLizmapFts()
    {
        $ok = false;
        $profile = 'search';

        try {
            // try to get the specific search profile
            jProfiles::get('jdb', $profile, true);
        } catch (Exception $e) {
            // else use default profile
            $profile = null;
        }

        // The Lizmap FTS search is only available for PostgreSQL
        $cnx = jDb::getConnection($profile);
        if ($cnx->dbms != 'pgsql') {
            return false;
        }

        // Check if lizmap_search table / view / materialized view exists
        // in the search_path
        $sql = "
            SELECT EXISTS (
            SELECT FROM
                pg_catalog.pg_class c
            JOIN
                pg_catalog.pg_namespace n ON
                n.oid = c.relnamespace
            WHERE
                n.nspname = ANY(current_schemas(FALSE)) AND
                -- current_schemas(FALSE) returns the list of schemas in the search_path
                c.relname = 'lizmap_search' AND
                c.relkind = ANY(ARRAY['r', 'v', 'm', 'f', 'p'])
                -- r = ordinary table, v = view, m = materialized view, f = foreign table, p = partitioned
            ) AS lizmap_search_exists;
        ";

        try {
            $res = $cnx->query($sql);
            foreach ($res as $r) {
                return $r->lizmap_search_exists;
            }
        } catch (Exception $e) {
            jLog::logEx($e, 'error');

            return false;
        }

        return false;
    }
}
