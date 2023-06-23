import { ValidationError } from './../Errors.js';
import { convertBoolean } from './../utils/Converters.js';
import EventDispatcher from './../../utils/EventDispatcher.js';
import { LayerStyleConfig, LayerTreeGroupConfig, LayerTreeLayerConfig } from './../config/LayerTree.js';
import { buildLayerSymbology, LayerSymbolsSymbology } from './Symbology.js';

/**
 * Class representing a map item: could be a group or a layer
 * @class
 * @augments EventDispatcher
 */
export class MapItemState extends EventDispatcher {

    /**
     * Create a map item
     *
     * @param {String}              type             - the layer tree item type
     * @param {LayerTreeItemConfig} layerTreeItemCfg - the layer tree item config
     * @param {MapItemState}        [parentMapGroup] - the parent layer tree group
     */
    constructor(type, layerTreeItemCfg, parentMapGroup) {
        super();
        this._type = type
        this._layerTreeItemCfg = layerTreeItemCfg;
        this._parentMapGroup = null;
        if (parentMapGroup instanceof MapItemState
            && parentMapGroup.type == 'group') {
            this._parentMapGroup = parentMapGroup;
            this._parentMapGroup.addListener(this.calculateVisibility.bind(this), 'group.visibility.changed');
        }
        this._checked = this._parentMapGroup == null ? true : false;
        this._stateVisibility = null;
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
        const newVal = convertBoolean(val);
        // No changes
        if (this._checked == newVal) {
            return;
        }
        // Set new value
        this._checked = newVal;
        // Propagation to parent if checked
        if (this._checked && this._parentMapGroup != null) {
            this._parentMapGroup.checked = newVal;
        }
        // Calculate visibility
        this.calculateVisibility();
    }

    /**
     * Layer tree item is visible
     * It depends on the parent visibility
     *
     * @type {Boolean}
     **/
    get visibility() {
        if (this._stateVisibility !== null) {
            return this._stateVisibility;
        }
        return this.calculateVisibility();
    }

    /**
     * Lizmap layer config
     *
     * @type {?LayerConfig}
     **/
    get layerConfig() {
        return this._layerTreeItemCfg.layerConfig;
    }

    /**
     * Calculate and save visibility
     *
     * @returns {boolean} the calculated visibility
     **/
    calculateVisibility() {
        // Save visibility before changing
        const oldVisibility = this._stateVisibility;
        // if the item has no parent item like root
        // it is visible
        if (this._parentMapGroup == null) {
            this._stateVisibility = true;
        }
        // if the parent layer tree group is visible
        // the visibility depends if the layer tree item is checked
        // else the layer tree item is not visible
        else if (this._parentMapGroup.visibility) {
            this._stateVisibility = this._checked;
        } else {
            this._stateVisibility = false;
        }
        // Only dispatch event if visibility has changed
        if (oldVisibility !== null && oldVisibility != this.visibility) {
            this.dispatch({
                type: this.type+'.visibility.changed',
                name: this.name,
                visibility: this.visibility,
            })
        }
        return this._stateVisibility;
    }
}

/**
 * Class representing a map group state
 * @class
 * @augments MapItemState
 */
export class MapGroupState extends MapItemState {

    /**
     * Creating a map group state instance
     *
     * @param {LayerTreeGroupConfig} layerTreeGroupCfg - the layer tree group config
     * @param {Number[]}             layersOrder       - the layers order
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
                    group.addListener(this.dispatch.bind(this), 'group.visibility.changed');
                    group.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
                    group.addListener(this.dispatch.bind(this), 'layer.style.changed');
                    group.addListener(this.dispatch.bind(this), 'layer.symbol.checked.changed');
                    this._items.push(group);
                    // Group is checked if one child is checked
                    if (group.checked) {
                        this._checked = true;
                    }
                } else {
                    // Build group as layer
                    const layer = new MapLayerState(layerTreeItem, layersOrder, this)
                    layer.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.style.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.symbol.checked.changed');
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
                    layer.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.style.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.symbol.checked.changed');
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
     * @yields {MapItemState} The next child item
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
                names = names.concat(item.findMapLayerNames());
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
                items = items.concat(item.findMapLayers());
            }
        }
        return items;
    }

    /**
     * Get child by its name
     *
     * @param {String} name - the layer name
     * @returns {MapLayerState} The MapLayerState associated to the name
     **/
    getMapLayerByName(name) {
        for (const layer of this.findMapLayers()) {
            if(layer.name === name) {
                return layer;
            }
        }
        throw RangeError(`The layer name ``${name}`` is unknown!`);
    }
}

/**
 * Class representing a map layer state
 * @class
 * @augments MapItemState
 */
export class MapLayerState extends MapItemState {

    /**
     * Creating a map layer state instance
     *
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
     * Update WMS selected layer style name
     * based on wmsStyles list
     *
     * @param {String} styleName
     **/
    set wmsSelectedStyleName(styleName) {
        if (this._wmsSelectedStyleName == styleName) {
            return;
        }
        if (this.wmsStyles.filter(style => style.wmsName == styleName).length == 0) {
            throw TypeError('Cannot assign an unknown WMS style name! `'+styleName+'` is not in the layer `'+this.name+'` WMS styles!');
        }
        this._wmsSelectedStyleName = styleName;
        this.dispatch({
            type: 'layer.style.changed',
            name: this.name,
            style: this.wmsSelectedStyleName,
        })
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
            'FORMAT': this.layerConfig.imageFormat,
            'DPI': 96
        }
        if (this.symbology instanceof LayerSymbolsSymbology) {
            let keyChecked = [];
            let keyUnchecked = [];
            for (const symbol of this.symbology.getChildren()) {
                if (symbol.rulekey === '') {
                    keyChecked = [];
                    keyUnchecked = [];
                    break;
                }
                if (symbol.checked) {
                    keyChecked.push(symbol.ruleKey);
                } else {
                    keyUnchecked.push(symbol.ruleKey);
                }
            }
            if (keyChecked.length != 0 && keyUnchecked.length != 0) {
                params['LEGEND_ON'] = this.wmsName+':'+keyChecked.join();
                params['LEGEND_OFF'] = this.wmsName+':'+keyUnchecked.join();
            }
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
        if (this.symbology instanceof LayerSymbolsSymbology) {
            for (const symbol of this.symbology.getChildren()) {
                const self = this;
                symbol.addListener(evt => {
                    self.dispatch({
                        type: 'layer.symbol.checked.changed',
                        name: self.name,
                        title: evt.title,
                        ruleKey: evt.ruleKey,
                        checked: evt.checked,
                    });
                }, 'symbol.checked.changed');
            }
        }
    }
}
