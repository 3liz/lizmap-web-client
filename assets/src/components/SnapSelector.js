import { mainEventDispatcher } from '../modules/Globals.js';
import { html, render, TemplateResult, RootPart } from 'lit-html';
import { createEnum } from '../modules/utils/Enums.js';

/**
 * Enum for snap type
 * @enum {string}
 * @property {string} NO_SNAP       - no snap selected
 * @property {string} VERTEX        - snap to vertex and lines
 * @property {string} INTERSECTION  - snap to intersection
 */
const FeatureSnapType = createEnum({
    'NO_SNAP':'nosnap',
    'VERTEX':'vertex',
    'INTERSECTION':'intersection'
})

/**
 * @class
 * @name SnapSelector
 * @augments HTMLElement
 */
export default class SnapSelector extends HTMLElement {
    /**
     * Text displayed as a tooltip on the main button when the cursor hovers over it
     * @type {string}
     */
    _componentTitle;

    /**
     * Type of snap selected
     * @type {FeatureSnapType}
     */
    _snapSelected;

    /**
     * Whether the snap is active or not
     * @type {boolean}
     */
    _snapActive;

    constructor(){
        super();
        this._componentTitle = 'Activate snap';
        this._snapSelected = FeatureSnapType.NO_SNAP;
        this._snapActive = false;

        this._mainTemplate = () =>{
            return html`
                <div class="snap-selector btn-group dropend" data-bs-toggle="tooltip" data-bs-title=${this._componentTitle}>
                    <button
                        type="button"
                        class="snap-selector-selected-snap btn ${!this.snapActive ? '' : 'active btn-primary'}"
                        value="${this.snapSelected}"
                        @click=${(event) => {this.toggleSnapSelected(event)}}>
                        ${this.getSelectedSnapIcon()}
                    </button>
                    <button type="button"
                        class="btn dropdown-toggle
                        dropdown-toggle-split"
                        data-bs-toggle="dropdown"
                        aria-expanded="false">
                    </button>
                    <ul class="dropdown-menu">
                        <li data-bs-toggle="tooltip"
                            @click=${(e)=>this._selectSnap(e.currentTarget.dataset.value)}
                            class="snap-selector-vertex btn ${this.snapSelected === FeatureSnapType.VERTEX ? 'active btn-primary' :''}"
                            data-value="${FeatureSnapType.VERTEX}" data-bs-title="${lizDict['snapping.selector.vertex.label']}">
                            ${this.vertexSvg}
                        </li>
                        <li data-bs-toggle="tooltip"
                            @click=${(e)=>this._selectSnap(e.currentTarget.dataset.value)}
                            class="snap-selector-intersection btn ${this.snapSelected === FeatureSnapType.INTERSECTION ? 'active btn-primary' :''}"
                            data-value="${FeatureSnapType.INTERSECTION}" data-bs-title="${lizDict['snapping.selector.intersections.label']}">
                            ${this.intersectionSvg}
                        </li>
                    </ul>
                </div>
            `
        }
    }

    /**
     * Return the svg icon based on the selected snap
     * @returns {TemplateResult} - the svg icon
     */
    getSelectedSnapIcon(){
        if (this.snapSelected == FeatureSnapType.VERTEX) {
            return this.vertexSvg;
        } else if (this.snapSelected == FeatureSnapType.INTERSECTION) {
            return this.intersectionSvg;
        }
        return this.noSnapSvg;
    }

    /**
     * Snap active
     * @type {boolean}
     */
    get snapActive(){
        return this._snapActive;
    }

    /**
     * Return the default no-snap svg icon
     * @type {TemplateResult}
     */
    get noSnapSvg(){
        return html`
            <svg>
                <use href="${lizUrls.svgSprite}#magnet"/>
            </svg>
        `
    }

    /**
     * Returns the icon to display when the snap on vertex is active
     * @type {TemplateResult}
     */
    get vertexSvg(){
        return html`
            <svg>
                <use href="${lizUrls.svgSprite}#magnet-vertex"/>
            </svg>
        `
    }

