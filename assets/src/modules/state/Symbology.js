/**
 * @module state/Symbology.js
 * @name SymbologyState
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { ValidationError } from './../Errors.js';
import { convertBoolean } from './../utils/Converters.js';
import EventDispatcher from './../../utils/EventDispatcher.js';
import { applyConfig } from './../config/BaseObject.js';
import { LayerConfig } from './../config/Layer.js';
import {
    base64png,
    base64pngNullData,
    base64svg,
    base64svgPointLayer,
    base64svgLineLayer,
    base64svgPolygonLayer,
    base64svgRasterLayer,
} from './SymbologyIcons.js';


/**
 * Get the default icon for a layer config
 * @param {LayerConfig} layerCfg - The layer config for which getting default icon
 * @returns {?string} The default layer icon as base 64 string image
 */
export function getDefaultLayerIcon(layerCfg) {
    if (layerCfg.type == 'group' || layerCfg.groupAsLayer) {
        return base64png + base64pngNullData;
    }
    if (layerCfg.layerType == 'raster' || layerCfg.geometryType == null) {
        return base64svg + base64svgRasterLayer;
    }
    if (layerCfg.layerType == 'vector' || layerCfg.geometryType != null) {
        if (layerCfg.geometryType == 'point') {
            return base64svg + base64svgPointLayer;
        }
        if (layerCfg.geometryType == 'line') {
            return base64svg + base64svgLineLayer;
        }
        if (layerCfg.geometryType == 'polygon') {
            return base64svg + base64svgPolygonLayer;
        }
    }
    return null;
}

/**
 * Class representing the base object symbology
 * @class
 * @augments EventDispatcher
 */
export class BaseObjectSymbology extends EventDispatcher {

    /**
     * Create a base symbology instance based on a node object provided by QGIS Server
     * @param {object} node                 - the QGIS node symbology
     * @param {string} node.title           - the node title
     * @param {string} [node.type]          - the node type
     * @param {object} [requiredProperties] - the required properties definition
     * @param {object} [optionalProperties] - the optional properties definition
     */
    constructor(node, requiredProperties = { 'title': { type: 'string' } }, optionalProperties = { 'type': { type: 'string' } })
    {
        if (!node.hasOwnProperty('type')) {
            node.type = 'icon';
        }
        if (!optionalProperties.hasOwnProperty('type')) {
            optionalProperties['type'] = { type: 'string' };
        }
        if (!requiredProperties.hasOwnProperty('title')) {
            requiredProperties['title'] = { type: 'string' };
        }

        super()
        applyConfig(this, node, requiredProperties, optionalProperties)

        /**
         * The private symbology type
         * @type {string}
         * @private
         */
        this._type;

        /**
         * The private symbology title
         * @type {string}
         * @private
         */
        this._title;
    }

    /**
     * The symbology type
     * @type {string}
     */
    get type() {
        return this._type;
    }

    /**
     * The symbology title
     * @type {string}
     */
    get title() {
        return this._title;
    }
}

/**
 * Class representing a base icon symbology
 * @class
 * @augments BaseObjectSymbology
 */
export class BaseIconSymbology extends BaseObjectSymbology {
    /**
     * Create a base icon symbology instance based on a node object provided by QGIS Server
     * @param {object} node                 - the QGIS node symbology
     * @param {string} node.title           - the node title
     * @param {string} [node.icon]          - the png image in base64
     * @param {string} [node.type]          - the node type
     * @param {object} [requiredProperties] - the required properties definition
     * @param {object} [optionalProperties] - the optional properties definition
     */
    constructor(node, requiredProperties = { 'title': { type: 'string' } }, optionalProperties = { 'icon': { type: 'string' } })
    {
        if (!optionalProperties.hasOwnProperty('icon')) {
            optionalProperties['icon'] = { type: 'string' };
        }
        if (!requiredProperties.hasOwnProperty('title')) {
            requiredProperties['title'] = { type: 'string' };
        }
        // In case of RuleBasedRenderer the icon could be empty
        if (!node.hasOwnProperty('icon')) {
            node.icon = base64pngNullData;
        }

        super(node, requiredProperties, optionalProperties)

        /**
         * The private base64 icon
         * @type {string}
         * @private
         */
        this._icon;
    }

