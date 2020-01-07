import Geolocation from './components/Geolocation.js';

lizMap.events.on({
    uicreated: () => {
        window.customElements.define('lizmap-geolocation', Geolocation);
    }
});
