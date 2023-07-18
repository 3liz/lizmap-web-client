/**
 * @module config/LayerTree.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

import { Extent } from './../utils/Extent.js';
import { AttributionConfig } from './Attribution.js';

/**
 * Class representing a wMS layer Geographic Bounding Box
 * @class
 * @augments Extent
 */
export class LayerGeographicBoundingBoxConfig extends Extent {

    /**
     * Create the WMS layer Geographic Bounding Box
     *
     * @param {...Number} args - the 4 values describing the Geographic Bounding Box: west, south, east, north
     *
     * @throws {ValidationError} for number of args different of 4
     * @throws {ConversionError} for values not number
     */
    constructor(...args) {
        super(...args);
    }

    /**
     * @type {Number}
     **/
    get west() {
        return this[0];
    }

    /**
     * @type {Number}
     **/
    get south() {
        return this[1];
    }

    /**
     * @type {Number}
     **/
    get east() {
        return this[2];
    }

    /**
     * @type {Number}
     **/
    get north() {
        return this[3];
    }
}

/**
 * Class representing a WMS layer Bounding Box
 * @class
 * @augments Extent
 */
export class LayerBoundingBoxConfig extends Extent {
    /**
     * Create the WMS layer Geographic Bounding Box
     * @param {String}   crs    - the CRS name
     * @param {Number[]} values - the 4 values describing the Geographic Bounding Box: west, south, east, north
     *
     * @throws {ValidationError} for number of args different of 4
     * @throws {ConversionError} for values not number
     */
    constructor(crs, values) {
        super(...values);
        this._crs = crs;
    }

    /**
     * The CRS name
     *
     * @type {String}
     **/
    get crs() {
        return this._crs;
    }
}

/**
 * Class representing a WMS layer Style
 * @class
 */
export class LayerStyleConfig {

    /**
     * Create a WMS layer Style instance
     *
     * @param {String} wmsName  - the layer WMS style name
     * @param {String} wmsTitle - the layer WMS style title
     */
    constructor(wmsName, wmsTitle) {
        this._wmsName = wmsName;
        this._wmsTitle = wmsTitle;
    }

    /**
     * WMS Style name
     *
     * @type {String}
     **/
    get wmsName() {
        return this._wmsName;
    }

    /**
     * WMS Style title
     *
     * @type {String}
     **/
    get wmsTitle() {
        if (!this._wmsTitle) {
            return this._wmsName;
        }
        return this._wmsTitle;
    }

}

/**
 * Class representing a layer tree item config
 * @class
 */
export class LayerTreeItemConfig {

    /**
     * Create a layer tree item config instance
     *
     * @param {String}      name         - the QGIS layer name
     * @param {String}      type         - the layer tree item type
     * @param {Number}      level        - the layer tree item level
     * @param {Object}      wmsCapaLayer - the WMS capabilities layer element
     * @param {LayerConfig} [layerCfg]   - the lizmap layer config
     */
    constructor(name, type, level, wmsCapaLayer, layerCfg) {
        this._name = name;
        this._type = type;
        this._level = level;
        this._wmsCapa = wmsCapaLayer;
        if (!layerCfg) {
            this._layerCfg = null;
        } else {
            this._layerCfg = layerCfg;
        }
    }

    /**
     * The layer name - QGIS layer name
     *
     * @type {String}
     **/
    get name() {
        return this._name;
    }

    /**
     * The layer tree item type
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
        return this._level;
    }

    /**
     * WMS layer name
     *
     * @type {?String}
     **/
    get wmsName() {
        if(!this._wmsCapa.hasOwnProperty('Name')) {
            return null;
        }
        return this._wmsCapa.Name;
    }

    /**
     * WMS layer title
     *
     * @type {String}
     **/
    get wmsTitle() {
        return this._wmsCapa.Title;
    }

    /**
     * WMS layer abstract
     *
     * @type {?String}
     **/
    get wmsAbstract() {
        if(!this._wmsCapa.hasOwnProperty('Abstract')) {
            return null;
        }
        return this._wmsCapa.Abstract;
    }

    /**
     * WMS layer Geographic Bounding Box
     *
     * @type {?LayerGeographicBoundingBoxConfig}
     **/
    get wmsGeographicBoundingBox() {
        if(!this._wmsCapa.hasOwnProperty('EX_GeographicBoundingBox')) {
            return null;
        }
        return new LayerGeographicBoundingBoxConfig(...this._wmsCapa.EX_GeographicBoundingBox);
    }

    /**
     * WMS layer Bounding Boxes
     *
     * @type {LayerBoundingBoxConfig[]}
     **/
    get wmsBoundingBoxes() {
        let wmsBoundingBoxes = [];
        for(const wmsBoundingBox of this._wmsCapa.BoundingBox) {
            wmsBoundingBoxes.push(new LayerBoundingBoxConfig(wmsBoundingBox.crs, wmsBoundingBox.extent))
        }
        return [...wmsBoundingBoxes];
    }

    /**
     * WMS layer minimum scale denominator
     * If the minimum scale denominator is not defined: -1 is returned
     *
     * @type {Number}
     **/
    get wmsMinScaleDenominator() {
        if(!this._wmsCapa.hasOwnProperty('MinScaleDenominator')) {
            return -1;
        }
        return this._wmsCapa.MinScaleDenominator;
    }

    /**
     * WMS layer maximum scale denominator
     * If the maximum scale denominator is not defined: -1 is returned
     *
     * @type {Number}
     **/
    get wmsMaxScaleDenominator() {
        if(!this._wmsCapa.hasOwnProperty('MaxScaleDenominator')) {
            return -1;
        }
        return this._wmsCapa.MaxScaleDenominator;
    }

