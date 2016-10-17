<?php
/**
* Php proxy to access OpenStreetMap services
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2016 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class searchCtrl extends jController {

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

    // Get project and repository, and check rights
    $project = $this->param('project');
    $repository = $this->param('repository');
    $lrep = lizmap::getRepository($repository);
    $lproj = lizmap::getProject($repository.'~'.$project);
    if ( !$lproj ){
      jMessage::add('The lizmapProject '.strtoupper($project).' does not exist !', 'ProjectNotDefined');
      return $rep;
    }
    if ( !$lproj->checkAcl() ){
      jMessage::add(jLocale::get('view~default.repository.access.denied'), 'AuthorizationRequired');
      return $rep;
    }

    // Parameters
    $pquery = $this->param('query');
    if ( !$pquery ) {
      return $rep;
    }
    $pquery = filter_var($pquery, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);

    // Get FTS searches
    $ftsSearches = $lproj->hasFtsSearches();
    if ( !$ftsSearches ) {
      return $rep;
    }
    $searches = $ftsSearches['searches'];
    $jdb_profile = $ftsSearches['jdb_profile'];

    // Limitations
    $limit_tot = 30;
    $limit_search = 10;

    // Create FTS query
    $words = explode(' ', $pquery);
    $matches = implode('* ', $words).'*';
    $sql = "
    SELECT search_id,content,wkb_geom
    FROM quickfinder_data
    WHERE content MATCH
    ";
    $cnx = jDb::getConnection($jdb_profile);
    $sql.= " ".$cnx->quote($matches);
    $limit = max( count($searches)*$limit_search, $limit_tot);
    $sql.= " LIMIT ".$limit;
    //jLog::log($sql);

    // Run query
    $res = $cnx->query($sql);
    $data = array();

    $nb = array( 'search'=>array(), 'tot'=>0 );
    foreach($res as $item){
        $key = $item->search_id;
        if( !array_key_exists($key, $nb['search']) )
            $nb['search'][$key] = 0;
        if( $nb['search'][$key] >= $limit_search)
            continue;
        if( $nb['tot'] >= $limit_tot)
            break;

        if( !array_key_exists($key, $data) )
            $data[$key] = array();

        $data[$key]['search_name'] = $searches[$key]['search_name'];
        $data[$key]['layer_name'] = $searches[$key]['layer_name'];
        $data[$key]['srid'] = $searches[$key]['srid'];
        if( !array_key_exists('features', $data[$key]) )
            $data[$key]['features'] = array();
        $data[$key]['features'][] = array(
            'label' => $item->content,
            'geometry' => $item->wkb_geom,
        );
        $nb['search'][$key]+=1;
        $nb['tot']+=1;

    }

    $rep->content = json_encode($data);

    return $rep;
  }
}
