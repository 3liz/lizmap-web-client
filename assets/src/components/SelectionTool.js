import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import {html, render} from 'lit-html';

export default class SelectionTool extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        const mainTemplate = () => html`
        <div class="selectiontool">
            <h3>
                <span class="title">
                    <button class="btn-selectiontool-clear btn btn-mini btn-error btn-link" type="button" @click=${() => mainLizmap.selectionTool.disable()} title="${lizDict['toolbar.content.stop']}">×</button>
                    <span class="icon-star icon-white"></span>
                    <span class="text">&nbsp;${lizDict['selectiontool.toolbar.title']}&nbsp;</span>
                </span>
            </h3>
            <div class="menu-content">
                <div>${lizDict['selectiontool.toolbar.layer']}</div>
                <div>
                    <select class="selectiontool-layer-list" @change=${ (event) => mainLizmap.selectionTool.allFeatureTypeSelected = event.target.value}>
                        <optgroup label="${lizDict['selectiontool.toolbar.layers.single']}">
                            ${mainLizmap.selectionTool.layers.map((layer) => html`<option value="${layer.name}">${layer.title}</option>`)}
                        </optgroup>
                        <optgroup label="${lizDict['selectiontool.toolbar.layers.multiple']}">
                            <option value="selectable-visible-layers">${lizDict['selectiontool.toolbar.layers.selectableAndVisible']}</option>
                            <option selected value="selectable-layers">${lizDict['selectiontool.toolbar.layers.selectable']}</option>
                        </optgroup>
                    </select>
                </div>
                <lizmap-digitizing></lizmap-digitizing>
                <div class="selectiontool-buffer">
                    <label><span>${lizDict['selectiontool.toolbar.buffer']}</span>
                        <div class="input-append">
                            <input class="input-mini" type="number" min="0" .value="${mainLizmap.selectionTool.bufferValue}" @input=${(event) => mainLizmap.selectionTool.bufferValue = parseInt(event.target.value)}><span class="add-on">m</span>
                        </div>
                    </label>
                </div>
                <div>
                    <select class="selection-geom-operator" @change=${ (event) => mainLizmap.selectionTool.geomOperator = event.target.value} data-original-title="${lizDict['selectiontool.toolbar.geomOperator']}">
                        <option value="intersects">${lizDict['selectiontool.toolbar.geomOperator.intersects']}</option>
                        <option value="within">${lizDict['selectiontool.toolbar.geomOperator.within']}</option>
                        <option value="overlaps">${lizDict['selectiontool.toolbar.geomOperator.overlaps']}</option>
                        <option value="contains">${lizDict['selectiontool.toolbar.geomOperator.contains']}</option>
                        <option value="crosses">${lizDict['selectiontool.toolbar.geomOperator.crosses']}</option>
                        <option value="disjoint">${lizDict['selectiontool.toolbar.geomOperator.disjoint']}</option>
                        <option value="touches">${lizDict['selectiontool.toolbar.geomOperator.touches']}</option>
                    </select>
                </div>
                <div class="selectiontool-results" style="padding:2px">${mainLizmap.selectionTool.selectedFeaturesCount > 1 ? lizDict['selectiontool.results.more'].replace('%s', mainLizmap.selectionTool.selectedFeaturesCount) : mainLizmap.selectionTool.selectedFeaturesCount === 1 ? lizDict['selectiontool.results.one'] : lizDict['selectiontool.results.none']}</div>
                <div class="selectiontool-actions">
                    <div class="selectiontool-type-buttons btn-group">
                        <button type="button" class="selectiontool-type-refresh btn btn-mini ${mainLizmap.selectionTool.newAddRemoveSelected === 'new' ? 'active' : ''}" @click=${() => mainLizmap.selectionTool.newAddRemoveSelected = 'new'} data-original-title="${lizDict['selectiontool.toolbar.action.type.refresh']}" value="refresh">
                            <i class="icon-refresh"></i>
                        </button>
                        <button type="button" class="selectiontool-type-plus btn btn-mini ${mainLizmap.selectionTool.newAddRemoveSelected === 'add' ? 'active' : ''}" @click=${() => mainLizmap.selectionTool.newAddRemoveSelected = 'add'} data-original-title="${lizDict['selectiontool.toolbar.action.type.plus']}" value="plus">
                            <i class="icon-plus"></i>
                        </button>
                        <button type="button" class="selectiontool-type-minus btn btn-mini ${mainLizmap.selectionTool.newAddRemoveSelected === 'remove' ? 'active' : ''}" @click=${() => mainLizmap.selectionTool.newAddRemoveSelected = 'remove'} data-original-title="${lizDict['selectiontool.toolbar.action.type.minus']}" value="minus">
                            <i class="icon-minus"></i>
                        </button>
                    </div>
                    <button type="button" class="selectiontool-unselect btn btn-mini" ?disabled=${mainLizmap.selectionTool.selectedFeaturesCount === 0} @click=${ () => mainLizmap.selectionTool.unselect()}  data-original-title="${lizDict['selectiontool.toolbar.action.unselect']}">
                        <i class="icon-star-empty"></i>
                    </button>
                    <button type="button" class="selectiontool-filter btn btn-mini ${mainLizmap.selectionTool.filteredFeaturesCount !== 0 ? 'active' : ''}" ?disabled=${mainLizmap.selectionTool.selectedFeaturesCount === 0 && mainLizmap.selectionTool.filteredFeaturesCount === 0} @click=${ () => mainLizmap.selectionTool.filter()}  data-original-title="${lizDict['selectiontool.toolbar.action.filter']}">
                        <i class="icon-filter"></i>
                    </button>
                    <lizmap-selection-invert></lizmap-selection-invert>
                    ${this.hasAttribute('layer-export') ? html`
                        <div class="btn-group dropup selectiontool-export" role="group" data-original-title="${mainLizmap.selectionTool.isExportable ? '' : lizDict['switcher.layer.export.warn']}">
                            <button type="button" class="btn btn-mini dropdown-toggle" ?disabled=${ !mainLizmap.selectionTool.isExportable } data-toggle="dropdown" aria-expanded="false">
                                ${lizDict['switcher.layer.export.title']}
                            <span class="caret"></span>
                            </button>
                            <ul class="selectiontool-export-formats dropdown-menu dropdown-menu-right" role="menu">
                                <li><a href="#" class="btn-export-selection">GeoJSON</a></li>
                                <li><a href="#" class="btn-export-selection">GML</a></li>
                                ${mainLizmap.selectionTool.exportFormats.map((format) => html`<li><a href="#" class="btn-export-selection">${format}</a></li>`)}
                            </ul>
                        </div>` : ''
                    }
                </div>
            </div>
        </div>`;

        render(mainTemplate(), this);

        // Add tooltip on buttons
        // TODO allow tooltip on disabled buttons : https://stackoverflow.com/a/19938049/2000654
        $('.menu-content button, .menu-content .selectiontool-export, .selection-geom-operator', this).tooltip({
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
                render(mainTemplate(), this);
            },
            ['selectionTool.newAddRemoveSelected', 'selectionTool.allFeatureTypeSelected', 'selection.changed', 'filteredFeatures.changed', 'selection.bufferValue']
        );
    }

    disconnectedCallback() {
    }
}
