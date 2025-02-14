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
    constructor() {
        super();
    }

    connectedCallback() {

        const mainTemplate = (hiddenClass, isDisabled, layerName) => html`
        <button
            type="button"
            class="selectiontool-invert btn btn-mini ${hiddenClass}"
            data-original-title="${lizDict['selectiontool.toolbar.action.invert']}"
            ?disabled=${isDisabled}
            @click=${() => mainLizmap.selectionTool.invert(layerName)}
            >
            <svg class="icon-">
                <use xlink:href="#mActionInvertSelection"></use>
            </svg>
        </button>`;

        render(mainTemplate(), this);

        // Add tooltip on buttons
        // TODO allow tooltip on disabled buttons : https://stackoverflow.com/a/19938049/2000654
        $('button', this).tooltip({
            placement: this.hasAttribute('tooltip-placement') ? this.getAttribute('tooltip-placement') : 'top'
        });

        mainEventDispatcher.addListener(
            () => {
                // default template parameters when feature-type attribute is not set
                let hiddenClass = '';
                let isDisabled =
                    mainLizmap.selectionTool.selectedFeaturesCount === 0 ||
                    mainLizmap.selectionTool.allFeatureTypeSelected.length > 1;
                let layerName = null;

                // update template parameters if feature-type attribute is set
                if (this.hasAttribute('feature-type')) {
                    // default template parameters when feature-type attribute is set
                    hiddenClass = 'hide';
                    isDisabled = true;
                    const featureTypeAttrValue = this.getAttribute('feature-type');
                    // feature-type attribute can be a layer name or a layer clean name
                    layerName = mainLizmap.getLayerNameByCleanName(featureTypeAttrValue);
                    if (layerName) {
                        // update template parameters if layer name is found in config
                        if (layerName in mainLizmap.config.layers) {
                            const layerConfig = mainLizmap.config.layers[layerName];
                            // update template parameters if layer has selected features
                            if (layerConfig && 'selectedFeatures' in layerConfig) {
                                const selectedFeatures = layerConfig['selectedFeatures'];
                                if (selectedFeatures && selectedFeatures.length) {
                                    hiddenClass = '';
                                    isDisabled = false;
                                }
                            }
                        }
                    }
                }
                render(mainTemplate(hiddenClass, isDisabled, layerName), this);
            },
            ['selectionTool.allFeatureTypeSelected', 'selection.changed']
        );
    }

    disconnectedCallback() {
    }
}
