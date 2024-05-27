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
     * @string Active page uuid
     */
    activePageUuid = null;

    /**
     * @string Active presentation number of pages
     */
    activePresentationPagesCount = 0;

    /**
     * @string Active page number
     */
    activePageNumber = 1;

    /**
     * OpenLayers vector layer to draw the presentation results
     */
    presentationLayer = null;

    // Original map div left margin
    mapLeftMargin = '30px';

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

            // Add a div which will contain the slideshow
            const slidesDiv = document.createElement('div');
            slidesDiv.id = 'lizmap-presentation-slides-container';
            const slidesDivTemplate = document.getElementById('lizmap-presentation-slides-container-template');
            slidesDiv.innerHTML = slidesDivTemplate.innerHTML;
            const containerId = 'presentation';
            document.getElementById(containerId).appendChild(slidesDiv);

            // Also add the button allowing to toggle back the presentation when minified
            const slidesRestoreDiv = document.createElement('div');
            slidesRestoreDiv.id = 'lizmap-presentation-slides-minified-toolbar-container';
            const slidesRestoreTemplate = document.getElementById('lizmap-presentation-slides-minified-toolbar-template');
            slidesRestoreDiv.innerHTML = slidesRestoreTemplate.innerHTML;
            document.getElementById(containerId).appendChild(slidesRestoreDiv);

            // React on the main Lizmap events
            mainLizmap.lizmap3.events.on({
            });
        }

        // Keep the map left margin before running the presentation
        let olMapDiv = document.getElementById('map');
        if (!olMapDiv) {
            olMapDiv = document.getElementById('newOlMap');
        }
        if (olMapDiv) {
            this.mapLeftMargin = olMapDiv.style.marginLeft;
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
     * @return {null|object} The corresponding presentation data
     */
    getPresentationById(presentationId) {
        if (!this.hasPresentations) {
            return null;
        }

        const presentationCards = document.querySelector('lizmap-presentation-cards');
        if (presentationCards === null) {
            return null;
        }

        for (const p in presentationCards.presentations) {
            const presentation = presentationCards.presentations[p];
            if (presentation && presentation.id == presentationId) {
                return presentation;
            }
        }

        return null;
    }

    /**
     * Get the list of presentations
     *
     * @return {Promise} presentations - Promise with the JSON list of presentations
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
     * Set the pagination for a list of given presentation
     *
     * @param {integer} presentationId ID of the presentation
     * @param {array} pages Array with the page ID as key and page number as value
     * @return {Promise} Modified presentation - Promise with the JSON of the presentations
     */
    setPresentationPagination(presentationId, pages) {

        const url = presentationConfig.url;
        let formData = new FormData();
        formData.append('request', 'set_pagination');
        formData.append('id', presentationId);
        formData.append('pages', JSON.stringify(pages));

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
            this.addMessage('No presentation found for the current Lizmap map !', 'error', 5000);

            return false;
        }

        // Get the presentation
        let presentation = this.getPresentationById(presentationId);
        if (presentation === null) {
            this.addMessage('No corresponding presentation found in the configuration !', 'error', 5000);

            return false;
        }

        // Set current presentation page number
        this.activePresentationPagesCount = presentation.pages.length;

        // Reset the other presentations
        // We allow only one active presentation at a time
        // We do not remove the active status of the button (btn-primary)
        this.resetLizmapPresentation(true, true, true, false);

        try {
            // Reset its content from the template
            const slidesContainer = document.getElementById('lizmap-presentation-slides-container');
            const slidesDivTemplate = document.getElementById('lizmap-presentation-slides-container-template');
            slidesContainer.innerHTML = slidesDivTemplate.innerHTML;

            // slidesContainer background color
            slidesContainer.style.backgroundColor = presentation.background_color;

            // Create an observer for page visibility
            let observers = {};
            let pageObserverOptions = {
                root: slidesContainer,
                rootMargin: "0px",
                threshold: [0, 0.25, 0.5, 0.75, 1],
            };
            const pageIntersectionCallback = (entries) => {
                entries.forEach((entry) => {

                    const page = entry.target;
                    const uuid = page.dataset.uuid;
                    const visiblePct = `${Math.floor(entry.intersectionRatio * 100)}`;
                    if (visiblePct >= 50) {
                        page.classList.add('active');
                        mainLizmap.presentation.onPageVisible(page);
                    } else {
                        page.classList.remove('active');
                    }

                });
            };

            // Add the pages
            let firstPage = null;
            presentation.pages.forEach(page => {
                const presentationPage = document.createElement('lizmap-presentation-page');
                presentationPage.dataset.uuid = page.uuid;
                presentationPage.dataset.number = page.page_order;
                presentationPage.presentation = presentation;
                presentationPage.properties = page;
                slidesContainer.appendChild(presentationPage);

                // Add intersection observer
                const observer = new IntersectionObserver(
                    pageIntersectionCallback,
                    pageObserverOptions,
                );
                observers[page.uuid] = observer;
                observers[page.uuid].observe(presentationPage);

                // Store first page component
                if (firstPage === null) {
                    firstPage = presentationPage;
                }
            })

            // Set the presentation slides container visible
            const dock = document.getElementById('dock');
            dock.classList.add('presentation-visible');
            slidesContainer.classList.add('visible');
            slidesContainer.classList.add('visible');

            // Set first page as active
            this.goToGivenPage(1);
            if (firstPage !== null) {
                mainLizmap.presentation.onPageVisible(firstPage, true);
            }

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
            this.addMessage(error, 'error', 5000);

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

        // Hide presentation slides container
        const slidesContainer = document.getElementById('lizmap-presentation-slides-container');
        if (!slidesContainer) {
            return;
        }

        // Reactivate presentation dock
        const notActivePresentationDock = document.querySelector('#mapmenu ul > li.presentation:not(.active) a');
        if (notActivePresentationDock) {
            notActivePresentationDock.click();
        }

        // Put back the interface as initial
        slidesContainer.innerHTML = '';
        slidesContainer.classList.remove('visible');
        const dock = document.getElementById('dock');
        dock.classList.remove('presentation-visible', 'presentation-half', 'presentation-full');
        const oldMapDiv = document.getElementById('map');
        const mapDiv = document.getElementById('newOlMap');
        // THIS CANNOT BE DONE WITH CSS
        if (mapDiv) {
            mapDiv.style.marginLeft = this.mapLeftMargin;
            mapDiv.style.width = '100%';
        }
        if (oldMapDiv) {
            oldMapDiv.style.marginLeft = this.mapLeftMargin;
            oldMapDiv.style.width = '100%';
        }

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
     * Toggle the lizMap presentation
     *
     */
    toggleLizmapPresentation(show = false) {
        const slidesContainer = document.getElementById('lizmap-presentation-slides-container');
        const slidesRestore = document.getElementById('lizmap-presentation-slides-minified-toolbar');
        const dock = document.getElementById('dock');
        const oldMapDiv = document.getElementById('map');
        const mapDiv = document.getElementById('newOlMap');
        if (!show) {
            // Remove visible class
            slidesContainer.classList.remove('visible');
            slidesRestore.classList.add('visible');
            dock.classList.remove('presentation-visible');

            // Put map back to original size
            // THIS CANNOT BE DONE WITH CSS
            if (mapDiv) {
                mapDiv.style.marginLeft = this.mapLeftMargin;
                mapDiv.style.width = '100%';
            }
            if (oldMapDiv) {
                oldMapDiv.style.marginLeft = this.mapLeftMargin;
                oldMapDiv.style.width = '100%';
            }
        } else {
            // Add presentation visible classes
            dock.classList.add('presentation-visible');
            slidesContainer.classList.add('visible');
            slidesRestore.classList.remove('visible');
            // We need to run the setInterfaceFromPage method to set the page & map width
            const page = document.querySelector(`lizmap-presentation-page[data-number="${this.activePageNumber}"]`);
            if (page) {
                this.setInterfaceFromPage(page);
            }
        }
    }

    /**
     * Go to the given active presentation page
     * @param {integer} pageNumber The page number to go to
     */
    goToGivenPage(pageNumber) {
        // console.log(`from ${this.activePageNumber} to ${pageNumber}`);
        const targetAnchor = document.querySelector(`a.lizmap-presentation-page-anchor[name="${pageNumber}"]`);
        if (targetAnchor) {
            targetAnchor.scrollIntoView();
        }
    }

    // Go to the previous page
    goToPreviousPage() {
        const targetPage = parseInt(this.activePageNumber) - 1;
        if (targetPage >= 1) {
            this.goToGivenPage(targetPage);
        }
    }

    // Go to the next page
    goToNextPage() {
        // Get current page
        const targetPage = parseInt(this.activePageNumber) + 1;
        if (targetPage <= this.activePresentationPagesCount) {
            this.goToGivenPage(targetPage);
        }
    }

    // Go to the first page
    goToFirstPage() {
        this.goToGivenPage(1);
    }

    // Go to the last page
    goToLastPage() {
        this.goToGivenPage(this.activePresentationPagesCount);
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
     * Set Lizmap interface (dock & map) according to the given page
     *
     * This is mainly used to set the correct width & margins
     *
     * @param {HTMLElement} page Lizmap presentation page component
     */
    setInterfaceFromPage(page) {
        console.log('setInterfaceFromPage');
        // TODO page width must be set from page data
        const pageWidthClass = 'presentation-half';
        const dockWidth = (pageWidthClass == 'presentation-half') ? '50%' : '100%';
        const dock = document.getElementById('dock');
        const oldMapDiv = document.getElementById('map');
        const mapDiv = document.getElementById('newOlMap');

        // Set interface classes
        dock.classList.remove('presentation-half', 'presentation-full');
        dock.classList.add(pageWidthClass);
        // THIS CANNOT BE DONE WITH CSS
        if (mapDiv) {
            mapDiv.style.marginLeft = (pageWidthClass == 'presentation-half') ? '50%' : this.mapLeftMargin;
            mapDiv.style.width = dockWidth;
        }
        if (oldMapDiv) {
            oldMapDiv.style.marginLeft = (pageWidthClass == 'presentation-half') ? '50%' : this.mapLeftMargin;
            oldMapDiv.style.width = dockWidth;
        }
    }

    /**
     * Set Lizmap interface view depending on active page
     */
    onPageVisible(page, isFirst = false) {
        // Manage global uuid property
        const uuid = page.dataset.uuid;
        let newPageVisible = null;

        // Set the global object page UUID if not set yet
        if (this.activePageUuid === null) {
            this.activePageUuid = uuid;
            newPageVisible = uuid;
        }

        // Check if the active UUID is different from the given page uuid
        if (uuid != this.activePageUuid) {
            this.activePageUuid = uuid;
            newPageVisible = uuid;
        }

        // Set the active page number
        this.activePageNumber = page.dataset.number;

        // Store when the page has valid map properties (extent or tree state)
        let hasMapProperties = false;

        // Change Lizmap state only if active page has changed
        if (newPageVisible !== null || isFirst) {
            // Change Lizmap interface depending of the current page map properties
            this.setInterfaceFromPage(page);

            // Set layer tree state if needed
            const treeStateString = page.properties.tree_state;
            if (treeStateString !== null) {
                try {
                    const treeState = JSON.parse(treeStateString);
                    if ('groups' in treeState && 'layers' in treeState) {
                        // Groups
                        const groups = lizMap.mainLizmap.state.layersAndGroupsCollection.groups;
                        if (treeState.groups.length > 0) {
                            for (const group of groups) {
                                group.checked = (treeState.groups.includes(group.name));
                            }
                        }

                        // Then layers
                        const layers = lizMap.mainLizmap.state.layersAndGroupsCollection.layers;
                        if (treeState.layers.length > 0) {
                            for (const layer of layers) {
                                layer.checked = (treeState.layers.includes(layer.name));
                            }
                        }

                        hasMapProperties = true;
                    }
                } catch(error) {
                    console.log(error);
                    console.log(`Wrong tree state for the active presentation page ${uuid}`);
                }
            }

            // Set Map extent if needed
            // Use OpenLayers animation
            const mapExtent = page.properties.map_extent;
            if (mapExtent !== null) {
                // Set map extent
                const newExtent = mapExtent.split(',');
                if (newExtent.length == 4) {
                    hasMapProperties = true;
                    // lizMap.mainLizmap.extent = newExtent;
                    const view = lizMap.mainLizmap.map.getView();
                    // Animate the view to the extent
                    view.fit(
                        newExtent, {
                            duration: 500
                        }
                    );
                }
            }
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
            // Get sub-dock
            const subDock = document.getElementById('sub-dock');
            subDock.style.maxWidth = '50%';
            const html = `
                <div id="presentation-form-container" class="form-container">${htmlContent}</div>
            `;
            // Using innerHtml or insertAdjacentHTML prevents from running jForms embedded <script>
            // We should use jQuery html() method instead
            // subDock.innerHTML = html;
            $('#sub-dock').html(html);
            if (!subDock.checkVisibility()) {
                subDock.style.display = 'block';
            }

            // Add forms events
            const formContainer = document.getElementById('presentation-form-container');
            const form = formContainer.querySelector('form');
            this.addFormEvents(form);

        } catch(error) {
            console.log(error);
            let previousMessage = document.getElementById('lizmap-presentation-message');
            if (previousMessage) previousMessage.remove();
            const errorMessage = `
                <b>${error}</b>
            `;
            this.addMessage(errorMessage, 'error', 5000);
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

        // Get some form data
        const formData = new FormData(form);
        const formDataObject = Object.fromEntries(formData)
        const itemType = formData.get('item_type');
        const formId = (itemType == 'presentation') ? 'jforms_presentation_presentation' : 'jforms_presentation_presentation_page';

        // Page form - Add map & bbox buttons after the model combobox
        if (itemType == 'page') {
            // Find model SELECT
            const select = document.getElementById('jforms_presentation_presentation_page_model');

            // Add extent button
            const bboxButton = document.createElement('button');
            bboxButton.classList.add('btn', 'btn-mini', 'presentation-page-add-bbox');
            bboxButton.name = 'add-bbox';
            bboxButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Get bbox and store it
                const extent = lizMap.mainLizmap.state.map.extent;
                const extentInput = document.querySelector('#presentation-form-container form input[name="map_extent"]');
                const extentValue = extent.join(',');
                extentInput.value = extentValue;

                return false;
            });
            select.insertAdjacentElement('afterend', bboxButton);

            // Add tree state button
            const treeButton = document.createElement('button');
            treeButton.classList.add('btn', 'btn-mini', 'presentation-page-add-tree-state');
            treeButton.name = 'add-tree-state';
            treeButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Get layer tree state and store it
                const layers = lizMap.mainLizmap.state.layersAndGroupsCollection.layers;
                const groups = lizMap.mainLizmap.state.layersAndGroupsCollection.groups;
                const checkedLayers = layers.filter(l => (l.checked)).map(l => l.name);
                const checkedGroups = groups.filter(g => (g.checked)).map(g => g.name);
                const treeStateInput = document.querySelector('#presentation-form-container form input[name="tree_state"]');
                const treeStateValue = JSON.stringify(
                    {'groups': checkedGroups, 'layers': checkedLayers}
                );
                treeStateInput.value = treeStateValue;

                return false;
            });
            select.insertAdjacentElement('afterend', treeButton);

        }

        // Listen to the form submit
        jFormsJQ.onFormReady(formId,
            function(jForm) {
                jFormsJQ.getForm(formId).addSubmitHandler(function(ev){
                    // We must detect which button has been clicked
                    // and prevent from submitting the form if it is not
                    const formElt = document.querySelector('#presentation-form-container form');
                    const formData = new FormData(formElt);
                    const formDataObject = Object.fromEntries(formData)
                    const formAction = formDataObject['submit_button'];

                    // Do not submit with buttons which have not the submit name
                    // console.log(formAction);
                    if (formAction != 'submit') {
                        // Return to the list of presentations if user canceled
                        if (formAction == 'cancel') {
                            mainLizmap.presentation.hideForm();
                        }

                        return false;
                    }

                    return true;
                });

                // on active le submit avec xhr
                jForm.submitWithXHR(
                    // callback when the form action returns success
                    function(result) {
                        // console.log(result);
                        // Success message
                        mainLizmap.presentation.addMessage(result.customData.message, 'info', 5000);

                        // Refresh the content of the list of presentations
                        // TODO : use the data given in result.customData & avoid getting data from the form
                        const formElt = document.querySelector('#presentation-form-container form');
                        const formData = new FormData(formElt);
                        const itemType = formData.get('item_type');
                        const presentationId = (itemType == 'presentation') ? formData.get('id') : formData.get('presentation_id');
                        const cardsElement = document.querySelector('#presentation-list-container lizmap-presentation-cards');
                        cardsElement.setAttribute('detail', presentationId);
                        cardsElement.setAttribute('updated', 'done');

                        // Go back to the list of presentations
                        mainLizmap.presentation.hideForm();
                    },

                    // callback when the form action returns errors
                    function(result) {
                        let errorMessage = 'An error occurred while saving the form';

                        if (result.customData && 'message' in result.customData) {
                            errorMessage = result.customData.message;
                        } else if ('errorMessage' in result) {
                            errorMessage = result.errorMessage;
                            // Add more detail if present
                            if (result.customData && 'errors' in result.customData) {
                                for (const e in result.customData.errors) {
                                    const errorItem = result.customData.errors[e];
                                    errorMessage += `<p>${errorItem.title}: ${errorItem.detail}</p>`;
                                }
                            }
                        } else if ('errors' in result) {
                            errorMessage = '';
                            for (const [field, message] of Object.entries(result.errors)) {
                                errorMessage += `${field}: ${message}<br/>`;
                            }
                        }
                        mainLizmap.presentation.addMessage(errorMessage, 'error', 5000);
                    }
                );
            }
        );
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
