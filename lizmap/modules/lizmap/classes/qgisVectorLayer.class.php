<?php
/**
* Give access to qgis mapLayer configuration.
* @package   lizmap
* @subpackage lizmap
* @author    3liz
* @copyright 2013 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/


class qgisVectorLayer extends qgisMapLayer{
  // layer type
  protected $type = 'vector';

  /**
   * constructor
   * xmlLayer : the XML map layer representation
   */
  public function __construct ( $project, $xmlLayer ) {
    parent::__construct( $project, $xmlLayer );
    /*
    if( $this->type == 'vector') {
    }
     */
  }

  public function getDatasourceParameters() {
    // Get datasource information from QGIS
    $datasourceMatch = preg_match(
      "#dbname='([^ ]+)' (?:host=([^ ]+) )?(?:port=([0-9]+) )?(?:user='([^ ]+)' )?(?:password='([^ ]+)' )?(?:sslmode=([^ ]+) )?(?:key='([^ ]+)' )?(?:estimatedmetadata=([^ ]+) )?(?:srid=([0-9]+) )?(?:type=([a-zA-Z]+) )?(?:table=\"(.+)\" \()?(?:([^ ]+)\) )?(?:sql=(.*))?#",
      $this->datasource,
      $dt
    );
    return (object) array(
      "dbname" => $dt[1],
      "host" => $dt[2],
      "port" => $dt[3],
      "user" => $dt[4],
      "password" => $dt[5],
      "sslmode" => $dt[6],
      "key" => $dt[7],
      "estimatedmetadata" => $dt[8],
      "srid" => $dt[9],
      "type" => $dt[10],
      "table" => $dt[11],
      "geocol" => $dt[12],
      "sql" => $dt[13]
    );
  }

  public function getDatasourceConnection() {
    $dtParams = $this->getDatasourceParameters();

    $jdbParams = array();
    if( $this->provider == 'spatialite' ){
      $repository = $this->project->getRepository();
      $jdbParams = array(
        "driver" => 'sqlite3',
        "database" => realpath($repository->getPath().$dtParams->dbname),
        "extensions"=>"libspatialite.so"
      );
    } else if( $this->provider == 'postgres' ){
      $jdbParams = array(
        "driver" => 'pgsql',
        "host" => $dtParams->host,
        "port" => (integer)$dtParams->port,
        "database" => $dtParams->dbname,
        "user" => $dtParams->user,
        "password" => $dtParams->password
      );
    } else
      return null;

    $profile = $this->id;
    jProfiles::createVirtualProfile('jdb', $profile, $jdbParams);
    return jDb::getConnection($profile);
  }
}
