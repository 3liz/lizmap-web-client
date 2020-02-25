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
                    <button class="btn-selectiontool-clear btn btn-mini btn-error btn-link" title="${lizDict['toolbar.content.stop']}">×</button>
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
                            <select id="selectiontool-layer-list">
                                ${mainLizmap.selectionTool.layers.map((layer) => html`<option value="${layer.name}">${layer.title}</option>`)}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div id="selectiontool-query-buttons" class="btn-group" data-toggle="buttons-radio">
                                <button id="selectiontool-query-deactivate" class="btn btn-small" data-original-title="${lizDict['selectiontool.toolbar.query.deactivate']}">
                                    <i class="icon-none qgis_sprite mIconDeselected"></i>
                                </button>
                                <button id="selectiontool-query-box" class="btn btn-small" data-original-title="${lizDict['selectiontool.toolbar.query.box']}">
                                    <i class="icon-none qgis_sprite mActionSelectRectangle"></i>
                                </button>
                                <button id="selectiontool-query-circle" class="btn btn-small" data-original-title="${lizDict['selectiontool.toolbar.query.circle']}">
                                    <i class="icon-none qgis_sprite mActionSelectRadius"></i>
                                </button>
                                <button id="selectiontool-query-polygon" class="btn btn-small" data-original-title="${lizDict['selectiontool.toolbar.query.polygon']}">
                                    <i class="icon-none qgis_sprite mActionSelectPolygon"></i>
                                </button>
                                <button id="selectiontool-query-freehand" class="btn btn-small" data-original-title="${lizDict['selectiontool.toolbar.query.freehand']}">
                                    <i class="icon-none qgis_sprite mActionSelectFreehand"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span id="selectiontool-results">${lizDict['selectiontool.results.none']}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div id="selectiontool-actions">
                                <div id="selectiontool-type-buttons" class="btn-group" data-toggle="buttons-radio">
                                    <button id="selectiontool-type-refresh" class="btn btn-mini active" title="" data-original-title="${lizDict['selectiontool.toolbar.action.type.refresh']}" value="refresh">
                                        <i class="icon-refresh"></i>
                                    </button>
                                    <button id="selectiontool-type-plus" class="btn btn-mini" title="" data-original-title="${lizDict['selectiontool.toolbar.action.type.plus']}" value="plus">
                                        <i class="icon-plus"></i>
                                    </button>
                                    <button id="selectiontool-type-minus" class="btn btn-mini" title="" data-original-title="${lizDict['selectiontool.toolbar.action.type.minus']}" value="minus">
                                        <i class="icon-minus"></i>
                                    </button>
                                </div>
                                <button id="selectiontool-unselect" class="btn btn-mini disabled" title="" data-original-title="${lizDict['selectiontool.toolbar.action.unselect']}">
                                    <i class="icon-star-empty"></i>
                                </button>
                                <button id="selectiontool-filter" class="btn btn-mini disabled" title="" data-original-title="${lizDict['selectiontool.toolbar.action.filter']}">
                                    <i class="icon-filter"></i>
                                </button>
                                <!-- {if $layerExport} -->
                                <div class="btn-group dropup" role="group" >
                                    <button id="selectiontool-export" type="button" class="btn btn-mini dropdown-toggle disabled" data-toggle="dropdown" aria-expanded="false" title="${lizDict['switcher.layer.export.title']}">
                                        ${lizDict['switcher.layer.export.title']}
                                    <span class="caret"></span>
                                    </button>
                                    <ul id="selectiontool-export-formats" class="dropdown-menu dropdown-menu-right" role="menu">
                                        <li><a href="#" class="btn-export-selection">GeoJSON</a></li>
                                        <li><a href="#" class="btn-export-selection">GML</a></li>
                                        ${mainLizmap.selectionTool.exportFormats.map((format) => html`<li><a href="#" class="btn-export-selection">${format.tagName}</a></li>`)}
                                    </ul>
                                </div>
                                <!-- {/if} -->
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>`;

        render(mainTemplate(), this);
    }

    disconnectedCallback() {
    }
}