    /**
     * The src icon
     * @type {string}
     */
    get icon() {
        return base64png + this._icon;
    }
}

const layerIconProperties = {
    'icon': {type: 'string'},
    'name': {type: 'string'},
    'title': {type: 'string'},
}
/**
 * Class representing a layer icon symbology
 * @class
 * @augments BaseIconSymbology
 */
export class LayerIconSymbology extends BaseIconSymbology {

    /**
     * Create a layer icon symbology instance based on a node object provided by QGIS Server
     * @param {object}  node      - the QGIS node symbology
     * @param {string}  node.type  - the node type: layer
     * @param {string}  node.icon  - the png image in base64
     * @param {string}  node.name  - the layer name
     * @param {string}  node.title - the node title
     */
    constructor(node) {

        if (!node.hasOwnProperty('type') || node.type != 'layer') {
            throw new ValidationError('The layer icon symbology is only available for layer type!');
        }

        super(node, layerIconProperties, {})

        /**
         * The private layer name
         * @type {string}
         * @private
         */
        this._name;
    }

    /**
     * The layer name
     * @type {string}
     */
    get name() {
        return this._name;
    }
}

const symbolIconProperties = {
    'icon': {type: 'string'},
    'title': {type: 'string'},
}

const symbolIconOptionalProperties = {
    'ruleKey': {type: 'string', default: ''},
    'checked': {type: 'boolean', default: true},
}
/**
 * Class representing the symbol icon symbology
 * @class
 * @augments BaseIconSymbology
 */
export class SymbolIconSymbology extends BaseIconSymbology {
    /**
     * Create a symbol icon symbology instance based on a node object provided by QGIS Server
     * @param {object}  node        - the QGIS node symbology
     * @param {string}  node.icon    - the png image in base64
     * @param {string}  node.title   - the node title
     * @param {string}  node.ruleKey - the node rule key for filtering
     * @param {boolean} node.checked - the node is checked by default
     */
    constructor(node) {
        if (!node.hasOwnProperty('type')) {
            node.type = 'icon';
        }
        super(node, symbolIconProperties, symbolIconOptionalProperties)

        /**
         * The private rule key
         * @type {string}
         * @private
         */
        this._ruleKey;

        /**
         * The private is rule checked
         * @type {boolean}
         * @private
         */
        this._checked;

        /**
         * The private children rules
         * @type {BaseIconSymbology[]}
         * @private
         */
        this._childrenRules = []
    }

    /**
     * The rule key
     * @type {string}
     */
    get ruleKey() {
        return this._ruleKey;
    }

    /**
     * Is rule checked ?
     * @type {boolean}
     */
    get checked() {
        return this._checked;
    }

    /**
     * Checked or Unchecked rule
     * @param {boolean} val - The checked state
     */
    set checked(val) {
        const newVal = convertBoolean(val);
        // No changes
        if (this._checked == newVal) {
            return;
        }
        // Set new value
        this._checked = newVal;
        this.dispatch({
            type: 'symbol.checked.changed',
            title: this.title,
            ruleKey: this.ruleKey,
            checked: this.checked,
        })
    }

    /**
     * Is legend ON ?
     * @type {boolean}
     */
    get legendOn() {
        return this._checked;
    }
}

const symbolRuleProperties = Object.assign(
    symbolIconProperties,
    {}
);
const symbolRuleOptionalProperties = Object.assign(
    symbolIconOptionalProperties,
    {
        'scaleMinDenom': {type: 'number', default: -1},
        'scaleMaxDenom': {type: 'number', default: -1},
        'parentRuleKey': {type: 'string', default: ''},
    }
);

/**
 * Class representing the symbol rule symbology
 * @class
 * @augments SymbolIconSymbology
 */
