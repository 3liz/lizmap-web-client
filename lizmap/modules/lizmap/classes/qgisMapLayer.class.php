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

  /**
   * @var lizmapProject
   */
  protected $project = null;

  /**
   * constructor
   * @param lizmapProject $project
   * @param array $propLayer  list of properties values
   */
  public function __construct ( $project, $propLayer ) {
    $this->type = $propLayer['type'];
    $this->id = $propLayer['id'];

    $this->name = $propLayer['name'];
    $this->title = $propLayer['title'];
    $this->abstract = $propLayer['abstract'];

    $this->proj4 = $propLayer['proj4'];
    $this->srid = $propLayer['srid'];

    $this->datasource = $propLayer['datasource'];
    $this->provider = $propLayer['provider'];
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

  public function getSrid(){
    return $this->srid;
  }

  public function getXmlLayer(){
    $xmlLayers = $this->project->getXmlLayer($this->id);
    if (count($xmlLayers) == 0 )
        return null;
    return $xmlLayers[0];
  }
}
