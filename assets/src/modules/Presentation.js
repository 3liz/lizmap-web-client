/**
 * @module modules/Presentation.js
 * @name Presentation
 * @copyright 2023 3Liz
 * @author DOUCHIN Michaël
 * @license MPL-2.0
 */

import { mainLizmap } from '../modules/Globals.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';

/**
 * @class
 * @name Presentation
 */
export default class Presentation {

    /**
     * @boolean If the project has presentations
     */
    hasPresentations = false;

    /**
     * @object List of presentations
     */
    presentations = [];

    /**
     * @string Unique ID of an presentation object
     * We allow only one active presentation at a time
     */
    ACTIVE_LIZMAP_PRESENTATION = null;

    /**
     * OpenLayers vector layer to draw the presentation results
     */
    presentationLayer = null;

    /**
     * Build the lizmap presentation instance
     */
    constructor() {

        this.hasPresentations = true;
        if (typeof presentationConfig === 'undefined') {
            this.hasPresentations = false;
        }

        if (this.hasPresentations) {

            // Get the list of presentations
            this.presentations = presentationConfig;

            // Hide the presentation dock if no presentation exists
            // And the user has no right to manage them
            const hideDock = false;
            if (hideDock) {
                let presentationMenu = document.querySelector('#mapmenu li.presentation');
                if (presentationMenu) {
                    presentationMenu.style.display = "none";
                }
            }

            // Add an OpenLayers layer to show & use the geometries returned by an presentation
            this.createPresentationMapLayer();

            // React on the main Lizmap events
            mainLizmap.lizmap3.events.on({
            });
        }

    }

    /**
     * Create the OpenLayers layer to display the presentation geometries.
     *
     */
    createPresentationMapLayer() {
        // Create the OL layer
        const strokeColor = 'blue';
        const strokeWidth = 3;
        const fillColor = 'rgba(173,216,230,0.8)'; // lightblue
        this.presentationLayer = new VectorLayer({
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

        // Add the layer inside Lizmap objects
        mainLizmap.map.addLayer(this.presentationLayer);
    }

    /**
     * Get an presentation item by its uid.
     *
     * @param {integer} presentationId - id of the presentation
     *
     * @return {object} The corresponding presentation data
     */
    getPresentationById(presentationId) {

        if (!this.hasPresentations) {
            return null;
        }

        // Loop through the presentations
        for (let i in presentationConfig) {
            // Current presentations
            let presentation = presentationConfig[i];

            // Return the presentation if its uid matches
            if (presentation.id == presentationId) {
                return presentation;
            }
        }

        return null;
    }

    /**
     * Get the list of presentations
     *
     * @return {array} presentations - Array of the presentations
     */
    getPresentations() {

        return this.presentations;
    }

    /**
     * Run a Lizmap presentation.
     *
     * @param {integer} presentationId - The presentation id
     */
    async runLizmapPresentation(presentationId) {
        if (!this.hasPresentations) {
            return false;
        }

        // Get the presentation
        let presentation = this.getPresentationById(presentationId);
        if (!presentation) {
            console.warn('No corresponding presentation found in the configuration !');
            return false;
        }

        // Reset the other presentations
        // We allow only one active presentation at a time
        // We do not remove the active status of the button (btn-primary)
        this.resetLizmapPresentation(true, true, true, false);

        try {
            // Show a message
            const message = `Run presentation n° ${presentationId}`;
            mainLizmap.lizmap3.addMessage(
                message, 'info', true
            ).attr('id', 'lizmap-presentation-message');

            /**
             * Lizmap event to allow other scripts to process the data if needed
             * @event presentationLaunched
             * @property {string} presentationId Id of the presentation
             */
            lizMap.events.triggerEvent("presentationLaunched",
                {
                    'presentation': presentationId
                }
            );

            // Set the presentation as active
            this.ACTIVE_LIZMAP_PRESENTATION = presentationId;

        } catch (error) {
            // Display the error
            console.warn(error);

            // Reset the presentation
            this.resetLizmapPresentation(true, true, true, true);

        }
    }

    /**
     * Reset presentation
     *
     * @param {boolean} destroyFeatures - If we must remove the geometries in the map.
     * @param {boolean} removeMessage - If we must remove the message displayed at the top.
     * @param {boolean} resetGlobalVariable - If we must empty the global variable ACTIVE_LIZMAP_PRESENTATION
     * @param {boolean} resetActiveInterfaceElements - If we must remove the "active" interface for the buttons
     */
    resetLizmapPresentation(destroyFeatures = true, removeMessage = true, resetGlobalVariable = true, resetActiveInterfaceElements = true) {

        // Remove the objects in the map
        if (destroyFeatures) {
            this.presentationLayer.getSource().clear();
        }

        // Clear the previous Lizmap message
        if (removeMessage) {
            let previousMessage = document.getElementById('lizmap-presentation-message');
            if (previousMessage) previousMessage.remove();
        }

        // Remove all btn-primary classes in the target objects
        if (resetActiveInterfaceElements) {
            let selector = '.popup-presentation.btn-primary';
            Array.from(document.querySelectorAll(selector)).map(element => {
                element.classList.remove('btn-primary');
            });
        }

        // Reset the global variable
        if (resetGlobalVariable) {
            this.ACTIVE_LIZMAP_PRESENTATION = null;
        }
    }

    /**
     * Add the geometry features
     * to the OpenLayers layer in the map
     *
     * @param {object} data - The data to add in GeoJSON format
     * @param {object|undefined} style - Optional OpenLayers style object
     *
     * @return {object} features The OpenLayers features converted from the data
     */
    addFeatures(data, style) {
        // Change the layer style
        if (style) {
            this.presentationLayer.setStyle(style);
        }

        // Convert the GeoJSON data into OpenLayers features
        const features = (new GeoJSON()).readFeatures(data, {
            featureProjection: mainLizmap.projection
        });

        // Add them to the presentation layer
        this.presentationLayer.getSource().addFeatures(features);

        return features;
    }
};
