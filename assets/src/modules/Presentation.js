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
import Utils from './Utils.js';

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

        const url = presentationConfig.url;
        let formData = new FormData();
        formData.append('request', 'list');

        // Return promise
        return fetch(url, {
            method: 'POST',
            body: formData
        }).then(function (response) {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        }).then(function (json) {
            return json;
        }).catch(function (error) {
            console.warn(error);
        });
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
            this.addMessage(message, 'info', 5000);

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
            const selector = '.popup-presentation.btn-primary';
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

    /**
     * Display a lizMap message
     *
     * @param {string} message  Message to display
     * @param {string} type     Type : error or info
     * @param {number} duration Number of millisecond the message must be displayed
     */
    addMessage(message, type, duration) {

        let previousMessage = document.getElementById('lizmap-presentation-message');
        if (previousMessage) previousMessage.remove();
        mainLizmap.lizmap3.addMessage(
            message, type, true, duration
        ).attr('id', 'lizmap-presentation-message');
    }

    /**
     * Show a form.
     *
     * @param {string} html HTML containing form
     */
    showForm(html) {
        // Get sub-dock
        const subDock = document.getElementById('sub-dock');
        subDock.style.maxWidth = '50%';
        subDock.innerHTML = `
            <div id="presentation-form-container" class="form-container">${html}</div>
        `;
        if (!subDock.checkVisibility()) {
            subDock.style.display = 'block';
        }
    }

    /**
     * Hide & empty a form.
     *
     */
    hideForm() {
        // Get sub-dock
        const subDock = document.getElementById('sub-dock');
        subDock.innerHTML = '';
        subDock.style.maxWidth = '30%';
        if (subDock.checkVisibility()) {
            subDock.style.display = 'none';
        }
    }

    /**
     * Display the form to create a new presentation or a new page
     *
     * @param {string} itemType Type of item to edit: presentation or page.
     * @param {null|number} id Id of the presentation. If null, it is a creation form.
     * @param {null|number} presentation_id Id of the parent presentation. Only for creation of page
     */
    async launchPresentationCreationForm(itemType = 'presentation', id = null, presentation_id = null) {
        // Get the form
        try {
            const url = presentationConfig.url;
            const request = (id === null) ? 'create' : 'modify';
            let formData = new FormData();
            formData.append('request', request);
            formData.append('id', id);
            formData.append('item_type', itemType);
            if (itemType == 'page' && request == 'create' && presentation_id) {
                formData.append('presentation_id', presentation_id);
            }
            const response = await fetch(url, {
                method: "POST",
                body: formData
            });

            // Check content type
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("text/plain")) {
                throw new TypeError("Wrong content-type. HTML Expected !");
            }

            // Get the response
            const htmlContent = await response.text();

            // Display it
            this.showForm(htmlContent);

            // Add events
            const formContainer = document.getElementById('presentation-form-container');
            const form = formContainer.querySelector('form');
            this.addFormEvents(form);

        } catch(error) {
            console.log(error);
            let previousMessage = document.getElementById('lizmap-presentation-message');
            if (previousMessage) previousMessage.remove();
            const message = `
                <b>${error}</b>
            `;
            this.addMessage(message, 'error', 5000);
        }
    }

    /**
     * Trigger actions when submitting the form
     *
     * @param {HTMLFormElement} form
     */
    addFormEvents(form) {

        // Detect click on the submit buttons
        // to change the hidden input submit_button value
        Array.from(form.querySelectorAll('input[type=submit]')).map(element => {
            element.addEventListener('click', function(event) {
                const button = event.currentTarget;
                form.querySelector("input[name=submit_button]").value = button.name;
            });
        });

        // Listen to the form submit
        form.addEventListener('submit', function (event) {

            // Prevent form from submitting to the server
            event.preventDefault();

            // Form data
            const formData = new FormData(event.target);
            const formDataObject = Object.fromEntries(formData)
            const formAction = formDataObject['submit_button'];
            // console.log(`Submit bouton = ${formAction}`);

            // Return to the list of presentations if user canceled
            if (formAction == 'cancel') {
                // Go back to the list of presentations
                mainLizmap.presentation.hideForm();

                return true;
            }

            // Send the form data
            mainLizmap.presentation.saveForm(form);
        });
    }

    /**
     * Save the form data
     *
     * @param {HTMLFormElement} form The form to save
     */
    saveForm(form) {
        const url = form.getAttribute('action');
        const formData = new FormData(form);
        const itemType = formData.get('item_type');
        const presentationId = (itemType == 'presentation') ? formData.get('id') : formData.get('presentation_id');
        fetch(url, {
            method: 'POST',
            body: formData
        }).then(function (response) {
            if (response.ok) {
                return response.text();
            }
            return Promise.reject(response);
        }).then(function (html) {
            // Display it
            const formContainer = document.getElementById('presentation-form-container');
            formContainer.innerHTML = html;

            // Check if the response contains a form or not
            const form = formContainer.querySelector('form');
            if (form) {
                // Add form events
                mainLizmap.presentation.addFormEvents(form);
            } else {
                // Display a message
                const message = html;
                mainLizmap.presentation.addMessage(message, 'info', 5000);

                // Refresh the content of the list of presentations
                const cardsElement = document.querySelector('#presentation-list-container lizmap-presentation-cards');
                cardsElement.setAttribute('detail', presentationId);
                cardsElement.setAttribute('updated', 'done');

                // Go back to the list of presentations
                mainLizmap.presentation.hideForm();
            }
        }).catch(function (error) {
            console.warn(error);
        });
    }

    /**
     * Delete the given presentation or page by its id.
     *
     * @param {string} itemType Type of item : presentation or page
     * @param {number} id ID of the presentation to delete
     */
    deletePresentation(itemType = 'presentation', id) {

        const url = presentationConfig.url;
        const formData = new FormData();
        formData.append('request', 'delete');
        formData.append('id', id);
        formData.append('item_type', itemType);
        fetch(url, {
            method: 'POST',
            body: formData
        }).then(function (response) {
            if (response.ok) {
                return response.text();
            }
            return Promise.reject(response);
        }).then(function (html) {
            // Display a message
            const message = html;
            mainLizmap.presentation.addMessage(message, 'info', 5000);

            // Refresh the content of the list of presentations
            const cardsElement = document.querySelector('#presentation-list-container lizmap-presentation-cards');
            cardsElement.setAttribute('updated', 'done');
        }).catch(function (error) {
            console.warn(error);
        });
    }

};
