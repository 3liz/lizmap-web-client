
import EventDispatcher from './../../utils/EventDispatcher.js';
import { convertBoolean } from './../utils/Converters.js';
import { ExternalMapItemState, ExternalMapGroupState, OlMapLayerState } from './ExternalMapLayer.js';
import { LayerTreeGroupState } from './LayerTree.js';

/**
 * Class representing an external layer tree item
 * @class
 * @augments EventDispatcher
 */
export class ExternalLayerTreeItemState extends EventDispatcher {

    /**
     * Instantiate an external layer tree item
     * @param {ExternalMapItemState} mapItemState - the external map item state
     */
    constructor(mapItemState) {
        if (!(mapItemState instanceof ExternalMapItemState)) {
            throw TypeError('The map item state has to be an external map item state!');
        }
        super();
        this._mapItemState = mapItemState;
        mapItemState.addListener(this.dispatch.bind(this), mapItemState.type+'.wmsTitle.changed');
    }

    /**
     * Map item name
     * @type {string}
     */
    get name() {
        return this._mapItemState.name;
    }

    /**
     * Map item type
     * @type {string}
     */
    get type() {
        return this._mapItemState.type;
    }

    /**
     * Map item level
     * @type {number}
     */
    get level() {
        return this._mapItemState.level;
    }

    /**
     * WMS item name
     * @type {?string}
     */
    get wmsName() {
        return this._mapItemState.wmsName;
    }

    /**
     * WMS item title
     * @type {string}
     */
    get wmsTitle() {
        return this._mapItemState.wmsTitle;
    }

    /**
     * WMS item title
     * @type {string}
     */
    set wmsTitle(title) {
        this._mapItemState.wmsTitle = title;
    }
    /**
     * WMS layer Geographic Bounding Box
     * @type {null}
     */
    get wmsGeographicBoundingBox() {
        return this._mapItemState.wmsGeographicBoundingBox;
    }

    /**
     * WMS layer Bounding Boxes
     * @type {Array}
     */
    get wmsBoundingBoxes() {
        return this._mapItemState.wmsBoundingBoxes;
    }

    /**
     * WMS Minimum scale denominator
     * If the minimum scale denominator is not defined: -1 is returned
     * If the WMS layer is a group, the minimum scale denominator is -1 if only one layer
     * minimum scale denominator is not defined else the smallest layer minimum scale denominator
     * in the group
     * @type {number}
     */
    get wmsMinScaleDenominator() {
        return this._mapItemState.wmsMinScaleDenominator;
    }

    /**
     * WMS layer maximum scale denominator
     * If the maximum scale denominator is not defined: -1 is returned
     * If the WMS layer is a group, the maximum scale denominator is the largest of the layers in the group
     * @type {number}
     */
    get wmsMaxScaleDenominator() {
        return this._mapItemState.wmsMaxScaleDenominator;
    }

    /**
     * Map item is checked
     * @type {boolean}
     */
    get checked() {
        return this._mapItemState.checked;
    }

    /**
     * Set map item is checked
     * @type {boolean}
     */
    set checked(val) {
        this._mapItemState.checked = val;
    }

    /**
     * Map item is visible
     * It depends on the parent visibility
     * @type {boolean}
     */
    get visibility() {
        return this._mapItemState.visibility;
    }

    /**
     * Map item opacity
     * @type {number}
     */
    get opacity() {
        return this._mapItemState.opacity;
    }

    /**
     * Set map item opacity
     * @type {number}
     */
    set opacity(val) {
        this._mapItemState.opacity = val;
    }

    /**
     * Lizmap layer config
     * @type {null}
     */
    get layerConfig() {
        return this._mapItemState.layerConfig;
    }

    /**
     * External map item state
     * @type {?ExternalMapItemState}
     */
    get mapItemState() {
        return this._mapItemState;
    }

    /**
     * Layer tree item is expanded
     * @type {boolean}
     */
    get expanded() {
        return this._expanded;
    }

    /**
     * Set layer tree item is expanded
     * @type {boolean}
     */
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
     * @returns {boolean} the calculated visibility
     */
    calculateVisibility() {
        return this._mapItemState.calculateVisibility();
    }

    /**
     * Get item visibility taking care of this.visibility and scale
     * @param {number} scaleDenominator the scale denominator for which the visibility has to be evaluated
     * @returns {boolean} the item visibility
     */
    isVisible(scaleDenominator) {
        if (this.type === 'group') {
            return this.visibility;
        }

        if(this._mapItemState.wmsMinScaleDenominator !== undefined && this._mapItemState.wmsMaxScaleDenominator !== undefined){
            return this.visibility && this._mapItemState.wmsMinScaleDenominator < scaleDenominator
            && scaleDenominator < this._mapItemState.wmsMaxScaleDenominator;
        }
        return this.visibility;
    }
}

