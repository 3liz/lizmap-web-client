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

        // Use a transaction to avoid: "ERROR: current transaction is aborted"
        // https://github.com/3liz/lizmap-web-client/issues/2008
        $cnx->beginTransaction();

        // Try to get data from lizmap_fts table / view / materialized view
        try {
            $cnx->query('SELECT * FROM lizmap_search LIMIT 0;');
            $cnx->commit();
            $ok = true;
        } catch (Exception $e) {
            $cnx->rollback();
            $ok = false;
        }

        return $ok;
    }
}
