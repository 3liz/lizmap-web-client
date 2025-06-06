/**
 * @module index.js
 * @name Index
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import Geolocation from './components/Geolocation.js';
import GeolocationSurvey from './components/GeolocationSurvey.js';
import FeaturesTable from './components/FeaturesTable.js';
import SelectionTool from './components/SelectionTool.js';
import SelectionInvert from './components/SelectionInvert.js';
import Snapping from './components/Snapping.js';
import Scaleline from './components/Scaleline.js';
import MousePosition from './components/MousePosition.js';
import Digitizing from './components/Digitizing.js';
import OverviewMap from './components/OverviewMap.js';
import FeatureToolbar from './components/FeatureToolbar.js';
import ReverseGeom from './components/edition/ReverseGeom.js';
import PasteGeom from './components/edition/PasteGeom.js';
import ActionSelector from './components/ActionSelector.js';
import Print from './components/Print.js';
import FullScreen from './components/FullScreen.js';
import BaseLayers from './components/BaseLayers.js';
import Treeview from './components/Treeview.js';
import NavBar from './components/NavBar.js';
import Tooltip from './components/Tooltip.js';
import Message from './components/Message.js';

import { mainLizmap, mainEventDispatcher } from './modules/Globals.js';
import executeJSFromServer from './modules/ExecuteJSFromServer.js';

import olDep from './dependencies/ol.js';
import litHTMLDep from './dependencies/lit-html.js';
import proj4 from 'proj4';

/**
 *  waitFor function returns waiting time in milliseconds
 * @param {number}   maxWait   - maximum waiting time in milliseconds
 * @param {number}   sleepStep - initial sleep step in milliseconds
 * @param {Function} f         - function to wait for that returns a boolean value
 * @returns {Promise<number>} - waiting time in milliseconds
 * @example
 * const waitingTime = await waitFor(1000, 10, () => document.readyState === 'complete');
 * console.log(`Waiting time: ${waitingTime}ms`);
 */
const waitFor = async function waitFor(maxWait, sleepStep, f){
    let waitingTime = 0;
    while(waitingTime < maxWait && !f()) {
        await sleep(sleepStep);
        waitingTime += sleepStep;
        sleepStep *= 2;
    }
    return waitingTime;
};

/**
 * Init Lizmap application
 * This function is called when the Lizmap application is ready to be initialized.
 * It is called when the global lizMap object is ready and the DOM is ready too.
 * It added properties to the global lizMap object and initialize the Lizmap application.
 * @returns {void}
 */
const initLizmapApp = () => {
    lizMap.ol = olDep;
    lizMap.litHTML = litHTMLDep;
    lizMap.proj4 = proj4;

    lizMap.events.on({
        configsloaded: () => {

            lizMap.mainLizmap = mainLizmap;
            lizMap.mainEventDispatcher = mainEventDispatcher;

        },
        uicreated: () => {
            window.customElements.define('lizmap-geolocation', Geolocation);
            window.customElements.define('lizmap-geolocation-survey', GeolocationSurvey);
            window.customElements.define('lizmap-features-table', FeaturesTable);
            window.customElements.define('lizmap-selection-tool', SelectionTool);
            window.customElements.define('lizmap-selection-invert', SelectionInvert);
            window.customElements.define('lizmap-snapping', Snapping);
            window.customElements.define('lizmap-scaleline', Scaleline);
            window.customElements.define('lizmap-mouse-position', MousePosition);
            window.customElements.define('lizmap-digitizing', Digitizing);
            window.customElements.define('lizmap-overviewmap', OverviewMap);
            window.customElements.define('lizmap-feature-toolbar', FeatureToolbar);
            window.customElements.define('lizmap-reverse-geom', ReverseGeom);
            window.customElements.define('lizmap-paste-geom', PasteGeom);
            window.customElements.define('lizmap-action-selector', ActionSelector);
            window.customElements.define('lizmap-print', Print);
            window.customElements.define('lizmap-fullscreen', FullScreen);
            window.customElements.define('lizmap-base-layers', BaseLayers);
            window.customElements.define('lizmap-treeview', Treeview);
            window.customElements.define('lizmap-navbar', NavBar);
            window.customElements.define('lizmap-tooltip', Tooltip);
            window.customElements.define('lizmap-message', Message);
        }
    });

    // Initialize the Lizmap application
    lizMap.init();

    executeJSFromServer();
}

if (globalThis.lizMap !== undefined && document.readyState !== 'loading' ) {
    // All is ready to initialized the Lizmap application
    initLizmapApp();
} else if (globalThis.lizMap !== undefined && document.readyState === 'loading') {
    // The Lizmap global object is already loaded but the DOM is not ready
    document.addEventListener('DOMContentLoaded', initLizmapApp);
} else {
    // The Lizmap global object is not loaded yet
    // We wait for it at most 10 seconds
    const waitingFor = await waitFor(10000, 100, () => {
        return globalThis.lizMap !== undefined;
    });
    // If the Lizmap global object is not loaded after 10 seconds, we throw an error
    if (globalThis.lizMap === undefined) {
        throw new Error('Until we wait '+waitingFor+' ms, lizMap has not been loaded!');
    }
    // Else, All is ready to initialized the Lizmap application
    initLizmapApp();
}
