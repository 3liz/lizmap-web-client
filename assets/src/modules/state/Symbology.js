import { ValidationError } from './../Errors.js';
import { convertBoolean } from './../utils/Converters.js';
import EventDispatcher from './../../utils/EventDispatcher.js';
import { applyConfig } from './../config/BaseObject.js';

export const base64png = 'data:image/png;base64, ';
export const base64pngNullData = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9bpUUrDu0g4pChdrIgKuKoVShChVArtOpgcukXNGlIUlwcBdeCgx+LVQcXZ10dXAVB8APE1cVJ0UVK/F9SaBHjwXE/3t173L0D/M0qU82ecUDVLCOTSgq5/KoQfEUQEYTQj7jETH1OFNPwHF/38PH1LsGzvM/9OQaUgskAn0A8y3TDIt4gnt60dM77xFFWlhTic+Ixgy5I/Mh12eU3ziWH/TwzamQz88RRYqHUxXIXs7KhEk8RxxRVo3x/zmWF8xZntVpn7XvyF4YL2soy12mOIIVFLEGEABl1VFCFhQStGikmMrSf9PAPO36RXDK5KmDkWEANKiTHD/4Hv7s1i5MTblI4CfS+2PbHKBDcBVoN2/4+tu3WCRB4Bq60jr/WBGY+SW90tNgRMLgNXFx3NHkPuNwBhp50yZAcKUDTXywC72f0TXkgcgv0rbm9tfdx+gBkqav0DXBwCMRLlL3u8e5Qd2//nmn39wNBG3KTQZt3dAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+cHEwgMJzC1DiQAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAEklEQVQ4y2NgGAWjYBSMAggAAAQQAAGFP6pyAAAAAElFTkSuQmCC';

