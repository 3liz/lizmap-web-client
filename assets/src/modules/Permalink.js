import { mainLizmap } from '../modules/Globals.js';
import {transformExtent} from 'ol/proj.js';

export default class Permalink {

    constructor() {

        // Change `checked`, `style` states based on URL fragment
        if (window.location.hash) {
            const items = mainLizmap.state.layersAndGroupsCollection.layers.concat(mainLizmap.state.layersAndGroupsCollection.groups);
            const URLParts = window.location.hash.substring(1).split('|');
            const [, itemsInURL, stylesInURL, opacitiesInURL] = URLParts.map(part => part.split(','));

            // There is only one filter at once currently
            const filterInURL = URLParts[4];
            let filterWmsName, filterExpression;
            if (filterInURL) {
                [filterWmsName, filterExpression] = filterInURL.split(':');
            }

            for (const item of items){
                if (itemsInURL && itemsInURL.includes(encodeURIComponent(item.name))) {
                    const itemIndex = itemsInURL.indexOf(encodeURIComponent(item.name));
                    item.checked = true;
                    if (item.type === 'layer') {
                        item.wmsSelectedStyleName = decodeURIComponent(stylesInURL[itemIndex]);

                        if (filterInURL && filterWmsName === item.wmsName) {
                            item.expressionFilter = decodeURIComponent(filterExpression);
                        }
                    }
                    item.opacity = parseFloat(opacitiesInURL[itemIndex]);
                } else {
                    item.checked = false;
                }
            }
        }

        // Refresh bbox parameter on moveend
        lizMap.map.events.on({
            moveend: () => {
                this._writeURLFragment();
            }
        });

        mainLizmap.state.rootMapGroup.addListener(
            () => this._writeURLFragment(),
            ['layer.visibility.changed', 'group.visibility.changed', 'layer.style.changed', 'group.style.changed', 'layer.opacity.changed', 'group.opacity.changed', 'layer.filter.changed']
        );
    }

    _writeURLFragment() {
        let hash = '';

        // BBOX
        let bbox = lizMap.map.getExtent().toArray();
        if (lizMap.map.projection.projCode !== 'EPSG:4326') {
            bbox = transformExtent(
                bbox,
                lizMap.map.projection.projCode,
                'EPSG:4326'
            );
        }
        hash = bbox.join();

        // Item's visibility, style and opacity + single filter if any
        // Only write layer's properties when visible
        let itemsVisibility = [];
        let itemsStyle = [];
        let itemsOpacity = [];
        let itemFilter;

        for (const item of lizMap.mainLizmap.state.rootMapGroup.findMapLayersAndGroups()) {
            if (item.checked){
                itemsVisibility.push(item.name);
                itemsStyle.push(item.wmsSelectedStyleName);
                itemsOpacity.push(item.opacity);
                if (item.itemState.expressionFilter) {
                    itemFilter = item.wmsName + ':' + item.itemState.expressionFilter;
                }
            }
        }

        if (itemsVisibility.length) {
            hash += '|' + itemsVisibility.join();
        }

        if (itemsStyle.length) {
            hash += '|' + itemsStyle.join();
        }

        if (itemsOpacity.length) {
            hash += '|' + itemsOpacity.join();
        }

        if (itemFilter) {
            hash += '|' + itemFilter;
        }

        // Finally override URL fragment
        window.location.hash = hash;
    }
};
