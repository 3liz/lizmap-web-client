<?php

use Lizmap\Project\QgisProject;

class QgisProjectForTests extends QgisProject
{
    public function __construct($data = null)
    {
        if ($data) {
            parent::__construct(null, new lizmapServices(null, null, false, '', ''), new ContextForTests(), $data);
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

    public function readCustomProjectVariablesForTests($xml)
    {
        return $this->readCustomProjectVariables($xml);
    }

    public function readLayersForTests($xml)
    {
        // readLayers() needs $this->qgisProjectVersion to be set
        $this->qgisProjectVersion = $this->readQgisProjectVersion($xml);

        return $this->readLayers($xml);
    }

    public function readRelationsForTests($xml)
    {
        $this->xml = $xml;
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
        $this->readEditionLayers($eLayer);
    }

    public function readAttributeLayersForTest($aLayer)
    {
        $this->readAttributeLayers($aLayer);
    }

    public function getEditTypeForTest($layerXml)
    {
        return $this->getEditType($layerXml);
    }

    public function getFieldConfigurationForTest($layerXml)
    {
        return $this->getFieldConfiguration($layerXml);
    }

    public function getValuesFromOptionsForTest($optionList, $valuesExtract = 0)
    {
        return $this->getValuesFromOptions($optionList, $valuesExtract);
    }

    public function getFieldConfigurationOptionsForTest($optionList)
    {
        return $this->getFieldConfigurationOptions($optionList);
    }
}
