<?php
/**
* Php proxy to access inao lizmap full text search
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2016 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class searchFtsCtrl extends jController {

    /**
    * Query a QuickFinder database
    * @param text $query A query on OpenStreetMap object
    * @param text $bbox A bounding box in EPSG:4326 Optionnal
    * @return GeoJSON.
    */
    function get() {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'search_results.json';
        $rep->mimeType = 'application/json';
        $content = '[]';
        $rep->content = $content;

        // Parameters
        $pquery = $this->param('query');
        if ( !$pquery ) {
          return $rep;
        }
        $pquery = filter_var($pquery, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);

        // Limitations
        $limit_tot = 30;
        $limit_search = 15;

        // Run query
        $autocomplete = jClasses::getService('lizmap~lizmapFts');
        $result = $autocomplete->getData( $pquery );

        // Query and format data for each search key
        $nb = array( 'search'=>array(), 'tot'=>0 );
        $data = array();

        // Format data
        foreach($result as $item) {
            $key = $item->layer;
            if( !array_key_exists($key, $nb['search']) )
                $nb['search'][$key] = 0;
            if( $nb['search'][$key] >= $limit_search)
                continue;
            if( $nb['tot'] >= $limit_tot)
                break;

            if( !array_key_exists($key, $data) )
                $data[$key] = array();

            $data[$key]['search_name'] = $key;
            $data[$key]['layer_name'] = $key;
            $data[$key]['srid'] = 'EPSG:2154';
            if( !array_key_exists('features', $data[$key]) )
                $data[$key]['features'] = array();
            $data[$key]['features'][] = array(
                'label' => preg_replace( '#@@.+#', '', $item->label),
                'geometry' => $item->wkt_geom,
            );
            $nb['search'][$key]+=1;
            $nb['tot']+=1;
        }
        $rep->content = json_encode($data);
        return $rep;
    }
}