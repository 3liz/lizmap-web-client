import Geolocation from './components/Geolocation.js';
import GeolocationSurvey from './components/GeolocationSurvey.js';
import {mainLizmap, mainEventDispatcher} from './modules/Globals.js';

lizMap.events.on({
    uicreated: () => {
        window.customElements.define('lizmap-geolocation', Geolocation);
        window.customElements.define('lizmap-geolocation-survey', GeolocationSurvey);
        lizMap.mainLizmap = mainLizmap;
        lizMap.mainEventDispatcher = mainEventDispatcher;
    }
});
