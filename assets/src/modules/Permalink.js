import { mainLizmap } from '../modules/Globals.js';
import {transformExtent} from 'ol/proj.js';

export default class Permalink {

    constructor() {

        // Refresh bbox parameter on moveend
        lizMap.map.events.on({
            'moveend': () => {
                let bbox = lizMap.map.getExtent().toArray();
                if (lizMap.map.projection.projCode !== 'EPSG:4326') {
                    bbox = transformExtent(
                        bbox,
                        lizMap.map.projection.projCode,
                        'EPSG:4326'
                    );
                }
                window.location.hash = 'bbox=' + bbox.join();
            }
        });

    }
};
