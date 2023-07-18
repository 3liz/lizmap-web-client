import EventDispatcher from './../../utils/EventDispatcher.js';
import { ValidationError } from './../Errors.js';
import { convertBoolean, convertNumber } from './../utils/Converters.js';
import { LayerGeographicBoundingBoxConfig, LayerTreeGroupConfig } from './../config/LayerTree.js';
import { buildLayerSymbology, LayerSymbolsSymbology } from './Symbology.js';

/**
 * Class representing a layer item state: could be group, vector or raster layer
 * @class
 * @augments EventDispatcher
 */
export class LayerItemState extends EventDispatcher {

    /**
     * Creating a layer item state
     *
     * @param {String} type                          - the layer item type
     * @param {LayerTreeItemConfig} layerTreeItemCfg - the layer item config
     * @param {LayerItemState}      [parentGroup]    - the parent layer group
     */
    constructor(type, layerTreeItemCfg, parentGroup) {
        super();
        this._type = type
        this._layerTreeItemCfg = layerTreeItemCfg;
        this._parentGroup = null;
        if (parentGroup instanceof LayerItemState
            && parentGroup.type == 'group') {
            this._parentGroup = parentGroup;
            this._parentGroup.addListener(
                this.calculateVisibility.bind(this),
                this._parentGroup.mapType+'.visibility.changed'
            );
        }
        this._geographicBoundingBox = null;
        this._minScaleDenominator = null;
        this._maxScaleDenominator = null;
        this._checked = this._parentGroup == null ? true : false;
        this._visibility = null;
        this._opacity = 1;
        this._inGroupAsLayer = (this._parentGroup !== null
            && (this._parentGroup.groupAsLayer || this._parentGroup.isInGroupAsLayer)) ? true : false;
    }

    /**
     * Item name
     *
     * @type {String}
     **/
    get name() {
        return this._layerTreeItemCfg.name;
    }

    /**
     * Item type
     *
     * @type {String}
     **/
    get type() {
        return this._type;
    }

    /**
     * Item map type
     *
     * @type {String}
     **/
    get mapType() {
        return this._type;
    }

    /**
     * The layer tree item level
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
     * WMS layer abstract
     *
     * @type {?String}
     **/
    get wmsAbstract() {
        return this._layerTreeItemCfg.wmsAbstract;
    }

    /**
     * Item unique id
     *
     * @type {?String}
     **/
    get id() {
        if (this.layerConfig == null) {
            return null;
        }
        return this.layerConfig.id;
    }

    /**
     * Item title
     *
     * @type {?String}
     **/
    get title() {
        if (this.layerConfig == null) {
            return null;
        }
        return this.layerConfig.title;
    }

    /**
     * Item abstract
     *
     * @type {?String}
     **/
    get abstract() {
        if (this.layerConfig == null) {
            return null;
        }
        return this.layerConfig.abstract;
    }

    /**
     * Item link
     *
     * @type {?String}
     **/
    get link() {
        if (this.layerConfig == null) {
            return null;
        }
        return this.layerConfig.link;
    }

    /**
     * WMS layer Geographic Bounding Box
     *
     * @type {?LayerGeographicBoundingBoxConfig}
     **/
    get wmsGeographicBoundingBox() {
        if (this.layerConfig == null) {
            return null;
        }
        if ( this._layerTreeItemCfg.type == 'group') {
            if (this._geographicBoundingBox == null) {
                let geographicBoundingBox = null;
                for (const treeLayerCfg of this._layerTreeItemCfg.findTreeLayerConfigs()) {
                    if (geographicBoundingBox == null) {
                        geographicBoundingBox = [...treeLayerCfg.wmsGeographicBoundingBox];
                    } else {
                        if (geographicBoundingBox[0] > treeLayerCfg.wmsGeographicBoundingBox[0]) {
                            geographicBoundingBox[0] = treeLayerCfg.wmsGeographicBoundingBox[0]
                        }
                        if (geographicBoundingBox[1] > treeLayerCfg.wmsGeographicBoundingBox[1]) {
                            geographicBoundingBox[1] = treeLayerCfg.wmsGeographicBoundingBox[1]
                        }
                        if (geographicBoundingBox[2] < treeLayerCfg.wmsGeographicBoundingBox[2]) {
                            geographicBoundingBox[2] = treeLayerCfg.wmsGeographicBoundingBox[2]
                        }
                        if (geographicBoundingBox[3] < treeLayerCfg.wmsGeographicBoundingBox[3]) {
                            geographicBoundingBox[3] = treeLayerCfg.wmsGeographicBoundingBox[3]
                        }
                    }
                }
                this._geographicBoundingBox = new LayerGeographicBoundingBoxConfig(...geographicBoundingBox);
            }
            return this._geographicBoundingBox;
        }
        return this._layerTreeItemCfg.wmsGeographicBoundingBox;
    }

