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

/**
 * @summary Provides user interface for digitizing shapes and text
 * @augments HTMLElement
 *
 * @description By default, it provides a toolbar with draw tools, editing tools
 * (update, rotate, scale, split, delete, delete all), save, import and export tools.
 *
 * The context attribute is used to link the digitizing context to the Digitizing module context.
 * It is mandatory and provide a way to use this element for different contexts.
 *
 * The other attributes are:
 *  selected-tool - Start selected drawing tools one of DigitizingAvailableTools or available-tools
 *  available-tools - List of available drawing tools based on DigitizingAvailableTools
 *  save - Enable save capability
 *  import-export - Enable import / export capabilities
 *  measure - Enable measure capability
 *  text-tools - Enable text tools
 * @example <caption>Example of use</caption>
 * <lizmap-digitizing
 *     context="draw"
 *     selected-tool="box"
 *     available-tools="point,line,polygon,box,freehand"
 *     save
 *     import-export
 *     measure
 *     text-tools
 *     ></lizmap-digitizing>
 *
 * @listens Digitizing#digitizingDrawColor
 * @listens Digitizing#digitizingEditedFeatureRotation
 * @listens Digitizing#digitizingEditedFeatureScale
 * @listens Digitizing#digitizingEditedFeatureText
 * @listens Digitizing#digitizingEditionBegins
 * @listens Digitizing#digitizingEditionEnds
 * @listens Digitizing#digitizingErase
 * @listens Digitizing#digitizingErase.all
 * @listens Digitizing#digitizingErasingBegins
 * @listens Digitizing#digitizingErasingEnds
 * @listens Digitizing#digitizingFeatureDrawn
 * @listens Digitizing#digitizingMeasure
 * @listens Digitizing#digitizingRotate
 * @listens Digitizing#digitizingScaling
 * @listens Digitizing#digitizingSave
 * @listens Digitizing#digitizingSplit
 * @listens Digitizing#digitizingToolSelected
 * @listens Digitizing#digitizingVisibility
 */
export default class Digitizing extends HTMLElement {
    constructor() {
        super();
        this._toolSelected = DigitizingAvailableTools[0];
        this._availableTools = DigitizingAvailableTools.slice(1);
        this._parallelPanelVisible = false;
    }

    /**
     * Show an editing message popup for the selected tool
     * @param {string} messageKey - The lizDict key for the message
     */
    _showEditingMessage(messageKey) {
        const msg = lizDict[messageKey];
        if (!msg) return;
        // Remove any previous editing message
        $('#lizmap-editing-message').remove();
        lizMap.addMessage(msg, 'info', true, 10000).attr('id', 'lizmap-editing-message');
    }