/**
 * Class representing an external layer tree group
 * @class
 * @augments ExternalLayerTreeItemState
 */
export class ExternalLayerTreeGroupState extends ExternalLayerTreeItemState {

    /**
     * Instantiate an external layer tree group
     * @param {ExternalMapGroupState} mapGroupState      - the external map group state
     * @param {LayerTreeGroupState}   [parentGroupState] - the parent layer tree group
     */
    constructor(mapGroupState, parentGroupState) {
        if (!(mapGroupState instanceof ExternalMapGroupState)) {
            throw TypeError('The map group state has to be an external map group state!');
        }
        super(mapGroupState);
        this._parentGroupState = null;

        this._expanded = true;

        if (parentGroupState instanceof LayerTreeGroupState
            && parentGroupState.type == 'group') {
            this._parentGroupState = parentGroupState;
        }
        this._items = [];
        mapGroupState.addListener(
            evtLayer => {
                const extLayer = mapGroupState.children[0];
                if (evtLayer.childName != extLayer.name)
                    return;
                const extTreeLayer = new OlTreeLayerState(extLayer, this);
                extTreeLayer.addListener(this.dispatch.bind(this), extTreeLayer.type+'.visibility.changed');
                extTreeLayer.addListener(this.dispatch.bind(this), extTreeLayer.type+'.opacity.changed');
                extTreeLayer.addListener(this.dispatch.bind(this), extTreeLayer.type+'.wmsTitle.changed');
                extTreeLayer.addListener(this.dispatch.bind(this), extTreeLayer.type+'.icon.changed');
                this._items.unshift(extTreeLayer);
            }, ['ol-layer.added']
        );
        mapGroupState.addListener(
            evtLayer => {
                const layers = this._items
                    .map((item, index) => {return {'name': item.name,'index':index}})
                    .filter((item) => item.name == evtLayer.childName);
                if (layers.length == 0) {
                    return;
                }
                const extTreeLayer = this._items.at(layers[0].index);
                extTreeLayer.removeListener(this.dispatch.bind(this), extTreeLayer.type+'.visibility.changed');
                extTreeLayer.removeListener(this.dispatch.bind(this), extTreeLayer.type+'.opacity.changed');
                extTreeLayer.removeListener(this.dispatch.bind(this), extTreeLayer.type+'.wmsTitle.changed');
                extTreeLayer.removeListener(this.dispatch.bind(this), extTreeLayer.type+'.icon.changed');
                this._items.splice(layers[0].index, 1);
            }, ['ol-layer.removed']
        );
        mapGroupState.addListener(this.dispatch.bind(this), 'ol-layer.added');
        mapGroupState.addListener(this.dispatch.bind(this), 'ol-layer.removed');
    }
    /**
     * Children items count
     * @type {number}
     */
    get childrenCount() {
        return this._items.length;
    }

    /**
     * Children items
     * @type {OlTreeLayerState[]}
     */
    get children() {
        return [...this._items];
    }

    /**
     * Iterate through children items
     * @generator
     * @yields {OlTreeLayerState} The next child item
     */
    *getChildren() {
        for (const item of this._items) {
            yield item;
        }
    }
}

/**
 * Class representing an OpenLayers tree layer state
 * @class
 * @augments ExternalLayerTreeItemState
 */
export class OlTreeLayerState extends ExternalLayerTreeItemState {

    /**
     * Instantiate an OpenLayers tree layer
     * @param {OlMapLayerState}             mapLayerState      - the OpenLayers map layer state
     * @param {ExternalLayerTreeGroupState} [parentGroupState] - the parent layer tree group
     */
    constructor(mapLayerState, parentGroupState) {
        if (!(mapLayerState instanceof OlMapLayerState)) {
            throw TypeError('The map layer state has to be an OpenLayers map layer state!');
        }
        if (!(parentGroupState instanceof ExternalLayerTreeGroupState)) {
            throw TypeError('The parent layer tree group has to be an external layer tree group state!');
        }
        super(mapLayerState);
        mapLayerState.addListener(this.dispatch.bind(this), this.type+'.visibility.changed');
        mapLayerState.addListener(this.dispatch.bind(this), this.type+'.opacity.changed');
        mapLayerState.addListener(this.dispatch.bind(this), this.type+'.wmsTitle.changed');
        mapLayerState.addListener(this.dispatch.bind(this), this.type+'.icon.changed');
        this._parentGroupState = parentGroupState;

        this._expanded = true;
    }

    /**
     * layer icon
     * @type {string}
     */
    get icon() {
        return this._mapItemState.icon;
    }

    /**
     * layer icon
     * @type {string}
     */
    set icon(base64icon) {
        this._mapItemState.icon = base64icon;
    }
}
