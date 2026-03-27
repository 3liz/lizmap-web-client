/**
 * @module components/GroupPopupByLayer.js
 * @name GroupPopupByLayer
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */

import { html, render } from 'lit-html';
import { mainLizmap } from '../modules/Globals.js';
import { Utils } from '../modules/Utils.js';

export default class GroupPopupByLayer extends HTMLElement {
    constructor(){
        super();
        // add support for slot elements
        this.attachShadow({ mode: "open" });

        this._slottedElement = null;
        this._currentFeature = null;
        this._currentLayer = null;
        this._currentPopupsElements = null;

        // injects global stylesheets
        Utils.addGlobalStylesToShadowRoot(this.shadowRoot);

        this._template = () => html`
            <div class="lizmap-gpl-container" style="display:none;">
                ${!this._currentFeature ? html`
                    <h4>${lizDict['groupPopupByLayer.title']}</h4>
                    <table class="table table-sm table-condensed lizmap-gpl-table">
                        <tbody>
                        ${Object.keys(this._currentPopupsElements).map((k) => html`
                            <tr layer-id="${this._currentPopupsElements[k].layerId}" @click=${(e) =>
                                {
                                    this.currentLayer = e.currentTarget.getAttribute('layer-id');
                                    return this._displayLayerFeature();
                                }
                            }>
                                <td>${this._currentPopupsElements[k].title}</td>
                                <td>(${this._currentPopupsElements[k].features.length})</td>
                            </tr>

                        `)}
                        </tbody>
                    </table>
                ` : html`
                    <div class="lizmap-gpl-nav">
                        <button class="btn btn-sm gpl-back" @click=${()=> this.currentFeature = null}>${lizDict['groupPopupByLayer.nav.back']}</button>
                        ${this.totalCurrentLayerFeatures > 1 ? html`
                            <div class="gpl-counter">
                                ${this.selectedFeatureIndex + 1}/${this.totalCurrentLayerFeatures}
                            </div>
                            <div class="gpl-nav-buttons">
                                <button
                                    class="btn btn-mini gpl-prev-popup"
                                    title="${lizDict['groupPopupByLayer.nav.prev']}"
                                    @click=${
                                        ()=> {
                                            const prev = this.selectedFeatureIndex - 1;
                                            this.currentLayerState.selectedFeature = prev < 0 ?
                                                this.currentLayerState.features[0] :
                                                this.currentLayerState.features[prev];
                                            return this._displayLayerFeature();
                                        }
                                    }></button>
                                <button
                                    class="btn btn-mini gpl-next-popup"
                                    title="${lizDict['groupPopupByLayer.nav.next']}"
                                    @click=${
                                        ()=> {
                                            const next = this.selectedFeatureIndex + 1;
                                            this.currentLayerState.selectedFeature = next > this.totalCurrentLayerFeatures -1 ?
                                                this.currentLayerState.features[this.totalCurrentLayerFeatures - 1] :
                                                this.currentLayerState.features[next];
                                            return this._displayLayerFeature();
                                        }
                                    }></button>
                            </div>
                        ` : ''}
                    </div>
                `}
            </div>
            <slot name="popup"></slot>
        `
    }

    connectedCallback(){
        // clone the main state
        this._currentPopupsElements = {...mainLizmap.groupPopupByLayers.currentPopupsPerLayer};

        this._render(true);
        const slot = this.shadowRoot.querySelector( 'slot' );
        if(slot.assignedElements() && slot.assignedElements().length == 1) {
            this._slottedElement = slot.assignedElements()[0];
        }

        if(!this._slottedElement) throw new Error('No content to display');

        // If there is only one feature to display among all the queried layers,
        // it is simply displayed and the main component is left hidden to emulate standard behavior.
        if (this.features.length == 1){
            this.features[0].style.display = 'initial';
            return;
        } else {
            // else show the component table element
            this.shadowRoot.querySelector('.lizmap-gpl-container').style.display = 'block';
        }
    }

    disconnectedCallback(){ }

    /**
     * Returns the current layer state
     * @type {object}
     */
    get currentLayerState(){
        return this._currentPopupsElements[this._currentLayer];
    }

    /**
     * Return the total number of features for the current layer
     * @type {number}
     */
    get totalCurrentLayerFeatures(){
        return this.currentLayerState.features.length;
    }

    /**
     * Returns the index of the current selected feature
     * @type {number}
     */
    get selectedFeatureIndex(){
        return this.currentLayerState.features.indexOf(this.currentLayerState.selectedFeature);
    }

    /**
     * Returns a list of all the html features popups
     * @type {NodeList}
     */
    get features(){
        return this._slottedElement.querySelectorAll(`:scope > .${mainLizmap.groupPopupByLayers.singleFeatureClass}`);
    }

    /**
     * Setting the current feature layer
     * @param {string} layerId - the layer id
     */
    set currentLayer(layerId){
        this._currentLayer = layerId;
    }

    /**
     * Setting the current feature popup
     * @param {null|HTMLElement} htmlFeat - the current feature or null
     */
    set currentFeature(htmlFeat){
        this._currentFeature = htmlFeat;
        if(!this._currentFeature) {
            this._currentLayer = null;
            this._hideFeatures();
        }
        this._render();
    }

    /**
     * Renders the main template and performs side operations on user interface
     * @param {boolean} firstRender - true if is called from the connectedCallback method
     * @returns {void}
     */
    _render(firstRender = false){
        render(this._template(), this.shadowRoot);
        if (!firstRender) {
            this._componentUI();
            this._highlightFeatures();
        }
    }

    /**
     * Display the current select feature popup
     * @returns {void}
     */
    _displayLayerFeature(){
        let featureOnDisplay = null;
        this.features.forEach((f) => {
            if (f.getAttribute('data-layer-id') == this._currentLayer &&
            f.getAttribute('data-feature-id') == this.currentLayerState.selectedFeature) {
                featureOnDisplay = f;
                f.style.display = 'initial';
            } else {
                f.style.display ='none';
            }
        });

        this.currentFeature = featureOnDisplay;
    }

    /**
     * Highlights the current feature geometry on map, if any.
     * If no specific feature is selected, highlights all geometries.
     * @returns {void}
     */
    _highlightFeatures(){
        const geometries = [];
        const selector = ':scope > .lizmapPopupDiv input.lizmap-popup-layer-feature-geometry';
        let features = [];
        if (this._currentFeature){
            features.push(this._currentFeature);
        } else {
            features = Array.from(this.features);
        }
        if(!features.length) return;
        features.forEach((f) => {
            const geomInput = f.querySelector(selector);
            if (geomInput) {
                geometries.push(geomInput.value)
            }
        })

        if(geometries.length) {
            mainLizmap.map.clearHighlightFeatures();
            lizMap.mainLizmap.map.setHighlightFeatures(`GEOMETRYCOLLECTION(${geometries.join()})`, "wkt");
        }
    }

    /**
     * Conditionally adjusts component elements after template rendering
     * @returns {void}
     */
    _componentUI(){
        if (this._currentFeature && this.totalCurrentLayerFeatures > 1) {
            this.shadowRoot.querySelector('button.gpl-prev-popup').disabled = this.selectedFeatureIndex == 0;
            this.shadowRoot.querySelector('button.gpl-next-popup').disabled = this.selectedFeatureIndex == this.totalCurrentLayerFeatures - 1;
        }
    }

    /**
     * Hides all popups
     * @returns {void}
     */
    _hideFeatures(){
        this.features.forEach((f)=> f.style.display = 'none');
    }
}
