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
            })];

        this._olOverviewMap = new olOverviewMap({
            layers: layers,
            collapsed: false,
            target: this,
            tipLabel: lizDict['overviewbar.displayoverview.hover'],
            collapseLabel: '\u00BB',
            label: '\u00AB',
        });
        
        mainLizmap.map._olMap.addControl(
            this._olOverviewMap
        );

    }

    disconnectedCallback() {
        mainLizmap.map._olMap.removeControl(
            this._olOverviewMap
        );
    }
}
