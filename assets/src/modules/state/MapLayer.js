import { ValidationError } from './../Errors.js';
import { LayerStyleConfig, LayerTreeGroupConfig, LayerTreeLayerConfig } from './../config/LayerTree.js';
import { buildLayerSymbology } from './Symbology.js';

export class MapItemState {

    /**
     * @param {String} type                                - the layer tree item type
     * @param {LayerTreeItemConfig} layerTreeItemCfg       - the layer tree item config
     * @param {MapItemState}        [parentMapGroup] - the parent layer tree group
     */
    constructor(type, layerTreeItemCfg, parentMapGroup) {
        this._type = type
        this._layerTreeItemCfg = layerTreeItemCfg;
        this._parentMapGroup = null;
        if (parentMapGroup instanceof MapItemState
            && parentMapGroup.type == 'group') {
            this._parentMapGroup = parentMapGroup;
        }
        this._checked = this._parentMapGroup == null ? true : false;
    }
    /**
     * Config layers
     *
     * @type {String}
     **/
    get name() {
        return this._layerTreeItemCfg.name;
    }

    /**
     * Config layers
     *
     * @type {String}
     **/
    get type() {
        return this._type;
    }

    /**
     * the layer tree item level
     *
     * @type {Number}
     **/
    get level() {
        return this._layerTreeItemCfg.level;
    }

    /**
     * WMS layer name
     *
     * @type {?String}
     **/
    get wmsName() {
        return this._layerTreeItemCfg.wmsName;
    }


    /**
     * WMS layer title
     *
     * @type {String}
     **/
    get wmsTitle() {
        return this._layerTreeItemCfg.wmsTitle;
    }

    /**
     * WMS layer Geographic Bounding Box
     *
     * @type {?LayerGeographicBoundingBoxConfig}
     **/
    get wmsGeographicBoundingBox() {
        return this._layerTreeItemCfg.wmsGeographicBoundingBox;
    }

    /**
     * WMS layer Bounding Boxes
     *
     * @type {LayerBoundingBoxConfig[]}
     **/
    get wmsBoundingBoxes() {
        return this._layerTreeItemCfg.wmsBoundingBoxes;
    }


    /**
     * WMS Minimum scale denominator
     * If the minimum scale denominator is not defined: -1 is returned
     * If the WMS layer is a group, the minimum scale denominator is -1 if only one layer
     * minimum scale denominator is not defined else the smallest layer minimum scale denominator
     * in the group
     *
     * @type {Number}
     **/
    get wmsMinScaleDenominator() {
        if ( this._layerTreeItemCfg.type == 'group') {
            let minScaleDenominator = -1;
            for (const treeLayerCfg of this._layerTreeItemCfg.findTreeLayerConfigs()) {
                const treeLayerMinScaleDenominator = treeLayerCfg.wmsMinScaleDenominator;
                if (treeLayerMinScaleDenominator < 0) {
                    return -1;
                }
                if (minScaleDenominator == -1) {
                    minScaleDenominator = treeLayerMinScaleDenominator;
                } else if (treeLayerMinScaleDenominator < minScaleDenominator) {
                    minScaleDenominator = treeLayerMinScaleDenominator;
                }
            }
            return minScaleDenominator;
        }
        return this._layerTreeItemCfg.wmsMinScaleDenominator;
    }

    /**
     * WMS layer maximum scale denominator
     * If the maximum scale denominator is not defined: -1 is returned
     * If the WMS layer is a group, the maximum scale denominator is the largest of the layers in the group
     *
     * @type {Number}
     **/
    get wmsMaxScaleDenominator() {
        if ( this._layerTreeItemCfg.type == 'group' ) {
            let maxScaleDenominator = -1;
            for (const treeLayerCfg of this._layerTreeItemCfg.findTreeLayerConfigs()) {
                const treeLayerMaxScaleDenominator = treeLayerCfg.wmsMaxScaleDenominator;
                if (treeLayerMaxScaleDenominator < 0) {
                    return -1;
                }
                if (maxScaleDenominator == -1) {
                    maxScaleDenominator = treeLayerMaxScaleDenominator;
                } else if (treeLayerMaxScaleDenominator > maxScaleDenominator) {
                    maxScaleDenominator = treeLayerMaxScaleDenominator;
                }
            }
            return maxScaleDenominator;
        }
        return this._layerTreeItemCfg.wmsMaxScaleDenominator;
    }

