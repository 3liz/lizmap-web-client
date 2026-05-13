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
import PasteStoredGeom from './components/edition/PasteStoredGeom.js';
import ActionSelector from './components/ActionSelector.js';
import Print from './components/Print.js';
import PortfoliosSelector from './components/PortfoliosSelector.js';
import DxfExport from './components/DxfExport.js';
import FullScreen from './components/FullScreen.js';
import BaseLayers from './components/BaseLayers.js';
import Treeview from './components/Treeview.js';
import NavBar from './components/NavBar.js';
import Tooltip from './components/Tooltip.js';
import Message from './components/Message.js';
import TypeAHead from './components/TypeAHead.js';
import GroupPopupByLayer from './components/GroupPopupByLayer.js';

import { mainLizmap, mainEventDispatcher } from './modules/Globals.js';
import executeJSFromServer from './modules/ExecuteJSFromServer.js';

import olDep from './dependencies/ol.js';
import litHTMLDep from './dependencies/lit-html.js';
import { proj4 } from 'proj4rs/proj4.js';
import { Constants } from './utils/Constants.js';

import Permalink from './modules/Permalink.js';

/**
 * Patch to mitigate [Violation] "Added non-passive event listener" warnings.
 * This ensures that OpenLayers 2 legacy touch events can still call preventDefault()
 * while signaling to the browser that we are intentionally using non-passive listeners
 * to maintain map interaction fluidly.
 */
(function patchPassiveEventListeners() {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, fn, options) {
        let modifiedOptions = options;
        if (type === 'touchstart' || type === 'touchmove') {
            if (typeof options === 'object') {
                // Force passive to false to ensure map panning/drawing works correctly
                modifiedOptions = { ...options, passive: false };
            } else {
                // If options was a boolean (capture), convert to object
                modifiedOptions = { capture: !!options, passive: false };
            }
        }
        originalAddEventListener.call(this, type, fn, modifiedOptions);
    };
})();

