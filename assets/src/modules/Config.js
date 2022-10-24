import { ValidationError } from './Errors.js';
import { deepFreeze } from './config/Tools.js';
import { MetadataConfig } from './config/Metadata.js';
import { OptionsConfig } from './config/Options.js';
import { LocateByLayerConfig } from './config/Locate.js';
import { AttributeLayersConfig } from './config/AttributeTable.js';
import { TooltipLayersConfig } from './config/Tooltip.js';
import { EditionLayersConfig } from './config/Edition.js';
import { TimeManagerLayersConfig } from './config/TimeManager.js';
import { FormFilterConfig } from './config/FormFilter.js';
import { DatavizOptionsConfig, DatavizLayersConfig } from './config/Dataviz.js';

export class Config {

    /**
     * @param {Object} cfg - the lizmap config object
     */
    constructor(cfg) {
        if (!cfg || typeof cfg !== "object") {
            throw new ValidationError('The config is not an Object!');
        }

        if (Object.getOwnPropertyNames(cfg).length == 0) {
            throw new ValidationError('The config is empty!');
        }

        this._theConfig = null;
        this._options = null;
        this._hasMetadata = true;
        this._metadata = null;
        this._hasLocateByLayer = true;
        this._hasAttributeLayers = true;
        this._hasTimemanagerLayers = true;
        this._hasRelations = true;
        this._hasPrintTemplates = true;
        this._hasTooltipLayers = true;
        this._hasEditionLayers = true;
        this._hasFormFilterLayers = true;
        this._hasLoginFilteredLayers = true;
        this._hasDatavizConfig = true;

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

        this._theConfig = theConfig;

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
            'loginFilteredLayers'
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
     *
     * @type {OptionsConfig}
     **/
    get options() {
        if (this._options != null) {
            return this._options;
        }
        this._options = new OptionsConfig(this._theConfig.options);
        return this._options;
    }

    /**
     * Config metadata
     *
     * @type {Metadata}
     **/
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
     *
     * @type {Boolean}
     **/
    get hasLocateByLayer() {
        return this._hasLocateByLayer;
    }

    /**
     * Config locateByLayer
     *
     * @type {LocateByLayerConfig}
     **/
    get locateByLayer() {
        if (this._locateByLayer != null) {
            return this._locateByLayer;
        }
        if (this._hasLocateByLayer) {
            this._locateByLayer = new LocateByLayerConfig(this._theConfig.locateByLayer);
        }
        return this._locateByLayer;
    }

    /**
     * Attribute layers config is defined
     *
     * @type {Boolean}
     **/
    get hasAttributeLayers() {
        return this._hasAttributeLayers;
    }

    /**
     * Config attribueLayers
     *
     * @type {AttributeLayersConfig}
     **/
    get attributeLayers() {
        if (this._attributeLayers != null) {
            return this._attributeLayers;
        }
        if (this._hasAttributeLayers) {
            this._attributeLayers = new AttributeLayersConfig(this._theConfig.attributeLayers);
        }
        return this._attributeLayers;
    }

    /**
     * Time manager config is defined
     *
     * @type {Boolean}
     **/
    get hasTimemanagerLayers() {
        return this._hasTimemanagerLayers;
    }

    /**
     * Config timemanagerLayers
     *
     * @type {AttributeLayersConfig}
     **/
    get timemanagerLayers() {
        if (this._timemanagerLayers != null) {
            return this._timemanagerLayers;
        }
        if (this._hasTimemanagerLayers) {
            this._timemanagerLayers = new TimeManagerLayersConfig(this._theConfig.timemanagerLayers);
        }
        return this._timemanagerLayers;
    }

    /**
     * Relations config is defined
     *
     * @type {Boolean}
     **/
    get hasRelations() {
        return this._hasRelations;
    }

    /**
     * Print templates config is defined
     *
     * @type {Boolean}
     **/
    get hasPrintTemplates() {
        return this._hasPrintTemplates;
    }

    /**
     * Tooltip layers config is defined
     *
     * @type {Boolean}
     **/
    get hasTooltipLayers() {
        return this._hasTooltipLayers;
    }

    /**
     * Config tooltipLayers
     *
     * @type {TooltipLayersConfig}
     **/
    get tooltipLayers() {
        if (this._tooltipLayers != null) {
            return this._tooltipLayers;
        }
        if (this._hasTooltipLayers) {
            this._tooltipLayers = new TooltipLayersConfig(this._theConfig.tooltipLayers);
        }
        return this._tooltipLayers;
    }

    /**
     * Edition layers config is defined
     *
     * @type {Boolean}
     **/
    get hasEditionLayers() {
        return this._hasEditionLayers;
    }

    /**
     * Config editionLayers
     *
     * @type {EditionLayersConfig}
     **/
    get editionLayers() {
        if (this._editionLayers != null) {
            return this._editionLayers;
        }
        if (this._hasEditionLayers) {
            this._editionLayers = new EditionLayersConfig(this._theConfig.editionLayers);
        }
        return this._editionLayers;
    }

    /**
     * Form filter layers config is defined
     *
     * @type {Boolean}
     **/
    get hasFormFilterLayers() {
        return this._hasFormFilterLayers;
    }

    /**
     * Config formFilterLayers
     *
     * @type {FormFilterConfig}
     **/
    get formFilterLayers() {
        if (this._formFilterLayers != null) {
            return this._formFilterLayers;
        }
        if (this.hasFormFilterLayers) {
            this._formFilterLayers = new FormFilterConfig(this._theConfig.formFilterLayers);
        }
        return this._formFilterLayers;
    }

    /**
     * Login filtered layers config is defined
     *
     * @type {Boolean}
     **/
    get hasLoginFilteredLayers() {
        return this._hasLoginFilteredLayers;
    }

    /**
     * Dataviz locale
     *
     * @type {String}
     **/
    get datavizLocale() {
        return this._theConfig.datavizLayers.locale;
    }

    /**
     * Dataviz config is defined
     *
     * @type {Boolean}
     **/
    get hasDatavizConfig() {
        return this._hasDatavizConfig;
    }

    /**
     * Config datavizLayers
     *
     * @type {DatavizLayersConfig}
     **/
    get datavizLayers() {
        if (this._datavizLayers != null) {
            return this._datavizLayers;
        }
        if (this._hasDatavizConfig) {
            this._datavizLayers = new DatavizLayersConfig(this._theConfig.datavizLayers.layers);
        }
        return this._datavizLayers;
    }

    /**
     * Config datavizOptions
     *
     * @type {DatavizOptionsConfig}
     **/
    get datavizOptions() {
        if (this._datavizOptions != null) {
            return this._datavizOptions;
        }
        if (this._hasDatavizConfig) {
            this._datavizOptions = new DatavizOptionsConfig(this._theConfig.datavizLayers.dataviz);
        }
        return this._datavizOptions;
    }
}
