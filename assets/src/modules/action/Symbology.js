/**
 * @module action/Symbology.js
 * @name SymbologyAction
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { HttpError } from '../Errors.js';
import { HttpRequestMethods } from '../Utils.js';
import WMS from './../WMS.js';
import {LayerTreeLayerState, LayerTreeGroupState} from './../state/LayerTree.js'

/**
 * Update the symbology of the tree layers
 * @param {LayerTreeLayerState[]} treeLayers - The tree layer group in which tree layers will be updated
 * @param {string}                [method]   - HTTP Request method, use enum HttpRequestMethods
 * @returns {Promise} Promise object represents the tree layers updated
 */
export async function updateLayerTreeLayersSymbology(treeLayers, method=HttpRequestMethods.GET) {
    if (!Array.isArray(treeLayers)) {
        throw new TypeError('`updateLayerTreeLayersSymbology` method required an array as parameter!');
    }

    const wms = new WMS();

    // If the tree layers is empty
    // nothing to do
    if (treeLayers.length == 0) {
        return treeLayers;
    }

    if (method.toUpperCase() == HttpRequestMethods.GET) {
        for (const treeLayer of treeLayers) {
            // Check if this is an external WMS layer
            const isExternalWMS = treeLayer.itemState?.externalWmsToggle === true;
            
            const wmsParams = {
                LAYER: treeLayer.wmsName,
                STYLES: treeLayer.wmsSelectedStyleName,
            };

            if (isExternalWMS) {
                // For external WMS layers, get PNG legend directly
                try {
                    const pngUrl = wms.getLegendGraphicPNG(wmsParams);
                    // Fetch the PNG and convert to base64
                    const response = await fetch(pngUrl);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    
                    await new Promise((resolve, reject) => {
                        reader.onloadend = () => {
                            const base64data = reader.result.split(',')[1]; // Remove data:image/png;base64, prefix
                            treeLayer.symbology = {
                                type: 'layer',
                                name: treeLayer.wmsName,
                                title: treeLayer.name,
                                icon: base64data
                            };
                            resolve();
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                } catch (error) {
                    console.error('Error loading external WMS legend:', error);
                    // Fallback to default icon will be handled by symbology state
                }
            } else {
                // For normal layers, use JSON format
                await wms.getLegendGraphic(wmsParams).then((response) => {
                    for (const node of response.nodes) {
                        // If the layer has no symbology, there is no type property
                        if (node.hasOwnProperty('type')) {
                            treeLayer.symbology = node;
                        }
                    }
                }).catch((error) => {
                    console.error(error);
                });
            }
        }
        return treeLayers;
    }

    const wmsNames = treeLayers.map(layer => layer.wmsName);
    const wmsStyles = treeLayers.map(layer => layer.wmsSelectedStyleName);
    let treeLayersByName = {};
    for (const treeLayer of treeLayers) {
        treeLayersByName[treeLayer.wmsName] = treeLayer;
    }

    const wmsParams = {
        LAYER: wmsNames,
        STYLES: wmsStyles,
    };

    await wms.getLegendGraphic(wmsParams).then((response) => {
        for (const node of response.nodes) {
            // If the layer has no symbology, there is no type property
            if (node.hasOwnProperty('type')) {
                treeLayersByName[node.name].symbology = node;
            }
        }
        return treeLayers;
    }).catch(async (error) => {
        console.error(error);
        // If the request failed, try to get the legend graphic for each layer separately
        // This is a workaround for the issue when QGIS server timed out when requesting
        // the legend graphic for multiple layers at once (LAYER parameter with multiple values)
        if (treeLayers.length == 1) {
            // If there is only one layer, there is no need to try to get the legend graphic
            // for each layer separately
            return treeLayers;
        }
        if (!(error instanceof HttpError) || error.statusCode != 504) {
            // If the error is not a timeout, there is no need to try to get the legend graphic
            // for each layer separately
            return treeLayers;
        }
        // Try to get the legend graphic for each layer separately
        for (const treeLayer of treeLayers) {
            await updateLayerTreeLayerSymbology(treeLayer);
        }
    });
    return treeLayers;
}

/**
 * Update the symbology of the tree layer
 * @param {LayerTreeLayerState} treeLayer - The tree layer to be updated
 * @returns {Promise} Promise object represents the tree layer updated
 */
export async function updateLayerTreeLayerSymbology(treeLayer) {
    if (!(treeLayer instanceof LayerTreeLayerState)) {
        throw new TypeError('`updateLayerTreeLayerSymbology` method required a LayerTreeLayerState as parameter!');
    }
    const treeLayers = await updateLayerTreeLayersSymbology([treeLayer])
    return treeLayers[0];
}

/**
 * Update the symbology of the tree layers in the tree group
 * @param {LayerTreeGroupState} treeGroup - The tree layer group in which tree layers will be updated
 * @param {string}              [method]  - HTTP Request method use enum HttpRequestMethods
 * @returns {Promise} Promise object represents the tree layers updated
 */
export async function updateLayerTreeGroupLayersSymbology(treeGroup, method=HttpRequestMethods.GET) {
    if (!(treeGroup instanceof LayerTreeGroupState)) {
        throw new TypeError(
            '`updateLayerTreeGroupLayersSymbology` method required a LayerTreeGroupState as parameter!'
        );
    }
    return await updateLayerTreeLayersSymbology(treeGroup.findTreeLayers(), method);
}