    connectedCallback() {

        // Update available tools from attribute
        if (this.hasAttribute('available-tools')) {
            const attrAvailableTools = this.getAttribute('available-tools')
                .split(',')
                .map((item) => item.trim())
                .filter((item) => this._availableTools.includes(item));
            // update only if available tools will not be empty
            if (attrAvailableTools.length > 0) {
                this._availableTools = attrAvailableTools;
            }
        }
        // Update selected tool from attribute
        if (this.hasAttribute('selected-tool')) {
            const attrToolSelected = this.getAttribute('selected-tool');
            // update only if the selected tool is known
            if (this._availableTools.includes(attrToolSelected)) {
                this._toolSelected = attrToolSelected;
            }
        }
        // Set selected tool if only one tool is available
        if (this._availableTools.length === 1) {
            this._toolSelected = this._availableTools[0];
        }

        const svgToolIconTemplate = (tool) => {
            return html`
                <svg class="digitizing-tool-icon">
                    <use href="${lizUrls.svgSprite}#${tool}"/>
                </svg>
            `;
        }

        const toolButtonTemplate = (availableTools, toolSelected) => html`
            <div
                class="digitizing-buttons btn-group dropend"
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.drawTools']}"
                >
                <button
                    type="button"
                    class="digitizing-selected-tool btn ${this.deactivate ? '' : 'active btn-primary'}"
                    value="${toolSelected}"
                    @click=${(event) => {this.toggleToolSelected(event)}}
                    >
                    <svg>
                        <use href="${lizUrls.svgSprite}#pencil"/>
                    </svg>
                    <!-- Display selected tool -->
                    ${availableTools
                        .filter(tool => toolSelected === tool)
                        .map(tool => html`
                            ${svgToolIconTemplate(tool)}
                        `)
                    }
                </button>
                ${availableTools.length != 1 ? html`
                <button
                    type="button"
                    class="btn dropdown-toggle dropdown-toggle-split"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    >
                    <span class="visually-hidden">Toggle Dropdown</span>
                </button>
                <ul class="dropdown-menu">
                    ${availableTools
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
                </ul>` : ''}
            </div>
        `;

        const measureButtonTemplate = (hasMeasureVisible) => html`
            <button
                type="button"
                class="digitizing-toggle-measure btn ${hasMeasureVisible ? 'active btn-primary' : ''}"
                @click=${() => mainLizmap.digitizing.toggleMeasure()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.measure']}"
                >
                <svg>
                    <use href="${lizUrls.svgSprite}#rule"/>
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
                    <use href="${lizUrls.svgSprite}#save"/>
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
                        class="form-control"
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
                    class="form-control"
                    min="1"
                    .value=${mainLizmap.digitizing.editedFeatureTextScale}
                    @input=${
                        event => mainLizmap.digitizing.editedFeatureTextScale = parseInt(event.target.value)
                    }
                    >
            </div>
            `;

        const textToolsTemplate = (hasEditedFeatures) => html`
            <form class="digitizing-text-tools ${hasEditedFeatures ? '' : 'hide'}">
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
            `;

        const mainTemplate = (toolSelected) => {
            // Evaluate on every render so it reflects current edition state
            const isEditionPoint = this.context === 'edition' && mainLizmap.edition?.layerGeometry === 'point';
            const isEditionPolygon = this.context === 'edition' && mainLizmap.edition?.layerGeometry === 'polygon';
            const isSplitLocked = this.context === 'edition' && mainLizmap.digitizing.isSplitLocked;
            const splitLockedTooltip = lizDict['edition.split.save.first'] || 'Save features first before using this tool.';

            // For point layers in edition, no toolbar needed — drawing starts automatically
            if (isEditionPoint) {
                this.style.display = 'none';
                return html``;
            }
            this.style.display = '';

            return html`
        <div class="digitizing">
            ${this.context !== 'edition' ? toolButtonTemplate(this._availableTools, toolSelected) : ''}
            ${this.context !== 'edition' ? html`<input
                type="color"
                class="digitizing-color btn"
                .value="${mainLizmap.digitizing.drawColor}"
                @input=${(event) => mainLizmap.digitizing._userChangedColor(event.target.value)}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.color']}"
                >` : ''}
            ${this.context !== 'edition' ? html`<button
                type="button"
                class="digitizing-edit btn ${mainLizmap.digitizing.isEdited ? 'active btn-primary' : ''}"
                ?disabled=${!mainLizmap.digitizing.featureDrawn}
                @click=${() => { mainLizmap.digitizing.toggleEdit(); if (mainLizmap.digitizing.isEdited) this._showEditingMessage('digitizing.toolbar.edit.help'); }}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.edit']}"
                >
                <svg>
                    <use href="${lizUrls.svgSprite}#edit"/>
                </svg>
            </button>` : ''}
            ${!isEditionPoint ? html`<button
                type="button"
                class="digitizing-translate btn ${mainLizmap.digitizing.isTranslating ? 'active btn-primary' : ''}"
                ?disabled=${!mainLizmap.digitizing.featureDrawn || isSplitLocked || (this.context === 'edition' && !mainLizmap.digitizing.isEdited && !mainLizmap.digitizing.isTranslating && !mainLizmap.digitizing.isRotate && !mainLizmap.digitizing.isScaling)}
                @click=${() => { this._parallelPanelVisible = false; mainLizmap.digitizing.toggleTranslate(); if (mainLizmap.digitizing.isTranslating) this._showEditingMessage('digitizing.toolbar.move.help'); }}
                data-bs-toggle="tooltip"
                data-bs-title="${isSplitLocked ? splitLockedTooltip : lizDict['digitizing.toolbar.move']}"
                >
                <svg>
                    <use href="${lizUrls.svgSprite}#move"/>
                </svg>
            </button>
            <button
                type="button"
                class="digitizing-rotate btn ${mainLizmap.digitizing.isRotate ? 'active btn-primary' : ''}"
                ?disabled=${!mainLizmap.digitizing.featureDrawn || isSplitLocked}
                @click=${() => { this._parallelPanelVisible = false; mainLizmap.digitizing.toggleRotate(); if (mainLizmap.digitizing.isRotate) this._showEditingMessage('digitizing.toolbar.rotate.help'); }}
                data-bs-toggle="tooltip"
                data-bs-title="${isSplitLocked ? splitLockedTooltip : lizDict['digitizing.toolbar.rotate']}"
                >
                <svg>
                    <use href="${lizUrls.svgSprite}#rotate"/>
                </svg>
            </button>
            <button
                type="button"
                class="digitizing-scaling btn ${mainLizmap.digitizing.isScaling ? 'active btn-primary' : ''}"
                ?disabled=${!mainLizmap.digitizing.featureDrawn || isSplitLocked}
                @click=${() => { this._parallelPanelVisible = false; mainLizmap.digitizing.toggleScaling(); if (mainLizmap.digitizing.isScaling) this._showEditingMessage('digitizing.toolbar.scaling.help'); }}
                data-bs-toggle="tooltip"
                data-bs-title="${isSplitLocked ? splitLockedTooltip : lizDict['digitizing.toolbar.scaling']}"
                >
                <svg>
                    <use href="${lizUrls.svgSprite}#scaling"/>
                </svg>
            </button>
            <button
                type="button"
                class="digitizing-split btn ${mainLizmap.digitizing.isSplitting ? 'active btn-primary' : ''}"
                ?disabled=${!mainLizmap.digitizing.featureDrawn || isSplitLocked}
                @click=${() => { this._parallelPanelVisible = false; mainLizmap.digitizing.toggleSplit(); if (mainLizmap.digitizing.isSplitting) this._showEditingMessage('digitizing.toolbar.split.help'); }}
                data-bs-toggle="tooltip"
                data-bs-title="${isSplitLocked ? splitLockedTooltip : lizDict['digitizing.toolbar.split']}"
                >
                <svg>
                    <use href="${lizUrls.svgSprite}#split"/>
                </svg>
            </button>
            <button
                type="button"
                class="digitizing-reshape btn ${mainLizmap.digitizing.isReshaping ? 'active btn-primary' : ''}"
                ?disabled=${!mainLizmap.digitizing.featureDrawn || isSplitLocked || isEditionPolygon}
                @click=${() => { this._parallelPanelVisible = false; mainLizmap.digitizing.toggleReshape(); if (mainLizmap.digitizing.isReshaping) this._showEditingMessage('digitizing.toolbar.reshape.help'); }}
                data-bs-toggle="tooltip"
                data-bs-title="${isSplitLocked ? splitLockedTooltip : isEditionPolygon ? (lizDict['edition.reshape.polygon.unsupported'] || 'Reshape is not supported for polygon geometries.') : lizDict['digitizing.toolbar.reshape']}"
                >
                <svg>
                    <use href="${lizUrls.svgSprite}#reshape"/>
                </svg>
            </button>
            <button
                type="button"
                class="digitizing-parallel-toggle btn ${this._parallelPanelVisible ? 'active btn-primary' : ''}"
                ?disabled=${!mainLizmap.digitizing.featureDrawn || isSplitLocked}
                @click=${() => {
                    this._parallelPanelVisible = !this._parallelPanelVisible;
                    if (this._parallelPanelVisible) {
                        // Deactivate other tools and restore edit mode
                        mainLizmap.digitizing._deactivateAllTools();
                        if (mainLizmap.digitizing._context === 'edition' && mainLizmap.digitizing.featureDrawn) {
                            mainLizmap.digitizing.isEdited = true;
                        }
                        this._showEditingMessage('digitizing.toolbar.parallel.help');
                    }
                    this._renderTemplate();
                }}
                data-bs-toggle="tooltip"
                data-bs-title="${isSplitLocked ? splitLockedTooltip : lizDict['digitizing.toolbar.parallel']}"
                >
                <svg>
                    <use href="${lizUrls.svgSprite}#parallel"/>
                </svg>
            </button>` : ''}
            ${this.context === 'edition' && !isEditionPoint ? html`<lizmap-paste-geom></lizmap-paste-geom> <button
                type="button"
                class="digitizing-restart btn"
                ?disabled=${!mainLizmap.digitizing.featureDrawn}
                @click=${() => {
                    if (!confirm(lizDict['edition.confirm.restart-drawing'])) return;
                    mainLizmap.digitizing.isSplitLocked = false;
                    mainLizmap.digitizing.eraseAll();
                    const toolMap = { point: 'point', line: 'line', polygon: 'polygon' };
                    mainLizmap.digitizing.toolSelected = toolMap[mainLizmap.edition?.layerGeometry] || 'point';
                }}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['edition.toolbar.redraw']}"
                >
                <i class="icon-refresh"></i>
            </button>` : ''}
            ${this.context !== 'edition' ? html`<button
                type="button"
                class="digitizing-erase btn ${mainLizmap.digitizing.isErasing ? 'active btn-primary' : ''}"
                ?disabled=${!mainLizmap.digitizing.featureDrawn}
                @click=${() => mainLizmap.digitizing.toggleErasing()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.erase']}"
                >
                <svg>
                    <use href="${lizUrls.svgSprite}#eraser"/>
                </svg>
            </button>
            <button
                type="button"
                class="digitizing-erase-all btn"
                ?disabled=${!mainLizmap.digitizing.featureDrawn}
                @click=${() => this.eraseAll()}
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['digitizing.toolbar.erase.all']}"
                >
                <svg>
                    <use href="${lizUrls.svgSprite}#eraser-all"/>
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
            </button>` : ''}
            ${this.measureAvailable && !isEditionPoint ? measureButtonTemplate(
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
                            <use href="${lizUrls.svgSprite}#file-download"/>
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
                            <use href="${lizUrls.svgSprite}#file-upload"/>
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
                                    event.target.value = '';
                                }
                            }}>
                    </label>
                    <span class="file-name"></span>
                </div>
            </div>
            <div class="digitizing-state hide">
                <div class="digitizing-save-state hide">${lizDict['digitizing.toolbar.save.state']}</div>
            </div>
            <div class="digitizing-parallel-panel ${this._parallelPanelVisible ? '' : 'hide'}">
                <div class="digitizing-parallel-controls">
                    <input
                        type="text"
                        inputmode="decimal"
                        class="digitizing-parallel-input form-control form-control-sm"
                        placeholder="${lizDict['digitizing.toolbar.parallel.placeholder'] || 'Offset (m)'}"
                        >
                    <button
                        type="button"
                        class="btn btn-sm btn-primary digitizing-parallel-apply"
                        @click=${(e) => {
                            const input = e.target.closest('.digitizing-parallel-panel').querySelector('input');
                            const val = parseFloat(input.value.replace(',', '.'));
                            if (!isNaN(val) && val !== 0) {
                                mainLizmap.digitizing.createParallel(val);
                            }
                        }}
                        >${lizDict['digitizing.toolbar.parallel.apply'] || 'Move drawn line'}</button>
                </div>
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
                        class="distance form-control"
                        min="0"
                        step="any"
                        .value=${mainLizmap.digitizing.distanceConstraint || ''}
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
                        class="angle form-control"
                        step="any"
                        .value=${mainLizmap.digitizing.angleConstraint || ''}
                        @input=${
                            event => mainLizmap.digitizing.angleConstraint = event.target.value
                        }
                        >
                    <span class="add-on">°</span>
                </div>
            </div>
            ${this.textToolsAvailable ? textToolsTemplate(
                mainLizmap.digitizing.editedFeatures.length != 0
            ) : ''}
        </div>`;
        };

        this._renderTemplate = () => {
            render(mainTemplate(this.toolSelected), this);
            this._initTooltips();
            this._initDropdowns();
        };

        // Register listener BEFORE the initial render so that even if the render
        // throws (e.g. due to missing lizDict keys), the listener is always in place.
        mainEventDispatcher.addListener(
            () => {
                // Directly clear the constraint inputs — bypasses lit-html diffing
                // which may skip the update if the template value was already ''.
                const distInput = this.querySelector('input.distance');
                const angleInput = this.querySelector('input.angle');
                if (distInput) distInput.value = '';
                if (angleInput) angleInput.value = '';
            },
            'digitizing.constraintReset'
        );

        mainEventDispatcher.addListener(
            (event) => {
                // Sync component tool state with module when context matches
                if (mainLizmap.digitizing.context === this.context) {
                    const moduleTool = mainLizmap.digitizing.toolSelected;
                    if (this._availableTools.includes(moduleTool)) {
                        this._toolSelected = moduleTool;
                    }
                }
                // Reset parallel panel when another tool activates
                if (this._parallelPanelVisible && (
                    mainLizmap.digitizing.isSplitting ||
                    mainLizmap.digitizing.isReshaping ||
                    mainLizmap.digitizing.isRotate ||
                    mainLizmap.digitizing.isScaling
                )) {
                    this._parallelPanelVisible = false;
                }
                if (!this.disabled) {
                    this._renderTemplate();
                }
            },
            [
                'digitizing.constraintReset',
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
                'digitizing.scaling',
                'digitizing.reshape',
                'digitizing.save',
                'digitizing.split',
                'digitizing.splitLocked',
                'digitizing.translate',
                'digitizing.toolSelected',
                'digitizing.visibility',
            ]
        );

        this._renderTemplate();
    }