    /**
     * Returns the icon to display when the snap on intersections is active
     * @type {TemplateResult}
     */
    get intersectionSvg(){
        return html`
            <svg>
                <use href="${lizUrls.svgSprite}#magnet-intersection"/>
            </svg>
        `
    }

    /**
     * The current snap type
     * @type {FeatureSnapType}
     */
    get snapSelected(){
        return this._snapSelected;
    }

    /**
     * Setting the current snap type
     * @param {FeatureSnapType} snap - the snap type selected
     */
    set snapSelected(snap){
        this._snapSelected = snap
    }

    /**
     * Activate/deactivate snap
     * @fires lizmapSnapSelectorUpdate
     * @param {boolean} val - snap is active or not
     */
    set snapActive(val){
        this._snapActive = val;
        this.emitUpdateEvent();

        // dispatch event for external js customization purpose
        /**
         * @event lizmapSnapSelectorUpdate
         * @property {string} type                      lizmap-snap-selector-update
         * @property {boolean} active                   whether snap is active or not
         * @property {FeatureSnapType} snapSelected     The type of snap
         */
        mainEventDispatcher.dispatch({
            type: "lizmap-snap-selector-update",
            active: this._snapActive,
            snapSelected: this._snapSelected
        })

        this.renderTemplate();
    }

    /**
     * Activate/deactivate snap
     * @fires SnapSelector#domSnapSelectorUpdate
     * @returns {void}
     */
    emitUpdateEvent(){
        /**
         * @event domSnapSelectorUpdate
         * @property {boolean} active                   whether snap is active or not
         * @property {FeatureSnapType} snapSelected     The type of snap
         */
        const ev = new CustomEvent("lizmap-snap-selector-update",{
            bubbles:true,
            composed:true,
            detail:{
                active: this._snapActive,
                snapSelected: this._snapSelected
            }
        });

        this.dispatchEvent(ev);
    }

    /**
     * Updates the selected snap type
     * @param {FeatureSnapType} snap - the snap type
     * @returns {void}
     */
    _selectSnap(snap){
        this.snapSelected = snap;
        const btn = this.querySelector('.snap-selector-selected-snap');
        // Close dropdown if opened
        if (btn.getAttribute('aria-expanded') === 'true') {
            bootstrap.Dropdown.getOrCreateInstance(btn).toggle();
        }

        this.snapActive = true;
    }

    /**
     * Listener for the snap activation/deactivation
     * @param {Event} event - click event on main snap button
     * @returns {void}
     */
    toggleSnapSelected(event){
        if (this.snapSelected === FeatureSnapType.NO_SNAP) {
            // Open dropdown to select a tool if no tool is selected
            bootstrap.Dropdown.getOrCreateInstance(event.currentTarget).toggle();
            return;
        } else if (this.snapSelected !== FeatureSnapType.NO_SNAP) {
            this.snapActive = !this._snapActive
        }
        event.stopPropagation();
    }

    connectedCallback() {
        // Keep the default title if the attribute is missing or empty,
        // e.g. when the translation is not available: Bootstrap throws
        // an error for a tooltip without title.
        this._componentTitle = this.getAttribute('component-title') || this._componentTitle;
        this.renderTemplate();
        const tooltipTriggerList = this.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => {
            return new bootstrap.Tooltip(tooltipTriggerEl, {
                trigger: 'hover'
            })
        });
    }

    disconnectedCallback(){
        this.snapActive = false;
        // dispatch event for external js customization purpose
        /**
         * @event lizmapSnapSelectorUpdate
         * @property {string} type                      lizmap-snap-selector-update
         * @property {boolean} active                   whether snap is active or not
         * @property {FeatureSnapType} snapSelected     The type of snap
         */
        mainEventDispatcher.dispatch({
            type: "lizmap-snap-selector-update",
            active: false,
            snapSelected: 'no-snap'
        })
    }

    /**
     * Renders the main template
     * @returns {RootPart} - the component template
     */
    renderTemplate(){
        return render(this._mainTemplate(),this);
    }
}
