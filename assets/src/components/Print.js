import { mainLizmap } from '../modules/Globals.js';
import {html, render} from 'lit-html';

export default class Print extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        const template = () => html`
            <table id="print-parameters" class="table table-condensed">
                <tr>
                    <td>${lizDict['print.toolbar.template']}</td>
                    <td>${lizDict['print.toolbar.scale']}</td>
                    <td>${lizDict['print.toolbar.dpi']}</td>
                </tr>
                <tr>
                    <td><select id="print-template" class="btn-print-templates"></select></td>
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
            <div class="print-labels">
                <input type="text" class="print-label"><br>
                <textarea class="print-label"></textarea>
            </div>
            <div class="flex">
                <select id="print-format" title="${lizDict['print.toolbar.format']}" class="btn-print-format">
                    <option value="pdf">PDF</option>
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                </select>
                <button id="print-launch" class="btn-print-launch btn btn-primary flex-grow-1"><span class="icon"></span>&nbsp;${lizDict['print.toolbar.title']}</button>
            </div>`;

        render(template(), this);

    }

    disconnectedCallback() {

    }

}

window.customElements.define('lizmap-print', Print);