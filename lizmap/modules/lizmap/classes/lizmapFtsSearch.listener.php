<?php

use Lizmap\App\LizmapSearch;

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
        $lizmapSearch = new LizmapSearch(lizmap::getAppContext());
        if ($lizmapSearch->check()) {
            $event->add(
                array(
                    'type' => 'Fts',
                    'service' => 'lizmapFts',
                    'url' => jUrl::get('lizmap~searchFts:get'),
                )
            );
        }
    }
}
