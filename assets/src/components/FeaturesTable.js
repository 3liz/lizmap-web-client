/**
 * @module components/FeaturesTable.js
 * @name FeaturesTable
 * @copyright 2024 3Liz
 * @author DOUCHIN Michaël
 * @license MPL-2.0
 */

import { html, render } from 'lit-html';
import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';

/**
 * @class
 * @name FeaturesTable
 * @summary Allows to display a compact list of vector layer features labels
 * @augments HTMLElement
 * @element lizmap-features-table
 * @fires features.table.item.dragged
 * @fires features.table.rendered
 */
export default class FeaturesTable extends HTMLElement {

    constructor() {
        super();

        // Random element id
        this.id = window.crypto.randomUUID();

        // Layer name
        this.layerTitle = this.getAttribute('layerTitle') || 'Features table: error';

        // Layer id
        this.layerId = this.getAttribute('layerId');

        // Error text
        this.error = null;

        // Get the layer name & configuration
        this.layerConfig = null;
        if (mainLizmap.initialConfig.layers.layerIds.includes(this.layerId)) {
            this.layerConfig = mainLizmap.initialConfig.layers.getLayerConfigByLayerId(this.layerId);
        }

        // Primary key field
        this.uniqueField = this.getAttribute('uniqueField');

        // Expression filter
        this.expressionFilter = this.getAttribute('expressionFilter');

        // Get the geometry or NetworkError
        this.withGeometry = this.hasAttribute('withGeometry');

        // Sorting attribute and direction
        this.sortingField = this.getAttribute('sortingField');
        const sortingOrder = this.getAttribute('sortingOrder');
        this.sortingOrder = (sortingOrder !== null && ['asc', 'desc'].includes(sortingOrder)) ? this.sortingField : 'asc';

        // open popup ?
        this.openPopup = (this.layerConfig && this.layerConfig.popup);

        // Add drag&drop capability ?
        const draggable = this.getAttribute('draggable');
        this.itemsDraggable = (draggable !== null && ['yes', 'no'].includes(draggable)) ? draggable : 'no';

        // Features
        this.features = [];

        // Clicked item feature ID
        this.activeItemFeatureId = null;

        // Clicked item line number
        this.activeItemLineNumber = null;
    }

    /**
     * Load features from the layer and configured filter
     */
    async load() {
        // Build needed fields
        let fields = `${this.uniqueField}`;
        if (this.sortingField) {
            fields += ',' + this.sortingField;
        }

        // Get the features corresponding to the given parameters from attributes
        mainLizmap.featuresTable.getFeatures(this.layerId, this.expressionFilter, this.withGeometry, fields)
            .then(displayExpressions => {
                // Check for errors
                if (!('status' in displayExpressions)) return;

                if (displayExpressions.status != 'success') {
                    console.error(displayExpressions.error);
                } else {

                    // Set component data property
                    this.features = displayExpressions.data;

                    // Sort data if needed
                    if (this.features.length > 1) {
                        this.sortFeatures();
                    }
                }

                // Render
                this.render();

                // If an error occurred, replace empty content with error
                if (displayExpressions.status != 'success') {
                    this.querySelector('div.lizmap-features-table-container').innerHTML = `<p style="padding: 3px;">
                    ${displayExpressions.error}
                    </p>`;
                }
            })
            .catch(err => {
                // Display an error message
                console.warn(err.message);
                this.innerHTML = `<p style="padding: 3px;">${err.message}</p>`;
            })
    }

    /**
     * Sort the features array property
     * depending on the options
     */
    sortFeatures() {
        // Order data by given fields or fallback to descending order by id
        let sortingField = 'display_expression';
        let sortingOrder = 'asc';
        let sortingType = 'string';

        // Get first line to check if needed fields are present
        const first = this.features[0];
        if (first && this.sortingField && this.sortingField in first.properties) {
            sortingField = this.sortingField;
            sortingOrder = this.sortingOrder;
            if (!isNaN(first.properties[sortingField])) {
                sortingType = 'number';
            }
        }

        // Reorder the array of data
        if (sortingType == 'number') {
            if (sortingOrder == 'asc') {
                this.features.sort((a, b) => (a.properties[sortingField] || 0) - (b.properties[sortingField] || 0));
            } else {
                this.features.sort((a, b) => (b.properties[sortingField] || 0) - (a.properties[sortingField] || 0));
            }
        } else {
            if (sortingOrder == 'asc') {
                this.features.sort(
                    (a, b) => (a.properties[sortingField] || '').localeCompare(
                        b.properties[sortingField] || '',
                        navigator.language,
                        {sensitivity: 'accent'}
                    )
                );
            } else {
                this.features.sort(
                    (a, b) => (b.properties[sortingField] || '').localeCompare(
                        a.properties[sortingField] || '',
                        navigator.language,
                        {sensitivity: 'accent'}
                    )
                );
            }
        }
    }

