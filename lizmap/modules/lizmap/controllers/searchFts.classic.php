<?php
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
     * Query a database.
     *
     * @urlparam text $query A SQL query on objects
     * @urlparam text $bbox A bounding box in EPSG:4326 Optionnal
     *
     * @return jResponseJson geoJSON
     */
    public function get()
    {
        $rep = $this->getResponse('json');
        $content = array();
        $rep->data = $content;

        // Parameters
        $pquery = $this->param('query');
        if (!$pquery) {
            return $rep;
        }
        $project = $this->param('project');
        $pquery = filter_var($pquery, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);

        // Run query
        $fts = jClasses::getService('lizmap~lizmapFts');
        $data = $fts->getData($project, $pquery);

        $rep->data = $data;

        return $rep;
    }
}
