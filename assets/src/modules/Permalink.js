import { mainLizmap } from '../modules/Globals.js';
import {transformExtent} from 'ol/proj.js';

export default class Permalink {

    constructor() {

        // Change `checked`, `style` states based on URL fragment
        if (window.location.hash) {
            const items = mainLizmap.state.layersAndGroupsCollection.layers.concat(mainLizmap.state.layersAndGroupsCollection.groups);
            const [, itemsInURL, stylesInURL, opacitiesInURL] = window.location.hash.substring(1).split('|').map(part => part.split(','));
            for (const item of items){
                if(itemsInURL.includes(encodeURIComponent(item.name))){
                    const itemIndex = itemsInURL.indexOf(encodeURIComponent(item.name));
                    item.checked = true;
                    if(item.type === 'layer'){
                        item.wmsSelectedStyleName = decodeURIComponent(stylesInURL[itemIndex]);
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
            ['layer.visibility.changed', 'group.visibility.changed', 'layer.style.changed', 'group.style.changed', 'layer.opacity.changed', 'group.opacity.changed']
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

        // Item's visibility, style and opacity
        // Only write layer's properties when visible
        let itemsVisibility = [];
        let itemsStyle = [];
        let itemsOpacity = [];

        for (const item of lizMap.mainLizmap.state.rootMapGroup.findMapLayersAndGroups()) {
            if (item.checked){
                itemsVisibility.push(item.name);
                itemsStyle.push(item.wmsSelectedStyleName);
                itemsOpacity.push(item.opacity);
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

        // Finally override URL fragment
        window.location.hash = hash;
    }
};
