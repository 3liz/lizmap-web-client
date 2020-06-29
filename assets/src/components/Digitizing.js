import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';
import '../images/svg/mActionSelectPoint.svg';
import '../images/svg/mActionSelectLine.svg';
import '../images/svg/eraser.svg';
import '../images/svg/pencil.svg';

export default class Digitizing extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        const mainTemplate = () => html`
        <div class="digitizing">
            <button type="button" class="digitizing-toggle-visibility btn" @click=${() => mainLizmap.digitizing.toggleFeatureDrawnVisibility()}  data-original-title="${lizDict['tree.button.checkbox']}">
                <i class="icon-eye-${mainLizmap.digitizing._featureDrawnVisibility ? 'open' : 'close'}"></i>
            </button>
            <input type="color" class="digitizing-color btn" value="${mainLizmap.digitizing.drawColor}" @input=${(event) => mainLizmap.digitizing.drawColor = event.target.value}>
            <div class="digitizing-buttons btn-group">
                <a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
                    <svg>
                        <use xlink:href="#pencil"></use>
                    </svg>
                    <span class="caret"></span>
                </a>
                <ul class="dropdown-menu pull-right">
                    <li class="digitizing-point btn ${mainLizmap.digitizing.toolSelected === 'point' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'point'} data-original-title="${lizDict['digitizing.toolbar.query.point']}">
                        <svg>
                            <use xlink:href="#mActionSelectPoint"></use>
                        </svg>
                    </li>
                    <li class="digitizing-line btn ${mainLizmap.digitizing.toolSelected === 'line' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'line'} data-original-title="${lizDict['digitizing.toolbar.query.line']}">
                        <svg>
                            <use xlink:href="#mActionSelectLine"></use>
                        </svg>
                    </li>
                    <li class="digitizing-polygon btn ${mainLizmap.digitizing.toolSelected === 'polygon' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'polygon'} data-original-title="${lizDict['digitizing.toolbar.query.polygon']}">
                        <i class="icon-none qgis_sprite mActionSelectPolygon"></i>
                    </li>
                    <br>
                    <li class="digitizing-box btn ${mainLizmap.digitizing.toolSelected === 'box' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'box'} data-original-title="${lizDict['digitizing.toolbar.query.box']}">
                        <i class="icon-none qgis_sprite mActionSelectRectangle"></i>
                    </li>
                    <li class="digitizing-circle btn ${mainLizmap.digitizing.toolSelected === 'circle' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'circle'} data-original-title="${lizDict['digitizing.toolbar.query.circle']}">
                        <i class="icon-none qgis_sprite mActionSelectRadius"></i>
                    </li>
                    <li class="digitizing-freehand btn ${mainLizmap.digitizing.toolSelected === 'freehand' ? 'active' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'freehand'} data-original-title="${lizDict['digitizing.toolbar.query.freehand']}">
                        <i class="icon-none qgis_sprite mActionSelectFreehand"></i>
                    </li>
                </ul>
            </div>
            <button type="button" class="digitizing-erase btn" @click=${() => mainLizmap.digitizing.erase()}>
                <svg>
                    <use xlink:href="#eraser"/>
                </svg>
            </button>
            <div class="digitizing-buffer">
                <label><span>${lizDict['digitizing.toolbar.buffer']}</span>
                    <div class="input-append">
                        <input class="input-mini" type="number" min="0" .value="${mainLizmap.digitizing.bufferValue}" @input=${ (event) => mainLizmap.digitizing.bufferValue = parseInt(event.target.value)}><span class="add-on">m</span>
                    </div>
                </label>
            </div>
        </div>`;

        render(mainTemplate(), this);

        // Add tooltip on buttons
        $('.digitizing .btn', this).tooltip({
            placement: 'top'
        });

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            ['digitizing.featureDrawnVisibility', 'digitizing.toolSelected', 'digitizing.bufferValue']
        );
    }

    disconnectedCallback() {
    }
}
