<?php

use Lizmap\Project;
use Lizmap\Project\ProjectCache;

class ProjectForTests extends Project\Project
{
    public function __construct($appContext = null)
    {
        if (!$appContext) {
            $appContext = new ContextForTests();
        }
        $this->appContext = $appContext;
        $this->cacheHandler = new ProjectCache('/test.qgs', time(), time(), $this->appContext);
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

    public function setFile($file, $modifiedTime, $cfgModifiedTime)
    {
        $this->file = $file;
        $this->cacheHandler = new ProjectCache($file, $modifiedTime, $cfgModifiedTime, $this->appContext);
    }

    public function readProjectForTest()
    {
        $this->readProject();
    }
}
