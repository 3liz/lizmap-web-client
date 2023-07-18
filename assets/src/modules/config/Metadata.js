/**
 * @module config/Metadata.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

import { BaseObjectConfig } from './BaseObject.js';

const optionalProperties = {
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
     *
     * @param {Object}  cfg                                          - the lizmap config object
     * @param {String}  [cfg.lizmap_plugin_version]                  - the lizmap plugin version as number used to configure the project
     * @param {String}  [cfg.lizmap_plugin_version_str]              - the lizmap plugin version as string used to configure the project
     * @param {Number}  [cfg.lizmap_web_client_target_version=30200] - the target lizmap web client version as integer
     * @param {Boolean} [cfg.project_valid]                          - Is the project valid ?
     * @param {Number}  [cfg.qgis_desktop_version=30000]             - the QGIS Desktop version as integer used to build the project
     */
    constructor(cfg = {}) {
        super(cfg, {}, optionalProperties)
        if (cfg.hasOwnProperty('lizmap_plugin_version_str')
            && cfg.hasOwnProperty('lizmap_plugin_version')) {
            // If the keys lizmap_plugin_version_str and lizmap_plugin_version are included
            // Nothing to do, just stored its
            this._lizmap_plugin_version_str = cfg['lizmap_plugin_version_str'];
            this._lizmap_plugin_version = cfg['lizmap_plugin_version'];
        } else if (cfg.hasOwnProperty('lizmap_plugin_version')) {
            // If the key lizmap_plugin_version is included
            // we need to do some conversions
            const lizmap_plugin_version = cfg['lizmap_plugin_version']+'';
            if (lizmap_plugin_version.includes('.')) {
                this._lizmap_plugin_version_str = lizmap_plugin_version;
                const version = lizmap_plugin_version.split('-')[0].split('.');
                this._lizmap_plugin_version = version[0]*10000+version[1]*100+version[2]*1;
            } else if (lizmap_plugin_version == 'master') {
                this._lizmap_plugin_version_str = lizmap_plugin_version;
                this._lizmap_plugin_version = 999999;
            } else {
                const version = parseInt(lizmap_plugin_version);
                if (!version.isNaN()) {
                    this._lizmap_plugin_version_str = Math.trunc(version / 10000)+'.'+Math.trunc(version % 10000 / 100)+'.'+(version % 100);
                    this._lizmap_plugin_version = version;
                }
            }
        } else {
            // Lizmap plugin 3.1.8 is the minimum version when the lizmap_plugin_version key was
            // included in the CFG file
            // At that time, it was LWC 3.2 the stable version.
            this._lizmap_plugin_version_str = '3.1.8';
            this._lizmap_plugin_version = 30108;
        }
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