    /**
     * WMS layer Bounding Boxes
     *
     * @type {LayerBoundingBoxConfig[]}
     **/
    get wmsBoundingBoxes() {
        if (this.layerConfig == null) {
            return [];
        }
        const geogbbox = this.wmsGeographicBoundingBox;
        if (geogbbox == null) {
            return [];
        }
        let bboxes = [...this._layerTreeItemCfg.wmsBoundingBoxes];
        for (let bbox of bboxes) {
            if (bbox.crs != 'EPSG:4326') {
                continue;
            }
            bbox[0] = geogbbox.west;
            bbox[1] = geogbbox.south;
            bbox[2] = geogbbox.east;
            bbox[3] = geogbbox.north;
        }
        return bboxes;
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
            if (this._minScaleDenominator == null) {
                let minScaleDenominator = -1;
                for (const treeLayerCfg of this._layerTreeItemCfg.findTreeLayerConfigs()) {
                    const treeLayerMinScaleDenominator = treeLayerCfg.wmsMinScaleDenominator;
                    if (treeLayerMinScaleDenominator < 0) {
                        this._minScaleDenominator = -1;
                        return -1;
                    }
                    if (minScaleDenominator == -1) {
                        minScaleDenominator = treeLayerMinScaleDenominator;
                    } else if (treeLayerMinScaleDenominator < minScaleDenominator) {
                        minScaleDenominator = treeLayerMinScaleDenominator;
                    }
                }
                this._minScaleDenominator = minScaleDenominator;
            }
            return this._minScaleDenominator;
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
            if (this._maxScaleDenominator == null) {
                let maxScaleDenominator = -1;
                for (const treeLayerCfg of this._layerTreeItemCfg.findTreeLayerConfigs()) {
                    const treeLayerMaxScaleDenominator = treeLayerCfg.wmsMaxScaleDenominator;
                    if (treeLayerMaxScaleDenominator < 0) {
                        this._maxScaleDenominator = -1;
                        return -1;
                    }
                    if (maxScaleDenominator == -1) {
                        maxScaleDenominator = treeLayerMaxScaleDenominator;
                    } else if (treeLayerMaxScaleDenominator > maxScaleDenominator) {
                        maxScaleDenominator = treeLayerMaxScaleDenominator;
                    }
                }
                this._maxScaleDenominator = maxScaleDenominator;
            }
            return this._maxScaleDenominator;
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
        // Set new value
        this._checked = newVal;
        // Propagation to parent if checked
        if (this._checked && this._parentGroup != null && !this.isInGroupAsLayer) {
            this._parentGroup.checked = newVal;
            // If the parent is mutually exclusive, unchecked other layer
            if (this._parentGroup.mutuallyExclusive) {
                for (const child of this._parentGroup.getChildren()) {
                    if (child.name === this.name) {
                        continue;
                    }
                    child.checked = false;
                }
            }
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
        if (this._visibility !== null) {
            return this._visibility;
        }
        return this.calculateVisibility();
    }

    /**
     * Item symbology
     *
     * @type {?(LayerIconSymbology|LayerSymbolsSymbology|LayerGroupSymbology)}
     **/
    get symbology() {
        return this._symbology;
    }

    /**
     * Update Item symbology
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
                    if (self.visibility != self.symbology.legendOn) {
                        self.calculateVisibility();
                    }
                }, 'symbol.checked.changed');
            }
        }
        this.dispatch({
            type: this.mapType + '.symbology.changed',
            name: this.name,
        });
    }

    /*
     * Layer tree item opacity
     *
     * @type {Number}
     **/
    get opacity() {
        return this._opacity;
    }

    /**
     * Set layer tree item opacity
     *
     * @type {Number}
     **/
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
     * The item is in a group as layer
     *
     * @type {Boolean}
     **/
    get isInGroupAsLayer() {
        return this._inGroupAsLayer;
    }

    /**
     * The layer as base layer activation
     *
     * @type {Boolean}
     **/
    get baseLayer() {
        if (this.layerConfig == null) {
            return false;
        }
        return this.layerConfig.baseLayer;
    }

    /**
     * The layer display in legend activation
     *
     * @type {Boolean}
     **/
    get displayInLegend() {
        if (this.layerConfig == null) {
            return true;
        }
        if (this.isInGroupAsLayer) {
            return false;
        }
        return this.layerConfig.displayInLegend;
    }

    /**
     * The layer image format
     *
     * @type {?String}
     **/
    get imageFormat() {
        if (this.layerConfig == null) {
            return null;
        }
        return this.layerConfig.imageFormat;
    }

    /**
     * The layer singleTile activation
     *
     * @type {Boolean}
     **/
    get singleTile() {
        if (this.layerConfig == null) {
            return true;
        }
        return this.layerConfig.singleTile;
    }

    /**
     * The layer cached activation
     *
     * @type {Boolean}
     **/
    get cached() {
        if (this.layerConfig == null) {
            return false;
        }
        return this.layerConfig.cached;
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
        const oldVisibility = this._visibility;
        // if the item has no parent item like root
        // it is visible
        if (this._parentGroup == null) {
            this._visibility = true;
        }
        // if the item is in a group as layer
        // the visibility is the same as the parent
        // and the child has to be updated
        else if (this.isInGroupAsLayer) {
            this._visibility = this._parentGroup.visibility;
            if (this.type == 'group') {
                // Only update child visibility if visibility has changed
                if (oldVisibility != this.visibility) {
                    for (const child of this.getChildren()) {
                        child.calculateVisibility();
                    }
                }
            }
            return this._visibility;
        }
        // if the parent layer tree group is visible
        // the visibility depends if the layer tree item is checked
        // else the layer tree item is not visible
        else if (this._parentGroup.visibility) {
            this._visibility = this._checked;
        } else {
            this._visibility = false;
        }
        if (!this._visibility && this.type == 'group') {
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
                type: this.mapType+'.visibility.changed',
                name: this.name,
                visibility: this.visibility,
            });
        }
        return this._visibility;
    }
}