    /**
     * Render component from the template using Lit
     */
    render() {

        // Render with lit-html
        render(this._template(), this);

        // If there is not features, add empty content in the container
        if (this.features.length === 0) {
            this.querySelector('div.lizmap-features-table-container').innerHTML = '&nbsp;';
        }

        // Add drag & drop capabilities if option is set
        if (this.itemsDraggable == 'yes') {
            this.addDragAndDropCapabilities();
        }

        /**
         * When the table has been successfully displayed. The event carries the lizmap-features-table HTML element ID
         * @event features.table.rendered
         * @property {string} elementId HTML element ID
         */
        mainEventDispatcher.dispatch({
            type: 'features.table.rendered',
            elementId: this.id
        });

    }

    /**
     * Display a popup when a feature item is clicked
     *
     * @param {Event} event Click event on a feature item
     * @param {Object} feature WFS feature
     * @param {number} lineId Line number of the item in the features table
     */
    onItemClick(event, feature) {
        if (!this.openPopup) {return true;}

        // Check if the item was active
        const itemWasActive = (this.activeItemFeatureId == feature.properties.feature_id);

        // Titles based on active status
        const activeItemTitle = `${this.openPopup ? lizDict['featuresTable.item.active.hover']: ''}`;
        const defaultItemTitle = `${this.openPopup ? lizDict['featuresTable.item.hover'] + '.': ''} ${this.itemsDraggable == 'yes' ? lizDict['featuresTable.item.draggable.hover'] + '.' : ''}`;

        if (!itemWasActive) {

            // Set the features table properties
            const lineId = parseInt(event.target.dataset.lineId);
            this.activeItemFeatureId = feature.properties.feature_id;
            this.activeItemLineNumber = lineId;

            // Get popup data and display it
            mainLizmap.featuresTable.openPopup(
                event.target.dataset.layerId,
                feature,
                this.uniqueField,
                event.target.parentElement.parentElement.querySelector('div.lizmap-features-table-item-popup'),
                function(aLayerId, aFeature, aTarget) {
                    // Add bootstrap classes to the popup tables
                    const popupTable = aTarget.querySelector('table.lizmapPopupTable');
                    if (popupTable) {
                        popupTable.classList.add('table', 'table-condensed', 'table-sm', 'table-bordered', 'table-striped');
                    }

                    // Show popup and hide other children
                    const featuresTableDiv = aTarget.parentElement;
                    if (featuresTableDiv) {
                        // Add class to the parent
                        featuresTableDiv.classList.add('popup-displayed');

                        // Remove popup-displayed for all other items
                        // And restore previous title
                        var items = featuresTableDiv.querySelectorAll('div.lizmap-features-table-container div.lizmap-features-table-item.popup-displayed');
                        Array.from(items).forEach(item => {
                            item.classList.remove('popup-displayed');
                            item.setAttribute('title', defaultItemTitle);
                        });

                        // Add class to the active item
                        const childSelector = `div.lizmap-features-table-item[data-feature-id="${feature.properties.feature_id}"]`;
                        const activeItem = featuresTableDiv.querySelector(childSelector);
                        if (activeItem) activeItem.classList.add('popup-displayed');

                        // Change title
                        activeItem.setAttribute('title', activeItemTitle);

                        // Toggle previous/next buttons depending on active line id
                        const previousButton = featuresTableDiv.querySelector('div.lizmap-features-table-toolbar button.previous-popup');
                        const nextButton = featuresTableDiv.querySelector('div.lizmap-features-table-toolbar button.next-popup');
                        previousButton.style.display = (activeItem.dataset.lineId == 1) ? 'none' : 'initial';
                        nextButton.style.display = (activeItem.dataset.lineId == featuresTableDiv.dataset.featuresCount) ? 'none' : 'initial';
                    }
                }
            );
        } else {
            // Set the features table properties
            this.activeItemFeatureId = null;
            this.activeItemLineNumber = null;

            event.target.classList.remove('popup-displayed');
            event.target.setAttribute('title', defaultItemTitle);
            event.target.closest('div.lizmap-features-table').classList.remove('popup-displayed');
        }
    }


