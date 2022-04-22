import { mainLizmap } from '../modules/Globals.js';

import GoogleLayer from 'olgm/layer/Google.js';
import {defaults} from 'olgm/interaction.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import olMap from 'ol/Map';
import View from 'ol/View';

export default class GoogleMap extends olMap {

    constructor() {
        if(!Object.keys(lizMap.config.options).some( option => option.startsWith('google'))){
            super();
            return;
        }

        const googleLayerMapping = {
            googleStreets: 'ROADMAP',
            googleSatellite: 'SATELLITE',
            googleHybrid: 'HYBRID',
            googleTerrain: 'TERRAIN'
        }

        const googleLayers = [];

        for (const key in googleLayerMapping) {
            if(lizMap.config.options?.[key]){
                googleLayers.push(new GoogleLayer({
                    mapTypeId: google.maps.MapTypeId[googleLayerMapping[key]]
                  })
                );
            }
        }

        super({
            controls: [], // disable default controls
            // use OL3-Google-Maps recommended default interactions
            interactions: defaults(),
            layers: googleLayers,
            target: 'googleMap',
            view: new View({
              resolutions: mainLizmap.lizmap3.map.resolutions
            })
          });

        var olGM = new OLGoogleMaps({map: this}); // map is the ol.Map instance
        olGM.activate();

        this.getView().animate({
            center: mainLizmap.center,
            zoom: mainLizmap.lizmap3.map.getZoom(),
            duration: 0
        });

        mainLizmap.lizmap3.map.events.on({
            move: () => {
                this.getView().animate({
                    center: mainLizmap.center,
                    zoom: mainLizmap.lizmap3.map.getZoom(),
                    duration: 0
                });
            }
        });
    }   
}
