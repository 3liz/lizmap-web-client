/**
 * @module modules/Action.js
 * @name Action
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Point from 'ol/geom/Point.js';
import { fromExtent } from 'ol/geom/Polygon.js';
import WKT from 'ol/format/WKT.js';

/**
 * @class
 * @name Action
 */
export default class Action {

    /**
     * @enum {string} Scopes - List of available scopes for the actions
     */
    Scopes = {
        Project: "project",
        Layer: "layer",
        Feature: "feature"
    }

    /**
     * @enum {string} Callbacks - List of available callbacks for the actions
     */
    CallbackMethods = {
        Redraw: "redraw",
        Select: "select",
        Zoom: "zoom"
    }

    /**
     * If the project has actions
     * @type {boolean}
     */
    hasActions = false;

    /**
     * Unique ID of an action object
     * We allow only one active action at a time
     * @type {string}
     */
    ACTIVE_LIZMAP_ACTION = null;

    /**
     * OpenLayers vector layer to draw the action results
     */
    actionLayer = null;

    /**
     * Build the lizmap Action instance
     * @param {Map}           map           - OpenLayers map
     * @param {SelectionTool} selectionTool - The lizmap selection tool
     * @param {Digitizing}    digitizing    - The Lizmap digitizing instance
     * @param {object}        lizmap3       - The old lizmap object
     */
    constructor(map, selectionTool, digitizing, lizmap3) {

        this._map = map;
        this._selectionTool = selectionTool;
        this._digitizing = digitizing;
        this._lizmap3 = lizmap3;

        this.hasActions = true;
        if (typeof actionConfig === 'undefined') {
            this.hasActions = false;
        }

        if (this.hasActions) {

            // Add an OpenLayers layer to show & use the geometries returned by an action
            this.createActionMapLayer();

            // Get the list of used scopes
            let usedScopes = [];
            for (let i in actionConfig) {
                let item = actionConfig[i];
                if (!usedScopes.includes(item['scope'])) {
                    usedScopes.push(item['scope']);
                }
            }

            // Hide the action dock if no action has the projet scope
            if (!usedScopes.includes(this.Scopes.Project)) {
                let actionMenu = document.querySelector('#mapmenu li.action');
                if (actionMenu) {
                    actionMenu.style.display = "none";
                }
            }

            // Close the windows via the action-close button
            let closeDockButton = document.getElementById('action-close');
            if (closeDockButton) {
                closeDockButton.addEventListener('click', () => {
                    let actionMenu = document.querySelector('#mapmenu li.action.active a');
                    if (actionMenu) {
                        actionMenu.click();
                    }
                });
            }

            const self = this;
            // React on the main Lizmap events
            this._lizmap3.events.on({

                // The popup has been displayed
                // We need to add the buttons for the action with a 'feature' scope
                // corresponding to the popup feature layer
                lizmappopupdisplayed: function (popup) {
                    // Add action buttons if needed
                    let popupContainerId = popup.containerId;
                    let popupContainer = document.getElementById(popupContainerId);

                    if (!popupContainer) return false;

                    Array.from(popupContainer.querySelectorAll('div.lizmapPopupContent .lizmapPopupSingleFeature')).map(element => {

                        // Get layer ID and feature ID
                        const featureId = element.dataset.featureId;
                        const layerId = element.dataset.layerId;

                        // Get layer lizmap config
                        let getLayerConfig = lizmap3.getLayerConfigById(layerId);
                        if (!getLayerConfig) {
                            return true;
                        }

                        // Do nothing if popup feature layer is not found in action config
                        // and a list of layers related to the action
                        for (let i in actionConfig) {
                            let action = actionConfig[i];

                            // Only add action in Popup for the scope "feature"
                            if (!('scope' in action) || action['scope'] != self.Scopes.Feature) {
                                continue;
                            }

                            // Only add action if the layer is in the list
                            if (action['layers'].includes(layerId)) {
                                self.addPopupActionButton(action, layerId, featureId, popupContainerId);
                            }
                        }

                    });
                }
            });
        }
        this._lizmap3.events.on({
            minidockclosed: (event) => {
                if (event.id === 'action'){
                    this._digitizing.toolSelected = 'deactivate';
                }
            }
        });
    }

