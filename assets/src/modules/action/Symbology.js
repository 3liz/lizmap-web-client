import WMS from './../WMS.js';
import {LayerTreeLayerState, LayerTreeGroupState} from './../state/LayerTree.js'

/**
 * @param {LayerTreeLayerState[]} treeLayers - The tree layer group in which tree layers will be updated
 *
 * @returns {Promise} Promise object represents the tree layers updated
 */
export async function updateLayerTreeLayersSymbology(treeLayers) {
    if (!Array.isArray(treeLayers)) {
        throw new TypeError('`updateLayerTreeLayersSymbology` method required an array as parameter!');
    }

    // If the tree layers is empty
    // nothing to do
    if (treeLayers.length == 0) {
        return treeLayers;
    }

    const wmsNames = treeLayers.map(layer => layer.wmsName);
    const wmsStyles = treeLayers.map(layer => layer.wmsSelectedStyleName);
    let treeLayersByName = {};
    treeLayers.forEach(treeLayer => treeLayersByName[treeLayer.wmsName] = treeLayer);

    const wms = new WMS();
    const wmsParams = {
        LAYER: wmsNames,
        STYLES: wmsStyles,
    };

    const response = await wms.getLegendGraphic(wmsParams);
    for (const node of response.nodes) {
        // If the layer has no symbology, there is no type property
        if (node.hasOwnProperty('type')) {
            treeLayersByName[node.name].symbology = node;
        }
    }
    return treeLayers;
}

/**
 * @param {LayerTreeLayerState} treeLayer - The tree layer to be updated
 *
 * @returns {Promise} Promise object represents the tree layer updated
 */
export async function updateLayerTreeLayerSymbology(treeLayer) {
    if (!(treeLayer instanceof LayerTreeLayerState)) {
        throw new TypeError('`updateLayerTreeLayerSymbology` method required a LayerTreeLayerState as parameter!');
    }
    return updateLayerTreeLayersSymbology([treeLayer])[0];
}

/**
 * @param {LayerTreeGroupState} treeGroup - The tree layer group in which tree layers will be updated
 *
 * @returns {Promise} Promise object represents the tree layers updated
 */
export async function updateLayerTreeGroupLayersSymbology(treeGroup) {
    if (!(treeGroup instanceof LayerTreeGroupState)) {
        throw new TypeError('`updateLayerTreeGroupLayersSymbology` method required a LayerTreeGroupState as parameter!');
    }
    return updateLayerTreeLayersSymbology(treeGroup.findTreeLayers());
}