export class SymbolRuleSymbology extends SymbolIconSymbology {
    constructor(node) {
        if (!node.hasOwnProperty('type')) {
            node.type = 'rule';
        }
        super(node, symbolRuleProperties, symbolRuleOptionalProperties)

        /**
         * The private parent rule key
         * @type {string}
         * @private
         */
        this._parentRuleKey;

        /**
         * The private parent rule
         * @type {?SymbolRuleSymbology}
         * @private
         */
        this._parentRule = null;

        /**
         * The private is symbol item expanded ?
         * @type {boolean}
         * @private
         */
        this._expanded = false;
    }

    /**
     * Is legend ON ?
     * @type {boolean}
     */
    get legendOn() {
        if (this.parentRule === null) {
            return this._checked;
        }
        if (this.parentRule.legendOn) {
            return this._checked;
        }
        return false;
    }

    /**
     * The parent rule key
     * @type {string}
     */
    get parentRuleKey() {
        return this._parentRuleKey;
    }

    /**
     * The parent rule
     * @type {?SymbolRuleSymbology}
     */
    get parentRule() {
        return this._parentRule;
    }

    /**
     * The minimum scale denominator
     * @type {number}
     */
    get minScaleDenominator() {
        return this._scaleMinDenom;
    }

    /**
     * The maximum scale denominator
     * @type {number}
     */
    get maxScaleDenominator() {
        return this._scaleMaxDenom;
    }

    /**
     * Children rules count
     * @type {number}
     */
    get childrenCount() {
        return this._childrenRules.length;
    }

    /**
     * The children rule
     * @type {BaseIconSymbology[]}
     */
    get children() {
        return [...this._childrenRules];
    }

    /**
     * Iterate through children rules
     * @generator
     * @yields {BaseIconSymbology} The next child icon
     */
    *getChildren() {
        for (const icon of this._childrenRules) {
            yield icon;
        }
    }

    /**
     * Symbol item is expanded
     * @type {boolean}
     */
    get expanded() {
        return this._expanded;
    }

    /**
     * Set symbol item is expanded
     * @type {boolean}
     */
    set expanded(val) {
        const newVal = convertBoolean(val);
        if (this._expanded === newVal) {
            return;
        }

        this._expanded = newVal;

        this.dispatch({
            type: 'symbol.expanded.changed',
            title: this.title,
            ruleKey: this.ruleKey,
            expanded: this.expanded
        });
    }
}

/**
 * Class representing the layer symbols symbology
 * @class
 * @augments BaseObjectSymbology
 */
export class BaseSymbolsSymbology extends BaseObjectSymbology {

    /**
     * Create a layer symbols symbology instance based on a node object provided by QGIS Server
     * @param {object}  node         - the QGIS node symbology
     * @param {string}  node.type    - the node type: layer
     * @param {Array}   node.symbols - the png image in base64
     * @param {string}  node.title   - the node title
     * @param {object} [requiredProperties] - the required properties definition
     * @param {object} [optionalProperties] - the optional properties definition
     * @param {object} [iconClass]          - The icon class to build
     */
    constructor(node, requiredProperties={}, optionalProperties = {}, iconClass = BaseIconSymbology) {

        if (!node.hasOwnProperty('type') || node.type != 'layer') {
            throw new ValidationError('The layer symbols symbology is only available for layer type!');
        }

        if (!requiredProperties.hasOwnProperty('symbols')) {
            requiredProperties['symbols'] = { type: 'string' };
        }

        super(node, requiredProperties, optionalProperties)

        /**
         * The private children icons
         * @type {BaseIconSymbology[]}
         * @private
         */
        this._icons = [];
        for(const symbol of this._symbols) {
            this._icons.push(new iconClass(symbol));
        }

        /**
         * The private symbol is expanded ?
         * @type {boolean}
         * @private
         */
        this._expanded = false;
    }

    /**
     * Symbol item is expanded
     * @type {boolean}
     */
    get expanded() {
        return this._expanded;
    }

    /**
     * Set symbol item is expanded
     * @type {boolean}
     */
    set expanded(val) {
        const newVal = convertBoolean(val);
        if (this._expanded === newVal) {
            return;
        }

        this._expanded = newVal;

        this.dispatch({
            type: 'symbol.expanded.changed',
            title: this.title,
            symbolType: this.type,
            expanded: this.expanded
        });
    }