export const base64svg = 'data:image/svg+xml;base64,';
// https://raw.githubusercontent.com/qgis/QGIS/master/images/themes/default/mIconPointLayer.svg
export const base64svgPointLayer = 'PHN2ZyBoZWlnaHQ9IjE2IiB3aWR0aD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI2VlZWVlYyIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiM4ODhhODUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAtMTYpIj48cGF0aCBkPSJtNC41IDEyLjVjMCAuNTUyMjg1LS40NDc3MTUzIDEtMSAxcy0xLS40NDc3MTUtMS0xIC40NDc3MTUzLTEgMS0xIDEgLjQ0NzcxNSAxIDF6IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDE2KSIvPjxwYXRoIGQ9Im00LjUgMTIuNWMwIC41NTIyODUtLjQ0NzcxNTMgMS0xIDFzLTEtLjQ0NzcxNS0xLTEgLjQ0NzcxNTMtMSAxLTEgMSAuNDQ3NzE1IDEgMXoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIgOSkiLz48cGF0aCBkPSJtNC41IDEyLjVjMCAuNTUyMjg1LS40NDc3MTUzIDEtMSAxcy0xLS40NDc3MTUtMS0xIC40NDc3MTUzLTEgMS0xIDEgLjQ0NzcxNSAxIDF6IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5IDYpIi8+PC9nPjwvc3ZnPg=='
// https://raw.githubusercontent.com/qgis/QGIS/master/images/themes/default/mIconLineLayer.svg
export const base64svgLineLayer = 'PHN2ZyBoZWlnaHQ9IjE2IiB3aWR0aD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjODg4YTg1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgLTE2KSI+PHBhdGggZD0ibTEuNSA0LjUgNCA5IDUtMTFoNCIgZmlsbD0ibm9uZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxNikiLz48ZyBmaWxsPSIjZWVlZWVjIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Im00LjUgMTIuNWMwIC41NTIyODUtLjQ0NzcxNTMgMS0xIDFzLTEtLjQ0NzcxNS0xLTEgLjQ0NzcxNTMtMSAxLTEgMSAuNDQ3NzE1IDEgMXoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIgMTcpIi8+PHBhdGggZD0ibTQuNSAxMi41YzAgLjU1MjI4NS0uNDQ3NzE1MyAxLTEgMXMtMS0uNDQ3NzE1LTEtMSAuNDQ3NzE1My0xIDEtMSAxIC40NDc3MTUgMSAxeiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTEgNikiLz48cGF0aCBkPSJtNC41IDEyLjVjMCAuNTUyMjg1LS40NDc3MTUzIDEtMSAxcy0xLS40NDc3MTUtMS0xIC40NDc3MTUzLTEgMS0xIDEgLjQ0NzcxNSAxIDF6IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3IDYpIi8+PHBhdGggZD0ibTQuNSAxMi41YzAgLjU1MjI4NS0uNDQ3NzE1MyAxLTEgMXMtMS0uNDQ3NzE1LTEtMSAuNDQ3NzE1My0xIDEtMSAxIC40NDc3MTUgMSAxeiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIgOCkiLz48L2c+PC9nPjwvc3ZnPg=='
// https://raw.githubusercontent.com/qgis/QGIS/master/images/themes/default/mIconPolygonLayer.svg
export const base64svgPolygonLayer = 'PHN2ZyBoZWlnaHQ9IjE2IiB3aWR0aD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxsaW5lYXJHcmFkaWVudCBpZD0iYSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI0LjUiIHgyPSI2LjUiIHkxPSIzLjUiIHkyPSIxMC41Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNlZWUiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNjZmNmY2YiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGQ9Im0uNSA2LjVjMCAxMiA2IDIgOSAyIDIgMCA2IDQgNi0xIDAtOC00LjM5ODI2Mi0zLjE5MDUwNTUtNy00LTEuOTQyMzQwMi0uNjA0MzMyLTgtNC04IDN6IiBmaWxsPSJ1cmwoI2EpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzg4OGE4NSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+'
// https://raw.githubusercontent.com/qgis/QGIS/master/images/themes/default/mIconRasterLayer.svg
export const base64svgRasterLayer = 'PHN2ZyBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxNiAxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIwLjUgLTMuNSkiPjxwYXRoIGQ9Im0yMC41IDE0LjE2N2g1LjMzM3Y1LjMzM2gtNS4zMzN6IiBmaWxsPSIjOTY5Njk2Ii8+PHBhdGggZD0ibTIwLjUgOC44MzNoNS4zMzN2NS4zMzNoLTUuMzMzeiIgZmlsbD0iI2M5YzljOSIvPjxwYXRoIGQ9Im0yMC41IDMuNWg1LjMzM3Y1LjMzM2gtNS4zMzN6IiBmaWxsPSIjOTY5Njk2Ii8+PHBhdGggZD0ibTI1LjgzMyAzLjVoNS4zMzN2NS4zMzNoLTUuMzMzeiIgZmlsbD0iI2M5YzljOSIvPjxnIGZpbGw9IiM5Njk2OTYiPjxwYXRoIGQ9Im0yNS44MzMgOC44MzNoNS4zMzN2NS4zMzNoLTUuMzMzeiIvPjxwYXRoIGQ9Im0zMS4xNjcgMy41aDUuMzMzdjUuMzMzaC01LjMzM3oiLz48cGF0aCBkPSJtMjUuODMzIDE0LjE2N2g1LjMzM3Y1LjMzM2gtNS4zMzN6Ii8+PC9nPjxwYXRoIGQ9Im0zMS4xNjcgOC44MzNoNS4zMzN2NS4zMzNoLTUuMzMzeiIgZmlsbD0iI2M5YzljOSIvPjwvZz48L3N2Zz4='

