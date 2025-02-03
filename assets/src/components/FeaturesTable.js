/**
 * @module components/FeaturesTable.js
 * @name FeaturesTable
 * @copyright 2024 3Liz
 * @author DOUCHIN Michaël
 * @license MPL-2.0
 */

import { html, render } from 'lit-html';
import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';

import GeoJSON from 'ol/format/GeoJSON.js';

/**
 * @class
 * @name FeaturesTable
 * @summary Allows to display a compact list of vector layer features labels
 * @augments HTMLElement
 * @description lizmap-features-table
 * @fires FeaturesTable#features.table.item.highlighted
 * @fires FeaturesTable#features.table.item.dragged
 * @fires FeaturesTable#features.table.rendered
 * @example <caption>Example of use</caption>
 * <lizmap-features-table draggable="yes" sortingOrder="asc" sortingField="libsquart"
 *                        withGeometry="1" expressionFilter="quartmno = 'HO'"
 *                        uniqueField="id" layerId="subdistrict_24ceec66_e7fe_46a2_b57a_af5c50389649"
 *                        layerTitle="child sub-districts"
 *                        (optional) data-show-highlighted-feature-geometry="true"
 *                        (optional) data-center-to-highlighted-feature-geometry="true"
 *                        (optional) data-max-features="100"
 *                        (optional) data-active-item-feature-id="5"
 *                        >
 *      <lizmap-field data-alias="District's name" data-description="Label of district's name">
 *         "libsquart"
 *      </lizmap-field>
 * </lizmap-features-table>
 */
export default class FeaturesTable extends HTMLElement {

    constructor() {
        super();

        // Random element id
        if (window.isSecureContext) {
            this.id = window.crypto.randomUUID();
        } else {
            this.id = btoa(String.fromCharCode(...new Uint8Array( Array(30).fill().map(() => Math.round(Math.random() * 30)) )));
        }

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

        // Sorting attribute
        this.sortingField = this.getAttribute('sortingField');
        // Sorting order
        const sortingOrder = this.getAttribute('sortingOrder');
        this.sortingOrder = (sortingOrder !== null && ['asc', 'desc'].includes(sortingOrder.toLowerCase())) ? sortingOrder : 'asc';

        // open popup ?
        this.openPopup = (this.layerConfig && this.layerConfig.popup);

        // Add drag&drop capability ?
        const draggable = this.getAttribute('draggable');
        this.itemsDraggable = (draggable !== null && ['yes', 'no'].includes(draggable.toLowerCase())) ? draggable : 'no';

        // Features
        this.features = [];

        // Additional Fields JSON
        this.additionalFields = {fields:[]};

        // Clicked item line number
        this.activeItemLineNumber = null;

        // Maximum number of features
        this.maxFeatures = (this.dataset.maxFeatures > 0) ? this.dataset.maxFeatures : 1000;
    }

