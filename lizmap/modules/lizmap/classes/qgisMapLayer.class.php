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


class qgisMapLayer{
  // layer id in the QGIS project file
  protected $id = '';

  // layer type
  protected $type = '';

  // layer name
  protected $name = '';

  // layer title
  protected $title = '';

  // layer abstract
  protected $abstract = '';

  // layer proj4
  protected $proj4 = '';

  // layer srid
  protected $srid = 0;

  // layer provider
  protected $provider = '';

  // xml layer element
  protected $xmlLayer = null;

  // project layer
  protected $project = null;

  /**
   * constructor
   * xmlLayer : the XML map layer representation
   */
  public function __construct ( $project, $xmlLayer ) {
    $this->id = (string)$xmlLayer->attributes()->type;
    $this->id = (string)$xmlLayer->id;

    $this->name = (string)$xmlLayer->layername;
    $this->title = (string)$xmlLayer->title;
    $this->abstract = (string)$xmlLayer->abstract;

    $this->proj4 = (string)$xmlLayer->srs->spatialrefsys->proj4;
    $this->srid = (integer)$xmlLayer->srs->spatialrefsys->srid;

    $this->datasource = (string)$xmlLayer->datasource;
    $this->provider = (string)$xmlLayer->provider;

    $this->xmlLayer = $xmlLayer;
    $this->project = $project;
  }

  public function getId(){
    return $this->id;
  }

  public function getType(){
    return $this->type;
  }

  public function getName(){
    return $this->name;
  }

  public function getTitle(){
    return $this->title;
  }

  public function getAbstract(){
    return $this->abstract;
  }

  public function getDatasource(){
    return $this->datasource;
  }

  public function getProvider(){
    return $this->provider;
  }

  public function getXmlLayer(){
    return $this->xmlLayer;
  }
}
