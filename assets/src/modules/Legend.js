/**
 * @module modules/Legend.js
 * @name Legend
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { LayerTreeGroupState } from '../modules/state/LayerTree.js'
import { updateLayerTreeLayerSymbology, updateLayerTreeGroupLayersSymbology } from '../modules/action/Symbology.js';

/**
 * @class
 * @name Legend
 */
export default class Legend {

    /**
     * Create a legend instance
     * @param {LayerTreeGroupState} layerTree - Root tree layer group
     */
    constructor(layerTree) {
        // Init all symbologies
        if(layerTree.childrenCount === 0){
            return;
        }

        updateLayerTreeGroupLayersSymbology(layerTree);

        // Refresh symbology when a layer's style changes
        layerTree.addListener(
            evt => {
                updateLayerTreeLayerSymbology(layerTree.getTreeLayerByName(evt.name));
            },['layer.style.changed']
        );
    }
}
