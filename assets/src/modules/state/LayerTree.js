import EventDispatcher from './../../utils/EventDispatcher.js';
import { MapGroupState, MapLayerState } from './MapLayer.js';
import { getDefaultLayerIcon, LayerIconSymbology, LayerSymbolsSymbology, LayerGroupSymbology } from './Symbology.js';
import { convertBoolean } from './../utils/Converters.js';

/**
 * Class representing a layer tree item
 * @class
 * @augments EventDispatcher
 */
export class LayerTreeItemState extends EventDispatcher {

    /**
     * Instantiate a layer tree item
     *
     * @param {MapItemState}       mapItemState       - the map item state
     * @param {LayerTreeItemState} [parentGroupState] - the parent layer tree group
     */
    constructor(mapItemState, parentGroupState) {
        super();
        this._mapItemState = mapItemState;
        this._parentGroupState = null;

        this._expanded = false;
        if (this.type === "group") {
            this._expanded = true;
        } else {
            this._expanded = this.layerConfig.legendImageOption === "expand_at_startup";
        }

        if (parentGroupState instanceof LayerTreeItemState
            && parentGroupState.type == 'group') {
            this._parentGroupState = parentGroupState;
        }
        if (mapItemState instanceof MapLayerState) {
            mapItemState.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
            mapItemState.addListener(this.dispatch.bind(this), 'layer.symbology.changed');
            mapItemState.addListener(this.dispatch.bind(this), 'layer.opacity.changed');
            mapItemState.addListener(this.dispatch.bind(this), 'layer.loading.changed');
            mapItemState.addListener(this.dispatch.bind(this), 'layer.load.status.changed');
            mapItemState.addListener(this.dispatch.bind(this), 'layer.style.changed');
            mapItemState.addListener(this.dispatch.bind(this), 'layer.symbol.checked.changed');
            mapItemState.addListener(this.dispatch.bind(this), 'layer.selection.changed');
            mapItemState.addListener(this.dispatch.bind(this), 'layer.selection.token.changed');
            mapItemState.addListener(this.dispatch.bind(this), 'layer.filter.changed');
            mapItemState.addListener(this.dispatch.bind(this), 'layer.filter.token.changed');
        } else if (mapItemState instanceof MapGroupState) {
            mapItemState.addListener(this.dispatch.bind(this), 'group.visibility.changed');
            mapItemState.addListener(this.dispatch.bind(this), 'group.symbology.changed');
            mapItemState.addListener(this.dispatch.bind(this), 'group.opacity.changed');
        }
    }
    /**
     * Config layers
     *
     * @type {String}
     **/
    get name() {
        return this._mapItemState.name;
    }

    /**
     * Config layers
     *
     * @type {String}
     **/
    get type() {
        return this._mapItemState.type;
    }

    /**
     * Layer tree item level
     *
     * @type {Number}
     **/
    get level() {
        return this._mapItemState.level;
    }

    /**
     * WMS layer name
     *
     * @type {?String}
     **/
    get wmsName() {
        return this._mapItemState.wmsName;
    }

    /**
     * WMS layer title
     *
     * @type {String}
     **/
    get wmsTitle() {
        return this._mapItemState.wmsTitle;
    }

    /**
     * WMS layer Geographic Bounding Box
     *
     * @type {?LayerGeographicBoundingBoxConfig}
     **/
    get wmsGeographicBoundingBox() {
        return this._mapItemState.wmsGeographicBoundingBox;
    }

    /**
     * WMS layer Bounding Boxes
     *
     * @type {LayerBoundingBoxConfig[]}
     **/
    get wmsBoundingBoxes() {
        return this._mapItemState.wmsBoundingBoxes;
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
        return this._mapItemState.wmsMinScaleDenominator;
    }

    /**
     * WMS layer maximum scale denominator
     * If the maximum scale denominator is not defined: -1 is returned
     * If the WMS layer is a group, the maximum scale denominator is the largest of the layers in the group
     *
     * @type {Number}
     **/
    get wmsMaxScaleDenominator() {
        return this._mapItemState.wmsMaxScaleDenominator;
    }

    /**
     * Layer tree item is checked
     *
     * @type {Boolean}
     **/
    get checked() {
        return this._mapItemState.checked;
    }

    /**
     * Set layer tree item is checked
     *
     * @type {Boolean}
     **/
    set checked(val) {
        this._mapItemState.checked = val;
    }

    /**
     * Layer tree item is visible
     * It depends on the parent visibility
     *
     * @type {Boolean}
     **/
    get visibility() {
        return this._mapItemState.visibility;
    }

    /**
     * Layer tree item opacity
     *
     * @type {Number}
     **/
    get opacity() {
        return this._mapItemState.opacity;
    }

