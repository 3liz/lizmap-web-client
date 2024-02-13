/**
 * @module modules/Legend.js
 * @name Legend
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { mainLizmap } from './Globals.js';
import { updateLayerTreeLayerSymbology, updateLayerTreeGroupLayersSymbology } from '../modules/action/Symbology.js';

/**
 * @class
 * @name Legend
 */
export default class Legend {

    constructor() {
        // Init all symbologies
        if(mainLizmap.state.layerTree.childrenCount === 0){
            return;
        }

        updateLayerTreeGroupLayersSymbology(mainLizmap.state.layerTree);

        // Refresh symbology when a layer's style changes
        mainLizmap.state.rootMapGroup.addListener(
            evt => {
                updateLayerTreeLayerSymbology(mainLizmap.state.layerTree.getTreeLayerByName(evt.name));
            },['layer.style.changed']
        );
    }
}
