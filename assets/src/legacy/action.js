var lizAction = function () {

    /**
     * @typedef {string} Scope
     **/

    /**
     * @enum {Scope} Scopes available for the actions
     */
    const Scopes = {
        Project: "project",
        Layer: "layer",
        Feature: "feature"
    }

    /**
     * @string Unique ID of an action object for a layer and a feature
     */
    let actionObjectUniqueId = null;

    /**
     * Create the OpenLayers layer to display the action geometries.
     *
     */
    function createActionMapLayer() {
        // Create the OL layer
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

        // Add the layer inside Lizmap objects
        lizMap.map.addLayer(action_layer);
        lizMap.layers['actionLayer'] = action_layer;
    }

    /**
     * Get an action item by its name and scope.
     *
     * If no layer id is given, return the first item
     * corresponding to the given name.
     * If the layer ID is given, only return the action
     * if it concerns the given layer ID.
     *
     * @param {string} name Name of the action
     * @param {Scopes} scope Scope of the action
     * @param {string} layerId Layer ID (optional)
     *
     * @return {object} The corresponding action
     */
    function getActionItemByName(name, scope = Scopes.Feature, layerId = null) {

        // Loop through the actions
        for (let i in actionConfig) {
            // Current action
            let action = actionConfig[i];

            // Avoid the actions with a different scope
            if (action.scope != scope) {
                continue;
            }

            // Return the action if its name matches
            // and optionally also if the layerId matches
            if (action.name == name) {
                // Return if not layer ID is given
                if (layerId === null) {
                    return action;
                }

                // Compare the layer ID
                if ('layers' in action && action.layers.includes(layerId)) {
                    return action;
                }
            }
        }

        return null;
    }


    /**
     * Run a Lizmap action.
     *
     * @param {string} name The action name
     * @param {Scopes} scope The action scope
     * @param {string} layerId The optional layer ID
     * @param {string} featureId The optional feature ID
     */
    function runLizmapAction(name, scope = Scopes.Feature, layerId = null, featureId = null) {

        // Get the action
        let action = getActionItemByName(name, Scopes.Feature, layerId);

        let options = {
            "layerId": layerId,
            "featureId": featureId,
            "name": name
        };

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
            let actionStyle = ('style' in action) ? action.style : null;
            let features = addFeaturesFromActionResponse(data, actionStyle);

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
                && 'callbacks' in action
                && action.callbacks.length > 0) {
                for (let c in action.callbacks) {
                    // Get the callback item
                    let callback = action.callbacks[c];

                    // Check the given layerId is a valid Lizmap layer
                    let getLayerConfig = lizMap.getLayerConfigById(callback['layerId']);
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

                    // Redraw the layer
                    if (callback['method'] == 'redraw' && callbackMapLayer !== null) {
                        // Redraw the given layer
                        callbackMapLayer.redraw(true);
                    }
                    // Select items in the layer which intersect the returned geometry
                    if (callback['method'] == 'select' && callbackMapLayer !== null) {
                        // Select features in the given layer
                        let feat = features[0];
                        let f = feat.clone()
                        lizMap.selectLayerFeaturesFromSelectionFeature(featureType, f);
                    }
                    if (callback['method'] == 'zoom') {
                        // Zoom to the returned features
                        //console.log('zoom to feature');
                        lizMap.map.zoomToExtent(features[0].geometry.getBounds());
                    }
                }

            }

            // Lizmap event to allow other scripts to process the data if needed
            lizMap.events.triggerEvent("actionResultReceived",
                {
                    'action': action,
                    'layerId': layerId,
                    'featureId': featureId,
                    'features': features
                }
            );

        }, 'json');

        // Set the action as active
        actionObjectUniqueId = layerId + '.' + featureId + '.' + name;

    }

    /**
     * Add the features returned by a action
     * to the OpenLayers layer in the map
     *
     * @param {object} data The data returned by the action
     * @param {object} style Optional OpenLayers style object
     *
     * @return {object} features The OpenLayers features converted from the data
     */
    function addFeaturesFromActionResponse(data, style = null) {

        // Get action result layer
        let layer = lizMap.layers['actionLayer'];

        // Change the layer style
        if (style) {
            layer.styleMap.styles.default.defaultStyle = style;
        }

        // Get the layer projection
        let layerProjectionName = 'EPSG:4326';

        // Get the OpenLayers GeoJSON format reader
        let gFormat = new OpenLayers.Format.GeoJSON({
            externalProjection: layerProjectionName,
            internalProjection: lizMap.map.getProjection()
        });

        // Convert the action GeoJSON data into OpenLayers features
        let features = gFormat.read(data);

        // Add them to the action layer
        layer.addFeatures(features);

        return features;
    }

    /**
     * Add an action button for the given popup feature
     * and the given action item.
     *
     * @param {object} action - The action configuration object
     * @param {string} layerId - The layer ID
     * @param {string} featureId - The feature ID
     * @param {string} popupItem - The popup item HTML element
     */
    function addPopupActionButton(action, layerId, featureId, popupContainerId) {

        // Value of the action button for this layer and this feature
        let actionButtonValue = `${layerId}.${featureId}.${action.name}`;

        // Build the HTML button
        let actionButtonHtml = `
        <button class="btn btn-mini popup-action" value="${actionButtonValue}" type="button" data-original-title="${action.title}" title="${action.title}">
            <i class="${action.icon}"></i>
        &nbsp;</button>
        `;

        // Find Lizmap popup toolbar
        let featureToolbar = $(`#${popupContainerId} lizmap-feature-toolbar[value="${layerId}.${featureId}"]`);
        if (featureToolbar.length == 0) {
            return false;
        }
        let featureToolbarDiv = featureToolbar.find('div.feature-toolbar');

        // Get the button if it already exists
        let existingButton = featureToolbarDiv.find('button.popup-action[value="' + actionButtonValue + '"]');
        if (existingButton.length > 0) {
            return false;
        }

        // Append the button to the toolbar
        featureToolbarDiv.append(actionButtonHtml);

        // Add the action tooltip
        let actionButton = featureToolbarDiv.find('button.popup-action[value="' + actionButtonValue + '"]');
        actionButton.tooltip({
            placement: 'bottom'
        });

        // If the action is already active for this feature,
        // add the btn-primary class
        if (actionButton.val() == actionObjectUniqueId) {
            actionButton.addClass('btn-primary');
        }

        // Trigger the action when clicking on button
        actionButton.click(function () {
            // Clear the previous message
            $('#lizmap-action-message').remove();

            // Empty the action layer
            let layer = lizMap.layers['actionLayer'];
            layer.destroyFeatures();

            // Get the layerId, featureId and action for this button
            let val = $(this).val();
            let vals = val.split('.');
            let layerId = vals[0];
            let featureId = vals[1];
            let actionName = vals[2];

            // Do nothing if the geometry was already set
            // This allows to delete the current geometry
            if (actionObjectUniqueId) {
                // deactivate if the current action was this one
                if (actionObjectUniqueId == layerId + '.' + featureId + '.' + actionName) {
                    actionObjectUniqueId = null;
                    return true;
                }
            }

            // The action was not active, we can run it
            actionObjectUniqueId = null;

            // Get the action item data
            let popupAction = getActionItemByName(actionName, Scopes.Feature, layerId);

            // Display a confirm question if needed
            if ('confirm' in popupAction && popupAction.confirm.trim() != '') {
                let msg = popupAction.confirm.trim();
                let go_on = confirm(msg);
                if (!go_on) {
                    return false;
                }
            }

            // Toggle the given geometry
            runLizmapAction(actionName, Scopes.Feature, layerId, featureId);

            return false;
        });

        // Add hover interaction
        actionButton.hover(
            function () { $(this).addClass('btn-primary'); },
            function () {
                // Only remove btn-primary if the action is not active
                // for this popup feature
                if ($(this).val() != actionObjectUniqueId) {
                    $(this).removeClass('btn-primary');
                }
            }
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
                if (item['scope'] == Scopes.Project) {
                    hasProjectActions = true;
                    break;
                }
            }
            if (hasProjectActions) {
                // Add Lizmap action dock
                // lizMap.addDock();
            }

        },

        'lizmappopupdisplayed': function (popup, containerId) {
            // Add action buttons if needed
            let popupContainerId = popup.containerId;
            $(`#${popupContainerId} div.lizmapPopupContent input.lizmap-popup-layer-feature-id`).each(function () {
                // Get layer id and feature id
                let self = $(this);
                let val = self.val();
                let featureId = val.split('.').pop();
                let layerId = val.replace('.' + featureId, '');

                // Get layer lizmap config
                let getLayerConfig = lizMap.getLayerConfigById(layerId);
                if (!getLayerConfig) {
                    return true;
                }

                // Do nothing if popup feature layer is not found in action config
                // and a list of layers related to the action
                for (let i in actionConfig) {
                    let action = actionConfig[i];

                    // Only add action in Popup for the scope "feature"
                    if (!('scope' in action) || action['scope'] != Scopes.Feature) {
                        continue;
                    }

                    // Only add action if the layer is in the list
                    if (action['layers'].includes(layerId)) {
                        addPopupActionButton(action, layerId, featureId, popupContainerId);
                    }
                }

            });
        }
    });

    // Public functions and objects
    var obj = {
        runLizmapAction: function (name, scope, layerId, featureId) {
            return runLizmapAction(name, scope, layerId, featureId);
        },
        actionObjectUniqueId: actionObjectUniqueId
    };

    return obj;
}();
