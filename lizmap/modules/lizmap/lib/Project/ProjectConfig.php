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
     * @var int[] keys are layer name
     */
    protected $layersOrder = array();

    /**
     * @var mixed
     */
    protected $printCapabilities;

    /**
     * @var object
     */
    protected $locateByLayer;

    /**
     * @var object
     */
    protected $formFilterLayers;

    /**
     * @var object
     */
    protected $editionLayers;

    /**
     * @var object
     */
    protected $attributeLayers;

    /**
     * @var object
     */
    protected $layers;

    /**
     * @var object
     */
    protected $timemanagerLayers;

    /**
     * @var object
     */
    protected $atlas;

    /**
     * @var object
     */
    protected $tooltipLayers;

    /**
     * @var object
     */
    protected $loginFilteredLayers;

    /**
     * @var object
     */
    protected $datavizLayers;

    /**
     * @var mixed
     */
    protected $options;

    protected static $cachedProperties = array(
        'layersOrder',
        'locateByLayer',
        'formFilterLayers',
        'editionLayers',
        'attributeLayers',
        'cfgContent',
        'options',
    );

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
                if (in_array($prop, self::$cachedProperties)) {
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
     * @deprecated
     * @see ProjectConfig::getConfigContent()
     */
    public function getData()
    {
        return $this->getConfigContent();
    }

    /**
     * Return the config file as an array.
     *
     * @return object
     */
    public function getConfigContent()
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
        foreach (self::$cachedProperties as $prop) {
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
     * @return int[] keys are layer name
     */
    public function getLayersOrder()
    {
        return $this->layersOrder;
    }

    /**
     * @param int[] $layersOrder
     */
    public function setLayersOrder($layersOrder)
    {
        $this->layersOrder = $layersOrder;
    }

    public function getLayers()
    {
        return $this->layers;
    }

    public function getLayer($layerName)
    {
        if (property_exists($this->layers, $layerName)) {
            return $this->layers->{$layerName};
        }

        return null;
    }

    /**
     * @param string $layerName
     * @param object $layer
     */
    public function setLayer($layerName, $layer)
    {
        $this->layers->{$layerName} = $layer;
    }

    public function removeLayer($layerName)
    {
        if (property_exists($this->layers, $layerName)) {
            unset($this->layers->{$layerName});
        }
    }

    public function getAttributeLayers()
    {
        return $this->attributeLayers;
    }

    public function setAttributeLayers($attributeLayers)
    {
        $this->attributeLayers = $attributeLayers;
    }

    /**
     * @return object
     */
    public function getLocateByLayer()
    {
        return $this->locateByLayer;
    }

    /**
     * @param object $locateByLayer
     */
    public function setLocateByLayer($locateByLayer)
    {
        $this->locateByLayer = $locateByLayer;
    }

    /**
     * Call every findLayerBy function to get a layer.
     *
     * @param string $name The name, shortname, typename, id or title of the layer to get
     *
     * @see findLayerByName, findLayerByShortName, findLayerByTypeName, findLayerByLayerId, findLayerByTitle
     */
    public function findLayerByAnyName($name)
    {
        // name null or empty string
        if ($name == null || empty($name) || !isset($this->layers)) {
            return null;
        }

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

        if (property_exists($this->layers, $name)) {
            return $this->layers->{$name};
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

        foreach ($this->layers as $layer) {
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

        foreach ($this->layers as $layer) {
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

        foreach ($this->layers as $layer) {
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
        if (property_exists($this->layers, $typeName)) {
            return $this->layers->{$typeName};
        }
        // typeName is cleanName or shortName
        foreach ($this->layers as $layer) {
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

    /**
     * @return object {layer names : layers}
     */
    public function getEditionLayers()
    {
        return $this->editionLayers;
    }

    /**
     * @param object $editionLayers
     */
    public function setEditionLayers($editionLayers)
    {
        $this->editionLayers = $editionLayers;
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
     * @return null|object
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

    /**
     * @return bool
     */
    public function hasEditionLayers()
    {
        if (count((array) $this->editionLayers)) {
            return true;
        }

        return false;
    }

    /**
     * @return mixed
     */
    public function getOptions()
    {
        return $this->options;
    }

    /**
     * @param string $name
     *
     * @return null|mixed
     */
    public function getOption($name)
    {
        if (property_exists($this->options, $name)) {
            return $this->options->{$name};
        }

        return null;
    }

    /**
     * @return object
     */
    public function getPrintCapabilities()
    {
        return $this->printCapabilities;
    }

    public function setPrintCapabilities($printCapabilities)
    {
        $this->printCapabilities = $printCapabilities;
    }

    public function getFormFilterLayers()
    {
        return $this->formFilterLayers;
    }

    public function getTimemanagerLayers()
    {
        return $this->timemanagerLayers;
    }

    /**
     * @return object
     */
    public function getAtlas()
    {
        return $this->atlas;
    }

    /**
     * @return object
     */
    public function getTooltipLayers()
    {
        return $this->tooltipLayers;
    }

    /**
     * @return object
     */
    public function getLoginFilteredLayers()
    {
        return $this->loginFilteredLayers;
    }

    /**
     * @return object
     */
    public function getDatavizLayers()
    {
        return $this->datavizLayers;
    }
}
