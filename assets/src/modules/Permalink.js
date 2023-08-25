import { mainLizmap } from '../modules/Globals.js';
import {transformExtent} from 'ol/proj.js';

export default class Permalink {

    constructor() {

        // Change states based on URL fragment
        if (window.location.hash) {
            for (const keyValue of window.location.hash.substring(1).split('|')) {
                const [key, value] = keyValue.split('=');
                if (key === 'item') {
                    const itemsInURL = value.split(',');
                    const items = mainLizmap.state.layersAndGroupsCollection.layers.concat(mainLizmap.state.layersAndGroupsCollection.groups)
                    for (const item of items){
                        item.checked = itemsInURL.includes(encodeURIComponent(item.name));
                    }
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
            ['layer.visibility.changed', 'group.visibility.changed']
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
        hash = 'bbox=' + bbox.join();

        // Item's visibility
        // Only write layer's name when visible
        hash += '|item='
        let visibleItems = [];

        for (const item of lizMap.mainLizmap.state.rootMapGroup.findMapLayersAndGroups()) {
            if (item.checked){
                visibleItems.push(item.name);
            }
        }

        if (visibleItems.length) {
            hash += visibleItems.join();
        }

        // Finally override URL fragment
        window.location.hash = hash;
    }
};
