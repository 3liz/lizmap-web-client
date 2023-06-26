import EventDispatcher from './../../utils/EventDispatcher.js';
import { LayerStyleConfig } from './../config/LayerTree.js';
import { LayerGroupState, LayerLayerState, LayerVectorState } from './Layer.js';

/**
 * Class representing a map item: could be a group or a layer
 * @class
 * @augments EventDispatcher
 */
export class MapItemState extends EventDispatcher {

    /**
     * Create a map item
     *
     * @param {String}         type             - the map layer item type
     * @param {LayerItemState} layerItemState   - the layer item state
     * @param {MapItemState}   [parentMapGroup] - the parent layer map group
     */
    constructor(type, layerItemState, parentMapGroup) {
        super();
        this._type = type
        this._layerItemState = layerItemState;
        this._parentMapGroup = null;
        if (parentMapGroup instanceof MapItemState
            && parentMapGroup.type == 'group') {
            this._parentMapGroup = parentMapGroup;
        }
        if (layerItemState instanceof LayerLayerState) {
            layerItemState.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
            layerItemState.addListener(this.dispatch.bind(this), 'layer.style.changed');
            layerItemState.addListener(this.dispatch.bind(this), 'layer.symbol.checked.changed');
            layerItemState.addListener(this.dispatch.bind(this), 'layer.selection.changed');
            layerItemState.addListener(this.dispatch.bind(this), 'layer.selection.token.changed');
            layerItemState.addListener(this.dispatch.bind(this), 'layer.filter.changed');
            layerItemState.addListener(this.dispatch.bind(this), 'layer.filter.token.changed');
        } else if (layerItemState instanceof LayerGroupState) {
            layerItemState.addListener(this.dispatch.bind(this), 'group.visibility.changed');
        }
    }
    /**
     * Config layers
     *
     * @type {String}
     **/
    get name() {
        return this._layerItemState.name;
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
        return this._layerItemState.level;
    }

    /**
     * WMS layer name
     *
     * @type {?String}
     **/
    get wmsName() {
        return this._layerItemState.wmsName;
    }


    /**
     * WMS layer title
     *
     * @type {String}
     **/
    get wmsTitle() {
        return this._layerItemState.wmsTitle;
    }

    /**
     * WMS layer Geographic Bounding Box
     *
     * @type {?LayerGeographicBoundingBoxConfig}
     **/
    get wmsGeographicBoundingBox() {
        return this._layerItemState.wmsGeographicBoundingBox;
    }

    /**
     * WMS layer Bounding Boxes
     *
     * @type {LayerBoundingBoxConfig[]}
     **/
    get wmsBoundingBoxes() {
        return this._layerItemState.wmsBoundingBoxes;
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
        return this._layerItemState.wmsMinScaleDenominator;
    }

    /**
     * WMS layer maximum scale denominator
     * If the maximum scale denominator is not defined: -1 is returned
     * If the WMS layer is a group, the maximum scale denominator is the largest of the layers in the group
     *
     * @type {Number}
     **/
    get wmsMaxScaleDenominator() {
        return this._layerItemState.wmsMaxScaleDenominator;
    }

    /**
     * Layer tree item is checked
     *
     * @type {Boolean}
     **/
    get checked() {
        return this._layerItemState.checked;
    }

    /**
     * Set layer tree item is checked
     *
     * @type {Boolean}
     **/
    set checked(val) {
        this._layerItemState.checked = val;
    }

    /**
     * Layer tree item is visible
     * It depends on the parent visibility
     *
     * @type {Boolean}
     **/
    get visibility() {
        return this._layerItemState.visibility;
    }

    /**
     * Lizmap layer config
     *
     * @type {?LayerConfig}
     **/
    get layerConfig() {
        return this._layerItemState.layerConfig;
    }

    /**
     * Lizmap layer item state
     *
     * @type {?LayerConfig}
     **/
    get itemState() {
        return this._layerItemState;
    }

