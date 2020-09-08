<?php

use Lizmap\Project;

class ProjectForTests extends Project\Project
{
    public function __construct()
    {
        $this->qgis = new Project\QgisProject(__FILE__, new lizmapServices(null, null, false, '', ''), array('WMSInformation' => array()));
    }

    public function setCfg($cfg)
    {
        $this->cfg = $cfg;
    }

    public function readProjectForTest($key, $rep)
    {
        $this->readProject($key, $rep);
    }
}