    /**
     * Layer tree item is checked
     *
     * @type {Boolean}
     **/
    get checked() {
        return this._checked;
    }

    /**
     * Set layer tree item is checked
     *
     * @type {Boolean}
     **/
    set checked(val) {
        if (this._checked == val) {
            return;
        }
        this._checked = val;
        if (this._checked && this._parentMapGroup != null) {
            this._parentMapGroup.checked = val;
        }
    }

    /**
     * Layer tree item is visible
     * It depends on the parent visibility
     *
     * @type {Boolean}
     **/
    get visibility() {
        // if the item has no parent item like root
        // it is visible
        if (this._parentMapGroup == null) {
            return true;
        }
        // if the parent layer tree group is visible
        // the visibility depends if the layer tree item is checked
        // else the layer tree item is not visible
        if (this._parentMapGroup.visibility) {
            return this._checked;
        }
        return false;
    }

    /**
     * Lizmap layer config
     *
     * @type {?LayerConfig}
     **/
    get layerConfig() {
        return this._layerTreeItemCfg.layerConfig;
    }
}

export class MapGroupState extends MapItemState {

    /**
     * @param {LayerTreeGroupConfig} layerTreeGroupCfg - the layer tree group config
     * @param {String[]}             layersOrder       - the layers order
     * @param {MapGroupState}        [parentMapGroup]  - the parent layer tree group
     */
    constructor(layerTreeGroupCfg, layersOrder, parentMapGroup) {
        super('group', layerTreeGroupCfg, parentMapGroup);
        this._items = [];
        this._notInLayerTree = [];
        for (const layerTreeItem of layerTreeGroupCfg.getChildren()) {
            if (layerTreeItem.name.toLowerCase() == 'hidden') {
                continue;
            }
            if (layerTreeItem.name.toLowerCase() == 'overview' && layerTreeItem.level == 1) {
                continue;
            }
            if (layerTreeItem.name.toLowerCase() == 'baselayers' && layerTreeItem.level == 1) {
                continue;
            }

            const cfg = layerTreeItem.layerConfig;
            if (cfg == null) {
                throw new RangeError('The layer `'+ layerTreeItem.name +'` has no config!');
            }

            // Group as group
            if (layerTreeItem instanceof LayerTreeGroupConfig && layerTreeItem.childrenCount != 0) {
                if (!cfg.groupAsLayer) {
                    // Build group
                    const group = new MapGroupState(layerTreeItem, layersOrder, this);
                    // Manage layer not display in layer tree
                    if ( this._parentMapGroup != null) {
                        // Merge them if we are not at the root level
                        this._notInLayerTree = this._notInLayerTree.concat(...group._notInLayerTree);
                    } else {
                        // Insert them in items list
                        this._items = this._items.concat(...group._notInLayerTree);
                    }
                    // If the group is empty do not keep it
                    if (group.childrenCount == 0) {
                        continue;
                    }
                    this._items.push(group);
                    // Group is checked if one child is checked
                    if (group.checked) {
                        this._checked = true;
                    }
                } else {
                    // Build group as layer
                    const layer = new MapLayerState(layerTreeItem, layersOrder, this)
                    this._items.push(layer);
                    // Group is checked if one child is checked
                    if (layer.checked) {
                        this._checked = true;
                    }
                }
            } else if (layerTreeItem instanceof LayerTreeLayerConfig && !cfg.baseLayer) {
                // layer with geometry type equal to 'none' or 'unknown' cannot be displayed
                if (cfg.geometryType != null
                    && (cfg.geometryType == 'none' || cfg.geometryType == 'unknown')) {
                    continue;
                }
                // layer not display in legend and not toggled has not to be displayed
                if (!cfg.displayInLegend && !cfg.toggled) {
                    continue;
                }
                // Build layer
                const layer = new MapLayerState(layerTreeItem, layersOrder, this)
                // Store layer not display in layer tree if we are not at the root level
                if (!cfg.displayInLegend && this._parentMapGroup != null) {
                    this._notInLayerTree.push(layer);
                } else {
                    this._items.push(layer);
                    // Group is checked if one child is checked
                    if (layer.checked) {
                        this._checked = true;
                    }
                }
            }
        }
    }

    /**
     * The layer mutually exclusive activation (group only)
     *
     * @type {Boolean}
     **/
    get mutuallyExclusive() {
        if (this.layerConfig == null) {
            return false;
        }
        return this.layerConfig.mutuallyExclusive;
    }

