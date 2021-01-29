<?php

namespace Lizmap\Project;

class ProjectConfig
{
    /**
     * @var object
     */
    protected $cfgContent;

    /**
     * @var ProjectCache
     */
    protected $cacheHandler;

    /**
     * @var mixed
     */
    protected $layersOrder;

    /**
     * @var mixed
     */
    protected $printCapabilities;

    /**
     * @var mixed
     */
    protected $locateByLayer;

    /**
     * @var mixed
     */
    protected $formFilterLayers;

    /**
     * @var mixed
     */
    protected $editionLayers;

    /**
     * @var mixed
     */
    protected $attributeLayers;

    /**
     * @var mixed
     */
    protected $options;

    protected $cachedProperties = array('layersOrder', 'locateByLayer', 'formFilterLayers', 'editionLayers',
        'attributeLayers', 'cfgContent', 'options', );

    public function __construct($cfgFile, $data = null)
    {
        if ($data === null) {
            $fileContent = file_get_contents($cfgFile);
            $this->cfgContent = json_decode($fileContent);
            if ($this->cfgContent === null) {
                throw new UnknownLizmapProjectException('The file '.$cfgFile.' cannot be decoded.');
            }
        } else {
            foreach ($data as $prop => $value) {
                if (in_array($prop, $this->cachedProperties)) {
                    // if ($prop == 'cfgContent') {
                    //     $this->{$prop} = json_decode(json_encode($value));

                    //     continue;
                    // }
                    $this->{$prop} = $value;
                }
            }
        }
    }

    /**
     * Return the config file as an array.
     *
     * @return object
     */
    public function getData()
    {
        return $this->cfgContent;
    }

    /**
     * Return the properties to store in the cache.
     *
     * @param mixed $data
     *
     * @return array
     */
    public function getCacheData($data)
    {
        foreach ($this->cachedProperties as $prop) {
            if (!isset($this->{$prop}) || isset($data[$prop])) {
                continue;
                // }
            // if ($prop == 'cfgContent') {
            //     $data['cfgContent'] = json_decode(json_encode($this->cfgContent), true);
            }
            $data[$prop] = $this->{$prop};
        }

        return $data;
    }

    /**
     * Return the value of a given property.
     *
     * @param string $propName The property to get
     */
    public function getProperty($propName)
    {
        if (property_exists($this, $propName) && isset($this->{$propName})) {
            return $this->{$propName};
        }
        if (property_exists($this->cfgContent, $propName)) {
            return $this->cfgContent->{$propName};
        }

        return null;
    }

    public function setProperty($prop, $value)
    {
        if (property_exists($this, $prop)) {
            $this->{$prop} = $value;
        }
        if (property_exists($this->cfgContent, $prop)) {
            $this->cfgContent->{$prop} = $value;
        }
    }

    public function unsetProperty($propName, $propName2 = '', $propName3 = '')
    {
        $rootProp = $this->cfgContent;
        if (in_array($propName, $this->cachedProperties)) {
            $rootProp = $this;
        }
        if (isset($rootProp->{$propName}) && $propName2 == '') {
            unset($rootProp->{$propName});
        } elseif (isset($rootProp->{$propName}) && property_exists($rootProp->{$propName}, $propName2) && $propName3 == '') {
            unset($rootProp->{$propName}->{$propName2});
        } elseif (isset($rootProp->{$propName}) && property_exists($rootProp->{$propName}, $propName2) && property_exists($rootProp->{$propName}->{$propName2}, $propName3)) {
            unset($rootProp->{$propName}->{$propName2}->{$propName3});
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
        if ($name == null || empty($name) || !isset($this->cfgContent->layers)) {
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

        if (property_exists($this->cfgContent->layers, $name)) {
            return $this->cfgContent->layers->{$name};
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

        foreach ($this->cfgContent->layers as $layer) {
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

        foreach ($this->cfgContent->layers as $layer) {
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

        foreach ($this->cfgContent->layers as $layer) {
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
        if (property_exists($this->cfgContent->layers, $typeName)) {
            return $this->cfgContent->layers->{$typeName};
        }
        // typeName is cleanName or shortName
        foreach ($this->cfgContent->layers as $layer) {
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
        $editionLayers = $this->editionLayers;
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
        $editionLayers = $this->editionLayers;
        if (!$editionLayers) {
            return null;
        }
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
