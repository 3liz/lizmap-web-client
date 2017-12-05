<?php
/**
* Lizmap FTS searcher.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2017 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

class lizmapFtsSearchListener extends jEventListener{

        function onsearchServiceItem ($event) {
            $event->add(
                array(
                    'type' => 'Fts',
                    'service' => 'lizmapFts',
                    'url' => jUrl::get('lizmap~searchFts:get')
                )
            );
        }

        function onsearchInData ($event) {

            $project = $event->getParam( 'project' );
            $repository = $event->getParam( 'repository' );
            $query = $event->getParam( 'query' );

            try {
                $lproj = lizmap::getProject($repository.'~'.$project);
                if ( !$lproj )
                    return;
            }
            catch(UnknownLizmapProjectException $e) {
                jLog::logEx($e, 'error');
                return;
            }

            $ftsSearches = $lproj->hasFtsSearches();
            if ( !$ftsSearches ) {
                return;
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
            $sql = "SELECT search_id,content,wkb_geom FROM quickfinder_data WHERE";
            $sql.= " content MATCH ".$cnx->quote($matches);

            // Add filter by groups and user if the user is authenticated
            if(!jAcl2::check('lizmap.tools.loginFilteredLayers.override', $lrep->getKey() ) ){
                $sql.= " AND ( content LIKE '%@@all' OR content NOT LIKE '%@@%'";
                $isConnected = jAuth::isConnected();
                if($isConnected){
                    // Ok if any group matches
                    $userGroups = jAcl2DbUserGroup::getGroups();
                    foreach($userGroups as $g){
                        $sql.= " OR content LIKE '%@@".$g."'";
                    }
                    // Ok if user matches
                    $user = jAuth::getUserSession();
                    $login = $user->login;
                    $sql.= " OR content LIKE '%@@".$login."'";
                }
                $sql.= ' )';
            }

            // Query and format data for each search key
            $nb = array( 'search'=>array(), 'tot'=>0 );
            $data = array();
            foreach( $searches as $skey=>$sval){

                // Add filter to get only data for given search key
                $sql_search= $sql . ' AND search_id = ' . $cnx->quote($skey);
                $limit = $limit_search;
                $sql_search.= " LIMIT ".$limit;
                //jLog::log($sql_search);

                // Run query
                $res = $cnx->query($sql_search);

                // Format data
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
                        'label' => preg_replace( '#@@.+#', '', $item->content),
                        'geometry' => $item->wkb_geom,
                    );
                    $nb['search'][$key]+=1;
                    $nb['tot']+=1;
                }
            }

            $event->add($data);

        }
}