    /**
     * Create the OpenLayers layer to display the action geometries.
     *
     */
    createActionMapLayer() {
        // Create the OL layer
        const strokeColor = 'blue';
        const strokeWidth = 3;
        const fillColor = 'rgba(173,216,230,0.8)'; // lightblue
        this.actionLayer = new VectorLayer({
            source: new VectorSource({
                wrapX: false
            }),
            style: {
                'circle-radius': 6,
                'circle-stroke-color': strokeColor,
                'circle-stroke-width': strokeWidth,
                'circle-fill-color': fillColor,
                'stroke-color': strokeColor,
                'stroke-width': strokeWidth,
                'fill-color': fillColor,
            }
        });
        this.actionLayer.setProperties({
            name: 'LizmapActionActionLayer'
        });

        // Add the layer inside Lizmap objects
        this._map.addToolLayer(this.actionLayer);
    }

    /**
     * Get an action item by its name and scope.
     *
     * If no layer id is given, return the first item
     * corresponding to the given name.
     * If the layer ID is given, only return the action
     * if it concerns the given layer ID.
     * @param {string} name - Name of the action
     * @param {Action.Scopes} scope - Scope of the action
     * @param {string} layerId - Layer ID (optional)
     * @returns {object} The corresponding action
     */
    getActionItemByName(name, scope = this.Scopes.Feature, layerId = null) {

        if (!this.hasActions) {
            return null;
        }

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
     * Get the list of actions
     *
     * A scope and/or a layer ID can be given to filter the actions
     * @param {string} scope - Scope of the actions to filter
     * @param {string} layerId - Layer ID of the actions to filter
     * @returns {Array} actions - Array of the actions
     */
    getActions(scope = null, layerId = null) {

        let actions = [];
        if (!this.hasActions) {
            return actions;
        }
        // Loop through the actions
        for (let i in actionConfig) {
            let action = actionConfig[i];
            if (scope && action.scope != scope) continue;
            if (layerId && !('layers' in action)) continue;
            if (layerId && !action.layers.includes(layerId)) continue;
            actions.push(action);
        }

        return actions;
    }


    /**
     * Run the callbacks as defined in the action configuration
     * @param {object} action - The action
     * @param {Array} features - The OpenLayers features created by the action from the response
     */
    runCallbacks(action, features = null) {

        for (let c in action.callbacks) {
            // Get the callback item
            let callback = action.callbacks[c];

            if (callback['method'] == this.CallbackMethods.Zoom && features.length) {
                // Zoom to the returned features
                const bounds = this.actionLayer.getSource().getExtent();
                this._map.getView().fit(bounds, {nearest: true});
            }

            // Check the given layerId is a valid Lizmap layer
            // Only for the methods which gives a layerId in their configuration
            if (callback['method'] == this.CallbackMethods.Redraw || callback['method'] == this.CallbackMethods.Select) {

                let getLayerConfig =  this._lizmap3.getLayerConfigById(callback['layerId']);
                if (!getLayerConfig) {
                    continue;
                }
                let featureType = getLayerConfig[0];
                let layerConfig = getLayerConfig[1];

                // Get the corresponding OpenLayers layer instance
                const layer = this._map.getLayerByName(layerConfig.name);

                if(!layer){
                    continue;
                }

                // Redraw the layer
                if (callback['method'] == this.CallbackMethods.Redraw) {
                    // Redraw the given layer
                    layer.getSource().changed();
                }

                // Select items in the layer which intersect the returned geometry
                if (callback['method'] == this.CallbackMethods.Select && features.length) {
                    // Select features in the given layer
                    let feat = features[0];
                    let f = feat.clone();
                    this._selectionTool.selectLayerFeaturesFromSelectionFeature(featureType, f);
                }
            }
        }
    }

    /**
     * Build the unique ID of an action
     * based on its scope
     * @param {string} actionName - The action name
     * @param {string} scope - The action scope
     * @param {string} layerId - The layer ID
     * @param {string} featureId - The feature ID
     * @returns {string} uniqueId - The action unique ID.
     */
    buildActionInstanceUniqueId(actionName, scope, layerId, featureId) {
        // The default name is the action name
        let actionUniqueId = actionName;

        // For the project scope, return
        if (scope == this.Scopes.Project) {
            return actionUniqueId;
        }

        // For the layer and feature scopes, we add the layer ID
        actionUniqueId += '.' + layerId;

        // For the feature scope, we add the feature ID
        if (scope == this.Scopes.Feature) {
            actionUniqueId += '.' + featureId;
        }

        return actionUniqueId;
    }

    /**
     * Explode the action unique ID into its components
     * action name, layer ID, feature ID
     * @param {string} uniqueId - The instance object unique ID
     * @returns {Array} components - The components [actionName, layerId, featureId]
     */
    explodeActionInstanceUniqueId(uniqueId) {

        let vals = uniqueId.split('.');
        let actionName = vals[0];
        let layerId = (vals.length > 1) ? vals[1] : null;
        let featureId = (vals.length > 2) ? vals[2] : null;

        return [actionName, layerId, featureId];
    }

    /**
     * Run a Lizmap action.
     * @param {string} actionName - The action name
     * @param {Action.Scopes} scope - The action scope
     * @param {string} layerId - The optional layer ID
     * @param {string} featureId - The optional feature ID
     * @param {string} wkt - An optional geometry in WKT format and project EPSG:4326
     * @returns {boolean} - If the action was successful
     */
    async runLizmapAction(actionName, scope = this.Scopes.Feature, layerId = null, featureId = null, wkt = null) {
        if (!this.hasActions) {
            return false;
        }

        // Get the action
        let action = this.getActionItemByName(actionName, scope, layerId);
        if (!action) {
            console.warn('No corresponding action found in the configuration !');
            return false;
        }

        const WKTformat = new WKT();
        const projOptions = {
            featureProjection: this._lizmap3.map.getProjection(),
            dataProjection: 'EPSG:4326'
        };

        // Reset the other actions
        // We allow only one active action at a time
        // We do not remove the active status of the button (btn-primary)
        this.resetLizmapAction(true, true, true, false);

        // Take drawn geometry if any and if none exists as a parameter
        if (!wkt && this._digitizing.context === "action" && this._digitizing.featureDrawn) {
            wkt = WKTformat.writeFeatures(this._digitizing.featureDrawn, projOptions);
        }

        // Set the request parameters
        let options = {
            "layerId": layerId,
            "featureId": featureId,
            "name": actionName,
            "wkt": wkt
        };

        const viewExtent = this._map.getView().calculateExtent();
        const viewCenter = this._map.getView().getCenter();

        // We add the map extent and center
        // as WKT geometries
        options['mapExtent'] = WKTformat.writeGeometry(fromExtent(viewExtent), projOptions);
        options['mapCenter'] = WKTformat.writeGeometry(new Point(viewCenter), projOptions);

        // Request action and get data
        let url = actionConfigData.url;
        try {
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(options)
            });

            // Parse the data
            let data = await response.json();

            // Report errors
            if ('errors' in data) {
                // Reset the action
                this.resetLizmapAction(true, true, true, true);

                // Display the errors
                this._lizmap3.addMessage(data.errors.title + '\n' + data.errors.detail, 'danger', true).attr('id', 'lizmap-action-message');
                console.warn(data.errors);

                return false;
            }

            // Add the features in the OpenLayers map layer
            const features = this.addFeaturesFromActionResponse(data, action.style);

            // Display a message if given in the first feature
            if (features.length > 0) {
                const feat = features[0];
                const featureProperties = feat.getProperties();
                const message_field = 'message';
                if (featureProperties && featureProperties?.[message_field]) {

                    // Clear the previous message
                    const previousMessage = document.getElementById('lizmap-action-message');
                    if (previousMessage) previousMessage.remove();

                    // Display the message if given
                    const message = featureProperties[message_field].trim();
                    if (message) {
                        this._lizmap3.addMessage(message, 'info', true).attr('id', 'lizmap-action-message');
                    }

                    // Display the HTML message if given
                    const message_html = featureProperties?.message_html?.trim();
                    if (message_html) {
                        document.getElementById('action-message-html').innerHTML = message_html;
                    }
                }
            }

            // Run the configured action callbacks

            // Callbacks
            if (features.length > 0 && 'callbacks' in action && action.callbacks.length > 0) {
                this.runCallbacks(action, features);
            }

            /**
             * Lizmap event to allow other scripts to process the data if needed
             * @event actionResultReceived
             * @property {string} action Name of the action
             * @property {string} layerId Layer ID of the current layer
             * @property {string} featureId Feature ID of the current feature
             * @property {Array<*>} features List of features returned in the map projection
             */
            lizMap.events.triggerEvent("actionResultReceived",
                {
                    'action': action,
                    'layerId': layerId,
                    'featureId': featureId,
                    'features': features // in map projection
                }
            );

            // Set the action as active
            this.ACTIVE_LIZMAP_ACTION = this.buildActionInstanceUniqueId(action.name, scope, layerId, featureId);

        } catch (error) {
            // Display the error
            console.warn(error);

            // Reset the action
            this.resetLizmapAction(true, true, true, true);

        }
    }

    /**
     * Reset action
     * @param {boolean} destroyFeatures - If we must remove the geometries in the map.
     * @param {boolean} removeMessage - If we must remove the message displayed at the top.
     * @param {boolean} resetGlobalVariable - If we must empty the global variable ACTIVE_LIZMAP_ACTION
     * @param {boolean} resetActiveInterfaceElements - If we must remove the "active" interface for the buttons
     */
    resetLizmapAction(destroyFeatures = true, removeMessage = true, resetGlobalVariable = true, resetActiveInterfaceElements = true) {

        // Remove the objects in the map
        if (destroyFeatures) {
            this.actionLayer.getSource().clear();
        }

        // Clear the previous Lizmap message
        if (removeMessage) {
            let previousMessage = document.getElementById('lizmap-action-message');
            if (previousMessage) previousMessage.remove();
        }

        // Remove all btn-primary classes in the target objects
        if (resetActiveInterfaceElements) {
            let selector = '.popup-action.btn-primary';
            Array.from(document.querySelectorAll(selector)).map(element => {
                element.classList.remove('btn-primary');
            });
        }

        // Reset the global variable
        if (resetGlobalVariable) {
            this.ACTIVE_LIZMAP_ACTION = null;
        }
    }

    /**
     * Add the features returned by a action
     * to the OpenLayers layer in the map
     * @param {object} data - The data returned by the action
     * @param {object|undefined} style - Optional OpenLayers style object
     * @returns {object} features The OpenLayers features converted from the data
     */
    addFeaturesFromActionResponse(data, style) {
        // Change the layer style
        if (style) {
            this.actionLayer.setStyle(style);
        }

        // Convert the action GeoJSON data into OpenLayers features
        const features = (new GeoJSON()).readFeatures(data, {
            featureProjection: this._lizmap3.map.getProjection()
        });

        // Add them to the action layer
        this.actionLayer.getSource().addFeatures(features);

        return features;
    }

    /**
     * Reacts to the click on a popup action button.
     * @param {Event} event - The click event
     * @returns {boolean} - If the action was successful
     */
    popupActionButtonClickHandler(event) {
        // Only go on when the button has been clicked
        // not the child <i> icon
        let target = event.target;
        if (!event.target.matches('.popup-action')) {
            target = target.parentNode;
        }

        // Get the button which triggered the click event
        let button = target;

        // Get the layerId, featureId and action for this button
        let val = button.value;
        let [actionName, layerId, featureId] = this.explodeActionInstanceUniqueId(val);

        // Get the action item data
        let popupAction = this.getActionItemByName(actionName, this.Scopes.Feature, layerId);
        if (!popupAction) {
            console.warn('No corresponding action found in the configuration !');

            return false;
        }

        // We allow only one active action at a time.
        // If the action is already active for the clicked button
        // we need to deactivate it completely
        if (this.ACTIVE_LIZMAP_ACTION) {
            let actionUniqueId = this.buildActionInstanceUniqueId(actionName, this.Scopes.Feature, layerId, featureId);
            if (this.ACTIVE_LIZMAP_ACTION == actionUniqueId) {
                // Reset the action
                this.resetLizmapAction(true, true, true, true);

                // Return
                return true;
            }
        }

        // The action was not active, we can run it
        // This will override the previous actions and replace them
        // with this one
        this.ACTIVE_LIZMAP_ACTION = null;

        // Display a confirm question if needed
        if ('confirm' in popupAction && popupAction.confirm.trim() != '') {
            let msg = popupAction.confirm.trim();
            let go_on = confirm(msg);
            if (!go_on) {
                return false;
            }
        }

        // Reset
        this.resetLizmapAction(true, true, true, true);

        // Add the button btn-primary class
        button.classList.add('btn-primary');

        // Run the Lizmap action for this feature
        // It will set the global variable ACTIVE_LIZMAP_ACTION
        this.runLizmapAction(actionName, this.Scopes.Feature, layerId, featureId);

        return false;
    }

    /**
     * Add an action button for the given popup feature
     * and the given action item.
     * @param {object} action - The action configuration object
     * @param {string} layerId - The layer ID
     * @param {string} featureId - The feature ID
     * @param {string} popupContainerId - The popup container ID
     * @returns {boolean|void} - If the action failed
     */
    addPopupActionButton(action, layerId, featureId, popupContainerId) {

        // Value of the action button for this layer and this feature
        let actionUniqueId = this.buildActionInstanceUniqueId(action.name, this.Scopes.Feature, layerId, featureId);

        // Build the HTML button
        let actionButtonHtml = `
        <button class="btn btn-sm popup-action" value="${actionUniqueId}" type="button" data-bs-toggle="tooltip" data-bs-title="${action.title}">
        `;
        // The icon can be
        // * an old bootstrap 2 icon, e.g. 'icon-star'
        // * a SVG in the media file, e.g. 'media/icon/my-icon.svg'
        if (action.icon.startsWith('icon-')) {
            actionButtonHtml += `<i class="${action.icon}"></i>`;
        }
        let regex = new RegExp('^(.{1,2})?(/)?media/');
        if (action.icon.match(regex)) {
            let mediaLink = globalThis['lizUrls'].media + '?' + new URLSearchParams(globalThis['lizUrls'].params);
            let imageUrl = `${mediaLink}&path=${action.icon}`;
            actionButtonHtml += `<img style="width: 20px; height: 20px;" src="${imageUrl}">`;
        }
        actionButtonHtml += '&nbsp;</button>';

        // Find Lizmap popup toolbar
        let popupContainer = document.getElementById(popupContainerId);
        let featureToolbar = popupContainer.querySelector(`lizmap-feature-toolbar[value="${layerId}.${featureId}"]`);
        if (!featureToolbar) {
            return false;
        }
        let featureToolbarDiv = featureToolbar.querySelector('div.feature-toolbar');

        // Get the button if it already exists
        let existingButton = featureToolbarDiv.querySelector(`button.popup-action[value="${actionUniqueId}"]`);
        if (existingButton) {
            return false;
        }

        // Append the button to the toolbar
        featureToolbarDiv.insertAdjacentHTML('beforeend', actionButtonHtml);
        let actionButton = featureToolbarDiv.querySelector(`button.popup-action[value="${actionUniqueId}"]`);

        // If the action is already active for this feature,
        // add the btn-primary class
        if (actionButton.value == this.ACTIVE_LIZMAP_ACTION) {
            actionButton.classList.add('btn-primary');
        }

        // Trigger the action when clicking on button
        actionButton.addEventListener('click', this.popupActionButtonClickHandler.bind(this));
    }

};
