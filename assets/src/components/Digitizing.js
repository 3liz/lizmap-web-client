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
            <div class="selectiontool-query-buttons btn-group">
                <button type="button" class="selectiontool-query-deactivate btn btn-small ${mainLizmap.digitizing.toolSelected === 'deactivate' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'deactivate'} data-original-title="${lizDict['selectiontool.toolbar.query.deactivate']}">
                    <i class="icon-none qgis_sprite mIconDeselected"></i>
                </button>
                <button type="button" class="selectiontool-query-point btn btn-small ${mainLizmap.digitizing.toolSelected === 'point' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'point'} data-original-title="${lizDict['selectiontool.toolbar.query.point']}">
                    <svg>
                        <use xlink:href="#mActionSelectPoint"></use>
                    </svg>
                </button>
                <button type="button" class="selectiontool-query-line btn btn-small ${mainLizmap.digitizing.toolSelected === 'line' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'line'} data-original-title="${lizDict['selectiontool.toolbar.query.line']}">
                    <svg>
                        <use xlink:href="#mActionSelectLine"></use>
                    </svg>
                </button>
                <button type="button" class="selectiontool-query-polygon btn btn-small ${mainLizmap.digitizing.toolSelected === 'polygon' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'polygon'} data-original-title="${lizDict['selectiontool.toolbar.query.polygon']}">
                    <i class="icon-none qgis_sprite mActionSelectPolygon"></i>
                </button>
                <br>
                <button type="button" class="selectiontool-query-box btn btn-small ${mainLizmap.digitizing.toolSelected === 'box' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'box'} data-original-title="${lizDict['selectiontool.toolbar.query.box']}">
                    <i class="icon-none qgis_sprite mActionSelectRectangle"></i>
                </button>
                <button type="button" class="selectiontool-query-circle btn btn-small ${mainLizmap.digitizing.toolSelected === 'circle' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'circle'} data-original-title="${lizDict['selectiontool.toolbar.query.circle']}">
                    <i class="icon-none qgis_sprite mActionSelectRadius"></i>
                </button>
                <button type="button" class="selectiontool-query-freehand btn btn-small ${mainLizmap.digitizing.toolSelected === 'freehand' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'freehand'} data-original-title="${lizDict['selectiontool.toolbar.query.freehand']}">
                    <i class="icon-none qgis_sprite mActionSelectFreehand"></i>
                </button>
            </div>
            <div>
                ${lizDict['selectiontool.toolbar.buffer']}&nbsp;:&nbsp;
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
