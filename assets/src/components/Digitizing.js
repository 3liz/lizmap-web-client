import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';
import '../images/svg/mActionSelectPoint.svg';
import '../images/svg/mActionSelectLine.svg';

export default class Digitizing extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        const mainTemplate = () => html`
        <div class="digitizing">
            <div class="digitizing-buttons btn-group">
                <button type="button" class="digitizing-toggle-visibility btn btn-mini" @click=${() => mainLizmap.digitizing.toggleFeatureDrawnVisibility()}  data-original-title="${lizDict['tree.button.checkbox']}">
                    <i class="icon-eye-${mainLizmap.digitizing._featureDrawnVisibility ? 'open' : 'close'}"></i>
                </button>
                <button type="button" class="digitizing-point btn btn-small ${mainLizmap.digitizing.toolSelected === 'point' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'point'} data-original-title="${lizDict['digitizing.toolbar.query.point']}">
                    <svg>
                        <use xlink:href="#mActionSelectPoint"></use>
                    </svg>
                </button>
                <button type="button" class="digitizing-line btn btn-small ${mainLizmap.digitizing.toolSelected === 'line' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'line'} data-original-title="${lizDict['digitizing.toolbar.query.line']}">
                    <svg>
                        <use xlink:href="#mActionSelectLine"></use>
                    </svg>
                </button>
                <button type="button" class="digitizing-polygon btn btn-small ${mainLizmap.digitizing.toolSelected === 'polygon' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'polygon'} data-original-title="${lizDict['digitizing.toolbar.query.polygon']}">
                    <i class="icon-none qgis_sprite mActionSelectPolygon"></i>
                </button>
                <br>
                <button type="button" class="digitizing-box btn btn-small ${mainLizmap.digitizing.toolSelected === 'box' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'box'} data-original-title="${lizDict['digitizing.toolbar.query.box']}">
                    <i class="icon-none qgis_sprite mActionSelectRectangle"></i>
                </button>
                <button type="button" class="digitizing-circle btn btn-small ${mainLizmap.digitizing.toolSelected === 'circle' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'circle'} data-original-title="${lizDict['digitizing.toolbar.query.circle']}">
                    <i class="icon-none qgis_sprite mActionSelectRadius"></i>
                </button>
                <button type="button" class="digitizing-freehand btn btn-small ${mainLizmap.digitizing.toolSelected === 'freehand' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'freehand'} data-original-title="${lizDict['digitizing.toolbar.query.freehand']}">
                    <i class="icon-none qgis_sprite mActionSelectFreehand"></i>
                </button>
            </div>
            <div>
                ${lizDict['digitizing.toolbar.buffer']}&nbsp;:&nbsp;
                <div class="input-append">
                    <input class="input-mini" type="number" min="0" value="0" @change=${ (event) => mainLizmap.digitizing._bufferValue = parseInt(event.target.value)}><span class="add-on">m</span>
                </div>
            </div>
        </div>`;

        render(mainTemplate(), this);

        // Add tooltip on buttons
        // TODO allow tooltip on disabled buttons : https://stackoverflow.com/a/19938049/2000654
        $('.digitizing button', this).tooltip({
            placement: 'top'
        });

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            ['digitizing.toolSelected']
        );
    }

    disconnectedCallback() {
    }
}
