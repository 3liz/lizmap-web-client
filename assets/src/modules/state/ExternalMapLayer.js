
import EventDispatcher from './../../utils/EventDispatcher.js';
import { convertBoolean, convertNumber } from './../utils/Converters.js';
import { base64svg, base64svgOlLayer, base64png } from './SymbologyIcons.js';

/**
 * Class representing an external map item state
 * @class
 * @augments EventDispatcher
 */
export class ExternalMapItemState extends EventDispatcher {

    /**
     * Instantiate an external map item state
     * @param {string} name - the external map item name
     */
    constructor(name) {
        super();
        this._name = name;
        this._type = 'ext';
        this._level = -1;
        this._wmsName = null;
        this._wmsTitle = name;
        this._wmsGeographicBoundingBox = null;
        this._wmsBoundingBoxes = [];
        this._wmsMinScaleDenominator = undefined;
        this._wmsMaxScaleDenominator = undefined;
        this._checked = true;
        this._visibility = true;
        this._opacity = 1;
    }

    /**
     * Map item name
     * @type {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Map item type
     * @type {string}
     */
    get type() {
        return this._type;
    }

    /**
     * Map item level
     * @type {number}
     */
    get level() {
        return this._level;
    }

    /**
     * WMS item name
     * @type {null}
     */
    get wmsName() {
        return this._wmsName;
    }

    /**
     * WMS item title
     * @type {string}
     */
    get wmsTitle() {
        return this._wmsTitle;
    }

    /**
     * Set WMS item title
     * @type {string}
     */
    set wmsTitle(title) {
        const oldTitle = this._wmsTitle;
        this._wmsTitle = title;
        if (oldTitle != this.wmsTitle) {
            this.dispatch({
                type: this.type + '.wmsTitle.changed',
                name: this.name,
                wmsTitle: this.wmsTitle,
            });
        }
    }

    /**
     * WMS item Geographic Bounding Box
     * @type {null}
     */
    get wmsGeographicBoundingBox() {
        return this._wmsGeographicBoundingBox;
    }

    /**
     * WMS item Bounding Boxes
     * @type {Array}
     */
    get wmsBoundingBoxes() {
        return this._wmsBoundingBoxes;
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
        return this._wmsMinScaleDenominator;
    }

    /**
     * WMS Maximum scale denominator
     * If the maximum scale denominator is not defined: -1 is returned
     * If the WMS layer is a group, the maximum scale denominator is the largest of the layers in the group
     * @type {number}
     */
    get wmsMaxScaleDenominator() {
        return this._wmsMaxScaleDenominator;
    }

    /**
     * Map item is checked
     * @type {boolean}
     */
    get checked() {
        return this._checked;
    }

    /**
     * Set map item is checked
     * @type {boolean}
     */
    set checked(val) {
        const newVal = convertBoolean(val);
        // Set new value
        this._checked = newVal;
        this.calculateVisibility();
    }

    /**
     * Map item is visible
     * It depends on the parent visibility
     * @type {boolean}
     */
    get visibility() {
        return this._visibility;
    }

    /**
     * Map item opacity
     * @type {number}
     */
    get opacity() {
        return this._opacity;
    }

    /**
     * Set map item opacity
     * @type {number}
     */
    set opacity(val) {
        const newVal = convertNumber(val);

        if (newVal < 0 || newVal > 1) {
            throw new TypeError('Opacity must be in [0-1] interval!');
        }

        // No changes
        if (this._opacity === newVal) {
            return;
        }
        this._opacity = newVal;

        this.dispatch({
            type: this.type + '.opacity.changed',
            name: this.name,
            opacity: this.opacity,
        });
    }

    /**
     * Lizmap layer config
     * @type {null}
     */
    get layerConfig() {
        return null;
    }

    /**
     * Lizmap layer item state
     * @type {null}
     */
    get itemState() {
        return null;
    }