/**
 * Class representing a layer: could be vector or raster layer
 * @class
 * @augments LayerItemState
 */
export class LayerLayerState extends LayerItemState {

    /**
     * Creating a layer state
     *
     * @param {LayerTreeItemConfig} layerTreeItemCfg - the layer item config
     * @param {Number[]}            layersOrder      - the layers order
     * @param {LayerItemState}      [parentGroup]    - the parent layer group
     */
    constructor(layerTreeItemCfg, layersOrder, parentMapGroup) {
        super('layer', layerTreeItemCfg, parentMapGroup);
        if (this.layerConfig == null) {
            throw new TypeError('A LayerLayerState could not be build without a LayerConfig! The layer `'+ this.name +'` could not be constructed!');
        }
        if (this.layerConfig.layerType != null) {
            this._layerType = this.layerConfig.layerType;
        } else if (this.layerConfig.geometryType != null) {
            this._layerType = 'vector';
        } else {
            this._layerType = 'raster';
        }
        if (this.layerConfig.toggled) {
            this._checked = true;
        }
        this._layerOrder = layersOrder.indexOf(this.name);
        // set default style
        this._wmsSelectedStyleName = this.wmsStyles[0].wmsName;
        // set symbology to null
        this._symbology = null;
    }

    /**
     * Layer type
     *
     * @type {String}
     **/
    get layerType() {
        return this._layerType;
    }

    /**
     * Layer type from top to bottom
     *
     * @type {Number}
     **/
    get layerOrder() {
        return this._layerOrder;
    }

    /**
     * The layer extent
     *
     * @type {Extent}
     **/
    get extent() {
        return this.layerConfig.extent;
    }

    /**
     * The layer crs
     *
     * @type {String}
     **/
    get crs() {
        return this.layerConfig.crs;
    }

    /**
     * Layer popup activated
     *
     * @type {Boolean}
     **/
    get popup() {
        return this.layerConfig.popup;
    }

    /**
     * The layer popup source
     *
     * @type {String}
     **/
    get popupSource() {
        return this.layerConfig.popupSource;
    }

    /**
     * The layer popup template
     *
     * @type {String}
     **/
    get popupTemplate() {
        return this.layerConfig.popupTemplate;
    }

    /**
     * The layer popup max features
     *
     * @type {Number}
     **/
    get popupMaxFeatures() {
        return this.layerConfig.popupMaxFeatures;
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
        return this._layerTreeItemCfg.wmsStyles;
    }

    /**
     * WMS layer attribution
     *
     * @type {AttributionConfig}
     **/
    get wmsAttribution() {
        return this._layerTreeItemCfg.wmsAttribution;
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
            params = Object.assign(params, this.symbology.wmsParameters(this.wmsName))
        }
        return params;
    }

    /**
     * Calculate and save visibility
     *
     * @returns {boolean} the calculated visibility
     **/
    calculateVisibility() {
        if (this.symbology instanceof LayerSymbolsSymbology
            && !this.symbology.legendOn) {
            const oldVisibility = this._visibility;
            this._visibility = false;
            // Only dispatch event if visibility has changed
            if (oldVisibility !== null && oldVisibility != this.visibility) {
                this.dispatch({
                    type: this.type+'.visibility.changed',
                    name: this.name,
                    visibility: this.visibility,
                })
            }
            return false;
        }
        return super.calculateVisibility();
    }
}

/**
 * Class representing a vector layer
 * @class
 * @augments LayerLayerState
 */
export class LayerVectorState extends LayerLayerState {

