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

    if (treeLayers.length == 0) {
        return treeLayers;
    }

    if (method.toUpperCase() == HttpRequestMethods.GET) {
        for (const treeLayer of treeLayers) {
            // Check if this is an external WMS layer using the backend flag
            const layerCfg = treeLayer._mapItemState?._layerItemState?._layerTreeItemCfg?._layerCfg;
            const isExternalWMS = layerCfg?._externalWmsToggle === true
                               || layerCfg?._externalWmsToggle === 'True';

            if (isExternalWMS) {
                // For external WMS layers, get PNG legend directly
                const wmsParams = {
                    LAYER: treeLayer.wmsName,
                    STYLES: treeLayer.wmsSelectedStyleName,
                    LAYERTITLE: 'FALSE',
                };
                try {
                    const pngUrl = wms.getLegendGraphicPNG(wmsParams);
                    const response = await fetch(pngUrl);
                    const blob = await response.blob();
                    const reader = new FileReader();

                    await new Promise((resolve, reject) => {
                        reader.onloadend = () => {
                            const base64data = reader.result.split(',')[1];
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
                }
            } else {
                // For normal layers, use JSON format
                const wmsParams = {
                    LAYER: treeLayer.wmsName,
                    STYLES: treeLayer.wmsSelectedStyleName,
                };
                await wms.getLegendGraphic(wmsParams).then((response) => {
                    for (const node of response.nodes) {
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

    // POST method code bleibt unverändert...
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
            if (node.hasOwnProperty('type')) {
                treeLayersByName[node.name].symbology = node;
            }
        }
        return treeLayers;
    }).catch(async (error) => {
        console.error(error);
        if (treeLayers.length == 1) {
            return treeLayers;
        }
        if (!(error instanceof HttpError) || error.statusCode != 504) {
            return treeLayers;
        }
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
