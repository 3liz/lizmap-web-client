<?php

class QgisLayerForTests extends qgisVectorLayer
{
    public $fields;

    public $eCapabilities;

    public $dbFieldValues;

    public $name;

    public $connection;

    public function __construct()
    {
        $this->type = 'vector';
    }

    public function getDbFieldsInfo()
    {
        if (!$this->fields) {
            return null;
        }

        return (object) array(
            'dataFields' => (object) $this->fields,
            'primaryKeys' => array('pkuid'),
            'geometryColumn' => null,
        );
    }

    public function isEditable()
    {
        return true;
    }

    public function setDefaultValues($default)
    {
        $this->defaultValues = $default;
    }

    public function setProject($project)
    {
        $this->project = $project;
    }

    public function setId($id)
    {
        $this->id = $id;
    }

    public function getEditionCapabilities()
    {
        if (isset($this->eCapabilities)) {
            return $this->eCapabilities;
        }

        return (object) array('capabilities' => null);
    }

    public function getRealEditionCapabilities()
    {
        if (isset($this->eCapabilities)) {
            return $this->eCapabilities->capabilities;
        }

        return null;
    }

    public function getDbFieldValues($feature)
    {
        return $this->dbFieldValues;
    }

    public function getDbFieldDistinctValues($feature)
    {
        return $this->dbFieldValues;
    }
}
