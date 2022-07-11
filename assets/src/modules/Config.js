import { ValidationError } from './Errors.js';
import { deepFreeze } from './config/Tools.js';
import { MetadataConfig } from './config/Metadata.js';
import { OptionsConfig } from './config/Options.js';

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
        this._options = new OptionsConfig(this._theConfig.options);

        const optionalConfigProperties = [
            'metadata',
            'locateByLayer',
            'attributeLayers',
            'timemanagerLayers',
            'relations',
            'printTemplates',
            'tooltipLayers',
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
     * Attribute layers config is defined
     *
     * @type {Boolean}
     **/
    get hasAttributeLayers() {
        return this._hasAttributeLayers;
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
     * Form filter layers config is defined
     *
     * @type {Boolean}
     **/
    get hasFormFilterLayers() {
        return this._hasFormFilterLayers;
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
     * Dataviz config is defined
     *
     * @type {Boolean}
     **/
    get hasDatavizConfig() {
        return this._hasDatavizConfig;
    }

    /**
     * Dataviz locale
     *
     * @type {String}
     **/
    get datavizLocale() {
        return this._theConfig.datavizLayers.locale;
    }
}
