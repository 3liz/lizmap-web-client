<?php

use Lizmap\Project\QgisProject;

class qgisProjectForTests extends QgisProject
{
    public function __construct($data = null)
    {
        if ($data) {
            parent::__construct(null, new lizmapServices(null, null, false, '', ''), new TestContext(), $data);
        }
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
        return $this->readThemes($xml);
    }

    public function readRelationsForTests($xml)
    {
        return $this->readRelations($xml);
    }

    public function setShortNamesForTest($cfg)
    {
        return $this->setShortNames($cfg);
    }

    public function setLayerOpacityForTest($cfg)
    {
        return $this->setLayerOpacity($cfg);
    }

    public function setXml($xml)
    {
        $this->xml = $xml;
    }

    public function setLayers($layers)
    {
        $this->layers = $layers;
    }

    public function readEditionLayersForTest($eLayer)
    {
        return $this->readEditionLayers($eLayer);
    }

    public function readAttributeLayersForTest($aLayer)
    {
        return $this->readAttributeLayers($aLayer);
    }
}
