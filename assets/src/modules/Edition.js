import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';

export default class Edition {

    constructor() {
        this.drawFeatureActivated = false;
        this.layerGeometry = undefined;
        this.drawControl = undefined;
        this._lastSegmentLength = undefined;

        lizMap.events.on({
            lizmapeditiondrawfeatureactivated: (properties) => {
                this.drawFeatureActivated = true;
                this.layerGeometry = properties.editionConfig.geometryType;
                this.drawControl = properties.drawControl;
                mainEventDispatcher.dispatch('edition.drawFeatureActivated');
            },
            lizmapeditiondrawfeaturedeactivated: () => {
                this.drawFeatureActivated = false;
                this.layerGeometry = undefined;
                this.drawControl = undefined;
                this.lastSegmentLength = undefined;
                mainEventDispatcher.dispatch('edition.drawFeatureActivated');
            }
        });
    }

    get hasEditionLayers() {
        return 'editionLayers' in mainLizmap.lizmap3.config;
    }

    get editLayer() {
        const editLayer = mainLizmap.lizmap3.map.getLayersByName('editLayer');
        if (editLayer.length === 1) {
            return editLayer[0];
        } else {
            return undefined;
        }
    }

    get lastSegmentLength() {
        return this._lastSegmentLength;
    }

    set lastSegmentLength(lastSegmentLength) {
        if (this._lastSegmentLength !== lastSegmentLength) {
            this._lastSegmentLength = lastSegmentLength;

            mainEventDispatcher.dispatch('edition.lastSegmentLength');
        }
    }
}
