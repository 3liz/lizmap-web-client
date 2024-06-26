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
 * @augments HTMLElement
 */
export default class FeaturesTable extends HTMLElement {

    constructor() {
        super();

        // Layer name
        this.layerTitle = this.getAttribute('layerTitle');

        // Layer id
        this.layerId = this.getAttribute('layerId');

        // Get the layer name & configuration
        const layerName = lizMap.getLayerConfigById(this.layerId)?.[0];
        let layerConfig = lizMap.getLayerConfigById(this.layerId)?.[1];
        this.layerConfig = layerConfig;

        // Primary key field
        this.uniqueField = this.getAttribute('uniqueField');

        // Expression filter
        this.expressionFilter = this.getAttribute('expressionFilter');

        // Get the geometry or NetworkError
        this.withGeometry = (this.getAttribute('withGeometry') !== null) ? this.getAttribute('withGeometry') : 0;

        // Sorting attribute and direction
        this.sortingField = this.getAttribute('sortingField');
        const sortingOrder = this.getAttribute('sortingOrder');
        this.sortingOrder = (sortingOrder !== null && ['asc', 'desc'].includes(sortingOrder)) ? this.sortingField : 'asc';

        // open popup ?
        this.openPopup = (layerConfig && layerConfig.popup.toLowerCase() === 'true');

        // Features
        this.features = [];
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
            .then(data => {
                // Set component data property
                this.features = data;

                // Sort data if needed
                if (data.length > 1) {
                    this.sortFeatures();
                }

                // Render
                this.render();
            })
            .catch(err => {
                // Display an error message
                mainLizmap.featuresTable.addMessage(
                    err.message,
                    'error',
                    10000
                );
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
        this.innerHTML = '';
        if (this.layerConfig) {
            // Render with lit-html
            render(this._template(), this);

            // If there is not features, add empty content in the container
            if (this.features.length === 0) {
                this.querySelector('div.lizmap-features-table-container').innerHTML = '&nbsp;';
            }

            // Trigger rendered event
            mainEventDispatcher.dispatch({
                type: 'features.table.rendered',
                element: this
            });
        } else {
            console.warn(`The given layer ID ${this.layerId} does not exist.`);
        }
    }

    /**
     * Display a popup when a feature item is clicked
     *
     * @param {Event} event Click event on a feature item
     * @param {Object} feature WFS feature
     */
    onItemClick(event, feature) {
        if (!this.openPopup) {return true;}
        const itemWasActive = event.target.classList.contains('popup-displayed');
        if (!itemWasActive) {
            // Get popup data and display it
            mainLizmap.featuresTable.openPopup(
                event.target.dataset.layerId,
                feature,
                this.uniqueField,
                event.target.parentElement.parentElement.querySelector('div.lizmap-features-table-item-popup'),
                function(aLayerId, aFeature, aTarget) {
                    // Show popup and hide other children
                    const featuresTableContainer = aTarget.parentElement.querySelector('div.lizmap-features-table-container');
                    if (featuresTableContainer) {
                        // Add class to the parent
                        featuresTableContainer.classList.add('popup-displayed');
                        var items = featuresTableContainer.querySelectorAll('div.lizmap-features-table-item.popup-displayed');
                        Array.from(items).forEach(item => {
                            item.classList.remove('popup-displayed');
                        });
                        // Add class to the active item
                        const childSelector = `div.lizmap-features-table-item[data-feature-id="${feature.properties.feature_id}"]`;
                        const activeItem = featuresTableContainer.querySelector(childSelector);
                        if (activeItem) activeItem.classList.add('popup-displayed');
                    }
                }
            );
        } else {
            event.target.classList.remove('popup-displayed');
            event.target.parentElement.classList.remove('popup-displayed');
        }
    }

    connectedCallback() {
        // Template
        this._template = () => html`
            <div class="lizmap-features-table">
                <h4>${this.layerTitle}</h4>
                <div class="lizmap-features-table-container">
                ${this.features.map((feature, idx) =>
                    html`
                    <div
                        class="lizmap-features-table-item ${this.openPopup ? 'has-action' : ''}"
                        data-layer-id="${this.layerId}"
                        data-feature-id="${feature.properties.feature_id}"
                        data-line-id="${idx+1}"
                        @click=${event => {
                            this.onItemClick(event, feature);
                        }}
                    >${feature.properties.display_expression}
                        <div class="lizmap-features-table-toolbar">
                            <button class="btn btn-mini previous-popup ${(idx == 0) ? 'first' : ''}" @click=${event => {
                                const tableContainer = event.target.closest('div.lizmap-features-table-container');
                                tableContainer.querySelector('div.popup-displayed').classList.remove('popup-displayed');
                                const previousLineId = idx;
                                const featureDiv = tableContainer.querySelector(`div.lizmap-features-table-item[data-line-id="${previousLineId}"]`);
                                if (featureDiv) featureDiv.click();
                            }}></button>
                            <button class="btn btn-mini next-popup ${(idx+1 == this.features.length) ? 'last' : ''}" @click=${event => {
                                const tableContainer = event.target.closest('div.lizmap-features-table-container');
                                tableContainer.querySelector('div.popup-displayed').classList.remove('popup-displayed');
                                const nextLineId = idx+2;
                                const featureDiv = tableContainer.querySelector(`div.lizmap-features-table-item[data-line-id="${nextLineId}"]`);
                                if (featureDiv) featureDiv.click();
                            }}></button>
                            <button class="btn btn-mini close-popup" @click=${event => {
                                const tableContainer = event.target.closest('div.lizmap-features-table-container');
                                tableContainer.classList.remove('popup-displayed');
                                tableContainer.querySelector('div.popup-displayed').classList.remove('popup-displayed');
                            }}></button>
                        </div>
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

    disconnectedCallback() {

    }
}
