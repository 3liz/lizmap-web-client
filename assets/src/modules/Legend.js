import { updateLayerTreeLayerSymbology, updateLayerTreeGroupLayersSymbology } from '../modules/action/Symbology.js';

export default class Legend {

    /**
     * Create a legend instance
     *
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
