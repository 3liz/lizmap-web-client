/**
 * @module components/Print.js
 * @name Print
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */
import { mainLizmap } from '../modules/Globals.js';
import { ADJUSTED_DPI } from '../utils/Constants.js';
import { html, render } from 'lit-html';
import { keyed } from 'lit-html/directives/keyed.js';

import MaskLayer from '../modules/Mask.js';
import { Utils } from '../modules/Utils.js';

import WKT from 'ol/format/WKT.js';
import { transformExtent, get as getProjection } from 'ol/proj.js';

const INCHES_PER_METER = 39.37;
const DOTS_PER_INCH = 72;

/**
 * @class
 * @name Print
 * @augments HTMLElement
 */
export default class Print extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        document.querySelector('.btn-print-clear').addEventListener('click',
            () => document.querySelector('#button-print').click()
        );

        this._onChangeResolution = () => {
            this._updateScaleFromResolution();
            render(this._template(), this);
        };

        lizMap.events.on({
            minidockopened: (e) => {
                if ( e.id == 'print' ) {
                    this._projectionUnit = getProjection(mainLizmap.qgisProjectProjection).getUnits();

                    if (this._projectionUnit === 'degrees') {
                        this._projectionUnit = '°';
                    }

                    // Lizmap >= 3.7
                    const layouts = mainLizmap.config?.layouts;
                    this._layouts = [];

                    this._printTemplates = [];

                    // Filtering printTemplates by atlas enabled
                    // and since 3.7 by layout enabled
                    mainLizmap.config?.printTemplates.map((template, index) => {
                        if (template?.atlas?.enabled === '0' || template?.atlas?.enabled === false){
                            // Lizmap >= 3.7
                            if (layouts?.list) {
                                if(layouts.list?.[index]?.enabled){
                                    this._layouts.push(layouts.list[index]);
                                    this._printTemplates.push(template);
                                }
                                // Lizmap < 3.7
                            } else {
                                this._printTemplates.push(template);
                            }
                        }
                    });

                    const dpi = ADJUSTED_DPI;
                    const inchesPerMeter = 1000 / 25.4;
                    this._printScales = mainLizmap.map.getView().getResolutions().map((r) => {return Math.round(r * inchesPerMeter * dpi);})
                    this._printScale = this._printScales[0];

                    //this._printScales = Array.from(mainLizmap.config.options.mapScales);
                    //this._printScales.reverse();
                    //this._printScale = 50000;

                    this._updateScaleFromResolution();

                    this._mainMapID = 'map0';
                    this._overviewMapId;

                    this._maskWidth = 0;
                    this._maskHeight = 0;

                    this.printTemplate = 0;
                    this._printFormat = this.defaultFormat;
                    this._printDPI = this.defaultDPI;

                    // Create a mask layer to display the extent for the main map
                    this._maskLayer = new MaskLayer();
                    this._maskLayer.getSize = () => [this._maskWidth, this._maskHeight];
                    this._maskLayer.getScale = () => {
                        return this._printScale
                    };

                    mainLizmap.map.addToolLayer(this._maskLayer);
                    this._maskLayer.setProperties({
                        name: 'LizmapPrintMaskLayer'
                    });

                    mainLizmap.map.getView().on('change:resolution', this._onChangeResolution);

                    render(this._template(), this);
                } else {
                    mainLizmap.map.removeToolLayer(this._maskLayer);
                    mainLizmap.map.getView().un('change:resolution', this._onChangeResolution);
                }
            },
            minidockclosed: (e) => {
                if ( e.id == 'print' ) {
                    mainLizmap.map.removeToolLayer(this._maskLayer);
                    mainLizmap.map.getView().un('change:resolution', this._onChangeResolution);
                }
            }
        });
    }

    disconnectedCallback() {}

    _template() {
        return html`
            <table id="print-parameters" class="table table-condensed">
                <tr>
                    <td>${lizDict['print.toolbar.layout']}</td>
                    <td>${lizDict['print.toolbar.scale']}</td>
                </tr>
                <tr>
                    <td>
                        <select id="print-template" @change=${(event) => { this.printTemplate = event.target.value }}>
                            ${this._printTemplates.map((template, index) => html`<option value=${index}>${template.title}</option>`)}
                        </select>
                    </td>
                    <td>
                        <select id="print-scale" class="btn-print-scales" .value=${this._printScale} @change=${(event) => { this.printScale = parseInt(event.target.value) }}>
                            ${this._printScales.map( scale => html`<option .selected=${scale === this._printScale} value=${scale}>${scale.toLocaleString()}</option>`)}
                        </select>
                    </td>
                </tr>
            </table>
            ${this._printTemplates?.[this.printTemplate]?.labels?.length
                ? html`
                <div class="print-labels">
                    <p>${lizDict['print.labels']}</p>

                    ${this._printTemplates[this.printTemplate].labels.slice().reverse().map((label) =>
                    label?.htmlState ?
                        html`<textarea name=${label.id} class="print-label" placeholder=${label.text} .value=${label.text}></textarea><br>`
                        : html`<input  name=${label.id} class="print-label" placeholder=${label.text} value=${label.text} type="text"><br>`
                        )}
                </div>`
            : ''}
            <details class='print-advanced'>
                <summary>${lizDict['print.advanced']}</summary>
                ${this.printDPIs.length > 1 ? keyed(this.defaultDPI, html`
                <div class="print-dpi">
                    <span>${lizDict['print.toolbar.dpi']}</span>
                    <select class="btn-print-dpis" .value=${this.defaultDPI} @change=${(event) => { this._printDPI = event.target.value }}>
                        ${this.printDPIs.map( dpi => html`<option ?selected=${dpi === this.defaultDPI} value=${dpi}>${dpi}</option>`)}
                    </select>
                </div>`) : ''}
                <div class='print-grid'>
                    <span>${lizDict['print.gridIntervals']}</span>
                    <div>
                        <div class="input-append">
                            <input type="number" class="input-small" min="0" placeholder="X" @change=${(event) => { this._gridX = parseInt(event.target.value) }}>
                            <span class="add-on">${this._projectionUnit}</span>
                        </div>
                        <div class="input-append">
                            <input type="number" class="input-small" min="0" placeholder="Y" @change=${(event) => { this._gridY = parseInt(event.target.value) }}>
                            <span class="add-on">${this._projectionUnit}</span>
                        </div>
                    </div>
                </div>
                <div class='print-rotation' style="display:none;">
                    <span>${lizDict['print.rotation']}</span>
                    <div class="input-append">
                        <input type="number" class="input-small" @change=${(event) => { this._rotation = parseInt(event.target.value) }}>
                        <span class="add-on">°</span>
                    </div>
                </div>
            </details>
            <div class="flex">
                ${this.printFormats.length > 1 ? keyed(this.defaultFormat, html`
                <select id="print-format" title="${lizDict['print.toolbar.format']}" class="btn-print-format" .value=${this.defaultFormat} @change=${(event) => { this._printFormat = event.target.value }}>
                    ${this.printFormats.map( format => html`<option ?selected=${format === this.defaultFormat} value="${format}">${format.toUpperCase()}</option>`)}
                </select>`) : ''}
                <button id="print-launch" class="btn-print-launch btn btn-primary flex-grow-1" @click=${() => { this._launch() }}>${lizDict['print.launch']}</button>
            </div>`;
    }

    _updateScaleFromResolution() {
        const mapScale = mainLizmap.map.getView().getResolution() * (1000 / 25.4) * ADJUSTED_DPI;
        for (const printScale of this._printScales) {
            if (mapScale > printScale) {
                this._printScale = printScale;
                return;
            }
        }
    }

    _launch(){
        const center = mainLizmap.map.getView().getCenter();

        const deltaX = (this._maskWidth * this._printScale) / 2 / INCHES_PER_METER / DOTS_PER_INCH;
        const deltaY = (this._maskHeight * this._printScale) / 2 / INCHES_PER_METER / DOTS_PER_INCH;
        let extent = [center[0] - deltaX, center[1] - deltaY, center[0] + deltaX, center[1] + deltaY];
        const mapProjection = mainLizmap.config.options.projection.ref;
        const projectProjection = mainLizmap.config.options.qgisProjectProjection.ref ? mainLizmap.config.options.qgisProjectProjection.ref : mapProjection;

        if(projectProjection != mapProjection){
            extent = transformExtent(extent, mapProjection, projectProjection);
        }

        const wmsParams = {
            SERVICE: 'WMS',
            REQUEST: 'GetPrint',
            VERSION: '1.3.0',
            FORMAT: this._printFormat,
            TRANSPARENT: true,
            CRS: projectProjection,
            DPI: this._printDPI,
            TEMPLATE: this._printTemplates[this._printTemplate].title
        };

        wmsParams[this._mainMapID + ':EXTENT'] = extent.join(',');
        wmsParams[this._mainMapID + ':SCALE'] = this._printScale;

        const printLayers = [];
        const styleLayers = [];
        const opacityLayers = [];

        // Add selected base layer if any
        const selectedBaseLayer = lizMap.mainLizmap.state.baseLayers.selectedBaseLayer;
        if (selectedBaseLayer && selectedBaseLayer.hasItemState) {
            printLayers.push(selectedBaseLayer.itemState.wmsName);
            styleLayers.push(selectedBaseLayer.itemState.wmsSelectedStyleName);
            opacityLayers.push(parseInt(255 * selectedBaseLayer.itemState.opacity * selectedBaseLayer.layerConfig.opacity));
        }

        // Add visible layers in defined order
        const orderedVisibleLayers = {};
        mainLizmap.state.rootMapGroup.findMapLayers().forEach(layer => {
            if (layer.visibility) {
                orderedVisibleLayers[layer.layerOrder] = layer;
            }
        });

        // Selection and filter
        const filter = [];
        const selection = [];
        const legendOn = [];
        const legendOff = [];
        for (const layerIndex of Object.keys(orderedVisibleLayers).reverse()) {
            const layer = orderedVisibleLayers[layerIndex];
            const layerWmsParams = layer.wmsParameters;
            // Add layer to the list of printed layers
            printLayers.push(layerWmsParams['LAYERS']);

            // Optionally add layer style if needed (same order as layers )
            styleLayers.push(layerWmsParams['STYLES']);

            // Handle qgis layer opacity otherwise client value override it
            if (layer.layerConfig?.opacity) {
                opacityLayers.push(parseInt(255 * layer.opacity * layer.layerConfig.opacity));
            } else {
                opacityLayers.push(parseInt(255 * layer.opacity));
            }
            if ('FILTERTOKEN' in layerWmsParams) {
                filter.push(layerWmsParams['FILTERTOKEN']);
            }
            if ('SELECTIONTOKEN' in layerWmsParams) {
                selection.push(layerWmsParams['SELECTIONTOKEN']);
            }
            if ('LEGEND_ON' in layerWmsParams) {
                legendOn.push(layerWmsParams['LEGEND_ON']);
            }
            if ('LEGEND_OFF' in layerWmsParams) {
                legendOff.push(layerWmsParams['LEGEND_OFF']);
            }
        }

        wmsParams[this._mainMapID + ':LAYERS'] = printLayers.join(',');
        wmsParams[this._mainMapID + ':STYLES'] = styleLayers.join(',');
        wmsParams[this._mainMapID + ':OPACITIES'] = opacityLayers.join(',');

        if (filter.length) {
            wmsParams.FILTERTOKEN = filter.join(';');
        }
        if (selection.length) {
            wmsParams.SELECTIONTOKEN = selection.join(';');
        }
        if (legendOn.length) {
            wmsParams.LEGEND_ON = legendOn.join(';');
        }
        if (legendOff.length) {
            wmsParams.LEGEND_OFF = legendOff.join(';');
        }

        // If user has made a draw, print it with redlining
        const formatWKT = new WKT();
        const highlightGeom = [];
        const highlightSymbol = [];
        const highlightLabelString = [];
        const highlightLabelSize = [];
        const highlightLabelBufferColor = [];
        const highlightLabelBufferSize = [];
        const highlightLabelRotation = [];

        mainLizmap.digitizing.featureDrawn?.forEach((featureDrawn, index) => {

            // Translate circle coords to WKT
            if (featureDrawn.getGeometry().getType() === 'Circle') {
                const geomReproj = featureDrawn.getGeometry().clone().transform(mainLizmap.projection, projectProjection);
                const center = geomReproj.getCenter();
                const radius = geomReproj.getRadius();

                const circleWKT = `CURVEPOLYGON(CIRCULARSTRING(
                    ${center[0] - radius} ${center[1]},
                    ${center[0]} ${center[1] + radius},
                    ${center[0] + radius} ${center[1]},
                    ${center[0]} ${center[1] - radius},
                    ${center[0] - radius} ${center[1]}))`;

                highlightGeom.push(circleWKT);
            } else {
                highlightGeom.push(formatWKT.writeFeature(featureDrawn, {
                    featureProjection: mainLizmap.projection,
                    dataProjection: projectProjection
                }));
            }

            highlightSymbol.push(mainLizmap.digitizing.getFeatureDrawnSLD(index));

            // Labels
            const label = featureDrawn.get('text') ? featureDrawn.get('text') : ' ';
            highlightLabelString.push(label);
            // Font size is 10px by default (https://github.com/openlayers/openlayers/blob/v8.1.0/src/ol/style/Text.js#L30)
            let scale = featureDrawn.get('scale');
            if (scale) {
                scale = scale * 10;
            }
            highlightLabelSize.push(scale);

            highlightLabelBufferColor.push('#FFFFFF');
            highlightLabelBufferSize.push(1.5);

            highlightLabelRotation.push(featureDrawn.get('rotation'));
        });

        if (highlightGeom.length && highlightSymbol.length) {
            wmsParams[this._mainMapID + ':HIGHLIGHT_GEOM'] = highlightGeom.join(';');
            wmsParams[this._mainMapID + ':HIGHLIGHT_SYMBOL'] = highlightSymbol.join(';');
        }

        if (!highlightLabelString.every(label => label === ' ')){
            wmsParams[this._mainMapID + ':HIGHLIGHT_LABELSTRING'] = highlightLabelString.join(';');
            wmsParams[this._mainMapID + ':HIGHLIGHT_LABELSIZE'] = highlightLabelSize.join(';');
            wmsParams[this._mainMapID + ':HIGHLIGHT_LABELBUFFERCOLOR'] = highlightLabelBufferColor.join(';');
            wmsParams[this._mainMapID + ':HIGHLIGHT_LABELBUFFERSIZE'] = highlightLabelBufferSize.join(';');
            wmsParams[this._mainMapID + ':HIGHLIGHT_LABEL_ROTATION'] = highlightLabelRotation.join(';');
        }

        // Grid
        if(this._gridX){
            wmsParams[this._mainMapID + ':GRID_INTERVAL_X'] = this._gridX;
        }
        if(this._gridY){
            wmsParams[this._mainMapID + ':GRID_INTERVAL_Y'] = this._gridY;
        }

        // Rotation
        if(this._rotation){
            wmsParams[this._mainMapID + ':ROTATION'] = this._rotation;
        }

        // Custom labels
        this.querySelectorAll('.print-label').forEach(label => {
            wmsParams[label.name] = label.value;
        });

        // Overview map
        if (this._overviewMapId) {
            let extent = mainLizmap.config.options.bbox;

            if(projectProjection != mapProjection){
                extent = transformExtent(extent, mapProjection, projectProjection);
            }
            wmsParams[this._overviewMapId + ':EXTENT'] = extent.join(',');
        }

        // Display spinner and message while waiting for print
        const printLaunch = this.querySelector('#print-launch');
        printLaunch.disabled = true;
        printLaunch.classList.add('spinner');

        mainLizmap._lizmap3.addMessage(lizDict['print.started'], 'info', true).addClass('print-in-progress');

        Utils.downloadFile(mainLizmap.serviceURL, wmsParams, () => {
            const printLaunch = this.querySelector('#print-launch');
            printLaunch.disabled = false;
            printLaunch.classList.remove('spinner');

            document.querySelector('#message .print-in-progress button').click();
        }, (errorEvent) => {
            console.error(errorEvent)
            mainLizmap._lizmap3.addMessage(lizDict['print.error'], 'danger', true).addClass('print-error');
        });
    }

    get printTemplate() {
        return this._printTemplate;
    }

    get printFormats() {
        let formats = this._layouts?.[this._printTemplate]?.formats_available;
        const defaultFormat = this._layouts?.[this._printTemplate]?.default_format;

        // Put default format on top
        if (formats && defaultFormat) {
            formats = formats.filter(item => item !== defaultFormat);
            formats.unshift(defaultFormat);
        }

        return formats || ['pdf', 'jpg', 'png', 'svg'];
    }

    get defaultFormat() {
        const defaultFormat = this._layouts?.[this._printTemplate]?.default_format;
        return defaultFormat || 'pdf';
    }

    get printDPIs() {
        let DPIs = this._layouts?.[this._printTemplate]?.dpi_available;
        return DPIs || ['100', '200', '300'];
    }

    get defaultDPI() {
        const defaultDPI = this._layouts?.[this._printTemplate]?.default_dpi;
        return defaultDPI || '100';
    }

    /**
     * Update print template
     * @param {string | number} index - Index of the print template
     */
    set printTemplate(index){
        // No print templates defined do nothing
        if (this._printTemplates.length == 0) {
            return;
        }

        this._printTemplate = index;

        this._printFormat = this.defaultFormat;
        this._printDPI = this.defaultDPI;

        this._mainMapID = 'map0';
        this._overviewMapId = undefined;

        // Get maps id
        // Currently we only support one main map with an optional overview map
        const templateMaps = this._printTemplates[index].maps;
        if(templateMaps.length === 2){
            if(templateMaps[0]?.overviewMap){
                this._mainMapID = templateMaps[1].id;
                this._overviewMapId = templateMaps[0].id;
            }
            if(templateMaps[1]?.overviewMap){
                this._mainMapID = templateMaps[0].id;
                this._overviewMapId = templateMaps[1].id;
            }
        }

        // Change mask size. Only main map mask is shown
        // Width/height are in mm by default. Convert to pixels
        const templateMap = templateMaps.filter(map => map.id == this._mainMapID)?.[0]
        this._maskWidth = templateMap?.width / 1000 * INCHES_PER_METER * DOTS_PER_INCH;
        this._maskHeight = templateMap?.height / 1000 * INCHES_PER_METER * DOTS_PER_INCH;

        mainLizmap.map.getView().changed();

        render(this._template(), this);
    }

    set printScale(scale){
        this._printScale = scale;
        mainLizmap.map.getView().changed();
    }
}