    /**
     * Set layer tree item opacity
     *
     * @type {Number}
     **/
    set opacity(val) {
        this._mapItemState.opacity = val;
    }

    /**
     * Lizmap layer config
     *
     * @type {?LayerConfig}
     **/
    get layerConfig() {
        return this._mapItemState.layerConfig;
    }

    /**
     * Map item state
     *
     * @type {?MapItemState}
     **/
    get mapItemState() {
        return this._mapItemState;
    }

    /**
     * Layer tree item is expanded
     *
     * @type {Boolean}
     **/
    get expanded() {
        return this._expanded;
    }

    /**
     * Set layer tree item is expanded
     *
     * @type {Boolean}
     **/
    set expanded(val) {
        const newVal = convertBoolean(val);
        if(this._expanded === newVal){
            return;
        }

        this._expanded = newVal;

        this.dispatch({
            type: this.type + '.expanded.changed',
            name: this.name
        });
    }

    /**
     * Calculate and save visibility
     *
     * @returns {boolean} the calculated visibility
     **/
    calculateVisibility() {
        return this._mapItemState.calculateVisibility();
    }
}

/**
 * Class representing a layer tree group
 * @class
 * @augments LayerTreeItemState
 */
export class LayerTreeGroupState extends LayerTreeItemState {

