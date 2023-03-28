import {mainEventDispatcher} from '../modules/Globals.js';

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