    /**
     * Creating a vector layer state
     *
     * @param {LayerTreeItemConfig} layerTreeItemCfg - the layer item config
     * @param {Number[]}            layersOrder      - the layers order
     * @param {LayerItemState}      [parentGroup]    - the parent layer group
     */
    constructor(layerTreeItemCfg, layersOrder, parentMapGroup) {
        super(layerTreeItemCfg, layersOrder, parentMapGroup)
        if (this.layerType != 'vector') {
            throw new TypeError('A LayerVectorState could not be build for `'+this.layerType+'` type ! The layer `'+ this.name +'` could not be constructed!');
        }
        if (!this.isSpatial) {
            this._checked = false;
        }
        this._selectedFeatures = [];
        this._selectionToken = null;
        this._expressionFilter = null;
        this._filterToken = null;
    }


    /**
     * Layer tree item is checked
     *
     * @type {Boolean}
     **/
    get checked() {
        return super.checked;
    }

    /**
     * Set layer tree item is checked
     *
     * @type {Boolean}
     **/
    set checked(val) {
        if (!this.isSpatial) {
            const newVal = convertBoolean(val);
            // Set new value
            this._checked = newVal;
            return;
        }
        super.checked = val;
    }

    /**
     * WMS layer Geographic Bounding Box
     *
     * @type {?LayerGeographicBoundingBoxConfig}
     **/
    get wmsGeographicBoundingBox() {
        if (!this.isSpatial) {
            return null;
        }
        return this._layerTreeItemCfg.wmsGeographicBoundingBox;
    }

    /**
     * The layer extent
     *
     * @type {?Extent}
     **/
    get extent() {
        if (!this.isSpatial) {
            return null;
        }
        return this.layerConfig.extent;
    }

    /**
     * The layer is spatial
     *
     * @type {Boolean}
     **/
    get isSpatial() {
        if (this.layerConfig.geometryType == 'none'
            || this.layerConfig.geometryType == 'unknown') {
            return false;
        }
        return true;
    }

    /**
     * The layer geometry type
     *
     * @type {String}
     **/
    get geometryType() {
        return this.layerConfig.geometryType;
    }

    /**
     * The layer popup display children activation
     *
     * @type {Boolean}
     **/
    get popupDisplayChildren() {
        return this.layerConfig.popupDisplayChildren;
    }

    /**
     * Vector layer has selected features
     * The selected features is not empty
     *
     * @type {Boolean}
     **/
    get hasSelectedFeatures() {
        return (this._selectedFeatures.length !== 0);
    }

    /**
     * Vector layer selection
     *
     * @type {?String}
     **/
    get selectedFeatures() {
        return [...this._selectedFeatures];
    }

    /**
     * Update vector layer selection
     *
     * @param {?String} select - The selection
     **/
    set selectedFeatures(selectIds) {
        // Validate selectIds
        if (selectIds != null && !(selectIds instanceof Array)) {
            throw new ValidationError('Selection Ids could only be null or an array!');
        }
        const oldSelectIds = this._selectedFeatures;
        if (selectIds instanceof Array
            && oldSelectIds.every(item => selectIds.includes(item))
            && selectIds.every(item => oldSelectIds.includes(item))) {
            // The arrays are the same
            return;
        }
        // Reset the selection token when selected features changed
        const dispatchTokenChanged = (this._selectionToken !== null);
        this._selectionToken = null;
        if (selectIds === null || selectIds.length == 0) {
            // set selected features to an empty array
            this._selectedFeatures = [];
        } else {
            this._selectedFeatures = selectIds;
        }
        this.dispatch({
            type: 'layer.selection.changed',
            name: this.name,
            selectedFeatures: this.selectedFeatures,
        })
        if (dispatchTokenChanged) {
            this.dispatch({
                type: 'layer.selection.token.changed',
                name: this.name,
                selectedFeatures: this.selectedFeatures,
                selectionToken: this.selectionToken,
            })
        }
    }

    /**
     * Vector layer selection token
     *
     * @type {?String}
     **/
    get selectionToken() {
        return this._selectionToken;
    }