    /**
     * Children icons count
     * @type {number}
     */
    get childrenCount() {
        return this._icons.length;
    }

    /**
     * The children icons
     * @type {BaseIconSymbology[]}
     */
    get children() {
        return [...this._icons];
    }

    /**
     * Iterate through children icons
     * @generator
     * @yields {BaseIconSymbology} The next child icon
     */
    *getChildren() {
        for (const icon of this._icons) {
            yield icon;
        }
    }
}

const layerSymbolsProperties = {
    'symbols': {type: 'array'},
    'name': {type: 'string'},
    'title': {type: 'string'},
}
/**
 * Class representing the layer symbols symbology
 * @class
 * @augments BaseSymbolsSymbology
 */
export class LayerSymbolsSymbology extends BaseSymbolsSymbology {

    /**
     * Create a layer symbols symbology instance based on a node object provided by QGIS Server
     * @param {object}  node         - the QGIS node symbology
     * @param {string}  node.type    - the node type: layer
     * @param {Array}   node.symbols - the png image in base64
     * @param {string}  node.name    - the layer name
     * @param {string}  node.title   - the node title
     */
    constructor(node) {

        if (!node.hasOwnProperty('type') || node.type != 'layer') {
            throw new ValidationError('The layer symbols symbology is only available for layer type!');
        }

        if (node.symbols[0].hasOwnProperty('ruleKey')
            && node.symbols[0].ruleKey !== ''
            && node.symbols[0].hasOwnProperty('parentRuleKey')
            && node.symbols[0].parentRuleKey !== '') {
            super(node, layerSymbolsProperties, {}, SymbolRuleSymbology)
            this._ruleMap = new Map(this._icons.map(i => [i.ruleKey, i]));
            let root = new Map();
            for (const icon of this._icons) {
                if (icon.parentRuleKey === '') {
                    // The parentRuleKey could be null
                    // it is an empty symbol defined in
                    // JSON GetLegendGraphic
                    continue;
                }
                const parent = this._ruleMap.get(icon.parentRuleKey);
                if (parent === undefined) {
                    root.set(icon.ruleKey, icon);
                } else {
                    parent._childrenRules.push(icon);
                    icon._parentRule = parent;
                    icon.addListener(parent.dispatch.bind(parent), 'symbol.checked.changed');
                    icon.addListener(parent.dispatch.bind(parent), 'symbol.expanded.changed');
                }
            }
            this._root = root;
        } else {
            super(node, layerSymbolsProperties, {}, SymbolIconSymbology)
            this._ruleMap = null;
            this._root = null;
        }

        /**
         * The private layer name
         * @type {string}
         * @private
         */
        this._name;

        /**
         * The private children icons
         * @type {SymbolIconSymbology[]|SymbolRuleSymbology[]}
         * @private
         */
        this._icons;

        /**
         * The private rule map that contains rule symbology ruleKey:Symbol associations
         * @type {?Map<string, SymbolRuleSymbology>}
         * @private
         */
        this._ruleMap;

        /**
         * The private legend root that contains first level rule symbology ruleKey:Symbol associations
         * @type {?Map<string, SymbolRuleSymbology>}
         * @private
         */
        this._root;
    }

    /**
     * The layer name
     * @type {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Is legend ON ?
     * @type {boolean}
     */
    get legendOn() {
        for (const symbol of this._icons) {
            if (symbol.ruleKey === '') {
                return true;
            }
            if (symbol.legendOn) {
                return true;
            }
        }
        return false;
    }

    /**
     * Children icons count
     * @type {number}
     */
    get childrenCount() {
        if (this._root !== null) {
            return this._root.size;
        }
        return this._icons.length;
    }

    /**
     * The children icons
     * @type {Array<SymbolIconSymbology|SymbolRuleSymbology>}
     */
    get children() {
        if (this._root !== null) {
            return [...this._root.values()];
        }
        return [...this._icons];
    }

    /**
     * Iterate through children icons
     * @generator
     * @yields {SymbolIconSymbology|SymbolRuleSymbology} The next child icon
     */
    *getChildren() {
        for (const child of this.children) {
            yield child;
        }
    }