    /**
     * Calculate and save visibility
     * @returns {boolean} the calculated visibility
     */
    calculateVisibility() {
        // Save visibility before changing
        const oldVisibility = this._visibility;
        if (this._parentGroup.visibility) {
            this._visibility = this._checked;
        } else {
            this._visibility = false;
        }
        // Only dispatch event if visibility has changed
        if (oldVisibility !== null && oldVisibility != this.visibility) {
            this.dispatch({
                type: this.type+'.visibility.changed',
                name: this.name,
                visibility: this.visibility,
            });
        }
        return this._visibility;
    }
}

/**
 * Class representing an external map group state
 * @class
 * @augments ExternalMapItemState
 */
export class ExternalMapGroupState extends ExternalMapItemState {

    /**
     * Instantiate an external map group state
     * @param {string} name - the external map group name
     */
    constructor(name) {
        super();
        this._type = 'ext-group'
        this._name = name;
        this._level = 1;
        this._wmsName = null;
        this._wmsTitle = name;
        this._checked = true;
        this._visibility = true;
        this._opacity = 1;
        this._items = [];
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
     * @type {OlMapLayerState[]}
     */
    get children() {
        return [...this._items];
    }

    /**
     * Iterate through children items
     * @generator
     * @yields {OlMapLayerState} The next child item
     */
    *getChildren() {
        for (const item of this._items) {
            yield item;
        }
    }

    /**
     * Calculate and save visibility
     * @returns {boolean} the calculated visibility
     */
    calculateVisibility() {
        // Save visibility before changing
        const oldVisibility = this._visibility;
        this._visibility = this._checked;
        if (!this._visibility) {
            for (const child of this.getChildren()) {
                if (!child.checked) {
                    continue;
                }
                child.calculateVisibility();
            }
        }
        // Only dispatch event if visibility has changed
        if (oldVisibility !== null && oldVisibility != this.visibility) {
            this.dispatch({
                type: this.type+'.visibility.changed',
                name: this.name,
                visibility: this.visibility,
            });
        }
        return this._visibility;
    }

    /**
     * Get layer or group item by its name
     * @param {string} name - the layer name
     * @param {object} olLayer - the OpenLayers layer
     * @returns {OlMapLayerState} The MapLayerState or MapGroupState associated to the name
     */
    addOlLayer(name, olLayer) {
        // Checks that name is unknown
        const layers = this._items
            .map((item, index) => {return {'name': item.name,'index':index}})
            .filter((item) => item.name == name);
        if (layers.length != 0) {
            throw RangeError('The layer name `'+ name +'` is already used by a child!');
        }
        // Create and add OpenLayers Map Layer
        const olMapLayer = new OlMapLayerState(name, olLayer, this);
        olMapLayer.addListener(this.dispatch.bind(this), olMapLayer.type+'.visibility.changed');
        olMapLayer.addListener(this.dispatch.bind(this), olMapLayer.type+'.opacity.changed');
        olMapLayer.addListener(this.dispatch.bind(this), olMapLayer.type+'.wmsTitle.changed');
        olMapLayer.addListener(this.dispatch.bind(this), olMapLayer.type+'.icon.changed');
        this._items.unshift(olMapLayer);
        this.dispatch({
            type: 'ol-layer.added',
            name: this.name,
            childName: name,
            childrenCount: this.childrenCount,
        });
        return olMapLayer;
    }

    /**
     * Remove OpenLayers layer
     * @param {string} name - the OpenLayers layer name to remove
     * @returns {OlMapLayerState|undefined} The removed OpenLayers layer or undefined if the name is unknown
     */
    removeOlLayer(name) {
        const layers = this._items
            .map((item, index) => {return {'name': item.name,'index':index}})
            .filter((item) => item.name == name);
        if (layers.length == 0) {
            return undefined;
        }
        const olMapLayer = this._items.at(layers[0].index);
        olMapLayer.removeListener(this.dispatch.bind(this), olMapLayer.type+'.visibility.changed');
        olMapLayer.removeListener(this.dispatch.bind(this), olMapLayer.type+'.opacity.changed');
        olMapLayer.removeListener(this.dispatch.bind(this), olMapLayer.type+'.wmsTitle.changed');
        olMapLayer.removeListener(this.dispatch.bind(this), olMapLayer.type+'.icon.changed');
        this._items.splice(layers[0].index, 1);
        this.dispatch({
            type: 'ol-layer.removed',
            name: this.name,
            childName: name,
            childrenCount: this.childrenCount,
        });
        return olMapLayer;
    }

    /**
     * Remove all OpenLayers layer
     * @returns {boolean} The children list is empty
     */
    clean() {
        this._items
            .map((item) => item.name)
            .reverse()
            .forEach((name) => this.removeOlLayer(name));
        return this._items.length == 0;
    }
}

/**
 * Class representing an OpenLayers map layer state
 * @class
 * @augments ExternalMapItemState
 */
export class OlMapLayerState extends ExternalMapItemState {

