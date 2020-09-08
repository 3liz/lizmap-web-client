<?php

require('ProjectForTests.php');

use PHPUnit\Framework\TestCase;
use Lizmap\Project;

class ProjectTest extends TestCase
{
    public function testReadProject()
    {
        $props = array('repository', 'id', 'title', 'abstract', 'proj', 'bbox');
        $rep = new lizmapRepository('key', array(), null, null, null);
        $proj = new ProjectForTests();
        $cfg = json_decode(file_get_contents(__DIR__.'/Ressources/readProject.qgs.cfg'));
        $config = new Project\ProjectConfig('', array('cfgContent' => $cfg, 'options' => $cfg->options));
        $proj->setCfg($config);
        // $proj->readProjectForTest('test', $rep);
        //assertions here
    }
}
