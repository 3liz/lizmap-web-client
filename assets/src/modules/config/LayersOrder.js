/**
 * @module config/LayersOrder.js
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0 - Mozilla Public License 2.0 : http://www.mozilla.org/MPL/
 **/

/**
 * Recursive function to build the layer names displaying order like in QGIS based on the layer tree
 * config group from WMS capabilities
 * @function
 *
 * @param {LayerTreeGroupConfig} layerTreeGroupCfg - The layer tree config based on WMS capabilities
 *
 * @return {String[]} The layer names list from top to bottom
 **/
function layersOrderFromLayerTreeGroup(layerTreeGroupCfg) {
    let layersOrder = [];
    for (const layerTreeItem of layerTreeGroupCfg.getChildren()) {
        const cfg = layerTreeItem.layerConfig;
        if (cfg == null) {
            throw new RangeError('The layer `'+ layerTreeItem.name +'` has no config!');
        }
        if ((layerTreeItem.type == 'layer')) {
            if (cfg.geometryType == null || (cfg.geometryType != 'none' && cfg.geometryType != 'none')) {
                layersOrder.push(layerTreeItem.name);
            }
        } else {
            layersOrder = layersOrder.concat(layersOrderFromLayerTreeGroup(layerTreeItem))
        }
    }
    return layersOrder;
}

/**
 * Function to build the layer names displaying order like in QGIS based on lizmap config
 * or the layer tree config based on WMS capabilities
 *
 * The first one in this list is the top one in the map
 * The last one in this list is the bottom one in the map
 * @function
 *
 * @param {Object} initialConfig
 * @param {LayerTreeGroupConfig} rootLayerTreeCfg - The root layer tree config based on WMS capabilities
 *
 * @return {String[]} The layer names displaying order from top to bottom
 **/
export function buildLayersOrder(initialConfig, rootLayerTreeCfg) {
    if (initialConfig.hasOwnProperty('layersOrder')) {
        return Object.keys(initialConfig.layersOrder).sort(function(a, b) {
            return initialConfig.layersOrder[a] - initialConfig.layersOrder[b];
        });
    }

    return layersOrderFromLayerTreeGroup(rootLayerTreeCfg);
}
