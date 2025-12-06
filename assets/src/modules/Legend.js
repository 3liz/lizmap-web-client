/**
 * @module modules/Legend.js
 * @name Legend
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { LayerTreeGroupState } from '../modules/state/LayerTree.js'
import { updateLayerTreeLayerSymbology, updateLayerTreeLayersSymbology } from '../modules/action/Symbology.js';

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

        // Filter out layers with legendImageOption set to "disabled"
        const treeLayers = layerTree.findTreeLayers().filter(
            layer => layer.layerConfig.legendImageOption !== "disabled"
        );
        updateLayerTreeLayersSymbology(treeLayers);

        // Refresh symbology when a layer's style changes
        layerTree.addListener(
            evt => {
                const layer = layerTree.getTreeLayerByName(evt.name);
                if (layer.layerConfig.legendImageOption !== "disabled") {
                    updateLayerTreeLayerSymbology(layer);
                }
            },['layer.style.changed']
        );
    }
}
