/**
 * @module components/Digitizing.js
 * @name Digitizing
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { DigitizingAvailableTools } from '../modules/Digitizing.js'
import { html, render } from 'lit-html';

import '../images/svg/point.svg';
import '../images/svg/line.svg';
import '../images/svg/polygon.svg';
import '../images/svg/box.svg';
import '../images/svg/circle.svg';
import '../images/svg/freehand.svg';
import '../images/svg/text.svg';

import '../images/svg/pencil.svg';
import '../images/svg/edit.svg';
import '../images/svg/rotate.svg';
import '../images/svg/split.svg';
import '../images/svg/eraser.svg';
import '../images/svg/eraser-all.svg';
import '../images/svg/save.svg';

import '../images/svg/file-download.svg';
import '../images/svg/file-upload.svg';

/**
 * Digitizing element
 * Provides user interface for digitizing shapes and text
 * Attributes:
 *  context - The digitizing context to linked element to Digitizing module context
 *  selected-tool - Start selected drawing tools one of DigitizingAvailableTools or available-tools
 *  available-tools - List of available drawing tools based on DigitizingAvailableTools
 *  save - Enable save capability
 *  measure - Enable measure capability
 *  import-export - Enable import / export capabilities
 * @class
 * @name Digitizing
 * @augments HTMLElement
 * @example
 * <lizmap-digitizing
 *     context="draw"
 *     selected-tool="box"
 *     available-tools="point,line,polygon,box,freehand"
 *     save
 *     import-export
 *     measure
 *     ></lizmap-digitizing>
 */
export default class Digitizing extends HTMLElement {
    constructor() {
        super();
        this._toolSelected = DigitizingAvailableTools[0];
        this._availableTools = DigitizingAvailableTools.slice(1);
    }