    /**
     * Load features from the layer and configured filter
     */
    async load() {
        if (this.dataset.showHighlightedFeatureGeometry === 'true') {
            // Remove the highlight on the map
            mainLizmap.map.clearHighlightFeatures();
        }

        // Build needed fields
        let fields = `${this.uniqueField}`;
        if (this.sortingField) {
            fields += ',' + this.sortingField;
        }

        let uniqueAdditionalFields = [];

        // Create a unique JSON object for PHP request
        if (!this.isAdditionalFieldsEmpty()) {
            uniqueAdditionalFields = {};

            this.additionalFields.fields.forEach(field => {
                uniqueAdditionalFields[field.alias] = field.expression;
            });
        }
        // Get the features corresponding to the given parameters from attributes
        mainLizmap.featuresTable.getFeatures(this.layerId, this.expressionFilter, this.withGeometry, fields, uniqueAdditionalFields, this.maxFeatures, this.sortingField, this.sortingOrder)
            .then(displayExpressions => {
                // Check for errors
                if (!('status' in displayExpressions)) return;

                if (displayExpressions.status != 'success') {
                    console.error(displayExpressions.error);
                } else {

                    // Set component data property
                    this.features = displayExpressions.data;
                }

                // Render
                this.render();

                // If an error occurred, replace empty content with error
                if (displayExpressions.status != 'success') {
                    this.querySelector('table.lizmap-features-table-container').innerHTML = `<p style="padding: 3px;">
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
     * Render component from the template using Lit
     */
    render() {
        // Render with lit-html
        render(this._template(), this);

        // If there is not features, add empty content in the container
        if (this.features.length === 0) {
            this.querySelector('table.lizmap-features-table-container').innerHTML = '&nbsp;';
        } else {

            // Add drag & drop capabilities if option is set
            if (this.itemsDraggable == 'yes') {
                this.addDragAndDropCapabilities();
            }

            // Toggle the feature detail
            this.toggleFeatureDetail();
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
     * Get the feature corresponding to the given feature ID
     * @param {number} featureId WFS Feature ID
     * @returns {object | null} WFS Feature
     */
    getFeatureById(featureId) {
        if (this.features.length === 0) {
            return null;
        }

        return this.features.find(feature => feature.properties.feature_id == featureId);
    }

    /**
     * Toggle the display of the active feature details
     *
     */
    toggleFeatureDetail() {
        // Do nothing if features have not been fetched yet
        // This is important to be able to create a new element
        // with its attribute data-active-item-feature-id set to a feature ID
        if (!this.features.length) return;

        // Get the value store in the dataset attribute
        const activeItemFeatureId = this.dataset.activeItemFeatureId;
        // console.log(`Toggle. activeItemFeatureId = ${activeItemFeatureId}`);

        // We should hide or display the features details
        // depending on the attribute value
        // If it is empty or a string 'null', hide the popup and remove the geometry
        // It is set to an existing feature ID, display the popup and the feature geometry
        if (!activeItemFeatureId || activeItemFeatureId === 'null') {
            // activeItemFeatureId empty or a string 'null'
            // deactivate the display of feature details (popup, geometry, etc.)
            if (this.openPopup) {
                // Hide the popup and display the list of features
                const item = this.querySelector('tr.lizmap-features-table-item.popup-displayed');
                if (item) item.classList.remove('popup-displayed');

                // Set the tr title back to original
                this.querySelectorAll('tr.lizmap-features-table-item').forEach(tr => {
                    tr.setAttribute(
                        'title',
                        `${lizDict['featuresTable.item.hover'] + '.'} ${this.itemsDraggable == 'yes' ? lizDict['featuresTable.item.draggable.hover'] + '.' : ''}`
                    );
                });

                // Also remove the popup-displayed class from the div
                const div = this.querySelector('div.lizmap-features-table.popup-displayed');
                if (div) div.classList.remove('popup-displayed');
            }

            // Remove the highlight on the map
            if (this.dataset.showHighlightedFeatureGeometry === 'true') {
                mainLizmap.map.clearHighlightFeatures();
            }

            // Reset the active line number
            this.activeItemLineNumber = null;
        } else {
            // activeItemFeatureId is set
            // activate the display of feature details (popup, geometry, etc.)

            // Set the active line number
            const lineTr = this.querySelector(`tr.lizmap-features-table-item[data-feature-id="${activeItemFeatureId}"]`);
            if (lineTr) {
                this.activeItemLineNumber = parseInt(lineTr.dataset.lineId);
            }

            // Get the WFS feature
            const activeFeature = this.getFeatureById(activeItemFeatureId);
            // If no feature corresponds, we should deactivate the features detail
            if (!activeFeature) {
                this.setAttribute("data-active-item-feature-id", "");

                return;
            }

            // Display the feature popup
            if (this.openPopup) {
                this.displayFeaturePopup(activeFeature);
            }

            // Center the map on the clicked element if the feature has a geometry
            if (activeFeature.geometry && this.dataset.centerToHighlightedFeatureGeometry === 'true') {
                const geom = (new GeoJSON()).readGeometry(activeFeature.geometry, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: lizMap.mainLizmap.projection
                });
                mainLizmap.map.zoomToGeometryOrExtent(geom, { duration: 150 });
            }

            // Highlight the clicked element on the map
            if (this.dataset.showHighlightedFeatureGeometry === 'true') {
                mainLizmap.map.setHighlightFeatures(
                    activeFeature,
                    "geojson",
                    "EPSG:4326",
                );
            }

            // Dispatch event
            /**
             * When the user has selected an item and highlighted it
             * @event features.table.item.highlighted
             * @property {string} itemFeatureId The feature ID of the selected item
             */
            mainEventDispatcher.dispatch({
                type: 'features.table.item.highlighted',
                itemFeatureId: activeItemFeatureId,
            });

        }
    }

    /**
     * Get the feature popup HTML content
     * and display it
     * @param {object} feature WFS feature
     */
    displayFeaturePopup(feature) {
        // Get the default title for the table lines (tr)
        const defaultItemTitle = `${lizDict['featuresTable.item.hover']}. ${this.itemsDraggable == 'yes' ? lizDict['featuresTable.item.draggable.hover'] + '.' : ''}`;

        // Fetch the feature popup HTML and use it to display the popup
        mainLizmap.featuresTable.openPopup(
            this.layerId,
            feature,
            this.uniqueField,
            this.querySelector('div.lizmap-features-table-item-popup'),
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
                    var items = featuresTableDiv.querySelectorAll('table.lizmap-features-table-container tr.lizmap-features-table-item.popup-displayed');
                    Array.from(items).forEach(item => {
                        item.classList.remove('popup-displayed');
                        item.setAttribute('title', defaultItemTitle);
                    });

                    // Add class to the active item
                    const childSelector = `tr.lizmap-features-table-item[data-feature-id="${feature.properties.feature_id}"]`;
                    const activeItem = featuresTableDiv.querySelector(childSelector);
                    if (activeItem) activeItem.classList.add('popup-displayed');

                    // Change title
                    activeItem.setAttribute(
                        'title',
                        lizDict['featuresTable.item.active.hover']
                    );

                    // Toggle previous/next buttons depending on active line id
                    const previousButton = featuresTableDiv.querySelector('div.lizmap-features-table-toolbar button.previous-popup');
                    const nextButton = featuresTableDiv.querySelector('div.lizmap-features-table-toolbar button.next-popup');
                    previousButton.style.display = (activeItem.dataset.lineId == 1) ? 'none' : 'initial';
                    nextButton.style.display = (activeItem.dataset.lineId == featuresTableDiv.dataset.featuresCount) ? 'none' : 'initial';
                }
            }
        );
    }

    /**
     * Display a popup when a feature item is clicked
     * @param {Event} event Click event on a feature item
     * @param {number} featureId WFS feature ID
     */
    onItemClick(event, featureId) {
        // console.log('onItemClick - top');
        // Check if the item was active
        const itemWasActive = (this.dataset.activeItemFeatureId == featureId);

        // Set the features table properties
        if (!itemWasActive) {
            this.setAttribute('data-active-item-feature-id', featureId);
        } else {
            this.setAttribute('data-active-item-feature-id', "");
            this.activeItemLineNumber = null;
        }
    }


    /**
     * Add drag&drop capabilities to the lizmap-features-table element
     *
     * A request is sent when the order changes
     */
    addDragAndDropCapabilities() {
        // Add drag and drop events to table items
        const items = this.querySelectorAll('table.lizmap-features-table-container tr.lizmap-features-table-item');
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
        /**
         * Action when an item is dragged
         * @param {Event} e Drag event
         */
        function onDragStart (e) {
            const index = [].indexOf.call(e.target.parentElement.children, e.target);
            e.dataTransfer.setData('text/plain', index)
        }

        /**
         * Action on drag enter
         * @param {Event} e Drag event
         */
        function onDragEnter (e) {
            cancelDefault(e);
        }

        /**
         * Action when an item is dragged over another
         * @param {Event} e Drag event
         */
        function onDragOver (e) {
            // Change the target element's style to signify a drag over event
            // has occurred
            e.currentTarget.style.background = "lightblue";

            cancelDefault(e);
        }

        /**
         * Action when an item is dragged out of another
         * @param {Event} e Drag event
         */
        function onDragLeave (e) {
            // Change the target element's style back to default
            e.currentTarget.style.background = "";
            cancelDefault(e);
        }

        /**
         * Wait for a delay
         * @param {number} delay Delay in milliseconds
         * @returns {Promise} Promise that resolves after the delay
         */
        function waitForIt(delay) {
            return new Promise((resolve) => setTimeout(resolve, delay))
        }

        /**
         * Action when an item is dropped
         * @param {Event} e Drag event
         */
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
            const newItem = item.parentElement.querySelector(`tr.lizmap-features-table-item[data-feature-id="${movedFeatureId}"]`);

            // Set the new active line number
            this.activeItemLineNumber = parseInt(newItem.dataset.lineId);

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

        /**
         * Action when an item has finished being dragged
         * @param {Event} e Drag event
         */
        async function onDragEnd (e) {
            // Restore style after some time
            await waitForIt(3000);
            e.target.style.border = "";
            // e.target.style.backgroundColor = "";

            cancelDefault(e);
        }

        /**
         * Prevent the default behavior of an event
         * @param {Event} e event
         * @returns {boolean} False
         */
        function cancelDefault (e) {
            e.preventDefault();
            e.stopPropagation();

            return false;
        }


    }


    connectedCallback() {
        // console.log('connectedCallback - top');
        if (this.querySelector("lizmap-field")) {
            const listField = this.querySelectorAll("lizmap-field");

            const verifiedFields = this.verifyFields(listField);

            verifiedFields.forEach((field) => {
                const fieldExpression = field.innerText;
                const fieldDescription = field.dataset.description;
                let fieldAlias = field.dataset.alias;
                if (!fieldAlias) fieldAlias = fieldExpression.replaceAll('"', '');
                // Prevent all fields goes on one tab instead of the other when multiple layers are clicked on
                if (btoa(fieldAlias) in this.additionalFields.fields) {
                    field.remove();
                    return;
                }

                this.additionalFields.fields.push({
                    'alias': btoa(fieldAlias),
                    'expression': fieldExpression,
                    'description': fieldDescription
                });

                field.remove();
            });
        }

        // Template
        this._template = () => html`
            <div class="lizmap-features-table" data-features-count="${this.features.length}"
                title="${lizDict['bob']}">
                <h4>${this.layerTitle}</h4>
                <div class="lizmap-features-table-toolbar">
                    <button class="btn btn-mini previous-popup"
                        title="${lizDict['featuresTable.toolbar.previous']}"
                        @click=${() => {
                        // Click on the previous item
                        const lineNumber = this.activeItemLineNumber - 1;
                        const featureDiv = this.querySelector(`tr.lizmap-features-table-item[data-line-id="${lineNumber}"]`);
                        if (featureDiv) featureDiv.click();
                    }}></button>
                    <button class="btn btn-mini next-popup"
                        title="${lizDict['featuresTable.toolbar.next']}"
                        @click=${() => {
                        // Click on the next item
                        const lineNumber = this.activeItemLineNumber + 1;
                        const featureDiv = this.querySelector(`tr.lizmap-features-table-item[data-line-id="${lineNumber}"]`);
                        if (featureDiv) featureDiv.click();
                    }}></button>
                    <button class="btn btn-mini close-popup"
                        title="${lizDict['featuresTable.toolbar.close']}"
                        @click=${() => {
                        const checkFeatureId = (this.dataset.activeItemFeatureId) ?? "";
                        if (!checkFeatureId) return;
                        this.dataset.activeItemFeatureId = ""
                    }}></button>
                </div>
                <table class="table table-sm table-bordered table-condensed lizmap-features-table-container">
                    ${this.buildLabels()}
                    <tbody>
                        ${this.features.map((feature, idx) =>
                        html`
                        <tr
                            class="lizmap-features-table-item ${this.openPopup ? 'has-action' : ''}"
                            data-layer-id="${this.layerId}"
                            data-feature-id="${feature.properties.feature_id}"
                            data-line-id="${idx+1}"
                            title="${this.openPopup ? lizDict['featuresTable.item.hover'] + '.': ''} ${this.itemsDraggable == 'yes' ? lizDict['featuresTable.item.draggable.hover'] + '.' : ''}"
                            @click=${event => {
                                this.onItemClick(event, feature.properties.feature_id);
                            }}
                        >
                            ${this.buildColumns(feature.properties)}
                        </tr>
                        `
                        )}
                    </tbody>
                </table>
                <div class="lizmap-features-table-item-popup"></div>
            </div>
        `;

        // Load
        this.load();
    }

    /**
     * Build the columns of the table
     * @param {object} properties - Object containing the properties of the feature
     * @returns {TemplateResult} The columns of the table
     */
    buildColumns(properties) {

        let result = html`
                ${this.buildDisplayExpressionColumn(properties)}
            `;

        if (!this.isAdditionalFieldsEmpty()) {
            this.additionalFields.fields.forEach(field => {
                let td = html`
                <td
                  class="lizmap-features-table-item"
                >
                    ${properties[field.alias]}
                </td>
            `;
                result = html`
                ${result}
                ${td}
            `;
            });
        }

        return result;
    }

    /**
     * Initialize tab with the first column "display_expression"
     * @param {object} properties - Object containing the properties of the feature
     * @returns {TemplateResult} The first column of the table
     */
    buildDisplayExpressionColumn(properties) {
        if (this.isGeneralLabelExisting()) {
            return html`
                <td class="lizmap-features-table-item">
                    ${properties.display_expression}
                </td>
            `;
        } else {
            return html``;
        }
    }

    /**
     * Initialize the labels of the table
     * @returns {TemplateResult} The labels of the table
     */
    buildLabels() {
        if (this.isAdditionalFieldsEmpty()) {
            return html``;
        }

        let result;

        this.additionalFields.fields.forEach(field => {
            let th = html`
            <th
              class="border lizmap-features-table-item"
              title="${(field.description) ? field.description : ''}"
            >
              ${atob(field.alias)}
            </th>
            `;
            result = html`
                ${result}
                ${th}
            `;
        });

        if (this.isGeneralLabelExisting()) {
            // First th to create an empty column for "display_expression"
            return html`
                <thead>
                    <tr class="border-0">
                        <th class="border-0 lizmap-features-table-item-empty"></th>
                        ${result}
                    </tr>
                </thead>
            `;
        } else {
            return html`
                <thead>
                    <tr>
                        ${result}
                    </tr>
                </thead>
            `;
        }


    }

    /**
     * Check if the additionalFields property is empty
     * @returns {boolean} True if the additionalFields property is empty
     */
    isAdditionalFieldsEmpty() {
        return this.additionalFields.fields.length === 0;
    }

    /**
     * Check if the general label "display_expression" is existing
     * @returns {boolean} True if the general label "display_expression" is existing
     */
    isGeneralLabelExisting() {
        return this.features[0].properties.hasOwnProperty('display_expression');
    }

    /**
     * Verify if there's no fields with the same alias or expression
     * @param {Array.<object>} listField - List of fields
     * @returns {Array.<object>} - List of verified fields
     */
    verifyFields(listField) {
        let verifiedFields = [listField[0]];

        for (let i = 1; i < listField.length; i++) {
            const fieldAlias = listField[i].dataset.alias;
            const fieldExpression = listField[i].innerText;
            let isValid = true;

            verifiedFields.forEach(field => {
                if (field.innerText === fieldExpression) {
                    listField[i].remove();
                    isValid = false;
                } else if (field.dataset.alias === fieldAlias && field.dataset.alias !== "") {
                    // Remove the field if the alias is already used but not when they are both empty because fields will be automatically different
                    listField[i].remove();
                    isValid = false;
                }
            })

            if (isValid) {
                verifiedFields.push(listField[i]);
            }
        }

        return verifiedFields;
    }

    static get observedAttributes() { return ['updated','expressionfilter', 'data-active-item-feature-id']; }

    attributeChangedCallback(name, oldValue, newValue) {
        // Listen to the change of the updated attribute
        // This will trigger the load (refresh the content)
        // Be aware that the name returned here is always lowercase
        if (name === 'updated') {
            // console.log('Reload features table');
            this.load();
        }

        // Also reload when the expressionFilter has changed
        if (name === 'expressionfilter') {
            // Prevent features table to load two time at its creation
            if (oldValue && newValue && oldValue != newValue) {
                // console.log('Reload the table with the new expressionFilter');
                this.expressionFilter = newValue;
                this.load();
            }
        }

        // Check for the data-active-item-feature-id
        if (name === 'data-active-item-feature-id') {
            if (oldValue != newValue) {
                // console.log(`Attribute data-active-item-feature-id changed, OLD = ${oldValue}, NEW = ${newValue}`);
                this.toggleFeatureDetail();
            }
        }
    }
    disconnectedCallback() {

    }
}
