<?php

namespace Lizmap\Project;

class configFile
{
    protected $data;

    public function __construct($cfgFile)
    {
        $this->data = json_decode($cfgFile);
        if (!$this->data) {
            return null;
        }
    }

    public function getProperty($propName)
    {
        if (isset($this->data->{$propName})) {
            return $this->data->propName;
        }

        return null;
    }

    public function &getEditableProperty($propName)
    {
        if (property_exists($this->data, $propName)) {
            return $this->data->{$propName};
        }

        return null;
    }

    public function unsetPropAfterRead()
    {
        //unset cache for editionLayers
        if (property_exists($this->data, 'editionLayers')) {
            foreach ($this->data->editionLayers as $key => $obj) {
                if (property_exists($this->data->layers, $key)) {
                    $this->data->layers->{$key}->cached = 'False';
                    $this->data->layers->{$key}->clientCacheExpiration = 0;
                    if (property_exists($this->data->layers->{$key}, 'cacheExpiration')) {
                        unset($this->data->layers->{$key}->cacheExpiration);
                    }
                }
            }
        }
        //unset cache for loginFilteredLayers
        if (property_exists($this->data, 'loginFilteredLayers')) {
            foreach ($this->data->loginFilteredLayers as $key => $obj) {
                if (property_exists($this->data->layers, $key)) {
                    $this->data->layers->{$key}->cached = 'False';
                    $this->data->layers->{$key}->clientCacheExpiration = 0;
                    if (property_exists($this->data->layers->{$key}, 'cacheExpiration')) {
                        unset($this->data->layers->{$key}->cacheExpiration);
                    }
                }
            }
        }
        //unset displayInLegend for geometryType none or unknown
        foreach ($this->data->layers as $key => $obj) {
            if (property_exists($this->data->layers->{$key}, 'geometryType') &&
                 ($this->data->layers->{$key}->geometryType == 'none' ||
                     $this->data->layers->{$key}->geometryType == 'unknown')
            ) {
                $this->data->layers->{$key}->displayInLegend = 'False';
            }
        }
    }

    public function findLayerByAnyName($name)
    {
        // name null or empty string
        if ($name == null || empty($name)) {
            return null;
        }

        $layer = null;
        $methods = array(
            // Get by name ie as written in QGIS Desktop legend
            'Name',
            // since 2.14 layer's name can be layer's shortName
            'ShortName',
            // Get layer by typename : qgis server replaces ' ' by '_' for layer names
            'TypeName',
            // Get by id
            'LayerId',
            // since 2.6 layer's name can be layer's title
            'Title',
        );

        foreach ($methods as $key) {
            $method = 'findLayerBy'.$key;
            $layer = $this->{$method}($name);
            if ($layer) {
                return $layer;
            }
        }

        return $layer;
    }

    public function findLayerByName($name)
    {
        // name null or empty string
        if ($name == null || empty($name)) {
            return null;
        }

        if (property_exists($this->data->layers, $name)) {
            return $this->data->layers->{$name};
        }

        return null;
    }

    public function findLayerByShortName($shortName)
    {
        // short name null or empty string
        if ($shortName == null || empty($shortName)) {
            return null;
        }

        foreach ($this->data->layers as $layer) {
            if (!property_exists($layer, 'shortname')) {
                continue;
            }
            if ($layer->shortname == $shortName) {
                return $layer;
            }
        }

        return null;
    }

    public function findLayerByTitle($title)
    {
        // title null or empty string
        if ($title == null || empty($title)) {
            return null;
        }

        foreach ($this->data->layers as $layer) {
            if (!property_exists($layer, 'title')) {
                continue;
            }
            if ($layer->title == $title) {
                return $layer;
            }
        }

        return null;
    }

    public function findLayerByLayerId($layerId)
    {
        // layer id null or empty string
        if ($layerId == null || empty($layerId)) {
            return null;
        }

        foreach ($this->data->layers as $layer) {
            if (!property_exists($layer, 'id')) {
                continue;
            }
            if ($layer->id == $layerId) {
                return $layer;
            }
        }

        return null;
    }

    public function findLayerByTypeName($typeName)
    {
        // type name null or empty string
        if ($typeName == null || empty($typeName)) {
            return null;
        }

        // typeName is layerName
        if (property_exists($this->data->layers, $typeName)) {
            return $this->data->layers->{$typeName};
        }
        // typeName is cleanName or shortName
        foreach ($this->data->layers as $layer) {
            if (str_replace(' ', '_', $layer->name) == $typeName) {
                return $layer;
            }
            if (!property_exists($layer, 'shortname')) {
                continue;
            }
            if ($layer->shortname == $typeName) {
                return $layer;
            }
        }

        return null;
    }
}
