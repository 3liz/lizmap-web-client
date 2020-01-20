import Geolocation from './components/Geolocation.js';
import {mainLizmap, mainEventDispatcher} from './modules/Globals.js';

lizMap.events.on({
    uicreated: () => {
        window.customElements.define('lizmap-geolocation', Geolocation);
        lizMap.mainLizmap = mainLizmap;
        lizMap.mainEventDispatcher = mainEventDispatcher;
    }
});
