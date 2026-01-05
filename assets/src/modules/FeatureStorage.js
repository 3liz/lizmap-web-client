/**
 * @module modules/FeatureStorage.js
 * @name FeatureStorage
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import {mainEventDispatcher} from '../modules/Globals.js';

/**
 * @class
 * @name FeatureStorage
 */
export default class FeatureStorage {

    constructor() {
        this._features = [];
        this._metadata = {
            geometryType: null,
            sourceLayer: null,
            sourceCRS: null
        };
    }

    get(){
        return {
            features: Array.from(this._features),
            metadata: { ...this._metadata }
        };
    }

    set(features, tool){
        this._features = Array.from(features);
        mainEventDispatcher.dispatch({
            type: 'featureStorage.set',
            tool: tool
        });
    }

    /**
     * Copy features to storage with metadata
     * @param {Array} features - Array of features to copy
     * @param {object} metadata - Metadata about the copied features
     * @param {string} metadata.geometryType - Type of geometry
     * @param {string} metadata.sourceLayer - Source layer name
     * @param {string} metadata.sourceCRS - Source coordinate reference system
     */
    copy(features, metadata = {}) {
        this._features = Array.from(features);
        this._metadata = {
            geometryType: metadata.geometryType || null,
            sourceLayer: metadata.sourceLayer || null,
            sourceCRS: metadata.sourceCRS || null
        };

        mainEventDispatcher.dispatch({
            type: 'featureStorage.copy',
            features: this._features,
            metadata: this._metadata
        });
    }

    /**
     * Clear all stored features and metadata
     */
    clear() {
        this._features = [];
        this._metadata = {
            geometryType: null,
            sourceLayer: null,
            sourceCRS: null
        };

        mainEventDispatcher.dispatch({
            type: 'featureStorage.clear'
        });
    }

    /**
     * Check if storage has features
     * @returns {boolean} True if features are stored
     */
    hasFeatures() {
        return this._features.length > 0;
    }
}