/**
 * @param {LayerConfig} layerCfg
 *
 * @returns {?String}
 **/
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
     *
     * @param {Object} node                                             - the QGIS node symbology
     * @param {String} node.title                                       - the node title
     * @param {Object} [requiredProperties={'title': {type: 'string'}}] - the required properties definition
     * @param {Object} [optionalProperties={}]                          - the optional properties definition
     **/
    constructor(node, requiredProperties = { 'title': { type: 'string' } }, optionalProperties = {}) {

        if (!requiredProperties.hasOwnProperty('title')) {
            requiredProperties['title'] = { type: 'string' };
        }

        super()
        applyConfig(this, node, requiredProperties, optionalProperties)
    }

    /**
     * The symbology title
     *
     * @type {String}
     **/
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
     *
     * @param {Object} node                    - the QGIS node symbology
     * @param {String} node.icon               - the png image in base64
     * @param {String} node.title              - the node title
     * @param {Object} [requiredProperties={}] - the required properties definition
     * @param {Object} [optionalProperties={}] - the optional properties definition
     **/
    constructor(node, requiredProperties={}, optionalProperties = {}) {

        if (!requiredProperties.hasOwnProperty('icon')) {
            requiredProperties['icon'] = { type: 'string' };
        }
        // In case of RuleBasedRenderer the icon could be empty
        if (!node.hasOwnProperty('icon')) {
            node.icon = base64pngNullData;
        }

        super(node, requiredProperties, optionalProperties)
    }

    /**
     * The src icon
     *
     * @type {String}
     **/
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
     *
     * @param {Object}  node      - the QGIS node symbology
     * @param {String}  node.type  - the node type: layer
     * @param {String}  node.icon  - the png image in base64
     * @param {String}  node.name  - the layer name
     * @param {String}  node.title - the node title
     **/
    constructor(node) {

        if (!node.hasOwnProperty('type') || node.type != 'layer') {
            throw new ValidationError('The layer icon symbology is only available for layer type!');
        }

        super(node, layerIconProperties, {})
    }

    /**
     * The layer name
     *
     * @type {String}
     **/
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
     *
     * @param {Object}  node        - the QGIS node symbology
     * @param {String}  node.icon    - the png image in base64
     * @param {String}  node.title   - the node title
     * @param {String}  node.ruleKey - the node rule key for filtering
     * @param {Boolean} node.checked - the node is checked by default
     **/
    constructor(node) {
        super(node, symbolIconProperties, symbolIconOptionalProperties)
        this._childrenRules = []
    }

    /**
     * The rule key
     *
     * @type {String}
     **/
    get ruleKey() {
        return this._ruleKey;
    }

    /**
     * Is rule checked ?
     *
     * @type {Boolean}
     **/
    get checked() {
        return this._checked;
    }

    /**
     * Checked or Unchecked rule
     *
     * @param {Boolean}
     **/
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
     *
     * @type {Boolean}
     **/
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
        super(node, symbolRuleProperties, symbolRuleOptionalProperties)
        this._parentRule = null;
        this._childrenRules = []
    }

    /**
     * Is legend ON ?
     *
     * @type {Boolean}
     **/
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
     *
     * @type {String}
     **/
    get parentRuleKey() {
        return this._parentRuleKey;
    }

    /**
     * The parent rule
     *
     * @type {?SymbolRuleSymbology}
     **/
    get parentRule() {
        return this._parentRule;
    }

    /**
     * The minimum scale denominator
     *
     * @type {Number}
     **/
    get minScaleDenominator() {
        return this._scaleMinDenom;
    }

    /**
     * The maximum scale denominator
     *
     * @type {Number}
     **/
    get maxScaleDenominator() {
        return this._scaleMaxDenom;
    }

    /**
     * Children rules count
     *
     * @type {Number}
     **/
    get childrenCount() {
        return this._childrenRules.length;
    }

    /**
     * The children rule
     *
     * @type {BaseIconSymbology[]}
     **/
    get children() {
        return [...this._childrenRules];
    }

    /**
     * Iterate through children rules
     *
     * @generator
     * @yields {BaseIconSymbology} The next child icon
     **/
    *getChildren() {
        for (const icon of this._childrenRules) {
            yield icon;
        }
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
     *
     * @param {Object}  node         - the QGIS node symbology
     * @param {String}  node.type    - the node type: layer
     * @param {Array}   node.symbols - the png image in base64
     * @param {String}  node.title   - the node title
     * @param {Object} [requiredProperties={}] - the required properties definition
     * @param {Object} [optionalProperties={}] - the optional properties definition
     **/
    constructor(node, requiredProperties={}, optionalProperties = {}, iconClass = BaseIconSymbology) {

        if (!node.hasOwnProperty('type') || node.type != 'layer') {
            throw new ValidationError('The layer symbols symbology is only available for layer type!');
        }

        if (!requiredProperties.hasOwnProperty('symbols')) {
            requiredProperties['symbols'] = { type: 'string' };
        }

        super(node, requiredProperties, optionalProperties)

        this._icons = [];
        for(const symbol of this._symbols) {
            this._icons.push(new iconClass(symbol));
        }
    }

    /**
     * Children icons count
     *
     * @type {Number}
     **/
    get childrenCount() {
        return this._icons.length;
    }

    /**
     * The children icons
     *
     * @type {BaseIconSymbology[]}
     **/
    get children() {
        return [...this._icons];
    }

    /**
     * Iterate through children icons
     *
     * @generator
     * @yields {BaseIconSymbology} The next child icon
     **/
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
     *
     * @param {Object}  node         - the QGIS node symbology
     * @param {String}  node.type    - the node type: layer
     * @param {Array}   node.symbols - the png image in base64
     * @param {String}  node.name    - the layer name
     * @param {String}  node.title   - the node title
     **/
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
                const parent = this._ruleMap.get(icon.parentRuleKey);
                if (parent === undefined) {
                    root.set(icon.ruleKey, icon);
                } else {
                    parent._childrenRules.push(icon)
                    icon._parentRule = parent;
                    icon.addListener(parent.dispatch.bind(parent), 'symbol.checked.changed');
                }
            }
            this._root = root;
        } else {
            super(node, layerSymbolsProperties, {}, SymbolIconSymbology)
            this._root = null;
        }
    }

    /**
     * The layer name
     *
     * @type {String}
     **/
    get name() {
        return this._name;
    }

    /**
     * Is legend ON ?
     *
     * @type {Boolean}
     **/
    get legendOn() {
        for (const symbol of this._icons) {
            if (symbol.rulekey === '') {
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
     *
     * @type {Number}
     **/
    get childrenCount() {
        if (this._root !== null) {
            return this._root.size;
        }
        return this._icons.length;
    }

    /**
     * The children icons
     *
     * @type {Array<SymbolIconSymbology|SymbolRuleSymbology>}
     **/
    get children() {
        if (this._root !== null) {
            return [...this._root.values()];
        }
        return [...this._icons];
    }

    /**
     * Iterate through children icons
     *
     * @generator
     * @yields {SymbolIconSymbology|SymbolRuleSymbology} The next child icon
     **/
    *getChildren() {
        for (const child of this.children) {
            yield child;
        }
    }

    /**
     * Parameters for OGC WMS Request
     *
     * @param {String} wmsName
     *
     * @returns {Object} can contain LEGEND_ON and LEGEND_OFF parameters
     **/
    wmsParameters(wmsName) {
        let params = {
        }
        let keyChecked = [];
        let keyUnchecked = [];
        for (const symbol of this._icons) {
            if (symbol.rulekey === '') {
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
     *
     * @param {Object}  node       - the QGIS node symbology
     * @param {String}  node.type  - the node type: group
     * @param {Array}   node.nodes - the png image in base64
     * @param {String}  node.name  - the layer name
     * @param {String}  node.title - the node title
     **/
    constructor(node) {

        if (!node.hasOwnProperty('type') || node.type != 'group') {
            throw new ValidationError('The layer group symbology is only available for group type!');
        }

        super(node, layerGroupProperties, {})

        this._symbologyNodes = [];
        for(const node of this._nodes) {
            if (node.hasOwnProperty('symbols')) {
                this._symbologyNodes.push(new BaseSymbolsSymbology(node));
            } else if (node.hasOwnProperty('icon')) {
                this._symbologyNodes.push(new BaseIconSymbology(node));
            }
        }
    }

    /**
     * The layer name
     *
     * @type {String}
     **/
    get name() {
        return this._name;
    }

    /**
     * Children nodes count
     *
     * @type {Number}
     **/
    get childrenCount() {
        return this._symbologyNodes.length;
    }

    /**
     * The children nodes
     *
     * @type {Array.<BaseIconSymbology|BaseSymbolsSymbology>}
     **/
    get children() {
        return [...this._symbologyNodes];
    }

    /**
     * Iterate through children nodes
     *
     * @generator
     * @yields {(BaseIconSymbology|BaseSymbolsSymbology)} The next child node
     **/
    *getChildren() {
        for (const node of this._symbologyNodes) {
            yield node;
        }
    }
}

/**
 * Build layer symbology
 *
 * @param {(Object|LayerIconSymbology|LayerSymbolsSymbology|LayerGroupSymbology)} node - The symbology node
 *
 * @returns {(LayerIconSymbology|LayerSymbolsSymbology|LayerGroupSymbology)}
 **/
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