    /**
     * Add drag&drop capabilities to the lizmap-features-table element
     *
     * A request is sent when the order changes
     */
    addDragAndDropCapabilities() {
        // Add drag and drop events to table items
        const items = this.querySelectorAll('div.lizmap-features-table-container div.lizmap-features-table-item');
        if (!items) return;

        Array.from(items).forEach(item => {
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', onDragStart)
            item.addEventListener('drop', OnDropped)
            item.addEventListener('dragenter', onDragEnter)
            item.addEventListener('dragover', onDragOver)
            item.addEventListener('dragleave', onDragLeave)
            item.addEventListener('dragend', onDragEnd)
        });

        // Utility functions for drag & drop capability
        function onDragStart (e) {
            const index = [].indexOf.call(e.target.parentElement.children, e.target);
            e.dataTransfer.setData('text/plain', index)
        }

        function onDragEnter (e) {
            cancelDefault(e);
        }

        function onDragOver (e) {
            // Change the target element's style to signify a drag over event
            // has occurred
            e.currentTarget.style.background = "lightblue";

            cancelDefault(e);
        }

        function onDragLeave (e) {
            // Change the target element's style back to default
            e.currentTarget.style.background = "";
            cancelDefault(e);
        }

        function waitForIt(delay) {
            return new Promise((resolve) => setTimeout(resolve, delay))
        }

        function OnDropped (e) {
            cancelDefault(e)

            // Change the target element's style back to default
            // Celui sur lequel on a lâché l'item déplacé
            e.currentTarget.style.background = "";

            // Get item
            const item = e.currentTarget;

            // Get dragged item old and new index
            const oldIndex = e.dataTransfer.getData('text/plain');

            // Get the dropped item
            const dropped = item.parentElement.children[oldIndex];

            // Emphasize the element
            // So that the user sees it well after drop
            dropped.style.border = "2px solid var(--color-contrasted-elements)";

            // Move the dropped items at new place
            item.before(dropped);

            // Set the new line number to the items
            let i = 1;
            for (const child of item.parentElement.children) {
                if (!child.classList.contains('lizmap-features-table-item')) {
                    continue;
                }
                const lineId = i;
                child.dataset.lineId = lineId;
                i++;
            }

            // Send event
            const movedFeatureId = dropped.dataset.featureId;
            const newItem = item.parentElement.querySelector(`div.lizmap-features-table-item[data-feature-id="${movedFeatureId}"]`);
            /**
             * When the user has dropped an item in a new position
             * @event features.table.item.dragged
             * @property {string} itemFeatureId The vector feature ID
             * @property {string} itemOldLineId The original line ID before dropping the item
             * @property {string} itemNewLineId The new line ID after dropping the item in a new position
             */
            mainEventDispatcher.dispatch({
                type: 'features.table.item.dragged',
                itemFeatureId: movedFeatureId,
                itemOldLineId: dropped.dataset.lineId,
                itemNewLineId: newItem.dataset.lineId
            });
        }

        async function onDragEnd (e) {
            // Restore style after some time
            await waitForIt(3000);
            e.target.style.border = "";
            // e.target.style.backgroundColor = "";

            cancelDefault(e);
        }

        function cancelDefault (e) {
        e.preventDefault();
        e.stopPropagation();

        return false;
        }


    }


    connectedCallback() {
        // Template
        this._template = () => html`
            <div class="lizmap-features-table" data-features-count="${this.features.length}"
                title="${lizDict['bob']}">
                <h4>${this.layerTitle}</h4>
                <div class="lizmap-features-table-toolbar">
                    <button class="btn btn-mini previous-popup"
                        title="${lizDict['featuresTable.toolbar.previous']}"
                        @click=${event => {
                        // Click on the previous item
                        const lineNumber = this.activeItemLineNumber - 1;
                        const featureDiv = this.querySelector(`div.lizmap-features-table-item[data-line-id="${lineNumber}"]`);
                        if (featureDiv) featureDiv.click();
                    }}></button>
                    <button class="btn btn-mini next-popup"
                        title="${lizDict['featuresTable.toolbar.next']}"
                        @click=${event => {
                        // Click on the next item
                        const lineNumber = this.activeItemLineNumber + 1;
                        const featureDiv = this.querySelector(`div.lizmap-features-table-item[data-line-id="${lineNumber}"]`);
                        if (featureDiv) featureDiv.click();
                    }}></button>
                    <button class="btn btn-mini close-popup"
                        title="${lizDict['featuresTable.toolbar.close']}"
                        @click=${event => {
                        // Click on the active line to deactivate it
                        if (this.activeItemFeatureId === null) return;
                        const featureDiv = this.querySelector(`div.lizmap-features-table-item[data-feature-id="${this.activeItemFeatureId}"]`);
                        featureDiv.click();
                    }}></button>
                </div>
                <div class="lizmap-features-table-container">
                ${this.features.map((feature, idx) =>
                    html`
                    <div
                        class="lizmap-features-table-item ${this.openPopup ? 'has-action' : ''}"
                        data-layer-id="${this.layerId}"
                        data-feature-id="${feature.properties.feature_id}"
                        data-line-id="${idx+1}"
                        title="${this.openPopup ? lizDict['featuresTable.item.hover'] + '.': ''} ${this.itemsDraggable == 'yes' ? lizDict['featuresTable.item.draggable.hover'] + '.' : ''}"
                        @click=${event => {
                            this.onItemClick(event, feature);
                        }}
                    >${feature.properties.display_expression}
                    </div>
                    `
                )}
                </div>
                <div class="lizmap-features-table-item-popup"></div>
            </div>
        `;

        // Load
        this.load();
    }

    static get observedAttributes() { return ['updated']; }

    attributeChangedCallback(name, oldValue, newValue) {
        // Listen to the change of the updated attribute
        // This will trigger the load (refresh the content)
        if (name === 'updated') {
            console.log('Reload features table');
            this.load();
        }
    }
    disconnectedCallback() {

    }
}