    /**
     * Update vector layer selection token
     *
     * @param {?String} token - The selection token
     **/
    set selectionToken(token) {
        // Validate selection token
        if (!(token == null || typeof(token) == 'string' || (token != null && typeof(token) == 'object'))) {
            throw new ValidationError('Selection token could only be null, a string or an object!');
        }
        const oldToken = this._selectionToken;
        if (token != null && typeof(token) == 'object') {
            if (!token.hasOwnProperty('token') || !token.hasOwnProperty('selectedFeatures')) {
                throw new ValidationError('If the expression filter token is an object, it has to have `token` and `selectedFeatures` properties!');
            }
            // Validate selectedFeatures
            if (token.selectedFeatures != null && !(token.selectedFeatures instanceof Array)) {
                throw new ValidationError('Selection Ids could only be null or an array!');
            }
            // Reset selectedFeatures and selectionToken
            if (token.selectedFeatures === null || token.selectedFeatures.length == 0) {
                this.selectedFeatures = token.selectedFeatures;
                return;
            }

            const selectIds = token.selectedFeatures;
            const oldSelectIds = this._selectedFeatures;
            if (this._selectionToken === token.token
                && oldSelectIds.every(item => selectIds.includes(item))
                && selectIds.every(item => oldSelectIds.includes(item))) {
                return;
            } else {
                if (token.token == null || token.token === '') {
                    // Set filter token to null and not a string
                    this._selectionToken = null;
                } else {
                    this._selectionToken = token.token;
                }
                if (!(oldSelectIds.every(item => selectIds.includes(item))
                    && selectIds.every(item => oldSelectIds.includes(item)))) {
                    this._selectedFeatures = token.selectedFeatures;
                    this.dispatch({
                        type: 'layer.selection.changed',
                        name: this.name,
                        selectedFeatures: this.selectedFeatures,
                    })
                }
            }
        } else {
            if (this._selectionToken === token) {
                return;
            }
            if (token == null || token === '') {
                // Set filter token to null and not a string
                this._selectionToken = null;
            } else {
                this._selectionToken = token;
            }
        }
        if (oldToken !== this._selectionToken) {
            this.dispatch({
                type: 'layer.selection.token.changed',
                name: this.name,
                selectedFeatures: this.selectedFeatures,
                selectionToken: this.selectionToken,
            })
        }
    }

    /**
     * Vector layer is filtered
     * The expression filter is not null
     *
     * @type {Boolean}
     **/
    get isFiltered() {
        return (this._expressionFilter !== null && this._expressionFilter !== '');
    }

    /**
     * Vector layer expression filter
     *
     * @type {?String}
     **/
    get expressionFilter() {
        return this._expressionFilter;
    }

    /**
     * Update vector layer expression filter
     *
     * @param {?String} exp - The QGIS expression
     **/
    set expressionFilter(exp) {
        if (this._expressionFilter === exp) {
            return;
        }
        // Validate expression
        if (exp != null && typeof(exp) != 'string') {
            throw new ValidationError('Expression filter could only be null or a string!');
        }
        // Reset the expression filter token when selected expression filter changed
        const dispatchTokenChanged = (this._filterToken !== null);
        this._filterToken = null;
        if (exp == null || exp === '') {
            // Set expression filter to null and not a string
            this._expressionFilter = null;
        } else {
            this._expressionFilter = exp;
        }
        this.dispatch({
            type: 'layer.filter.changed',
            name: this.name,
            expressionFilter: this.expressionFilter,
        })
        if (dispatchTokenChanged) {
            this.dispatch({
                type: 'layer.filter.token.changed',
                name: this.name,
                expressionFilter: this.expressionFilter,
                filterToken: this.filterToken,
            })
        }
    }

    /**
     * Vector layer filter token
     *
     * @type {?String}
     **/
    get filterToken() {
        return this._filterToken;
    }

    /**
     * Update vector layer filter token
     *
     * @param {?(String|object)} token - The filter token
     **/
    set filterToken(token) {
        // Validate filter token
        if (!(token == null || typeof(token) == 'string' || (token != null && typeof(token) == 'object'))) {
            throw new ValidationError('Expression filter token could only be null, a string or an object!');
        }
        const oldToken = this._filterToken;
        if (token != null && typeof(token) == 'object') {
            if (!token.hasOwnProperty('token') || !token.hasOwnProperty('expressionFilter')) {
                throw new ValidationError('If the expression filter token is an object, it has to have `token` and `expressionFilter` properties!');
            }
            // Validate expression
            if (token.expressionFilter != null && typeof(token.expressionFilter) != 'string') {
                throw new ValidationError('Expression filter could only be null or a string!');
            }
            // Reset expressionFilter and filterToken
            if (token.expressionFilter == null || token.expressionFilter === '') {
                this.expressionFilter = token.expressionFilter;
                return;
            }

            if (this._filterToken === token.token && this.expressionFilter === token.expressionFilter) {
                return;
            } else {
                if (token.token == null || token.token === '') {
                    // Set filter token to null and not a string
                    this._filterToken = null;
                } else {
                    this._filterToken = token.token;
                }
                if (this._expressionFilter !== token.expressionFilter) {
                    this._expressionFilter = token.expressionFilter;
                    this.dispatch({
                        type: 'layer.filter.changed',
                        name: this.name,
                        expressionFilter: this.expressionFilter,
                    })
                }
            }
        } else {
            if (this._filterToken === token) {
                return;
            }
            if (token == null || token === '') {
                // Set filter token to null and not a string
                this._filterToken = null;
            } else {
                this._filterToken = token;
            }
        }
        if (oldToken !== this._filterToken) {
            this.dispatch({
                type: 'layer.filter.token.changed',
                name: this.name,
                expressionFilter: this.expressionFilter,
                filterToken: this.filterToken,
            })
        }
    }