    /**
     * Instantiate an OpenLayers map layer state
     * @param {string}                name - the OpenLayers map layer name
     * @param {object}                olLayer - the OpenLayers layer
     * @param {ExternalMapGroupState} parentGroup - the parent external map group
     */
    constructor(name, olLayer, parentGroup) {
        if (!(parentGroup instanceof ExternalMapGroupState)) {
            throw TypeError('The parent of an OpenLayers map layer state has to be an external map group!');
        }
        super();
        const wmsTitle = olLayer.get('wmsTitle');
        this._type = 'ol-layer'
        this._name = name;
        this._olLayer = olLayer;
        this._icon = base64svg + base64svgOlLayer;
        this._parentGroup = parentGroup;
        this._level = 2;
        this._wmsName = null;
        this._wmsTitle = wmsTitle ? wmsTitle : name;
        this._checked = true;
        this._visibility = true;
        this._opacity = 1;

        this.olLayer.setVisible(this.visibility);
    }

    /**
     * The OpenLayers layer
     * @type {string}
     */
    get olLayer() {
        return this._olLayer;
    }

    /**
     * Map item opacity
     * @type {number}
     */
    get opacity() {
        return this._opacity;
    }

    /**
     * Set map item opacity
     * @type {number}
     */
    set opacity(val) {
        const newVal = convertNumber(val);

        if (newVal < 0 || newVal > 1) {
            throw new TypeError('Opacity must be in [0-1] interval!');
        }

        // No changes
        if (this._opacity === newVal) {
            return;
        }
        this._opacity = newVal;
        this.olLayer.setOpacity(newVal);

        this.dispatch({
            type: this.type + '.opacity.changed',
            name: this.name,
            opacity: this.opacity,
        });
    }

    /**
     * Map layer icon
     * @type {string}
     */
    get icon() {
        return this._icon;
    }

    /**
     * Map layer icon
     * @type {string}
     */
    set icon(base64icon) {
        if (!base64icon.startsWith(base64png)
            && !base64icon.startsWith(base64svg)) {
            throw new TypeError(`base64icon value does not start with '${base64png}' or '${base64svg}'! The value is '${base64icon}'!`);
        }
        const oldIcon = this._icon;
        this._icon = base64icon;
        if (oldIcon != this.icon) {
            this.dispatch({
                type: this.type + '.icon.changed',
                name: this.name,
                icon: this.icon,
            });
        }
    }

    /**
     * Calculate and save visibility
     * @returns {boolean} the calculated visibility
     */
    calculateVisibility() {
        // Save visibility before changing
        const oldVisibility = this._visibility;
        if (this._parentGroup.visibility) {
            this._visibility = this._checked;
        } else {
            this._visibility = false;
        }
        // Only dispatch event if visibility has changed
        if (oldVisibility !== null && oldVisibility != this.visibility) {
            this.olLayer.setVisible(this.visibility);
            this.dispatch({
                type: this.type+'.visibility.changed',
                name: this.name,
                visibility: this.visibility,
            });
        }
        return this._visibility;
    }
}
