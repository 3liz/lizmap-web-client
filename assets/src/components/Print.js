import { mainLizmap } from '../modules/Globals.js';
import {html, render} from 'lit-html';

import MaskLayer from '../modules/Mask';

export default class Print extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this._printTemplates = mainLizmap.config?.printTemplates?.filter(template => template?.atlas?.enabled === '0');

        this._maskWidth = 0;
        this._maskHeight = 0;

        mainLizmap.newOlMap = true;

        this.printTemplate = 0;

        // Create a mask layer to display the extent for the main map
        this._maskLayer = new MaskLayer();
        this._maskLayer.getSize = () => [this._maskWidth, this._maskHeight];
        this._maskLayer.getScale = (frameState) => 100000;
        mainLizmap.map.addLayer(this._maskLayer);

        render(this._template(), this);

    }

    disconnectedCallback() {

    }

    _template() {
        return html`
            <table id="print-parameters" class="table table-condensed">
                <tr>
                    <td>${lizDict['print.toolbar.template']}</td>
                    <td>${lizDict['print.toolbar.scale']}</td>
                    <td>${lizDict['print.toolbar.dpi']}</td>
                </tr>
                <tr>
                    <td>
                        <select id="print-template" @change=${(event) => { this.printTemplate = event.target.value }}>
                            ${this._printTemplates.map((template, index) => html`<option value="${index}">${template.title}</option>`)}
                        </select>
                    </td>
                    <td><select id="print-scale" class="btn-print-scales"></select></td>
                    <td>
                    <select id="print-dpi" class="btn-print-dpis">
                        <option>100</option>
                        <option>200</option>
                        <option>300</option>
                    </select>
                    </td>
                </tr>
            </table>
            ${this._printTemplates?.[this.printTemplate]?.labels?.length
                ? html`
                    <div class="print-labels">
                        <p>${lizDict['print.labels']}</p>

                        ${this._printTemplates[this.printTemplate].labels.map((label) => 
                        label?.htmlState ?
                            html`<textarea name="${label.id}" class="print-label" placeholder="${label.text}" .value=${label.text}></textarea><br>`
                            : html`<input  name="${label.id}" class="print-label" placeholder="${label.text}" value="${label.text}" type="text"><br>`
                            )}
                    </div>`
                : ''
            }
            <div class="flex">
                <select id="print-format" title="${lizDict['print.toolbar.format']}" class="btn-print-format">
                    <option value="pdf">PDF</option>
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                </select>
                <button id="print-launch" class="btn-print-launch btn btn-primary flex-grow-1"><span class="icon"></span>&nbsp;${lizDict['print.toolbar.title']}</button>
            </div>`;
    }

    get printTemplate() {
        return this._printTemplate;
    }

    /**
     * @param {string | number} index
     */
    set printTemplate(index){

        this._printTemplate = index;

        // Change mask size
        // Width/height are in mm by default. Convert to pixels
        const INCHES_PER_METER = 39.37;
        const DOTS_PER_INCH = 72;

        this._maskWidth = this._printTemplates?.[index]?.maps?.[0]?.width / 1000 * INCHES_PER_METER * DOTS_PER_INCH;
        this._maskHeight = this._printTemplates?.[index]?.maps?.[0]?.height / 1000 * INCHES_PER_METER * DOTS_PER_INCH;

        mainLizmap.map.getView().changed();

        render(this._template(), this);
    }

}