    /**
     * Children items count
     *
     * @type {Number}
     **/
    get childrenCount() {
        return this._items.length;
    }

    /**
     * Children items
     *
     * @type {MapItemState[]}
     **/
    get children() {
        return [...this._items];
    }

    /**
     * Iterate through children items
     *
     * @generator
     * @yields {LayerTreeItem} The next child item
     **/
    *getChildren() {
        for (const item of this._items) {
            yield item;
        }
    }

    /**
     * Find layer names
     *
     * @returns {String[]}
     **/
    findMapLayerNames() {
        let names = []
        for(const item of this.getChildren()) {
            if (item instanceof MapLayerState) {
                names.push(item.name);
            } else if (item instanceof MapGroupState) {
                names = names.concat(item.findTreeLayerNames());
            }
        }
        return names;
    }

    /**
     * Find layer items
     *
     * @returns {MapLayerState[]}
     **/
    findMapLayers() {
        let items = []
        for(const item of this.getChildren()) {
            if (item instanceof MapLayerState) {
                items.push(item);
            } else if (item instanceof MapGroupState) {
                items = items.concat(item.findTreeLayers());
            }
        }
        return items;
    }
}

export class MapLayerState extends MapItemState {

    /**
     * @param {LayerTreeLayerConfig|LayerTreeGroupConfig} layerTreeItemCfg - the layer tree group config
     * @param {String[]}                                  layersOrder      - the layers order
     * @param {MapGroupState}                             [parentMapGroup] - the parent layer tree group
     */
    constructor(layerTreeItemCfg, layersOrder, parentMapGroup) {
        super('layer', layerTreeItemCfg, parentMapGroup);
        this._layerOrder = -1;
        if (this.layerConfig instanceof LayerTreeGroupConfig) {
            if (this.layerConfig.toggled) {
                this._checked = true;
            }
            for (const layerCfg of this.layerConfig.findTreeLayerConfigs()) {
                if (layerCfg.toggled) {
                    this._checked = true;
                }
                const layerOrder = layersOrder.indexOf(layerCfg.name);
                if (this._layerOrder == -1 || layerOrder < this._layerOrder) {
                    this._layerOrder = layerOrder;
                }
            }
        } else {
            if (this.layerConfig.toggled) {
                this._checked = true;
            }
            this._layerOrder = layersOrder.indexOf(this.layerConfig.name);
        }
        // set default style
        this._wmsSelectedStyleName = this.wmsStyles[0].wmsName;
        // set symbology to null
        this._symbology = null;
    }

    /**
     * Is the map layer displayed in layer tree
     *
     * @type {Boolean}
     **/
    get displayInLayerTree() {
        return this.layerConfig.displayInLegend;
    }

    /**
     * WMS selected layer style name
     *
     * @type {String}
     **/
    get wmsSelectedStyleName() {
        return this._wmsSelectedStyleName;
    }

    /**
     * WMS layer styles
     *
     * @type {LayerStyleConfig[]}
     **/
    get wmsStyles() {
        if ( this._layerTreeItemCfg.type == 'layer' ) {
            return this._layerTreeItemCfg.wmsStyles;
        }
        return [new LayerStyleConfig('', '')];
    }

    /**
     * WMS layer attribution
     *
     * @type {?AttributionConfig}
     **/
    get wmsAttribution() {
        if ( this._layerTreeItemCfg.type == 'layer' ) {
            return this._layerTreeItemCfg.wmsAttribution;
        }
        return null;
    }

    /**
     * Parameters for OGC WMS Request
     *
     * @type {Object}
     **/
    get wmsParameters() {
        let params = {
            'LAYERS': this.wmsName,
            'STYLES': this.wmsSelectedStyleName,
        }
        return params;
    }

    /**
     * Layer symbology
     *
     * @type {?(LayerIconSymbology|LayerSymbolsSymbology|LayerGroupSymbology)}
     **/
    get symbology() {
        return this._symbology;
    }

    /**
     * Update layer symbology
     *
     * @param {(Object|LayerIconSymbology|LayerSymbolsSymbology|LayerGroupSymbology)} node - The symbology node
     **/
    set symbology(node) {
        if (!node.hasOwnProperty('name')) {
            throw new ValidationError('Node symbology required `name` property!');
        }
        if (node.name != this.wmsName) {
            throw new ValidationError('The node symbology does not correspond to the layer! The node name is `'+node.name+'` != `'+this.wmsName+'`');
        }
        this._symbology = buildLayerSymbology(node);
    }
}