/**
 * waitFor function returns waiting time in milliseconds
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
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    while(waitingTime < maxWait && !f()) {
        await sleep(sleepStep);
        waitingTime += sleepStep;
        sleepStep *= 2;
    }
    return waitingTime;
};

const definedCustomElements = () => {
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
    window.customElements.define('lizmap-paste-stored-geom', PasteStoredGeom);
    window.customElements.define('lizmap-action-selector', ActionSelector);
    window.customElements.define('lizmap-print', Print);
    window.customElements.define('lizmap-portfolios-selector', PortfoliosSelector);
    window.customElements.define('lizmap-dxfexport', DxfExport);
    window.customElements.define('lizmap-fullscreen', FullScreen);
    window.customElements.define('lizmap-navbar', NavBar);
    window.customElements.define('lizmap-tooltip', Tooltip);
    window.customElements.define('lizmap-message', Message);
    window.customElements.define('lizmap-typeahead', TypeAHead);
    window.customElements.define('lizmap-group-popup-layer', GroupPopupByLayer);

    /**
         * At this point the user interface is fully loaded.
         * External javascripts can subscribe to this event to perform post load
         * operations or customizations
         *
         * Example in my_custom_script.js
         *
         * lizMap.subscribe(() => {
         *          // pseudo-code
         *          intercatWithPrintPanel();
         *          interactWithSelectionPanel();
         *          inteactWithLocateByLayerPanel();
         *     },
         *     'lizmap.uicreated'
         * );
         */
    lizMap.mainEventDispatcher.dispatch('lizmap.uicreated');
}

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
    lizMap.constants = Constants;

    // listen to legacy uicreated event
    mainEventDispatcher.addListener(()=>{
        // Display the layer tree view at the startup
        // Layers legend will be displayed after the map started to load
        window.customElements.define('lizmap-treeview', Treeview);
        window.customElements.define('lizmap-base-layers', BaseLayers);
        // The other custom elements will be initialized after the modules are
        if (lizMap.mainLizmap.legend !== undefined) {
            definedCustomElements();
        } else {
            lizMap.mainEventDispatcher.addListener(
                definedCustomElements,
                'lizmap.modules.initialized'
            );
        }
    }, 'lizmap.ol2.uicreated');

    // subscribe to Lizmap main class init complete event.
    // Subscribe method ensure that the callback is called anyway, even if the event is alredy
    // fired from the main Lizmap class
    mainEventDispatcher.subscribe(async () => {
        // // Initialize the Lizmap application
        if (lizMap.initialized) return;
        lizMap.init();

        // assign global instances to lizMap singleton
        lizMap.mainLizmap = mainLizmap;
        lizMap.mainEventDispatcher = mainEventDispatcher;

        // register subscribers from external js
        if (lizMap.subscribedExternalJSEvent.length) {
            lizMap.subscribedExternalJSEvent.forEach((e) => {
                lizMap.mainEventDispatcher.subscribe(e[0],e[1]);
            })
            // clear the array, all events has been subscribed
            lizMap.subscribedExternalJSEvent = [];
        }
        // wait until configuration and capabilities are fully loaded
        const startupConfigurations = await lizMap.loadProjectConfigurations();

        // loadProjectConfiguration method returns null if something went wrong
        if (startupConfigurations) {
            // for backwards compatibility purposes?
            lizMap.events.triggerEvent('configsloaded', startupConfigurations);

            // dipatch lizmap.configsloaded event with startupConfiguration as parameter
            // WARNING: internal listeners should only perform synchronous
            // actions to ensure proper app initialization
            mainEventDispatcher.dispatch({
                type:'lizmap.configsloaded',
                configs: startupConfigurations
            });

            let initialPermalink;
            // load permalink information, if any, and get initial extent
            if (window.location.hash) {
                // short link permalink
                if(mainLizmap.initialConfig.options.short_link_permalink) {
                    const {repository, project} = globalThis['lizUrls'].params;
                    let currentPermalink = null;
                    // request specific permalink
                    if (window.location.hash.indexOf('#permalink=') == 0) {
                        const permalinkId = window.location.hash.substring(1).split('=')[1];
                        const permalink = await Permalink.getPermalink(permalinkId);
                        if (permalink && permalink.hasOwnProperty('error')) {
                            lizMap.addMessage(permalink.error.reduce((p,c) => p +'\n' + c,''),'danger',true);
                            // reset permalink hash
                            history.replaceState(null, '', window.location.pathname + window.location.search);
                            // remove permalink from local storage
                            try {
                                const permalinksHistory = JSON.parse(localStorage.getItem('lizmap_permalink_history') || []);
                                localStorage.setItem(
                                    'lizmap_permalink_history',
                                    JSON.stringify(permalinksHistory.filter((p) => p.link != permalinkId))
                                );
                            } catch (e) {
                                console.warn(e);
                            }
                        } else {
                            if (permalink &&
                                permalink.repository &&
                                permalink.repository == repository &&
                                permalink.project &&
                                permalink.project == project
                            ) {
                                currentPermalink = permalink.plink;
                            }
                        }
                    } else if (window.location.hash === '#map_status' && mainLizmap.initialConfig.options.automatic_permalink) {
                        // read from local storage
                        try {
                            const storedPermalink = localStorage.getItem('lizmap_p_link');
                            if (storedPermalink) {
                                let currentPermalinkList = JSON.parse(storedPermalink);
                                if(Array.isArray(currentPermalinkList)) {
                                    let currentPermalinkObj = currentPermalinkList.filter(
                                        (f) => f.repository == repository && f.project == project
                                    );
                                    if(currentPermalinkObj.length == 1) {
                                        currentPermalink = currentPermalinkObj[0].plink;
                                    }
                                }
                            }
                        } catch(e) {
                            console.warn(e);
                            currentPermalink = null;
                            history.replaceState(null, '', window.location.pathname + window.location.search);
                        }
                    }

                    if (currentPermalink &&
                        currentPermalink.bbox
                        && Array.isArray(currentPermalink.bbox) &&
                        currentPermalink.bbox.length == 4
                    ){
                        initialPermalink = currentPermalink;
                    }
                } else {
                    // raw permalink
                    let initialExtentPermalink = window.location.hash.substring(1).split('|')[0].split(',');
                    if (initialExtentPermalink.length === 4) {
                        initialPermalink = { bbox: initialExtentPermalink };
                    }
                }
            }
            // complete lizMap intialization
            lizMap.completeInitialization(startupConfigurations, initialPermalink);
        }

        // end waiting, does not depend on ongoing asynchronous actions
        lizMap.waitEnd(startupConfigurations?.getFeatureInfo);

        return;
    }, 'lizmap.class.loaded');

    // listener for lizmap server notifications
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