    /**
     * Parameters for OGC WMS Request
     *
     * @type {Object}
     **/
    get wmsParameters() {
        let params = super.wmsParameters;
        if (this.selectionToken != null) {
            params['SELECTIONTOKEN'] = this.selectionToken;
        } else if (this.selectedFeatures.length > 0) {
            params['SELECTION'] = this.wmsName + ':' + this.selectedFeatures.join();
        }
        if (this.filterToken != null) {
            params['FILTERTOKEN'] = this.filterToken;
        } else if (this.expressionFilter != null) {
            params['FILTER'] = this.wmsName + ':' + this.expressionFilter;
        }
        return params;
    }

    /**
     * Calculate and save visibility
     *
     * @returns {boolean} the calculated visibility
     **/
    calculateVisibility() {
        if (!this.isSpatial) {
            this._visibility = false;
            return false;
        }
        return super.calculateVisibility();
    }
}

/**
 * Class representing a rater layer
 * @class
 * @augments LayerLayerState
 */
export class LayerRasterState extends LayerLayerState {

    /**
     * Creating a raster layer state
     *
     * @param {LayerTreeItemConfig} layerTreeItemCfg - the layer item config
     * @param {String[]}            layersOrder      - the layers order
     * @param {LayerItemState}      [parentGroup]    - the parent layer group
     */
    constructor(layerTreeItemCfg, layersOrder, parentMapGroup) {
        super(layerTreeItemCfg, layersOrder, parentMapGroup)
        if (this.layerType == 'vector') {
            throw new TypeError('A LayerRasterState could not be build for `'+this.layerType+'` type ! The layer `'+ this.name +'` could not be constructed!');
        }
    }

    /**
     * The layer provides parameters for external access (layer only)
     *
     * @type {Boolean}
     **/
    get externalWmsToggle() {
        return this.layerConfig.externalWmsToggle;
    }

    /**
     * The layer layer external access (layer only)
     *
     * @type {?Object}
     **/
    get externalAccess() {
        return this.layerConfig.externalAccess;
    }
}

/**
 * Class representing a layer item: could be vector or raster layer
 * @class
 * @augments LayerItemState
 */
export class LayerGroupState extends LayerItemState {

