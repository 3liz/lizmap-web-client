import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

import '../images/svg/point.svg';
import '../images/svg/line.svg';
import '../images/svg/polygon.svg';
import '../images/svg/box.svg';
import '../images/svg/circle.svg';
import '../images/svg/freehand.svg';

import '../images/svg/pencil.svg';
import '../images/svg/edit.svg';
import '../images/svg/eraser.svg';

import '../images/svg/file-download.svg';
import '../images/svg/file-upload.svg';

export default class Digitizing extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        const mainTemplate = () => html`
        <div class="digitizing">
            <div class="digitizing-buttons btn-group" data-original-title="${lizDict['digitizing.toolbar.drawTools']}">
                <a class="btn dropdown-toggle ${mainLizmap.digitizing.toolSelected !== 'deactivate' ? 'active btn-primary' : ''}" @click=${(event) => { if(mainLizmap.digitizing.toolSelected !== 'deactivate') {mainLizmap.digitizing.toolSelected = 'deactivate'; event.stopPropagation();}}} data-toggle="dropdown" href="#">
                    <svg>
                        <use xlink:href="#pencil"></use>
                    </svg>
                    <!-- Display selected tool -->
                    <svg class="digitizing-selected-tool ${mainLizmap.digitizing.toolSelected === 'point' ? '' : 'hidden'}">
                        <use xlink:href="#point"></use>
                    </svg>
                    <svg class="digitizing-selected-tool ${mainLizmap.digitizing.toolSelected === 'line' ? '' : 'hidden'}">
                        <use xlink:href="#line"></use>
                    </svg>
                    <svg class="digitizing-selected-tool ${mainLizmap.digitizing.toolSelected === 'polygon' ? '' : 'hidden'}">
                        <use xlink:href="#polygon"></use>
                    </svg>
                    <svg class="digitizing-selected-tool ${mainLizmap.digitizing.toolSelected === 'box' ? '' : 'hidden'}">
                        <use xlink:href="#box"></use>
                    </svg>
                    <svg class="digitizing-selected-tool ${mainLizmap.digitizing.toolSelected === 'circle' ? '' : 'hidden'}">
                        <use xlink:href="#circle"></use>
                    </svg>
                    <svg class="digitizing-selected-tool ${mainLizmap.digitizing.toolSelected === 'freehand' ? '' : 'hidden'}">
                        <use xlink:href="#freehand"></use>
                    </svg>
                </a>
                <a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
                    <span class="caret"></span>
                </a>
                <ul class="dropdown-menu">
                    <li class="digitizing-point btn ${mainLizmap.digitizing.toolSelected === 'point' ? 'active btn-primary' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'point'} data-original-title="${lizDict['digitizing.toolbar.point']}">
                        <svg>
                            <use xlink:href="#point"></use>
                        </svg>
                    </li>
                    <li class="digitizing-line btn ${mainLizmap.digitizing.toolSelected === 'line' ? 'active btn-primary' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'line'} data-original-title="${lizDict['digitizing.toolbar.line']}">
                        <svg>
                            <use xlink:href="#line"></use>
                        </svg>
                    </li>
                    <li class="digitizing-polygon btn ${mainLizmap.digitizing.toolSelected === 'polygon' ? 'active btn-primary' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'polygon'} data-original-title="${lizDict['digitizing.toolbar.polygon']}">
                        <svg>
                            <use xlink:href="#polygon"></use>
                        </svg>
                    </li>
                    <br>
                    <li class="digitizing-box btn ${mainLizmap.digitizing.toolSelected === 'box' ? 'active btn-primary' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'box'} data-original-title="${lizDict['digitizing.toolbar.box']}">
                        <svg>
                            <use xlink:href="#box"></use>
                        </svg>
                    </li>
                    <li class="digitizing-circle btn ${mainLizmap.digitizing.toolSelected === 'circle' ? 'active btn-primary' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'circle'} data-original-title="${lizDict['digitizing.toolbar.circle']}">
                        <svg>
                            <use xlink:href="#circle"></use>
                        </svg>
                    </li>
                    <li class="digitizing-freehand btn ${mainLizmap.digitizing.toolSelected === 'freehand' ? 'active btn-primary' : ''}" @click=${() => mainLizmap.digitizing.toolSelected = 'freehand'} data-original-title="${lizDict['digitizing.toolbar.freehand']}">
                        <svg>
                            <use xlink:href="#freehand"></use>
                        </svg>
                    </li>
                </ul>
            </div>
            <input type="color" class="digitizing-color btn" .value="${mainLizmap.digitizing.drawColor}" @input=${(event) => mainLizmap.digitizing.drawColor = event.target.value} data-original-title="${lizDict['digitizing.toolbar.color']}">
            <button type="button" class="digitizing-edit btn ${mainLizmap.digitizing.isEdited ? 'active btn-primary' : ''}" ?disabled=${!mainLizmap.digitizing.featureDrawn} @click=${() => mainLizmap.digitizing.toggleEdit()} data-original-title="${lizDict['attributeLayers.btn.edit.title']}">
                <svg>
                    <use xlink:href="#edit"/>
                </svg>
            </button>
            <button type="button" class="digitizing-erase btn" ?disabled=${!mainLizmap.digitizing.featureDrawn} @click=${() => mainLizmap.digitizing.erase()} data-original-title="${lizDict['digitizing.toolbar.erase']}">
                <svg>
                    <use xlink:href="#eraser"/>
                </svg>
            </button>
            <button type="button" class="digitizing-toggle-visibility btn" ?disabled=${!mainLizmap.digitizing.featureDrawn} @click=${() => mainLizmap.digitizing.toggleFeatureDrawnVisibility()}  data-original-title="${lizDict['tree.button.checkbox']}">
                <i class="icon-eye-${mainLizmap.digitizing._featureDrawnVisibility ? 'open' : 'close'}"></i>
            </button>
            <div class="${this.hasAttribute('import-export') ? '' : 'hide'}">
                <div class="btn-group digitizing-export">
                    <button class="btn dropdown-toggle" ?disabled=${!mainLizmap.digitizing.featureDrawn} data-toggle="dropdown" data-original-title="${lizDict['attributeLayers.toolbar.btn.data.export.title']}">
                        <svg>
                            <use xlink:href="#file-download"></use>
                        </svg>
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <a href="#" @click=${() => mainLizmap.digitizing.download('geojson')}>GeoJSON</a>
                        </li>
                        <li>
                            <a href="#" @click=${() => mainLizmap.digitizing.download('gpx')}>GPX</a>
                        </li>
                        <li>
                            <a href="#" @click=${() => mainLizmap.digitizing.download('kml')}>KML</a>
                        </li>
                    </ul>
                </div>
                <div class="digitizing-import">
                    <label class="btn" data-original-title="${lizDict['digitizing.toolbar.import']}">
                        <svg>
                            <use xlink:href="#file-upload"></use>
                        </svg>
                        <input class="hide" type="file" accept=".kml, .geojson, .json, .gpx" @change=${
                            (event) => 
                                    {
                                        if (event.target.files.length > 0){
                                            event.target.parentElement.parentElement.querySelector('.file-name').textContent = event.target.files[0].name;
                                            mainLizmap.digitizing.import(event.target.files[0]);
                                        }
                                    }
                        }>
                    </label>
                    <span class="file-name"></span>
                </div>
            </div>
        </div>`;

        render(mainTemplate(), this);

        // Add tooltip on buttons
        $('.digitizing-buttons, .digitizing .btn', this).tooltip({
            placement: 'top'
        });

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            ['digitizing.featureDrawn', 'digitizing.featureDrawnVisibility', 'digitizing.toolSelected', 'digitizing.editionBegins', 'digitizing.editionEnds', 'digitizing.erase', 'digitizing.drawColor']
        );
    }

    disconnectedCallback() {
    }
}