    disconnectedCallback() {
    }


    _initTooltips() {
        // Dispose existing tooltips to avoid duplicates
        this.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            // Skip elements whose title resolves to null (e.g. missing lizDict key)
            // to prevent Bootstrap from throwing a type-check error.
            const title = el.getAttribute('data-bs-title') || el.getAttribute('title');
            if (!title) return;
            const existing = bootstrap.Tooltip.getInstance(el);
            if (existing) existing.dispose();
            new bootstrap.Tooltip(el, { trigger: 'hover' });
        });
    }

    _initDropdowns() {
        // Use strategy:'fixed' so Popper positions the dropdown relative to the
        // viewport, allowing it to escape overflow:auto containers (#mini-dock).
        this.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(el => {
            if (!bootstrap.Dropdown.getInstance(el)) {
                new bootstrap.Dropdown(el, {
                    popperConfig: { strategy: 'fixed' }
                });
            }
        });
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
     * Text tools are available
     * The element has attribute: text-tools
     * @type {boolean}
     */
    get textToolsAvailable() {
        return this.hasAttribute('text-tools');
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
        const btn = this.querySelector('.digitizing-selected-tool');
        // Close dropdown if opened
        if (btn.getAttribute('aria-expanded') === 'true') {
            bootstrap.Dropdown.getOrCreateInstance(btn).toggle();
        }
        return this.toolSelected === tool;
    }

    /**
     * Toggle selected tool
     * @param {MouseEvent} event - The click event on the button
     */
    toggleToolSelected(event) {
        const firstAvailableTools = DigitizingAvailableTools[0];
        if (this.toolSelected === firstAvailableTools) {
            // Open dropdown to select a tool if no tool is selected
            bootstrap.Dropdown.getOrCreateInstance(event.currentTarget).toggle();
            return;
        } else if (mainLizmap.digitizing.toolSelected !== firstAvailableTools) {
            mainLizmap.digitizing.toolSelected = firstAvailableTools;
        } else {
            mainLizmap.digitizing.toolSelected = this.toolSelected;
        }
        event.stopPropagation();
    }

    /**
     * Erase all features
     * @returns {boolean} - False if the user cancels the action
     */
    eraseAll() {
        if (!confirm(lizDict['digitizing.confirm.erase.all'])) {
            return false;
        }
        mainLizmap.digitizing.eraseAll();
        return true;
    }

    /*
     * Toggle save state
     */
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
