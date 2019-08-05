import LizmapMapElement from './components/LizmapMapElement.js';
import LizmapBaseLayersElement from './components/LizmapBaseLayersElement.js';
import { LizmapMapManager, MainEventDispatcher } from "./modules/LizmapGlobals";


window.customElements.define('lizmap-map', LizmapMapElement);
window.customElements.define('lizmap-baselayers', LizmapBaseLayersElement);

window.addEventListener('load', function (event) {

    LizmapMapManager.createMap('mainmap', lizUrls.config, lizUrls.params.repository, lizUrls.params.project);

}, false);

/**
 * Object that export API for external scripts.
 */
const main = {
    manager: LizmapMapManager,
    dispatcher: MainEventDispatcher
};

export { main as default };
