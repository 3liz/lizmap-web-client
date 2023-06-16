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

export function buildLayersOrder(initialConfig, rootLayerTreeCfg) {
    if (initialConfig.hasOwnProperty('layersOrder')) {
        return Object.keys(initialConfig.layersOrder).sort(function(a, b) {
            return initialConfig.layersOrder[a] - initialConfig.layersOrder[b];
        });
    }

    return layersOrderFromLayerTreeGroup(rootLayerTreeCfg);
}
