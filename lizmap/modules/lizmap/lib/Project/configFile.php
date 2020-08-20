<?php

namespace Lizmap\Project;

class configFile
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
            return $this->data->{$propName};
        }

        return null;
    }

    public function setProperty($prop, $value)
    {
        if (property_exists($this->data, $prop)) {
            $this->data->$prop = $value;
        }
    }

    public function unsetProperty($prop)
    {
        if (property_exists($this->data, $prop)) {
            unset($this->data->prop);
        }
    }

    /**
     * Set layers' shortname with XML data.
     *
     * @param qgisProject $qgsXml
     */
    public function setShortNames($qgsXml)
    {
        $shortNames = $qgsXml->xpathQuery('//maplayer/shortname');
        if ($shortNames) {
            foreach ($shortNames as $sname) {
                $sname = (string) $sname;
                $xmlLayer = $qgsXml->xpathQuery("//maplayer[shortname='{$sname}']");
                if (!$xmlLayer) {
                    continue;
                }
                $xmlLayer = $xmlLayer[0];
                $name = (string) $xmlLayer->layername;
                if (property_exists($this->data, 'layers') && property_exists($this->data->layers, $name)) {
                    $this->data->layers->{$name}->shortname = $sname;
                }
            }
        }
    }

    /**
     * Set layers' opacity with XML data.
     *
     * @param qgisProject $qgsXml
     */
    public function setLayerOpacity($qgsXml)
    {
        $layerWithOpacities = $qgsXml->xpathQuery('//maplayer/layerOpacity[.!=1]/parent::*');
        if ($layerWithOpacities) {
            foreach ($layerWithOpacities as $layerWithOpacitiy) {
                $name = (string) $layerWithOpacitiy->layername;
                if (property_exists($this->data, 'layers') && property_exists($this->data->layers, $name)) {
                    $opacity = (float) $layerWithOpacitiy->layerOpacity;
                    $this->data->layers->{$name}->opacity = $opacity;
                }
            }
        }
    }

    /**
     * Set layers' group infos.
     *
     * @param qgisProject $qgsXml
     */
    public function setLayerGroupData($qgsXml)
    {
        $groupsWithShortName = $qgsXml->xpathQuery("//layer-tree-group/customproperties/property[@key='wmsShortName']/parent::*/parent::*");
        if ($groupsWithShortName) {
            foreach ($groupsWithShortName as $group) {
                $name = (string) $group['name'];
                $shortNameProperty = $group->xpath("customproperties/property[@key='wmsShortName']");
                if ($shortNameProperty && count($shortNameProperty) > 0) {
                    $shortNameProperty = $shortNameProperty[0];
                    $sname = (string) $shortNameProperty['value'];
                    if (property_exists($this->data, 'layers') && property_exists($this->data->layers, $name)) {
                        $this->data->layers->{$name}->shortname = $sname;
                    }
                }
            }
        }
        $groupsMutuallyExclusive = $qgsXml->xpathQuery("//layer-tree-group[@mutually-exclusive='1']");
        if ($groupsMutuallyExclusive) {
            foreach ($groupsMutuallyExclusive as $group) {
                $name = (string) $group['name'];
                if (property_exists($this->data, 'layers') && property_exists($this->data->layers, $name)) {
                    $this->data->layers->{$name}->smutuallyExclusive = 'True';
                }
            }
        }
    }

    /**
     * Set layers' last infos.
     *
     * @param qgisProject $qgsXml
     */
    public function setLayerShowFeatureCount($qgsXml)
    {
        $layersWithShowFeatureCount = $qgsXml->xpathQuery("//layer-tree-layer/customproperties/property[@key='showFeatureCount']/parent::*/parent::*");
        if ($layersWithShowFeatureCount) {
            foreach ($layersWithShowFeatureCount as $layer) {
                $name = (string) $layer['name'];
                if (property_exists($this->data, 'layers') && property_exists($this->data->layers, $name)) {
                    $this->data->layers->{$name}->showFeatureCont = 'True';
                }
            }
        }
    }

    /**
     * Set/Unset some properties after reading the config file.
     *
     * @param mixed $qgsXml
     */
    public function unsetPropAfterRead($qgsXml)
    {
        //remove plugin layer
        $pluginLayers = $qgsXml->xpathQuery('//maplayer[type="plugin"]');
        if ($pluginLayers) {
            foreach ($pluginLayers as $layer) {
                $name = (string) $layer->layername;
                if (property_exists($this->data, 'layers') && property_exists($this->data->layers, $name)) {
                    unset($this->data->layers->{$name});
                }
            }
        }
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
