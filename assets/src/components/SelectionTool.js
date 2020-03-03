import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

export default class SelectionTool extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        const mainTemplate = () => html`
        <div class="selectiontool">
            <h3>
                <span class="title">
                    <button class="btn-selectiontool-clear btn btn-mini btn-error btn-link" @click=${() => mainLizmap.selectionTool.disable()} title="${lizDict['toolbar.content.stop']}">×</button>
                    <span class="icon-star icon-white"></span>
                    <span class="text">&nbsp;${lizDict['selectiontool.toolbar.title']}&nbsp;</span>
                </span>
            </h3>
            <div class="menu-content">
                <table>
                    <tr>
                        <td>${lizDict['selectiontool.toolbar.layer']}</td>
                    </tr>
                    <tr>
                        <td>
                            <select class="selectiontool-layer-list" @change=${ (event) => mainLizmap.selectionTool.featureTypeSelected = event.target.value}>
                                ${mainLizmap.selectionTool.layers.map((layer) => html`<option value="${layer.name}">${layer.title}</option>`)}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="selectiontool-query-buttons btn-group">
                                <button id="selectiontool-query-deactivate" class="btn btn-small ${mainLizmap.selectionTool.toolSelected === "deactivate" ? 'active' : ''}" @click=${() => mainLizmap.selectionTool.toolSelected = "deactivate"} data-original-title="${lizDict['selectiontool.toolbar.query.deactivate']}">
                                    <i class="icon-none qgis_sprite mIconDeselected"></i>
                                </button>
                                <button id="selectiontool-query-box" class="btn btn-small ${mainLizmap.selectionTool.toolSelected === "box" ? 'active' : ''}" @click=${() => mainLizmap.selectionTool.toolSelected = "box"} data-original-title="${lizDict['selectiontool.toolbar.query.box']}">
                                    <i class="icon-none qgis_sprite mActionSelectRectangle"></i>
                                </button>
                                <button id="selectiontool-query-circle" class="btn btn-small ${mainLizmap.selectionTool.toolSelected === "circle" ? 'active' : ''}" @click=${() => mainLizmap.selectionTool.toolSelected = "circle"} data-original-title="${lizDict['selectiontool.toolbar.query.circle']}">
                                    <i class="icon-none qgis_sprite mActionSelectRadius"></i>
                                </button>
                                <button id="selectiontool-query-polygon" class="btn btn-small ${mainLizmap.selectionTool.toolSelected === "polygon" ? 'active' : ''}" @click=${() => mainLizmap.selectionTool.toolSelected = "polygon"} data-original-title="${lizDict['selectiontool.toolbar.query.polygon']}">
                                    <i class="icon-none qgis_sprite mActionSelectPolygon"></i>
                                </button>
                                <button id="selectiontool-query-freehand" class="btn btn-small ${mainLizmap.selectionTool.toolSelected === "freehand" ? 'active' : ''}" @click=${() => mainLizmap.selectionTool.toolSelected = "freehand"} data-original-title="${lizDict['selectiontool.toolbar.query.freehand']}">
                                    <i class="icon-none qgis_sprite mActionSelectFreehand"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span id="selectiontool-results">${mainLizmap.selectionTool.selectedFeaturesCount > 1 ? lizDict['selectiontool.results.more'].replace('%s', mainLizmap.selectionTool.selectedFeaturesCount) : mainLizmap.selectionTool.selectedFeaturesCount === 1 ? lizDict['selectiontool.results.one'] : lizDict['selectiontool.results.none']}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="selectiontool-actions">
                                <div id="selectiontool-type-buttons" class="btn-group" data-toggle="buttons-radio">
                                    <button id="selectiontool-type-refresh" class="btn btn-mini active"  data-original-title="${lizDict['selectiontool.toolbar.action.type.refresh']}" value="refresh">
                                        <i class="icon-refresh"></i>
                                    </button>
                                    <button id="selectiontool-type-plus" class="btn btn-mini"  data-original-title="${lizDict['selectiontool.toolbar.action.type.plus']}" value="plus">
                                        <i class="icon-plus"></i>
                                    </button>
                                    <button id="selectiontool-type-minus" class="btn btn-mini"  data-original-title="${lizDict['selectiontool.toolbar.action.type.minus']}" value="minus">
                                        <i class="icon-minus"></i>
                                    </button>
                                </div>
                                <button class="selectiontool-unselect btn btn-mini" ?disabled=${mainLizmap.selectionTool.selectedFeaturesCount === 0} @click=${ () => mainLizmap.selectionTool.unselect()}  data-original-title="${lizDict['selectiontool.toolbar.action.unselect']}">
                                    <i class="icon-star-empty"></i>
                                </button>
                                <button class="selectiontool-filter btn btn-mini ${mainLizmap.selectionTool.filteredFeaturesCount !== 0 ? 'active' : ''}" ?disabled=${mainLizmap.selectionTool.filteredFeaturesCount === 0} @click=${ () => mainLizmap.selectionTool.filter()}  data-original-title="${lizDict['selectiontool.toolbar.action.filter']}">
                                    <i class="icon-filter"></i>
                                </button>
                                ${this.hasAttribute('layer-export') ?
                                    html`
                                        <div class="btn-group dropup" role="group" >
                                        <button id="selectiontool-export" type="button" class="btn btn-mini dropdown-toggle" ?disabled=${mainLizmap.selectionTool.selectedFeaturesCount === 0} data-toggle="dropdown" aria-expanded="false" title="${lizDict['switcher.layer.export.title']}">
                                            ${lizDict['switcher.layer.export.title']}
                                        <span class="caret"></span>
                                        </button>
                                        <ul class="selectiontool-export-formats dropdown-menu dropdown-menu-right" role="menu">
                                            <li><a href="#" class="btn-export-selection">GeoJSON</a></li>
                                            <li><a href="#" class="btn-export-selection">GML</a></li>
                                            ${mainLizmap.selectionTool.exportFormats.map((format) => html`<li><a href="#" class="btn-export-selection">${format.tagName}</a></li>`)}
                                        </ul>
                                    </div>`:''
                                }
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>`;

        render(mainTemplate(), this);

        // Add tooltip on buttons
        // TODO allow tooltip on disabled buttons : https://stackoverflow.com/a/19938049/2000654
        $(".menu-content button", this).tooltip({
            placement: 'top'
        });

        // Export
        $('.selectiontool-export-formats a.btn-export-selection', this).click(function () {
            mainLizmap.selectionTool.export($(this).text());
        });

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            ['selectionTool.toolSelected', 'selectionTool.featureTypeSelected', 'selectionTool.selectionChanged', 'selectionTool.filteredFeaturesChanged']
        );
    }

    disconnectedCallback() {
    }
}
