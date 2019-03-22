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
            // try to get the specific search profile to do not rebuild it
            jProfiles::get('jdb', $profile, true);
        } catch (Exception $e) {
            // else use default
            $profile = null;
        }

        // Try to get data from lizmap_fts table / view / materialized view
        try {
            // try to get the specific search profile to do not rebuild it
            $cnx = jDb::getConnection($profile);
            $cnx->query('SELECT * FROM lizmap_search LIMIT 0;');
            $ok = true;
        } catch (Exception $e) {
            $ok = false;
        }

        return $ok;
    }
}
