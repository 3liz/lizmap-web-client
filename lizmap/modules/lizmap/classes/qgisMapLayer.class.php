<?php

use Lizmap\Project\Project;

/**
 * Give access to qgis mapLayer configuration.
 *
 * @author    3liz
 * @copyright 2013 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class qgisMapLayer
{
    /**
     * layer id in the QGIS project file.
     */
    protected $id = '';

    /**
     * layer type.
     */
    protected $type = '';

    /**
     * layer name.
     */
    protected $name = '';

    /**
     * layer short name.
     */
    protected $shortname = '';

    /**
     * layer title.
     */
    protected $title = '';

    /**
     * layer abstract.
     */
    protected $abstract = '';

    /**
     * layer proj4.
     */
    protected $proj4 = '';

    /**
     * layer srid.
     */
    protected $srid = 0;

    /**
     * layer datasource.
     */
    protected $datasource = '';

    /**
     * layer provider.
     */
    protected $provider = '';

    /**
     * @var Project|qgisProject
     */
    protected $project;

    /**
     * constructor.
     *
     * @param Project|qgisProject $project
     * @param array               $propLayer list of properties values
     */
    public function __construct($project, $propLayer)
    {
        $this->type = $propLayer['type'];
        $this->id = $propLayer['id'];

        $this->name = $propLayer['name'];
        $this->shortname = $propLayer['shortname'];
        $this->title = $propLayer['title'];
        $this->abstract = $propLayer['abstract'];

        $this->proj4 = $propLayer['proj4'];
        $this->srid = $propLayer['srid'];

        $this->datasource = $propLayer['datasource'];
        $this->provider = $propLayer['provider'];
        $this->project = $project;
    }

    public function getId()
    {
        return $this->id;
    }

    public function getType()
    {
        return $this->type;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getShortName()
    {
        return $this->shortname;
    }

    public function getTitle()
    {
        return $this->title;
    }

    public function getAbstract()
    {
        return $this->abstract;
    }

    public function getProj4()
    {
        return $this->proj4;
    }

    public function getSrid()
    {
        return $this->srid;
    }

    public function getDatasource()
    {
        return $this->datasource;
    }

    public function getProvider()
    {
        return $this->provider;
    }

    /**
     * @return Project|qgisProject
     */
    public function getProject()
    {
        return $this->project;
    }

    /**
     * @return null|SimpleXMLElement
     *
     * @deprecated
     */
    public function getXmlLayer()
    {
        $xmlLayers = $this->project->getXmlLayer($this->id);
        if (count($xmlLayers) == 0) {
            return null;
        }

        return $xmlLayers[0];
    }
}
