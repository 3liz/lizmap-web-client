import { mainLizmap } from './Globals.js';
import { updateLayerTreeLayerSymbology, updateLayerTreeGroupLayersSymbology } from '../modules/action/Symbology.js';

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
