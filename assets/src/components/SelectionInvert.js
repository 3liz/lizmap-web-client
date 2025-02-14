/**
 * @module components/SelectionInvert.js
 * @name SelectionInvert
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */
import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import {html, render} from 'lit-html';

import '../images/svg/mActionInvertSelection.svg';

/**
 * Web component used to invert selection on layer selection defined by 'feature-type' attribute
 * or allFeatureTypeSelected defined in SelectionTool module
 * @class
 * @name SelectionInvert
 * @augments HTMLElement
 */
export default class SelectionInvert extends HTMLElement {
    /**
     * The HTML element constructor
     * @class
     * @private
     */
    constructor() {
        super();
        this._featureType = null;
        this._layerName = null;
        this._isDisabled = false;
        this._isHidden = false;
        this._updateProperties();
    }

    /**
     * Update the element state : hidden and disabled
     * @private
     */
    _updateState() {
        if (this.hasAttribute('feature-type')) {
            this._isDisabled = true;
            this._isHidden = true;
            // check if layer has selected features
            if (this._layerName in mainLizmap.config.layers) {
                const layerConfig = mainLizmap.config.layers[this._layerName];
                // update template parameters if layer has selected features
                if (layerConfig && 'selectedFeatures' in layerConfig) {
                    const selectedFeatures = layerConfig['selectedFeatures'];
                    if (selectedFeatures && selectedFeatures.length) {
                        this._isDisabled = false;
                        this._isHidden = false;
                    }
                }
            }
        } else {
            // update template parameters if selection tool has selected features
            this._isDisabled =
                mainLizmap.selectionTool.selectedFeaturesCount === 0 ||
                mainLizmap.selectionTool.allFeatureTypeSelected.length > 1;
            this._isHidden = false;
        }
    }

    /**
     * Update the element properties : feature type and layer name
     * Then update the element state.
     * @private
     */
    _updateProperties() {
        this._title =  lizDict['selectiontool.toolbar.action.invert'];
        this._featureType = null;
        this._layerName = null;
        if (this.hasAttribute('feature-type')) {
            this._featureType = this.getAttribute('feature-type');
            this._layerName = mainLizmap.getLayerNameByCleanName(this._featureType);
        }
        this._updateState();
    }

    /**
     * Invoked when a component is added to the document's DOM.
     */
    connectedCallback() {

        const mainTemplate = (hiddenClass, isDisabled, title, clickHandler) => html`
        <button
            type="button"
            class="selectiontool-invert btn btn-sm ${hiddenClass}"
            data-bs-toggle="tooltip"
            data-bs-title="${title}"
            ?disabled=${isDisabled}
            @click=${clickHandler}
            >
            <svg class="icon-">
                <use xlink:href="#mActionInvertSelection"></use>
            </svg>
        </button>`;

        // render the template with the parameters
        render(
            mainTemplate(
                this.hidden ? 'hide' : '',
                this.disabled,
                this.title,
                this.click
            ),
            this
        );

        // Add tooltip on buttons
        // TODO allow tooltip on disabled buttons : https://stackoverflow.com/a/19938049/2000654
        $('button', this).tooltip({
            placement: this.hasAttribute('tooltip-placement') ? this.getAttribute('tooltip-placement') : 'top'
        });

        mainEventDispatcher.addListener(
            () => {
                // update state due to selection change
                this._updateState();

                // render the template with the parameters
                render(
                    mainTemplate(
                        this.hidden ? 'hide' : '',
                        this.disabled,
                        this.title,
                        this.click
                    ),
                    this
                );
            },
            ['selectionTool.allFeatureTypeSelected', 'selection.changed']
        );
    }

    /**
     * Invoked when a component is removed from the document's DOM.
     */
    disconnectedCallback() {
    }

    /**
     * Invoked when one of the element’s observedAttributes changes.
     * @param {string} name - The name of the attribute that changed.
     * @param {string} oldValue - The old value of the attribute.
     * @param {string} newValue - The new value of the attribute.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }
        // Listen to the change of the updated attribute
        if (name === 'feature-type') {
            this._updateProperties();
        }
    }

    /**
     * An array containing the names of all attributes for which the
     * element needs change notifications.
     * @type {string[]}
     */
    static get observedAttributes() { return ['feature-type']; }

    /**
     * The title of the button.
     * @type {string}
     */
    get title() {
        return this._title;
    }

    /**
     * The layer name associated to the feature-type attribute.
     * @type {null|string}
     */
    get layerName() {
        return this._layerName;
    }

    /**
     * The disabled state of the button.
     * @type {boolean}
     */
    get disabled() {
        return this._isDisabled;
    }

    /**
     * The hidden state of the button.
     * @type {boolean}
     */
    get hidden() {
        return this._isHidden;
    }

    /**
     * Click action
     * @returns {void}
     */
    click() {
        // Invert selection if not disabled
        if (this.disabled) {
            return;
        }
        // If no feature-type attribute, use the first feature type selected
        // to invert selection
        let layerName = this.layerName;
        if (!layerName &&
            mainLizmap.selectionTool.allFeatureTypeSelected.length > 1) {
            layerName = mainLizmap.selectionTool.allFeatureTypeSelected[0];
        }
        // Invert selection if layer name is defined
        if (layerName) {
            mainLizmap.selectionTool.invert(layerName);
        }
    }
}
