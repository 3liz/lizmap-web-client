import WMS from './../WMS.js';

/**
 * @param {LayerTreeLayerState[]} treeLayers - The tree layer group in which tree layers will be updated
 *
 * @returns {Promise} Promise object represents the tree layers updated
 */
export async function updateLayerTreeLayersSymbology(treeLayers) {
    const wmsNames = treeLayers.map(layer => layer.wmsName);
    console.log(wmsNames);
    const wmsStyles = treeLayers.map(layer => layer.wmsSelectedStyleName);
    console.log(wmsStyles);
    let treeLayersByName = {};
    treeLayers.forEach(layer => treeLayersByName[layer.name] = layer);

    const wms = new WMS();
    const wmsParams = {
        LAYERS: wmsNames,
        STYLES: wmsStyles,
    };

    const response = await wms.getLegendGraphic(wmsParams);
    for (const node of response.nodes) {
        treeLayersByName[node.name].symbology = node;
    }
    return treeLayers;
}

/**
 * @param {LayerTreeLayerState} treeLayer - The tree layer to be updated
 *
 * @returns {Promise} Promise object represents the tree layer updated
 */
export async function updateLayerTreeLayerSymbology(treeLayer) {
    return updateLayerTreeLayersSymbology([treeLayer])[0];
}

/**
 * @param {LayerTreeGroupState} treeGroup - The tree layer group in which tree layers will be updated
 *
 * @returns {Promise} Promise object represents the tree layers updated
 */
export async function updateLayerTreeGroupLayersSymbology(treeGroup) {
    return updateLayerTreeLayersSymbology(treeGroup.findTreeLayers());
}