    /**
     * Calculate and save visibility
     *
     * @returns {boolean} the calculated visibility
     **/
    calculateVisibility() {
        return this._layerItemState.calculateVisibility();
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
     * @param {LayerGroupState} layerGroupState  - the layer tree group config
     * @param {MapGroupState}   [parentMapGroup] - the parent layer map group
     */
    constructor(layerGroupState, parentMapGroup) {
        super('group', layerGroupState, parentMapGroup);

        this._items = [];
        this._notInLayerTree = [];
        for (const layerItem of layerGroupState.getChildren()) {
            // Group
            if (layerItem instanceof LayerGroupState) {
                // Hidden
                if (layerItem.name.toLowerCase() == 'hidden') {
                    continue;
                }
                // Overview
                if (layerItem.name.toLowerCase() == 'overview' && layerItem.level == 1) {
                    continue;
                }
                // Baselayers
                if (layerItem.name.toLowerCase() == 'baselayers' && layerItem.level == 1) {
                    continue;
                }
                // Empty Group
                if (layerItem.childrenCount == 0) {
                    continue;
                }

                if (!layerItem.groupAsLayer) {
                    // Build group
                    const group = new MapGroupState(layerItem, this);
                    // Manage layer not display in layer tree
                    if ( this._parentMapGroup != null) {
                        // Merge them if we are not at the root level
                        this._notInLayerTree = this._notInLayerTree.concat(...group._notInLayerTree);
                    } else {
                        // Insert them in items list at the root level
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
                    group.addListener(this.dispatch.bind(this), 'layer.selection.changed');
                    group.addListener(this.dispatch.bind(this), 'layer.selection.token.changed');
                    group.addListener(this.dispatch.bind(this), 'layer.filter.changed');
                    group.addListener(this.dispatch.bind(this), 'layer.filter.token.changed');
                    this._items.push(group);
                    // Group is checked if one child is checked
                    if (group.checked) {
                        this._checked = true;
                    }
                } else {
                    // Build group as layer
                    const layer = new MapLayerState(layerItem, this)
                    layer.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.style.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.symbol.checked.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.selection.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.selection.token.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.filter.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.filter.token.changed');
                    this._items.push(layer);
                    // Group is checked if one child is checked
                    if (layer.checked) {
                        this._checked = true;
                    }
                }
            } else if (layerItem instanceof LayerLayerState && !layerItem.baseLayer) {
                // layer with geometry type equal to 'none' or 'unknown' cannot be displayed
                if (layerItem instanceof LayerVectorState
                    && !layerItem.isSpatial) {
                    continue;
                }
                // layer not display in legend and not toggled has not to be displayed
                if (!layerItem.displayInLegend && !layerItem.layerConfig.toggled) {
                    continue;
                }
                // Build layer
                const layer = new MapLayerState(layerItem, this)
                // Store layer not display in layer tree if we are not at the root level
                if (!layerItem.displayInLegend && this._parentMapGroup != null) {
                    this._notInLayerTree.push(layer);
                } else {
                    this._items.push(layer);
                    layer.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.style.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.symbol.checked.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.selection.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.selection.token.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.filter.changed');
                    layer.addListener(this.dispatch.bind(this), 'layer.filter.token.changed');
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
     * Get layer item by its name
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
        throw RangeError('The layer name `'+ name +'` is unknown!');
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
     * @param {LayerVectorState|LayerRasterState|LayerGroupState} layerItemState   - the layer item state
     * @param {MapGroupState}                                     [parentMapGroup] - the parent layer map group
     */
    constructor(layerItemState, parentMapGroup) {
        super('layer', layerItemState, parentMapGroup);
        // The layer is group
        if (this.itemState instanceof LayerGroupState) {
            // Remove the listener for group.visibility.changed to be replaced
            layerItemState.removeListener(this.dispatch.bind(this), 'group.visibility.changed');
            // Transform the group.visibility.changed by  layer.visibility.changed
            const self = this;
            layerItemState.addListener(
                () => {
                    self.dispatch({
                        type: 'group.visibility.changed',
                        name: self.name,
                        visibility: self.visibility,
                    });
                },
                'group.visibility.changed');
            //layerItemState.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
            //layerItemState.addListener(this.dispatch.bind(this), 'layer.style.changed');
            //layerItemState.addListener(this.dispatch.bind(this), 'layer.symbol.checked.changed');
            layerItemState.addListener(this.dispatch.bind(this), 'layer.selection.changed');
            layerItemState.addListener(this.dispatch.bind(this), 'layer.selection.token.changed');
            layerItemState.addListener(this.dispatch.bind(this), 'layer.filter.changed');
            layerItemState.addListener(this.dispatch.bind(this), 'layer.filter.token.changed');
        }
    }

    /**
     * Layer type
     *
     * @type {String}
     **/
    get layerType() {
        if (this.itemState instanceof LayerGroupState) {
            return 'group';
        }
        return this._layerItemState.layerType;
    }

    /**
     * Layer order from top to bottom
     *
     * @type {Number}
     **/
    get layerOrder() {
        return this._layerItemState.layerOrder;
    }

    /**
     * Is the map layer displayed in layer tree
     *
     * @type {Boolean}
     **/
    get displayInLayerTree() {
        return this._layerItemState.displayInLegend;
    }

    /**
     * WMS selected layer style name
     *
     * @type {String}
     **/
    get wmsSelectedStyleName() {
        return this._layerItemState.wmsSelectedStyleName;
    }

    /**
     * Update WMS selected layer style name
     * based on wmsStyles list
     *
     * @param {String} styleName
     **/
    set wmsSelectedStyleName(styleName) {
        this._layerItemState.wmsSelectedStyleName = styleName;
    }

    /**
     * WMS layer styles
     *
     * @type {LayerStyleConfig[]}
     **/
    get wmsStyles() {
        if ( this._layerItemState.type == 'layer' ) {
            return this._layerItemState.wmsStyles;
        }
        return [new LayerStyleConfig('', '')];
    }

    /**
     * WMS layer attribution
     *
     * @type {?AttributionConfig}
     **/
    get wmsAttribution() {
        if ( this._layerItemState.type == 'layer' ) {
            return this._layerItemState.wmsAttribution;
        }
        return null;
    }

    /**
     * Parameters for OGC WMS Request
     *
     * @type {Object}
     **/
    get wmsParameters() {
        return this._layerItemState.wmsParameters;
    }

    /**
     * Layer symbology
     *
     * @type {?(LayerIconSymbology|LayerSymbolsSymbology|LayerGroupSymbology)}
     **/
    get symbology() {
        return this._layerItemState.symbology;
    }

    /**
     * Update layer symbology
     *
     * @param {(Object|LayerIconSymbology|LayerSymbolsSymbology|LayerGroupSymbology)} node - The symbology node
     **/
    set symbology(node) {
        this._layerItemState.symbology = node;
    }
}
