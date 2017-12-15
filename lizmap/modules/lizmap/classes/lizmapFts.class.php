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


    protected function getSql() {
        return "
            SELECT label, layer, ST_AsText(geom) AS wkt_geom, ts_rank(vec, query) AS rnk, similarity(trim( $1 ), label) AS sim
              FROM inao.lizmap_fts,
                   to_tsquery('french_text_search', regexp_replace( unaccent( trim( $1 ) ), '[^0-9a-zA-Z]+', ' & ', 'g') || ':*' ) AS query
             WHERE query @@ vec
             ORDER BY sim DESC, rnk DESC
             LIMIT $2;
        ";
    }

    /**
    * Get data from database and return an array
    * @param $sql Query to run
    * @param $profile Name of the DB profile
    * @return Result as an array
    */
    protected function query( $sql, $filterParams, $profile=null ) {
        $cnx = jDb::getConnection( $profile );
        $resultset = $cnx->prepare( $sql );

        $resultset->execute( $filterParams );
        return $resultset->fetchAll();
    }

    /**
    * Method called by the autocomplete input field for taxon search
    * @param $term Searched term
    * @return List of matching taxons
    */
    public function getData($term, $limit=40) {
        $profile = 'inao';
        try {
            // try to get the profile to do not rebuild it
            jProfiles::get('jdb', $profile, true);
        } catch (Exception $e) {
            $jdbParams = array(
              "driver" => 'pgsql',
              "host" => 'localhost',
              "port" => 5432,
              "database" => 'sig',
              "user" => 'dhont',
              "password" => 'g080782g'
            );
            jProfiles::createVirtualProfile('jdb', $profile, $jdbParams);
        }

        $sql = $this->getSql();
        return $this->query( $sql, array( $term, $limit), $profile );
    }

}
