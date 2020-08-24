<?php

namespace Lizmap\Project;

class ProjectConfig
{
    protected $data;

    public function __construct($cfgFile)
    {
        $fileContent = file_get_contents($cfgFile);
        $this->data = json_decode($fileContent);
        if (!$this->data) {
            throw new \UnknownLizmapProjectException('The file '.$cfgFile.' cannot be read.');
        }
    }

    /**
     * Return the config file as an array.
     *
     * @return array
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Return the value of a given property.
     *
     * @param string $propName The property to get
     */
    public function getProperty($propName)
    {
        if (isset($this->data->{$propName})) {
            return $this->data->propName;
        }

        return null;
    }

    public function setProperty($prop, $value)
    {
        if (property_exists($this->data, $prop)) {
            $this->data->{$prop} = $value;
        }
    }

    /**
     * Return a reference to a property that can be edited.
     *
     * @param string $propName The property to get
     */
    public function &getEditableProperty($propName)
    {
        if (property_exists($this->data, $propName)) {
            return $this->data->{$propName};
        }

        return null;
    }

    public function unsetProp($propName, $propName2 = '')
    {
        if (isset($this->data->{$propName}) && $propName2 == '') {
            unset($this->data->{$propName});
        } elseif (isset($this->data->{$propName}) && property_exists($this->data->{$propName}, $propName2)) {
            unset($this->data->{$propName}, $propName2);
        }
    }

    /**
     * Call every findLayerBy function to get a layer.
     *
     * @param string $name The name, shortname, typename, id or title of the layer to get
     */
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

    /**
     * Return the layer corresponding to name.
     *
     * @param string $name The name of the layer
     */
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

    /**
     * Return the layer corresponding to shortname.
     *
     * @param string $shortName The shortname of the layer
     */
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

    /**
     * Return the layer corresponding to title.
     *
     * @param string $title The title of the layer
     */
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

    /**
     * Return the layer corresponding to layerId.
     *
     * @param string $layerId The id of the layer
     */
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

    /**
     * Return the layer corresponding to typeName.
     *
     * @param string $typeName The type name of the layer
     */
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

    public function getEditionLayerByName($name)
    {
        $editionLayers = $this->data->editionLayers;
        if ($editionLayers && property_exists($editionLayers, $name)) {
            return $editionLayers->{$name};
        }

        return null;
    }

    /**
     * @param $layerId
     *
     * @return null|array
     */
    public function getEditionLayerByLayerId($layerId)
    {
        $editionLayers = $this->data->editionLayers;
        foreach ($editionLayers as $layer) {
            if (!property_exists($layer, 'layerId')) {
                continue;
            }
            if ($layer->layerId == $layerId) {
                return $layer;
            }
        }

        return null;
    }
}
