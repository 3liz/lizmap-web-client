<?php

use Lizmap\Project\QgisProject;

class QgisProjectForTests extends QgisProject
{
    public function __construct($data = null)
    {
        if ($data !== null) {
            parent::__construct(null, new lizmapServices(null, (object) array(), false, '', ''), new ContextForTests(), $data);
        }
    }

    public function readXMLProjectTest($file)
    {
         return $this->readXMLProject($file);
    }

    public function getLayers()
    {
         return $this->layers;
    }
    public function getRelations()
    {
         return $this->relations;
    }
    public function getRelationsFields()
    {
         return $this->relationsFields;
    }

    public function setShortNamesForTest($cfg)
    {
        return $this->setShortNames($cfg);
    }

    public function setLayerOpacityForTest($cfg)
    {
        return $this->setLayerOpacity($cfg);
    }

    public function setLayerGroupDataForTest($cfg)
    {
        return $this->setLayerGroupData($cfg);
    }

    public function setLayerShowFeatureCountForTest($cfg)
    {
        return $this->setLayerShowFeatureCount($cfg);
    }

    public function getTheXmlAttribute()
    {
        return $this->xml;
    }

    public function getXmlForTest()
    {
        return $this->getXml();
    }

    public function setXmlForTest($xml)
    {
        $this->xml = $xml;
    }

    public function setPath($path)
    {
        $this->path = $path;
    }

    public function setLayers($layers)
    {
        $this->layers = $layers;
    }

    public function readEditionLayersForTest($eLayer)
    {
        $this->readEditionLayers($eLayer);
    }

    public function readEditionFormsForTest($eLayer, $prj)
    {
        $this->readEditionForms($eLayer, $prj);
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
