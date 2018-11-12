<?php
/**
* @package   lizmap
* @subpackage inao
* @author    René-Luc D'hont, Michael Douchin
* @copyright 2017 3liz
* @link      http://3liz.com
* @license    All rights reserved
*/

class lizmapFts {

    protected $sql = Null;

    protected $project = Null;

    protected function setSql() {

        // The database admin must create a table, view or materialized view called "lizmap_fts"
        // It must be accessible in the search_path.
        // lizmap_fts must contain the following columns:
        // * item_layer (text). Name of the layer. For example "Countries"
        // * item_label (text). Label to display AND to search among. Ex: "France" or "John Doe - Australia". You can build it from a concatenation.
        // * item_project (text). List of Lizmap projects separated by commas. Optionnal. When set, the search will be done only for specified projects
        // * item_filter (text). Username or group name. When given, the results will be filtered by authenticated user login and groups.
        // * geom (geometry). We advise to store all the geometries with the same SRID and to create a spatial index on it.
        // Optimisations:
        // * We advise to add a trigram index on the item_label field, to speed up the search query
        // CREATE EXTENSION IF NOT EXISTS pg_trgm;
        // * You should also install the extension unaccent, available with PostgreSQL contrib tools.
        // CREATE EXTENSION IF NOT EXISTS unaccent;
        // * Then create the index on the item_label column:
        // CREATE INDEX lizmap_search_idx ON lizmap_fts USING GIN(unaccent(item_label) gin_trgm_ops);

        // SELECT
        $sql = "
        SELECT
        item_layer, item_label, concat('EPSG:', ST_SRID(geom)) AS item_epsg, ST_AsText(geom) AS item_wkt,
        similarity(trim( $1 ), item_label) AS sim
        ";

        // FROM
        $sql.= "
        FROM lizmap_search
        ";

        // WHERE
        $sql.= "
        WHERE True";

        // Filter by given terms
        // We need to create a search array
        // a blue car ->  {%a%,%blue%,%car%}
        $sql.= "
        AND unaccent(item_label) ILIKE ALL (
            string_to_array(
                '%' || regexp_replace( unaccent( trim( $1 ) ), '[^0-9a-zA-Z]+', '%,%', 'g') || '%',
                ',',
                ' '
            )
        )
        ";

        // Add filter by projects
        $sql.= "
        AND (
            item_project IS NULL OR $2 = ANY ( string_to_array(item_project, ',', ' ') )
        )
        ";

        // Add filter by groups and user if the user is authenticated
        $sql.= "
        AND ( item_filter = 'all' OR item_filter IS NULL";
        $isConnected = jAuth::isConnected();
        if($isConnected){
            // Ok if any group matches
            $userGroups = jAcl2DbUserGroup::getGroups();
            foreach($userGroups as $g){
                $sql.= " OR item_filter = '".$g."'";
            }
            // Ok if user matches
            $user = jAuth::getUserSession();
            $login = $user->login;
            $sql.= " OR item_filter = '".$login."'";
        }
        $sql.= ' )';
        $sql.= "
        ORDER BY sim DESC
        LIMIT $3;
        ";
        $this->sql = $sql;

    }

    protected function getSql(){
        $this->setSql();
        return $this->sql;
    }

    /**
    * Get data from database and return an array
    * @param $sql Query to run
    * @param $profile Name of the DB profile
    * @return Result as an array
    */
    protected function query( $sql, $filterParams, $profile=null ) {
        if(!$profile)
            $profile = 'search';
        try {
            // try to get the specific search profile to do not rebuild it
            jProfiles::get('jdb', $profile, true);
        } catch (Exception $e) {
            // else use default
            $profile = Null;
        }
        try {
            $cnx = jDb::getConnection( $profile );
            $resultset = $cnx->prepare( $sql );
            $resultset->execute( $filterParams );
            $result = $resultset->fetchAll();
        } catch (Exception $e){
            $result = array();
        }
        return $result;
    }

    /**
    * Method called by the autocomplete input field for taxon search
    * @param $term Searched term
    * @return List of matching taxons
    */
    public function getData($project, $term, $limit=40) {
        $sql = $this->getSql();
        $data = array();
        try{
            // Format words into {foo,bar}
            $result = $this->query(
                $sql,
                array(trim($term), $project, $limit)
            );

            // Limitations
            $limit_tot = 60;
            $limit_search = 30;

            // Prepare array to count items per layer
            $nb = array( 'search'=>array(), 'tot'=>0 );
            // Format result
            foreach($result as $item) {
                $key = $item->item_layer;
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
                $data[$key]['srid'] = $item->item_epsg;
                if( !array_key_exists('features', $data[$key]) )
                    $data[$key]['features'] = array();
                $data[$key]['features'][] = array(
                    'label' => $item->item_label,
                    'geometry' => $item->item_wkt,
                );
                $nb['search'][$key]+=1;
                $nb['tot']+=1;
            }


        } catch (Exception $e){
            $data = array();
        }
        return $data;
    }

}