    /**
     * Instantiate a layer tree group
     *
     * @param {MapGroupState}       mapGroupState      - the map layer group state
     * @param {LayerTreeGroupState} [parentGroupState] - the parent layer tree group
     */
    constructor(mapGroupState, parentGroupState) {
        super(mapGroupState, parentGroupState);
        this._items = [];
        for (const mapItemState of mapGroupState.getChildren()) {

            if (mapItemState instanceof MapGroupState) {
                // Build group
                const group = new LayerTreeGroupState(mapItemState, this);
                // If the group is empty do not keep it
                if (group.childrenCount == 0) {
                    continue;
                }
                group.addListener(this.dispatch.bind(this), 'group.visibility.changed');
                group.addListener(this.dispatch.bind(this), 'group.expanded.changed');
                group.addListener(this.dispatch.bind(this), 'group.symbology.changed');
                group.addListener(this.dispatch.bind(this), 'group.opacity.changed');
                group.addListener(this.dispatch.bind(this), 'layer.symbology.changed');
                group.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
                group.addListener(this.dispatch.bind(this), 'layer.expanded.changed');
                group.addListener(this.dispatch.bind(this), 'layer.opacity.changed');
                group.addListener(this.dispatch.bind(this), 'layer.loading.changed');
                group.addListener(this.dispatch.bind(this), 'layer.load.status.changed');
                group.addListener(this.dispatch.bind(this), 'layer.style.changed');
                group.addListener(this.dispatch.bind(this), 'layer.symbol.checked.changed');
                group.addListener(this.dispatch.bind(this), 'layer.selection.changed');
                group.addListener(this.dispatch.bind(this), 'layer.selection.token.changed');
                group.addListener(this.dispatch.bind(this), 'layer.filter.changed');
                group.addListener(this.dispatch.bind(this), 'layer.filter.token.changed');
                this._items.push(group);
            } else if (mapItemState instanceof MapLayerState) {
                if (!mapItemState.displayInLayerTree) {
                    continue;
                }
                // Build layer
                const layer = new LayerTreeLayerState(mapItemState, this)
                layer.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.expanded.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.symbology.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.opacity.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.loading.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.load.status.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.style.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.symbol.checked.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.selection.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.selection.token.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.filter.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.filter.token.changed');
                this._items.push(layer);
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
     * @type {LayerTreeItemState[]}
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
    findTreeLayerNames() {
        let names = []
        for(const item of this.getChildren()) {
            if (item instanceof LayerTreeLayerState) {
                names.push(item.name);
            } else if (item instanceof LayerTreeGroupState) {
                names = names.concat(item.findTreeLayerNames());
            }
        }
        return names;
    }

    /**
     * Find layer items
     *
     * @returns {LayerTreeLayerState[]}
     **/
    findTreeLayers() {
        let items = []
        for(const item of this.getChildren()) {
            if (item instanceof LayerTreeLayerState) {
                items.push(item);
            } else if (item instanceof LayerTreeGroupState) {
                items = items.concat(item.findTreeLayers());
            }
        }
        return items;
    }

    /**
     * Find layer and group items
     *
     * @returns {LayerTreeLayerState[]}
     **/
    findTreeLayersAndGroups() {
        let items = []
        for(const item of this.getChildren()) {
            if (item instanceof LayerTreeLayerState) {
                items.push(item);
            } else if (item instanceof LayerTreeGroupState) {
                items.push(item);
                items = items.concat(item.findTreeLayersAndGroups());
            }
        }
        return items;
    }

    /**
     * Get tree layer item by its name
     *
     * @param {String} name - the layer name
     * @returns {LayerTreeLayerState} The LayerTreeLayerState associated to the name
     **/
    getTreeLayerByName(name) {
        for (const layer of this.findTreeLayers()) {
            if(layer.name === name) {
                return layer;
            }
        }
        throw RangeError('The layer name `'+ name +'` is unknown!');
    }
}

/**
 * Class representing a layer tree layer
 * @class
 * @augments LayerTreeItemState
 */
export class LayerTreeLayerState extends LayerTreeItemState {

    /**
     * Instantiate a layer tree layer
     *
     * @param {MapLayerState}       mapLayerState      - the map layer state
     * @param {LayerTreeGroupState} [parentGroupState] - the parent layer tree group
     */
    constructor(mapLayerState, parentGroupState) {
        super(mapLayerState, parentGroupState);
        // set default icon
        this._icon = getDefaultLayerIcon(this.layerConfig);
    }

    /**
     * Vector layer has selected features
     * The selected features is not empty
     *
     * @type {Boolean}
     **/
    get hasSelectedFeatures() {
        return this._mapItemState.hasSelectedFeatures;
    }

    /**
     * Vector layer is filtered
     * The expression filter is not null
     *
     * @type {Boolean}
     **/
    get isFiltered() {
        return this._mapItemState.isFiltered;
    }

    /**
     * The source icon of the layer
     *
     * @type {string}
     **/
    get icon() {
        if (this._mapItemState.symbology instanceof LayerIconSymbology) {
            return this.symbology.icon;
        }
        return this._icon;
    }

    /**
     * WMS selected layer style name
     *
     * @type {String}
     **/
    get wmsSelectedStyleName() {
        return this._mapItemState.wmsSelectedStyleName;
    }

    /**
     * Update WMS selected layer style name
     * based on wmsStyles list
     *
     * @param {String} styleName
     **/
    set wmsSelectedStyleName(styleName) {
        this._mapItemState.wmsSelectedStyleName = styleName;
    }

    /**
     * WMS layer styles
     *
     * @type {LayerStyleConfig[]}
     **/
    get wmsStyles() {
        return this._mapItemState.wmsStyles;
    }

    /**
     * WMS layer attribution
     *
     * @type {?AttributionConfig}
     **/
    get wmsAttribution() {
        return this._mapItemState.wmsAttribution;
    }

    /**
     * Parameters for OGC WMS Request
     *
     * @type {Object}
     **/
    get wmsParameters() {
        return this._mapItemState.wmsParameters;
    }

    /**
     * The layer load status
     * @see MapLayerLoadStatus
     *
     * @type {String}
     **/
    get loadStatus() {
        return this._mapItemState.loadStatus;
    }

    /**
     * Layer symbology
     *
     * @type {?(LayerIconSymbology|LayerSymbolsSymbology|LayerGroupSymbology)}
     **/
    get symbology() {
        return this._mapItemState.symbology;
    }

    /**
     * Update layer symbology
     *
     * @param {(Object|LayerIconSymbology|LayerSymbolsSymbology|LayerGroupSymbology)} node - The symbology node
     **/
    set symbology(node) {
        this._mapItemState.symbology = node;
    }

    /**
     * Children symbology count
     *
     * @type {Number}
     **/
    get symbologyChildrenCount() {
        if (this._mapItemState.symbology instanceof LayerSymbolsSymbology
            || this._mapItemState.symbology instanceof LayerGroupSymbology) {
            return this._mapItemState.symbology.childrenCount;
        }
        return 0;
    }

    /**
     * Children symbology
     *
     * @type {(SymbolIconSymbology[]|Array.<BaseIconSymbology|BaseSymbolsSymbology>)}
     **/
    get symbologyChildren() {
        if (this._mapItemState.symbology instanceof LayerSymbolsSymbology
            || this._mapItemState.symbology instanceof LayerGroupSymbology) {
            return this._mapItemState.symbology.children;
        }
        return [];
    }


    /**
     * Iterate through children nodes
     *
     * @generator
     * @yields {SymbolIconSymbology|BaseIconSymbology|BaseSymbolsSymbology} The next child node
     **/
    *getSymbologyChildren() {
        if (this._mapItemState.symbology instanceof LayerSymbolsSymbology
            || this._mapItemState.symbology instanceof LayerGroupSymbology) {
            for (const symbol of this._mapItemState.symbology.getChildren()) {
                yield symbol;
            }
        }
    }
}
