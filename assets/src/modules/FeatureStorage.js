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
    }

    get(){
        return Array.from(this._features);
    }

    set(features, tool){
        this._features = Array.from(features);
        mainEventDispatcher.dispatch({
            type: 'featureStorage.set',
            tool: tool
        });
    }
}
