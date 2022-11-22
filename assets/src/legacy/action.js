var lizAction = function () {

    let action_current_object = null;

    function createActionMapLayer() {

        let action_layer = new OpenLayers.Layer.Vector('actionLayer', {
            styleMap: new OpenLayers.StyleMap({
                graphicName: 'circle',
                pointRadius: 6,
                fill: true,
                fillColor: 'lightblue',
                fillOpacity: 0.3,
                stroke: true,
                strokeWidth: 3,
                strokeColor: 'blue',
                strokeOpacity: 0.8
            })
        });
        lizMap.map.addLayer(action_layer);
        lizMap.layers['actionLayer'] = action_layer;
    }

    /**
     * Get an action item by its name
     * for an optional layer id.
     *
     * If no layer id is given, return the item corresponding
     * to the name.
     * If one is given, only return the action item if the given layer id
     * matches one of the item configured layers
     */
    function getActionItemByName(itemName, scope = 'feature', layerId = null) {
        let actionItem = null;
        for (let i in actionConfig) {
            let item = actionConfig[i];
            if (item.scope != scope) {
                continue;
            }
            if (item.name == itemName) {
                if (layerId === null) {
                    return item;
                }
                if ('layers' in item && item.layers.includes(layerId)) {
                    return item;
                }
            }
        }

        return null;
    }


    function runAction(layerId, fid, name) {

        let options = {
            "layerId": layerId,
            "featureId": fid,
            "name": name
        };
        let item = getActionItemByName(name, 'feature', layerId);

        // Request action and get data
        let url = actionConfigData.url;
        $.get(url, options, function (data) {

            // Report errors
            if ('errors' in data) {
                lizMap.addMessage(data.errors.title, 'error', true).attr('id', 'lizmap-action-message');
                console.log(data.errors.detail);
                return false;
            }

            // Returned features
            let features = addFeaturesFromActionResponse(item, data);

            // Display a message if given in the first feature
            if (features.length > 0) {
                let feat = features[0];
                let message_field = 'message';
                if ('attributes' in feat && message_field in feat.attributes) {
                    $('#lizmap-action-message').remove();
                    let message = feat.attributes[message_field].trim();
                    if (message) {
                        lizMap.addMessage(message, 'info', true).attr('id', 'lizmap-action-message');
                    }
                }
            }

            // Callbacks
            if (features.length > 0
                && 'callbacks' in item
                && item.callbacks.length > 0) {
                for (let c in item.callbacks) {
                    let callbackItem = item.callbacks[c];

                    // Check the given layerId is a valid Lizmap layer
                    let getLayerConfig = lizMap.getLayerConfigById(callbackItem['layerId']);
                    if (!getLayerConfig) {
                        continue;
                    }
                    let featureType = getLayerConfig[0];
                    let layerConfig = getLayerConfig[1];

                    // Get the corresponding OpenLayers layer instance
                    let getLayer = lizMap.map.getLayersByName(layerConfig['cleanname']);
                    if (getLayer.length != 1) {
                        continue;
                    }
                    callbackMapLayer = getLayer[0];

                    // Run callbacks
                    // Redraw the layer
                    if (callbackItem['method'] == 'redraw' && callbackMapLayer !== null) {
                        // Redraw the given layer
                        callbackMapLayer.redraw(true);
                    }
                    // Select items in the layer which intersect the returned geometry
                    if (callbackItem['method'] == 'select' && callbackMapLayer !== null) {
                        // Select features in the given layer
                        let feat = features[0];
                        let f = feat.clone()
                        lizMap.selectLayerFeaturesFromSelectionFeature(featureType, f);
                    }
                    if (callbackItem['method'] == 'zoom') {
                        // Zoom to the returned features
                        //console.log('zoom to feature');
                        lizMap.map.zoomToExtent(features[0].geometry.getBounds());
                    }
                }

            }

            // Lizmap event to allow other scripts to process the data if needed
            lizMap.events.triggerEvent("actionResultReceived",
                {
                    'layerId': layerId,
                    'featureId': fid,
                    'action': item,
                    'features': features
                }
            );

        }, 'json');

        // Set the action as active
        action_current_object = layerId + '.' + fid + '.' + name;

    }

    function addFeaturesFromActionResponse(item, data) {

        // Get layer
        let layer = lizMap.layers['actionLayer'];

        // Change layer style
        if ('style' in item) {
            layer.styleMap.styles.default.defaultStyle = item.style;
        }

        // Get layer projection
        let lcrs = 'EPSG:4326';
        // Get GeoJSON format reader
        let gFormat = new OpenLayers.Format.GeoJSON({
            externalProjection: lcrs,
            internalProjection: lizMap.map.getProjection()
        });

        // Add features
        let tfeatures = gFormat.read(data);
        layer.addFeatures(tfeatures);

        return tfeatures;
    }

    /**
     * Add an action button for the given popup feature
     * and the given action item.
     *
     */
    function addPopupActionButton(layerId, fid, item, popupItem) {

        // Build item html
        let button_name = `${layerId}.${fid}.${item.name}`;
        let ihtml = `
    <button class="btn btn-mini popup-action" value="${button_name}" title="${item.title}">
        <i class="${item.icon}"></i>
    &nbsp;</button>
    `;
        let toolbar = popupItem.next('span.popupButtonBar').find('button.popup-action[value="' + button_name + '"]');
        let popupButtonBar = popupItem.next('span.popupButtonBar');
        if (popupButtonBar.length != 0) {
            if (toolbar.length == 0)
                popupButtonBar.append(ihtml);
            else
                toolbar.before(ihtml);
        } else {
            ihtml = '<span class="popupButtonBar">' + ihtml + '</span></br>';
            popupItem.after(ihtml);
        }
        popupItem.find('button.btn').tooltip({
            placement: 'bottom'
        });

        // Trigger action when clicking on button
        $('div.lizmapPopupContent button.popup-action[value="' + button_name + '"]').click(function () {
            // Clear message
            $('#lizmap-action-message').remove();

            // Empty actionLayer: do it if button & action was active or not
            let layer = lizMap.layers['actionLayer'];
            layer.destroyFeatures();

            let val = $(this).val();
            let vals = val.split('.');
            let layerId = vals[0];
            let fid = vals[1];
            let name = vals[2];

            // Do nothing if geometry was already set
            // This allow to delete the current geometry
            if (action_current_object) {
                // deactivate if the current action was this one
                if (action_current_object == layerId + '.' + fid + '.' + name) {
                    action_current_object = null;
                    return true;
                }
            }
            action_current_object = null;

            // Get action item data
            // And add confirm question if needed
            let item = getActionItemByName(name, 'feature', layerId);
            if ('confirm' in item && item.confirm.trim() != '') {
                let msg = item.confirm.trim();
                let go_on = confirm(msg);
                if (!go_on) {
                    return false;
                }
            }

            // Toggle given geometry
            runAction(layerId, fid, name);

            return false;
        }).hover(// Add hover
            function () { $(this).addClass('btn-primary'); },
            function () { $(this).removeClass('btn-primary'); }
        );
    }


    lizMap.events.on({

        'uicreated': function () {
            // Add an OpenLayers layer to show & use the geometries returned by an action
            createActionMapLayer();

            // Add dock if there is any action with the "project" scope
            let hasProjectActions = false;
            for (let i in actionConfig) {
                let item = actionConfig[i];
                if (item['scope'] == 'project') {
                    hasProjectActions = true;
                    break;
                }
            }
            if (hasProjectActions) {
                // Add Lizmap action dock
                // lizMap.addDock();
            }

        },

        'lizmappopupdisplayed': function () {
            // Add action buttons if needed
            $('div.lizmapPopupContent input.lizmap-popup-layer-feature-id').each(function () {
                // Get layer id and feature id
                let self = $(this);
                let val = self.val();
                let fid = val.split('.').pop();
                let layerId = val.replace('.' + fid, '');

                // Get layer lizmap config
                let getLayerConfig = lizMap.getLayerConfigById(layerId);
                if (!getLayerConfig) {
                    return true;
                }

                // Do nothing if popup feature layer is not found in action config
                // and a list of layers related to the action
                for (let i in actionConfig) {
                    let item = actionConfig[i];

                    // Only add action in Popup for the scope "feature"
                    if (!('scope' in item) || item['scope'] != 'feature') {
                        continue;
                    }

                    // Only add action if the layer is in the list
                    if (item['layers'].includes(layerId)) {
                        addPopupActionButton(layerId, fid, item, self);
                    }
                }

            });
        }
    });

    // Public functions and objects
    var obj = {
    }

    return obj;
}();