    connectedCallback() {

        if (this.hasAttribute('available-tools')) {
            const attrAvailableTools = this.getAttribute('available-tools')
                .split(',')
                .map((item) => item.trim())
                .filter((item) => this._availableTools.includes(item));
            if (attrAvailableTools.length > 0) {
                this._availableTools = attrAvailableTools;
            }
        }
        if (this.hasAttribute('selected-tool')) {
            const attrToolSelected = this.getAttribute('selected-tool');
            if (this._availableTools.includes(attrToolSelected)) {
                this._toolSelected = attrToolSelected;
            }
        }

        const svgToolIconTemplate = (tool) => {
            return html`
                <svg class="digitizing-tool-icon">
                    <use href="#${tool}"></use>
                </svg>
            `;
        }

        const measureButtonTemplate = (hasMeasureVisible) => html`
            <button
                type="button"
                class="digitizing-toggle-measure btn ${hasMeasureVisible ? 'active btn-primary' : ''}"
                @click=${() => mainLizmap.digitizing.toggleMeasure()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.measure']}"
                >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M17 3l4 4l-14 14l-4 -4z"></path>
                    <path d="M16 7l-1.5 -1.5"></path>
                    <path d="M13 10l-1.5 -1.5"></path>
                    <path d="M10 13l-1.5 -1.5"></path>
                    <path d="M7 16l-1.5 -1.5"></path>
                </svg>
            </button>
            `;

        const saveButtonTemplate = (isSaved) => html `
            <button
                type="button"
                class="digitizing-save btn ${isSaved ? 'active btn-primary' : ''}"
                @click=${()=> this.toggleSave()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.save']}"
                >
                <svg>
                    <use xlink:href="#save" />
                </svg>
            </button>
            `;

        const textContentInputTemplate = () => html`
            <div class="digitizing-text-content form-row">
                <label for="textContent">
                    ${lizDict['digitizing.toolbar.textLabel']}
                </label>
                <textarea
                    id="textContent"
                    placeholder="${lizDict['digitizing.toolbar.newText']}"
                    .value=${mainLizmap.digitizing.editedFeatureText}
                    @input=${
                        event=> mainLizmap.digitizing.editedFeatureText = event.target.value
                    }
                    ></textarea>
            </div>
        `;

        const textRotationInputTemplate = () => html`
            <div class='digitizing-text-rotation form-row'>
                <label for="textRotation">
                    ${lizDict['digitizing.toolbar.textRotation']}
                </label>
                <div class="input-append">
                    <input
                        id="textRotation"
                        type="number"
                        .value=${mainLizmap.digitizing.editedFeatureTextRotation}
                        @input=${
                            event => mainLizmap.digitizing.editedFeatureTextRotation = parseInt(event.target.value)
                        }
                        >
                    <span class="add-on">°</span>
                </div>
            </div>
        `;

        const textScaleInputTemplate = () => html`
            <div class="digitizing-text-scale form-row">
                <label for="textScale">
                    ${lizDict['digitizing.toolbar.textScale']}
                </label>
                <input
                    id="textScale"
                    type="number"
                    min="1"
                    .value=${mainLizmap.digitizing.editedFeatureTextScale}
                    @input=${
                        event => mainLizmap.digitizing.editedFeatureTextScale = parseInt(event.target.value)
                    }
                    >
            </div>
            `;

        const mainTemplate = (toolSelected) => html`
        <div class="digitizing">
            <div
                class="digitizing-buttons btn-group dropend"
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.drawTools']}"
                >
                <button
                    type="button"
                    class="digitizing-selected-tool btn ${this.deactivate ? '' : 'active btn-primary'}"
                    @click=${(event) => {this.toggleToolSelected(event)}}
                    >
                    <svg>
                        <use xlink:href="#pencil"></use>
                    </svg>
                    <!-- Display selected tool -->
                    ${this._availableTools
                        .filter(tool => toolSelected === tool)
                        .map(tool => html`
                            ${svgToolIconTemplate(tool)}
                        `)
                    }
                </button>
                <button
                    type="button"
                    class="btn dropdown-toggle dropdown-toggle-split"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    >
                    <span class="visually-hidden">Toggle Dropdown</span>
                </button>
                <ul class="dropdown-menu">
                    ${this._availableTools
                        .map(tool => html`
                        <li
                            class="digitizing-${tool} btn ${toolSelected === tool ? 'active btn-primary' : ''}"
                            @click=${(event) => this.selectTool(event.currentTarget.dataset.value)}
                            data-value="${tool}"
                            data-bs-toggle="tooltip"
                            data-bs-title="${lizDict['digitizing.toolbar.'+tool]}"
                            >
                            ${svgToolIconTemplate(tool)}
                        </li>
                        `)
                    }
                </ul>
            </div>
            <input
                type="color"
                class="digitizing-color btn"
                .value="${mainLizmap.digitizing.drawColor}"
                @input=${(event) => mainLizmap.digitizing._userChangedColor(event.target.value)}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.color']}"
                >
            <button
                type="button"
                class="digitizing-edit btn ${mainLizmap.digitizing.isEdited ? 'active btn-primary' : ''}"
                ?disabled=${!mainLizmap.digitizing.featureDrawn}
                @click=${() => mainLizmap.digitizing.toggleEdit()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.edit']}"
                >
                <svg>
                    <use xlink:href="#edit"/>
                </svg>
            </button>
            <button
                type="button"
                class="digitizing-rotate btn ${mainLizmap.digitizing.isRotate ? 'active btn-primary' : ''}"
                ?disabled=${!mainLizmap.digitizing.featureDrawn}
                @click=${() => mainLizmap.digitizing.toggleRotate()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.rotate']}"
                >
                <svg>
                    <use xlink:href="#rotate"/>
                </svg>
            </button>
            <button
                type="button"
                class="digitizing-split btn ${mainLizmap.digitizing.isSplitting ? 'active btn-primary' : ''}"
                ?disabled=${!mainLizmap.digitizing.featureDrawn}
                @click=${() => mainLizmap.digitizing.toggleSplit()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.split']}"
                >
                <svg>
                    <use xlink:href="#split"/>
                </svg>
            </button>
            <button
                type="button"
                class="digitizing-erase btn ${mainLizmap.digitizing.isErasing ? 'active btn-primary' : ''}"
                ?disabled=${!mainLizmap.digitizing.featureDrawn}
                @click=${() => mainLizmap.digitizing.toggleErasing()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.erase']}"
                >
                <svg>
                    <use xlink:href="#eraser"/>
                </svg>
            </button>
            <button
                type="button"
                class="digitizing-all btn"
                ?disabled=${!mainLizmap.digitizing.featureDrawn}
                @click=${() => this.eraseAll()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.erase.all']}"
                >
                <svg>
                    <use xlink:href="#eraser-all"/>
                </svg>
            </button>
            <button
                type="button"
                class="digitizing-toggle-visibility btn"
                ?disabled=${!mainLizmap.digitizing.featureDrawn}
                @click=${() => mainLizmap.digitizing.toggleVisibility()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['tree.button.checkbox']}"
                >
                <i class="icon-eye-${mainLizmap.digitizing.visibility ? 'open' : 'close'}"></i>
            </button>
            ${this.measureAvailable ? measureButtonTemplate(
                mainLizmap.digitizing.hasMeasureVisible,
            ) : ''}
            ${this.saveAvailable ? saveButtonTemplate(
                mainLizmap.digitizing.isSaved,
            ) : ''}
            <div class="digitizing-import-export ${this.importExportAvailable ? '' : 'hide'}">
                <div class="btn-group dropend digitizing-export">
                    <button
                        type="button"
                        class="btn dropdown-toggle"
                        ?disabled=${!mainLizmap.digitizing.featureDrawn}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        title="${lizDict['attributeLayers.toolbar.btn.data.export.title']}"
                        >
                        <svg>
                            <use xlink:href="#file-download"></use>
                        </svg>
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <button
                                type="button"
                                class="dropdown-item"
                                @click=${() => mainLizmap.digitizing.download('geojson')}
                                >GeoJSON</button>
                        </li>
                        <li>
                            <button
                                type="button"
                                class="dropdown-item"
                                @click=${() => mainLizmap.digitizing.download('gpx')}
                                >GPX</button>
                        </li>
                        <li>
                            <button
                                type="button"
                                class="dropdown-item"
                                @click=${() => mainLizmap.digitizing.download('kml')}
                                >KML</button>
                        </li>
                        <li>
                            <button
                                type="button"
                                class="dropdown-item"
                                @click=${() => mainLizmap.digitizing.download('fgb')}
                                >FlatGeobuf</button>
                        </li>
                    </ul>
                </div>
                <div class="digitizing-import">
                    <label class="btn" data-bs-toggle="tooltip" data-bs-title="${lizDict['digitizing.toolbar.import']}">
                        <svg>
                            <use xlink:href="#file-upload"></use>
                        </svg>
                        <input
                            class="hide"
                            type="file"
                            accept=".kml, .geojson, .json, .gpx, .zip, .fgb"
                            @change=${(event) => {
                                if (event.target.files.length > 0){
                                    const file = event.target.files[0];
                                    const parent = event.target.parentElement.parentElement;
                                    parent.querySelector('.file-name').textContent = file.name;
                                    mainLizmap.digitizing.import(file);
                                }
                            }}>
                    </label>
                    <span class="file-name"></span>
                </div>
            </div>
            <div class="digitizing-state hide">
                <div class="digitizing-save-state hide">${lizDict['digitizing.toolbar.save.state']}</div>
            </div>
            <div class="digitizing-constraints ${mainLizmap.digitizing.hasConstraintsPanelVisible ? '' : 'hide'}">
                <details>
                    <summary>
                        ${lizDict['digitizing.constraint.title']}
                    </summary>
                    ${lizDict['digitizing.constraint.details']}
                </details>
                <div class="digitizing-constraint-distance input-append">
                    <input
                        type="number"
                        placeholder="${lizDict['digitizing.constraint.distance']}"
                        class="distance"
                        min="0"
                        @input=${
                            event => mainLizmap.digitizing.distanceConstraint = event.target.value
                        }
                        >
                    <span class="add-on">m</span>
                </div>
                <div class="digitizing-constraint-angle input-append">
                    <input
                        type="number"
                        placeholder="${lizDict['digitizing.constraint.angle']}"
                        class="angle"
                        @input=${
                            event => mainLizmap.digitizing.angleConstraint = event.target.value
                        }
                        >
                    <span class="add-on">°</span>
                </div>
            </div>
            <form class="digitizing-text-tools ${mainLizmap.digitizing.editedFeatures.length ? '' : 'hide'}">
                <details>
                    <summary>
                        ${lizDict['digitizing.toolbar.text']}
                    </summary>
                    ${lizDict['digitizing.toolbar.text.hint']}
                </details>
                ${textContentInputTemplate()}
                ${textRotationInputTemplate()}
                ${textScaleInputTemplate()}
            </form>
        </div>`;

        render(
            mainTemplate(
                this.toolSelected,
            ),
            this,
        );

        const tooltipTriggerList = this.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover'
        }));

        mainEventDispatcher.addListener(
            () => {
                if (!this.disabled) {
                    render(
                        mainTemplate(
                            this.toolSelected,
                        ),
                        this,
                    );
                }
            },
            [
                'digitizing.drawColor',
                'digitizing.editedFeatureRotation',
                'digitizing.editedFeatureScale',
                'digitizing.editedFeatureText',
                'digitizing.editionBegins',
                'digitizing.editionEnds',
                'digitizing.erase',
                'digitizing.erase.all',
                'digitizing.erasingBegins',
                'digitizing.erasingEnds',
                'digitizing.featureDrawn',
                'digitizing.measure',
                'digitizing.rotate',
                'digitizing.save',
                'digitizing.split',
                'digitizing.toolSelected',
                'digitizing.visibility',
            ]
        );
    }

    disconnectedCallback() {
    }

    /**
     * Digitizing context
     * The element attribute: context
     * @type {string}
     */
    get context() {
        if (this.hasAttribute('context')) {
            return this.getAttribute('context');
        }
        return 'draw';
    }

    /**
     * The element is deactivated
     * if the element is disabled
     * or if the tool is deactivated
     * @type {boolean}
     */
    get deactivate() {
        if (mainLizmap.digitizing.context !== this.context) {
            return true;
        }
        if (mainLizmap.digitizing.toolSelected === 'deactivate') {
            return true;
        }
        return false;
    }

    /**
     * The element is disabled if the context is not the same as the module
     * @type {boolean}
     */
    get disabled() {
        if (mainLizmap.digitizing.context !== this.context) {
            return true;
        }
        return false;
    }

    /**
     * Measure is available
     * The element has attribute: measure
     * @type {boolean}
     */
    get measureAvailable() {
        return this.hasAttribute('measure');
    }

    /**
     * Save is available
     * The element has attribute: save
     * @type {boolean}
     */
    get saveAvailable() {
        return this.hasAttribute('save');
    }

    /**
     * Import/export is available
     * The element has attribute: import-export
     * @type {boolean}
     */
    get importExportAvailable() {
        return this.hasAttribute('import-export');
    }

    /**
     * The available tools
     * The element attribute: available-tools
     * All or part of DigitizingAvailableTools except deactivate
     * @see DigitizingAvailableTools
     * @type {string}
     */
    get availableTools() {
        return this._availableTools;
    }

    /**
     * The selected tool
     * The element attribute: selected-tool
     * @type {string}
     */
    get toolSelected() {
        return this._toolSelected;
    }

    /**
     * Setting the selected
     * @see DigitizingAvailableTools
     * @param {string} tool - switch new OL map on top of OL2 one
     */
    set toolSelected(tool) {
        if (this._availableTools.includes(tool)) {
            this._toolSelected = tool;
            mainLizmap.digitizing.toolSelected = tool;
        }
    }

    /**
     * Select tool
     * @param {string} tool - The tool to select
     * @returns {boolean} - True if the tool is selected, false otherwise
     */
    selectTool(tool) {
        this.toolSelected = tool;
        return this.toolSelected === tool;
    }

    /**
     * Toggle selected tool
     * @param {MouseEvent} event - The click event on the button
     */
    toggleToolSelected(event) {
        const firstAvailableTools = DigitizingAvailableTools[0];
        if (this.toolSelected === firstAvailableTools) {
            bootstrap.Dropdown.getOrCreateInstance(event.currentTarget).toggle();
        } else if (mainLizmap.digitizing.toolSelected !== firstAvailableTools) {
            mainLizmap.digitizing.toolSelected = firstAvailableTools;
        } else {
            mainLizmap.digitizing.toolSelected = this.toolSelected;
        }
        event.stopPropagation();
    }

    eraseAll() {
        if (!confirm(lizDict['digitizing.confirm.erase.all'])) {
            return false;
        }
        mainLizmap.digitizing.eraseAll();
    }

    toggleSave() {
        mainLizmap.digitizing.toggleSave();
        if (mainLizmap.digitizing.isSaved) {
            this.querySelector('button.digitizing-save').dataset.originalTitle =
                lizDict['digitizing.toolbar.save.remove'];
            this.querySelector('div.digitizing-save-state').classList.remove('hide');
            this.querySelector('div.digitizing-state').classList.remove('hide');
        } else {
            this.querySelector('button.digitizing-save').dataset.originalTitle =
                lizDict['digitizing.toolbar.save'];
            this.querySelector('div.digitizing-save-state').classList.add('hide');
            this.querySelector('div.digitizing-state').classList.add('hide');
        }
    }
}