    /**
     * Parameters for OGC WMS Request
     * @param {string} wmsName - The WMS layer name
     * @returns {object} can contain LEGEND_ON and LEGEND_OFF parameters
     */
    wmsParameters(wmsName) {
        let params = {
        }
        let keyChecked = [];
        let keyUnchecked = [];
        for (const symbol of this._icons) {
            if (symbol.ruleKey === '') {
                keyChecked = [];
                keyUnchecked = [];
                break;
            }
            if (symbol.legendOn) {
                keyChecked.push(symbol.ruleKey);
            } else {
                keyUnchecked.push(symbol.ruleKey);
            }
        }
        if ((keyChecked.length != 0 || keyUnchecked.length != 0)
            && keyChecked.length != this._icons.length) {
            params['LEGEND_ON'] = wmsName+':'+keyChecked.join();
            params['LEGEND_OFF'] = wmsName+':'+keyUnchecked.join();
        }
        return params;
    }
}

const layerGroupProperties = {
    'nodes': {type: 'array'},
    'name': {type: 'string'},
    'title': {type: 'string'},
}
/**
 * Class representing the layer group symbology
 * @class
 * @augments BaseObjectSymbology
 */
export class LayerGroupSymbology extends BaseObjectSymbology {

    /**
     * Create a layer group symbology instance based on a node object provided by QGIS Server
     * @param {object}  node       - the QGIS node symbology
     * @param {string}  node.type  - the node type: group
     * @param {Array}   node.nodes - the png image in base64
     * @param {string}  node.name  - the layer name
     * @param {string}  node.title - the node title
     */
    constructor(node) {

        if (!node.hasOwnProperty('type') || node.type != 'group') {
            throw new ValidationError('The layer group symbology is only available for group type!');
        }

        super(node, layerGroupProperties, {})

        this._symbologyNodes = [];
        for(const node of this._nodes) {
            if (node.hasOwnProperty('symbols')) {
                const symbol = new BaseSymbolsSymbology(node);
                symbol.addListener(this.dispatch.bind(this), 'symbol.expanded.changed');
                this._symbologyNodes.push(symbol);
            } else if (node.hasOwnProperty('icon')) {
                this._symbologyNodes.push(new BaseIconSymbology(node));
            }
        }
    }

    /**
     * The layer name
     * @type {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Children nodes count
     * @type {number}
     */
    get childrenCount() {
        return this._symbologyNodes.length;
    }

    /**
     * The children nodes
     * @type {Array.<BaseIconSymbology|BaseSymbolsSymbology>}
     */
    get children() {
        return [...this._symbologyNodes];
    }

    /**
     * Iterate through children nodes
     * @generator
     * @yields {(BaseIconSymbology|BaseSymbolsSymbology)} The next child node
     */
    *getChildren() {
        for (const node of this._symbologyNodes) {
            yield node;
        }
    }
}

/**
 * Build layer symbology
 * @param {(object | LayerIconSymbology | LayerSymbolsSymbology | LayerGroupSymbology)} node - The symbology node
 * @returns {(LayerIconSymbology|LayerSymbolsSymbology|LayerGroupSymbology)} The layer symbology
 */
export function buildLayerSymbology(node) {
    if (node instanceof LayerIconSymbology
        || node instanceof LayerSymbolsSymbology
        || node instanceof LayerGroupSymbology) {
        return node;
    }


    if (!node || typeof node !== "object") {
        throw new ValidationError('The node parameter is not an Object!');
    }

    if (!node.hasOwnProperty('type')) {
        throw new ValidationError('Node symbology required `type` property!');
    }
    if (node.type == 'group') {
        return new LayerGroupSymbology(node);
    }
    else if (node.type == 'layer') {
        if (node.hasOwnProperty('symbols')) {
            return new LayerSymbolsSymbology(node);
        } else if (node.hasOwnProperty('icon')) {
            return new LayerIconSymbology(node);
        }

        throw new ValidationError('Node symbology with `type` property equals to `layer` has to have `symbols` or `icon` property!');
    }

    throw new ValidationError('Node symbology `type` property has to be `layer` or `group`! It is: `'+node.type+'`');
}
