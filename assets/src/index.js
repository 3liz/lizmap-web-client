import Geolocation from './components/Geolocation.js';
import GeolocationSurvey from './components/GeolocationSurvey.js';
import SelectionTool from './components/SelectionTool.js';
import SelectionInvert from './components/SelectionInvert.js';
import Snapping from './components/Snapping.js';
import {mainLizmap, mainEventDispatcher} from './modules/Globals.js';

lizMap.events.on({
    uicreated: () => {
        window.customElements.define('lizmap-geolocation', Geolocation);
        window.customElements.define('lizmap-geolocation-survey', GeolocationSurvey);
        window.customElements.define('lizmap-selection-tool', SelectionTool);
        window.customElements.define('lizmap-selection-invert', SelectionInvert);
        window.customElements.define('lizmap-snapping', Snapping);
        lizMap.mainLizmap = mainLizmap;
        lizMap.mainEventDispatcher = mainEventDispatcher;
    }
});
