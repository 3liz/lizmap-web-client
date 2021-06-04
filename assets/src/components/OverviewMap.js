import { mainLizmap } from '../modules/Globals.js';
import olOverviewMap from 'ol/control/OverviewMap';

import ImageWMS from 'ol/source/ImageWMS';
import { Image as ImageLayer } from 'ol/layer';

export default class OverviewMap extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        var layers = [
            new ImageLayer({
                source: new ImageWMS({
                    url: mainLizmap.serviceURL,
                    params: { 'LAYERS': 'Overview' },
                    ratio: 1,
                    serverType: 'qgis',
                }),
            })
        ];

        // TODO : 'view/embed' can be not present in URL because of URL rewriting
        // => needs better way to detect we're in embed context
        this._isCollapsedAtInit = lizMap.checkMobile() || document.URL.includes('view/embed');

        this._olOverviewMap = new olOverviewMap({
            layers: layers,
            collapsed: this._isCollapsedAtInit,
            target: this,
            tipLabel: lizDict['overviewbar.displayoverview.hover'],
            collapseLabel: '\u00BB',
            label: '\u00AB',
        });
        
        mainLizmap.map.addControl(
            this._olOverviewMap
        );

    }

    disconnectedCallback() {
        mainLizmap.map.removeControl(
            this._olOverviewMap
        );
    }
}
