import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import {html, render} from 'lit-html';

import '../images/svg/mActionInvertSelection.svg';

/**
 * Webcomponent used to invert selection on layer selection defined by 'feature-type' attribute
 * or allFeatureTypeSelected defined in SelectionTool module
 * @extends HTMLElement
 */
export default class SelectionInvert extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        const mainTemplate = () => html`
        <button type="button" class="selectiontool-invert btn btn-mini ${this.getAttribute('feature-type') && mainLizmap.config.layers[mainLizmap.getLayerNameByCleanName(this.getAttribute('feature-type'))]['selectedFeatures'].length === 0 ? 'hide' : ''}" ?disabled=${this.getAttribute('feature-type') ? mainLizmap.config.layers[mainLizmap.getLayerNameByCleanName(this.getAttribute('feature-type'))]['selectedFeatures'].length === 0 : (mainLizmap.selectionTool.selectedFeaturesCount === 0 || mainLizmap.selectionTool.allFeatureTypeSelected.length > 1)} @click=${() => mainLizmap.selectionTool.invert(mainLizmap.getLayerNameByCleanName(this.getAttribute('feature-type')))}  data-original-title="${lizDict['selectiontool.toolbar.action.invert']}">
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
                render(mainTemplate(), this);
            },
            ['selectionTool.allFeatureTypeSelected', 'selection.changed']
        );
    }

    disconnectedCallback() {
    }
}
