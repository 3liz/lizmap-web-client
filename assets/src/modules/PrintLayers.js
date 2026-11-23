/**
 * @module modules/PrintLayers.js
 * @name PrintLayers
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */
import { mainLizmap } from './Globals.js';

/**
 * Get the id of the main map of a print template, as used to prefix
 * map parameters in WMS GetPrint and GetPrintAtlas requests (map0, map1…).
 * Only one main map with an optional overview map is supported.
 * @param {object} template - Print template from the project configuration
 * @returns {string} The main map id
 */
export function getPrintMainMapId(template) {
    const templateMaps = template?.maps || [];
    if (templateMaps.length === 2) {
        if (templateMaps[0]?.overviewMap) {
            return templateMaps[1].id;
        }
        if (templateMaps[1]?.overviewMap) {
            return templateMaps[0].id;
        }
    }
    return 'map0';
}

/**
 * Build the WMS parameters describing the layers currently displayed in the map:
 * the selected base layer and the visible layers in their drawing order,
 * with their styles, opacities, filter and selection tokens and legend options.
 * They let QGIS Server print what the user sees instead of the project default.
 * @param {string} mapId - Id of the layout map the layers parameters are for
 * @returns {object} The WMS parameters
 */
export function getPrintLayersParameters(mapId) {
    const wmsParams = {};

    const printLayers = [];
    const styleLayers = [];
    const opacityLayers = [];

    // Add selected base layer if any
    const selectedBaseLayer = mainLizmap.state.baseLayers.selectedBaseLayer;
    if (selectedBaseLayer && selectedBaseLayer.hasItemState) {
        printLayers.push(selectedBaseLayer.itemState.wmsName);
        styleLayers.push(selectedBaseLayer.itemState.wmsSelectedStyleName);
        opacityLayers.push(parseInt(255 * selectedBaseLayer.itemState.opacity * selectedBaseLayer.layerConfig.opacity));
    }

    // Add visible layers in defined order
    const orderedVisibleLayers = {};
    mainLizmap.state.rootMapGroup.findExplodedMapLayers().forEach(layer => {
        if (layer.visibility) {
            orderedVisibleLayers[layer.layerOrder] = layer;
        }
    });

    // Selection and filter
    const filter = [];
    const selection = [];
    const legendOn = [];
    const legendOff = [];
    for (const layerIndex of Object.keys(orderedVisibleLayers).reverse()) {
        const layer = orderedVisibleLayers[layerIndex];
        const layerWmsParams = layer.wmsParameters;
        // Add layer to the list of printed layers
        printLayers.push(layerWmsParams['LAYERS']);

        // Optionally add layer style if needed (same order as layers )
        styleLayers.push(layerWmsParams['STYLES']);

        // Handle qgis layer opacity otherwise client value override it
        if (layer.layerConfig?.opacity) {
            opacityLayers.push(parseInt(255 * layer.calculateTotalOpacity() * layer.layerConfig.opacity));
        } else {
            opacityLayers.push(parseInt(255 * layer.calculateTotalOpacity()));
        }
        if ('FILTERTOKEN' in layerWmsParams) {
            filter.push(layerWmsParams['FILTERTOKEN']);
        }
        if ('SELECTIONTOKEN' in layerWmsParams) {
            selection.push(layerWmsParams['SELECTIONTOKEN']);
        }
        if ('LEGEND_ON' in layerWmsParams) {
            legendOn.push(layerWmsParams['LEGEND_ON']);
        }
        if ('LEGEND_OFF' in layerWmsParams) {
            legendOff.push(layerWmsParams['LEGEND_OFF']);
        }
    }

    wmsParams[mapId + ':LAYERS'] = printLayers.join(',');
    wmsParams[mapId + ':STYLES'] = styleLayers.join(',');
    wmsParams[mapId + ':OPACITIES'] = opacityLayers.join(',');

    if (filter.length) {
        wmsParams.FILTERTOKEN = filter.join(';');
    }
    if (selection.length) {
        wmsParams.SELECTIONTOKEN = selection.join(';');
    }
    if (legendOn.length) {
        wmsParams.LEGEND_ON = legendOn.join(';');
    }
    if (legendOff.length) {
        wmsParams.LEGEND_OFF = legendOff.join(';');
    }

    return wmsParams;
}