    /**
     * Creating a layer group state
     *
     * @param {LayerTreeGroupConfig} layerTreeGroupCfg - the layer item config
     * @param {Number[]}            layersOrder        - the layers order
     * @param {LayerItemState}      [parentGroup]      - the parent layer group
     */
    constructor(layerTreeGroupCfg, layersOrder, parentMapGroup) {
        super('group', layerTreeGroupCfg, parentMapGroup);
        this._items = [];
        this._layerOrder = -1;
        for (const layerTreeItem of layerTreeGroupCfg.getChildren()) {
            const cfg = layerTreeItem.layerConfig;
            if (cfg == null) {
                throw new RangeError('The layer `'+ layerTreeItem.name +'` has no config!');
            }

            // Group as group
            if (layerTreeItem instanceof LayerTreeGroupConfig) {
                // Build group
                const group = new LayerGroupState(layerTreeItem, layersOrder, this);
                group.addListener(this.dispatch.bind(this), 'group.visibility.changed');
                group.addListener(this.dispatch.bind(this), 'group.symbology.changed');
                group.addListener(this.dispatch.bind(this), 'group.opacity.changed');
                group.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
                group.addListener(this.dispatch.bind(this), 'layer.symbology.changed');
                group.addListener(this.dispatch.bind(this), 'layer.opacity.changed');
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
                // layer with geometry is vector layer
                let layer = null;
                if (cfg.geometryType != null) {
                    layer = new LayerVectorState(layerTreeItem, layersOrder, this);
                } else {
                    layer = new LayerRasterState(layerTreeItem, layersOrder, this);
                }
                layer.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.symbology.changed');
                layer.addListener(this.dispatch.bind(this), 'layer.opacity.changed');
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
        }
        for (const child of this.getChildren()) {
            child.calculateVisibility();
        }
    }

    /**
     * Item map type
     *
     * @type {String}
     **/
    get mapType() {
        if (this.groupAsLayer) {
            return 'layer';
        }
        return this._type;
    }

    /**
     * Layer type from top to bottom
     *
     * @type {Number}
     **/
    get layerOrder() {
        if (this._layerOrder == -1) {
            for (const layer of this.itemState.findLayers()) {
                if (this._layerOrder == -1 || layer.layerOrder < this._layerOrder) {
                    this._layerOrder = layer.layerOrder;
                }
            }
        }
        return this._layerOrder;
    }

    /**
     * WMS layer Geographic Bounding Box
     *
     * @type {?LayerGeographicBoundingBoxConfig}
     **/
    get wmsGeographicBoundingBox() {
        if (this.layerConfig == null) {
            return null;
        }
        if (this._geographicBoundingBox == null) {
            let geographicBoundingBox = null;
            for (const treeLayerCfg of this._layerTreeItemCfg.findTreeLayerConfigs()) {
                if (geographicBoundingBox == null) {
                    geographicBoundingBox = [...treeLayerCfg.wmsGeographicBoundingBox];
                } else {
                    if (geographicBoundingBox[0] > treeLayerCfg.wmsGeographicBoundingBox[0]) {
                        geographicBoundingBox[0] = treeLayerCfg.wmsGeographicBoundingBox[0]
                    }
                    if (geographicBoundingBox[1] > treeLayerCfg.wmsGeographicBoundingBox[1]) {
                        geographicBoundingBox[1] = treeLayerCfg.wmsGeographicBoundingBox[1]
                    }
                    if (geographicBoundingBox[2] < treeLayerCfg.wmsGeographicBoundingBox[2]) {
                        geographicBoundingBox[2] = treeLayerCfg.wmsGeographicBoundingBox[2]
                    }
                    if (geographicBoundingBox[3] < treeLayerCfg.wmsGeographicBoundingBox[3]) {
                        geographicBoundingBox[3] = treeLayerCfg.wmsGeographicBoundingBox[3]
                    }
                }
            }
            this._geographicBoundingBox = new LayerGeographicBoundingBoxConfig(...geographicBoundingBox);
        }
        return this._geographicBoundingBox;
    }

    /**
     * The group will be displayed as layer
     *
     * @type {Boolean}
     **/
    get groupAsLayer() {
        if (this.layerConfig == null) {
            return false;
        }
        return this.layerConfig.groupAsLayer;
    }

    /**
     * The group is mutually exclusive
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
     * @type {LayerItemState[]}
     **/
    get children() {
        return [...this._items];
    }

    /**
     * Iterate through children items
     *
     * @generator
     * @yields {LayerItemState} The next child item
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
    findLayerNames() {
        let names = []
        for(const item of this.getChildren()) {
            if (item instanceof LayerLayerState) {
                names.push(item.name);
            } else if (item instanceof LayerGroupState) {
                names = names.concat(item.findLayerNames());
            }
        }
        return names;
    }

    /**
     * Find layer items
     *
     * @returns {LayerLayerState[]}
     **/
    findLayers() {
        let items = []
        for(const item of this.getChildren()) {
            if (item instanceof LayerLayerState) {
                items.push(item);
            } else if (item instanceof LayerGroupState) {
                items = items.concat(item.findLayers());
            }
        }
        return items;
    }

    /**
     * Find group items
     *
     * @returns {LayerGroupState[]}
     **/
    findGroups() {
        let items = []
        for(const item of this.getChildren()) {
            if (item instanceof LayerGroupState) {
                items.push(item);
                items = items.concat(item.findGroups());
            }
        }
        return items;
    }
}

/**
 * Class representing a collections of layers and groups state
 * @class
 * @augments EventDispatcher
 */
export class LayersAndGroupsCollection extends EventDispatcher {

    /**
     * Creating the collection of layers and groups state
     *
     * @param {LayerTreeGroupConfig} layerTreeGroupCfg - the layer item config
     * @param {Number[]}             layersOrder       - the layers order
     */
    constructor(layerTreeGroupCfg, layersOrder) {
        super();
        this._root = new LayerGroupState(layerTreeGroupCfg, layersOrder);

        this._layersMap = new Map(this._root.findLayers().map(l => [l.name, l]));
        this._groupsMap = new Map(this._root.findGroups().map(g => [g.name, g]));

        // Dispatch events from groups and layers
        this._root.addListener(this.dispatch.bind(this), 'group.visibility.changed');
        this._root.addListener(this.dispatch.bind(this), 'group.symbology.changed');
        this._root.addListener(this.dispatch.bind(this), 'group.opacity.changed');
        this._root.addListener(this.dispatch.bind(this), 'layer.visibility.changed');
        this._root.addListener(this.dispatch.bind(this), 'layer.symbology.changed');
        this._root.addListener(this.dispatch.bind(this), 'layer.opacity.changed');
        this._root.addListener(this.dispatch.bind(this), 'layer.style.changed');
        this._root.addListener(this.dispatch.bind(this), 'layer.symbol.checked.changed');
        this._root.addListener(this.dispatch.bind(this), 'layer.selection.changed');
        this._root.addListener(this.dispatch.bind(this), 'layer.selection.token.changed');
        this._root.addListener(this.dispatch.bind(this), 'layer.filter.changed');
        this._root.addListener(this.dispatch.bind(this), 'layer.filter.token.changed');
    }

    /**
     * The root group state
     *
     * @type {LayerGroupState}
     **/
    get root() {
        return this._root;
    }

