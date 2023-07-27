import { mainLizmap } from '../modules/Globals.js';
import olOverviewMap from 'ol/control/OverviewMap.js';

import ImageWMS from 'ol/source/ImageWMS.js';
import { Image as ImageLayer } from 'ol/layer.js';
import View from 'ol/View.js';

export default class OverviewMap extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        let overviewInCfg = mainLizmap.state.layersAndGroupsCollection.groups
            .find(group => group.name.toLowerCase() === 'overview' && group.level === 1);

        if (!overviewInCfg) {
            return;
        }

        const overviewLayer = new ImageLayer({
            source: new ImageWMS({
                url: mainLizmap.serviceURL,
                params: {
                    LAYERS: overviewInCfg.wmsName
                },
                ratio: 1.1,
                serverType: 'qgis',
            }),
        });

        // TODO : 'view/embed' can be not present in URL because of URL rewriting
        // => needs better way to detect we're in embed context
        this._isCollapsedAtInit = lizMap.checkMobile() || document.URL.includes('view/embed');

        const hasDynamicView = mainLizmap.config.options?.fixed_scale_overview_map === false;

        this._olOverviewMap = new olOverviewMap({
            layers: [overviewLayer],
            collapsed: this._isCollapsedAtInit,
            target: this,
            tipLabel: lizDict['overviewbar.displayoverview.hover'],
            collapseLabel: '\u00BB',
            label: '\u00AB',
            view: hasDynamicView ? undefined : new View({
                resolutions: [mainLizmap.map.getView().getResolutionForExtent(mainLizmap.config.options.initialExtent, [220, 100])],
                projection: mainLizmap.projection === 'EPSG:900913' ? 'EPSG:3857' : mainLizmap.projection
            })
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
