<?php

namespace Lizmap\Project;

/**
 * It allows to access to configuration properties stored into the cfg file
 * of a project, and to access to some "calculated" properties.
 */
class ProjectConfig
{
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
    protected $layouts;

    /**
     * @var object
     */
    protected $loginFilteredLayers;

    /**
     * @var object
     */
    protected $filter_by_polygon;

    /**
     * @var object
     */
    protected $datavizLayers;

    /**
     * @var object
     */
    protected $metadata;

    /**
     * @var mixed
     */
    protected $warnings;

    /**
     * @var mixed
     */
    protected $options;

    protected static $cachedProperties = array(
        'locateByLayer',
        'formFilterLayers',
        'editionLayers',
        'attributeLayers',
        'layers',
        'options',
        'timemanagerLayers',
        'atlas',
        'tooltipLayers',
        'layouts',
        'loginFilteredLayers',
        'filter_by_polygon',
        'datavizLayers',
        'metadata',
        'warnings',
    );

    /**
     * @param object $data properties of the QGIS project, coming from the cfg file
     */
    public function __construct($data)
    {
        foreach (self::$cachedProperties as $prop) {
            if (isset($data->{$prop}) && $data->{$prop}) {
                $this->{$prop} = $data->{$prop};
            } else {
                $this->{$prop} = new \stdClass();
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
     * Return the config content.
     *
     * @return object
     */
    public function getConfigContent()
    {
        return (object) get_object_vars($this);
    }

    /**
     * Return the properties to store in the cache.
     *
     * @return object
     */
    public function getCacheData()
    {
        $data = array();
        foreach (self::$cachedProperties as $prop) {
            $data[$prop] = $this->{$prop};
        }

        return (object) $data;
    }

    /**
     * @return object
     */
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

    /**
     * @return null|object
     */
    public function getAttributeLayers()
    {
        return $this->attributeLayers;
    }

    /**
     * @return null|object
     */
    public function getLocateByLayer()
    {
        return $this->locateByLayer;
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

    public function getEditionLayerByName($name)
    {
        $editionLayers = $this->editionLayers;
        if ($editionLayers && $name && property_exists($editionLayers, $name)) {
            return $editionLayers->{$name};
        }

        return null;
    }

    /**
     * @param mixed $layerId
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
     * Retrieve the given option as a boolean value.
     *
     * @param string $name option name
     *
     * @return null|bool true if the option value is 'True', null if it does not exist
     */
    public function getBooleanOption($name)
    {
        if (property_exists($this->options, $name)) {
            return strtolower($this->options->{$name}) == 'true';
        }

        return null;
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
     * @return null|object
     */
    public function getAtlas()
    {
        return $this->atlas;
    }

    /**
     * @return null|object
     */
    public function getTooltipLayers()
    {
        return $this->tooltipLayers;
    }

    /**
     * Get warnings from the CFG files
     * If the CFG file has been made with at least with 4.0.0 version.
     *
     * @return null|object
     */
    public function getProjectCfgWarnings()
    {
        return $this->warnings;
    }

    /**
     * Print layouts since Lizmap 3.7.
     *
     * @return null|object
     */
    public function getLayouts()
    {
        return $this->layouts;
    }

    /**
     * @return null|object
     */
    public function getLoginFilteredLayers()
    {
        return $this->loginFilteredLayers;
    }

    /** Contains the configuration and layers of the polygon by layer feature.
     *
     * @return object
     */
    public function getPolygonFilterConfig()
    {
        return $this->filter_by_polygon;
    }

    /**
     * @return null|object
     */
    public function getDatavizLayers()
    {
        return $this->datavizLayers;
    }

    /**
     * List of the layers configured in the tools
     * Attribute table, form filter & dataviz.
     *
     * We use this list to find all the fields for which
     * we need to replace the code by their corresponding labels
     *
     * @return array<string> Array of layer ids
     */
    public function getLayersWithLabels()
    {
        // Keep a list of layer ids for which to replace the code by labels
        $layersWithLabeledFields = array();

        // Attribute layers
        foreach ($this->getAttributeLayers() as $config) {
            if ($config->hideLayer == 'True') {
                continue;
            }
            $layersWithLabeledFields[] = $config->layerId;
        }

        // Dataviz layers
        foreach ($this->getDatavizLayers() as $config) {
            $layerId = $config->layerId;
            if (array_key_exists($layerId, $layersWithLabeledFields)) {
                continue;
            }
            $layersWithLabeledFields[] = $config->layerId;
        }

        // Form filter layers
        foreach ($this->getFormFilterLayers() as $config) {
            $layerId = $config->layerId;
            if (array_key_exists($layerId, $layersWithLabeledFields)) {
                continue;
            }
            $layersWithLabeledFields[] = $config->layerId;
        }

        return $layersWithLabeledFields;
    }

    /** Get the HTML template built from the Drag and drop layout
     * and override the original datavizTemplate configuration option.
     *
     * @since Lizmap 3.7.
     *
     * @param mixed $debug
     */
    public function setDatavizTemplateFromDragAndDropLayout($debug = false)
    {
        $tree = $this->getOption('dataviz_drag_drop');
        if ($tree) {
            $html = $this->parseDatavizTreeNode($tree, 0, $debug);
            $this->setOption('datavizTemplate', $html);
        }
    }

    private function setOption($name, $value)
    {
        $this->options->{$name} = $value;
    }

    /**
     * Parse a dataviz drag & drop layout node and build the corresponding HTML.
     *
     * This is a recursive function.
     *
     * @param object $node  Tree node
     * @param int    $level Tree node level
     * @param mixed  $debug
     *
     * @return string $html Built HTML content
     */
    private function parseDatavizTreeNode($node, $level, $debug)
    {
        // Get the correspondance between the plot uid & the plot ID (integer)
        $plotUidToId = array();
        foreach ($this->datavizLayers as $plot) {
            // If a uuid exists in the config, use it
            if (property_exists($plot, 'uuid')) {
                $plotUidToId[$plot->uuid] = $plot->order;
            } else {
                // If not, match the plot by its name
                $plotUidToId[$plot->title] = $plot->order;
            }
        }

        // HTML string
        $html = '';
        $prefix = "\n".str_repeat('    ', $level);

        // Process the plots first
        foreach ($node as $subNode) {
            // Do not process tabs and groups here
            if ($subNode->type != 'plot') {
                continue;
            }

            // Get the plot ID
            $plotIntegerId = 0;
            if (array_key_exists($subNode->uuid, $plotUidToId)) {
                $plotIntegerId = $plotUidToId[$subNode->uuid];
            } else {
                if (array_key_exists($subNode->_name, $plotUidToId)) {
                    $plotIntegerId = $plotUidToId[$subNode->_name];
                }
            }

            // We use the syntax "$0", since it is used with the historical (still supported) manual HTML template
            $divClass = 'dataviz-dnd-plot';
            $plotHtml = '<div id="plot-'.$subNode->uuid.'" class="'.$divClass.'">$'.$plotIntegerId.'</div>';
            $html .= "\n\n";
            $html .= $prefix.$plotHtml;
        }

        // Tabs UL and LI
        $tabChildren = array();
        // If the level is even (not odd), this is a tab
        // else this is a group
        if ($level % 2 == 0) {
            $n = 0;
            foreach ($node as $subNode) {
                // Do not process plots here
                if ($subNode->type == 'plot') {
                    continue;
                }
                $active = ($n == 0) ? 'active' : '';

                if ($debug) {
                    \jLog::log("Node {$subNode->name} - n = {$n} ET active = {$active}");
                }
                $item = $prefix.'    <li class="nav-item" role="presentation">';
                $item .= $prefix.'    <button class="nav-link '.$active.'" data-bs-target="#dataviz-dnd-'.$level.'-'.md5($subNode->name);
                $item .= '" data-bs-toggle="tab">'.$subNode->name.'</button>';
                $item .= '</li>';
                $tabChildren[] = $item;
                ++$n;
            }
            // Add the UL only if there is at least one child
            if (!empty($tabChildren)) {
                $html .= $prefix.'<div class="tab-content">';
                $html .= $prefix.'<ul class="nav nav-tabs" role="tablist">';
                $html .= implode("\n", $tabChildren);
                $html .= $prefix.'</ul>';
            }
        }

        // Containers
        $n = 0;
        foreach ($node as $subNode) {
            // If the node is a plot, do not proceed
            // Nodes have already been processed
            if ($subNode->type == 'plot') {
                continue;
            }

            $html .= "\n\n";

            // Check if the node is a tab container or a group container
            $type = 'tab';
            if ($level % 2 != 0) {
                $type = 'group';
            }
            $name = $subNode->name;

            // Class of the container
            $divClass = 'dataviz-dnd-'.$type;

            // Check if it is a tab or a group
            if ($type == 'tab') {
                // Tab
                $active = ($n == 0) ? 'active' : '';
                $html .= $prefix.'<div id="dataviz-dnd-'.$level.'-'.md5($subNode->name).'"';
                $html .= ' class="tab-pane '.$active.' '.$divClass.' level-'.$level.'">';
            } else {
                // Group : we use fieldset
                $html .= $prefix.'<fieldset class="'.$divClass.' level-'.$level.'">';
                $html .= $prefix.'<legend style="font-weight:bold;">'.$name.'</legend>';
            }

            // Process the children only if the current node has content
            if (property_exists($subNode, 'content')) {
                // Build the container content
                $html .= $this->parseDatavizTreeNode($subNode->content, $level + 1, $debug);
            }

            // Close the HTML fieldset for the groups
            if ($type == 'group') {
                $html .= $prefix.'</fieldset>';
            }

            // Close the HTML div for the tab containers
            if ($type == 'tab') {
                $html .= $prefix.'</div>';
            }
            $html .= "\n";

            ++$n;
        }

        // If it a tab
        if (!empty($tabChildren)) {
            $html .= "\n</div>";
        }

        return $html;
    }

    /**
     * Get the metadata written by Lizmap plugin
     * about the desktop version used.
     * qgis_desktop_version, lizmap_plugin_version,
     * lizmap_web_client_target_version.
     *
     * @return null|object
     */
    public function getPluginMetadata()
    {
        if (property_exists($this->metadata, 'lizmap_plugin_version')) {
            return $this->metadata;
        }

        return null;
    }
}
