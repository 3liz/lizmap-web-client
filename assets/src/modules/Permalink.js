import { mainLizmap } from '../modules/Globals.js';
import {transformExtent} from 'ol/proj.js';

export default class Permalink {

    constructor() {

        // Change `checked`, `style` states based on URL fragment
        if (window.location.hash) {
            const items = mainLizmap.state.layersAndGroupsCollection.layers.concat(mainLizmap.state.layersAndGroupsCollection.groups);
            const [, itemsInURL, stylesInURL] = window.location.hash.substring(1).split('|').map(part => part.split(','));
            for (const item of items){
                if(itemsInURL.includes(encodeURIComponent(item.name))){
                    item.checked = true;
                    if(item.type === 'layer'){
                        const styleIndex = itemsInURL.indexOf(encodeURIComponent(item.name));
                        item.wmsSelectedStyleName = decodeURIComponent(stylesInURL[styleIndex]);
                    }
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
            ['layer.visibility.changed', 'group.visibility.changed', 'layer.style.changed', 'group.style.changed']
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

        // Item's visibility
        // Only write layer's name when visible
        let visibleItems = [];
        let styleItems = [];

        for (const item of lizMap.mainLizmap.state.rootMapGroup.findMapLayersAndGroups()) {
            if (item.checked){
                visibleItems.push(item.name);
                styleItems.push(item.wmsSelectedStyleName);
            }
        }

        if (visibleItems.length) {
            hash += '|' + visibleItems.join();
        }

        if (styleItems.length) {
            hash += '|' + styleItems.join();
        }

        // Finally override URL fragment
        window.location.hash = hash;
    }
};
