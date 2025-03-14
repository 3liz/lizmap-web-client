/**
 * @module components/AttributeTable.js
 * @name AttributeTable
 * @copyright 2025 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { html, render } from 'lit-html';
import DataTable from 'datatables.net-dt';

/**
 * @class
 * @name AttributeTable
 * @augments HTMLElement
 */
export default class AttributeTable extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this._template = () =>
            html`<table></table>`;

        render(this._template(), this);

        this.layerId = this.getAttribute('layerId');

        const datatablesUrl = globalThis['lizUrls'].wms.replace('service', 'datatables');
        const params = globalThis['lizUrls'].params;
        params['layerId'] = this.layerId;
        new DataTable(this.querySelector('table'), {
            serverSide: true,
            ajax: datatablesUrl + '?' + new URLSearchParams(params).toString(),
            columns: [
                // { data: 'libquart', title: 'test' },
                // { data: 'photo' },
                // { data: 'quartier' },
                // { data: 'quartmno' },
                // { data: 'thumbnail' },
                // { data: 'url' }
            ],
        });
    }

    disconnectedCallback() {
    }
}
