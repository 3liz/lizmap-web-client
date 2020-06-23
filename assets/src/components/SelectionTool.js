import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import {html, render} from 'lit-html';
import '../images/svg/mActionSelectPoint.svg';
import '../images/svg/mActionSelectLine.svg';

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
                        <optgroup label="Single layers">
                            ${mainLizmap.selectionTool.layers.map((layer) => html`<option value="${layer.name}">${layer.title}</option>`)}
                        </optgroup>
                        <optgroup label="Multiple layers">
                            <option value="selectable-visible-layers">Selectable and visible layers</option>
                            <option selected value="selectable-layers">Selectable layers</option>
                        </optgroup>
                    </select>
                </div>
                <lizmap-digitizing></lizmap-digitizing>
                <div>
                    <select class="selection-geom-operator" @change=${ (event) => mainLizmap.selectionTool.geomOperator = event.target.value} data-original-title="${lizDict['selectiontool.toolbar.geomOperator']}">
                        <option value="intersects">Interects</option>
                        <option value="within">Within</option>
                        <option value="overlaps">Overlaps</option>
                        <option value="contains">Contains</option>
                        <option value="crosses">Crosses</option>
                        <option value="disjoint">Disjoint</option>
                        <option value="touches">Touches</option>
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
                    ${this.hasAttribute('layer-export') ?
                        html`
                            <div class="btn-group dropup" role="group" >
                            <button type="button" class="selectiontool-export btn btn-mini dropdown-toggle" ?disabled=${mainLizmap.selectionTool.selectedFeaturesCount === 0} data-toggle="dropdown" aria-expanded="false" title="${lizDict['switcher.layer.export.title']}">
                                ${lizDict['switcher.layer.export.title']}
                            <span class="caret"></span>
                            </button>
                            <ul class="selectiontool-export-formats dropdown-menu dropdown-menu-right" role="menu">
                                <li><a href="#" class="btn-export-selection">GeoJSON</a></li>
                                <li><a href="#" class="btn-export-selection">GML</a></li>
                                ${mainLizmap.selectionTool.exportFormats.map((format) => html`<li><a href="#" class="btn-export-selection">${format.tagName}</a></li>`)}
                            </ul>
                        </div>` : ''
                    }
                </div>
            </div>
        </div>`;

        render(mainTemplate(), this);

        // Add tooltip on buttons
        // TODO allow tooltip on disabled buttons : https://stackoverflow.com/a/19938049/2000654
        $('.menu-content button, .selection-geom-operator', this).tooltip({
            placement: 'top'
        });

        // Export
        $('.selectiontool-export-formats a.btn-export-selection', this).click(function() {
            mainLizmap.selectionTool.export($(this).text());
        });

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            ['selectionTool.newAddRemoveSelected', 'selectionTool.allFeatureTypeSelected', 'selectionTool.selectionChanged', 'selectionTool.filteredFeaturesChanged', 'selectionTool.toogleSelectionLayerVisibility']
        );
    }

    disconnectedCallback() {
    }
}
