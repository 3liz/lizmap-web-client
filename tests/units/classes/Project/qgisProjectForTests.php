<?php

use Lizmap\Project\QgisProject;

class qgisProjectForTests extends QgisProject
{
    public function __construct()
    {
    }

    public function readWMSInfoTest($xml)
    {
        return $this->readWMSInformation($xml);
    }

    public function readCanvasColorTest($xml)
    {
        return $this->readCanvasColor($xml);
    }

    public function readAllProj4Test($xml)
    {
        return $this->readAllProj4($xml);
    }

    public function readUseLayersIDsTest($xml)
    {
        return $this->readUseLayerIDs($xml);
    }

    public function readThemesForTests($xml)
    {
        return ($this->readThemes($xml));
    }

    public function readRelationsForTests($xml)
    {
        return ($this->readRelations($xml));
    }
}
