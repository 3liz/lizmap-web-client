<?php

use Lizmap\Project;

class ProjectForTests extends Project\Project
{
    public function __construct($appContext = null)
    {
        if ($appContext) {
            $this->appContext = $appContext;
        } else {
            $this->appContext = new ContextForTests();
        }
    }

    public function setRepo($rep)
    {
        $this->repository = $rep;
    }

    public function setKey($key)
    {
        $this->key = $key;
    }

    public function setQgis($qgis)
    {
        $this->qgis = $qgis;
    }

    public function setCfg($cfg)
    {
        $this->cfg = $cfg;
    }

    public function setServices($services)
    {
        $this->services = $services;
    }

    public function setFile($file)
    {
        $this->file = $file;
    }

    public function readProjectForTest($key, $rep)
    {
        $this->readProject($key, $rep);
    }
}