    /**
     * Lizmap layer config
     *
     * @type {?LayerConfig}
     **/
    get layerConfig() {
        return this._layerCfg;
    }
}

/**
 * Class representing a layer tree layer config
 * @class
 * @augments LayerTreeItemConfig
 */
export class LayerTreeLayerConfig extends LayerTreeItemConfig {

    /**
     * Create a layer tree layer config instance
     *
     * @param {String}      name         - the QGIS layer name
     * @param {Number}      level        - the layer tree item level
     * @param {Object}      wmsCapaLayer - the WMS capabilities layer element
     * @param {LayerConfig} layerCfg     - the lizmap layer config
     */
    constructor(name, level, wmsCapaLayer, layerCfg) {
        super(name, 'layer', level, wmsCapaLayer, layerCfg);
        this._wmsStyles = null;
    }

    /**
     * WMS layer styles
     *
     * @type {LayerStyleConfig[]}
     **/
    get wmsStyles() {
        if (this._wmsStyles !== null) {
            return this._wmsStyles;
        }
        if(!this._wmsCapa?.['Style']) {
            this._wmsStyles = [new LayerStyleConfig('', 'Default')];
        } else {
            let wmsStyles = [];
            for(const wmsStyle of this._wmsCapa.Style) {
                wmsStyles.push(new LayerStyleConfig(wmsStyle.Name, wmsStyle.Title))
            }
            this._wmsStyles = wmsStyles;
        }
        return [...this._wmsStyles];
    }

    /**
     * WMS layer attribution
     *
     * @type {?AttributionConfig}
     **/
    get wmsAttribution() {
        if(!this._wmsCapa?.['Attribution']) {
            return null;
        }
        const attribution = this._wmsCapa.Attribution;
        if(!attribution.hasOwnProperty('Title') || !attribution.hasOwnProperty('OnlineResource')) {
            return null;
        }
        return new AttributionConfig({
            title: attribution.Title,
            url: attribution.OnlineResource,
        });
    }
}

/**
 * Class representing a layer tree group config
 * @class
 * @augments LayerTreeItemConfig
 */
export class LayerTreeGroupConfig extends LayerTreeItemConfig {

    /**
     * Create a layer tree group config instance
     *
     * @param {String}                name         - the QGIS layer name
     * @param {Number}                level        - the layer tree item level
     * @param {LayerTreeItemConfig[]} items        - the children layer tree items
     * @param {Object}                wmsCapaLayer - the WMS capabilities layer element
     * @param {LayerConfig}           [layerCfg]   - the lizmap layer config
     */
    constructor(name, level, items, wmsCapaLayer, layerCfg) {
        super(name, 'group', level, wmsCapaLayer, layerCfg);
        this._items = items;
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
     * @type {LayerTreeItemConfig[]}
     **/
    get children() {
        return [...this._items];
    }

    /**
     * Iterate through children items
     *
     * @generator
     * @yields {LayerTreeItemConfig} The next child item
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
    findTreeLayerConfigNames() {
        let names = []
        for(const item of this.getChildren()) {
            if (item instanceof LayerTreeLayerConfig) {
                names.push(item.name);
            } else if (item instanceof LayerTreeGroupConfig) {
                names = names.concat(item.findTreeLayerConfigNames());
            }
        }
        return names;
    }

    /**
     * Find layer items
     *
     * @returns {LayerTreeLayer[]}
     **/
    findTreeLayerConfigs() {
        let items = []
        for(const item of this.getChildren()) {
            if (item instanceof LayerTreeLayerConfig) {
                items.push(item);
            } else if (item instanceof LayerTreeGroupConfig) {
                items = items.concat(item.findTreeLayerConfigs());
            }
        }
        return items;
    }
}

/**
 * Function to build layer tree items config based on WMS capabilities
 * @function
 *
 * @param {Object}       wmsCapaLayerGroup - the wms layer capabilities
 * @param {LayersConfig} layersCfg         - the lizmap layers config instance
 * @param {Number}       level             - the wms layer level
 *
 * @returns {LayerTreeItemConfig[]} the layer tree items of the wms layer
 */
function buildLayerTreeGroupConfigItems(wmsCapaLayerGroup, layersCfg, level) {
    let items = [];
    if (!wmsCapaLayerGroup.hasOwnProperty('Layer')) {
        return items;
    }
    for(const wmsCapaLayer of wmsCapaLayerGroup.Layer) {
        const wmsName = wmsCapaLayer.Name;
        const cfg = layersCfg.getLayerConfigByWmsName(wmsName);
        if (cfg == null) {
            throw new RangeError('The WMS layer name `'+ wmsName +'` is unknown!');
        }
        if (wmsCapaLayer.hasOwnProperty('Layer') && wmsCapaLayer.Layer.length != 0) {
            const groupItems = buildLayerTreeGroupConfigItems(wmsCapaLayer, layersCfg, level+1);
            items.push(new LayerTreeGroupConfig(cfg.name, level+1, groupItems, wmsCapaLayer, cfg));
        } else {
            items.push(new LayerTreeLayerConfig(cfg.name, level+1, wmsCapaLayer, cfg));
        }
    }
    return items;
}

/**
 * Function to build the root layer tree config based on WMS capabilities
 * @function
 *
 * @param {Object}       wmsCapaLayerRoot - the wms root layer capabilities
 * @param {LayersConfig} layersCfg        - the lizmap layers config instance
 *
 * @returns {LayerTreeGroupConfig} The root layer tree config based on WMS capabilities
 */
export function buildLayerTreeConfig(wmsCapaLayerRoot, layersCfg) {
    let items = buildLayerTreeGroupConfigItems(wmsCapaLayerRoot, layersCfg, 0);
    return new LayerTreeGroupConfig('root', 0, items, wmsCapaLayerRoot);
}
