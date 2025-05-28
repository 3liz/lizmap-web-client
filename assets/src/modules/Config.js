/**
 * @module modules/Config.js
 * @name Config
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { ValidationError } from './Errors.js';
import { deepFreeze } from './config/Tools.js';
import { MetadataConfig } from './config/Metadata.js';
import { OptionsConfig } from './config/Options.js';
import { LayersConfig } from './config/Layer.js';
import { BaseLayersConfig } from './config/BaseLayer.js';
import { LocateByLayerConfig } from './config/Locate.js';
import { AttributeLayersConfig } from './config/AttributeTable.js';
import { TooltipLayersConfig } from './config/Tooltip.js';
import { EditionLayersConfig } from './config/Edition.js';
import { TimeManagerLayersConfig } from './config/TimeManager.js';
import { FormFilterConfig } from './config/FormFilter.js';
import { ThemesConfig } from './config/Theme.js';
import { DatavizOptionsConfig, DatavizLayersConfig } from './config/Dataviz.js';
import { buildLayerTreeConfig, LayerTreeGroupConfig } from './config/LayerTree.js';
import { buildLayersOrder } from './config/LayersOrder.js';

/**
 * @typedef WfsFeatureType
 * @type {object}
 * @property {string} Name  - The layer typename.
 * @property {string} Title - The layer title.
 * @property {string} SRS   - The layer CRS code.
 * @property {number[]} LatLongBoundingBox - The layer bounding box in the layer CRS
 */

/**
 * @class
 * @name Config
 */
export class Config {