    /**
     * The layers state
     *
     * @type {Array<LayerVectorState|LayerRasterState>}
     **/
    get layers() {
        return [...this._layersMap.values()];
    }

    /**
     * The layer names
     *
     * @type {String[]}
     **/
    get layerNames() {
        return [...this._layersMap.keys()];
    }

    /**
     * The groups
     *
     * @type {LayerGroupState[]}
     **/
    get groups() {
        return [...this._groupsMap.values()];
    }

    /**
     * The group names
     *
     * @type {String[]}
     **/
    get groupNames() {
        return [...this._groupsMap.keys()];
    }

    /**
     * Get a layer state by layer name
     *
     * @param {String} name - the layer name
     *
     * @returns {LayerVectorState|LayerRasterState} The layer state associated to the name
     *
     * @throws {RangeError} The layer name is unknown
     **/
    getLayerByName(name) {
        const layer = this._layersMap.get(name);
        if (layer !== undefined) {
            if (layer.name !== name) {
                throw 'The layers and groups collection has been corrupted!'
            }
            return layer;
        }
        throw new RangeError('The layer name `'+ name +'` is unknown!');
    }

    /**
     * Get a layer state by layer id
     *
     * @param {String} layerId - the layer id
     *
     * @returns {LayerVectorState|LayerRasterState} The layer state associated to the id
     *
     * @throws {RangeError} The layer id is unknown
     **/
    getLayerById(layerId) {
        for (const layer of this.getLayers()) {
            if (layer.id === layerId) {
                return layer;
            }
        }
        throw new RangeError('The layer id `'+ layerId +'` is unknown!');
    }

    /**
     * Get a layer state by WMS Name
     *
     * @param {String} wmsName - the layer WMS Name
     *
     * @returns {LayerVectorState|LayerRasterState} The layer state associated to the WMS Name
     *
     * @throws {RangeError} The layer WMS Name is unknown
     **/
    getLayerByWmsName(wmsName) {
        for (const layer of this.getLayers()) {
            if (layer.wmsName === wmsName) {
                return layer;
            }
        }
        throw new RangeError('The layer WMS Name `'+ wmsName +'` is unknown!');
    }

    /**
     * Iterate through layer states
     *
     * @generator
     * @yields {LayerVectorState|LayerRasterState} The next layer state
     **/
    *getLayers() {
        for (const layer of this._layersMap.values()) {
            yield layer;
        }
    }

    /**
     * Get a group state by group name
     *
     * @param {String} name the group name
     *
     * @returns {LayerVectorState|LayerRasterState} The group state associated to the name
     *
     * @throws {RangeError} The group name is unknown
     **/
    getGroupByName(name) {
        const group = this._groupsMap.get(name);
        if (group !== undefined) {
            if (group.name !== name) {
                throw 'The layers and groups collection has been corrupted!'
            }
            return group;
        }
        throw new RangeError('The group name `'+ name +'` is unknown!');
    }

    /**
     * Get a group state by WMS Name
     *
     * @param {String} wmsName the group WMS Name
     *
     * @returns {LayerGroupState} The group state associated to the WMS Name
     *
     * @throws {RangeError} The group WMS Name is unknown
     **/
    getGroupByWmsName(wmsName) {
        for (const group of this.getGroups()) {
            if (group.wmsName === wmsName) {
                return group;
            }
        }
        throw new RangeError('The group WMS Name `'+ wmsName +'` is unknown!');
    }

    /**
     * Iterate through group states
     *
     * @generator
     * @yields {LayerGroupState} The next group state
     **/
    *getGroups() {
        for (const group of this._groupsMap.values()) {
            yield group;
        }
    }

    /**
     * Get a layer or group state by name
     *
     * @param {String} name the name
     *
     * @returns {LayerVectorState|LayerRasterState|LayerGroupState} The layer or group state associated to the name
     *
     * @throws {RangeError} The name is unknown
     **/
    getLayerOrGroupByName(name) {
        const layer = this._layersMap.get(name);
        if (layer !== undefined) {
            return layer;
        }
        const group = this._groupsMap.get(name);
        if (group !== undefined) {
            return group;
        }
        throw new RangeError('The name `'+ name +'` is unknown!');
    }


    /**
     * Get a layer or group state by WMS Name
     *
     * @param {String} wmsName the WMS Name
     *
     * @returns {LayerVectorState|LayerRasterState|LayerGroupState} The layer or group state associated to the WMS Name
     *
     * @throws {RangeError} The WMS Name is unknown
     **/
    getLayerOrGroupByWmsName(wmsName) {
        for (const layer of this.getLayers()) {
            if (layer.wmsName === wmsName) {
                return layer;
            }
        }
        for (const group of this.getGroups()) {
            if (group.wmsName === wmsName) {
                return group;
            }
        }
        throw new RangeError('The WMS Name `'+ wmsName +'` is unknown!');
    }
}
