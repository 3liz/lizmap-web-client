import { BaseObjectConfig } from './BaseObject.js';

const optionalProperties = {
    // Lizmap plugin 3.1.8 is the minimum version when these keys were included in the CFG file
    // At that time, it was LWC 3.2 the stable version.
    'lizmap_plugin_version_str': {type: 'string', default: '3.1.8'},
    'lizmap_plugin_version': {type: 'number', default: 30108},
    'lizmap_web_client_target_version': {type: 'number', default: 30200},
    'project_valid': {type: 'boolean', nullable: true, default: null},
    'qgis_desktop_version': {type: 'null', default: 30000}
};

/**
 * Class representing the metadata config
 * @class
 * @augments BaseObjectConfig
 */
export class MetadataConfig extends BaseObjectConfig {

    /**
     * Create a metadata config instance based on a config object
     * @param {Object}  cfg                                          - the lizmap config object
     * @param {String}  [cfg.lizmap_plugin_version_str='3.1.8']      - the lizmap plugin version as string used to configure the project
     * @param {Number}  [cfg.lizmap_plugin_version=30108]            - the lizmap plugin version as integer used to configure the project
     * @param {Number}  [cfg.lizmap_web_client_target_version=30200] - the target lizmap web client version as integer
     * @param {Boolean} [cfg.project_valid]                          - Is the project valid ?
     * @param {Number}  [cfg.qgis_desktop_version=30000]             - the QGIS Desktop version as integer used to build the project
     */
    constructor(cfg = {}) {
        super(cfg, {}, optionalProperties)
    }

    /**
     * The lizmap plugin version as string used to configure the project
     *
     * @type {String}
     **/
    get lizmap_plugin_version_str() {
        return this._lizmap_plugin_version_str;
    }

    /**
     * The lizmap plugin version as integer used to configure the project
     *
     * @type {Number}
     **/
    get lizmap_plugin_version() {
        return this._lizmap_plugin_version;
    }

    /**
     * The target lizmap web client version as integer
     *
     * @type {Number}
     **/
    get lizmap_web_client_target_version() {
        return this._lizmap_web_client_target_version;
    }


    /**
     * Is the project valid ?
     *
     * @type {?Boolean}
     **/
    get project_valid() {
        return this._project_valid;
    }

    /**
     * The QGIS Desktop version as integer used to build the project
     *
     * @type {Number}
     **/
    get qgis_desktop_version() {
        return this._qgis_desktop_version;
    }
}