    /**
     * Create a new Config object
     * @param {object} cfg               - the lizmap config object
     * @param {object} wmsCapabilities   - the WMS capabilities
     * @param {object} [wfsCapabilities] - the WFS capabilities
     */
    constructor(cfg, wmsCapabilities, wfsCapabilities) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The config is not an Object! It\'s '+(typeof cfg));
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The config is empty!');
        }

        if (!wmsCapabilities || typeof wmsCapabilities !== "object") {
            throw new ValidationError('The WMS Capabilities is not an Object! It\'s '+(typeof wmsCapabilities));
        }

        if (Object.getOwnPropertyNames(wmsCapabilities).length == 0) {
            throw new ValidationError('The WMS Capabilities is empty!');
        }

        this._theConfig = null;
        this._theWmsCapabilities = null;
        this._theWfsCapabilities = null;
        this._options = null;
        this._layers = null;
        this._layerTree = null;
        this._invalidLayers = null;
        this._baselayers = null;
        this._layersOrder = null;
        this._hasMetadata = true;
        this._metadata = null;
        this._hasLocateByLayer = true;
        this._locateByLayer = null;
        this._hasAttributeLayers = true;
        this._attributeLayers = null;
        this._hasTimemanagerLayers = true;
        this._timemanagerLayers = null;
        this._hasRelations = true;
        this._hasPrintTemplates = true;
        this._hasTooltipLayers = true;
        this._tooltipLayers = null;
        this._hasEditionLayers = true;
        this._editionLayers = null;
        this._hasFormFilterLayers = true;
        this._formFilterLayers = null;
        this._hasLoginFilteredLayers = true;
        this._hasThemes = true;
        this._themes = null;
        this._hasDatavizConfig = true;
        this._datavizLayers = null;
        this._datavizOptions = null;

        const theConfig = deepFreeze(cfg);

        // checking config
        const mandatoryConfigProperties = [
            'options',
            'layers',
            'datavizLayers' // needed for locale property to build plot
        ];
        for (const prop of mandatoryConfigProperties) {
            if (!theConfig.hasOwnProperty(prop)) {
                throw new ValidationError('No `' + prop + '` in the config!');
            }
        }

        const theWmsCapabilities = deepFreeze(wmsCapabilities);

        // checking WMS Capabilities
        const mandatoryWmsCapabilitiesgProperties = [
            'Capability', //needed for  layers tree
        ];
        for (const prop of mandatoryWmsCapabilitiesgProperties) {
            if (!theWmsCapabilities.hasOwnProperty(prop)) {
                throw new ValidationError('No `' + prop + '` in the WMS Capabilities!');
            }
        }
        this._theConfig = theConfig;
        this._theWmsCapabilities = theWmsCapabilities;
        if (wfsCapabilities) {
            this._theWfsCapabilities = deepFreeze(wfsCapabilities);
        }

        const optionalConfigProperties = [
            'metadata',
            'locateByLayer',
            'attributeLayers',
            'timemanagerLayers',
            'relations',
            'printTemplates',
            'tooltipLayers',
            'editionLayers',
            'formFilterLayers',
            'loginFilteredLayers',
            'themes'
        ];
        for (const prop of optionalConfigProperties) {
            if (!theConfig.hasOwnProperty(prop)
                || Object.getOwnPropertyNames(theConfig[prop]).length == 0) {
                this['_has'+prop.charAt(0).toUpperCase() + prop.slice(1)] = false;
            }
        }

        // check datavizConfig
        if ((!theConfig.datavizLayers.hasOwnProperty('layers')
            || Object.getOwnPropertyNames(theConfig.datavizLayers.layers).length == 0)
            && (!theConfig.datavizLayers.hasOwnProperty('dataviz')
            || Object.getOwnPropertyNames(theConfig.datavizLayers.dataviz).length == 0)) {
            this._hasDatavizConfig = false;
        }
    }

    /**
     * Config options
     * @type {OptionsConfig}
     */
    get options() {
        if (this._options != null) {
            return this._options;
        }
        this._options = new OptionsConfig(this._theConfig.options);
        return this._options;
    }

    /**
     * Config layers
     * @type {LayersConfig}
     */
    get layers() {
        if (this._layers != null) {
            return this._layers;
        }
        this._layers = new LayersConfig(this._theConfig.layers);
        return this._layers;
    }

    /**
     * Root tree layer group
     * @type {LayerTreeGroupConfig}
     */
    get layerTree() {
        if (this._layerTree == null) {
            this._invalidLayers = [];
            this._layerTree = buildLayerTreeConfig(
                this._theWmsCapabilities.Capability.Layer,
                this.layers,
                this._invalidLayers,
            );
        }
        return this._layerTree;
    }

    /**
     * List of invalid layers, not found in the Lizmap configuration file, but found in the WMS GetCapabilities.
     * @type {string[]}
     */
    get invalidLayersNotFoundInCfg() {
        if (this._invalidLayers == null) {
            this.layerTree;
        }
        return this._invalidLayers;
    }

    /**
     * Config base layers
     * @type {BaseLayersConfig}
     */
    get baseLayers() {
        if (this._baselayers != null) {
            return this._baselayers;
        }
        let baseLayersCfg = {};
        if (this._theConfig.hasOwnProperty('baseLayers')) {
            baseLayersCfg = this._theConfig.baseLayers;
        }
        let baseLayerTreeItem = null;
        for (const layerTreeItem of this.layerTree.getChildren()) {
            if ( layerTreeItem.name.toLowerCase() == 'baselayers') {
                baseLayerTreeItem = layerTreeItem;
                break;
            }
        }
        let hiddenTreeItem = null;
        for (const layerTreeItem of this.layerTree.getChildren()) {
            if ( layerTreeItem.name.toLowerCase() == 'hidden') {
                hiddenTreeItem = layerTreeItem;
                break;
            }
        }
        this._baselayers = new BaseLayersConfig(baseLayersCfg, this._theConfig.options, this.layers, baseLayerTreeItem, hiddenTreeItem);
        return this._baselayers;
    }

    /**
     * Layer names displaying order like in QGIS
     *
     * The first one in this list is the top one in the map
     * The last one in this list is the bottom one in the map
     * @type {string[]}
     */
    get layersOrder() {
        if (this._layersOrder == null) {
            this._layersOrder = buildLayersOrder(this._theConfig, this.layerTree);
        }
        return [...this._layersOrder];
    }

    /**
     * The list of format for file export
     * @type {string[]}
     */
    get vectorLayerResultFormat() {
        const formats = [];
        if ( this._theWfsCapabilities == null ){
            return formats;
        }

        for (const request of this._theWfsCapabilities.Capability.Request) {
            if (request.name != 'GetFeature') {
                continue;
            }
            return request.ResultFormat
        }
        return formats;
    }

    /**
     * The list of WFS feature type
     * @type {WfsFeatureType[]}
     */
    get vectorLayerFeatureTypeList() {
        const featureTypes = [];
        if ( this._theWfsCapabilities == null ){
            return featureTypes;
        }
        if ( this._theWfsCapabilities.FeatureTypeList &&
            this._theWfsCapabilities.FeatureTypeList.FeatureType
        ) {
            return this._theWfsCapabilities.FeatureTypeList.FeatureType;
        }
        return featureTypes;
    }

    /**
     * Config metadata
     * @type {MetadataConfig}
     */
    get metadata() {
        if (this._metadata != null) {
            return this._metadata;
        }
        if (this._hasMetadata) {
            this._metadata = new MetadataConfig(this._theConfig.metadata);
        } else {
            this._metadata = new MetadataConfig();
        }
        return this._metadata;
    }

    /**
     * Locate by layer config is defined
     * @type {boolean}
     */
    get hasLocateByLayer() {
        return this._hasLocateByLayer;
    }

    /**
     * Config locateByLayer
     * @type {LocateByLayerConfig|null}
     */
    get locateByLayer() {
        if (this._hasLocateByLayer) {
            if (this._locateByLayer != null) {
                return this._locateByLayer;
            }
            this._locateByLayer = new LocateByLayerConfig(this._theConfig.locateByLayer);
        }
        return this._locateByLayer;
    }

    /**
     * Attribute layers config is defined
     * @type {boolean}
     */
    get hasAttributeLayers() {
        return this._hasAttributeLayers;
    }

    /**
     * Config attribueLayers
     * @type {AttributeLayersConfig|null}
     */
    get attributeLayers() {
        if (this._hasAttributeLayers) {
            if (this._attributeLayers != null) {
                return this._attributeLayers;
            }
            this._attributeLayers = new AttributeLayersConfig(this._theConfig.attributeLayers);
        }
        return this._attributeLayers;
    }

    /**
     * Time manager config is defined
     * @type {boolean}
     */
    get hasTimemanagerLayers() {
        return this._hasTimemanagerLayers;
    }

    /**
     * Config timemanagerLayers
     * @type {AttributeLayersConfig|null}
     */
    get timemanagerLayers() {
        if (this._hasTimemanagerLayers) {
            if (this._timemanagerLayers != null) {
                return this._timemanagerLayers;
            }
            this._timemanagerLayers = new TimeManagerLayersConfig(this._theConfig.timemanagerLayers);
        }
        return this._timemanagerLayers;
    }

    /**
     * Relations config is defined
     * @type {boolean}
     */
    get hasRelations() {
        return this._hasRelations;
    }

    /**
     * Print templates config is defined
     * @type {boolean}
     */
    get hasPrintTemplates() {
        return this._hasPrintTemplates;
    }

    /**
     * Tooltip layers config is defined
     * @type {boolean}
     */
    get hasTooltipLayers() {
        return this._hasTooltipLayers;
    }

    /**
     * Config tooltipLayers
     * @type {TooltipLayersConfig|null}
     */
    get tooltipLayers() {
        if (this._hasTooltipLayers) {
            if (this._tooltipLayers != null) {
                return this._tooltipLayers;
            }
            this._tooltipLayers = new TooltipLayersConfig(this._theConfig.tooltipLayers);
        }
        return this._tooltipLayers;
    }

    /**
     * Edition layers config is defined
     * @type {boolean}
     */
    get hasEditionLayers() {
        return this._hasEditionLayers;
    }

    /**
     * Config editionLayers
     * @type {EditionLayersConfig|null}
     */
    get editionLayers() {
        if (this._hasEditionLayers) {
            if (this._editionLayers != null) {
                return this._editionLayers;
            }
            this._editionLayers = new EditionLayersConfig(this._theConfig.editionLayers);
        }
        return this._editionLayers;
    }

    /**
     * Form filter layers config is defined
     * @type {boolean}
     */
    get hasFormFilterLayers() {
        return this._hasFormFilterLayers;
    }

    /**
     * Config formFilterLayers
     * @type {FormFilterConfig|null}
     */
    get formFilterLayers() {
        if (this.hasFormFilterLayers) {
            if (this._formFilterLayers != null) {
                return this._formFilterLayers;
            }
            this._formFilterLayers = new FormFilterConfig(this._theConfig.formFilterLayers);
        }
        return this._formFilterLayers;
    }

    /**
     * Login filtered layers config is defined
     * @type {boolean}
     */
    get hasLoginFilteredLayers() {
        return this._hasLoginFilteredLayers;
    }

    /**
     * Themes config is defined
     * @type {boolean}
     */
    get hasThemes() {
        return this._hasThemes;
    }

    /**
     * Config themes
     * @type {ThemesConfig|null}
     */
    get themes() {
        if (this.hasThemes) {
            if (this._themes != null) {
                return this._themes;
            }
            this._themes = new ThemesConfig(this._theConfig.themes);
        }
        return this._themes;
    }

    /**
     * Dataviz locale
     * @type {string}
     */
    get datavizLocale() {
        return this._theConfig.datavizLayers.locale;
    }

    /**
     * Dataviz config is defined
     * @type {boolean}
     */
    get hasDatavizConfig() {
        return this._hasDatavizConfig;
    }

    /**
     * Config datavizLayers
     * @type {DatavizLayersConfig|null}
     */
    get datavizLayers() {
        if (this._hasDatavizConfig) {
            if (this._datavizLayers != null) {
                return this._datavizLayers;
            }
            this._datavizLayers = new DatavizLayersConfig(this._theConfig.datavizLayers.layers);
        }
        return this._datavizLayers;
    }

    /**
     * Config datavizOptions
     * @type {DatavizOptionsConfig|null}
     */
    get datavizOptions() {
        if (this._hasDatavizConfig) {
            if (this._datavizOptions != null) {
                return this._datavizOptions;
            }
            this._datavizOptions = new DatavizOptionsConfig(this._theConfig.datavizLayers.dataviz);
        }
        return this._datavizOptions;
    }
}
