/**
 * @module components/SelectionTool.js
 * @name SelectionTool
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import {html, render} from 'lit-html';

/**
 * @class
 * @name SelectionTool
 * @augments HTMLElement
 */
export default class SelectionTool extends HTMLElement {
    /**
     * The HTML element constructor
     * @class
     * @private
     */
    constructor() {
        super();
    }

    /**
     * Invoked when a component is added to the document's DOM.
     */
    connectedCallback() {

        const titleTemplate = () => html`
        <h3>
            <span class="title">
                <button
                    type="button"
                    class="btn-selectiontool-clear btn btn-sm btn-error btn-link"
                    title="${lizDict['toolbar.content.stop']}"
                    @click=${() => mainLizmap.selectionTool.disable()}
                    >×</button>
                <span class="icon-star icon-white"></span>
                <span class="text">&nbsp;${lizDict['selectiontool.toolbar.title']}&nbsp;</span>
            </span>
        </h3>`;

        const layerListSelectTemplate = () => html`
        <select
            class="selectiontool-layer-list"
            @change=${ (event) => mainLizmap.selectionTool.allFeatureTypeSelected = event.target.value}>
            <optgroup label="${lizDict['selectiontool.toolbar.layers.single']}">
                ${mainLizmap.selectionTool.layers.map((layer) => html`
                    <option value="${layer.name}">${layer.title}</option>`
                )}
            </optgroup>
            <optgroup label="${lizDict['selectiontool.toolbar.layers.multiple']}">
                <option value="selectable-visible-layers">
                    ${lizDict['selectiontool.toolbar.layers.selectableAndVisible']}
                </option>
                <option value="selectable-layers">${lizDict['selectiontool.toolbar.layers.selectable']}</option>
            </optgroup>
        </select>`;

        const geomOperatorSelectTemplate = () => html`
        <select
            class="selectiontool-geom-operator"
            data-bs-toggle="tooltip"
            data-bs-title="${lizDict['selectiontool.toolbar.geomOperator']}"
            @change=${ (event) => mainLizmap.selectionTool.geomOperator = event.target.value}
            >
            <option value="intersects">${lizDict['selectiontool.toolbar.geomOperator.intersects']}</option>
            <option value="within">${lizDict['selectiontool.toolbar.geomOperator.within']}</option>
            <option value="overlaps">${lizDict['selectiontool.toolbar.geomOperator.overlaps']}</option>
            <option value="contains">${lizDict['selectiontool.toolbar.geomOperator.contains']}</option>
            <option value="crosses">${lizDict['selectiontool.toolbar.geomOperator.crosses']}</option>
            <option value="disjoint">${lizDict['selectiontool.toolbar.geomOperator.disjoint']}</option>
            <option value="touches">${lizDict['selectiontool.toolbar.geomOperator.touches']}</option>
        </select>`;

        const buttonsTypeTemplate = (newAddRemoveSelected) => html`
        <div class="selectiontool-type-buttons btn-group">
            <button
                type="button"
                value="refresh"
                class="selectiontool-type-refresh btn btn-sm ${newAddRemoveSelected === 'new' ? 'active' : ''}"
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['selectiontool.toolbar.action.type.refresh']}"
                @click=${() => newAddRemoveSelected = 'new'}
                >
                <i class="icon-refresh"></i>
            </button>
            <button
                type="button"
                value="plus"
                class="selectiontool-type-plus btn btn-sm ${newAddRemoveSelected === 'add' ? 'active' : ''}"
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['selectiontool.toolbar.action.type.plus']}"
                @click=${() => newAddRemoveSelected = 'add'}
                >
                <i class="icon-plus"></i>
            </button>
            <button
                type="button"
                value="minus"
                class="selectiontool-type-minus btn btn-sm ${newAddRemoveSelected === 'remove' ? 'active' : ''}"
                data-bs-toggle="tooltip"
                data-bs-title="${lizDict['selectiontool.toolbar.action.type.minus']}"
                @click=${() => newAddRemoveSelected = 'remove'}
                >
                <i class="icon-minus"></i>
            </button>
        </div>`;

        const filterButtonTemplate = (isFilterDisabled, filteredFeaturesCount) => html`
        <button
            type="button"
            class="selectiontool-filter btn btn-sm ${filteredFeaturesCount !== 0 ? 'active' : ''}"
            ?disabled=${isFilterDisabled}
            @click=${ () => mainLizmap.selectionTool.filter()}
            data-bs-toggle="tooltip"
            data-bs-title="${lizDict['selectiontool.toolbar.action.filter']}">
            <i class="icon-filter"></i>
        </button>`;

        const exportTemplate = () => this.hasAttribute('layer-export') ? html`
            <div
                class="btn-group dropup selectiontool-export"
                role="group"
                data-bs-toggle="tooltip"
                data-bs-title="${mainLizmap.selectionTool.isExportable ? '' : lizDict['switcher.layer.export.warn']}"
                >
                <button
                    type="button"
                    class="btn btn-sm dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    ?disabled=${ !mainLizmap.selectionTool.isExportable }
                    >
                    ${lizDict['switcher.layer.export.title']}
                <span class="caret"></span>
                </button>
                <ul class="selectiontool-export-formats dropdown-menu dropdown-menu-right" role="menu">
                    <li><a href="#" class="btn-export-selection">GeoJSON</a></li>
                    <li><a href="#" class="btn-export-selection">GML</a></li>
                    ${mainLizmap.selectionTool.exportFormats.map(
                        (format) => html`<li><a href="#" class="btn-export-selection">${format}</a></li>`
                    )}
                </ul>
            </div>` : '';

        const mainTemplate = (isFilterDisabled, results, newAddRemoveSelected, filteredFeaturesCount) => html`
        <div class="selectiontool">
            <h3>${titleTemplate()}</h3>
            <div class="menu-content">
                <div>${lizDict['selectiontool.toolbar.layer']}</div>
                <div>${layerListSelectTemplate()}</div>
                <lizmap-digitizing
                    context="selectiontool"
                    selected-tool="box"
                    available-tools="point,line,polygon,box,freehand"
                    import-export
                    ></lizmap-digitizing>
                <div class="selectiontool-buffer">
                    <label><span>${lizDict['selectiontool.toolbar.buffer']}</span>
                        <div class="input-append">
                            <input
                                type="number"
                                min="0"
                                class="input-mini"
                                .value="${mainLizmap.selectionTool.bufferValue}"
                                @input=${(event) => mainLizmap.selectionTool.bufferValue = parseInt(event.target.value)}
                                ><span class="add-on">m</span>
                        </div>
                    </label>
                </div>
                <div>${geomOperatorSelectTemplate()}</div>
                <div class="selectiontool-results" style="padding:2px">${results}</div>
                <div class="selectiontool-actions">
                    ${buttonsTypeTemplate(newAddRemoveSelected)}
                    <button
                        type="button"
                        class="selectiontool-unselect btn btn-sm"
                        ?disabled=${mainLizmap.selectionTool.selectedFeaturesCount === 0}
                        @click=${ () => mainLizmap.selectionTool.unselect()}
                        data-bs-toggle="tooltip"
                        data-bs-title="${lizDict['selectiontool.toolbar.action.unselect']}"
                        >
                        <i class="icon-star-empty"></i>
                    </button>
                    ${filterButtonTemplate(isFilterDisabled, filteredFeaturesCount)}
                    <lizmap-selection-invert></lizmap-selection-invert>
                    ${exportTemplate()}
                </div>
            </div>
        </div>`;

        render(
            mainTemplate(
                this.isFilterDisabled,
                this.results,
                mainLizmap.selectionTool.newAddRemoveSelected,
                mainLizmap.selectionTool.filteredFeaturesCount
            ),
            this
        );

        // Add tooltip on buttons
        // TODO allow tooltip on disabled buttons : https://stackoverflow.com/a/19938049/2000654
        $('.menu-content button, .menu-content .selectiontool-export, .selectiontool-geom-operator', this).tooltip({
            placement: 'top'
        });

        // Export
        this.querySelectorAll('.btn-export-selection').forEach(exportbtn => {
            exportbtn.addEventListener('click', evt => {
                mainLizmap.selectionTool.export(evt.target.text);
            });
        });

        mainEventDispatcher.addListener(
            () => {
                render(
                    mainTemplate(
                        this.isFilterDisabled,
                        this.results,
                        mainLizmap.selectionTool.newAddRemoveSelected,
                        mainLizmap.selectionTool.filteredFeaturesCount
                    ),
                    this
                );
            },
            [
                'selectionTool.newAddRemoveSelected',
                'selectionTool.allFeatureTypeSelected',
                'selection.changed',
                'filteredFeatures.changed',
                'selection.bufferValue',
            ]
        );
    }

    /**
     * Invoked when a component is removed from the document's DOM.
     */
    disconnectedCallback() {
    }

    /**
     * The filter is disabled
     * @type {boolean}
     */
    get isFilterDisabled () {
        return mainLizmap.selectionTool.selectedFeaturesCount === 0 &&
            mainLizmap.selectionTool.filteredFeaturesCount === 0;
    }

    /**
     * The results of the selection
     * @type {string}
     */
    get results () {
        if (mainLizmap.selectionTool.selectedFeaturesCount > 1 ) {
            return lizDict['selectiontool.results.more'].replace('%s', mainLizmap.selectionTool.selectedFeaturesCount);
        } else if (mainLizmap.selectionTool.selectedFeaturesCount === 1) {
            return lizDict['selectiontool.results.one'];
        }
        return lizDict['selectiontool.results.none'];
    }
}
